import VHandler, { Result } from '../../../handler/index.js';
import { modelService } from '../../../service/mossm/ModelService.js';

/**
 * 添加模型
 */
export default VHandler.buildPOSTAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string} param0.module 模块
     * @param {string} param0.name 名称
     * @param {string} param0.table 表名
     * @param {string} param0.property 结构
     */
    async ({ module, name, table, property }) => {
        const result = await modelService.save({ module, name, table, property });
        return Result.success({ message: '添加模型成功', data: result });
    }
);
