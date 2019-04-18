<template>
    <div id="app">
        <p class="title">Ele-Multi-Cascader 示例</p>
        <p>
            <!-- Place this tag where you want the button to render. -->
            <github-button
                href="https://www.npmjs.com/package/ele-multi-cascader"
                data-size="large"
                data-icon="octicon-cloud-download"
                aria-label="Open the npm link"
            >Npm</github-button>
            &nbsp;
            <!-- Place this tag where you want the button to render. -->
            <github-button
                href="https://github.com/webCoderJ/ele-multi-cascader"
                data-icon="octicon-star"
                data-size="large"
                data-show-count="true"
                aria-label="Star webCoderJ/ele-multi-cascader on GitHub"
            >Star</github-button>
            &nbsp;
            <!-- Place this tag where you want the button to render. -->
            <github-button
                href="https://github.com/webCoderJ/ele-multi-cascader/issues"
                data-icon="octicon-issue-opened"
                data-size="large"
                data-show-count="true"
                aria-label="Issue webCoderJ/ele-multi-cascader on GitHub"
            >Issue</github-button>
            &nbsp;
            <!-- Place this tag where you want the button to render. -->
            <github-button
                href="https://github.com/webCoderJ/ele-multi-cascader/archive/master.zip"
                data-icon="octicon-cloud-download"
                data-size="large"
                aria-label="Download webCoderJ/ele-multi-cascader on GitHub"
            >Download</github-button>
        </p>
        <br>
        <el-row class="demo-wrapper">
            <el-col :gutter="100" class="demo-col" :span="7">
                <div style="text-align: left;">
                    <p>Data</p>
                    <pre>
            {{ options }}
          </pre>
                </div>
            </el-col>
            <el-col :gutter="100" class="demo-col" :span="10">
                <br>
                <br>
                <br>
                <br>
                <el-form
                    label-width="100px"
                    ref="form"
                    :model="form"
                    :rules="rules"
                    label-position="left"
                >
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="选中子项: " prop="selectChildren" align="left">
                                <el-switch
                                    v-model="form.selectChildren"
                                    :active-value="true"
                                    :inactive-value="false"
                                    @change="resetModel"
                                ></el-switch>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="展示层级:" prop="selectChildren" align="left">
                                <el-switch
                                    v-model="form.showAllLevels"
                                    :active-value="true"
                                    :inactive-value="false"
                                    @change="resetModel"
                                ></el-switch>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="输出层级:" prop="selectChildren" align="left">
                                <el-switch
                                    v-model="form.outputLevelValue"
                                    :active-value="true"
                                    :inactive-value="false"
                                    @change="resetModel"
                                ></el-switch>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="禁用" prop="selectChildren" align="left">
                                <el-switch
                                    v-model="form.disabled"
                                    :active-value="true"
                                    :inactive-value="false"
                                ></el-switch>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="运营商: " prop="isp">
                        <ele-multi-cascader
                            allowLoadChildren
                            :options="options"
                            v-model="form.isp"
                            placeholder="选择运营商"
                            @change="ispChange"
                            @spread="spread"
                            ref="cascader"
                            :show-all-levels="form.showAllLevels"
                            :output-level-value="form.outputLevelValue"
                            :selectChildren="form.selectChildren"
                            :loadChildrenMethod="loadChildren"
                            :disabled="form.disabled"
                            labelKey="title"
                            valueKey="id"
                            childrenKey="sub"
                            :panelWidth="'auto'"
                        ></ele-multi-cascader>
                    </el-form-item>
                    <br>
                    <br>
                    <p>
                        <el-button type="primary" @click="submit">测试提交</el-button>
                    </p>
                </el-form>
            </el-col>
            <el-col :gutter="100" class="demo-col" :span="7" style="text-align: left;">
                <p>Output @change(values, items)</p>
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
import {options} from "./db/options";
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
                isp: [],
                isp2: [],
                isp3: "",
                selectChildren: true,
                showAllLevels: true,
                outputLevelValue: true,
                disabled: false
            }
            
        };
    },
    created() {
        // setTimeout(_ => {
        //   this.form.isp.shift();
        // }, 2000)
        // setTimeout(_ => {
        //   this.options = [];
        // }, 5000)
        // setTimeout(_ => {
        //   this.options = options;
        // }, 6000)
        this.resetModel();
    },
    methods: {
        ispChange(values, items) {
            this.outputs.values = values;
            this.outputs.items = items;
        },
        resetModel() {
            this.form.isp = [];
            this.outputs.items = [];
            this.outputs.values = [];
            setTimeout(_ => {
                this.$message({
                    message: "已重置数据",
                    type: "success"
                });
                this.form.isp = this.form.outputLevelValue
                    ? ["1/11/51", "1/11/52", "1/12/59"]
                    : ["51", "52", "59"];
                this.form.isp2 = this.form.outputLevelValue
                    ? ["1/11/51", "1/11/52", "1/12/59"]
                    : ["51", "52", "59"];
            }, 0);
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
        },
        spread(item) {
            console.log("TCL: spread -> item", item);
            // this.$notify({
            //   type: "success",
            //   title: "已展开option" + item.title,
            //   message: `isLeaf: ${item.sub ? !!item.sub[0].isLeaf : ''}`,
            // })
        },
        loadChildren(item) {
            if (item.id) {
                return new Promise((resolve, reject) => {
                    setTimeout(_ => {
                        resolve([
                            {
                                title: "电信通",
                                id: parseInt(Math.random() * 100),
                                sub: null,
                                isLeaf: Math.round(Math.random()),
                                value: parseInt(Math.random() * 100)
                            }
                        ]);
                        // reject(null)
                    }, 1000);
                });
            }
        }
    }
};
</script>

<style scoped>
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 40px;
}
.title {
    font-weight: 600;
}
.demo-wrapper {
    height: 500px;
    width: 100%;
}
.demo-col {
    height: 100%;
    overflow: auto;
    border: 1px dashed #ccc;
    padding: 0 20px;
}
.ml10 {
    margin-left: 10px;
}
</style>
