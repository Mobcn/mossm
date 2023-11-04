<script setup lang="ts">
// 404图片路径
const _404ImagePath = ref('');

/**
 * 跳转首页
 */
const goHome = () => (window.location.href = '/');

(async () => {
    _404ImagePath.value = (await storage.get('_404ImageURL')) || '/img/404.png';
})();
</script>

<template>
    <div class="w-full h-full flex flex-col items-center">
        <img class="mt-10" :src="_404ImagePath" referrerpolicy="no-referrer" />
        <span class="color-#333 text-8 tracking-1 pt-8 pb-6 font-bold">小笨蛋，页面跑偏啦～</span>
        <span class="color-#666 text-3.5 tracking-1px pb-9">你可以选择刷新页面或者返回主页</span>
        <el-button class="w-55 h-14" color="#7caced" @click="goHome">
            <span class="color-white text-4.5 tracking-1">返回主页</span>
        </el-button>
    </div>
</template>
