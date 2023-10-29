<script setup lang="ts">
import MoIcon from '@/components/icons/MoIcon.vue';
import { ElMessage } from 'element-plus';
import CanvasNest from 'canvas-nest.js';
import type { FormInstance } from 'element-plus';
import type { ProvideChangePage } from '@/App.vue';

/** 表单元素对象 */
const formRef = ref<FormInstance>();
/** 表单对象 */
const form = reactive({
    username: '',
    password: ''
});

/** 是否加载中 */
const loading = ref(false);

/** 校验规则 */
const rules = {
    username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
    password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
};

// Canvas设置
let canvasNest: CanvasNest | undefined;
onMounted(() => (canvasNest = new CanvasNest(document.body)));
onUnmounted(() => canvasNest?.destroy());

/** 页面修改 */
const changePage = inject<ProvideChangePage>('changePage', () => {
    throw new Error('找不到changePage方法');
});

/**
 * 登录
 */
function login() {
    const $form = formRef.value;
    if ($form) {
        $form.validate(async (valid) => {
            if (valid) {
                let loginSuccess = false;
                try {
                    loading.value = true;
                    const { token } = await systemService.login(form.username, form.password);
                    ElMessage({ message: '登录成功！', type: 'success' });
                    storage.set('token', token);
                    loginSuccess = true;
                } catch (error) {
                    window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
                    ElMessage({ message: '登录失败！', type: 'error' });
                } finally {
                    loading.value = false;
                }
                if (loginSuccess) {
                    try {
                        changePage(import('@/views/dashboard/MoDashboard.vue'));
                    } catch (error) {
                        window.process.env.VUE_APP_ENV !== 'production' && console.error(error);
                        ElMessage({ message: '跳转失败！', type: 'error' });
                    }
                }
            }
        });
    }
}
</script>

<template>
    <div class="mo-login" v-loading="loading" element-loading-text="登录中...">
        <div class="mo-login__background" />
        <div class="mo-login__panel">
            <div class="mo-login__title">MOSSM 登录</div>
            <el-form
                class="mo-login__form"
                :model="form"
                :rules="rules"
                ref="formRef"
                label-width="0px"
                @submit.native.prevent
            >
                <el-form-item class="mo-login__item" prop="username">
                    <el-input class="mo-login__input" v-model="form.username" placeholder="用户名">
                        <template #prepend>
                            <el-icon><mo-icon icon-name="person-fill" /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item class="mo-login__item" prop="password">
                    <el-input
                        class="mo-login__input"
                        type="password"
                        placeholder="密码"
                        v-model="form.password"
                        @keyup.enter.native="login"
                    >
                        <template #prepend>
                            <el-icon><mo-icon icon-name="lock-fill" /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item class="mo-login__item--last">
                    <el-button class="mo-login__button" type="primary" @click="login">登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<style scoped>
.mo-login {
    height: 100vh;
    --mo-login-background-image: linear-gradient(rgb(135, 206, 235, 0), rgb(135, 206, 235, 0.5), rgb(135, 206, 235, 1));
    --mo-login-panel-background: #fff80;
    --mo-login-panel-box-shadow: 0 0 10px #000;
    --mo-login-title-font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
        '微软雅黑', Arial, sans-serif;
    --mo-login-title-font-size: 30px;
    --mo-login-title-color: #000;
}

.mo-login__background {
    position: fixed;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: var(--mo-login-background-image);
}

.mo-login__panel {
    position: relative;
    top: 15vh;
    overflow: hidden;
    width: 24vw;
    height: 18vw;
    margin: 0 auto;
    border-radius: 5px;
    background: var(--mo-login-panel-background);
    box-shadow: var(--mo-login-panel-box-shadow);
}

.mo-login__title {
    font-family: var(--mo-login-title-font-family);
    font-size: var(--mo-login-title-font-size);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3.67vw;
    color: var(--mo-login-title-color);
    border-bottom: 1px solid #ddd;
}

.mo-login__form.el-form {
    padding: 1.92vw;
}

.mo-login__item.el-form-item {
    margin-bottom: 1.34vw;
}
.mo-login__item--last.el-form-item {
    margin-bottom: 0;
}

.mo-login__input.el-input {
    height: 2.4vw;
}

.mo-login__button.el-button {
    width: 100%;
    height: 2.4vw;
    text-align: center;
}
</style>
