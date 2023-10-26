<script setup lang="ts">
import MoIcon from '@/components/icons/MoIcon.vue';

/** 参数 */
const props = defineProps<MoToolbarProps>();

/** 回调 */
const emits = defineEmits<{
    /** 添加 */
    add: [];
    /** 批量删除 */
    deleteBatch: [];
    /** 刷新 */
    refresh: [];
}>();
</script>
<script lang="ts">
/** 按钮类型 */
type ButtonEmun = 'add' | 'deleteBatch';

/** 工具栏参数 */
export type MoToolbarProps = {
    /** 工具栏按钮数组 */
    buttons: ButtonEmun[];
    size?: 'small' | 'default' | 'large';
};
</script>

<template>
    <div class="flex items-center justify-between">
        <div>
            <template v-for="item in props.buttons">
                <el-button v-if="item === 'add'" type="primary" :size="props.size" @click="emits('add')">
                    <template #icon>
                        <el-icon><mo-icon icon-name="plus-lg"></mo-icon></el-icon>
                    </template>
                    <span>添加</span>
                </el-button>
                <el-button
                    v-else-if="item === 'deleteBatch'"
                    type="danger"
                    :size="props.size"
                    @click="emits('deleteBatch')"
                >
                    <template #icon>
                        <el-icon><mo-icon icon-name="trash3"></mo-icon></el-icon>
                    </template>
                    <span>批量删除</span>
                </el-button>
            </template>
        </div>
        <el-button :size="props.size" title="刷新" circle @click="emits('refresh')">
            <template #icon>
                <el-icon><mo-icon icon-name="arrow-clockwise"></mo-icon></el-icon>
            </template>
        </el-button>
    </div>
</template>

<style scoped></style>
