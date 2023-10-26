import{a as d,_ as x}from"./index-9e861b44.js";import{ref as m,reactive as V,inject as y}from"vue";import{a as E,_ as N}from"./system-service-b420b3e1.js";const p=r=>(Vue.pushScopeId("data-v-d8863247"),r=r(),Vue.popScopeId(),r),b={class:"mo-login","element-loading-text":"登录中..."},k=p(()=>Vue.createElementVNode("div",{class:"mo-login__background"},null,-1)),P={class:"mo-login__panel"},S=p(()=>Vue.createElementVNode("div",{class:"mo-login__title"},"MOSSM 登录",-1)),L=Vue.defineComponent({__name:"Login",setup(r){Vue.useCssVars(s=>({"03112a28":Vue.unref(f).backgroundURL}));const i=m(),t=V({username:"",password:""}),l=m(!1),g={username:[{required:!0,message:"用户名不能为空",trigger:"blur"}],password:[{required:!0,message:"密码不能为空",trigger:"blur"}]},f=V({backgroundURL:`url('${d.get("backgroundImageURL")||"/img/background.png"}')`}),v=y("changePage",()=>{throw new Error("找不到changePage方法")});function c(){const s=i.value;s&&s.validate(async e=>{if(e){let n=!1;try{l.value=!0;const{token:o}=await E.login(t.username,t.password);ElementPlus.ElMessage({message:"登录成功！",type:"success"}),d.set("token",o),n=!0}catch(o){window.process.env.VUE_APP_ENV!=="production"&&console.error(o),ElementPlus.ElMessage({message:"登录失败！",type:"error"})}finally{l.value=!1}if(n)try{v(x(()=>import("./MoDashboard-cde2bef4.js"),["./MoDashboard-cde2bef4.js","./index-9e861b44.js","./index-aedd0927.css","./system-service-b420b3e1.js","./MoDashboard-bb56d4f1.css"],import.meta.url))}catch(o){window.process.env.VUE_APP_ENV!=="production"&&console.error(o),ElementPlus.ElMessage({message:"跳转失败！",type:"error"})}}})}return(s,e)=>{const n=Vue.resolveComponent("mo-icon"),o=Vue.resolveComponent("el-icon"),_=Vue.resolveComponent("el-input"),u=Vue.resolveComponent("el-form-item"),w=Vue.resolveComponent("el-button"),h=Vue.resolveComponent("el-form"),C=Vue.resolveDirective("loading");return Vue.withDirectives((Vue.openBlock(),Vue.createElementBlock("div",b,[k,Vue.createElementVNode("div",P,[S,Vue.createVNode(h,{class:"mo-login__form",model:Vue.unref(t),rules:g,ref_key:"formRef",ref:i,"label-width":"0px",onSubmit:e[2]||(e[2]=Vue.withModifiers(()=>{},["prevent"]))},{default:Vue.withCtx(()=>[Vue.createVNode(u,{class:"mo-login__item",prop:"username"},{default:Vue.withCtx(()=>[Vue.createVNode(_,{class:"mo-login__input",modelValue:Vue.unref(t).username,"onUpdate:modelValue":e[0]||(e[0]=a=>Vue.unref(t).username=a),placeholder:"用户名"},{prepend:Vue.withCtx(()=>[Vue.createVNode(o,null,{default:Vue.withCtx(()=>[Vue.createVNode(n,{"icon-name":"person-fill"})]),_:1})]),_:1},8,["modelValue"])]),_:1}),Vue.createVNode(u,{class:"mo-login__item",prop:"password"},{default:Vue.withCtx(()=>[Vue.createVNode(_,{class:"mo-login__input",type:"password",placeholder:"密码",modelValue:Vue.unref(t).password,"onUpdate:modelValue":e[1]||(e[1]=a=>Vue.unref(t).password=a),onKeyup:Vue.withKeys(c,["enter","native"])},{prepend:Vue.withCtx(()=>[Vue.createVNode(o,null,{default:Vue.withCtx(()=>[Vue.createVNode(n,{"icon-name":"lock-fill"})]),_:1})]),_:1},8,["modelValue","onKeyup"])]),_:1}),Vue.createVNode(u,{class:"mo-login__item--last"},{default:Vue.withCtx(()=>[Vue.createVNode(w,{class:"mo-login__button",type:"primary",onClick:c},{default:Vue.withCtx(()=>[Vue.createTextVNode("登录")]),_:1})]),_:1})]),_:1},8,["model"])])])),[[C,Vue.unref(l)]])}}});const R=N(L,[["__scopeId","data-v-d8863247"]]);export{R as default};
