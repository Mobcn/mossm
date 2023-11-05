<script setup lang="ts">
import MonacoEditor from '@/components/editor/MonacoEditor.vue';
import type { ModelItem } from '../MoAPI.vue';
import type { EditorOptions, MonacoEditorInstance } from '@/components/editor/MonacoEditor.vue';

/** JavaScript相关配置文件路径 */
const configPath = '/setting/monaco/javascript/config.json';
/** 扩展类型定义文件路径 */
const declareListPath = '/setting/monaco/javascript/declare/declare.json';

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

// 挂载后执行
onMounted(async () => {
    const $editor = monacoEditorRef.value!;
    const monacoPromise = new Promise<typeof monaco>($editor.useMonaco);
    const editorPromise = new Promise<monaco.editor.IStandaloneCodeEditor>($editor.useEditor);
    // 设置Prettier格式化
    usePrettier(monacoPromise, editorPromise);
    // 设置ESLint校验
    useESLint(monacoPromise, editorPromise);
    // 设置扩展类型定义
    await setExtraLibs(monacoPromise);
    // 根据模型更改更新类型扩展定义
    watchModel(monacoPromise);
});

/**
 * 监听模型更改
 *
 * @param monacoPromise monacoPromise对象
 */
async function watchModel(monacoPromise: Promise<typeof monaco>) {
    const languages: any = (await monacoPromise).languages;
    const addExtraLib = async (content: string, path: string) => {
        languages.typescript.javascriptDefaults.addExtraLib(content, path);
    };
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
}

/**
 * 使用 Prettier 格式化，Alt + Shift + F
 *
 * @param monacoPromise monacoPromise对象
 * @param editorPromise editorPromise对象
 */
async function usePrettier(
    monacoPromise: Promise<typeof monaco>,
    editorPromise: Promise<monaco.editor.IStandaloneCodeEditor>
) {
    const cacheKey = 'javascript_config_cache@' + configPath;
    const config = await storage.getWithURL<any>(cacheKey, configPath, 'json');
    const { prettier } = config;
    const { path, options } = prettier;
    const [Prettier, { default: babel }, { default: estree }, $monaco, editor] = await Promise.all([
        import(/* @vite-ignore */ `${path}/standalone.mjs`),
        import(/* @vite-ignore */ `${path}/plugins/babel.mjs`),
        import(/* @vite-ignore */ `${path}/plugins/estree.mjs`),
        monacoPromise,
        editorPromise
    ]);
    editor.addCommand($monaco.KeyMod.Alt | $monaco.KeyMod.Shift | $monaco.KeyCode.KeyF, async () => {
        const text = await Prettier.format(editor.getValue(), {
            parser: 'babel',
            plugins: [babel, estree],
            ...options
        });
        editor.setValue(text);
    });
}

/**
 * 使用 ESLint 校验
 *
 * @param monacoPromise monacoPromise对象
 * @param editorPromise editorPromise对象
 */
async function useESLint(
    monacoPromise: Promise<typeof monaco>,
    editorPromise: Promise<monaco.editor.IStandaloneCodeEditor>
) {
    const eslintWorker = new Worker(await getESLintWorkerURL());
    const [$monaco, editor] = await Promise.all([monacoPromise, editorPromise]);
    const model = editor.getModel()!;
    // 监听 ESLint Worker 的返回
    eslintWorker.onmessage = function (e) {
        const { markers, version } = e.data;
        // 判断当前 model 的 versionId 与请求时是否一致
        if (model && model.getVersionId() === version) {
            $monaco.editor.setModelMarkers(model, 'ESLint', markers);
        }
    };
    let timer: number | null = null;
    // model 内容变更时通知 ESLint Worker
    model.onDidChangeContent(() => {
        timer && clearTimeout(timer);
        const code = model.getValue();
        const version = model.getVersionId();
        timer = setTimeout(() => eslintWorker.postMessage({ code, version }), 500);
    });
}

/**
 * 获取 ESLint Worker JS
 */
async function getESLintWorkerURL() {
    const cacheKey = 'javascript_config_cache@' + configPath;
    const config = await storage.getWithURL<any>(cacheKey, configPath, 'json');
    const { eslint } = config;
    const { path, options } = eslint;
    const workerText = `(async () => {
        const res = await fetch('${path}');
        eval('const window = undefined;' + (await res.text()));
        const linter = new self.eslint.Linter();
        self.addEventListener('message', function (e) {
            const { code, version } = e.data;
            const markers = linter.verify(code, ${JSON.stringify(options)}).map((err) => ({
                code: err.ruleId,
                startLineNumber: err.line,
                endLineNumber: err.endLine,
                startColumn: err.column,
                endColumn: err.endColumn,
                message: err.message,
                severity: err.severity === 1 ? 4 : 8,
                source: 'ESLint'
            }));
            self.postMessage({ markers, version });
        });
    })();`;
    return URL.createObjectURL(new Blob([workerText], { type: 'text/javascript' }));
}

/**
 * 设置扩展类型定义
 *
 * @param monacoPromise monacoPromise对象
 */
async function setExtraLibs(monacoPromise: Promise<typeof monaco>) {
    const cacheKey = 'declare_list_cache@' + declareListPath;
    const declareList = await storage.getWithURL<string[]>(cacheKey, declareListPath, 'json');
    const addList = declareList.map(async (filePath) => {
        let content = await storage.get('declare_cache@' + filePath);
        if (!content) {
            const text = await loadFileText(filePath);
            if (text.indexOf('declare module') !== -1 || !filePath.startsWith('http')) {
                content = text;
            } else {
                let moduleName = filePath;
                const index = moduleName.lastIndexOf('/');
                index !== -1 && (moduleName = filePath.substring(index + 1));
                moduleName.endsWith('.d.ts') && (moduleName = moduleName.substring(0, moduleName.length - 5));
                content = `declare module "${moduleName}" {\n${text.replace(/declare /g, '')}\n}`;
            }
            storage.set('declare_cache@' + filePath, content);
        }
        return { filePath, content };
    });
    const [$monaco, list] = await Promise.all([monacoPromise, Promise.all(addList)]);
    // @ts-ignore
    $monaco.languages.typescript.javascriptDefaults.setExtraLibs(list);
}

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
    return (await loadFileText('/setting/monaco/javascript/declare/template/model.d.ts'))
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
