import mongoose from 'mongoose';
import { BaseService } from '../BaseService.js';
import { modelDAO } from '../../dao/mossm/ModelDAO.js';

/** @typedef {import('../../dao/mossm/ModelDAO').ModelDAO} DAO */
/** @typedef {import('../BaseService').ExtractModel<DAO>} Model */

/**
 * Model服务
 *
 * @extends {BaseService<DAO, Model>}
 */
class ModelService extends BaseService {
    /**
     * 获取apiDAO
     */
    static async getAPIDAO() {
        const { apiDAO } = await import('../../dao/mossm/APIDAO.js');
        return apiDAO;
    }

    /**
     * 获取moduleDAO
     */
    static async getModuleDAO() {
        const { moduleDAO } = await import('../../dao/mossm/ModuleDAO.js');
        return moduleDAO;
    }

    /**
     * 获取所有模型
     *
     * @param {string} [module] 模块
     */
    async listAll(module) {
        return await this.DAO.list({ filter: { module } });
    }

    /**
     * 添加
     *
     * @param {Object} param0 保存数据
     * @param {string} param0.module 模块
     * @param {string} param0.name 名称
     * @param {string} param0.table 表名
     * @param {string} param0.property 结构
     */
    async save({ module, name, table, property }) {
        if (!module || module.trim() === '') {
            throw new Error('模块不能为空');
        }
        if (!name || name.trim() === '') {
            throw new Error('名称不能为空');
        }
        if (!table || table.trim() === '') {
            throw new Error('表名不能为空');
        }
        if (!property || property.trim() === '') {
            throw new Error('结构不能为空');
        }
        const findModel = await this.DAO.get({ module, name });
        if (findModel) {
            throw new Error('该模型已存在');
        }
        ModelService.getModuleDAO().then((moduleDAO) => moduleDAO.insert({ name: module }));
        return await this.DAO.insert({ module, name, table, property });
    }

    /**
     * 删除主键ID对应的模型
     *
     * @param {any | any[]} id 主键ID
     */
    async removeById(id) {
        const inArr = id instanceof Array ? id : [id];

        // 获取模型
        const findModels = await this.DAO.list({ filter: { _id: { $in: inArr } } });
        if (findModels.length <= 0) {
            return { deletedCount: 0 };
        }

        // 判断模型是否存在API
        const apiDAO = await ModelService.getAPIDAO();
        const isExistAPI = await apiDAO.exists({ model: { $in: findModels.map((item) => item.name) } });
        if (isExistAPI) {
            throw new Error(`${id instanceof Array ? '存在' : ''}模型已被使用，无法删除`);
        }

        // 删除模型
        const result = await this.DAO.deleteById(findModels.map((item) => item._id));

        // 删除模型对应的表
        for (const { module, table } of findModels) {
            const tableName = (module + '_' + table).toLowerCase();
            mongoose.connection.db.dropCollection(tableName);
        }
        // 删除不存在模型的模块
        const modules = Array.from(new Set(findModels.map((item) => item.module)));
        const promiseList = modules.map(async (module) => {
            const isExist = await this.DAO.exists({ module });
            return [module, isExist];
        });
        Promise.all(promiseList).then(async (res) => {
            const emptyModules = res.filter((item) => !item[1]).map((item) => item[0]);
            if (emptyModules.length > 0) {
                const moduleDAO = await ModelService.getModuleDAO();
                moduleDAO.deleteByName(emptyModules);
            }
        });

        return result;
    }
}

const modelService = new ModelService(modelDAO);
export { ModelService, modelService };
