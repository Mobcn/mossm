import dispatcher from '../dispatcher/dispatcher.js';

/**
 * @param {*} request 请求对象
 * @param {*} response 响应对象
 */
export default function handler(request, response) {
    dispatcher(request, response);
}
