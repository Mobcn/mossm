<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

// 表单数据组件
const formComponent = ref<FormInstance>();
// 表单数据对象
const form = reactive({
    username: '',
    password: ''
});

// 校验规则
const rules: FormRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'none' }],
    password: [{ required: true, message: '请输入密码', trigger: 'none' }]
};

/**
 * 保存事件
 */
const handleSave = () => {
    formComponent.value?.validate((valid) => {
        if (valid) {
            systemService
                .chsetting({ ...form })
                .then(() => {
                    ElMessage({ message: '保存成功!', type: 'success' });
                })
                .catch((error) => {
                    window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
                    ElMessage({ message: '保存失败！', type: 'error' });
                });
        }
    });
};
</script>

<template>
    <div class="h-full flex justify-center">
        <el-card class="min-w-210 w-3/5">
            <template #header>
                <div class="flex items-center justify-between">
                    <span>系统配置</span>
                    <el-button type="primary" @click="handleSave">保存</el-button>
                </div>
            </template>
            <el-form :model="form" ref="formComponent" :rules="rules" label-width="110px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" placeholder="admin" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password" placeholder="******" show-password />
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped></style>
