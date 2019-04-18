import EleMultiCascader from "./main/main.vue";

export default {
  install (Vue) {
    const name = EleMultiCascader.name;
    Vue.component(name, EleMultiCascader);
  }
}
