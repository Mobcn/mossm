import mongoose from '../plugins/bundled-mongoose.js';

/**
 * Module表
 */
const info = {
    model: 'Module',
    table: 'mossm_module',
    property: {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        secretKey: {
            type: String,
            required: true,
            trim: true
        }
    }
};

export const Model = mongoose.model(info.model, new mongoose.Schema(info.property), info.table);
