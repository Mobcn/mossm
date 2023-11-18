import VHandler, { Result } from '../utils/handler.js';
import { Model as SettingModel } from '../model/SettingModel.js';

/**
 * 修改系统设置
 */
export default VHandler.buildPOSTAndAuth(
    /**
     * @param {{ __token_data__: any, [x: string]: string }} param0 请求参数
     */
    async ({ __token_data__, ...params }) => {
        await Promise.all(
            Object.entries(params).map(([key, value]) => SettingModel.updateMany({ key }, { $set: { value } }))
        );
        return Result.success({ message: '系统设置修改成功!' });
    }
);
