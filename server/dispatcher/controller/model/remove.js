import mongoose from '../plugins/bundled-mongoose.js';
import VHandler, { Result } from '../../utils/handler.js';
import { Model as ModelModel } from '../../model/ModelModel.js';
import { Model as ModuleModel } from '../../model/ModuleModel.js';
import { Model as APIModel } from '../../model/APIModel.js';

/**
 * 删除模型
 */
export default VHandler.buildPOSTAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string | string[]} param0._id 模型ID
     */
    async ({ _id }) => {
        const inArr = _id instanceof Array ? _id : [_id];

        // 获取模型
        const findModels = await ModelModel.find({ _id: { $in: inArr } }).exec();
        if (findModels.length <= 0) {
            return { deletedCount: 0 };
        }

        // 判断模型是否存在API
        const isExistAPI = (await APIModel.exists({ model: { $in: findModels.map((item) => item.name) } })) !== null;
        if (isExistAPI) {
            throw new Error(`${_id instanceof Array ? '存在' : ''}模型已被使用，无法删除`);
        }

        // 删除模型
        const data = await ModelModel.deleteMany({ _id: { $in: findModels.map((item) => item._id) } });

        await Promise.all([
            // 删除模型对应的表
            Promise.all(
                findModels.map(async ({ module, table }) => {
                    const tableName = (module + '_' + table).toLowerCase();
                    await mongoose.connection.db.dropCollection(tableName);
                })
            ),
            // 删除不存在模型的模块
            Promise.all(
                Array.from(new Set(findModels.map((item) => item.module))).map(async (module) => {
                    const isExist = (await ModelModel.exists({ module })) !== null;
                    return [module, isExist];
                })
            ).then(async (res) => {
                const emptyModules = res.filter((item) => !item[1]).map((item) => item[0]);
                if (emptyModules.length > 0) {
                    await ModuleModel.deleteMany({ name: { $in: emptyModules } });
                }
            })
        ]);

        return Result.success({ message: '删除模型成功!', data });
    }
);
