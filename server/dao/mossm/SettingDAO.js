import { BaseDAO } from '../BaseDAO.js';
import { Model } from './model/SettingModel.js';

/**
 * Setting数据访问
 *
 * @extends {BaseDAO<typeof Model>}
 */
class SettingDAO extends BaseDAO {}

const settingDAO = new SettingDAO(Model);
export { SettingDAO, settingDAO };
