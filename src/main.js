import Vue from 'vue'
import App from './App.vue'
import Element from "element-ui";
import MultiCascader from "./components/index";

Vue.config.productionTip = false

Vue.use(Element);
Vue.use(MultiCascader);

new Vue({
  render: h => h(App),
}).$mount('#app')
