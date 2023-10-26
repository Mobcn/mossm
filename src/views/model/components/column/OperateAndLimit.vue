<script lang="ts" setup>
import { VxeTableInstance } from 'vxe-table';
import type { RowVO } from '../MainTable.vue';

const props = defineProps<{
    row: RowVO;
    tableRef?: VxeTableInstance<RowVO>;
}>();

const { row, tableRef: table } = toRefs(props);

/**
 * 修改
 */
function change({ $event }: { $event?: Event }) {
    let operateAndLimit = '';
    const { lowercase, uppercase, trim, minlength, maxlength, min, max } = row.value;
    lowercase && (operateAndLimit += `lowercase:${lowercase};`);
    uppercase && (operateAndLimit += `uppercase:${uppercase};`);
    trim && (operateAndLimit += `trim:${trim};`);
    minlength !== undefined && (operateAndLimit += `minlength:${minlength};`);
    maxlength !== undefined && (operateAndLimit += `maxlength:${maxlength};`);
    min !== undefined && (operateAndLimit += `min:${min};`);
    max !== undefined && (operateAndLimit += `max:${max};`);
    row.value.operateAndLimit = operateAndLimit;
    $event && table?.value?.clearEdit($event);
}
</script>

<template>
    <div>
        <div v-if="row.type === 'String'">
            <span class="h-28px inline-block px-10px box-border b-1 b-#dcdfe6 b-solid rounded vertical-bottom">
                <VxeCheckbox v-model="row.lowercase" @change="change">lowercase</VxeCheckbox>
                <VxeCheckbox v-model="row.uppercase" @change="change">uppercase</VxeCheckbox>
                <VxeCheckbox v-model="row.trim" @change="change">trim</VxeCheckbox>
            </span>
            <span>
                <VxeInput
                    class-name="w-100px! inline-block! ml-2"
                    type="number"
                    v-model="row.minlength"
                    :max="row.maxlength"
                    placeholder="最短长度"
                    @change="change"
                    @blur="() => change({})"
                ></VxeInput>
                <span class="m2">~</span>
                <VxeInput
                    class-name="w-100px! inline-block!"
                    type="number"
                    v-model="row.maxlength"
                    :min="row.minlength"
                    placeholder="最长长度"
                    @change="change"
                    @blur="() => change({})"
                ></VxeInput>
            </span>
        </div>
        <div v-if="row.type === 'Number'">
            <VxeInput
                class-name="w-222px! inline-block!"
                type="number"
                v-model="row.min"
                :max="row.max"
                placeholder="最小值"
                @change="change"
                @blur="() => change({})"
            ></VxeInput>
            <span class="m2">~</span>
            <VxeInput
                class-name="w-222px! inline-block!"
                type="number"
                v-model="row.max"
                :min="row.min"
                placeholder="最大值"
                @change="change"
                @blur="() => change({})"
            ></VxeInput>
        </div>
        <div v-if="row.type === 'Date'">
            <VxeInput
                class-name="w-222px! inline-block!"
                type="datetime"
                v-model="row.min"
                :disabled-method="({ date }) => (row.max ? date.getTime() >= new Date(row.max).getTime() : false)"
                placeholder="最早时间"
                @change="change"
                value-format="yyyy-MM-ddTHH:mm:ss.sssZ"
            ></VxeInput>
            <span class="m2">~</span>
            <VxeInput
                class-name="w-222px! inline-block!"
                type="datetime"
                v-model="row.max"
                :disabled-method="({ date }) => (row.min ? date.getTime() <= new Date(row.min).getTime() : false)"
                placeholder="最晚时间"
                @change="change"
                value-format="yyyy-MM-ddTHH:mm:ss.sssZ"
            ></VxeInput>
        </div>
        <span v-if="row.type === 'Boolean'">-</span>
    </div>
</template>

<style scoped></style>
