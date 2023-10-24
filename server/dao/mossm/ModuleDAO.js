import { BaseDAO } from '#dao/BaseDAO.js';
import { Model } from '#dao/mossm/model/ModuleModel.js';
import { randomString } from 'utils/common.js';

/**
 * Module数据访问
 *
 * @extends {BaseDAO<typeof Model>}
 */
class ModuleDAO extends BaseDAO {
    /**
     * 添加
     *
     * @param {{ name: string; secretKey?: string }} data 添加的数据
     */
    async insert({ name, secretKey }) {
        if (
            name === 'mossm' ||
            name === 'api' ||
            name === 'controller' ||
            name === 'service' ||
            name === 'dao' ||
            name === 'handler' ||
            name === 'assets' ||
            name === 'declare' ||
            name === 'img'
        ) {
            const message = `非法的模块名[${name}], 模块名不能为moss, api, controller, service, dao, handler, assets, declare, img`;
            throw new Error(message);
        }
        secretKey ??= randomString();
        return await this.DAO.insert({ name, secretKey });
    }
}

const moduleDAO = new ModuleDAO(Model);
export { ModuleDAO, moduleDAO };
