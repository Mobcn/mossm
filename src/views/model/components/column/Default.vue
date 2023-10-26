<script lang="ts" setup>
import { VxeTableInstance } from 'vxe-table';
import type { RowVO } from '../MainTable.vue';

const props = defineProps<{
    row: RowVO;
    tableRef?: VxeTableInstance<RowVO>;
}>();

const { row } = toRefs(props);
</script>

<template>
    <div>
        <VxeInput v-if="row.type === 'String'" v-model="row.default"></VxeInput>
        <VxeInput
            v-if="row.type === 'Number'"
            type="number"
            v-model="row.default"
            @change="({ $event }) => tableRef?.clearEdit($event)"
        ></VxeInput>
        <VxeSelect
            v-if="row.type === 'Date'"
            v-model="row.default"
            clearable
            @change="({ $event }) => tableRef?.clearEdit($event)"
        >
            <VxeOption value="Date.now" label="Date.now"></VxeOption>
        </VxeSelect>
        <VxeSelect
            v-if="row.type === 'Boolean'"
            v-model="row.default"
            clearable
            @change="({ $event }) => tableRef?.clearEdit($event)"
        >
            <VxeOption :value="false" label="否"></VxeOption>
            <VxeOption :value="true" label="是"></VxeOption>
        </VxeSelect>
    </div>
</template>

<style scoped></style>
