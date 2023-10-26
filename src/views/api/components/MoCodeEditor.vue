<script setup lang="ts">
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
        loadFileText('/declare/mongoose.d.ts').then((content) => addExtraLib(content, 'mongoose.d.ts'));
        loadFileText('/declare/result.d.ts').then((content) => addExtraLib(content, 'result.d.ts'));
        // 根据模型更改更新类型扩展定义
        let currentModelItem: ModelItem | null | undefined = null;
        watchEffect(() => {
            const params = props.params;
            if (currentModelItem !== params?.modelItem) {
                currentModelItem = params?.modelItem;
                const content = getDeclareModelText(currentModelItem);
                addExtraLib(content, 'model.d.ts');
            }
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
    function exec1(content: string, filePath: string) {
        (typescript = languages.typescript) && (current.exec = exec2)(content, filePath);
    }
    function exec2(content: string, filePath: string) {
        (extraLibs = typescript.javascriptDefaults.getExtraLibs()) && (current.exec = exec3)(content, filePath);
    }
    async function exec3(content: string, filePath: string) {
        if (!('getJavaScriptWorker' in typescript)) {
            append(content, filePath);
            return;
        }
        (current.exec = exec4)(content, filePath);
    }
    async function exec4(content: string, filePath: string) {
        const getJavaScriptWorker = await typescript.getJavaScriptWorker();
        if (!getJavaScriptWorker) {
            append(content, filePath);
            return;
        }
        worker = getJavaScriptWorker;
        (current.exec = exec5)(content, filePath);
    }
    async function exec5(content: string, filePath: string) {
        const javaScriptWorker = await worker();
        if (!javaScriptWorker) {
            append(content, filePath);
            return;
        }
        update = () => javaScriptWorker.updateExtraLibs(toRaw(extraLibs));
        (current.exec = exec6)(content, filePath);
    }
    function exec6(content: string, filePath: string) {
        append(content, filePath);
        update();
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
    return (content: string, filePath: string) => current.exec(content, filePath);
}

/**
 * 获取Model定义文本
 */
function getDeclareModelText(modelItem?: ModelItem) {
    let modelTypeText = '';
    if (modelItem) {
        const types: any = {};
        for (const [key, value] of Object.entries<Function | { type: Function }>(modelItem.schema)) {
            types[key] = 'type' in value ? value.type.name : value.name;
        }
        modelTypeText = JSON.stringify(types);
        modelTypeText = modelTypeText.replace(/"/g, '');
        modelTypeText = modelTypeText.replace(/String/g, 'string');
        modelTypeText = modelTypeText.replace(/Number/g, 'number');
        modelTypeText = modelTypeText.replace(/Boolean/g, 'boolean');
        modelTypeText += '&';
    }
    return `declare const Model: mongoose.Model<${modelTypeText}{ [x: string]: any }>;`;
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
