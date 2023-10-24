import VHandler, { Result } from '#handler';
import { apiService } from '#service/mossm/APIService.js';

/**
 * 获取所有接口
 */
export default VHandler.buildGETAndAuth(async () =>
    Result.success({ message: '获取接口成功!', data: await apiService.listAll() })
);
