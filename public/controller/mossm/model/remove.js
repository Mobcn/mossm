import VHandler, { Result } from '../../../handler/index.js';
import { modelService } from '../../../service/mossm/ModelService.js';

/**
 * 删除模型
 */
export default VHandler.buildPOSTAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string | string[]} param0._id 模型ID
     */
    async ({ _id }) => Result.success({ message: '删除模型成功!', data: await modelService.removeById(_id) })
);
