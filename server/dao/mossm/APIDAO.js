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
            this.Model.aggregate()
                .match(filter)
                .sort({ create_time: -1 })
                .group({
                    _id: { module: '$module', model: '$model' },
                    records: { $push: '$$ROOT' }
                })
                .unwind('records')
                .project({
                    records: 1,
                    module: '$records.module',
                    model: '$records.model',
                    path: '$records.path',
                    method: '$records.method',
                    authorized: '$records.authorized',
                    customize: '$records.customize',
                    type: '$records.type',
                    success_message: '$records.success_message',
                    error_message: '$records.error_message',
                    handler: '$records.handler',
                    status: '$records.status',
                    create_time: '$records.create_time',
                    update_time: '$records.update_time'
                })
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
