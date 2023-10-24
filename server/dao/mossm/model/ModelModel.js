import mongoose, { Schema } from 'mongoose';

/**
 * Model表
 */
const info = {
    model: 'Model',
    table: 'mossm_model',
    property: {
        module: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        table: {
            type: String,
            required: true,
            trim: true
        },
        property: {
            type: String,
            required: true,
            trim: true
        },
        create_time: {
            type: Date,
            default: Date.now
        },
        update_time: {
            type: Date,
            default: Date.now
        }
    }
};

export const Model = mongoose.model(info.model, new Schema(info.property), info.table);

/**
 * @typedef {import('#dao/BaseDAO').RawDocType<typeof Model>} Model
 */
