<script setup lang="ts" generic="T extends Record<string, any>">
import MoForm from './MoForm.vue';
import type { EditData, MoFormInstance, MoFormComponent } from './MoForm.vue';

/** 参数 */
const props = defineProps<MoSearchProps<T>>();

/** 回调 */
const emits = defineEmits<{
    search: [searchData: SearchData<T>];
}>();

/** 表单元素对象 */
const moFormRef = ref<MoFormInstance<T>>();
</script>
<script lang="ts">
/**
 * 查询数据
 */
export type SearchData<T extends Record<string, any>> = EditData<T>;

/**
 * 查询栏参数
 */
export type MoSearchProps<T extends Record<string, any>> = {
    /** 表单组件数组 */
    components: MoFormComponent<T>[];
    /** 组件大小 */
    size?: 'default' | 'small' | 'large';
    /** 数据监听方法数组 */
    watch?: ((editDataRef: Ref<EditData<T>>) => void)[];
};
</script>

<template>
    <mo-form ref="moFormRef" inline :components="props.components" :size="props.size" :watch="props.watch">
        <el-button type="primary" @click="() => emits('search', moFormRef!.getFormData())">搜索</el-button>
    </mo-form>
</template>

<style scoped>
.el-form {
    margin-top: 0.8rem;
}
.el-form--inline .el-form-item {
    margin-right: 0.8rem;
    margin-bottom: 0.8rem;
}
</style>
