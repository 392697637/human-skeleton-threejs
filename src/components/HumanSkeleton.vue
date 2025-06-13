<!-- 主 Vue 组件容器，包含 3D 场景、信息面板、控制按钮和骨骼树 -->
<template>
  <div class="skeleton-container">
    <!-- Three.js 场景组件，负责加载模型与处理交互 -->
    <!-- 通过事件 @boneSelected 和 @boneTreeReady 与父组件通信 -->
    <ThreeScene
      ref="scene"
      @boneSelected="boneSelected"
      @boneTreeReady="handleBoneTree"
    />

    <!-- 信息面板组件，当选中骨骼时才显示（v-if 判断） -->
    <InfoPanel
      v-if="selectedBone"
      :bone="selectedBone"
      :pos="panelPos"
      :distance="panelDistance"
      @reset="handleReset"
      @explode="handleExplode"
    />

    <!-- 控制按钮：用于全局控制骨骼拆分与重置 -->
    <div class="controls">
      <button @click="explodeAll">拆分全部骨骼</button>
      <button @click="resetAll">恢复全部骨骼</button>
    </div>

    <!-- 骨骼树形结构组件（如左侧树形菜单），展示模型骨骼的层级结构 -->
    <BoneTree v-if="boneTree" :tree="boneTree" @select="handleTreeSelect" />
  </div>
</template>
<script>
import ThreeScene from "./ThreeScene.vue"; // 负责 Three.js 场景、模型加载、交互
import InfoPanel from "./InfoPanel.vue"; // 显示选中骨骼的详细信息及操作按钮
import BoneTree from "./BoneTree.vue"; // 以树形结构展示骨骼层级，并支持点击选中

export default {
  components: { ThreeScene, InfoPanel, BoneTree },
  data() {
    return {
      selectedBone: null, // 当前选中的骨骼对象（点击骨骼或树节点时更新）
      boneTree: null, // 从 ThreeScene 传回的骨骼层级树结构
      panelPos: { x: 0, y: 0 },
      panelDistance: 0,
    };
  },
  methods: {
    // 接收 ThreeScene 发出的 boneSelected 事件，更新当前选中骨骼
    boneSelected({ bone, x, y, distance }) {
    this.selectedBone = bone;
    this.panelPos = { x, y };
    this.panelDistance = distance;
  },

    // 点击 InfoPanel 的“重置”按钮，恢复该骨骼位置，并取消选中
    handleReset() {
      this.$refs.scene.resetBone(this.selectedBone);
      this.selectedBone = null;
    },

    // 点击 InfoPanel 的“拆分”按钮，仅拆分当前选中骨骼
    handleExplode() {
      this.$refs.scene.explodeBone(this.selectedBone);
    },

    // 接收 ThreeScene 返回的骨骼树结构，传给 BoneTree 使用
    handleBoneTree(tree) {
      this.boneTree = tree;
    },

    // 点击骨骼树结构中的节点时触发：选中对应骨骼并同步到 ThreeScene
    handleTreeSelect(bone) {
      this.$refs.scene.selectBoneFromTree(bone);
      this.selectedBone = bone;
    },

    // 点击“拆分全部骨骼”按钮时触发：调用 ThreeScene 的方法
    explodeAll() {
      this.$refs.scene.explodeAllBones();
    },

    // 点击“恢复全部骨骼”按钮时触发：调用 ThreeScene 的方法
    resetAll() {
      this.$refs.scene.resetAllBones();
    },
  },
};
</script>

<style>
/* 主容器全屏显示，ThreeScene 默认占满背景 */
.skeleton-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

/* 控制按钮区域定位在左上角，浮在场景上层 */
.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10; /* 保证覆盖 Three.js 渲染内容 */
}

/* 按钮样式：蓝底白字，圆角，有交互感 */
.controls button {
  padding: 8px 12px;
  margin-left: 10px;
  font-size: 14px;
  background-color: #2d89ef;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
