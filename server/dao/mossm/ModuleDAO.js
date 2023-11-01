import { BaseDAO } from '../BaseDAO.js';
import { Model } from './model/ModuleModel.js';
import { randomString } from '../../utils/common.js';
import staticDirs from '../../config/static.js';
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
        if (name === 'mossm' || staticDirs.includes(name)) {
            const message = `非法的模块名[${name}], 模块名不能为${['mossm', ...staticDirs].join(', ')}`;
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
