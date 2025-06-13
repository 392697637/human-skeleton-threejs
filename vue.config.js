// 引入 Vue CLI 提供的配置辅助方法
const { defineConfig } = require('@vue/cli-service')

// 导出配置对象
module.exports = defineConfig({
  // 告诉 Vue CLI 转译 node_modules 中需要编译的依赖
  transpileDependencies: true,
})
