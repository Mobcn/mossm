declare class Result {
    static success(params: { code?: number; message?: string; data?: any }): Result;
    static error(params: { code?: number; message?: string }): Result;
}
