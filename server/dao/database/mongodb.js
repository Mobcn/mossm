import mongoose from 'mongoose';
import ENV from '../../handler/env.js';

/** 数据库名称 */
const databaseName = 'mossm';

/** 数据库连接地址 */
let uri;

/** 连接计数 */
let count = 0;

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
     * @param {((mongo: typeof mongoose) => void) | boolean} callbackOrIsAdd 连接回调或是否增加连接数
     * @param {boolean} isAdd 是否增加连接数
     */
    connect: (callbackOrIsAdd = false, isAdd = false) => {
        const coi = typeof callbackOrIsAdd;
        const $isAdd = coi === 'boolean' ? callbackOrIsAdd : isAdd;
        $isAdd && ++count === 1 && mongoose.connect(uri || (uri = getURI()));
        coi === 'function' && callbackOrIsAdd(mongoose);
        return mongoose;
    },

    /**
     * 关闭数据库
     */
    disconnect: () => --count === 0 && mongoose.connection.close()
};

export default MongoDB;
