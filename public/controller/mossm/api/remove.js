import VHandler, { Result } from '#handler';
import { apiService } from '#service/mossm/APIService.js';

/**
 * 删除接口
 */
export default VHandler.buildPOSTAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string | string[]} param0._id 接口ID
     */
    async ({ _id }) => Result.success({ message: '删除接口成功!', data: await apiService.removeById(_id) })
);
