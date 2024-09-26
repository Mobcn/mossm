import jsonwebtoken from '../plugins/bundled-jsonwebtoken.js';

/**
 * JWT工具
 */
const JWT = {
    /**
     * JWT签名
     *
     * @param {Record<string, any>} data token数据
     * @param {string} secretKey 密钥
     * @param {string | number} [expiresIn='1h'] 过期时间
     */
    sign: (data, secretKey, expiresIn = '1h') => {
        if (!secretKey) {
            throw new Error('缺少`secretKey`!');
        }
        return jsonwebtoken.sign(data || {}, secretKey, { expiresIn });
    },

    /**
     * JWT校验
     *
     * @param {string} token token
     * @param {string} secretKey 密钥
     * @param {boolean} [ignoreExpiration] 是否忽略过期
     */
    verify: (token, secretKey, ignoreExpiration) => {
        if (!secretKey) {
            throw new Error('缺少`secretKey`!');
        }
        const data = jsonwebtoken.verify(token, secretKey, { ignoreExpiration });
        if (ignoreExpiration) {
            delete data['iat'];
            delete data['exp'];
        }
        return data;
    }
};

export default JWT;
