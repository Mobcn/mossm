import VHandler, { Result, JWT as _JWT } from '../handler/index.js';
import DB from '../dao/database/db.js';
import { apiService } from '../service/mossm/APIService.js';
import { modelService } from '../service/mossm/ModelService.js';
import { moduleService } from '../service/mossm/ModuleService.js';

/** @typedef {import("../handler/index").VercelRequest} VercelRequest */
/** @typedef {import("../handler/index").VercelResponse} VercelResponse */
/** @typedef {(request: VercelRequest, response: VercelResponse) => void} VercelHandler */

/**
 * @type {{ [path: string]: () => Promise<{ default: VercelHandler }> }}
 */
const router = {
    '/mossm/chsetting': () => import('../controller/mossm/chsetting.js'),
    '/mossm/login': () => import('../controller/mossm/login.js'),
    '/mossm/api/all': () => import('../controller/mossm/api/all.js'),
    '/mossm/api/remove': () => import('../controller/mossm/api/remove.js'),
    '/mossm/api/save': () => import('../controller/mossm/api/save.js'),
    '/mossm/api/update': () => import('../controller/mossm/api/update.js'),
    '/mossm/model/all': () => import('../controller/mossm/model/all.js'),
    '/mossm/model/remove': () => import('../controller/mossm/model/remove.js'),
    '/mossm/model/save': () => import('../controller/mossm/model/save.js'),
    '/mossm/model/update': () => import('../controller/mossm/model/update.js'),
    '/mossm/module/all': () => import('../controller/mossm/module/all.js'),
    '/test/db': () => import('../controller/test/db.js'),
    '/test/hello': () => import('../controller/test/hello.js')
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
        DB.connect((mongoose) =>
            Promise.all([
                apiService.DAO.get({ module, model, path, status: true }),
                moduleService.getByName(module),
                modelService.DAO.get({ module, name: model })
            ])
                .then(([findApi, findModule, findModel]) => {
                    if (!findApi || !findModule || !findModel) {
                        response.status(404).end();
                        return;
                    }
                    const { name, property, table } = findModel;
                    const tableName = (module + '_' + table).toLowerCase();
                    const schema = new mongoose.Schema(eval('(' + property + ')'));
                    const Model = mongoose.models[name] || mongoose.model(name, schema, tableName);
                    const JWT = {
                        sign: (data, expiresIn) => _JWT.sign(data, findModule.secretKey, expiresIn),
                        verify: (token, ignoreExpiration) => _JWT.verify(token, findModule.secretKey, ignoreExpiration)
                    };
                    const preHander = eval('(Model, Result, JWT) => ' + findApi.handler)(Model, Result, JWT);
                    const { method: methods, authorized } = findApi;
                    const secretKey = authorized ? findModule.secretKey : undefined;
                    VHandler.config({ methods, secretKey }).build(preHander)(request, response);
                })
                .catch((error) => response.status(500).end(error.message))
        );
    }
}