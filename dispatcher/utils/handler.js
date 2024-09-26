import ENV from './env.js';
import JWT from './jwt.js';
import Result from './result.js';

/** @typedef {import('hono').Context<{}, "*", {}>} Context 请求上下文 */
/** @typedef {import('hono/types').HandlerResponse} HandlerResponse 响应 */
/** @typedef {{ methods?: string | string[], secretKey?: string }} VHandlerSetting 请求处理器设置 */
/** @typedef {(context: Context) => HandlerResponse} VController 请求处理器 */

/** 令牌密匙 */
const JWT_SECRET_KEY = ENV.get(ENV.JWT_SECRET_KEY);
/** 令牌数据 */
const TOKEN_DATA = '__token_data__';

/**
 * 请求处理器
 */
class VHandler {
    /** @type {VHandlerSetting} */
    setting = {};

    /**
     * 请求处理创建
     *
     * @param {VController} controller 控制器
     */
    build(controller) {
        return VHandler.build(controller, this.setting);
    }

    /**
     * 请求处理器设置配置
     *
     * @param {VHandlerSetting} setting 请求处理器设置
     */
    static config(setting) {
        const vHandler = new VHandler();
        if (setting?.methods) {
            if (typeof setting.methods === 'string') {
                vHandler.setting.methods = setting.methods.toUpperCase();
            } else {
                vHandler.setting.methods = setting.methods.map((m) => m.toUpperCase());
            }
        }
        Object.assign(vHandler.setting, setting);
        return vHandler;
    }

    /**
     * GET请求处理创建
     *
     * @param {VController} controller 控制器
     * @param {VHandlerSetting} setting 请求处理器设置
     */
    static buildGET(controller, setting) {
        return VHandler.build(controller, Object.assign({}, setting, { methods: 'GET' }));
    }

    /**
     * GET请求及认证处理创建
     *
     * @param {VController} controller 控制器
     * @param {VHandlerSetting} setting 请求处理器设置
     */
    static buildGETAndAuth(controller, setting) {
        if (!JWT_SECRET_KEY) {
            throw new Error('缺少环境变量`JWT_SECRET_KEY`');
        }
        return VHandler.buildGET(controller, Object.assign({}, setting, { secretKey: JWT_SECRET_KEY }));
    }

    /**
     * POST请求处理创建
     *
     * @param {VController} controller 控制器
     * @param {VHandlerSetting} setting 请求处理器设置
     */
    static buildPOST(controller, setting) {
        return VHandler.build(controller, Object.assign({}, setting, { methods: 'POST' }));
    }

    /**
     * POST请求及认证处理创建
     *
     * @param {VController} controller 控制器
     * @param {VHandlerSetting} setting 请求处理器设置
     */
    static buildPOSTAndAuth(controller, setting) {
        if (!JWT_SECRET_KEY) {
            throw new Error('缺少环境变量`JWT_SECRET_KEY`');
        }
        return VHandler.buildPOST(controller, Object.assign({}, setting, { secretKey: JWT_SECRET_KEY }));
    }

    /**
     * 请求处理创建
     *
     * @param {VController} controller 控制器
     * @param {VHandlerSetting} setting 请求处理器设置
     */
    static build(controller, setting) {
        /**
         * 请求方法检查
         *
         * @type {(method: string) => boolean}
         */
        let methodCheck = () => true;
        if (setting?.methods) {
            if (typeof setting.methods === 'string') {
                methodCheck = (method) => method.toUpperCase() === setting.methods;
            } else {
                methodCheck = (method) => setting.methods.includes(method.toUpperCase());
            }
        }
        /**
         * 认证检查
         *
         * @type {(params: any, context: Context) => boolean}
         */
        let authorizedCheck = () => true;
        if (setting?.secretKey) {
            authorizedCheck = (params, context) => {
                const authorization = context.req.header('Authorization');
                if (!authorization?.startsWith('Bearer ')) {
                    return false;
                }
                const token = authorization.replace('Bearer ', '');
                let result = true;
                try {
                    params[TOKEN_DATA] = JWT.verify(token, setting.secretKey);
                } catch (error) {
                    result = false;
                }
                return result;
            };
        }

        /**
         * @param {Context} context 请求上下文
         */
        return async function handler(context) {
            const reqMethod = context.req.method;
            if (reqMethod.toUpperCase() === 'OPTIONS') {
                return context.text('OK', 200);
            }
            let innerParams = {};
            let bodyParams = null;
            if (['POST', 'PUT'].includes(reqMethod.toUpperCase())) {
                try {
                    if (context.req.header('Content-Type')?.startsWith('application/json')) {
                        bodyParams = await context.req.json();
                    } else {
                        bodyParams = await context.req.parseBody();
                    }
                } catch (err) {
                    bodyParams = {};
                }
            }
            const params = new Proxy(
                {},
                {
                    get: (_, key) => {
                        if (key in innerParams) {
                            return innerParams[key];
                        }
                        let value = context.req.queries(key);
                        if (value) {
                            return value.length === 1 ? value[0] : value;
                        }
                        return bodyParams ? bodyParams[key] : undefined;
                    }
                }
            );
            context.header('Content-Type', 'text/html;charset=UTF-8');
            if (!methodCheck(reqMethod)) {
                return context.text(`非法的请求方法: ${reqMethod}`, 500, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });
            }
            if (!authorizedCheck(innerParams, context)) {
                return context.text('没有权限', 401, { 'Content-Type': 'text/plain; charset=utf-8' });
            }
            return Promise.resolve(controller(params, context))
                .then((result) => {
                    context.status(200);
                    context.header('Content-Type', 'application/json;charset=UTF-8');
                    if (typeof result === 'object') {
                        return context.json(result instanceof Result ? result : Result.success({ data: result }));
                    } else {
                        return context.json(Result.success({ data: JSON.stringify(result) }));
                    }
                })
                .catch((error) => {
                    context.header('Content-Type', 'application/json;charset=UTF-8');
                    return context.json(Result.error({ message: error.stack }), 500);
                });
        };
    }
}

export default VHandler;
export { ENV, JWT, TOKEN_DATA, Result };
