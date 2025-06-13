<template>
  <div class="skeleton-container">
    <BoneTree v-if="boneTree" :tree="boneTree" @select="handleBoneSelected" />
    <ThreeScene ref="scene" @boneTreeReady="boneTree = $event" @boneSelected="handleBoneSelected" />
    <InfoPanel v-if="selectedBone" :bone="selectedBone" @reset="handleReset" @explode="handleExplode" />
  </div>
</template>

<script>
import ThreeScene from './ThreeScene.vue'
import InfoPanel from './InfoPanel.vue'
import BoneTree from './BoneTree.vue'

export default {
  components: { ThreeScene, InfoPanel, BoneTree },
  data() {
    return {
      selectedBone: null,
      boneTree: null
    }
  },
  methods: {
    handleBoneSelected(bone) {
      this.selectedBone = bone
      this.$refs.scene.focusBone(bone) // 可添加此方法使相机聚焦
    },
    handleReset() {
      this.$refs.scene.resetBone(this.selectedBone)
      this.selectedBone = null
    },
    handleExplode() {
      this.$refs.scene.explodeBone(this.selectedBone)
    }
  }
}
</script>

<style>
.skeleton-container {
  display: flex;
  width: 100vw;
  height: 100vh;
}
</style>
