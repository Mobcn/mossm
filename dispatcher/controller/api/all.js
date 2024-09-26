import VHandler, { Result } from '../../utils/handler.js';
import { Model as APIModel } from '../../model/APIModel.js';

/**
 * 获取所有接口
 */
export default VHandler.buildGETAndAuth(async () => {
    const data = await APIModel.find().sort({ create_time: -1 }).exec();
    return Result.success({ message: '获取接口成功!', data });
});
