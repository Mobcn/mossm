(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const s of e.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function o(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function i(t){if(t.ep)return;t.ep=!0;const e=o(t);fetch(t.href,e)}})();const _="modulepreload",v=function(n,r){return new URL(n,r).href},p={},u=function(r,o,i){if(!o||o.length===0)return r();const t=document.getElementsByTagName("link");return Promise.all(o.map(e=>{if(e=v(e,i),e in p)return;p[e]=!0;const s=e.endsWith(".css"),h=s?'[rel="stylesheet"]':"";if(!!i)for(let a=t.length-1;a>=0;a--){const l=t[a];if(l.href===e&&(!s||l.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${e}"]${h}`))return;const c=document.createElement("link");if(c.rel=s?"stylesheet":_,s||(c.as="script",c.crossOrigin=""),c.href=e,document.head.appendChild(c),s)return new Promise((a,l)=>{c.addEventListener("load",a),c.addEventListener("error",()=>l(new Error(`Unable to preload CSS for ${e}`)))})})).then(()=>r()).catch(e=>{const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=e,window.dispatchEvent(s),!s.defaultPrevented)throw e})},d={set:async(n,r)=>localforage.setItem(n,r),get:async n=>localforage.getItem(n),remove:async n=>localforage.removeItem(n)},m=Vue.reactive({screenWidth:window.screen.width,theme:"light"});window.onresize=()=>{m.screenWidth=window.screen.width};Vue.watch(()=>m.theme,(n,r)=>{const o=document.querySelector("html");o&&(o.classList.remove(r),o.classList.add(n),d.set("mo-theme",n))});const y=Vue.defineComponent({__name:"App",setup(n){const r=Vue.ref(null);async function o(i){i instanceof Promise?r.value=Vue.markRaw((await i).default):r.value=i}return Vue.provide("changePage",o),(async()=>{window.process??(window.process={env:{VUE_APP_ENV:"production"}}),await d.get("mo-theme")==="dark"&&(m.theme="dark");try{await d.get("token")?o(u(()=>import("./MoDashboard-a9a2014b.js"),["./MoDashboard-a9a2014b.js","./system-service-151aefe7.js","./MoDashboard-23df4742.css"],import.meta.url)):o(u(()=>import("./Login-36296065.js"),["./Login-36296065.js","./system-service-151aefe7.js","./Login-78492ff7.css"],import.meta.url))}catch(i){window.process.env.VUE_APP_ENV!=="production"&&console.error(i),o(u(()=>import("./404-a812f871.js"),[],import.meta.url))}})(),(i,t)=>(Vue.openBlock(),Vue.createBlock(Vue.resolveDynamicComponent(Vue.unref(r))))}});const f=Vue.createApp(y);f.use(ElementPlus,{locale:ElementPlusLocaleZhCn});f.use(VXETable);f.mount("#app");export{u as _,d as a,m as s};