declare module 'utils' {
    interface JwtPayload {
        [key: string]: any;
        iss?: string | undefined;
        sub?: string | undefined;
        aud?: string | string[] | undefined;
        exp?: number | undefined;
        nbf?: number | undefined;
        iat?: number | undefined;
        jti?: string | undefined;
    }

    export class Result {
        static success(params: { code?: number; message?: string; data?: any }): Result;
        static error(params: { code?: number; message?: string }): Result;
    }
}
