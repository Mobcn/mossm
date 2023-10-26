/**
 * 封装storage
 */
export default {
    /**
     * 存储数据
     *
     * @param key 键
     * @param value 值
     */
    set: (key: string, value: any) => {
        if (typeof value === 'string') {
            localStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

    /**
     * 获取键对应数据
     *
     * @param key 键
     * @returns 值
     */
    get: (key: string) => localStorage.getItem(key),

    /**
     * 获取键对应对象
     *
     * @param key
     * @returns 值
     */
    getObject: (key: string) => {
        const value = localStorage.getItem(key);
        if (value && value !== 'undefined' && value !== 'null') {
            return JSON.parse(value);
        }
        return value;
    },

    /**
     * 删除键对应数据
     *
     * @param key
     * @returns
     */
    remove: (key: string) => localStorage.removeItem(key)
};
