import VHandler, { Result } from '../../../handler/index.js';
import { modelService } from '../../../service/mossm/ModelService.js';

/**
 * 获取所有模型
 */
export default VHandler.buildGETAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string} [param0.module] 模块
     */
    async ({ module }) => Result.success({ message: '获取模型成功!', data: await modelService.listAll(module) })
);
