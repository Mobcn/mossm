<script lang="ts" setup>
import { VXETable } from 'vxe-table';
import { ElMessage } from 'element-plus';
import AddTableModal from './modal/AddTable.vue';
import type { VxeTableEvents, VxeTableInstance, VxeTablePropTypes } from 'vxe-table';
import type { TableInfo } from '../MoModel.vue';

/** 回调 */
const emits = defineEmits<{
    /** 编辑表字段属性 */
    editProperty: [tableInfo?: TableInfo, cb?: Function];
}>();

/** 全局Loading设置 */
const setLoading = inject('setLoading') as (value: boolean) => void;

/** 所有表信息 */
const tableAll = ref<TableInfo[]>([]);
/** 当前筛选模块 */
const currentModule = ref<string>();

/** 表同步列表 */
const syncList = reactive<TableInfo[]>([]);

/** 表模块列表 */
const moduleList = computed<string[]>(() => {
    const set = new Set<string>(tableAll.value.map((item) => item.module!));
    return Array.from(set);
});
/** 表列表 */
const tableList = computed<TableInfo[]>(() => {
    if (currentModule.value) {
        return tableAll.value.filter((model) => model.module === currentModule.value);
    }
    return tableAll.value;
});

/** 新建表弹窗元素对象 */
const tableRef = ref<VxeTableInstance<TableInfo>>();
/** 新建表弹窗元素对象 */
const addModal = ref();

/** 右键菜单项设置 */
const menuConfig = reactive<VxeTablePropTypes.MenuConfig<TableInfo>>({
    body: {
        options: [
            [
                { code: 'add', name: '新建表' },
                { code: 'remove', name: '删除当前表' }
            ]
        ]
    },
    visibleMethod: ({ options, row }) => {
        options[0][1].visible = row != null;
        return true;
    }
});

/** 右键菜单项事件 */
const contextMenuClickEvent: VxeTableEvents.MenuClick<TableInfo> = ({ $table, menu, row }) => {
    switch (menu.code) {
        case 'add':
            addModal.value.open();
            break;
        case 'remove':
            const index = tableAll.value.findIndex((item) => item.module === row.module && item.table === row.table);
            setLoading(true);
            removeModel(row)
                .then(() => {
                    tableAll.value.splice(index, 1);
                    row === $table.getCurrentRecord() && emits('editProperty');
                })
                .catch((error) => VXETable.modal.message({ content: error.message, status: 'error' }))
                .finally(() => setLoading(false));
            break;
    }
};

/** 行选中事件 */
const currentChangeEvent: VxeTableEvents.CurrentChange<TableInfo> = ({ newValue, oldValue, $table }) => {
    const target = tableAll.value.find((item) => item.module === newValue.module && item.table === newValue.table);
    emits('editProperty', target, () => $table.setCurrentRow(oldValue));
};

/**
 * 加载模型列表
 */
async function loadModel() {
    setLoading(true);
    try {
        const modelList = await modelService.all();
        tableAll.value = modelList.map(({ _id, module, name, table, property }) => ({
            _id,
            module,
            model: name,
            table,
            property: codeText2Property(property)
        }));
    } catch (error) {
        window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
        ElMessage({ message: '获取模型数据失败!', type: 'error' });
    } finally {
        setLoading(false);
    }
}

/**
 * 新建表
 *
 * @param props 表参数
 */
function addTable(props: { module: string; model: string; table: string }) {
    tableAll.value.push({ property: {}, ...props });
}

/**
 * 保存模型
 *
 * @param tableInfo 表信息
 */
async function saveModel(tableInfo: TableInfo) {
    return await modelService.save({
        module: tableInfo.module,
        name: tableInfo.model,
        table: tableInfo.table,
        property: property2codeText(tableInfo.property)
    });
}

/**
 * 删除模型
 *
 * @param tableInfo 表信息
 */
async function removeModel(tableInfo: TableInfo) {
    tableInfo._id && (await modelService.remove(tableInfo._id));
}

/**
 * 保存表
 *
 * @param tableInfo 表信息
 */
async function saveTable(tableInfo: TableInfo) {
    const { tableData } = tableRef.value!.getTableData();
    const row = tableData.find((row) => row.module === tableInfo.module && row.table === tableInfo.table);
    row && !syncList.includes(row) && syncList.push(row);
    try {
        const { _id } = await saveModel(tableInfo);
        if (row) {
            row._id = _id;
            row.property = tableInfo.property;
            syncList.splice(syncList.indexOf(row), 1);
        }
    } catch (error) {
        VXETable.modal.message({ content: '保存失败!', status: 'error' });
    }
}

// 导出
defineExpose({ saveTable });

// 初始化操作
(() => {
    // 加载模型列表
    loadModel();
})();
</script>

<template>
    <div class="h-full flex flex-col">
        <div>
            <VxeToolbar size="mini">
                <template #buttons>
                    <span class="mr-2 text-sm">模块:</span>
                    <VxeSelect class-name="flex-1 ml-1" v-model="currentModule" placeholder="所有" clearable>
                        <VxeOption v-for="mod in moduleList" :key="mod" :value="mod" :label="mod"></VxeOption>
                    </VxeSelect>
                    <VxeButton class="ml-2" icon="vxe-icon-refresh" title="刷新" circle @click="loadModel"></VxeButton>
                </template>
            </VxeToolbar>
        </div>
        <div class="flex-1 h-0">
            <VxeTable
                ref="tableRef"
                height="auto"
                size="mini"
                :row-config="{ isCurrent: true, isHover: true }"
                :show-header="false"
                :data="tableList"
                :menu-config="menuConfig"
                @current-change="currentChangeEvent"
                @menu-click="contextMenuClickEvent"
            >
                <VxeColumn class-name="hover:cursor-pointer">
                    <template #default="{ row }: { row: TableInfo }">
                        <span>{{ `[${row.module}] ${row.table} : ${row.model}` }}</span>
                        <span v-if="syncList.includes(row)" class="color-red">（同步中）</span>
                        <span v-if="!syncList.includes(row) && !row._id" class="color-green">（新建）</span>
                    </template>
                </VxeColumn>
            </VxeTable>
        </div>
        <AddTableModal ref="addModal" :modules="moduleList" @confirm="addTable" />
    </div>
</template>

<style scoped></style>
