import { BaseService } from '../BaseService.js';
import { settingDAO } from '../../dao/mossm/SettingDAO.js';

/** @typedef {import('../../dao/mossm/SettingDAO').SettingDAO} DAO */
/** @typedef {import('../BaseService').ExtractModel<DAO>} Model */

/**
 * Setting服务
 *
 * @extends {BaseService<DAO, Model>}
 */
class SettingService extends BaseService {
    /**
     * 获取设置值
     *
     * @param {string} key 键
     * @returns {string | null}
     */
    async getSetting(key) {
        const setting = await this.DAO.get({ key });
        if (!setting) {
            return null;
        }
        return setting.value;
    }

    /**
     * 保存设置
     *
     * @param {string} key 键
     * @param {string} value 值
     */
    async setSetting(key, value) {
        await this.DAO.insert({ key, value });
    }
}

const settingService = new SettingService(settingDAO);
export { SettingService, settingService };
