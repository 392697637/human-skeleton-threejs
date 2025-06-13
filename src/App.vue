<template>
  <div id="app">
    <!-- 主功能组件：人体骨骼交互系统 -->
    <!-- HumanSkeleton 组件内部整合了 Three.js 场景、骨骼信息面板和骨骼树结构等模块 -->
    <HumanSkeleton />
  </div>
</template>

<script>
import HumanSkeleton from "./components/HumanSkeleton.vue"; // 引入自定义组件：人体骨骼可视化交互界面

export default {
  components: {
    HumanSkeleton, // 注册组件
  },
};
</script>

<style>
/* 重置页面默认样式，确保应用占满整个视口 */
html,
body,
#app {
  margin: 0; /* 去除默认外边距 */
  padding: 0; /* 去除默认内边距 */
  height: 100%; /* 保证根容器撑满整个页面高度 */
  overflow: hidden; /* 禁止滚动条出现，确保 Three.js 场景不会被页面滚动影响 */
}
</style>
