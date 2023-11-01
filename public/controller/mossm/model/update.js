import VHandler, { Result } from '../../../handler/index.js';
import { modelService } from '../../../service/mossm/ModelService.js';

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
        const result = await modelService.updateById(_id, { property });
        return Result.success({ message: '修改模型成功', data: result });
    }
);
