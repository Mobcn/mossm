<script setup lang="ts">
import MonacoEditor from '@/components/editor/MonacoEditor.vue';
import declareList from '@/assets/declare.json';
import type { ModelItem } from '../MoAPI.vue';
import type { EditorOptions, MonacoEditorInstance } from '@/components/editor/MonacoEditor.vue';

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
        const addExtraLib = (content: string, path: string) => {
            // @ts-ignore
            languages.typescript.javascriptDefaults.addExtraLib(content, path);
        };

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
            addExtraLib(content, path);
        });

        Promise.all(addList).then(() => {
            // 根据模型更改更新类型扩展定义
            let currentModelItem: ModelItem | null | undefined = null;
            watchEffect(async () => {
                const params = props.params;
                if (currentModelItem !== params?.modelItem) {
                    currentModelItem = params?.modelItem;
                    const content = await getModelDeclareText(currentModelItem, params?.modelItems);
                    addExtraLib(content, 'model.d.ts');
                }
            });
        });
    });
});

/**
 * 获取Model定义文本
 *
 * @param modelItem 模型项
 * @param modelItems 模型项数组
 */
async function getModelDeclareText(modelItem?: ModelItem, modelItems?: ModelItem[]) {
    if (!modelItem) {
        return '';
    }
    const types: string[] = [];
    let names = 'type ModelName';
    let results = 'type ResultModel<T> =';
    for (const item of modelItems!) {
        const { name, schema } = item;
        const struct: any = {};
        for (const [key, value] of Object.entries(schema)) {
            const type = 'type' in value ? value.type.name : value.name;
            struct[key] = /[SNB]/.test(type[0]) ? type.replace(/./, (i) => i.toLowerCase()) : type;
        }
        const structText = JSON.stringify(struct).replace(/"/g, '');
        types.push(`type ${name}Model = mongoose.Model<${structText}&{_id:mongoose.SchemaTypes.ObjectId}>,{}>;`);
        names += ` | '${name}'`;
        results += ` T extends '${name}' ? ${name}Model :`;
    }
    return (await loadFileText('/declare/template/model.d.ts'))
        .replace(/\$\$namespace\$\$/g, modelItem.module.replace(/./, (i) => i.toUpperCase()) + 'Module')
        .replace(/\$\$types\$\$/g, types.join('\n    '))
        .replace(/\$\$names\$\$/g, names.replace('|', '=') + ';')
        .replace(/\$\$results\$\$/g, results + ' never;')
        .replace(/\$\$currentModelName\$\$/g, modelItem.name);
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
