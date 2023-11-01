import { BaseDAO } from '../BaseDAO.js';
import { Model } from './model/APIModel.js';

/**
 * API数据访问
 *
 * @extends {BaseDAO<typeof Model>}
 */
class APIDAO extends BaseDAO {}

const apiDAO = new APIDAO(Model);
export { APIDAO, apiDAO };
