<script lang="ts" setup>
import type { RowVO } from '../MainTable.vue';

// 参数
const props = defineProps<{
    row: RowVO;
}>();

// 回调
const emits = defineEmits<{
    change: [{ value: any; $event: Event }];
}>();

const { row } = toRefs(props);

/** 表字段类型列表 */
const typeList: string[] = ['String', 'Number', 'Date', 'Boolean'];
</script>

<template>
    <div>
        <VxeSelect v-model="row.type" @change="({ value, $event }) => emits('change', { value, $event })">
            <VxeOption v-for="item in typeList" :key="item" :value="item" :label="item"></VxeOption>
        </VxeSelect>
    </div>
</template>

<style scoped></style>
