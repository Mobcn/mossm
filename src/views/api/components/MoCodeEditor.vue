<script setup lang="ts">
import MonacoEditor from '@/components/editor/MonacoEditor.vue';
import declareList from '@/assets/declare.json';
import type { ModelItem } from '../MoAPI.vue';
import type { EditorOptions, MonacoEditorInstance } from '@/components/editor/MonacoEditor.vue';

type ExtraLibs = Record<string, { content: string; version: number }>;

/** 参数 */
const props = defineProps<{
    /** 宽度 */
    width?: number | string;
    /** 高度 */
    height?: number | string;
    /** 提示文本 */
    placeholder?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 参数项 */
    params?: {
        /** 模型 */
        modelItem?: ModelItem;
        /** 模型数组 */
        modelItems?: ModelItem[];
    };
}>();

/** MonacoEditor组件实例 */
const monacoEditorRef = ref<MonacoEditorInstance>();
/** ModelValue */
const model = defineModel<string>();
/** 代码文本 */
const codeText = computed({
    get: () => model.value || '',
    set: (val) => (model.value = val)
});

/** 代码编辑器配置 */
const options = computed<EditorOptions>(() => ({
    language: 'javascript',
    minimap: {
        enabled: false
    },
    theme: store.theme === 'dark' ? 'vs-dark' : 'vs',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    readOnly: props.disabled
}));

onMounted(() => {
    monacoEditorRef.value!.useLanguages(async (languages) => {
        /** 添加扩展类型定义函数 */
        const addExtraLib = buildAddExtraLib(languages);
        // 设置扩展类型定义
        const addList = declareList.map(async (path) => {
            let content = storage.get('declare_cache@' + path);
            if (!content) {
                const text = await loadFileText(path);
                if (text.indexOf('declare module') !== -1 || !path.startsWith('http')) {
                    content = text;
                } else {
                    let moduleName = path;
                    const index = moduleName.lastIndexOf('/');
                    index !== -1 && (moduleName = path.substring(index + 1));
                    moduleName.endsWith('.d.ts') && (moduleName = moduleName.substring(0, moduleName.length - 5));
                    content = `declare module "${moduleName}" {\n${text.replace(/declare /g, '')}\n}`;
                }
                storage.set('declare_cache@' + path, content);
            }
            addExtraLib(content, path, false);
        });
        Promise.all(addList).then(() => {
            // 根据模型更改更新类型扩展定义
            let currentModelItem: ModelItem | null | undefined = null;
            watchEffect(() => {
                const params = props.params;
                if (currentModelItem !== params?.modelItem) {
                    currentModelItem = params?.modelItem;
                    const content = getModelDeclareText(currentModelItem, params!.modelItems);
                    addExtraLib(content, 'model.d.ts');
                }
            });
        });
    });
});

/**
 * 添加扩展定义函数构建函数
 *
 * @param languages 语言实例
 */
function buildAddExtraLib(languages: typeof monaco.languages & { typescript?: any }) {
    let typescript: any;
    let worker: any;
    let extraLibs: ExtraLibs;
    let update: () => void | undefined;
    const current = { exec: exec1 };
    function exec1(content: string, filePath: string, isUpdate?: boolean) {
        (typescript = languages.typescript) && (current.exec = exec2)(content, filePath, isUpdate);
    }
    function exec2(content: string, filePath: string, isUpdate?: boolean) {
        (extraLibs = typescript.javascriptDefaults.getExtraLibs()) &&
            (current.exec = exec3)(content, filePath, isUpdate);
    }
    async function exec3(content: string, filePath: string, isUpdate?: boolean) {
        if (!('getJavaScriptWorker' in typescript)) {
            append(content, filePath);
            return;
        }
        (current.exec = exec4)(content, filePath, isUpdate);
    }
    async function exec4(content: string, filePath: string, isUpdate?: boolean) {
        const getJavaScriptWorker = await typescript.getJavaScriptWorker();
        if (!getJavaScriptWorker) {
            append(content, filePath);
            return;
        }
        worker = getJavaScriptWorker;
        (current.exec = exec5)(content, filePath, isUpdate);
    }
    async function exec5(content: string, filePath: string, isUpdate?: boolean) {
        const javaScriptWorker = await worker();
        if (!javaScriptWorker) {
            append(content, filePath);
            return;
        }
        update = () => javaScriptWorker.updateExtraLibs(toRaw(extraLibs));
        (current.exec = exec6)(content, filePath, isUpdate);
    }
    function exec6(content: string, filePath: string, isUpdate?: boolean) {
        append(content, filePath);
        isUpdate && update();
    }
    function append(content: string, filePath: string) {
        const version = filePath in extraLibs ? extraLibs[filePath].version + 1 : 1;
        extraLibs[filePath] = { content, version };
    }
    /**
     * 添加扩展类型定义函数
     *
     * @param content 扩展类型定义文本内容
     * @param filePath 文件路径
     */
    return (content: string, filePath: string, isUpdate?: boolean) => {
        isUpdate === undefined && (isUpdate = true);
        current.exec(content, filePath, isUpdate);
    };
}

/**
 * 获取Model定义文本
 *
 * @param modelItem 模型项
 * @param modelItems 模型项数组
 */
function getModelDeclareText(modelItem?: ModelItem, modelItems?: ModelItem[]) {
    if (!modelItem) {
        return '';
    }
    const namespace = modelItem.module.replace(/./, (i) => i.toUpperCase()) + 'Module';
    let types = '';
    let names = 'type ModelName';
    let results = 'type ResultModel<T> =';
    for (const item of modelItems!) {
        const arr: any = {};
        for (const [key, value] of Object.entries<Function | { type: Function }>(item.schema)) {
            arr[key] = 'type' in value ? value.type.name : value.name;
        }
        types += `\n    type ${item.name}Model = mongoose.Model<${JSON.stringify(arr)
            .replace(/"/g, '')
            .replace(/String/g, 'string')
            .replace(/Number/g, 'number')
            .replace(/Boolean/g, 'boolean')}&{_id:mongoose.SchemaTypes.ObjectId}>, {}>;`;
        names += ` | '${item.name}'`;
        results += ` T extends '${item.name}' ? ${item.name}Model :`;
    }
    names = names.replace('|', '=') + ';';
    results += ' never;';
    return `namespace ${namespace} {
    import mongoose from 'mongoose';${types}
    ${names}
    ${results}
}

declare const Model: ${namespace}.${modelItem.name}Model;
declare const importModel: <T extends ${namespace}.ModelName>(model: T, callback?: (Model: ${namespace}.ResultModel<T>) => void) => Promise<${namespace}.ResultModel<T>>;
`;
}
</script>

<template>
    <MonacoEditor
        ref="monacoEditorRef"
        v-model="codeText"
        :options="options"
        :width="props.width"
        :height="props.height"
    />
</template>

<style scoped></style>
