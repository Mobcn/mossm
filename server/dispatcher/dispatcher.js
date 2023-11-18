import vm from 'node:vm';
import { createRequire } from 'node:module';
import DB from './database/mongodb.js';
import VHandler, { Result, JWT as _JWT } from './utils/handler.js';
import { Model as APIModel } from './model/APIModel.js';
import { Model as ModelModel } from './model/ModelModel.js';
import { Model as ModuleModel } from './model/ModuleModel.js';

/** @typedef {import("./utils/handler").VRequest} VRequest */
/** @typedef {import("./utils/handler").VResponse} VResponse */
/** @typedef {(request: VRequest, response: VResponse) => void} VercelHandler */

const require = createRequire(import.meta.url);

/**
 * @type {{ [path: string]: () => Promise<{ default: VercelHandler }> }}
 */
const router = {
    '/mossm/chsetting': () => import('./controller/chsetting.js'),
    '/mossm/login': () => import('./controller/login.js'),
    '/mossm/api/all': () => import('./controller/api/all.js'),
    '/mossm/api/list': () => import('./controller/api/list.js'),
    '/mossm/api/remove': () => import('./controller/api/remove.js'),
    '/mossm/api/save': () => import('./controller/api/save.js'),
    '/mossm/api/update': () => import('./controller/api/update.js'),
    '/mossm/model/all': () => import('./controller/model/all.js'),
    '/mossm/model/remove': () => import('./controller/model/remove.js'),
    '/mossm/model/save': () => import('./controller/model/save.js'),
    '/mossm/model/update': () => import('./controller/model/update.js'),
    '/mossm/module/all': () => import('./controller/module/all.js')
};

/**
 * 导入模块
 *
 * @param {string} module 模块名
 * @param {string} model 模型名
 * @param {(Model: import('mongoose').Model) => void} [callback] 模型名
 * @returns {Promise<import('mongoose').Model>}
 */
async function importModel(module, model, callback) {
    const mongoose = await DB.connect();
    const findModel = await ModelModel.findOne({ module, name: model }).exec();
    const { name, property, table } = findModel;
    const modelName = module.replace(/./, (i) => i.toUpperCase()) + '_' + name;
    const tableName = (module + '_' + table).toLowerCase();
    const schema = new mongoose.Schema(eval('(' + property + ')'));
    const Model = mongoose.models[modelName] || mongoose.model(modelName, schema, tableName);
    callback && callback(Model);
    return Model;
}

/**
 * 执行静态接口
 *
 * @param {string} path 路径
 * @param {VRequest} request 请求对象
 * @param {VResponse} response 响应对象
 */
async function runStatic(path, request, response) {
    await DB.connect();
    const { default: handler } = await router[path]();
    await handler(request, response);
}

/**
 * 执行动态接口
 *
 * @param {string} module 模块
 * @param {string} model 模型
 * @param {string} path 路径
 * @param {VRequest} request 请求对象
 * @param {VResponse} response 响应对象
 */
async function runDynamical(module, model, path, request, response) {
    await DB.connect();
    const findApiPromise = APIModel.findOne({ module, model, path, status: true }).exec();
    const findModulePromise = ModuleModel.findOne({ name: module }).exec();
    const findModelPromise = importModel(module, model);
    const [findApi, findModule, Model] = await Promise.all([findApiPromise, findModulePromise, findModelPromise]);
    if (!findApi || !findModule || !Model) {
        response.status(404).end();
        return;
    }
    const Models = new Proxy({}, { get: (_, key) => (cb) => importModel(module, key, cb) });
    const moduleKey = findModule.secretKey;
    const sign = (data, expiresIn) => _JWT.sign(data, moduleKey, expiresIn);
    const verify = (token, ignoreExpiration) => _JWT.verify(token, moduleKey, ignoreExpiration);
    const JWT = { sign, verify };
    const exports = {};
    vm.runInNewContext(findApi.handler, { require, exports, Model, Models, Result, JWT });
    const { method: methods, authorized } = findApi;
    const secretKey = authorized ? moduleKey : undefined;
    const handler = VHandler.config({ methods, secretKey }).build(exports.handler);
    await handler(request, response);
}

/**
 * 接口调度器
 *
 * @param {VRequest} request 请求对象
 * @param {VResponse} response 响应对象
 */
export default async function dispatcher(request, response) {
    const { pathname } = new URL(request.url, 'http://' + request.headers.host);
    let run;
    if (Object.keys(router).includes(pathname)) {
        run = runStatic(pathname, request, response);
    } else {
        const paths = pathname.split('/');
        if (paths.length < 4) {
            response.status(404).end();
            return;
        }
        const module = paths[1];
        const model = paths[2].replace(/./, (i) => i.toUpperCase());
        const path = '/' + paths.slice(3).join('/');
        run = runDynamical(module, model, path, request, response);
    }
    run.catch((error) => response.status(500).end(error.message));
}
