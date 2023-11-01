import VHandler, { Result } from '../../../handler/index.js';
import { moduleService } from '../../../service/mossm/ModuleService.js';

/**
 * 获取所有模块
 */
export default VHandler.buildGETAndAuth(async () =>
    Result.success({ message: '获取模块成功!', data: await moduleService.listName() })
);
