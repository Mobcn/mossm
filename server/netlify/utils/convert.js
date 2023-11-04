/** @typedef {import("../edge-functions/index").Context} Context 请求上下文 */

/**
 * 创建请求头对象
 *
 * @param {Request} request 请求对象
 * @returns {Record<string, string>}
 */
function createHeaders(request) {
    const headers = {};
    request.headers.forEach((value, key) => (headers[key] = value));
    return headers;
}

/**
 * 创建请求栏参数对象
 *
 * @param {URLSearchParams} searchParams 请求栏参数
 * @returns {Record<string, string | string[]>}
 */
function createQuery(searchParams) {
    const query = {};
    Array.from(searchParams.entries()).forEach(([key, value]) => {
        const type = typeof query[key];
        if (type === 'undefined') {
            query[key] = value;
        } else if (type === 'string') {
            query[key] = [query[key], value];
        } else {
            query[key].push(value);
        }
    });
    return query;
}

/**
 * 创建请求体对象
 *
 * @param {Request} request 请求对象
 */
async function createBody(request) {
    const contentType = request.headers.get('Content-Type')?.toLowerCase() || '';
    if (contentType.startsWith('application/json')) {
        try {
            return await request.json();
        } catch (_err) {}
    } else if (contentType.startsWith('application/x-www-form-urlencoded')) {
        try {
            const formData = await request.formData();
            const body = {};
            formData.forEach((value, key) => {
                const type = typeof body[key];
                if (type === 'undefined') {
                    body[key] = value;
                } else if (!(type instanceof Array)) {
                    body[key] = [body[key], value];
                } else {
                    body[key].push(value);
                }
            });
            return body;
        } catch (_err) {}
    }
    return request.body;
}

/**
 * 创建cookie对象
 *
 * @param {Context} context 请求上下文
 * @returns {Record<string, string>}
 */
function createCookies(context) {
    return new Proxy(
        {},
        {
            set: function (_target, key, newValue) {
                context.cookies.set(key, newValue);
            },
            get: function (_target, key) {
                return context.cookies.get(key);
            }
        }
    );
}

/**
 * 创建Vercel请求对象
 *
 * @param {Request} request 请求对象
 * @param {Context} context 请求上下文
 */
async function createVercelRequest(request, context) {
    const { search, pathname, searchParams } = new URL(request.url);
    return new Proxy(
        {
            /** 请求地址 */
            url: pathname + search,

            /** 请求头 */
            headers: createHeaders(request),

            /** 请求栏参数 */
            query: createQuery(searchParams),

            /** 请求体 */
            body: await createBody(request),

            /** Cookie */
            cookies: createCookies(context)
        },
        {
            get: function (target, key) {
                return (key in target ? target : request)[key];
            }
        }
    );
}

/**
 * 创建Vercel响应对象
 *
 * @param {(value: any) => void} resolve 返回方法
 */
function createVercelResponse(resolve) {
    let _status = 200;
    let _headers = new Headers();
    return {
        /**
         * 设置响应头
         *
         * @param {string} name 名称
         * @param {string} value 值
         */
        setHeader: (name, value) => _headers.set(name, value),

        /**
         * 设置响应状态值
         *
         * @param {number} status 状态值
         */
        status: function (status) {
            _status = status;
            return this;
        },

        /**
         * 发送响应
         *
         * @param {BodyInit} body 响应体
         */
        send: (body) => {
            resolve(new Response(body, { status: _status, headers: _headers }));
        },

        /**
         * 响应JSON
         *
         * @param {Record<string, any> | Array<any>} body 响应JSON对象
         */
        json: function (body) {
            body = JSON.stringify(body);
            this.setHeader('Content-Type', 'application/json');
            resolve(new Response(body, { status: _status, headers: _headers }));
        },

        /**
         * 结束响应
         *
         * @param {string} chunk 响应消息
         */
        end: (chunk) => {
            resolve(new Response(chunk, { status: _status, headers: _headers }));
        },

        /**
         * 重定向
         *
         * @param {number | string} statusOrUrl 重定向状态值或地址
         * @param {string} url 重定向地址
         */
        redirect: (statusOrUrl, url) => {
            if (typeof statusOrUrl === 'number') {
                if (!url) {
                    throw new Error('redirect url is missing');
                }
                resolve(Response.redirect(url, statusOrUrl));
            } else {
                resolve(Response.redirect(statusOrUrl));
            }
        }
    };
}

export { createVercelRequest, createVercelResponse };
