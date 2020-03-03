let config = {
    publicPath: process.env.NODE_ENV === "production" ? "/ele-multi-cascader/" : "/",

    configureWebpack: {
        output: {
            libraryExport: "default"
        }
    },

    css: {
        extract: false
    }
};

// if (process.env.NODE_ENV === "production") {
//     config.configureWebpack.externals = {
//         cascaderjs: {
//             commonjs: "multi-cascaderjs",
//             commonjs2: "multi-cascaderjs",
//             amd: "multi-cascaderjs",
//             cmd: "multi-cascaderjs",
//             root: "Multi-cascaderjs"
//         }
//     };
// }

module.exports = config;
