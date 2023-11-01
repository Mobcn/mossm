import mongoose from 'mongoose';

/**
 * Module表
 */
const info = {
    model: "Module",
    table: "mossm_module",
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

/**
 * @typedef {import('../../BaseDAO').RawDocType<typeof Model>} Module
 */
