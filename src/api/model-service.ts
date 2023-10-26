import service from '@/utils/request.ts';

/**
 * 模型接口地址
 */
export const modelApi = {
    /**
     * 获取所有模型
     */
    all: '/mossm/model/all',

    /**
     * 添加模型
     */
    save: '/mossm/model/save',

    /**
     * 修改模型
     */
    update: '/mossm/model/update',

    /**
     * 删除模型
     */
    remove: '/mossm/model/remove'
};

/**
 * 模型接口服务
 */
const modelService = {
    /**
     * 获取所有标签
     */
    all: async (module?: string): Promise<Model[]> => {
        const params = module ? { module } : undefined;
        return service.get(modelApi.all, params);
    },

    /**
     * 添加模型
     */
    save: async (saveData: SaveModel): Promise<Model> => service.post(modelApi.save, saveData),

    /**
     * 修改模型
     */
    update: async (updateData: UpdateModel): Promise<Model> => service.post(modelApi.update, updateData),

    /**
     * 删除模型
     */
    remove: async (_id: string | string[]): Promise<boolean> => service.post(modelApi.remove, { _id })
};

export default modelService;

/**
 * 添加模型数据类型
 */
export type SaveModel = Omit<Model, '_id'>;

/**
 * 修改模型数据类型
 */
export type UpdateModel = Partial<SaveModel> & { _id: string };

/**
 * 模型
 */
export type Model = {
    _id: string;
    module: string;
    name: string;
    table: string;
    property: string;
};
