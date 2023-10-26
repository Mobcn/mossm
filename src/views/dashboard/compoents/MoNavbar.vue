<script setup lang="ts">
import MoIcon from '@/components/icons/MoIcon.vue';
import { ElMessageBox } from 'element-plus';
import type { ProvideChangePage } from '@/App.vue';

/** 太阳图标 */
const Sun: Component = () => h(MoIcon, { iconName: 'brightness-high-fill', fill: '#606266' });
/** 月亮图标 */
const Moon: Component = () => h(MoIcon, { iconName: 'moon-fill', fill: '#cfd3dc' });

/** div元素对象 */
const divRef = ref();

/** 主题开关 */
const themeSwitch = ref(store.theme === 'dark');

/** 页面修改 */
const changePage = inject<ProvideChangePage>('changePage', () => {
    throw new Error('找不到changePage方法');
});

/**
 * 切换主题
 */
function switchTheme() {
    // 全局禁止动画过渡
    const style = document.createElement('style');
    style.innerHTML = '* { transition: none !important; }';
    document.head.appendChild(style);
    const callbackTransitionend = (e: TransitionEvent) => {
        if (
            e.propertyName === 'background-color' &&
            e.target instanceof HTMLElement &&
            e.target.className === 'el-switch__core'
        ) {
            document.head.removeChild(style);
            divRef.value.removeEventListener('transitionend', callbackTransitionend);
        }
    };
    divRef.value.addEventListener('transitionend', callbackTransitionend);

    // 切换主题
    store.theme = themeSwitch.value ? 'dark' : 'light';
}

/**
 * 退出登录
 */
function exit() {
    ElMessageBox.confirm('确定要退出吗?', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(() => {
            storage.remove('token');
            changePage(import('@/views/common/Login.vue'));
        })
        .catch(() => 'cancel');
}
</script>

<template>
    <div class="w-full h-full flex items-center justify-between">
        <div class="text-xl mx-3">MOSSM</div>
        <div ref="divRef" class="flex items-center gap-1">
            <el-switch
                v-model="themeSwitch"
                @change="switchTheme"
                :active-action-icon="Moon"
                :inactive-action-icon="Sun"
            />
            <mo-icon
                class="p-3.75 hover:bg-mask-1 hover:cursor-pointer"
                icon-name="box-arrow-right"
                width="20px"
                height="20px"
                @click="exit"
            ></mo-icon>
        </div>
    </div>
</template>

<style scoped>
.el-switch :deep(.el-switch__core) {
    transition: border-color var(--el-transition-duration), background-color var(--el-transition-duration) !important;
}

.el-switch :deep(.el-switch__core .el-switch__action) {
    transition: all var(--el-transition-duration) !important;
}

.el-switch :deep(.el-switch__core .el-switch__action) {
    background-color: var(--el-bg-color);
}

.el-switch.is-checked :deep(.el-switch__core) {
    border-color: #4c4d4f;
    background-color: #2c2c2c;
}
</style>
