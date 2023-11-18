import VHandler, { Result } from '../../utils/handler.js';
import { Model as ModelModel } from '../../model/ModelModel.js';
import { Model as ModuleModel } from '../../model/ModuleModel.js';
import { randomString } from '../../utils/common.js';

// 静态文件夹
const staticDirs = ['assets', 'img', 'setting'];

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
        if (!module || module.trim() === '') {
            throw new Error('模块不能为空');
        }
        if (!name || name.trim() === '') {
            throw new Error('名称不能为空');
        }
        if (!table || table.trim() === '') {
            throw new Error('表名不能为空');
        }
        if (!property || property.trim() === '') {
            throw new Error('结构不能为空');
        }
        const findModel = await ModelModel.findOne({ module, name }).exec();
        if (findModel) {
            throw new Error('该模型已存在');
        }
        if (module === 'mossm' || module === 'dispatcher' || staticDirs.includes(module)) {
            const message = `非法的模块名[${module}], 模块名不能为${['mossm', ...staticDirs].join(', ')}`;
            throw new Error(message);
        }
        const findModule = await ModuleModel.findOne({ module }).exec();
        if (!findModule) {
            secretKey ??= randomString();
            await new ModuleModel({ module, secretKey }).save();
        }
        const data = await new ModelModel({ module, name, table, property }).save();
        return Result.success({ message: '添加模型成功', data });
    }
);
