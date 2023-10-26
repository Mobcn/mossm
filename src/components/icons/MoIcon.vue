<script setup lang="ts">
import iconConfig from '@/assets/icons/icon.config.json';

// 参数
const prop = withDefaults(
    defineProps<{
        /** 图标名（bootstrap图标：https://icons.bootcss.com/） */
        iconName: string;
        /** 图标路径名，默认'bootstrap' */
        iconPathName?: string;
        /** 宽度，默认：16 */
        width?: string | number;
        /** 高度，默认：16 */
        height?: string | number;
        /** 填充，默认：'currentColor' */
        fill?: string;
    }>(),
    {
        iconPathName: 'bootstrap',
        width: 16,
        height: 16,
        fill: 'currentColor'
    }
);

// Blob图标地址
const blobIconURL = ref(store.blobIconURL?.[prop.iconPathName] ?? '');

// 图标链接
const iconLink = computed(() => {
    return `${blobIconURL.value}#${prop.iconName}`;
});

// 初始化操作
(() => {
    // 获取Blob图标地址
    if (blobIconURL.value === '') {
        const iconURL = (<any>iconConfig)[prop.iconPathName];
        store.requestMap ??= {};
        store.requestMap[iconURL] ??= fetch(iconURL)
            .then((res) => res.blob())
            .then((blob) => {
                const blobURL = URL.createObjectURL(blob);
                store.blobIconURL ??= {};
                store.blobIconURL[prop.iconPathName] = blobURL;
                return blobURL;
            });
        store.requestMap[iconURL].then((blobURL: string) => (blobIconURL.value = blobURL));
    }
})();
</script>

<template>
    <svg :width="width" :height="height" :fill="fill">
        <use :xlink:href="iconLink" />
    </svg>
</template>
