<script setup lang="ts">
import MoGrid from '@/components/grid/MoGrid.vue';
import MoCodeEditor from './components/MoCodeEditor.vue';
import type { MoGridProps } from '@/components/grid/MoGrid.vue';
import type { API, SaveAPI, UpdateAPI } from '@/api/api-service';
import type { Model } from '@/api/model-service';
import type { ParamItem } from '@/utils/handler-template';
import type { CustomWatch, SelectOptionsLoad } from '@/components/grid/components/MoForm.vue';

/** 表格行数据类型 */
type GridRow = Omit<API, '_id'> & { _id?: string };

/** 模型缓存 */
const modelCache = new Map<string, ModelItem>();
const modelListCache = new Map<string, ModelItem[]>();

/** 类型选择项 */
const typeOptions = [
    { label: '查询', value: 'SELECT' },
    { label: '新增', value: 'INSERT' },
    { label: '修改', value: 'UPDATE' },
    { label: '删除', value: 'DELETE' }
];

/**
 * 加载模块
 */
const loadModule: SelectOptionsLoad<GridRow> = (() => {
    let cache: { label: string; value: string }[] | undefined;
    return async (_editDataRef, isContinue) => {
        if (cache) {
            return cache;
        }
        const list = await moduleService.all();
        isContinue.value = false;
        return (cache = list.map((item) => ({ label: item, value: item })));
    };
})();

/**
 * 监听模块值变化
 */
const watchModule: CustomWatch<GridRow> = (editDataRef) => {
    !editDataRef.value.module && (editDataRef.value.model = '');
};

/**
 * 加载模型
 */
const loadModel: SelectOptionsLoad<GridRow> = (() => {
    const cache = new Map<string, { label: string; value: string }[]>();
    return async (editDataRef) => {
        const module = editDataRef.value.module;
        if (!module) {
            return [];
        }
        if (cache.has(module)) {
            return cache.get(module)!;
        }
        const list = await modelService.all(module);
        const modelItemList: ModelItem[] = [];
        modelListCache.set(module, modelItemList);
        const options = list.map((item) => {
            const modelItem: ModelItem = { ...item, schema: eval('(' + item.property + ')') };
            modelCache.set(module + '#' + item.name, modelItem);
            modelItemList.push(modelItem);
            return { label: item.name, value: item.name };
        });
        cache.set(module, options);
        return options;
    };
})();

/** 表组件参数 */
const gridProps: MoGridProps<GridRow> = {
    search: {
        components: [
            {
                type: 'select',
                name: 'module',
                label: '模块：',
                placeholder: '请选择模块',
                options: loadModule
            },
            {
                type: 'select',
                name: 'model',
                label: '模型：',
                placeholder: '请选择模型',
                disabled: (editData) => editData.module === '',
                options: loadModel
            }
        ],
        watch: [watchModule]
    },
    toolbar: {
        buttons: ['add', 'deleteBatch']
    },
    table: {
        columns: [
            {
                prop: 'path',
                label: '接口地址',
                minWidth: 300,
                format: (row) =>
                    `/${row.module}/${row.model.replace(row.model[0], row.model[0].toLowerCase())}${row.path}`
            },
            {
                prop: 'type',
                label: '类型',
                minWidth: 90,
                format: (row) =>
                    row.customize ? '自定义' : typeOptions.find((item) => item.value === row.type)?.label || '-'
            },
            { prop: 'authorized', label: '是否验证', minWidth: 90, format: (row) => (row.authorized ? '是' : '否') },
            { prop: 'method', label: '请求方法', minWidth: 90 },
            { prop: 'status', label: '状态', minWidth: 60, format: (row) => (row.status ? '开启' : '关闭') },
            {
                prop: 'create_time',
                label: '创建时间',
                width: 170,
                format: (row) => new Date(row.create_time).toLocaleString()
            },
            {
                prop: 'update_time',
                label: '更新时间',
                width: 170,
                format: (row) => new Date(row.update_time).toLocaleString()
            }
        ],
        operations: ['delete', 'edit']
    },
    pagination: { limit: 10 },
    editDialog: {
        initData: {
            authorized: false,
            customize: false,
            type: 'SELECT',
            method: 'GET',
            success_message: '成功!',
            error_message: '失败!',
            status: true
        },
        components: [
            {
                type: 'select',
                name: 'module',
                label: '模块：',
                placeholder: '请选择模块',
                options: loadModule
            },
            {
                type: 'select',
                name: 'model',
                label: '模型：',
                placeholder: '请选择模型',
                disabled: (editData) => editData.module === '',
                options: loadModel
            },
            {
                type: 'input',
                name: 'path',
                label: '路径：',
                placeholder: '请输入路径'
            },
            {
                type: 'select',
                name: 'method',
                label: '请求方法：',
                options: [
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' }
                ]
            },
            {
                type: 'switch',
                name: 'authorized',
                label: '是否验证：'
            },
            {
                type: 'switch',
                name: 'customize',
                label: '自定义处理：'
            },
            {
                type: 'custom',
                name: 'raw_handler',
                label: '处理器：',
                component: MoCodeEditor,
                height: 500,
                placeholder: '请输入处理器',
                params: async (editDataRef) => {
                    const module = editDataRef.value.module;
                    const model = editDataRef.value.model;
                    if (!model) {
                        return {};
                    }
                    const modelItem = await getModelItem(module, model);
                    const modelItems = modelListCache.get(module);
                    return { modelItem, modelItems };
                },
                visible: (editData) => editData.customize === 'true'
            },
            {
                type: 'select',
                name: 'type',
                label: '类型：',
                options: typeOptions,
                visible: (editData) => editData.customize !== 'true'
            },
            {
                type: 'select',
                name: 'input_fields',
                label: '参数字段：',
                multiple: true,
                width: '100%',
                visible: (editData) => editData.customize !== 'true',
                disabled: (editData) => editData.model === '',
                options: async (editDataRef) => {
                    const model = editDataRef.value.model;
                    if (!model) {
                        return [];
                    }
                    const module = editDataRef.value.module;
                    const modelItem = await getModelItem(module, model);
                    const keys = ['_id', ...Object.keys(modelItem.schema)];
                    return keys.map((item) => ({ label: item, value: item }));
                }
            },
            {
                type: 'select',
                name: 'output_fields',
                label: '数据字段：',
                multiple: true,
                width: '100%',
                visible: (editData) => editData.customize !== 'true' && editData.type === 'SELECT',
                disabled: (editData) => editData.model === '',
                options: async (editDataRef) => {
                    const model = editDataRef.value.model;
                    if (!model) {
                        return [];
                    }
                    const module = editDataRef.value.module;
                    const modelItem = await getModelItem(module, model);
                    const keys = Object.keys(modelItem.schema);
                    return keys.map((item) => ({ label: item, value: item }));
                }
            },
            {
                type: 'input',
                name: 'where',
                label: '过滤条件：',
                placeholder: '请输入过滤条件',
                visible: (editData) =>
                    editData.customize !== 'true' && editData.type !== '' && editData.type !== 'INSERT'
            },
            {
                type: 'input',
                name: 'success_message',
                label: '成功消息：',
                placeholder: '请输入成功消息',
                visible: (editData) => editData.customize !== 'true'
            },
            {
                type: 'input',
                name: 'error_message',
                label: '失败消息：',
                placeholder: '请输入失败消息',
                visible: (editData) => editData.customize !== 'true'
            },
            {
                type: 'switch',
                name: 'status',
                label: '状态：',
                visible: (editData) => editData._id !== ''
            }
        ],
        rules: {
            module: [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
            model: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
            path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
            handler: [{ required: true, message: '请输入处理器', trigger: 'blur' }]
        },
        watch: [
            watchModule,
            (editDataRef) => {
                if (
                    editDataRef.value?.customize?.toString() === 'false' &&
                    editDataRef.value.module &&
                    editDataRef.value.model
                ) {
                    let input_fields: any = editDataRef.value.input_fields;
                    let output_fields: any = editDataRef.value.output_fields;
                    input_fields instanceof Array && (input_fields = input_fields.join(','));
                    output_fields instanceof Array && (output_fields = output_fields.join(','));
                    generateHandler({
                        module: editDataRef.value.module,
                        model: editDataRef.value.model,
                        type: editDataRef.value.type,
                        input_fields,
                        output_fields,
                        where: editDataRef.value.where,
                        success_message: editDataRef.value.success_message,
                        error_message: editDataRef.value.error_message
                    }).then((handlerText) => (editDataRef.value.raw_handler = handlerText));
                }
            }
        ],
        width: '80%',
        labelWidth: 110
    },
    api: {
        list: async ({ page, limit, searchData }) => {
            const module = searchData?.module || undefined;
            const model = searchData?.model || undefined;
            return await apiService.list({ module, model, page, limit });
        },
        add: async (editData) => {
            const saveData: SaveAPI = {
                module: editData.module,
                model: editData.model,
                path: editData.path,
                authorized: editData.authorized === 'true',
                method: editData.method,
                raw_handler: editData.raw_handler,
                customize: true
            };
            if (editData.customize === 'false') {
                Object.assign(saveData, {
                    customize: false,
                    type: editData.type,
                    input_fields: editData.input_fields,
                    output_fields: editData.output_fields,
                    where: editData.where,
                    success_message: editData.success_message,
                    error_message: editData.error_message
                });
            }
            await apiService.save(saveData);
        },
        update: async (editData) => {
            const updateData: UpdateAPI = {
                _id: editData._id,
                module: editData.module,
                model: editData.model,
                path: editData.path,
                authorized: editData.authorized === 'true',
                method: editData.method,
                customize: true,
                raw_handler: editData.raw_handler,
                status: editData.status === 'true'
            };
            if (editData.customize === 'false') {
                Object.assign(updateData, {
                    customize: false,
                    type: editData.type,
                    input_fields: editData.input_fields,
                    output_fields: editData.output_fields,
                    where: editData.where,
                    success_message: editData.success_message,
                    error_message: editData.error_message
                });
            }
            await apiService.update(updateData);
        },
        remove: async ({ _id }) => {
            _id && (await apiService.remove(_id));
        },
        removeBatch: async (removeDatas) => {
            await apiService.remove(removeDatas.map((item) => item._id!));
        }
    }
};

/**
 * 生成处理器
 */
async function generateHandler({
    module,
    model,
    type = 'SELECT',
    input_fields = '',
    output_fields = '',
    where = '',
    success_message = '成功!',
    error_message = '失败!'
}: {
    /** 模块 */
    module: string;
    /** 模型 */
    model: string;
    /** 类型 */
    type?: string;
    /** 参数字段 */
    input_fields?: string;
    /** 数据字段 */
    output_fields?: string;
    /** 过滤条件 */
    where?: string;
    /** 成功信息 */
    success_message?: string;
    /** 错误信息 */
    error_message?: string;
}) {
    const params: ParamItem[] = [];
    if (input_fields !== '') {
        const paramFields = input_fields.split(',');
        const modelItem = await getModelItem(module, model);
        const schema = modelItem.schema;
        paramFields.forEach((field) => {
            const prop = schema[field];
            const type: any = 'type' in prop ? prop.type.name : prop.name;
            params.push({ name: field, type });
        });
    }
    if (type === 'SELECT') {
        const selectString = output_fields.replace(/,/g, ' ');
        return selectHandlerTemplate(params, selectString, where, success_message, error_message);
    }
    if (type === 'INSERT') {
        return insertHandlerTemplate(params, success_message, error_message);
    }
    if (type === 'UPDATE') {
        return updateHandlerTemplate(params, where, success_message, error_message);
    }
    if (type === 'DELETE') {
        return deleteHandlerTemplate(params, success_message, error_message);
    }
    return commonHandlerTemplate(params, 'let data = {};', success_message, error_message);
}

/**
 * 获取模型
 */
async function getModelItem(module: string, model: string): Promise<ModelItem> {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const modelItem = modelCache.get(module + '#' + model);
            if (modelItem) {
                resolve(modelItem);
                clearInterval(interval);
            }
        }, 500);
    });
}
</script>
<script lang="ts">
/**
 * 模型项
 */
export type ModelItem = Model & {
    /** 模型属性结构 */
    schema: Record<string, Function | { type: Function; [x: string]: any }>;
};
</script>

<template>
    <mo-grid v-bind="gridProps"></mo-grid>
</template>

<style scoped></style>
