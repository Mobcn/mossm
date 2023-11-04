import mongoose from 'mongoose';
import ENV from '../../handler/env.js';

/** 数据库名称 */
const databaseName = 'mossm';

/** 数据库连接地址 */
let uri;

/** @type {mongoose | undefined} */
let cache;
let count = 1;
/**
 * 获取数据库连接地址
 */
function getURI() {
    const MONGODB_URI = ENV.get('MONGODB_URI');
    if (!MONGODB_URI) {
        throw new Error('缺少环境变量`MONGODB_URI`');
    }
    let tmpURI = MONGODB_URI;
    let index = tmpURI.indexOf('?');
    const search = index !== -1 ? tmpURI.substring(index) : '';
    index = tmpURI.lastIndexOf('/');
    return tmpURI.substring(0, index + 1) + databaseName + search;
}

/**
 * MongoDB数据库工具
 */
const MongoDB = {
    /**
     * 打开数据库连接
     *
     * @param {(mongo: typeof mongoose) => void}  callback 连接回调
     */
    connect: async (callback, isAdd = false) => {
        if (!cache) {
            cache = await mongoose.connect(uri || (uri = getURI()));
        } else if (cache.connection.readyState !== cache.STATES.connected) {
            if (cache.connection.readyState === cache.STATES.disconnected) {
                cache.connection.openUri(uri || (uri = getURI()));
            }
            await new Promise((resolve) => cache.connection.once('connected', resolve));
        }
        callback && callback(cache);
        isAdd && count++;
        return cache;
    },

    /**
     * 关闭数据库
     */
    disconnect: () => {
        cache?.connection.close();
        return count;
    }
};

export default MongoDB;
