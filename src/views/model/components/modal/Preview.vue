<script setup lang="ts">
import { ref, watchEffect } from 'vue';

// 参数
const props = defineProps<{
    /** 文本 */
    text: string;
    /** 标题 */
    title?: string;
}>();

const visible = defineModel<boolean>({ required: true });
const content = ref('');

watchEffect(() => {
    content.value = props.text;
});
</script>

<template>
    <VxeModal
        class-name="preview-modal"
        v-model="visible"
        width="50vw"
        height="80vh"
        :title="title || '弹窗'"
        show-footer
        show-zoom
    >
        <VxeTextarea v-model="content" readonly resize="none"></VxeTextarea>
    </VxeModal>
</template>

<style>
.vxe-modal--wrapper.type--modal.preview-modal .vxe-modal--body .vxe-modal--content {
    overflow: hidden;
}
</style>
<style scoped>
.vxe-textarea,
.vxe-textarea :deep(.vxe-textarea--inner) {
    width: 100%;
    height: 100%;
}
</style>
