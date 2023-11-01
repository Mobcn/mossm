import { BaseDAO } from '../BaseDAO.js';
import { Model } from './model/ModelModel.js';

/**
 * Model数据访问
 *
 * @extends {BaseDAO<typeof Model>}
 */
class ModelDAO extends BaseDAO {}

const modelDAO = new ModelDAO(Model);
export { ModelDAO, modelDAO };
