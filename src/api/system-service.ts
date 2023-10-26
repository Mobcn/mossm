import service from '@/utils/request.ts';

/**
 * 系统接口地址
 */
export const systemApi = {
    /**
     * 登录
     */
    login: '/mossm/login',

    /**
     * 修改系统设置
     */
    chsetting: '/mossm/chsetting'
};

/**
 * 系统接口服务
 */
const systemService = {
    /**
     * 登录
     */
    login: async (username: string, password: string): Promise<{ token: string }> => {
        return service.post(systemApi.login, { username, password });
    },

    /**
     * 修改系统设置
     */
    chsetting: async (params: Record<string, string>) => {
        return service.post(systemApi.chsetting, params);
    }
};

export default systemService;
