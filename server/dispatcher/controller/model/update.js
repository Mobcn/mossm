import VHandler, { Result } from '../../utils/handler.js';
import { Model as ModelModel } from '../../model/ModelModel.js';

/**
 * 添加模型
 */
export default VHandler.buildPOSTAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string} param0._id 模型ID
     * @param {string} param0.property 结构
     */
    async ({ _id, property }) => {
        const data = await ModelModel.findByIdAndUpdate(_id, { $set: { property } });
        return Result.success({ message: '修改模型成功', data });
    }
);
