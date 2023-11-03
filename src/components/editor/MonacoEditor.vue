<script setup lang="ts">
/** 参数 */
const props = withDefaults(
    defineProps<{
        /** Monaco编辑器配置 */
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

/** MonacoLanguages对象 */
const monacoLanguages = ref<typeof monaco.languages>();
/** 编辑器实例对象 */
const editorInstance = ref<monaco.editor.IStandaloneCodeEditor>();

/** 代码文本 */
const codeText = defineModel<string>({ required: true });
/** 配置 */
const options = toRefs(props).options;

/**
 * 获取样式尺寸
 *
 * @param value 值
 */
function getStyleSize(value: number | string) {
    return typeof value === 'number' ? value + 'px' : value;
}

/**
 * 获取编辑器容器
 */
async function getContainer() {
    return new Promise<HTMLDivElement>((resolve) =>
        onMounted(() => {
            const pageInstance = getCurrentInstance();
            resolve(pageInstance!.refs.editorContainer as HTMLDivElement);
        })
    );
}

/**
 * 加载monaco
 */
async function loadMonaco() {
    // 编辑器VS引入路径
    const editorVS = 'https://cdn.staticfile.org/monaco-editor/0.44.0/min/vs';
    // 编辑器Loader引入路径
    const editorLoader = editorVS + '/loader.js';
    // 导入monaco
    const res = await fetch(editorLoader);
    let textJS = await res.text();
    textJS = textJS.replace('let l=do', '//let l=do');
    textJS = textJS.replace('ld(l)', 'ld(l)\nfetch(i).then(d=>d.text()).then(t=>eval(t))');
    textJS = 'new Promise((rev) => ({\nexecFun: function () {\n' + textJS + ';\n';
    textJS += `this.require.config({paths:{vs:'${editorVS}'}});`;
    textJS += "this.require(['vs/editor/editor.main'],()=>rev(monaco));}}).execFun())";
    return Promise.resolve(eval(textJS)).then((monaco: Monaco) => monaco);
}

// 初始化操作
Promise.all([getContainer(), loadMonaco()]).then(([el, monaco]) => {
    // 创建编辑器实例
    const instance = monaco.editor.create(el, { ...options.value, value: codeText.value });
    // 监听设置修改
    watch(options, (value) => instance.updateOptions(value));
    // 监听内容修改
    watch(codeText, (value) => !instance.hasTextFocus() && instance.setValue(value));
    // 编辑器内容修改监听
    instance.onDidChangeModelContent(() => (codeText.value = instance.getValue()));
    // 设置实例
    editorInstance.value = instance;
    // 设置MonacoLanguages对象
    monacoLanguages.value = monaco.languages;
});

defineExpose({
    /**
     * 使用MonacoLanguages对象
     */
    useLanguages: (() => {
        const cache: ((languages: typeof monaco.languages) => void)[] = [];
        const stop = watch(monacoLanguages, (languages) => {
            if (languages) {
                stop();
                cache.forEach((cb) => cb(languages));
            }
        });
        return (cb: (languages: typeof monaco.languages) => void) => {
            if (monacoLanguages.value) {
                cb(monacoLanguages.value);
            } else {
                cache.push(cb);
            }
        };
    })()
});
</script>
<script lang="ts">
/**
 * monaco
 */
type Monaco = typeof monaco;

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
            /** 官方自带三种主题 */
            theme?: 'vs' | 'hc-black' | 'vs-dark';
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
         * 使用MonacoLanguages对象
         */
        useLanguages: (cb: (languages: typeof monaco.languages) => void) => void;
    }
>;
</script>

<template>
    <div ref="editorContainer" :style="`width: ${getStyleSize(props.width)}; height: ${getStyleSize(props.height)}`" />
</template>

<style scoped>
div {
    border: 1px solid #ccc;
}
</style>
