import VHandler, { Result } from '../../utils/handler.js';
import { Model as APIModel } from '../../model/APIModel.js';

/**
 * 获取接口分页列表
 */
export default VHandler.buildGETAndAuth(
    /**
     * @param {Object} param0 请求参数
     * @param {string} [param0.module] 模块
     * @param {string} [param0.model] 模型
     * @param {string} [param0.page=1] 页码
     * @param {string} [param0.limit=10] 每页数据条数
     */
    async ({ module, model, page = 1, limit = 10 }) => {
        page && (page = Number(page));
        limit && (limit = Number(limit));
        const filter = {};
        if (module) {
            filter.module = module;
            model && (filter.model = model);
        }
        const [list, total] = await Promise.all([
            APIModel.aggregate()
                .match(filter)
                .sort({ module: 1, model: 1, create_time: -1 })
                .group({
                    _id: { module: '$module', model: '$model' },
                    max_time: { $max: '$create_time' },
                    records: { $push: '$$ROOT' }
                })
                .sort({ max_time: -1 })
                .unwind('records')
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            APIModel.count(filter)
        ]);
        const data = { list: list.map((item) => item.records), total };
        return Result.success({ message: '获取接口分页列表成功!', data });
    }
);
