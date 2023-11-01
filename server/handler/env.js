/**
 * 环境变量
 */
const ENV = {
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
