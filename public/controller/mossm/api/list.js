import VHandler, { Result } from '../../../handler/index.js';
import { apiService } from '../../../service/mossm/APIService.js';

/**
 * 获取接口分页列表
 */
export default VHandler.buildGETAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string} [param0.module] 模块
     * @param {string} [param0.model] 模型
     * @param {string} [param0.page] 页码
     * @param {string} [param0.limit] 每页数据条数
     */
    async ({ module, model, page, limit }) => {
        page && (page = Number(page));
        limit && (limit = Number(limit));
        Result.success({ message: '获取接口分页列表成功!', data: await apiService.page({ module, model, page, limit }) });
    }
);
