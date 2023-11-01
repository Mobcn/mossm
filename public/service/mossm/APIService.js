import { BaseService } from '../BaseService.js';
import { apiDAO } from '../../dao/mossm/APIDAO.js';
import { minify } from 'terser';

/** @typedef {import('../../dao/mossm/APIDAO').APIDAO} DAO */
/** @typedef {import('../BaseService').ExtractModel<DAO>} Model */

/**
 * API服务
 *
 * @extends {BaseService<DAO, Model>}
 */
class APIService extends BaseService {
    /**
     * 获取moduleDAO
     */
    static async getModuleDAO() {
        const { moduleDAO } = await import('../../dao/mossm/ModuleDAO.js');
        return moduleDAO;
    }

    /**
     * 获取分页数据
     *
     * @param {Object} param0 参数
     * @param {string} [param0.module] 模块
     * @param {string} [param0.model] 模型
     * @param {number} [param0.page] 页数
     * @param {number} [param0.limit] 每页数据条数
     */
    async page({ module, model, page, limit }) {
        return await this.DAO.page({ filter: { module, model }, page, limit });
    }

    /**
     * 保存
     *
     * @param {Object} param0 请求参数
     * @param {string} param0.module 模块
     * @param {string} param0.model 模型
     * @param {string} param0.path 路径
     * @param {boolean} param0.authorized 是否认证
     * @param {boolean} param0.customize 是否自定义
     * @param {string} param0.raw_handler 原始处理器
     * @param {string} param0.type 类型
     * @param {string} param0.method 请求方法
     * @param {string} param0.input_fields 输入参数字段
     * @param {string} param0.output_fields 输出数据字段
     * @param {string} param0.where 过滤条件
     * @param {string} param0.success_message 成功消息
     * @param {string} param0.error_message 错误消息
     */
    async save({
        module,
        model,
        path,
        authorized,
        customize,
        raw_handler,
        type,
        method,
        input_fields,
        output_fields,
        where,
        success_message,
        error_message
    }) {
        const findApi = await this.DAO.get({ module, model, path });
        if (findApi) {
            throw new Error('该接口已存在');
        }
        const handler = raw_handler ? (await minify(raw_handler)).code : undefined;
        return await this.DAO.insert({
            module,
            model,
            path,
            authorized,
            customize,
            raw_handler,
            handler,
            type,
            method,
            input_fields,
            output_fields,
            where,
            success_message,
            error_message
        });
    }

    /**
     * 更新
     *
     * @param {any} id 接口ID
     * @param {Object} param0 更新的数据
     * @param {string} param0.module 模块
     * @param {string} param0.model 模型
     * @param {string} param0.path 路径
     * @param {boolean} param0.authorized 是否认证
     * @param {boolean} param0.customize 是否自定义
     * @param {string} param0.raw_handler 原始处理器
     * @param {string} param0.type 类型
     * @param {string} param0.method 请求方法
     * @param {string} param0.input_fields 输入参数字段
     * @param {string} param0.output_fields 输出数据字段
     * @param {string} param0.where 过滤条件
     * @param {string} param0.success_message 成功消息
     * @param {string} param0.error_message 错误消息
     * @param {string} param0.status 状态
     */
    async updateById(
        id,
        {
            module,
            model,
            path,
            authorized,
            method,
            customize,
            raw_handler,
            type,
            input_fields,
            output_fields,
            where,
            success_message,
            error_message,
            status
        }
    ) {
        const handler = raw_handler ? (await minify(raw_handler)).code : undefined;
        return await this.DAO.updateById(id, {
            module,
            model,
            path,
            authorized,
            method,
            customize,
            raw_handler,
            handler,
            type,
            input_fields,
            output_fields,
            where,
            success_message,
            error_message,
            status,
            update_time: new Date()
        });
    }
}

const apiService = new APIService(apiDAO);
export { APIService, apiService };