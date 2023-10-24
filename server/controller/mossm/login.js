import VHandler, { JWT, Result } from '#handler';
import { settingService } from '#service/mossm/SettingService.js';

/**
 * 登录
 */
export default VHandler.buildPOST(
    /**
     * @param {Object} param0 请求参数
     * @param {string} param0.username 用户名
     * @param {string} param0.password 密码
     * @param {import('#handler').VercelRequest} request
     */
    async ({ username, password }, request) => {
        let resultToken;
        const authorization = request.headers['authorization'];
        if (authorization?.startsWith('Bearer ')) {
            const token = authorization.replace('Bearer ', '');
            try {
                JWT.verify(token);
                resultToken = token;
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    const expiredTime = Date.now() - error.expiredAt.getTime();
                    // 过期时间小于7天则刷新token
                    if (expiredTime < 7 * 24 * 60 * 60 * 1000) {
                        resultToken = JWT.sign(JWT.verify(token, true));
                    }
                }
            }
        }
        if (!resultToken) {
            if (!username) {
                throw new Error('用户名不能为空!');
            }
            if (!password) {
                throw new Error('密码不能为空!');
            }
            const name = await settingService.getSetting('username');
            // 初次使用设置用户名和密码
            if (name === null) {
                await Promise.all([
                    settingService.setSetting('username', username),
                    settingService.setSetting('password', password)
                ]);
            }
            const pass = await settingService.getSetting('password');
            if (username !== name || password !== pass) {
                throw new Error('用户名或密码错误!');
            }
            if (!process.env.JWT_SECRET_KEY) {
                throw new Error('缺少环境变量`JWT_SECRET_KEY`');
            }
            resultToken = JWT.sign({}, process.env.JWT_SECRET_KEY);
        }
        return Result.success({ message: '登录成功!', data: { token: resultToken } });
    }
);
