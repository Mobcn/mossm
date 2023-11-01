<script setup lang="ts" generic="T extends Record<string, any>">
import type { FormInstance, FormItemRule } from 'element-plus';

/** 参数 */
const props = defineProps<MoEditDialogProps<T>>();

/** 回调 */
const emits = defineEmits<{
    /** 取消 */
    cancel: [];
    /** 确定 */
    confirm: [type: 'add' | 'update', data: EditData<T>];
}>();

/** 表单元素对象 */
const formRef = ref<FormInstance>();

/** 是否显示 */
const visible = defineModel<boolean>({ required: true });
/** 主键 */
const primaryKey = computed(() => props.config.primaryKey ?? '_id');
/** 表单数据对象 */
const formData = ref({}) as Ref<EditData<T>>;

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

watchEffect(() => {
    const data: any = { [primaryKey.value]: props.params.data?.[primaryKey.value] ?? '' };
    if (props.params.data) {
        props.config.components.forEach((component) => {
            let value: any = props.params.data![component.name];
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
    } else if (props.config.initData) {
        const initData = typeof props.config.initData === 'function' ? props.config.initData() : props.config.initData;
        props.config.components.forEach((component) => {
            let value: any = initData[component.name];
            if ('multiple' in component && component.multiple) {
                data[component.name] = typeof value === 'string' ? value.split(',') : value;
            } else {
                data[component.name] = convertToString(value);
            }
        });
    } else {
        props.config.components.forEach((component) => (data[component.name] = ''));
    }
    formData.value = data;
});

// 自定义监听数据变化方法
props.config.watch?.forEach((watchFun) => watchEffect(() => watchFun(formData)));

/** 确定点击事件 */
const confirmClickEvent = () => {
    const $form = formRef.value;
    if ($form) {
        // 校验
        $form.validate((valid) => {
            if (valid) {
                const type = formData.value[primaryKey.value] ? 'update' : 'add';
                valid && emits('confirm', type, stringFormData.value);
            }
        });
    }
};

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
            optionsCache.set(options, reactiveOptions);
            watchEffect(async () => {
                if (visible.value && reactiveOptions.length <= 0) {
                    const res = options(formData);
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
</script>
<script lang="ts">
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
type SelectOptionsLoad<T extends Record<string, any>> = (
    editDataRef: Ref<EditData<T>>
) => SelectItem[] | Promise<SelectItem[]>;

/**
 * 编辑弹窗组件项
 */
type MoEditDialogComponent<T extends Record<string, any>> = {
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

/** 编辑数据 */
export type EditData<T> = { [key in keyof T & string]: string };

/**
 * 编辑弹窗配置
 */
export type MoEditDialogConfig<T extends Record<string, any>> = {
    /** 主键名 */
    primaryKey?: keyof T & string;
    /** 编辑弹窗组件数组 */
    components: MoEditDialogComponent<T>[];
    /** 校验规则 */
    rules?: { [key in keyof T & string]?: FormItemRule[] };
    /** 弹窗宽度 */
    width?: number | string;
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
 * 编辑弹窗数据参数
 */
export type MoEditDialogParams<T extends Record<string, any>> = {
    /** 数据 */
    data?: T;
};

/**
 * 编辑弹窗参数
 */
export type MoEditDialogProps<T extends Record<string, any>> = {
    /** 配置 */
    config: MoEditDialogConfig<T>;
    /** 参数 */
    params: MoEditDialogParams<T>;
};
</script>

<template>
    <el-dialog
        modal-class="mo-edit-dialog"
        v-model="visible"
        :title="formData[primaryKey] ? '编辑' : '添加'"
        :width="props.config.width"
        @open="() => formRef?.clearValidate()"
        @closed="() => (formData = {} as T)"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="props.config.rules"
            :size="props.config.size"
            :label-width="props.config.labelWidth"
        >
            <template v-for="component in props.config.components">
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
        </el-form>
        <template #footer>
            <el-button @click="emits('cancel')">取消</el-button>
            <el-button type="primary" @click="confirmClickEvent">确定</el-button>
        </template>
    </el-dialog>
</template>

<style>
.mo-edit-dialog.el-overlay,
.mo-edit-dialog.el-overlay .el-overlay-dialog {
    position: absolute;
}
</style>
