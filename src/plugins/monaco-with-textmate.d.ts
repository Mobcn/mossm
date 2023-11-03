interface IGrammarDefinition {
    format: 'json' | 'plist';
    content: string | object;
}

/**
 * A single theme setting.
 */
interface IRawThemeSetting {
    readonly name?: string;
    readonly scope?: string | string[];
    readonly settings: {
        readonly fontStyle?: string;
        readonly foreground?: string;
        readonly background?: string;
    };
}

/**
 * A TextMate theme.
 */
interface IRawTheme {
    readonly name?: string;
    readonly settings: IRawThemeSetting[];
}

/**
 * A registry helper that can locate grammar file paths given scope names.
 */
interface RegistryOptions {
    theme?: IRawTheme;
    getGrammarDefinition(scopeName: string, dependentScope: string): Promise<IGrammarDefinition>;
    getInjections?(scopeName: string): string[];
}

/**
 * A map from scope name to a language id. Please do not use language id 0.
 */
interface IEmbeddedLanguagesMap {
    [scopeName: string]: number;
}

/**
 * A map from selectors to token types.
 */
interface ITokenTypeMap {
    [selector: string]: StandardTokenType;
}

const enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 4
}

interface IGrammarConfiguration {
    embeddedLanguages?: IEmbeddedLanguagesMap;
    tokenTypes?: ITokenTypeMap;
}

/**
 * A grammar
 */
interface IGrammar {
    /**
     * Tokenize `lineText` using previous line state `prevState`.
     */
    tokenizeLine(lineText: string, prevState: StackElement): ITokenizeLineResult;
    /**
     * Tokenize `lineText` using previous line state `prevState`.
     * The result contains the tokens in binary format, resolved with the following information:
     *  - language
     *  - token type (regex, string, comment, other)
     *  - font style
     *  - foreground color
     *  - background color
     * e.g. for getting the languageId: `(metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET`
     */
    tokenizeLine2(lineText: string, prevState: StackElement): ITokenizeLineResult2;
}

interface ITokenizeLineResult {
    readonly tokens: IToken[];
    /**
     * The `prevState` to be passed on to the next line tokenization.
     */
    readonly ruleStack: StackElement;
}

interface ITokenizeLineResult2 {
    /**
     * The tokens in binary format. Each token occupies two array indices. For token i:
     *  - at offset 2*i => startIndex
     *  - at offset 2*i + 1 => metadata
     *
     */
    readonly tokens: Uint32Array;
    /**
     * The `prevState` to be passed on to the next line tokenization.
     */
    readonly ruleStack: StackElement;
}

interface IToken {
    startIndex: number;
    readonly endIndex: number;
    readonly scopes: string[];
}

/**
 * **IMPORTANT** - Immutable!
 */
interface StackElement {
    _stackElementBrand: void;
    readonly depth: number;
    clone(): StackElement;
    equals(other: StackElement): boolean;
}

/**
 * The registry that will hold all grammars.
 */
export declare class Registry {
    private readonly _locator;
    private readonly _syncRegistry;
    private readonly installationQueue;
    constructor(locator?: RegistryOptions);
    /**
     * Change the theme. Once called, no previous `ruleStack` should be used anymore.
     */
    setTheme(theme: IRawTheme): void;
    /**
     * Returns a lookup array for color ids.
     */
    getColorMap(): string[];
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithEmbeddedLanguages(
        initialScopeName: string,
        initialLanguage: number,
        embeddedLanguages: IEmbeddedLanguagesMap
    ): Promise<IGrammar>;
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithConfiguration(
        initialScopeName: string,
        initialLanguage: number,
        configuration: IGrammarConfiguration
    ): Promise<IGrammar>;
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     */
    loadGrammar(initialScopeName: string): Promise<IGrammar>;
    private _loadGrammar;
    /**
     * Get the grammar for `scopeName`. The grammar must first be created via `loadGrammar` or `loadGrammarFromPathSync`.
     */
    grammarForScopeName(
        scopeName: string,
        initialLanguage?: number,
        embeddedLanguages?: IEmbeddedLanguagesMap,
        tokenTypes?: ITokenTypeMap
    ): IGrammar;
}

/**
 * Wires up monaco-editor with monaco-textmate
 *
 * @param monaco monaco namespace this operation should apply to (usually the `monaco` global unless you have some other setup)
 * @param registry TmGrammar `Registry` this wiring should rely on to provide the grammars
 * @param languages `Map` of language ids (string) to TM names (string)
 */
export declare function wireTmGrammars(
    $monaco: typeof monaco,
    registry: Registry,
    languages: Map<string, string>,
    editor?: monaco.editor.ICodeEditor
): Promise<void[]>;

/**
 * Mount the .wasm file that will act as library's "backend"
 * @param data Path to .wasm file or it's ArrayBuffer
 */
export declare function loadWASM(data: string | ArrayBuffer): Promise<void>;
