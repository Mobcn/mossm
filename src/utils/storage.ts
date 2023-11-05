import localforage from 'localforage';

// 版本比较
(async () => {
    const version = document.getElementById('version')?.textContent?.trim() || '0.0.0';
    const oldVersion = (await localforage.getItem<string>('version')) || '0.0.0';
    if (version !== oldVersion) {
        await localforage.clear();
        await localforage.setItem('version', version);
    }
})();

/**
 * 转换方法
 */
type ConvertMethod = 'text' | 'json' | 'blob' | 'arrayBuffer';

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
    set: async <T = string>(key: string, value: any) => localforage.setItem<T>(key, value),

    /**
     * 获取键对应数据
     *
     * @param key 键
     * @returns 值
     */
    get: async <T = string>(key: string) => localforage.getItem<T>(key),

    /**
     * 从本地或远程获取键对应数据
     *
     * @param key 键
     * @param url 远程请求地址
     * @param method 转换方法
     * @returns 值
     */
    getWithURL: async <T = string>(key: string, url: string, method: ConvertMethod = 'text') => {
        let value = await localforage.getItem<T>(key);
        if (value === null) {
            const res = await fetch(url);
            const data = await res[method]();
            value = data as Awaited<T>;
            await localforage.setItem(key, value);
        }
        return value;
    },

    /**
     * 删除键对应数据
     *
     * @param key
     * @returns
     */
    remove: async (key: string) => localforage.removeItem(key)
};
