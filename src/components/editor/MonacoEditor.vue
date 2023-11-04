<script setup lang="ts">
import { loadWASM, Registry, wireTmGrammars } from '@/plugins/monaco-with-textmate';
import { loadFileJSON, loadFileArrayBuffer } from '@/utils/load';

/** 参数 */
const props = withDefaults(
    defineProps<{
        /** monaco编辑器配置 */
        options: EditorOptions;
        /** 宽度 */
        width?: number | string;
        /** 高度 */
        height?: number | string;
    }>(),
    {
        width: '100%',
        height: '300px'
    }
);

/** 编辑器容器 */
const editorContainer = ref<HTMLDivElement>();
/** 当前的monaco对象 */
const currentMonaco = ref<typeof monaco>();
/** 编辑器实例对象 */
const editorInstance = ref<monaco.editor.IStandaloneCodeEditor>();
/** 是否加载了textmeta */
const isLoadTextmeta = ref(false);

/** 代码文本 */
const codeText = defineModel<string>({ required: true });
/** 配置 */
const options = computed(() => {
    const $options = { ...props.options };
    if (isLoadTextmeta.value) {
        if ($options.theme === 'vs') {
            $options.theme = 'light-plus';
        } else if ($options.theme === 'vs-dark') {
            $options.theme = 'dark-plus';
        }
    }
    return $options;
});

/** 是否为全屏 */
const isFullScreen = ref(false);
/** 当前编辑器容器样式 */
const currentStyle = computed(() => {
    if (isFullScreen.value) {
        return 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000;';
    }
    return `width: ${getStyleSize(props.width)}; height: ${getStyleSize(props.height)}`;
});

// 加载monaco相关配置
const config = ref<any>();
const extensions = ref<any>();
const darkPlusTheme = ref<any>();
const lightPlusTheme = ref<any>();
const loadPromise = loadMonacoConfigJSON();

// 挂载完成后事件
onMounted(async () => {
    // 等待monaco相关配置加载完成
    await loadPromise;
    // 调用 monaco loader
    const loader = document.createElement('script');
    loader.type = 'text/javascript';
    loader.src = config.value.vs + '/loader.js';
    loader.onload = initMonaco;
    document.head.appendChild(loader);
});

/**
 * 初始化monaco
 */
async function initMonaco() {
    // 加载monaco对象
    const require = window.require!;
    require.config({ paths: { vs: config.value.vs } });
    await new Promise((resolve) => require(['vs/editor/editor.main'], resolve));
    const $monaco = (currentMonaco.value = window.monaco);
    // 创建编辑器实例
    const domElement = editorContainer.value!;
    const $options = { ...options.value, value: codeText.value };
    const instance = (editorInstance.value = $monaco.editor.create(domElement, $options));
    // 使用textmeta语法分析器
    useJSTextMeta($monaco, instance);
    // 注册Action
    registerAction($monaco, instance);
    // 监听设置修改
    watch(options, (value) => instance.updateOptions(value));
    // 监听内容修改
    watch(codeText, (value) => !instance.hasTextFocus() && instance.setValue(value));
    // 编辑器内容修改监听
    instance.onDidChangeModelContent(() => (codeText.value = instance.getValue()));
}

/**
 * 注册Action
 *
 * @param $monaco monaco对象
 * @param editor 编辑器实例
 */
function registerAction($monaco: typeof monaco, editor: monaco.editor.IStandaloneCodeEditor) {
    // 自定义全屏Action，Ctrl + Shift + F
    editor.addAction({
        id: 'fullScreen',
        label: '全屏/关闭全屏',
        keybindings: [$monaco.KeyMod.CtrlCmd | $monaco.KeyMod.Shift | $monaco.KeyCode.KeyF],
        contextMenuGroupId: 'navigation',
        run: () => ((isFullScreen.value = !isFullScreen.value), void 0)
    });
}

/**
 * 获取语法定义
 *
 * @param scopeName 作用域名称
 */
async function getGrammarDefinition(scopeName: string) {
    const source = extensions.value.sources.find((source: any) => source.scopeName === scopeName);
    if (!source) {
        throw new Error(`Unknown scope name: ${scopeName}`);
    }
    const path = extensions.value.path + source.path;
    const cacheKey = 'grammar_definition_cache@' + path;
    let content = await storage.get<object>(cacheKey);
    content ??= await storage.set<object>(cacheKey, await loadFileJSON(path));
    return { format: 'json' as 'json', content };
}

/**
 * 加载 Onigasm WASM 文件
 */
async function loadOnigasmWASM() {
    const cacheKey = 'onigasm_wasm_cache@' + extensions.value.onigasmWASM;
    let data = await storage.get<ArrayBuffer>(cacheKey);
    data ??= await storage.set<ArrayBuffer>(cacheKey, await loadFileArrayBuffer(extensions.value.onigasmWASM));
    await loadWASM(data);
}

/**
 * 使用textmeta语法分析器
 *
 * @param $monaco monaco对象
 * @param editor 编辑器实例
 */
async function useJSTextMeta($monaco: typeof monaco, editor: monaco.editor.IStandaloneCodeEditor) {
    // 加载 Onigasm WASM 文件
    await loadOnigasmWASM();
    // 添加textmeta主题
    $monaco.editor.defineTheme('light-plus', lightPlusTheme.value);
    $monaco.editor.defineTheme('dark-plus', darkPlusTheme.value);
    // textmeta语法注册器
    const registry = new Registry({ getGrammarDefinition });
    // textmeta语法定义Map
    const grammars = new Map([['javascript', 'source.js']]);
    // 关联
    await wireTmGrammars($monaco, registry, grammars, editor);
    isLoadTextmeta.value = true;
}

/**
 * 获取样式尺寸
 *
 * @param value 值
 */
function getStyleSize(value: number | string) {
    return typeof value === 'number' ? value + 'px' : value;
}

/**
 * 加载配置文件
 */
async function loadMonacoConfigJSON() {
    const loadList: [Ref<object | undefined>, string][] = [
        [config, '/setting/monaco/config.json'],
        [extensions, '/setting/monaco/extensions.json'],
        [lightPlusTheme, '/setting/monaco/theme/light-plus.json'],
        [darkPlusTheme, '/setting/monaco/theme/dark-plus.json']
    ];
    return Promise.all(
        loadList.map(async ([configRef, url]) => {
            const cacheKey = 'monaco_config_json_cache@' + url;
            let value = await storage.get<object>(cacheKey);
            value ??= await storage.set<object>(cacheKey, await loadFileJSON(url));
            configRef.value = value;
        })
    );
}

defineExpose({
    /**
     * 使用monaco对象
     */
    useMonaco: (() => {
        const cache: (($monaco: typeof monaco) => void)[] = [];
        const stop = watch(currentMonaco, ($monaco) => {
            if ($monaco) {
                stop();
                cache.forEach((cb) => cb($monaco));
            }
        });
        return (cb: ($monaco: typeof monaco) => void) => {
            if (currentMonaco.value) {
                cb(currentMonaco.value);
            } else {
                cache.push(cb);
            }
        };
    })(),

    /**
     * 使用编辑器实例对象
     */
    useEditor: (() => {
        const cache: ((editor: monaco.editor.IStandaloneCodeEditor) => void)[] = [];
        const stop = watch(editorInstance, (editor) => {
            if (editor) {
                stop();
                cache.forEach((cb) => cb(editor));
            }
        });
        return (cb: (editor: monaco.editor.IStandaloneCodeEditor) => void) => {
            if (editorInstance.value) {
                cb(editorInstance.value);
            } else {
                cache.push(cb);
            }
        };
    })()
});
</script>
<script lang="ts">
/**
 * 代码编辑器配置
 */
export type EditorOptions = Omit<
    monaco.editor.IEditorOptions &
        monaco.editor.IGlobalEditorOptions & {
            /** 语言支持自行查阅demo */
            language?: string;
            /** 自动布局 */
            automaticLayout?: boolean;
            /** 代码可分小段折叠 */
            foldingStrategy?: string;
            /** 是否自动添加结束括号(包括中括号) */
            autoClosingBrackets?: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
            /** 是否自动删除结束括号(包括中括号) */
            autoClosingDelete?: 'always' | 'never' | 'auto';
            /** 是否自动添加结束的单引号 双引号 */
            autoClosingQuotes?: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
            /** 控制编辑器在用户键入、粘贴、移动或缩进行时是否应自动调整缩进 */
            autoIndent?: string;
            /** 注释配置 */
            comments?: {
                /** 插入行注释时忽略空行。默认为真 */
                ignoreEmptyLines?: boolean;
                /** 插入行注释时忽略空行。默认为真 */
                insertSpace?: boolean;
            };
            /** 光标动画样式 */
            cursorBlinking?: string;
            /** 是否启用光标平滑插入动画  当你在快速输入文字的时候 光标是直接平滑的移动还是直接"闪现"到当前文字所处位置 */
            cursorSmoothCaretAnimation?: boolean;
            /** 光标环绕行数 当文字输入超过屏幕时 可以看见右侧滚动条中光标所处位置是在滚动条中间还是顶部还是底部 即光标环绕行数 环绕行数越大 光标在滚动条中位置越居中 */
            cursorSurroundingLines?: number;
            /** 光标环绕样式 */
            cursorSurroundingLinesStyle?: 'default' | 'all';
            /** 光标宽度 <=25 */
            cursorWidth?: number;
            /** 代码缩略图 */
            minimap?: {
                /** 是否开启 */
                enabled?: boolean;
            };
            /** 是否应围绕概览标尺绘制边框 */
            overviewRulerBorder?: boolean;
            /** 是否启用代码折叠 */
            folding?: boolean;
            /** 设置编辑器是否可以滚动到最后一行之后 */
            scrollBeyondLastLine?: boolean;
            /** 当前行突出显示方式 */
            renderLineHighlight?: 'all' | 'line' | 'none' | 'gutter';
            /** 是否只读 */
            readOnly?: boolean;
        },
    'value'
>;

/**
 * MonacoEditor组件实例
 */
export type MonacoEditorInstance = ComponentPublicInstance<
    {},
    {
        /**
         * 使用monaco对象
         */
        useMonaco: (cb: ($monaco: typeof monaco) => void) => void;

        /**
         * 使用编辑器实例对象
         */
        useEditor: (cb: (editor: monaco.editor.IStandaloneCodeEditor) => void) => void;
    }
>;
</script>

<template>
    <div ref="editorContainer" :style="currentStyle" />
</template>

<style scoped>
div {
    border: 1px solid #ccc;
}
</style>
