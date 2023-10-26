import service from '@/utils/request.ts';

/**
 * 模块接口地址
 */
export const moduleApi = {
    /**
     * 获取所有模块
     */
    all: '/mossm/module/all'
};

/**
 * 模块接口服务
 */
const moduleService = {
    /**
     * 获取所有标签
     */
    all: async (): Promise<string[]> => service.get(moduleApi.all)
};

export default moduleService;
