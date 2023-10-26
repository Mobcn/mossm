<script setup lang="ts" generic="T extends Record<string, any>">
/** 参数 */
const props = defineProps<MoSearchProps<T>>();

/** 回调 */
const emits = defineEmits<{
    search: [searchData: SearchData<T>];
}>();

/** 查询数据对象 */
const searchData = ref() as Ref<SearchData<T>>;
watchEffect(() => {
    const data = {} as SearchData<T>;
    props.components.forEach((component) => {
        if (component.type === 'select' && component.multiple) {
            data[component.name] = [];
        } else if (
            (component.type === 'time' && component.isRange) ||
            component.type === 'daterange' ||
            component.type === 'datetimerange' ||
            component.type === 'monthrange'
        ) {
            data[component.name] = [];
        } else {
            data[component.name] = '';
        }
    });
    searchData.value = data;
});

/** 查询事件 */
const searchEvent = () => {
    const data = {} as any;
    for (const key in searchData.value) {
        const value: any = searchData.value[key];
        if (!value) {
            continue;
        }
        if (typeof value === 'string') {
            value && (data[key] = value);
        } else if (value instanceof Date) {
            data[key] = new Date(value).toISOString();
        } else if (value instanceof Array) {
            if (value[0] instanceof Date) {
                data[key] = value.map((item) => new Date(item).toISOString());
            } else {
                value.length > 0 && (data[key] = [...value]);
            }
        }
    }
    emits('search', data);
};
</script>
<script lang="ts">
/**
 * 查询组件项
 */
type MoSearchComponent<T extends Record<string, any>> = {
    /** 组件名称 */
    name: keyof T & string;
    /** 组件标签 */
    label?: string;
    /** 组件大小 */
    size?: 'default' | 'small' | 'large';
    /** 占位内容 */
    placeholder?: string;
} & (
    | {
          /** 组件类型 */
          type: 'input';
      }
    | {
          /** 组件类型 */
          type: 'select';
          /** 选择项 */
          options: { value: string; label: string }[];
          /** 是否多选 */
          multiple?: boolean;
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
    | ((
          | {
                /** 组件类型 */
                type: 'year' | 'month' | 'date' | 'datetime' | 'week';
            }
          | {
                /** 组件类型 */
                type: 'datetimerange' | 'daterange' | 'monthrange';
                /** 范围选择时开始的占位内容 */
                startPlaceholder?: string;
                /** 范围选择时结束的占位内容 */
                endPlaceholder?: string;
            }
      ) & {
          /** 显示在输入框中的格式 */
          format?: string;
      })
);

/** 查询数据 */
export type SearchData<T> = { [key in keyof T & string]?: string | string[] };

/**
 * 查询栏参数
 */
export type MoSearchProps<T extends Record<string, any>> = {
    /** 查询组件数组 */
    components: MoSearchComponent<T>[];
    /** 组件大小 */
    size?: 'default' | 'small' | 'large';
};
</script>

<template>
    <el-form :inline="true" :size="props.size">
        <el-form-item v-for="(component, index) in props.components" :key="index" :label="component.label">
            <el-input
                v-if="component.type === 'input'"
                v-model="(searchData[component.name] as string)"
                :size="component.size"
                :placeholder="component.placeholder"
            />
            <el-select
                v-else-if="component.type === 'select'"
                v-model="searchData[component.name]"
                :multiple="component.multiple"
                :size="component.size"
                :placeholder="component.placeholder"
                clearable
            >
                <el-option
                    v-for="(item, index) in component.options"
                    :key="index"
                    :value="item.value"
                    :label="item.label"
                ></el-option>
            </el-select>
            <el-time-picker
                v-else-if="component.type === 'time'"
                v-model="(searchData[component.name] as string | [string, string])"
                :is-range="component.isRange"
                :size="component.size"
                :placeholder="component.placeholder"
            />
            <el-date-picker
                v-else-if="
                    component.type === 'year' ||
                    component.type === 'month' ||
                    component.type === 'date' ||
                    component.type === 'datetime' ||
                    component.type === 'week'
                "
                v-model="(searchData[component.name] as string)"
                :type="component.type"
                :format="component.format"
                :size="component.size"
                :placeholder="component.placeholder"
            />
            <el-date-picker
                v-else-if="
                    component.type === 'daterange' ||
                    component.type === 'datetimerange' ||
                    component.type === 'monthrange'
                "
                v-model="(searchData[component.name] as [string, string])"
                :type="component.type"
                :format="component.format"
                :size="component.size"
                :start-placeholder="component.startPlaceholder"
                :end-placeholder="component.endPlaceholder"
            />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="searchEvent">搜索</el-button>
        </el-form-item>
    </el-form>
</template>

<style scoped>
.el-form {
    margin-top: 0.8rem;
}
.el-form--inline .el-form-item {
    margin-right: 0.8rem;
    margin-bottom: 0.8rem;
}
</style>
