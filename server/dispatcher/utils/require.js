import { createRequire } from 'node:module';
import * as mongoose from '../plugins/bundled-mongoose.js';

const _require = createRequire(import.meta.url);

const map = {
    mongoose: { ...mongoose, __esModule: true }
};

export default function require(id) {
    return map[id] || _require(id);
}
