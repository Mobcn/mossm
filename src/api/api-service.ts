import service from '@/utils/request.ts';

/**
 * 接口地址
 */
export const mossmApi = {
    /**
     * 获取所有接口
     */
    all: '/mossm/api/all',

    /**
     * 获取接口分页列表
     */
    list: '/mossm/api/list',

    /**
     * 添加接口
     */
    save: '/mossm/api/save',

    /**
     * 修改接口
     */
    update: '/mossm/api/update',

    /**
     * 删除接口
     */
    remove: '/mossm/api/remove'
};

/**
 * 接口服务
 */
const apiService = {
    /**
     * 获取所有标签
     */
    all: async (): Promise<API[]> => service.get(mossmApi.all),

    /**
     * 获取接口分页列表
     */
    list: async (params?: ListParams): Promise<{ list: API[]; total: number }> => {
        return service.get(mossmApi.list, params);
    },

    /**
     * 添加接口
     *
     * @param data 接口添加信息
     */
    save: async (data: SaveAPI): Promise<API> => service.post(mossmApi.save, data),

    /**
     * 修改接口
     *
     * @param data 接口修改信息
     */
    update: async (data: UpdateAPI): Promise<API> => service.post(mossmApi.update, data),

    /**
     * 删除接口
     *
     * @param _id 接口ID
     */
    remove: async (_id: string | string[]): Promise<API> => service.post(mossmApi.remove, { _id })
};

export default apiService;

/**
 * 获取接口分页列表参数
 */
type ListParams = {
    /** 模块 */
    module?: string;
    /** 模型 */
    model?: string;
    /** 页码 */
    page?: number;
    /** 每页数据条数 */
    limit?: number;
};

/**
 * 接口保存数据类型
 */
export type SaveAPI = {
    /** 模块 */
    module: string;
    /** 模型 */
    model: string;
    /** 路径 */
    path: string;
    /** 是否认证 */
    authorized: boolean;
    /** 请求方法 */
    method: string;
    /** 原始处理器 */
    raw_handler: string;
} & (
    | {
          /** 是否自定义 */
          customize: true;
      }
    | {
          /** 是否自定义 */
          customize: false;
          /** 类型 */
          type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
          /** 成功消息 */
          success_message: string;
          /** 错误消息 */
          error_message: string;
          /** 输入参数字段 */
          input_fields?: string;
          /** 输出数据字段 */
          output_fields?: string;
          /** 过滤条件 */
          where?: string;
      }
);

/**
 * 接口更新数据类型
 */
export type UpdateAPI = Omit<Partial<SaveAPI & { customize: false }>, 'customize'> & {
    /** ID */
    _id: string;
    /** 是否自定义 */
    customize?: boolean;
    /** 状态 */
    status?: boolean;
};

/**
 * 接口
 */
export type API = {
    /** ID */
    _id: string;
    /** 模块 */
    module: string;
    /** 模型 */
    model: string;
    /** 路径 */
    path: string;
    /** 是否认证 */
    authorized: boolean;
    /** 请求方法 */
    method: string;
    /** 原始处理器 */
    raw_handler: string;
    /** 处理器 */
    handler: string;
    /** 是否自定义 */
    customize: boolean;
    /** 类型 */
    type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    /** 成功消息 */
    success_message: string;
    /** 错误消息 */
    error_message: string;
    /** 状态 */
    status: boolean;
    /** 创建时间 */
    create_time: string;
    /** 更新时间 */
    update_time: string;
    /** 输入参数字段 */
    input_fields?: string;
    /** 输出数据字段 */
    output_fields?: string;
    /** 过滤条件 */
    where?: string;
};
