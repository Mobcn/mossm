import DB from '../../dao/database/db.js';

/**
 * @param {import('../../handler/index').VercelRequest} request
 * @param {import('../../handler/index').VercelResponse} response
 */
export default function handler(request, response) {
    response.setHeader('Content-Type', 'text/html;charset=UTF-8');
    let start;
    new Promise((resolve, reject) => {
        let flag = false;
        setTimeout(() => !flag && reject(new Error('连接超时!')), 5000);
        start = Date.now();
        DB.connect(async () => resolve((flag = true))).catch((error) => reject(error));
    })
        .then((data) => response.status(200).end(`连接成功！${Date.now() - start}ms`))
        .catch((error) => response.status(500).end(`连接失败: ${error.message}`));
}
