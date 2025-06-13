<template>
  <div class="skeleton-container">
    <ThreeScene ref="scene" @boneSelected="handleBoneSelected" @boneTreeReady="handleBoneTree" />
    <InfoPanel v-if="selectedBone" :bone="selectedBone" @reset="handleReset" @explode="handleExplode" />
    <BoneTree v-if="boneTree" :tree="boneTree" @select="handleTreeSelect" />
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
    },
    handleReset() {
      this.$refs.scene.resetBone(this.selectedBone)
      this.selectedBone = null
    },
    handleExplode() {
      this.$refs.scene.explodeBone(this.selectedBone)
    },
    handleBoneTree(tree) {
      this.boneTree = tree
    },
    handleTreeSelect(bone) {
      this.$refs.scene.selectBoneFromTree(bone)
      this.selectedBone = bone
    }
  }
}
</script>
