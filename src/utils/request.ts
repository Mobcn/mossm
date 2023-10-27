import FetchService from './FetchService';
import storage from './storage';

// token刷新地址
const refreshURL = '/mossm/login';

// 创建一个fetch服务实例
const service = FetchService.create({
    baseURL: new URL(location.href).origin,
    timeout: 10000
});

// 请求拦截器
service.addRequestInterceptor((_url, options) => {
    const token = storage.get('token');
    if (token) {
        // 配置登录认证token
        options.headers = new Headers(options.headers);
        options.headers.set('Authorization', 'Bearer ' + token);
    }
});

// 响应拦截器
service.addResponseInterceptor((responseData) => {
    const { code, message, data } = responseData.data;
    if (code !== 0) {
        throw new Error(message);
    }
    return data;
});

// 响应错误拦截器
service.setResponseErrorInterceptor(async (response, options) => {
    if (response.status !== 401) {
        throw new Error(response.statusText);
    }
    const { pathname } = new URL(response.url);
    if (pathname === refreshURL) {
        throw new Error(response.statusText);
    }
    // 刷新token
    let { token } = await service.post(refreshURL);
    storage.set('token', token);

    // 重试
    // @ts-ignore
    return await service[options.method!.toLowerCase()](response.url, undefined, options);
});

export default service;
