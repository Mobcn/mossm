/**
 * 导入文件文本
 *
 * @param filePath 文件路径
 */
export async function loadFileText(filePath: string) {
    const res = await fetch(filePath);
    return res.text();
}

/**
 * 导入文件JSON
 *
 * @param filePath 文件路径
 */
export async function loadFileJSON(filePath: string) {
    const res = await fetch(filePath);
    return res.json();
}
