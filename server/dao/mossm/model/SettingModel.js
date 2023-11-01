import mongoose from 'mongoose';

/**
 * Setting表
 */
const info = {
    model: "Setting",
    table: "mossm_setting",
    property: {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        value: {
            type: String,
            required: true
        }
    }
};

export const Model = mongoose.model(info.model, new mongoose.Schema(info.property), info.table);

/**
 * @typedef {import('../../BaseDAO').RawDocType<typeof Model>} Setting
 */
