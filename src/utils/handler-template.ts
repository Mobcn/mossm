/**
 * 通用处理器模板
 *
 * @param params 参数项数组
 * @param mainString 主体逻辑字符串
 * @param successMessage 成功消息
 * @param errorMessage 失败消息
 */
export function commonHandlerTemplate(
    params: ParamItem[],
    mainString: string,
    successMessage: string,
    errorMessage: string
) {
    let comment = '/**\n * 处理器\n *\n * @param {Object} param0 请求参数\n';
    let paramObjectString = '{';
    if (params.length > 0) {
        paramObjectString += ' ';
        params.forEach((p, index) => {
            const type = p.type === 'Date' || p.type === 'Object' ? p.type : p.type.toLowerCase();
            const param = p.default ? `[param0.${p.name}=${p.default}]` : `param0.${p.name}`;
            comment += ` * @param {${type}} ${param} ${p.description || ''}\n`;
            index > 0 && (paramObjectString += ', ');
            paramObjectString += p.default ? `${p.name} = ${p.default}` : p.name;
        });
    }
    comment += ' */';
    paramObjectString += paramObjectString.length > 1 ? ' }' : '}';
    return `${comment}
async function handler(${paramObjectString}) {
    try {
        ${mainString}
        return Result.success({ message: '${successMessage}', data });
    } catch (error) {
        throw new Error('${errorMessage}');
    }
}
`;
}

/**
 * 查询处理器模板
 *
 * @param params 参数项数组
 * @param selectString 查询字符串
 * @param where 过滤条件
 * @param successMessage 成功消息
 * @param errorMessage 失败消息
 */
export function selectHandlerTemplate(
    params: ParamItem[],
    selectString: string,
    where: string,
    successMessage: string,
    errorMessage: string
) {
    params.push(
        { name: 'page', type: 'Number', description: '页码' },
        { name: 'limit', type: 'Number', default: '10', description: '每页数据条数' },
        { name: 'sort', type: 'Object', default: '{ create_time: -1 }', description: '排序' }
    );
    const mainString = `let data;
        if (page) {
            page = Number(page);
            const [list, total] = await Promise.all([
                Model.find(${where})
                    .select('${selectString}')
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort(sort)
                    .exec(),
                Model.count(${where})
            ]);
            data = { list, total };
        } else {
            data = await Model.find(${where}).select('${selectString}').sort(sort).exec();
        }`;
    return commonHandlerTemplate(params, mainString, successMessage, errorMessage);
}

/**
 * 添加处理器模板
 *
 * @param params 参数项数组
 * @param successMessage 成功消息
 * @param errorMessage 失败消息
 */
export function insertHandlerTemplate(params: ParamItem[], successMessage: string, errorMessage: string) {
    const dataObjectString = params.length > 0 ? `{ ${params.map((p) => p.name).join(', ')} }` : '{}';
    const mainString = `const insertModel = new Model(${dataObjectString});
        const data = await insertModel.save();`;
    return commonHandlerTemplate(params, mainString, successMessage, errorMessage);
}

/**
 * 更新处理器模板
 *
 * @param params 参数项数组
 * @param where 过滤条件
 * @param successMessage 成功消息
 * @param errorMessage 失败消息
 */
export function updateHandlerTemplate(
    params: ParamItem[],
    where: string,
    successMessage: string,
    errorMessage: string
) {
    const setObjectString = params.length > 0 ? `{ ${params.map((p) => p.name).join(', ')} }` : '{}';
    const mainString = `const data = await Model.updateMany(${where || '{}'}, { $set: ${setObjectString} });`;
    return commonHandlerTemplate(params, mainString, successMessage, errorMessage);
}

/**
 * 删除处理器模板
 *
 * @param params 参数项数组
 * @param successMessage 成功消息
 * @param errorMessage 失败消息
 */
export function deleteHandlerTemplate(params: ParamItem[], successMessage: string, errorMessage: string) {
    const filterObjectString = params.length > 0 ? `{ ${params.map((p) => p.name).join(', ')} }` : '{}';
    const mainString = `const data = await Model.deleteMany(${filterObjectString});`;
    return commonHandlerTemplate(params, mainString, successMessage, errorMessage);
}

/**
 * 参数项
 */
export type ParamItem = {
    /** 参数名称 */
    name: string;
    /** 参数类型 */
    type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Object' | '*';
    /** 参数默认值 */
    default?: string;
    /** 参数描述 */
    description?: string;
};
