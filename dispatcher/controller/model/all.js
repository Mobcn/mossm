import VHandler, { Result } from '../../utils/handler.js';
import { Model as ModelModel } from '../../model/ModelModel.js';

/**
 * 获取所有模型
 */
export default VHandler.buildGETAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string} [param0.module] 模块
     */
    async ({ module }) => {
        const filter = module ? { module } : {};
        const data = await ModelModel.find(filter).sort({ name: 1 }).exec();
        return Result.success({ message: '获取模型成功!', data });
    }
);
