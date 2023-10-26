<script lang="ts" setup>
import { VxeFormPropTypes, VxeFormInstance, VxeModalPropTypes } from 'vxe-table';

/** 参数 */
const props = defineProps<{
    /** 模块集 */
    modules: string[];
}>();

/** 回调 */
const emits = defineEmits<{
    /** 确定 */
    confirm: [data: { module: string; model: string; table: string }];
}>();

/** 是否可视 */
const visible = ref(false);

/** 新建表弹窗数据 */
const addModalData = reactive({ module: '', model: '', table: '' });
/** 新建表弹窗配置 */
const addModalItems = ref<VxeFormPropTypes.Items>([
    {
        children: [
            {
                field: 'module',
                title: '模块名称',
                slots: { default: 'module' },
                span: 24
            },
            {
                field: 'model',
                title: '模型名称',
                itemRender: { name: '$input', props: { placeholder: '请输入模型名称' } },
                span: 24
            },
            {
                field: 'table',
                title: '表名称',
                itemRender: { name: '$input', props: { placeholder: '请输入表名称' } },
                span: 24
            }
        ]
    }
]);
/** 新建表弹窗校验 */
const addModalRules = ref<VxeFormPropTypes.Rules>({
    module: [
        { required: true, content: '模块名称必须填写' },
        { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, content: '必须以字母开头且只包含字母、数字、下划线' }
    ],
    model: [
        { required: true, content: '模型名称必须填写' },
        { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, content: '必须以字母开头且只包含字母、数字、下划线' }
    ],
    table: [
        { required: true, content: '表名称必须填写' },
        { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, content: '必须以字母开头且只包含字母、数字、下划线' }
    ]
});

/** 是否显示下拉容器 */
const showPull = ref(false);
/** 模块列表 */
const moduleList = ref<string[]>([]);

/** 表单元素对象 */
const formRef = ref<VxeFormInstance>();

// 监听模块集修改
watchEffect(() => {
    moduleList.value = props.modules;
});

const focusEvent = () => {
    showPull.value = true;
};
const keyupEvent = () => {
    moduleList.value = addModalData.module
        ? props.modules.filter((item) => item.indexOf(addModalData.module) > -1)
        : props.modules;
};
const selectEvent = (item: string) => {
    addModalData.module = item;
    showPull.value = false;
    moduleList.value = props.modules;
    formRef.value?.clearValidate('module');
};

/** 关闭前事件 */
const beforeHideEvent: VxeModalPropTypes.BeforeHideMethod = async ({ type }) => {
    if (type === 'confirm') {
        const result = await formRef.value?.validate();
        if (result) {
            return new Error();
        } else {
            emits('confirm', addModalData);
        }
    }
};

// 导出
defineExpose({
    /**
     * 打开弹窗
     */
    open: async () => {
        Object.assign(addModalData, { module: '', model: '', table: '' });
        visible.value = true;
    }
});
</script>

<template>
    <VxeModal
        v-model="visible"
        width="400"
        title="新建表"
        type="confirm"
        show-footer
        :before-hide-method="beforeHideEvent"
    >
        <VxeForm
            ref="formRef"
            :data="addModalData"
            :items="addModalItems"
            :rules="addModalRules"
            title-width="85"
            title-align="right"
            titleColon
        >
            <template #module="{ data }">
                <VxePulldown v-model="showPull" class-name="w-full">
                    <template #default>
                        <VxeInput
                            v-model="data.module"
                            placeholder="请输入模块名称"
                            @focus="focusEvent"
                            @keyup="keyupEvent"
                        ></VxeInput>
                    </template>
                    <template #dropdown>
                        <div class="my-dropdown1">
                            <div class="list-item1" v-for="mod in moduleList" :key="mod" @click="selectEvent(mod)">
                                <span>{{ mod }}</span>
                            </div>
                        </div>
                    </template>
                </VxePulldown>
            </template>
        </VxeForm>
    </VxeModal>
</template>

<style scoped>
.my-dropdown1 {
    max-height: 200px;
    overflow: auto;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background-color: #fff;
}
.list-item1:hover {
    background-color: #f5f7fa;
}
</style>
