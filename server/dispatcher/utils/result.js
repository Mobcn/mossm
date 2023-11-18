/**
 * 返回数据对象
 */
class Result {
    /** 响应码 */
    code;

    /** 响应消息 */
    message;

    /** 响应数据 */
    data;

    /**
     * @param {Object} param0 参数
     * @param {number} [param0.code=0] 响应码
     * @param {string} [param0.message='成功!'] 响应消息
     * @param {any} param0.data 响应数据
     */
    constructor({ code = 0, message = '成功!', data }) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 成功
     *
     * @param {{ code?: number; message?: string; data?: any }} params 结果参数
     */
    static success(params) {
        return new Result(params ?? {});
    }

    /**
     * 错误
     *
     * @param {{ code?: number; message?: string }} params 结果参数
     */
    static error(params) {
        return new Result(Object.assign({ code: -1, message: '失败!' }, params));
    }
}

export default Result;
