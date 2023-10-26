import { BaseDAO } from '#dao/BaseDAO.js';
import { Model } from '#dao/mossm/model/ModuleModel.js';
import { randomString } from '#utils/common.js';

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
            name === 'database' ||
            name === 'api' ||
            name === 'controller' ||
            name === 'service' ||
            name === 'dao' ||
            name === 'handler' ||
            name === 'utils' ||
            name === 'assets' ||
            name === 'declare' ||
            name === 'img'
        ) {
            const message = `非法的模块名[${name}], 模块名不能为moss, database, api, controller, service, dao, handler, utils, assets, declare, img`;
            throw new Error(message);
        }
        const findModule = await moduleDAO.get({ name });
        if (findModule) {
            return findModule;
        }
        secretKey ??= randomString();
        return await super.insert({ name, secretKey });
    }

    /**
     * 删除名称对应的数据
     *
     * @param {string | string[]} name 名称
     */
    async deleteByName(name) {
        return await this.Model.deleteMany({ name: { $in: name instanceof Array ? name : [name] } });
    }
}

const moduleDAO = new ModuleDAO(Model);
export { ModuleDAO, moduleDAO };
