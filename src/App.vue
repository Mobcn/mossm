<script setup lang="ts">
/** 当前子组件 */
const currentComponent = ref<Component | null>(null);

/**
 * 页面修改
 *
 * @param page 页面组件
 * @param params 页面组件参数
 */
async function changePage(page: Promise<{ default: Component }> | Component) {
    if (page instanceof Promise) {
        currentComponent.value = markRaw((await page).default);
    } else {
        currentComponent.value = page;
    }
}

// 提供页面修改的方法
provide('changePage', changePage);

// 初始化操作
(() => {
    // 设置主题
    storage.get('mo-theme') === 'dark' && (store.theme = 'dark');

    try {
        if (storage.get('token')) {
            changePage(import('@/views/dashboard/MoDashboard.vue'));
        } else {
            changePage(import('@/views/common/Login.vue'));
        }
    } catch (error) {
        window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
        changePage(import('@/views/common/404.vue'));
    }
})();
</script>
<script lang="ts">
/**
 * 页面修改
 */
export type ProvideChangePage = (page: Promise<{ default: Component }> | Component) => void;
</script>

<template>
    <component :is="currentComponent" />
</template>

<style>
/* 修改全局滚动条样式 */
::-webkit-scrollbar {
    width: 6px;
}
::-webkit-scrollbar-thumb {
    transition: all 0.2s ease-in-out;
    border-radius: 10px;
    background-color: #0003;
}
::-webkit-scrollbar-track {
    border-radius: 10px;
}

/* 黑暗主题Element Plus按钮配置 */
html.dark .el-button {
    --el-button-active-text-color: var(--el-color-white);
}
html.dark .el-button--primary {
    --el-button-bg-color: var(--el-color-primary-light-9);
    --el-button-border-color: var(--el-color-primary-light-5);
    --el-button-hover-bg-color: var(--el-color-primary);
    --el-button-hover-border-color: var(--el-color-primary);
}
html.dark .el-button--success {
    --el-button-bg-color: var(--el-color-success-light-9);
    --el-button-border-color: var(--el-color-success-light-5);
    --el-button-hover-bg-color: var(--el-color-success);
    --el-button-hover-border-color: var(--el-color-success);
}
html.dark .el-button--info {
    --el-button-bg-color: var(--el-color-info-light-9);
    --el-button-border-color: var(--el-color-info-light-5);
    --el-button-hover-bg-color: var(--el-color-info);
    --el-button-hover-border-color: var(--el-color-info);
}
html.dark .el-button--warning {
    --el-button-bg-color: var(--el-color-warning-light-9);
    --el-button-border-color: var(--el-color-warning-light-5);
    --el-button-hover-bg-color: var(--el-color-warning);
    --el-button-hover-border-color: var(--el-color-warning);
}
html.dark .el-button--danger {
    --el-button-bg-color: var(--el-color-danger-light-9);
    --el-button-border-color: var(--el-color-danger-light-5);
    --el-button-hover-bg-color: var(--el-color-danger);
    --el-button-hover-border-color: var(--el-color-danger);
}

/* 黑暗主题VXETable样式配置 */
html.dark {
    --vxe-form-background-color: #151515;
    --vxe-button-default-background-color: #3b3b3b;
    --vxe-font-color: #a5b2c0;
    --vxe-grid-maximize-background-color: #151515;
    --vxe-table-header-background-color: #222222;
    --vxe-table-header-font-color: #c9d1d9;
    --vxe-table-footer-font-color: #c9d1d9;
    --vxe-table-body-background-color: #151515;
    --vxe-table-footer-background-color: #151515;
    --vxe-table-row-striped-background-color: #2b2929;
    --vxe-table-border-color: #4e4a4a;
    --vxe-table-row-hover-background-color: #2f2f2f;
    --vxe-table-row-hover-striped-background-color: #454242;
    --vxe-table-row-current-background-color: rgba(245, 247, 250, 0.2);
    --vxe-table-row-hover-current-background-color: rgba(245, 247, 250, 0.2);
    --vxe-table-column-hover-background-color: rgba(245, 247, 250, 0.2);
    --vxe-table-column-current-background-color: rgba(245, 247, 250, 0.2);
    --vxe-table-row-checkbox-checked-background-color: rgba(230, 162, 60, 0.15);
    --vxe-table-row-hover-checkbox-checked-background-color: rgba(230, 162, 60, 0.2);
    --vxe-table-menu-background-color: #494a4d;
    --vxe-table-filter-panel-background-color: #222222;
    --vxe-table-popup-border-color: #4e4a4a;
    --vxe-table-fixed-left-scrolling-box-shadow: 8px 0px 10px -5px rgba(255, 255, 255, 0.12);
    --vxe-table-fixed-right-scrolling-box-shadow: -8px 0px 10px -5px rgba(255, 255, 255, 0.12);
    --vxe-pager-background-color: #151515;
    --vxe-pager-perfect-background-color: #151515;
    --vxe-pager-perfect-button-background-color: #3b3b3b;
    --vxe-input-background-color: #151515;
    --vxe-input-border-color: #4e4a4a;
    --vxe-input-disabled-color: #5f5b5b;
    --vxe-input-disabled-background-color: #6c6767;
    --vxe-select-panel-background-color: #151515;
    --vxe-select-option-hover-background-color: #4c4c4c;
    --vxe-pulldown-panel-background-color: #151515;
    --vxe-loading-background-color: rgba(0, 0, 0, 0.5);
    --vxe-tooltip-dark-background-color: #6e7075;
    --vxe-modal-header-background-color: #262626;
    --vxe-modal-body-background-color: #303133;
    --vxe-modal-border-color: #4e4a4a;
    --vxe-toolbar-panel-background-color: #151515;
    --vxe-toolbar-background-color: transparent;
    --vxe-textarea-background-color: transparent;
    --vxe-checkbox-icon-background-color: #4c4c4c;
    --vxe-checkbox-checked-icon-border-color: #4e4a4a;
    --vxe-checkbox-indeterminate-icon-background-color: #4c4c4c;
}
html.dark .vxe-button.type--button.theme--primary,
html.dark .vxe-button.type--button.theme--danger {
    background-color: transparent;
}
html.dark .vxe-button.type--button.theme--primary:hover {
    background-color: var(--vxe-primary-lighten-color);
}
html.dark .vxe-button.type--button.theme--danger:hover {
    background-color: var(--vxe-danger-lighten-color);
}
</style>
