import VHandler, { Result } from '../../utils/handler.js';
import { Model as APIModel } from '../../model/APIModel.js';

/**
 * 删除接口
 */
export default VHandler.buildPOSTAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string | string[]} param0._id 接口ID
     */
    async ({ _id }) => {
        const data = await APIModel.deleteMany({ _id: { $in: _id instanceof Array ? _id : [_id] } });
        return Result.success({ message: '删除接口成功!', data });
    }
);
