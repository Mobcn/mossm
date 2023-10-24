import VHandler, { Result } from '#handler';
import { apiService } from '#service/mossm/APIService.js';

/**
 * 修改接口
 */
export default VHandler.buildPOSTAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string} param0._id 接口ID
     * @param {string} param0.module 模块
     * @param {string} param0.model 模型
     * @param {string} param0.path 路径
     * @param {boolean} param0.authorized 是否认证
     * @param {boolean} param0.customize 是否自定义
     * @param {string} param0.raw_handler 原始处理器
     * @param {string} param0.type 类型
     * @param {string} param0.method 请求方法
     * @param {string} param0.input_fields 输入参数字段
     * @param {string} param0.output_fields 输出数据字段
     * @param {string} param0.where 过滤条件
     * @param {string} param0.success_message 成功消息
     * @param {string} param0.error_message 错误消息
     * @param {boolean} param0.status 状态
     */
    async ({
        _id,
        module,
        model,
        path,
        authorized,
        method,
        customize,
        raw_handler,
        type,
        input_fields,
        output_fields,
        where,
        success_message,
        error_message,
        status
    }) => {
        const result = await apiService.updateById(_id, {
            module,
            model,
            path,
            authorized,
            method,
            customize,
            raw_handler,
            type,
            input_fields,
            output_fields,
            where,
            success_message,
            error_message,
            status
        });
        return Result.success({ message: '修改接口成功', data: result });
    }
);
