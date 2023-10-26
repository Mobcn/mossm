/**
 * 代码文本转为表字段属性对象
 *
 * @param text 代码文本
 */
export function codeText2Property(text: string) {
    const property = eval('const property = ' + text + ';property;');
    Object.entries(property as { [x: string]: { type: FieldType; default: Function } | FieldType }).forEach(
        ([name, prop]) => {
            if (typeof prop === 'function') {
                if (prop === String) {
                    property[name] = { type: 'String' };
                } else if (prop === Number) {
                    property[name] = { type: 'Number' };
                } else if (prop === Date) {
                    property[name] = { type: 'Date' };
                } else if (prop === Boolean) {
                    property[name] = { type: 'Boolean' };
                }
            } else {
                const replace = {} as any;
                if (prop.type === String) {
                    replace.type = 'String';
                } else if (prop.type === Number) {
                    replace.type = 'Number';
                } else if (prop.type === Date) {
                    replace.type = 'Date';
                    if (prop.default === Date.now) {
                        replace.default = 'Date.now';
                    }
                } else if (prop.type === Boolean) {
                    replace.type = 'Boolean';
                }
                property[name] = Object.assign(prop, replace);
            }
        }
    );
    return property as Record<string, TableProperty>;
}

/**
 * 表字段属性对象转为代码文本
 */
export const property2codeText = (() => {
    const quoteMark = '#<#__QUOTE__#>#';
    const stringMark = '#<#__String__#>#';
    /**
     * @param property 表字段属性对象
     */
    return function (property: Record<string, TableProperty>) {
        const newProperty = {} as any;
        Object.entries(property).forEach(([name, props]) => {
            if (Object.keys(props).length === 1) {
                newProperty[name] = props.type;
                return;
            }
            const replace = {} as TableProperty;
            if (props.type === 'String' && props.default != null) {
                replace.default = stringMark + props.default.replace(/"/g, quoteMark) + stringMark;
            } else if (props.type === 'Date') {
                replace.min = props.min ? stringMark + props.min + stringMark : undefined;
                replace.max = props.max ? stringMark + props.max + stringMark : undefined;
            }
            newProperty[name] = Object.assign({}, props, replace);
        });
        let text = JSON.stringify(newProperty, null, 4);
        text = text.replace(/"/g, '');
        text = text.replace(new RegExp(quoteMark, 'g'), '\\"');
        text = text.replace(new RegExp(stringMark, 'g'), '"');
        return text;
    };
})();

/** 表字段类型 */
export type FieldType = StringConstructor | NumberConstructor | DateConstructor | BooleanConstructor;
/** 表字段类型字符串 */
export type FieldTypeStr = 'String' | 'Number' | 'Date' | 'Boolean';

/**
 * 表字段属性
 */
export type TableProperty = {
    /** 表字段类型 */
    type: FieldTypeStr;
    /** 默认值 */
    default?: any;
    /** 是否非空 */
    required?: boolean;
    /** 唯一索引 */
    unique?: string | number;
    /** 是否全部转为小写（type为String时生效） */
    lowercase?: boolean;
    /** 是否全部转为大写（type为String时生效） */
    uppercase?: boolean;
    /** 是否去掉前后空格（type为String时生效） */
    trim?: boolean;
    /** 最短长度（type为String时生效） */
    minlength?: number;
    /** 最长长度（type为String时生效） */
    maxlength?: number;
    /** 最小值（type为Number或Date时生效） */
    min?: string | number;
    /** 最大值（type为Number或Date时生效） */
    max?: string | number;
};

/**
 * 表信息
 */
export type TableInfo = {
    /** ID */
    _id?: string;
    /** 所属模块 */
    module: string;
    /** 模型名 */
    model: string;
    /** 表名 */
    table: string;
    /** 表字段属性 */
    property: Record<string, TableProperty>;
};
