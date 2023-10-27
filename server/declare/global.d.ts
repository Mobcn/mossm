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

declare const JWT: {
    sign: (data: any, expiresIn: number | string) => string;
    verify: (token: string, ignoreExpiration: boolean) => string | JwtPayload;
};

declare class Result {
    static success(params: { code?: number; message?: string; data?: any }): Result;
    static error(params: { code?: number; message?: string }): Result;
}
