<template>
  <div class="cascader-wrapper">
    <el-popover
      placement="bottom-start"
      trigger="manual"
      popper-class="cascader-popper"
      v-model="showPopover"
    >
      <div slot="reference">
        <span @click.native="togglePopover">
          <el-select
            multiple
            v-model="selectedLabels"
            :placeholder="placeholder"
            :disabled="disabled"
            :size="size"
            style="width: 100%;"
            popper-class="hide-popper"
            @focus="handleFocus"
            @blur="handleBlur"
            @remove-tag="removeTag"
          ></el-select>
        </span>
      </div>
      <div class="cascader-menu-wrapper" v-click-outside="hidePopover">
        <ul v-if="options.length > 0" class="el-cascader-menu cascader-menu" v-for="(cas, index) in casTree" :key="index">
          <li
            :class="{
              'el-cascader-menu__item': true,
              'el-cascader-menu__item--extensible': item.children && item.children.length > 0,
              'has-checked-child': item.indeterminate || item.hasCheckedChild,
              'is-active': item.checked,
            }"
            @click="spreadNext(item.children, index)"
            v-for="(item, itemIdx) in cas"
            :key="itemIdx"
          >
            <el-checkbox
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
            无数据
          </li>
        </ul>
      </div>
    </el-popover>
  </div>
</template>

<script>
import ClickOutside from "vue-click-outside";
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
    }
  },
  watch: {
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
          console.log("MODEL - CHANGE");
          this.initOpts();
          this.initDatas();
        }
      }
    }
  },
  directives: { ClickOutside },
  created() {
    this.initOpts();
    this.initDatas();
  },
  mounted() {
    // 设置弹出层宽度
    this.elWidth = this.$el.offsetWidth;
    this.setPopperWidth();
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
        if (this.value.some(val => val == node.value)) {
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
              vm.selectedLabels.push(newItem.label);
              vm.selectedValues.push(newItem.value);
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
              if(node.label === label){
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
    spreadNext(children, index) {
      if (index || index === 0) {
        if (children && children.length > 0) {
          this.casTree.splice(index + 1, this.casTree.length - 1, children);
        } else {
          this.casTree.splice(index + 1, this.casTree.length - 1);
        }
        this.setPopperWidth();
      }
    },
    // 改变菜单宽度
    setPopperWidth() {
      let width = (160 + 1) * this.casTree.length;
      document.getElementsByClassName("cascader-popper")[0].style.width =
        width + "px";
    },
    handleFocus(evt){
      if (this.disabled) return;
      this.showPopover = true;
      this.$emit("focus", evt)
    },
    handleBlur(){
      if (this.disabled) return;
      this.showPopover = true;
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
</style>
