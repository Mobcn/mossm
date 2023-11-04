import type { Require } from 'requirejs';
export {};
declare global {
    interface Window {
        process: { env: { VUE_APP_ENV: string } };
        require?: Require;
    }
}
