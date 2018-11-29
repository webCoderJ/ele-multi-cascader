import Vue from 'vue'
import App from './App.vue'
import Element from "element-ui";
import EleMultiCascader from "./components/index";

Vue.config.productionTip = false

Vue.use(Element);
Vue.use(EleMultiCascader);

new Vue({
  render: h => h(App),
}).$mount('#app')
