import { Buffer } from 'node:buffer';

/**
 * 生成随机字符串
 *
 * @param {number} [length=16] 字符串长度
 */
export function randomString(length = 16) {
    length < 16 && (length = 16);
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let prefix = '';
    for (let i = length - 8, n = charset.length; i > 0; --i) {
        prefix += charset.charAt(Math.floor(Math.random() * n));
    }
    const suffix = Buffer.from(Date.now().toString()).toString('base64').substring(0, 8);
    return prefix + suffix;
}
