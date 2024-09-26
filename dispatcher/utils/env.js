/**
 * 环境变量
 */
const ENV = {
    /** 令牌密匙 */
    JWT_SECRET_KEY: 'JWT_SECRET_KEY',

    /** MongoDB 连接地址 */
    MONGODB_URI: 'MONGODB_URI',

    /** 数据库名 */
    DATABASE_NAME: 'DATABASE_NAME',

    /**
     * 获取环境变量
     *
     * @param {string} key
     * @returns {string | undefined | never}
     */
    get: (key) => {
        if (typeof process !== 'undefined') {
            return process.env[key];
        }
        if (typeof Netlify !== 'undefined') {
            return Netlify.env.get(key);
        }
        throw new Error('no env!');
    }
};

export default ENV;
