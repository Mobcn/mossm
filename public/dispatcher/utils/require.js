import { createRequire } from 'node:module';
import * as mongoose from '../plugins/bundled-mongoose.js';
import Result from './result.js';
import JWT from './jwt.js';

const _require = createRequire(import.meta.url);

const map = {
    mongoose: { ...mongoose, __esModule: true },
    utils: { Result, JWT, __esModule: true }
};

/**
 * @param {string} id
 */
export default function require(id) {
    if (id in map) {
        return map[id];
    }
    return _require(id);
}

/**
 * @param {Record<string, any>} customMap
 */
export function customRequire(customMap) {
    /**
     * @param {string} id
     */
    return function (id) {
        if (id in customMap) {
            return customMap[id];
        }
        return require(id);
    };
}
