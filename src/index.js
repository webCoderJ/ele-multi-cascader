import EleMultiCascader from "./main/main.vue";

/* istanbul ignore if */
/* istanbul ignore next */
EleMultiCascader.install = function(Vue) {
    Vue.component(EleMultiCascader.name, EleMultiCascader);
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  Vue.component(EleMultiCascader.name, EleMultiCascader);
}

export default EleMultiCascader;
