<script lang="ts" setup>
import SideList from './components/SideList.vue';
import MainTable from './components/MainTable.vue';

/** 侧边列表元素对象 */
const sideListRef = ref<{
    saveTable: (tableInfo: TableInfo) => Promise<void>;
}>();
/** 主表元素对象 */
const mainTableRef = ref<{ checkSave: () => Promise<boolean> }>();

/** 当前表信息 */
const currentTableInfo = ref<TableInfo>();
/** 当前表字段属性 */
const currentProperty = computed({
    get: () => currentTableInfo.value?.property,
    set: (value) => currentTableInfo.value && value && (currentTableInfo.value.property = value)
});

// 加载
const loadding = ref(false);

/**
 * 全局Loading设置
 *
 * @param value loading是否显示
 * @param props loading参数
 */
function setLoading(value: boolean) {
    loadding.value = value;
}

/**
 * 编辑表字段属性
 *
 * @param tableInfo 表信息
 * @param backFun 失败回调函数
 */
async function editProperty(tableInfo?: TableInfo, backFun?: Function) {
    const $mainTable = mainTableRef.value;
    if ($mainTable) {
        if (await $mainTable.checkSave()) {
            currentTableInfo.value = tableInfo;
        } else {
            backFun && backFun();
        }
    }
}

/**
 * 保存表字段属性
 *
 * @param property 表字段属性
 */
async function saveProperty(property: Record<string, TableProperty>) {
    if (currentTableInfo.value && sideListRef.value) {
        currentTableInfo.value.property = property;
        sideListRef.value.saveTable(currentTableInfo.value);
    }
}

// 全局Loading设置
provide('setLoading', setLoading);
</script>
<script lang="ts">
import type { FieldType, FieldTypeStr, TableProperty, TableInfo } from '@/utils/table-convert';
export type { FieldType, FieldTypeStr, TableProperty, TableInfo };
</script>

<template>
    <div class="h-full flex gap-1 p2 box-border" v-loading="loadding">
        <div class="w-16% min-w-250px"><SideList ref="sideListRef" @edit-property="editProperty" /></div>
        <div class="flex-1">
            <MainTable ref="mainTableRef" v-model="currentProperty" @save-property="saveProperty" />
        </div>
    </div>
</template>

<style scoped></style>
