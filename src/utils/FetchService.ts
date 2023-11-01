/**
 * 请求设置参数
 */
type RequestOptions = Omit<RequestInit, 'body'> & {
    /** 基础路径 */
    baseURL?: string;
    /** 请求超时时间 */
    timeout?: number;
    /** 请求体 */
    body?: RequestParams | BodyInit | null;
};

/**
 * 响应数据
 */
type ResponseData = Response & { data: any };

/**
 * 请求参数
 */
type RequestParams = { [x: string]: string | string[] | number | number[] | boolean };

/**
 * 请求拦截器
 */
type RequestInterceptor = (url: string, options: RequestOptions) => Promise<void> | void;

/**
 * 响应拦截器
 */
type ResponseInterceptor = (responseData: ResponseData) => Promise<any | void> | any | void;

/**
 * 响应拦截器
 */
type ResponseErrorInterceptor = (response: Response, options: RequestOptions) => Promise<any> | any;

/**
 * fetch服务
 */
export default class FetchService {
    /** 默认请求设置参数 */
    private defaultOptions: RequestOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    /** 请求拦截器数组 */
    private requestInterceptors: RequestInterceptor[] = [];

    /** 响应拦截器数组 */
    private responseInterceptors: ResponseInterceptor[] = [];

    /** 响应错误拦截器 */
    private responseErrorInterceptor: ResponseErrorInterceptor | null = null;

    /**
     * @param options 请求设置参数
     */
    constructor(options: RequestOptions) {
        Object.assign(this.defaultOptions, options);
    }

    /**
     * 创建fetch服务对象
     *
     * @param options 请求设置参数
     */
    static create(options: RequestOptions) {
        return new FetchService(options);
    }

    /**
     * GET请求
     *
     * @param url 请求地址
     * @param params 请求参数
     * @param options 请求设置参数
     */
    async get(url: string, params?: RequestParams, options?: RequestOptions) {
        params && (url = this.mergeURL(url, params));
        return this._request(url, undefined, { ...options, method: 'GET' });
    }

    /**
     * POST请求
     *
     * @param url 请求地址
     * @param body 请求体
     * @param options 请求设置参数
     */
    async post(url: string, body?: string | Record<string, any> | RequestParams | FormData, options?: RequestOptions) {
        return this._request(url, body, { ...options, method: 'POST' });
    }

    /**
     * PUT请求
     *
     * @param url 请求地址
     * @param body 请求体
     * @param options 请求设置参数
     */
    async put(url: string, body?: string | RequestParams | FormData, options?: RequestOptions) {
        return this._request(url, body, { ...options, method: 'PUT' });
    }

    /**
     * DELETE请求
     *
     * @param url 请求地址
     * @param params 请求参数
     * @param options 请求设置参数
     */
    async delete(url: string, params?: RequestParams, options?: RequestOptions) {
        params && (url = this.mergeURL(url, params));
        return this._request(url, undefined, { ...options, method: 'DELETE' });
    }

    /**
     * 添加请求拦截器
     */
    addRequestInterceptor(interceptor: RequestInterceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * 添加响应拦截器
     */
    addResponseInterceptor(interceptor: ResponseInterceptor) {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * 设置响应错误拦截器
     */
    setResponseErrorInterceptor(interceptor: ResponseErrorInterceptor) {
        this.responseErrorInterceptor = interceptor;
    }

    /**
     * 请求
     *
     * @param url 请求地址
     * @param body 请求体
     * @param options 请求设置参数
     */
    private async _request(
        url: string,
        body?: string | Record<string, any> | RequestParams | FormData,
        options?: RequestOptions
    ) {
        const _options: RequestOptions = { ...this.defaultOptions, body, ...options };
        await this.runRequestInterceptors(url, _options);
        if (typeof body === 'object') {
            _options.headers = new Headers(_options.headers);
            if (body instanceof FormData) {
                _options.headers.delete('Content-Type');
            } else if (Object.keys(body).length > 0) {
                const contentType = _options.headers.get('Content-Type') ?? '';
                if (contentType.startsWith('application/x-www-form-urlencoded')) {
                    _options.body = this.mergeURL('/', body).split('?')[1];
                } else {
                    _options.body = JSON.stringify(body);
                }
            }
        } else {
            body && (_options.body = body);
        }
        if (_options.timeout !== undefined) {
            const controller = new AbortController();
            if (_options.signal) {
                _options.signal.onabort = (e) => controller.abort(e);
            }
            _options.signal = controller.signal;
            setTimeout(() => controller.abort('timeout'), _options.timeout);
        }
        const response = await fetch(new URL(url, _options.baseURL), <RequestInit>_options);
        if (response.status !== 200) {
            if (!this.responseErrorInterceptor) {
                throw new Error(response.statusText);
            }
            return await this.responseErrorInterceptor(response, _options);
        }
        let data: any;
        const contentType = response.headers.get('Content-Type') ?? '';
        if (contentType.startsWith('application/json')) {
            data = await response.json();
        } else if (contentType.startsWith('application/octet-stream')) {
            data = await response.blob();
        } else {
            data = await response.text();
        }
        const result = { ...response, data };
        await this.runResponseInterceptors(result);
        return result.data;
    }

    /**
     * 执行请求拦截器
     *
     * @param url 请求地址
     * @param options 请求设置参数
     */
    private async runRequestInterceptors(url: string, options: RequestOptions) {
        for await (const interceptor of this.requestInterceptors) {
            await interceptor(url, options);
        }
    }

    /**
     * 执行响应拦截器
     *
     * @param responseData 响应数据对象
     */
    private async runResponseInterceptors(responseData: ResponseData) {
        for await (const interceptor of this.responseInterceptors) {
            const data = await interceptor(responseData);
            data && (responseData.data = data);
        }
    }

    /**
     * 地址参数合并
     *
     * @param url 地址
     * @param params 参数
     */
    private mergeURL(url: string, params: RequestParams) {
        const _url = new URL(url, 'http://localhost');
        for (const [key, value] of Object.entries(params)) {
            if (value instanceof Array) {
                value.forEach((item) => _url.searchParams.append(key, String(item)));
            } else {
                value && _url.searchParams.append(key, String(value));
            }
        }
        return url.startsWith('http') ? _url.href : _url.href.replace('http://localhost', '');
    }
}
