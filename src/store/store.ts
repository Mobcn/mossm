/**
 * 状态属性
 */
type StoreProps = {
    /** 屏幕宽度 */
    screenWidth: number;
    /** 主题 */
    theme: 'dark' | 'light';
};

// 状态存储
const store = reactive<StoreProps & { [x: string]: any }>({
    screenWidth: window.screen.width,
    theme: 'light'
});

// 监听屏幕宽度变化
window.onresize = () => {
    store.screenWidth = window.screen.width;
};

// 监听主题变化
watch(
    () => store.theme,
    (newTheme, oldTheme) => {
        const html = document.querySelector('html');
        if (html) {
            html.classList.remove(oldTheme);
            html.classList.add(newTheme);
            storage.set('mo-theme', newTheme);
        }
    }
);

export default store;
