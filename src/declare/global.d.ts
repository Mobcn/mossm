export {};
declare global {
    interface Window {
        process: { env: { VUE_APP_ENV: string } };
    }
}
