<template>
  <div class="cascader-wrapper">
    <el-popover
      placement="bottom-start"
      trigger="manual"
      :popper-class="popOverClass"
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
          @clear="clearTag"
          @visible-change="visibleChange"
          :clearable="clearable"
        ></el-select>
      </div>
      <div class="cascader-menu-wrapper" v-clickoutside="hidePopover">
        <ul v-if="options.length > 0" class="el-cascader-menu cascader-menu" v-for="(cas, index) in casTree" :key="index">
          <li
            :class="{
              'el-cascader-menu__item': true,
              'el-cascader-menu__item--extensible': item[childrenKey] && item[childrenKey].length > 0,
              'can-load-children': !item.isLeaf && !item[childrenKey] && allowLoadChildren && showLoadingIndicator,
              'loading-children': !item.isLeaf && item.loading && allowLoadChildren && showLoadingIndicator,
              'has-checked-child': item.indeterminate || item.hasCheckedChild,
              'is-active': item.checked,
            }"
            @click="spreadNext(item[childrenKey], index, item)"
            v-for="(item, itemIdx) in cas"
            :key="itemIdx"
          >
            <el-checkbox
              @click.native.stop
              :disabled="item.disabled"
              v-model="item.checked"
              :indeterminate="item.indeterminate"
              @change="checked => { checkedChange(item, checked) }"
            ></el-checkbox>
            <span>{{ item[labelKey] }}</span>
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
import { props, hasArrayChild, deepClone, getId } from "./utils";
export default {
  name: "EleMultiCascader",
  props,
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
    },
    disabled(disabled){
      if(disabled){
        this.hidePopover();
      }
    }
  },
  directives: { Clickoutside },
  created() {
    this.classRef = `popper-class-${getId()}`
    this.popOverClass = `cascader-popper ${this.classRef} ${this.popperClass}`
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
      popOverClass: "",
      classRef: "",
      showPopover: false,
      clonedOpts: [],
      casTree: [],
      selectedItems: [],
      selectedLabels: [],
      selectedValues: [],
      loadChildrenPromise: null
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
        if (this.value.some(val => val == this.getLevel(node, vm.valueKey, this.outputLevelValue))) {
          node.checked = true;
        }
        this.markChildrenChecked(node);
        this.markParentChecked(node);
        this.markParentHasCheckChild(node);
        if (hasArrayChild(node, vm.childrenKey)) {
          vm.recursiveOpt(node[vm.childrenKey], node);
        }
      });
    },
    /**
     * 根据当前节点 checked
     * 更改所有子孙节点 checked
     * 依赖 this.selectChildren
     */
    markChildrenChecked(node){
      const vm = this;
      function loop(children, status){
        if(children){
          children.map(child => {
            if(!child.disabled){
              child.checked = status;
              if(child.checked){
                child.indeterminate = false;
              }
            }
            if(hasArrayChild(child, vm.childrenKey)){
              loop(child[vm.childrenKey], status)
            }
          })
        }
      }
      if(node && hasArrayChild(node, vm.childrenKey) && this.selectChildren){
        loop(node[vm.childrenKey], node.checked);
      }
    },
    /**
     * 标记父节点 checked、indeterminate 状态
     * 依赖 this.selectChildren
     */
    markParentChecked(node){
      const vm = this;
      node.indeterminate = false;
      function loop(node){
        let checkCount = 0;
        if(hasArrayChild(node, vm.childrenKey)){
          let childIndeterminate = node[vm.childrenKey].some(child => child.indeterminate)
          node[vm.childrenKey].map(child => {
            if(child.checked){
              checkCount ++;
            }
          })
          // 子节点全部被选中
          if(checkCount === node[vm.childrenKey].length){
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
      const vm = this;
      node.hasCheckedChild = false;
      function loop(node){
        let checkCount = 0;
        if(hasArrayChild(node, vm.childrenKey)){
          let childHasCheckedChild = node[vm.childrenKey].some(child => child.hasCheckedChild)
          node[vm.childrenKey].map(child => {
            if(child.checked){
              checkCount ++;
            }
          })
          // 子节点有被选中
          node.hasCheckedChild = (checkCount > 0) || childHasCheckedChild;
        }
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
      const vm = this;
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
        if(hasArrayChild(obj, vm.childrenKey)){
          obj[vm.childrenKey] = obj[vm.childrenKey].map(child => {
            return removeParent(child);
          })
        }
        return obj;
      }

      vm.selectedItems = [];
      vm.selectedLabels = [];
      vm.selectedValues = [];
      function loop(data){
        if(Array.isArray(data)){
          data.map(item => {
            if(item.checked){
              let newItem = removeParent(item);
              vm.selectedItems.push(newItem);
              vm.selectedLabels.push(vm.getLevel(item, vm.labelKey, vm.showAllLevels));
              vm.selectedValues.push(vm.getLevel(item, vm.valueKey, vm.outputLevelValue));
            }
            if(hasArrayChild(item, vm.childrenKey)){
              loop(item[vm.childrenKey])
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
              if(vm.getLevel(node, vm.labelKey, vm.showAllLevels) === label){
                result = node;
                return true
              }
              if(hasArrayChild(node, vm.childrenKey)){
                loop(node[vm.childrenKey])
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

      this.$emit("remove-tag", label, deletedItem);
    },
    clearTag(){
      const vm = this;
      function loop(nodeArr) {
        nodeArr.forEach(node => {
          node.checked = false;
          node.indeterminate = false;
          if (hasArrayChild(node, vm.childrenKey)) {
            loop(node[vm.childrenKey]);
          }
        });
      }
      // 关闭全部状态
      loop(this.clonedOpts);
      this.selectedLabels = [];
      this.selectedValues = [];
      this.selectedItems = [];
      this.$emit("clear");
      this.syncData();
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
      const vm = this;
      if(
        vm.allowLoadChildren && 
        !children && !item[vm.childrenKey] &&
        vm.loadChildrenMethod && 
        vm.loadChildrenMethod.constructor === Function &&
        !vm.loadChildrenPromise && // promise 不存在
        !item.isLeaf
      ){
        let isPromiseMethod = this.loadChildrenMethod(item);
        if(isPromiseMethod.constructor === Promise){
          vm.loadChildrenPromise = isPromiseMethod;
          this.$set(item, "loading", true);
          let result = await vm.loadChildrenPromise.catch(e => {
            this.$set(item, "loading", false);
          });
          this.$set(item, "loading", false);
          vm.loadChildrenPromise = null;
          if(result && result.constructor === Array){
            this.recursiveOpt(result, item);
            this.$set(item, vm.childrenKey, result);
            children = result;
          } else {
            console.warn("The resolved value by loadChildrenMethod must be Option Array !")
          }
        } else {
          console.warn("You must return a Promise instance in loadChildrenMethod !")
        }
      }

      if (index || index === 0) {
        if(vm.casTree.indexOf(children) === -1){
          if (children && children.length > 0) {
            vm.casTree.splice(index + 1, vm.casTree.length - 1, children);
          } else {
            vm.casTree.splice(index + 1, vm.casTree.length - 1);
          }

          vm.$emit("spread", item);
        }
      }
    },
    // 改变菜单宽度
    setPopperWidth() {
      let width = (160 + 1) * this.casTree.length;
      document.getElementsByClassName(this.classRef)[0].style.width = width + "px";
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
    // 触发resize，让poppover跟随选框，不兼容IE8 ~_~!
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
