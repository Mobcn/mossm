import DB from '../dao/database/db.js';
import ENV from './env.js';
import JWT from './jwt.js';
import Result from './result.js';

/** @typedef {import('http').IncomingMessage} IncomingMessage 消息 */
/** @typedef {import('http').ServerResponse} ServerResponse 响应 */
/** @typedef {{ [key: string]: string }} VercelRequestCookies Vercel请求Cookie */
/** @typedef {{ [key: string]: string | string[] }} VercelRequestQuery Vercel请求参数 */
/** @typedef {any} VercelRequestBody Vercel请求体 */
/** @typedef {(body: any) => VercelResponse} SendFun 发送响应 */
/** @typedef {(jsonBody: any) => VercelResponse} JSONFun 响应JSON */
/** @typedef {(statusCode: number) => VercelResponse} StatusFun 响应状态设置 */
/** @typedef {(statusOrUrl: string | number, url?: string) => VercelResponse} RedirectFun 重定向 */
/** @typedef {IncomingMessage & { query: VercelRequestQuery; cookies: VercelRequestCookies; body: VercelRequestBody; }} VercelRequest Vercel请求 */
/** @typedef {ServerResponse & { send: SendFun; json: JSONFun; status: StatusFun; redirect: RedirectFun; }} VercelResponse Vercel响应 */
/** @typedef {{ methods?: string | string[], secretKey?: string }} VHandlerSetting 请求处理器设置 */

/** JWT密匙 */
const JWT_SECRET_KEY = ENV.get('JWT_SECRET_KEY');

/**
 * 请求处理器
 */
class VHandler {
    /** @type {VHandlerSetting} */
    setting = {};

    /**
     * 请求处理创建
     *
     * @param {(query: VercelRequestQuery, request: VercelRequest, response: VercelResponse) => any} controller 控制器
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
     * @param {(query: VercelRequestQuery, request: VercelRequest, response: VercelResponse) => any} controller 控制器
     * @param {VHandlerSetting} setting 请求处理器设置
     */
    static buildGET(controller, setting) {
        return VHandler.build(controller, Object.assign({}, setting, { methods: 'GET' }));
    }

    /**
     * GET请求及认证处理创建
     *
     * @param {(query: VercelRequestQuery & { __token_data__: any }, request: VercelRequest, response: VercelResponse) => any} controller 控制器
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
     * @param {(query: VercelRequestQuery, request: VercelRequest, response: VercelResponse) => any} controller 控制器
     * @param {VHandlerSetting} setting 请求处理器设置
     */
    static buildPOST(controller, setting) {
        return VHandler.build(controller, Object.assign({}, setting, { methods: 'POST' }));
    }

    /**
     * POST请求及认证处理创建
     *
     * @param {(query: VercelRequestQuery & { __token_data__: any }, request: VercelRequest, response: VercelResponse) => any} controller 控制器
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
     * @param {(query: VercelRequestQuery, request: VercelRequest, response: VercelResponse) => any} controller 控制器
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
         * @type {(params: any, request: VercelRequest) => boolean}
         */
        let authorizedCheck = () => true;
        if (setting?.secretKey) {
            authorizedCheck = (params, request) => {
                const authorization = request.headers['authorization'];
                if (!authorization?.startsWith('Bearer ')) {
                    return false;
                }
                const token = authorization.replace('Bearer ', '');
                let result = true;
                try {
                    params['__token_data__'] = JWT.verify(token, setting.secretKey);
                } catch (error) {
                    result = false;
                }
                return result;
            };
        }

        /**
         * @param {VercelRequest} request 请求对象
         * @param {VercelResponse} response 响应对象
         */
        return function handler(request, response) {
            if (request.method.toUpperCase() === 'OPTIONS') {
                response.status(200).end();
                return;
            }
            const params = Object.assign({}, request.query, request.body);
            response.setHeader('Content-Type', 'text/html;charset=UTF-8');
            if (!methodCheck(request.method)) {
                response.status(500).end(`非法的请求方法: ${request.method}`);
                return;
            }
            if (!authorizedCheck(params, request)) {
                response.status(401).end('没有权限');
                return;
            }
            new Promise(async (resolve, reject) => {
                await DB.connect();
                Promise.resolve(controller(params, request, response))
                    .then((result) => {
                        response.status(200);
                        response.setHeader('Content-Type', 'application/json;charset=UTF-8');
                        if (typeof result === 'object') {
                            response.json(result instanceof Result ? result : Result.success({ data: result }));
                        } else {
                            response.json(Result.success({ data: JSON.stringify(result) }));
                        }
                        resolve();
                    })
                    .catch((error) => reject(error));
            }).catch((error) => {
                response.setHeader('Content-Type', 'application/json;charset=UTF-8');
                response.json(Result.error({ message: error.stack }));
            });
        };
    }
}

export default VHandler;
export { ENV, JWT, Result };
