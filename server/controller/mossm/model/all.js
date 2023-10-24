import VHandler, { Result } from '#handler';
import { modelService } from '#service/mossm/ModelService.js';

/**
 * 获取所有模型
 */
export default VHandler.buildGETAndAuth(async () =>
    Result.success({ message: '获取模型成功!', data: await modelService.listAll() })
);
