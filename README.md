# Multi-Cascader

### 概述

> 由于`elementUI` 的级联选择器暂不支持多选，因此基于`elementUI`二次开发此组件，所有的样式`class`都是使用 `elementUI` 原样式，基本可无副作用的引入项目使用，仅实现了基本需求，不过应该满足使用。有任何问题欢迎发布 `issue` ，我会在看到第一时间回复大家。
[查看demo](https://webcoderj.github.io/ele-multi-cascader-demo/)

![](./imgs/cas.png)
![](./imgs/cas-data.png)

### 安装

可直接复制源码使用或：

```shell
npm install ele-multi-cascader
```

###  使用

```js
// main.js
import EleMultiCascader from "ele-multi-cascader"

Vue.use(Element)
Vue.use(EleMultiCascader)
```

### Attributes

| 参数                                                         | 说明       | 类型    | 可选值            | 默认值 |
| ------------------------------------------------------------ | ---------- | ------- | ----------------- | ------ |
| options（当前仅支持children, value, label, disabled）传入组件时需要转换数据，disabled可以禁用某个选项 | 选项数据源 | Array   | --                | --     |
| v-model(value)                                               | 绑定值     | Array   | --                | --     |
| placeholder                                                  | 占位文本   | String  | --                | 请选择 |
| size                                                         | 尺寸       | String  | medium/small/mini | --     |
| disabled                                                     | 禁用       | Boolean | True/false        | false  |

### 事件

| 事件名称 | 说明             | 回调参数                                    |
| -------- | ---------------- | ------------------------------------------- |
| change   | 绑定值发生变化时 | (Array:values当前选中值, Array:items当前选中对象数组) |
| blur     | 失去焦点         | --                                          |
| focus    | 获得焦点         | --                                          |

### 使用

```html
<!-- *.vue -->
<template>
	<el-form label-width="80px" ref="form" :model="form" :rules="rules" label-position="left">
        <el-form-item label="ISP: " prop="isp">
            <ele-multi-cascader
              :options="options"
              v-model="form.isp"
              placeholder="选择运营商"
              @change="ispChange"
              >
            </ele-multi-cascader>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submit">测试提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script>

export default {
  data() {
    return {
      options: [],
      outputs: {
        values: [],
        items: []
      },
      rules: {
        isp: [
          {
            required: true,
            trigger: "change",
            validator(rule, val, cb) {
              if (val.length === 0) {
                cb(new Error("请选择运营商"));
              } else {
                cb();
              }
            }
          }
        ]
      },
      form: {
        isp: []
      }
    };
  },
  methods: {
    ispChange(values, items) {
      this.outputs.values = values;
      this.outputs.items = items;
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message({
            message: "测试通过",
            type: "success"
          });
        }
      });
    }
  }
};
</script>
```

### 依赖

```
- Vue
- ElementUI
- vue-click-outside
```
