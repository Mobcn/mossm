<script setup lang="ts" generic="T extends Record<string, any>">
import type {
    FormInstance,
    FormItemProp,
    FormItemRule,
    FormValidateCallback,
    FormValidationResult
} from 'element-plus';
import type { Arrayable } from 'element-plus/es/utils/typescript.mjs';

/** 参数 */
const props = defineProps<MoFormProps<T>>();

/** 表单元素对象 */
const formRef = ref<FormInstance>();
/** 主键 */
const primaryKey = computed(() => props.primaryKey ?? '_id');
/** 表单数据对象 */
const formData = ref({}) as Ref<EditData<T>>;

// 是否为行内表单
const currentInline = computed(() => props.inline ?? false);
// 标签宽度
const currentLabelWidth = computed(() => props.labelWidth);
// 校验规则
const currentRules = computed(() => props.rules);
// 组件大小
const currentSize = computed(() => props.size);
// 表单组件数组
const currentComponents = computed(() => props.components ?? []);

/** 字符表单数据对象 */
const stringFormData = computed<EditData<T>>(() => {
    const data: any = {};
    for (const key in formData.value) {
        const value: any = formData.value[key];
        if (value != null) {
            data[key] = convertToString(value);
        }
    }
    return data;
});

// 自定义监听数据变化方法
props.watch?.forEach((watchFun) => watchEffect(() => watchFun(formData)));

// 监听数据
watchEffect(() => {
    const data: any = { [primaryKey.value]: props.data?.[primaryKey.value] ?? '' };
    if (props.data) {
        props.components.forEach((component) => {
            let value: any = props.data![component.name];
            if (
                (component.type === 'select' && component.multiple) ||
                (component.type === 'time' && component.isRange)
            ) {
                data[component.name] = typeof value === 'string' ? (value ? value.split(',') : []) : value;
            } else if (component.type === 'switch') {
                data[component.name] = typeof value === 'string' ? value === 'true' : value;
            } else {
                data[component.name] = convertToString(value);
            }
        });
    } else if (props.initData) {
        const initData = typeof props.initData === 'function' ? props.initData() : props.initData;
        props.components.forEach((component) => {
            let value: any = initData[component.name];
            if ('multiple' in component && component.multiple) {
                data[component.name] = typeof value === 'string' ? value.split(',') : value;
            } else {
                data[component.name] = convertToString(value);
            }
        });
    } else {
        props.components.forEach((component) => (data[component.name] = ''));
    }
    formData.value = data;
});

/**
 * 加载选择项
 *
 * @param options 选项数据
 */
const loadOptions = (() => {
    const optionsCache = new Map<SelectOptionsLoad<T>, SelectItem[]>();
    return (options: SelectItem[] | SelectOptionsLoad<T>) => {
        if (typeof options !== 'function') {
            return options;
        }
        if (!optionsCache.has(options)) {
            const reactiveOptions = reactive<SelectItem[]>([]);
            const isContinue = { value: true };
            optionsCache.set(options, reactiveOptions);
            watchEffect(async () => {
                if (reactiveOptions.length <= 0 || isContinue.value) {
                    const res = options(formData, isContinue);
                    const list = await Promise.resolve(res);
                    reactiveOptions.splice(0);
                    reactiveOptions.push(...list);
                }
            });
        }
        return optionsCache.get(options)!;
    };
})();

/**
 * 加载参数
 *
 * @param params 参数函数
 */
const loadParams = (params: (editDataRef: Ref<EditData<T>>) => any) => params(formData);

/**
 * 获取组件宽度样式
 */
function getWidthStyle(width: string | number) {
    return typeof width === 'number' ? `${width}px` : width;
}

/**
 * 转换字符串
 */
function convertToString(value: any): string {
    if (value == null) {
        return '';
    }
    if (value instanceof Array) {
        return value.map(convertToString).join(',');
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value.toString();
}

// 组件导出方法
defineExpose({
    /**
     * 获取主键名
     */
    getPrimaryKey: () => primaryKey.value,

    /**
     * 获取表单数据
     */
    getFormData: () => stringFormData.value,

    /**
     * 表单校验
     *
     * @param callback 回调函数
     */
    validate: (callback?: FormValidateCallback) => formRef.value!.validate(callback),

    /**
     * 清除表单校验
     *
     * @param props 清除的表单项
     */
    clearValidate: (props?: Arrayable<FormItemProp>) => formRef.value!.clearValidate(props)
});
</script>
<script lang="ts">
/** 编辑数据 */
export type EditData<T> = { [key in keyof T & string]: string };

/** 选择项 */
type SelectItem = {
    /** 值 */
    value: string | number;
    /** 显示 */
    label: string;
};

/**
 * 选择项加载函数
 */
export type SelectOptionsLoad<T extends Record<string, any>> = (
    editDataRef: Ref<EditData<T>>,
    isContinue: { value: boolean }
) => SelectItem[] | Promise<SelectItem[]>;

/**
 * 表单组件项
 */
export type MoFormComponent<T extends Record<string, any>> = {
    /** 组件名称 */
    name: keyof T & string;
    /** 组件标签 */
    label?: string;
    /** 组件大小 */
    size?: 'default' | 'small' | 'large';
    /** 组件宽度 */
    width?: string | number;
    /** 占位内容 */
    placeholder?: string;
    /** 是否可视 */
    visible?: (editData: EditData<T>) => boolean;
    /** 是否禁用 */
    disabled?: (editData: EditData<T>) => boolean;
} & (
    | {
          /** 组件类型 */
          type: 'input';
      }
    | {
          /** 组件类型 */
          type: 'textarea';
          /** 文本域高度 */
          rows: number;
      }
    | {
          /** 组件类型 */
          type: 'select';
          /** 选择项 */
          options: SelectItem[] | SelectOptionsLoad<T>;
          /** 是否多选 */
          multiple?: boolean;
      }
    | {
          /** 组件类型 */
          type: 'switch';
          /** 打开文本 */
          activeText?: string;
          /** 关闭文本 */
          inactiveText?: string;
      }
    | {
          /** 组件类型 */
          type: 'time';
          /** 是否为时间范围 */
          isRange?: boolean;
          /** 范围选择时开始的占位内容 */
          startPlaceholder?: string;
          /** 范围选择时结束的占位内容 */
          endPlaceholder?: string;
      }
    | {
          /** 组件类型 */
          type: 'year' | 'month' | 'date' | 'datetime' | 'week';
          /** 显示在输入框中的格式 */
          format?: string;
      }
    | {
          /** 组件类型 */
          type: 'custom';
          /** 自定义组件 */
          component: Component;
          /** 高度 */
          height?: number | string;
          /** 参数 */
          params?: (editDataRef: Ref<EditData<T>>) => any;
      }
);

/**
 * 表单参数
 */
export type MoFormProps<T extends Record<string, any>> = {
    /** 表单组件数组 */
    components: MoFormComponent<T>[];
    /** 表单数据 */
    data?: T;
    /** 主键名，默认为`_id` */
    primaryKey?: keyof T & string;
    /** 是否为行内表单 */
    inline?: boolean;
    /** 校验规则 */
    rules?: { [key in keyof T & string]?: FormItemRule[] };
    /** 组件大小 */
    size?: 'default' | 'small' | 'large';
    /** 标签宽度 */
    labelWidth?: number | string;
    /** 数据监听方法数组 */
    watch?: ((editDataRef: Ref<EditData<T>>) => void)[];
    /** 初始化数据 */
    initData?: { [P in keyof T]?: T[P] } | (() => { [P in keyof T]?: T[P] });
};

/**
 * MoForm组件实例
 */
export type MoFormInstance<T> = ComponentPublicInstance<
    {},
    {
        /**
         * 获取主键名
         */
        getPrimaryKey: () => (keyof T & string) | '_id';

        /**
         * 获取表单数据
         */
        getFormData: () => EditData<T>;

        /**
         * 表单校验
         *
         * @param callback 回调函数
         */
        validate: (callback?: FormValidateCallback) => FormValidationResult;

        /**
         * 清除表单校验
         *
         * @param props 清除的表单项
         */
        clearValidate: (props?: Arrayable<FormItemProp>) => void;
    }
>;
</script>

<template>
    <el-form
        ref="formRef"
        :model="formData"
        :inline="currentInline"
        :rules="currentRules"
        :size="currentSize"
        :label-width="currentLabelWidth"
    >
        <template v-for="component in currentComponents">
            <el-form-item
                v-if="component.name !== primaryKey"
                v-show="!component.visible || component.visible(stringFormData)"
                :prop="component.name"
                :label="component.label"
            >
                <el-input
                    v-if="component.type === 'input'"
                    v-model="(formData[component.name] as string)"
                    :size="component.size"
                    :style="component.width ? `width: ${getWidthStyle(component.width)}` : ''"
                    :placeholder="component.placeholder"
                    :disabled="component.disabled && component.disabled(stringFormData)"
                />
                <el-input
                    v-else-if="component.type === 'textarea'"
                    v-model="(formData[component.name] as string)"
                    type="textarea"
                    :rows="component.rows"
                    :size="component.size"
                    :style="component.width ? `width: ${getWidthStyle(component.width)}` : ''"
                    :placeholder="component.placeholder"
                    :disabled="component.disabled && component.disabled(stringFormData)"
                />
                <el-select
                    v-else-if="component.type === 'select'"
                    v-model="formData[component.name]"
                    :multiple="component.multiple"
                    :size="component.size"
                    :style="component.width ? `width: ${getWidthStyle(component.width)}` : ''"
                    :placeholder="component.placeholder"
                    :loading="loadOptions(component.options).length <= 0"
                    clearable
                    :disabled="component.disabled && component.disabled(stringFormData)"
                >
                    <el-option
                        v-for="(item, index) in loadOptions(component.options)"
                        :key="index"
                        :value="item.value"
                        :label="item.label"
                    ></el-option>
                </el-select>
                <el-switch
                    v-else-if="component.type === 'switch'"
                    v-model="formData[component.name]"
                    :active-text="component.activeText"
                    :inactive-text="component.inactiveText"
                    :size="component.size"
                    :disabled="component.disabled && component.disabled(stringFormData)"
                />
                <el-time-picker
                    v-else-if="component.type === 'time'"
                    v-model="(formData[component.name] as string | [string, string])"
                    :is-range="component.isRange"
                    :size="component.size"
                    :style="component.width ? `width: ${getWidthStyle(component.width)}` : ''"
                    :placeholder="component.placeholder"
                    :disabled="component.disabled && component.disabled(stringFormData)"
                />
                <el-date-picker
                    v-else-if="
                        component.type === 'year' ||
                        component.type === 'month' ||
                        component.type === 'date' ||
                        component.type === 'datetime' ||
                        component.type === 'week'
                    "
                    v-model="(formData[component.name] as string)"
                    :type="component.type"
                    :format="component.format"
                    :size="component.size"
                    :style="component.width ? `width: ${getWidthStyle(component.width)}` : ''"
                    :placeholder="component.placeholder"
                    :disabled="component.disabled && component.disabled(stringFormData)"
                />
                <component
                    v-else-if="component.type === 'custom'"
                    :is="component.component"
                    v-model="formData[component.name]"
                    :params="component.params && loadParams(component.params)"
                    :size="component.size"
                    :width="component.width"
                    :height="component.height"
                    :placeholder="component.placeholder"
                    :disabled="component.disabled && component.disabled(stringFormData)"
                />
            </el-form-item>
        </template>
        <el-form-item v-if="$slots.default">
            <slot></slot>
        </el-form-item>
    </el-form>
</template>
