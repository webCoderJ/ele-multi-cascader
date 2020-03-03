import Vue from 'vue'
import App from './App.vue'

import Element from "element-ui"
Vue.use(Element)

import GithubButton from 'vue-github-button';
Vue.component(GithubButton.name, GithubButton)

import eleMultiCascader from "../src/index";
// import 'element-ui/lib/theme-chalk/index.css';
import "ele-multi-cascader/dist/cascader.css";

Vue.use(eleMultiCascader)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
