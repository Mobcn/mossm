import { BaseService } from '../BaseService.js';
import { moduleDAO } from '../../dao/mossm/ModuleDAO.js';

/** @typedef {import('../../dao/mossm/ModuleDAO').ModuleDAO} DAO */
/** @typedef {import('../BaseService').ExtractModel<DAO>} Model */

/**
 * Module服务
 *
 * @extends {BaseService<DAO, Model>}
 */
class ModuleService extends BaseService {
    /**
     * 获取模块名列表
     */
    async listName() {
        const list = await this.DAO.list({ sort: { name: 1 } });
        return list.map((item) => item.name);
    }

    /**
     * 通过模块名获取模块
     *
     * @param {string} name 模块名
     */
    async getByName(name) {
        return await this.DAO.get({ name });
    }
}

const moduleService = new ModuleService(moduleDAO);
export { ModuleService, moduleService };
