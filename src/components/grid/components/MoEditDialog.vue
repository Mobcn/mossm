<script setup lang="ts" generic="T extends Record<string, any>">
import MoForm from './MoForm.vue';
import type { EditData, MoFormInstance, MoFormProps } from './MoForm.vue';

/** 参数 */
const props = defineProps<MoEditDialogProps<T>>();

/** 回调 */
const emits = defineEmits<{
    /** 取消 */
    cancel: [];
    /** 确定 */
    confirm: [type: 'add' | 'update', data: EditData<T>];
}>();

/** 表单元素对象 */
const moFormRef = ref<MoFormInstance<T>>();

/** 是否显示 */
const visible = defineModel<boolean>({ required: true });
/** 标题 */
const title = computed(() => {
    const $form = moFormRef.value;
    if ($form) {
        const primaryKey = $form.getPrimaryKey();
        const data = $form.getFormData();
        return data[primaryKey] ? '编辑' : '添加';
    }
    return '';
});
/** 表单数据 */
const formData = ref<T>();

// 监听数据
watchEffect(() => {
    props.params.data && (formData.value = props.params.data);
});

/** 确定点击事件 */
const confirmClickEvent = () => {
    const $form = moFormRef.value;
    if ($form) {
        // 校验
        $form.validate((valid) => {
            if (valid) {
                const primaryKey = $form.getPrimaryKey();
                const data = $form.getFormData();
                const type = data[primaryKey] ? 'update' : 'add';
                valid && emits('confirm', type, data);
            }
        });
    }
};
</script>
<script lang="ts">
/**
 * 编辑弹窗配置
 */
export type MoEditDialogConfig<T extends Record<string, any>> = Omit<MoFormProps<T>, 'data' | 'inline'> & {
    /** 编辑弹窗宽度 */
    width?: number | string;
};

/**
 * 编辑弹窗数据参数
 */
export type MoEditDialogParams<T extends Record<string, any>> = {
    /** 数据 */
    data?: T;
};

/**
 * 编辑弹窗参数
 */
export type MoEditDialogProps<T extends Record<string, any>> = {
    /** 配置 */
    config: MoEditDialogConfig<T>;
    /** 参数 */
    params: MoEditDialogParams<T>;
};
</script>

<template>
    <el-dialog
        modal-class="mo-edit-dialog"
        v-model="visible"
        :title="title"
        :width="props.config.width"
        @open="() => moFormRef?.clearValidate()"
        @closed="() => (formData = undefined)"
    >
        <mo-form
            ref="moFormRef"
            :data="formData"
            :components="props.config.components"
            :primaryKey="props.config.primaryKey"
            :rules="props.config.rules"
            :size="props.config.size"
            :labelWidth="props.config.labelWidth"
            :watch="props.config.watch"
            :initData="props.config.initData"
        ></mo-form>
        <template #footer>
            <el-button @click="emits('cancel')">取消</el-button>
            <el-button type="primary" @click="confirmClickEvent">确定</el-button>
        </template>
    </el-dialog>
</template>

<style>
.mo-edit-dialog.el-overlay,
.mo-edit-dialog.el-overlay .el-overlay-dialog {
    position: absolute;
}
</style>
