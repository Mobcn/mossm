import { BaseDAO } from '#dao/BaseDAO.js';
import { Model } from '#dao/mossm/model/SettingModel.js';

/**
 * Setting数据访问
 *
 * @extends {BaseDAO<typeof Model>}
 */
class SettingDAO extends BaseDAO {}

const settingDAO = new SettingDAO(Model);
export { SettingDAO, settingDAO };
