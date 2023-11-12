import { BaseDAO } from '../BaseDAO.js';
import { Model } from './model/APIModel.js';

/**
 * API数据访问
 *
 * @extends {BaseDAO<typeof Model>}
 */
class APIDAO extends BaseDAO {
    /**
     * 获取满足条件的分页数据
     *
     * @param {Object} param0 参数
     * @param {import('mongoose').FilterQuery<import('../BaseDAO').RawDocType<typeof Model>>} [param0.filter={}] 条件
     * @param {number} [param0.page=1] 页数
     * @param {number} [param0.limit=10] 每页数据条数
     */
    async page({ filter = {}, page = 1, limit = 10 }) {
        const [list, total] = await Promise.all([
            this.Model.aggregate([
                {
                    $sort: {
                        module: 1,
                        model: 1,
                        path: 1
                    }
                },
                {
                    $group: {
                        _id: { module: '$module' },
                        max_time: { $max: '$create_time' },
                        records: { $push: '$$ROOT' }
                    }
                },
                {
                    $sort: {
                        max_time: -1
                    }
                },
                {
                    $group: {
                        _id: null,
                        records: { $push: '$records' }
                    }
                },
                {
                    $unwind: '$records'
                }
            ])
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.Model.count(filter)
        ]);
        return { list, total };
    }
}

const apiDAO = new APIDAO(Model);
export { APIDAO, apiDAO };
