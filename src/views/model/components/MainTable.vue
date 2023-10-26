<script lang="ts" setup>
import { VXETable, VxeTableEvents, VxeTableInstance, VxeTablePropTypes, VxeToolbarInstance } from 'vxe-table';
import OperateAndLimit from './column/OperateAndLimit.vue';
import TypeSelect from './column/TypeSelect.vue';
import Default from './column/Default.vue';
import Preview from './modal/Preview.vue';
import type { TableProperty } from '../MoModel.vue';

/** 回调 */
const emits = defineEmits<{
    /** 保存表字段属性 */
    saveProperty: [property: Record<string, TableProperty>];
}>();

/** 表字段属性 */
const property = defineModel<Record<string, TableProperty>>();

/** 表字段列表 */
const fieldList = ref<RowVO[]>([]);
/** 是否存在修改 */
const isModify = ref(false);

/** 表格元素对象 */
const tableRef = ref<VxeTableInstance<RowVO>>();
/** 工具栏元素对象 */
const toolbarRef = ref<VxeToolbarInstance>();

/** 预览弹窗是否可视 */
const previewVisible = ref(false);
/** 预览弹窗文本 */
const previewText = ref('');

/** 校验规则 */
const validRules = ref<VxeTablePropTypes.EditRules>({
    name: [
        {
            required: true,
            validator: ({ $table, cellValue, rowIndex }) => {
                if (!cellValue) {
                    return new Error('名称必须填写');
                }
                if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(cellValue)) {
                    return new Error('必须以字母开头且只包含字母、数字、下划线');
                }
                const { tableData } = $table.getTableData();
                for (let i = 0; i < rowIndex; ++i) {
                    if (tableData[i].name === cellValue) {
                        return new Error('不能存在相同的名称');
                    }
                }
            }
        }
    ]
});

// 监听表属性更改
watchEffect(() => {
    if (property.value) {
        fieldList.value = Object.entries(property.value).map(([name, props]) => ({
            name,
            operateAndLimit: getOperateAndLimitStr(props),
            ...props
        })) as RowVO[];
    } else {
        fieldList.value = [];
    }
    isModify.value = false;
});

/** 右键菜单项设置 */
const menuConfig = reactive<VxeTablePropTypes.MenuConfig<RowVO>>({
    body: {
        options: [
            [
                { code: 'add', name: '添加一行' },
                { code: 'remove', name: '删除当前行' },
                { code: 'remove-checked', name: '删除选择行' }
            ],
            [
                { code: 'copy', name: '复制当前行' },
                { code: 'copy-checked', name: '复制选择行' },
                { code: 'paste', name: '粘贴' }
            ]
        ]
    },
    visibleMethod: ({ options, row }) => {
        const $table = tableRef.value;
        if (!$table || !row) {
            options[0][1].visible = false;
            options[0][2].visible = false;
            options[1][0].visible = false;
            options[1][1].visible = false;
        } else if (row) {
            options[0][1].visible = true;
            options[1][0].visible = true;

            const isChecked = $table.isCheckedByCheckboxRow(row);
            options[0][2].visible = isChecked;
            options[1][1].visible = isChecked;
        }
        navigator.clipboard.readText().then((text) => (options[1][2].visible = text.startsWith('#VXETable#')));
        return true;
    }
});

/** 右键菜单项事件 */
const contextMenuClickEvent: VxeTableEvents.MenuClick<RowVO> = ({ $table, menu, row }) => {
    switch (menu.code) {
        case 'add':
            addRows();
            break;
        case 'remove':
            $table.remove(row);
            refreshModify();
            break;
        case 'remove-checked':
            $table.removeCheckboxRow();
            refreshModify();
            break;
        case 'copy':
            copy([row]);
            break;
        case 'copy-checked':
            copy($table.getCheckboxRecords());
            break;
        case 'paste':
            paste();
            break;
    }
};

/** 编辑状态关闭事件 */
const editClosedEvent: VxeTableEvents.EditClosed<RowVO> = () => {
    refreshModify();
};

/**
 * 还原
 */
function revert() {
    const $table = tableRef.value;
    if ($table) {
        $table.revertData();
        isModify.value = false;
    }
}

/**
 * 保存
 * 
 * @param data 数据
 */
async function save(data?: RowVO[]) {
    const $table = tableRef.value;
    if ($table && property.value) {
        const result = await $table.validate(true);
        if (!result) {
            const fullData = data ?? $table.getTableData().fullData;
            const newProperty: { [x: string]: TableProperty } = {};
            fullData.forEach((item) => {
                const field: RowVO = {
                    type: item.type
                };
                item.required && (field.required = item.required);
                item.unique && (field.unique = item.unique);
                item.default != null && (field.default = item.default);
                if (item.type === 'String') {
                    item.lowercase && (field.lowercase = item.lowercase);
                    item.uppercase && (field.uppercase = item.uppercase);
                    item.trim && (field.trim = item.trim);
                    item.minlength !== undefined && (field.minlength = item.minlength);
                    item.maxlength !== undefined && (field.maxlength = item.maxlength);
                } else if (item.type === 'Number' || item.type === 'Date') {
                    item.min !== undefined && (field.min = item.min);
                    item.max !== undefined && (field.max = item.max);
                }
                newProperty[item.name!] = Object.assign({}, field);
            });
            emits('saveProperty', (property.value = newProperty));
            return true;
        }
    }
    return false;
}

/**
 * 添加
 */
function addRows(rows?: RowVO[]) {
    const $table = tableRef.value;
    if ($table) {
        if (rows) {
            $table.insertAt(rows, -1);
            isModify.value = rows.length > 0;
        } else {
            $table.insertAt({ type: 'String' }, -1);
            isModify.value = true;
        }
    }
}

/**
 * 删除已选择的行
 */
async function removeCheckedRow() {
    const $table = tableRef.value;
    if ($table) {
        const rows = $table.getCheckboxRecords();
        if (!rows || rows.length < 1) {
            VXETable.modal.message({ content: '请选择至少一行数据', status: 'warning' });
            return;
        }
        const type = await VXETable.modal.confirm('您确定要删除已选择的行吗？');
        if (type === 'confirm') {
            $table.removeCheckboxRow();
            refreshModify();
        }
    }
}

/**
 * 复制
 */
function copy(rows: RowVO[]) {
    const copyStr = JSON.stringify(rows.map((row) => Object.assign({}, row, { _X_ROW_KEY: undefined })));
    navigator.clipboard.writeText('#VXETable#' + copyStr);
}

/**
 * 粘贴
 */
function paste() {
    navigator.clipboard.readText().then((text) => addRows(JSON.parse(text.replace('#VXETable#', ''))));
}

/**
 * 预览
 */
function preview() {
    if (property.value) {
        previewText.value = property2codeText(property.value);
        previewVisible.value = true;
    }
}

/**
 * 刷新修改状态
 */
function refreshModify() {
    const $table = tableRef.value;
    if ($table) {
        const { insertRecords, removeRecords, updateRecords } = $table.getRecordset();
        isModify.value = insertRecords.length > 0 || removeRecords.length > 0 || updateRecords.length > 0;
    }
}

/**
 * 获取[操作/限制]字符串
 */
function getOperateAndLimitStr({ lowercase, uppercase, trim, minlength, maxlength, min, max }: RowVO) {
    let operateAndLimit = '';
    lowercase && (operateAndLimit += `lowercase:${lowercase};`);
    uppercase && (operateAndLimit += `uppercase:${uppercase};`);
    trim && (operateAndLimit += `trim:${trim};`);
    minlength !== undefined && (operateAndLimit += `minlength:${minlength};`);
    maxlength !== undefined && (operateAndLimit += `maxlength:${maxlength};`);
    min !== undefined && (operateAndLimit += `min:${min};`);
    max !== undefined && (operateAndLimit += `max:${max};`);
    return operateAndLimit;
}

// 将表格和工具栏进行关联
nextTick(() => {
    const $table = tableRef.value;
    const $toolbar = toolbarRef.value;
    if ($table && $toolbar) {
        $table.connect($toolbar);
    }
});

// 导出
defineExpose({
    /**
     * 保存检查
     */
    checkSave: async () => {
        if (isModify.value) {
            const result = await VXETable.modal.confirm('当前操作表未保存，是否保存?');
            if (result === 'confirm') {
                return await save();
            }
        }
        return true;
    }
});
</script>
<script lang="ts">
/**
 * 行类型
 */
export type RowVO = {
    /** 表字段名称 */
    name?: string;
    /** 操作/限制 */
    operateAndLimit?: string;
} & TableProperty;
</script>

<template>
    <div class="h-full flex flex-col">
        <div>
            <VxeToolbar ref="toolbarRef" custom size="mini">
                <template #buttons>
                    <VxeButton
                        status="primary"
                        icon="vxe-icon-add"
                        content="添加一行"
                        :disabled="property == null"
                        @click="() => addRows()"
                    ></VxeButton>
                    <VxeButton
                        status="danger"
                        icon="vxe-icon-delete"
                        content="删除"
                        :disabled="property == null"
                        @click="removeCheckedRow"
                    ></VxeButton>
                    <VxeButton
                        v-if="isModify"
                        status="primary"
                        icon="vxe-icon-save"
                        content="保存"
                        @click="() => save()"
                    ></VxeButton>
                </template>
                <template #tools>
                    <VxeButton v-if="isModify" icon="vxe-icon-repeat" title="重置" circle @click="revert"></VxeButton>
                    <VxeButton
                        v-if="!isModify && property && Object.keys(property).length > 0"
                        icon="vxe-icon-eye-fill"
                        title="预览"
                        circle
                        @click="preview"
                    ></VxeButton>
                </template>
            </VxeToolbar>
        </div>
        <div class="flex-1 h-0">
            <VxeTable
                class="field_list"
                ref="tableRef"
                :data="fieldList"
                keep-source
                :edit-config="{ trigger: 'click' }"
                :edit-rules="validRules"
                :row-config="{ isHover: true }"
                :checkbox-config="{ highlight: true, range: true, isShiftKey: true }"
                :menu-config="menuConfig"
                height="auto"
                size="mini"
                align="center"
                @edit-closed="editClosedEvent"
                @menu-click="contextMenuClickEvent"
            >
                <VxeColumn type="checkbox" width="40"></VxeColumn>
                <VxeColumn type="seq" width="40"></VxeColumn>
                <VxeColumn field="name" title="名称" min-width="150" :edit-render="{}">
                    <template #default="{ row }: { row: RowVO }">
                        <VxeInput v-model="row.name"></VxeInput>
                    </template>
                    <template #edit="{ row }: { row: RowVO }">
                        <VxeInput v-model="row.name"></VxeInput>
                    </template>
                </VxeColumn>
                <VxeColumn field="type" title="类型" width="150" :edit-render="{}">
                    <template #default="{ row }: { row: RowVO }">
                        <TypeSelect :row="row" />
                    </template>
                    <template #edit="{ row }: { row: RowVO }">
                        <TypeSelect :row="row" @change="({ $event }) => tableRef?.clearEdit($event)" />
                    </template>
                </VxeColumn>
                <VxeColumn field="operateAndLimit" title="操作 / 限制" width="500" :edit-render="{}">
                    <template #default="{ row }: { row: RowVO }">
                        <OperateAndLimit :row="row" :table-ref="tableRef" />
                    </template>
                    <template #edit="{ row }: { row: RowVO }">
                        <OperateAndLimit :row="row" :table-ref="tableRef" />
                    </template>
                </VxeColumn>
                <VxeColumn field="default" title="默认值" min-width="200" :edit-render="{}">
                    <template #default="{ row }: { row: RowVO }">
                        <Default :row="row" :table-ref="tableRef" />
                    </template>
                    <template #edit="{ row }: { row: RowVO }">
                        <Default :row="row" :table-ref="tableRef" />
                    </template>
                </VxeColumn>
                <VxeColumn field="required" title="非空" width="60" :edit-render="{}">
                    <template #default="{ row }: { row: RowVO }">
                        <VxeCheckbox v-model="row.required"></VxeCheckbox>
                    </template>
                    <template #edit="{ row }: { row: RowVO }">
                        <VxeCheckbox v-model="row.required"></VxeCheckbox>
                    </template>
                </VxeColumn>
                <VxeColumn field="unique" title="唯一" width="60" :edit-render="{}">
                    <template #default="{ row }: { row: RowVO }">
                        <VxeCheckbox v-model="row.unique"></VxeCheckbox>
                    </template>
                    <template #edit="{ row }: { row: RowVO }">
                        <VxeCheckbox v-model="row.unique"></VxeCheckbox>
                    </template>
                </VxeColumn>
            </VxeTable>
        </div>
        <Preview v-model="previewVisible" :text="previewText" title="预览" />
    </div>
</template>

<style scoped>
.field_list :deep(.vxe-cell .vxe-input > .vxe-input--inner) {
    padding: 0 4px;
}
.field_list :deep(.vxe-checkbox .vxe-checkbox--label) {
    line-height: 16px;
}
</style>
