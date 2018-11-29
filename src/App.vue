<template>
  <div id="app">
    <p>Multi-Cascader 示例</p>
    <br>
    <br>
    <el-row>
      <el-col :offset="2" :span="6">
        <div style="text-align: left;">
          <p>Data</p>
          <pre>
            {{ options }}
          </pre>
        </div>
      </el-col>
      <el-col :span="8">
        <el-form label-width="80px" ref="form" :model="form" :rules="rules" label-position="left">
          <el-form-item label="ISP: " prop="isp">
            <ele-multi-cascader
              :options="options"
              v-model="form.isp"
              placeholder="选择运营商"
              @change="ispChange"
            ></ele-multi-cascader>
          </el-form-item>
          <el-form-item>
            <br>
            <br>
            <el-button type="primary" @click="submit">测试提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :offset="2" :span="6" style="text-align: left;">
        <p>Output</p>
        <br><br>
        <p>Values</p>
        <pre>
          {{ outputs.values }}
        </pre>
        <p>Items</p>
        <pre>
          {{ outputs.items }}
        </pre>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import options from "./options";

export default {
  name: "app",
  data() {
    return {
      options,
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

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
