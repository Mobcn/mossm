import { createApp } from 'vue';
import App from '@/App.vue';
import ElementPlus from 'element-plus';
import ElementPlusLocaleZhCn from 'element-plus/dist/locale/zh-cn.min.mjs';
import XEUtils from 'xe-utils';
import {
    VXETable,
    Button,
    Checkbox,
    Column,
    Edit,
    Form,
    Icon,
    Input,
    Keyboard,
    Menu,
    Modal,
    Option,
    Pulldown,
    Select,
    Table,
    Textarea,
    Toolbar,
    Validator
} from 'vxe-table';
import zhCN from 'vxe-table/es/locale/lang/zh-CN';
import 'vxe-table/styles/cssvar.scss';
import 'virtual:uno.css';

const app = createApp(App);

app.use(ElementPlus, {
    locale: ElementPlusLocaleZhCn
});

// 按需加载的方式默认是不带国际化的，自定义国际化需要自行解析占位符 '{0}'，例如：
VXETable.config({
    i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(zhCN, key), args)
});
// 可选组件
app.use(Button);
app.use(Checkbox);
app.use(Column);
app.use(Form);
app.use(Edit);
app.use(Icon);
app.use(Input);
app.use(Keyboard);
app.use(Menu);
app.use(Modal);
app.use(Option);
app.use(Pulldown);
app.use(Select);
app.use(Table);
app.use(Textarea);
app.use(Toolbar);
app.use(Validator);

app.mount('#app');
