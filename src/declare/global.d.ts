import type { Require } from 'requirejs';
export {};
declare global {
    interface Window {
        process: { env: { VUE_APP_ENV: string } };
        require?: Require;
    }
}
declare module 'requirejs' {
    interface RequireConfig {
        // monaco语言配置
        'vs/nls'?: {
            availableLanguages?: {
                'vs/editor/editor.main'?: 'de' | 'es' | 'fr' | 'it' | 'ja' | 'ko' | 'ru' | 'zh-cn' | 'zh-tw';
            };
        };
    }
}
