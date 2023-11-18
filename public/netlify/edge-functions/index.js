import dispatcher from '../../dispatcher/dispatcher.js';
import { createVRequest, createVResponse } from '../utils/convert.js';

/**
 * 请求处理器
 *
 * @param {Request} request 请求对象
 * @param {Context} context 请求上下文
 * @returns {Promise<Response>}
 */
export default async (request, context) => {
    return new Promise(async (resolve) => {
        const vRequest = await createVRequest(request, context);
        const vResponse = createVResponse(resolve);
        dispatcher(vRequest, vResponse);
    });
};

/**
 * 配置
 *
 * @type {Config}
 */
export const config = {
    path: '/(.+)/*',
    excludedPath: ['assets', 'img', 'setting'].map((name) => `/${name}/*`)
};

/** @typedef {"off" | "manual"} Cache 缓存 */
/** @typedef {`/${string}`} Path 路径 */
/** @typedef {"fail" | "bypass" | Path} OnError 错误事件 */
/** @typedef {"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS"} HTTPMethod 请求方法 */
/**
 * @typedef {Object} Context 请求上下文
 * @property {Object} cookies Cookie
 * @property {(name: string) => string} cookies.get 获取
 * @property {(name: string, value: string) => string} cookies.set 设置
 * @property {(name: string) => string} cookies.delete 删除
 */
/**
 * @typedef {Object} Config 边缘函数配置
 * @property {Cache} [cache] 缓存
 * @property {Path | Path[]} [excludedPath] 排除路径
 * @property {OnError} [onError] 错误事件
 * @property {Path | Path[]} [path] 匹配路径
 * @property {HTTPMethod | HTTPMethod[]} [method] 请求方法
 */
