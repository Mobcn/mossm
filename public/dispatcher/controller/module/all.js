import VHandler, { Result } from '../../utils/handler.js';
import { Model as ModuleModel } from '../../model/ModuleModel.js';

/**
 * 获取所有模块
 */
export default VHandler.buildGETAndAuth(async () => {
    const list = await ModuleModel.find().sort({ name: 1 }).exec();
    const data = list.map((item) => item.name);
    return Result.success({ message: '获取模块成功!', data });
});
