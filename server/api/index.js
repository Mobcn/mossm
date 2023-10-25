import VHandler, { Result } from '#handler';
import mongoose from 'mongoose';
import DB from '#db';
import { apiService } from '#service/mossm/APIService.js';
import { modelService } from '#service/mossm/ModelService.js';
import { moduleService } from '#service/mossm/ModuleService.js';

/** @typedef {import("#handler").VercelRequest} VercelRequest */
/** @typedef {import("#handler").VercelResponse} VercelResponse */
/** @typedef {(request: VercelRequest, response: VercelResponse) => void} VercelHandler */

/**
 * @type {{ [path: string]: () => Promise<{ default: VercelHandler }> }}
 */
const router = {
    '/mossm/login': () => import('#controller/mossm/login.js'),
    '/mossm/api/all': () => import('#controller/mossm/api/all.js'),
    '/mossm/api/remove': () => import('#controller/mossm/api/remove.js'),
    '/mossm/api/save': () => import('#controller/mossm/api/save.js'),
    '/mossm/api/update': () => import('#controller/mossm/api/update.js'),
    '/mossm/model/all': () => import('#controller/mossm/model/all.js'),
    '/mossm/model/remove': () => import('#controller/mossm/model/remove.js'),
    '/mossm/model/save': () => import('#controller/mossm/model/save.js'),
    '/mossm/model/update': () => import('#controller/mossm/model/update.js'),
    '/mossm/module/all': () => import('#controller/mossm/module/all.js'),
    '/test/db': () => import('#controller/test/db.js'),
    '/test/index': () => import('#controller/test/index.js')
};

/**
 * @param {VercelRequest} request 请求对象
 * @param {VercelResponse} response 响应对象
 */
export default function handler(request, response) {
    const { pathname } = new URL(request.url, 'http://' + request.headers.host);
    if (Object.keys(router).includes(pathname)) {
        router[pathname]()
            .then(({ default: handler }) => handler(request, response))
            .catch((error) => response.status(500).end(error.message));
    } else {
        const paths = pathname.split('/');
        if (paths.length < 4) {
            response.status(404).end();
            return;
        }
        const module = paths[1];
        const model = paths[2][0].toUpperCase() + paths[2].substring(1);
        const path = '/' + paths.slice(3).join('/');
        Promise.all([
            DB.connect(),
            apiService.DAO.get({ module, model, path, status: true }),
            moduleService.getByName(module),
            modelService.DAO.get({ module, model })
        ])
            .then(([_, findApi, findModule, findModel]) => {
                if (!findApi || !findModule || !findModel) {
                    response.status(404).end();
                    return;
                }
                const { name, property, table } = findModel;
                const tableName = (module + '_' + table).toLowerCase();
                const Model = mongoose.models[name] || mongoose.model(name, new mongoose.Schema(property), tableName);
                const preHander = eval('(Model, Result) => ' + findApi.handler)(Model, Result);
                const { method: methods, authorized } = findApi;
                const secretKey = authorized ? findModule.secretKey : undefined;
                VHandler.config({ methods, secretKey }).build(preHander)(request, response);
            })
            .catch((error) => response.status(500).end(error.message));
    }
}
