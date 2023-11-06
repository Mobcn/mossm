<script setup lang="ts" generic="T extends Record<string, any>">
import MoSearch from './components/MoSearch.vue';
import MoToolbar from './components/MoToolbar.vue';
import MoTable from './components/MoTable.vue';
import MoPagination from './components/MoPagination.vue';
import MoEditDialog from './components/MoEditDialog.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { MoSearchProps, SearchData } from './components/MoSearch.vue';
import type { MoToolbarProps } from './components/MoToolbar.vue';
import type { MoTableProps, MoTableInstance } from './components/MoTable.vue';
import type { EditData } from './components/MoForm.vue';
import type { MoEditDialogConfig, MoEditDialogParams } from './components/MoEditDialog.vue';

/** 参数 */
const props = defineProps<MoGridProps<T>>();

/** 接口 */
const api = computed<ApiParams<T>>(() => ({
    add: () => {
        ElMessage({ message: '未配置api的add方法', type: 'error' });
        throw new Error('未配置api的add方法');
    },
    remove: () => {
        ElMessage({ message: '未配置api的remove方法', type: 'error' });
        throw new Error('未配置api的remove方法');
    },
    removeBatch: () => {
        ElMessage({ message: '未配置api的removeBatch方法', type: 'error' });
        throw new Error('未配置api的removeBatch方法');
    },
    update: () => {
        ElMessage({ message: '未配置api的update方法', type: 'error' });
        throw new Error('未配置api的update方法');
    },
    ...props.api
}));

/** 表格元素对象 */
const moTableRef = ref<MoTableInstance<T>>();

/** 历史查询数据 */
const oldSearchData = ref<SearchData<T>>();

/** 表格数据 */
const tableData = ref([]) as Ref<T[]>;

/** 当前页码 */
const page = ref(1);
/** 每页最大数据条数 */
const limit = ref(props.pagination?.limit ?? 10);
/** 总数据条数 */
const tableTotal = ref(0);

/** 编辑弹窗是否显示 */
const editDialogVisible = ref(false);
/** 编辑弹窗数据参数 */
const editDialogParams = ref({}) as Ref<MoEditDialogParams<T>>;

/** 是否加载中 */
const loading = ref(false);

/** 查询事件 */
const searchEvent = async (searchData: SearchData<T>) => {
    page.value = 1;
    oldSearchData.value = searchData;
    loadData(searchData);
};

/** 删除事件 */
const deleteEvent = (row: T) => {
    ElMessageBox.confirm('确定要删除吗?', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(() => (loading.value = true))
        .then(async () => {
            try {
                await api.value.remove!(row);
            } catch (error) {
                window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
                ElMessage({ message: `删除失败！`, type: 'error' });
                return;
            }
            ElMessage({ message: '删除成功！', type: 'success' });
            await loadData(true);
        })
        .catch(() => 'cancel')
        .finally(() => (loading.value = false));
};

/** 批量删除事件 */
const deleteBatchEvent = async () => {
    const $table = moTableRef.value;
    if ($table) {
        ElMessageBox.confirm('确定要批量删除选择项吗?', '系统提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
            .then(() => (loading.value = true))
            .then(async () => {
                const rows = $table.getSelectionRows();
                if (rows.length <= 0) {
                    ElMessage({ message: '至少选择一项!', type: 'warning' });
                } else {
                    try {
                        await api.value.removeBatch!(rows);
                    } catch (error) {
                        window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
                        ElMessage({ message: '批量删除失败！', type: 'error' });
                        return;
                    }
                    ElMessage({ message: '批量删除成功！', type: 'success' });
                    await loadData(true);
                }
            })
            .catch(() => 'cancel')
            .finally(() => (loading.value = false));
    }
};

/** 编辑事件 */
const editEvent = (row: T) => openEditDialog({ ...row });

/** 页码修改事件 */
const pageChangeEvent = (value: number) => {
    page.value = value;
    loadData(true);
};

/** 每页最大数据条数修改事件 */
const limitChangeEvent = (value: number) => {
    limit.value = value;
    loadData(true);
};

/** 编辑弹窗确认事件 */
const confirmEvent = async (type: 'add' | 'update', editData: EditData<T>) => {
    loading.value = true;
    try {
        await api.value[type]!(editData);
        ElMessage({ message: `${type === 'add' ? '添加' : '更新'}成功！`, type: 'success' });
        type === 'add' && (page.value = 1);
        await loadData(true);
        editDialogVisible.value = false;
    } catch (error) {
        window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
        ElMessage({ message: `${type === 'add' ? '添加' : '更新'}失败！`, type: 'error' });
    } finally {
        loading.value = false;
    }
};

/**
 * 加载数据
 *
 * @param searchData 查询数据
 */
async function loadData(searchData?: SearchData<T> | boolean) {
    loading.value = true;
    if (typeof searchData === 'boolean') {
        searchData = searchData ? oldSearchData.value : undefined;
    }
    try {
        const { list, total } = await api.value.list({
            searchData,
            page: page.value,
            limit: limit.value
        });
        tableData.value = list;
        tableTotal.value = total;
    } catch (error) {
        window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
        ElMessage({ message: '加载数据失败！', type: 'error' });
    } finally {
        loading.value = false;
    }
}

/**
 * 打开编辑弹窗
 */
function openEditDialog(data?: T) {
    if (!props.editDialog) {
        ElMessage({ message: '未配置编辑弹窗', type: 'error' });
        throw new Error('未配置编辑弹窗');
    }
    editDialogParams.value = { data };
    editDialogVisible.value = true;
}

// 初始化操作
(async () => {
    // 加载第一页数据
    page.value = 1;
    loadData();
})();
</script>
<script lang="ts">
/**
 * API参数
 */
type ApiParams<T extends Record<string, any>> = {
    /** 获取数据列表 */
    list: (params: ListApiParams<T>) => { list: T[]; total: number } | Promise<{ list: T[]; total: number }>;
    /** 添加数据 */
    add?: (data: EditData<T>) => Promise<void> | void;
    /** 删除数据 */
    remove?: (data: T) => Promise<void> | void;
    /** 批量删除数据 */
    removeBatch?: (datas: T[]) => Promise<void> | void;
    /** 更新数据 */
    update?: (data: EditData<T>) => Promise<void> | void;
};

/**
 * 获取数据列表参数
 */
type ListApiParams<T extends Record<string, any>> = {
    /** 查询数据 */
    searchData?: SearchData<T>;
    /** 页码 */
    page: number;
    /** 每页最大数据条数 */
    limit: number;
};

/**
 * 表组件参数
 */
export type MoGridProps<T extends Record<string, any>> = {
    /** 表格配置 */
    table: Omit<MoTableProps<T>, 'data'>;
    /** 工具栏配置 */
    toolbar?: MoToolbarProps;
    /** 查询栏配置 */
    search?: MoSearchProps<T>;
    /** 分页配置 */
    pagination?: {
        /** 每页最大数据条数 */
        limit?: number;
    };
    /** 编辑弹窗配置 */
    editDialog?: MoEditDialogConfig<T>;
    /** 接口 */
    api: ApiParams<T>;
};
</script>

<template>
    <el-container v-loading="loading" class="h-full">
        <el-header class="h-auto" v-if="props.search">
            <mo-search v-bind="props.search" @search="searchEvent" />
            <el-divider class="m0" />
        </el-header>
        <el-container>
            <el-header v-if="props.toolbar" class="h-auto pt-3">
                <mo-toolbar
                    v-bind="props.toolbar"
                    @add="openEditDialog"
                    @delete-batch="deleteBatchEvent"
                    @refresh="loadData(true)"
                />
            </el-header>
            <el-main class="pt-3 h-0">
                <mo-table
                    ref="moTableRef"
                    v-bind="props.table"
                    :data="tableData"
                    @edit="editEvent"
                    @delete="deleteEvent"
                />
            </el-main>
            <el-footer class="h-auto">
                <mo-pagination
                    :page="page"
                    :limit="limit"
                    :total="tableTotal"
                    @change="pageChangeEvent"
                    @size-change="limitChangeEvent"
                />
            </el-footer>
        </el-container>
        <mo-edit-dialog
            v-if="props.editDialog"
            v-model="editDialogVisible"
            :config="props.editDialog"
            :params="editDialogParams"
            @cancel="() => (editDialogVisible = false)"
            @confirm="confirmEvent"
        />
    </el-container>
</template>

<style scoped>
.el-container :deep(.el-loading-mask) {
    z-index: 3000;
}
</style>
