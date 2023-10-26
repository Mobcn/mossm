<script setup lang="ts">
import MoNavbar from './compoents/MoNavbar.vue';
import MoAPI from '@/views/api/MoAPI.vue';
import MoModel from '@/views/model/MoModel.vue';
import MoSetting from '@/views/setting/MoSetting.vue';

/**
 * 标签项
 */
type TabItem = {
    /** ID */
    _id: string;
    /** 标题 */
    title: string;
    /** 参数 */
    params?: any;
    /** 组件 */
    component: Component;
};

/** 标签项数组 */
const tabs: TabItem[] = [
    {
        _id: 'api',
        title: 'API管理',
        component: MoAPI
    },
    {
        _id: 'model',
        title: '模型管理',
        component: MoModel
    },
    {
        _id: 'setting',
        title: '系统设置',
        component: MoSetting
    }
];
</script>

<template>
    <el-container class="h-screen">
        <el-header class="p0" height="50px">
            <MoNavbar />
        </el-header>
        <el-divider class="m0" />
        <el-main class="p0 overflow-hidden">
            <el-tabs class="mo-dashboard__tabs" :model-value="tabs[0]._id" type="border-card">
                <el-tab-pane v-for="item in tabs" :key="item._id" :name="item._id" :label="item.title" lazy>
                    <el-scrollbar class="mo-dashboard__scrollbar">
                        <component :is="item.component" :params="item.params" />
                    </el-scrollbar>
                </el-tab-pane>
            </el-tabs>
        </el-main>
    </el-container>
</template>

<style scoped>
.mo-dashboard__tabs.el-tabs {
    display: flex;
    flex-flow: column;
    height: 100%;
}

.mo-dashboard__tabs.el-tabs :deep(.el-tabs__content) {
    flex: 1;
    padding: 0;
}

.mo-dashboard__tabs.el-tabs :deep(.el-tabs__content .el-tab-pane) {
    position: absolute;
    width: 100%;
    height: 100%;
}

.mo-dashboard__tabs.el-tabs .mo-dashboard__scrollbar.el-scrollbar {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0.5rem;
}

.mo-dashboard__tabs.el-tabs .mo-dashboard__scrollbar.el-scrollbar :deep(.el-scrollbar__view) {
    height: 100%;
}

.mo-dashboard__tabs.el-tabs :deep(.el-tabs__header .el-tabs__nav .el-tabs__item:first-child i) {
    display: none;
}
</style>
