<template>
  <div class="cascader-wrapper">
    <el-popover
      placement="bottom-start"
      trigger="manual"
      :popper-class="popperClass"
      v-model="showPopover"
    >
      <div slot="reference">
        <el-select
          multiple
          v-model="selectedLabels"
          :placeholder="placeholder"
          :disabled="disabled"
          :size="size"
          :collapse-tags="collapseTags"
          style="width: 100%;"
          popper-class="hide-popper"
          @focus="handleFocus"
          @remove-tag="removeTag"
          @visible-change="visibleChange"
        ></el-select>
      </div>
      <div class="cascader-menu-wrapper" v-clickoutside="hidePopover">
        <ul v-if="options.length > 0" class="el-cascader-menu cascader-menu" v-for="(cas, index) in casTree" :key="index">
          <li
            :class="{
              'el-cascader-menu__item': true,
              'el-cascader-menu__item--extensible': item.children && item.children.length > 0,
              'can-load-children': !item.isLeaf && !item.children && allowLoadChildren && showLoadingIndicator,
              'loading-children': !item.isLeaf && item.loading && allowLoadChildren && showLoadingIndicator,
              'has-checked-child': item.indeterminate || item.hasCheckedChild,
              'is-active': item.checked,
            }"
            @click="spreadNext(item.children, index, item)"
            v-for="(item, itemIdx) in cas"
            :key="itemIdx"
          >
            <el-checkbox
              @click.native.stop
              :disabled="item.disabled"
              v-model="item.checked"
              :indeterminate="item.indeterminate"
              @change="checked => { checkedChange(item, checked) }"
            ></el-checkbox>&nbsp;&nbsp;
            <span>{{ item.label }}</span>
          </li>
        </ul>
        <ul class="el-cascader-menu cascader-menu" v-else>
          <li class="el-cascader-menu__item dropdown__empty">
            {{ noDataText }}
          </li>
        </ul>
      </div>
    </el-popover>
  </div>
</template>

<script>
import Clickoutside from "./clickoutside";
function deepClone(source) {
  if (!source && typeof source !== "object") {
    throw new Error("error arguments", "shallowClone");
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === "object") {
      targetObj[keys] = source[keys].constructor === Array ? [] : {};
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}
function hasArrayChild(obj){
  return obj.children && Array.isArray(obj.children);
}
export default {
  name: "EleMultiCascader",
  props: {
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    placeholder: {
      type: String,
      default: "请选择"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array,
      default() {
        return [];
      }
    },
    size: {
      type: String,
      default: ""
    },
    selectChildren: {
      type: Boolean,
      default: false
    },
    noDataText: {
      type: String,
      default: "无数据"
    },
    collapseTags: {
      type: Boolean,
      default: false
    },
    separator: {
      type: String,
      default: "/"
    },
    showAllLevels: {
      type: Boolean,
      default: false
    },
    outputLevelValue: {
      type: Boolean,
      default: false
    },
    // 显示加载指示器
    showLoadingIndicator: {
      type: Boolean,
      default: true
    },
    // 允许加载子项
    allowLoadChildren: {
      type: Boolean,
      default: false
    },
    // 加载方法
    loadChildrenMethod: {
      type: Function,
      default: null,
      return: Promise
    },
    // key
    labelKey: {
      type: String,
      default: "label"
    },
    valueKey: {
      type: String,
      default: "value"
    },
    childrenKey: {
      type: String,
      default: "children"
    },
  },
  watch: {
    casTree(){
      this.setPopperWidth();
    },
    options: {
      deep: true,
      handler() {
        this.initOpts();
        this.initDatas();
      }
    },
    value: {
      deep: true,
      handler() {
        if(this.selectedValues != this.value){
          this.initOpts();
          this.initDatas();
        }
      }
    }
  },
  directives: { Clickoutside },
  created() {
    this.popperClass = `cascader-popper popper-class-${(new Date().getTime())}`
    this.initOpts();
    this.initDatas();
  },
  mounted() {
    // 设置弹出层宽度
    this.elWidth = this.$el.offsetWidth;
  },
  destroyed() {
    this.clonedOpts = null;
    this.casTree = null;
    this.selectedItems = null;
    this.selectedLabels = null;
    this.selectedvalues = null;
  },
  data() {
    return {
      elWidth: "",
      popperWidth: "",
      popperClass: "",
      showPopover: false,
      clonedOpts: [],
      casTree: [],
      selectedItems: [],
      selectedLabels: [],
      selectedValues: []
    };
  },
  methods: {
    initOpts() {
      this.clonedOpts = deepClone(this.options);
      this.recursiveOpt(this.clonedOpts, null);
      this.casTree = [this.clonedOpts];
    },
    /**
     * 初始化数据
     * 空值初始化，两个绑定不一致的情况
     */
    initDatas() {
      this.pickCheckedItem(this.clonedOpts);
    },
    /**
     * 递归option数据
     * 标记数据树形层级 parent
     * 打上初始状态 checked indeterminate
     */
    recursiveOpt(nodeArr, parent) {
      const vm = this;
      nodeArr.forEach(node => {
        if(parent){
          node.parent = parent;
        }
        node.indeterminate = false;
        node.checked = false;
        if (this.value.some(val => val == this.getLevel(node, "value", this.outputLevelValue))) {
          node.checked = true;
        }
        this.markChildrenChecked(node);
        this.markParentChecked(node);
        this.markParentHasCheckChild(node);
        if (hasArrayChild(node)) {
          vm.recursiveOpt(node.children, node);
        }
      });
    },
    /**
     * 根据当前节点 checked
     * 更改所有子孙节点 checked
     * 依赖 this.selectChildren
     */
    markChildrenChecked(node){
      function loop(children, status){
        if(children){
          children.map(child => {
            if(!child.disabled){
              child.checked = status;
              if(child.checked){
                child.indeterminate = false;
              }
            }
            if(hasArrayChild(child)){
              loop(child.children, status)
            }
          })
        }
      }
      if(node && hasArrayChild(node) && this.selectChildren){
        loop(node.children, node.checked);
      }
    },
    /**
     * 标记父节点 checked、indeterminate 状态
     * 依赖 this.selectChildren
     */
    markParentChecked(node){
      node.indeterminate = false;
      function loop(node){
        let checkCount = 0;
        if(hasArrayChild(node)){
          let childIndeterminate = node.children.some(child => child.indeterminate)
          node.children.map(child => {
            if(child.checked){
              checkCount ++;
            }
          })
          // 子节点全部被选中
          if(checkCount === node.children.length){
            node.checked = true;
            node.indeterminate = false;
          } else {
            node.checked = false;
            if(checkCount > 0 || childIndeterminate){
              node.indeterminate = true;
            } else {
              node.indeterminate = false;
            }
          }
        }
        if(node.parent){
          loop(node.parent)
        }
      }
      if(node && node.parent && this.selectChildren){
        loop(node.parent)
      }
    },
    /**
     * 标记是否有被选子项
     * 依赖 this.selectChildren
     */
    markParentHasCheckChild(node){
      node.hasCheckedChild = false;
      function loop(node){
        let checkCount = 0;
        let childHasCheckedChild = node.children.some(child => child.hasCheckedChild)
        node.children.map(child => {
          if(child.checked){
            checkCount ++;
          }
        })
        // 子节点有被选中
        node.hasCheckedChild = (checkCount > 0) || childHasCheckedChild;
        if(node.parent){
          loop(node.parent)
        }
      }
      if(node && node.parent && !this.selectChildren){
        loop(node.parent)
      }
    },
    // 展示标签所有层级
    getLevel(node, key, leveled){
      let levels = [];
      function loop(data){
        levels.push(data[key]);
        if(data.parent){
          loop(data.parent)
        }
      }
      if(leveled){
        loop(node);
        return levels.reverse().join(this.separator);
      } else {
        return node[key]
      }
    },
    /**
     * 处理已选中
     * 重新遍历tree，pick除已选中项目
     */
    pickCheckedItem(tree){
      /**
       * 移除parent引用
       */
      function removeParent(node){
        let obj = {};
        Object.keys(node).forEach(key => {
          if(key != "parent"){
            obj[key] = node[key];
          }
        })
        if(hasArrayChild(obj)){
          obj.children = obj.children.map(child => {
            return removeParent(child);
          })
        }
        return obj;
      }
      const vm = this;
      vm.selectedItems = [];
      vm.selectedLabels = [];
      vm.selectedValues = [];
      function loop(data){
        if(Array.isArray(data)){
          data.map(item => {
            if(item.checked){
              let newItem = removeParent(item);
              vm.selectedItems.push(newItem);
              vm.selectedLabels.push(vm.getLevel(item, "label", vm.showAllLevels));
              vm.selectedValues.push(vm.getLevel(item, "value", vm.outputLevelValue));
            }
            if(hasArrayChild(item)){
              loop(item.children)
            }
          })
        }
      }
      loop(tree);
    },
    removeTag(label){
      /**
     * 遍历 tree
     * 根据传入label 寻找 item
     */
      const vm = this;
      function findNodeByLabel(label){
        let result = null;
        function loop(tree){
          if(tree){
            tree.find(node => {
              if(vm.getLevel(node, "label", vm.showAllLevels) === label){
                result = node;
                return true
              }
              if(hasArrayChild(node)){
                loop(node.children)
              }
            })
          }
        }
        if(label){
          loop(vm.clonedOpts);
          return result
        }
      }
      let deletedItem = findNodeByLabel(label);
      if(deletedItem){
        vm.checkedChange(deletedItem, false);
      }
    },
    // 菜单选中变化
    checkedChange(item, checked) {
      item.checked = checked;
      this.$emit("clickItem", item);
      this.markChildrenChecked(item);
      this.markParentChecked(item);
      this.markParentHasCheckChild(item);
      this.pickCheckedItem(this.clonedOpts);
      this.refresPopover();
      this.syncData();
    },
    // 同步数据到上层
    syncData() {
      this.$emit("input", this.selectedValues);
      this.$emit("change", this.selectedValues, this.selectedItems);
    },
    // 展开下一级
    async spreadNext(children, index, item) {
      if(
        this.allowLoadChildren && 
        !children && !item.children &&
        this.loadChildrenMethod && 
        this.loadChildrenMethod.constructor === Function &&
        !item.isLeaf
      ){
        this.$set(item, "loading", true);
        let result = await this.loadChildrenMethod(item).catch(e => {
          this.$set(item, "loading", false);
        });
        this.$set(item, "loading", false);
        if(result && result.constructor === Array){
          this.recursiveOpt(result, item);
          this.$set(item, "children", result);
          children = result;
        } else {
          console.warn("The resolved value by loadChildrenMethod must be Option Array !")
        }
      }
      
      if (index || index === 0) {
        if (children && children.length > 0) {
          this.casTree.splice(index + 1, this.casTree.length - 1, children);
        } else {
          this.casTree.splice(index + 1, this.casTree.length - 1);
        }
      }

      this.$emit("spread", item);
    },
    // 改变菜单宽度
    setPopperWidth() {
      let width = (160 + 1) * this.casTree.length;
      document.getElementsByClassName(this.popperClass)[0].style.width = width + "px";
    },
    visibleChange(visible){
      if(visible){
        this.showPopover = true;
      }
    },
    handleFocus(evt){
      if (this.disabled) return;
      this.$emit("focus", evt)
    },
    hidePopover(evt) {
      this.showPopover = false;
      this.$emit("blur", evt);
    },
    // 触发resize，让poppover跟随选框，不兼容IE ~_~!
    refresPopover() {
      let resize = new Event("resize");
      setTimeout(() => {
        window.dispatchEvent(resize);
      }, 66);
    }
  }
};
</script>

<style>
.hide-popper {
  display: none;
}
.cascader-popper {
  width: 100%;
  padding: 0px;
}
.cascader-menu {
  width: 160px !important;
}
.el-cascader-menu__item.has-checked-child {
  background-color: #f5f7fa !important;
}
.dropdown__empty {
  height: 100%;
  padding-top: 50%;
  margin: 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}
.can-load-children {
  position: relative;
}
.can-load-children::after {
  content: "";
  display: inline-block;
  position: absolute;
  width: 5px;
  height: 5px;
  background: #a5d279;
  right: 20px;
  top: 50%;
  border-radius: 10px;
  transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
}
.can-load-children.loading-children::after {
  animation: loading 0.22s infinite alternate;
  -moz-animation: loading 0.22s infinite alternate;	/* Firefox */
  -webkit-animation: loading 0.22s infinite alternate;	/* Safari 和 Chrome */
  -o-animation: loading 0.22s infinite alternate;	/* Opera */
}

@keyframes loading
{
from {background: #a5d279;}
to {background: #334d19;}
}
</style>
