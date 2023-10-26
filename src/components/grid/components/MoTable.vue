<script setup lang="ts" generic="T">
import MoIcon from '@/components/icons/MoIcon.vue';
import type { ElTable } from 'element-plus';

/** 参数 */
const props = withDefaults(defineProps<MoTableProps<T>>(), {
    operations: () => ['edit', 'delete']
});

/** 回调 */
const emits = defineEmits<{
    edit: [row: T];
    delete: [row: T];
}>();

/** 表格元素对象 */
const tableRef = ref<InstanceType<typeof ElTable>>();

// 暴露给父组件的方法
defineExpose({
    /**
     * 获取选中的行
     */
    getSelectionRows: (): T[] => {
        const $table = tableRef.value;
        if (!$table) {
            return [];
        }
        return $table.getSelectionRows().map((row: T) => ({ ...row }));
    }
});
</script>
<script lang="ts">
/** 对齐方式 */
type AlignEnum = 'left' | 'center' | 'right';

/** 操作 */
type OperationEnum = 'edit' | 'delete';

/**
 * 表格列
 */
type MoTableColumn<T> = {
    /** 字段名 */
    prop: keyof T & string;
    /** 标题 */
    label?: string;
    /** 宽度 */
    width?: number | string;
    /** 最小宽度 */
    minWidth?: number | string;
    /** 对齐方式 */
    align?: AlignEnum;
    /** 表头对齐方式 */
    headerAlign?: AlignEnum;
    /** 显示格式化 */
    format?: (row: T) => string;
};

/**
 * 表格参数
 */
export type MoTableProps<T> = {
    /** 表格数据 */
    data: T[];
    /** 列配置 */
    columns: MoTableColumn<T>[];
    /** 操作 */
    operations?: OperationEnum[];
    /** 对齐方式 */
    align?: AlignEnum;
    /** 表头对齐方式 */
    headerAlign?: AlignEnum;
};

/** 表格实例 */
export type MoTableInstance<T> = ComponentPublicInstance<
    {},
    {
        /**
         * 获取选中的行
         */
        getSelectionRows: () => T[];
    }
>;
</script>

<template>
    <el-table ref="tableRef" :data="props.data" height="100%" border>
        <el-table-column type="selection" width="55" />
        <el-table-column
            v-for="column in props.columns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label ?? column.prop"
            :width="column.width"
            :min-width="column.minWidth"
            :align="column.align ?? props.align"
            :header-align="column.headerAlign ?? props.headerAlign"
            show-overflow-tooltip
        >
            <template #default="{ row }: { row: T }">
                <span>{{ column.format ? column.format(row) : row[column.prop] }}</span>
            </template>
        </el-table-column>
        <el-table-column v-if="props.operations?.length" label="操作" :align="props.headerAlign" width="100">
            <template #default="{ row }: { row: T }">
                <template v-for="operation in props.operations">
                    <el-icon
                        v-if="operation === 'edit'"
                        class="hover:cursor-pointer hover:color-primary mr-2"
                        @click="emits('edit', { ...row })"
                    >
                        <mo-icon icon-name="pencil-square" />
                    </el-icon>
                    <el-icon
                        v-else-if="operation === 'delete'"
                        class="hover:cursor-pointer hover:color-primary mr-2"
                        @click="emits('delete', { ...row })"
                    >
                        <mo-icon icon-name="trash3" />
                    </el-icon>
                </template>
            </template>
        </el-table-column>
    </el-table>
</template>

<style scoped></style>
