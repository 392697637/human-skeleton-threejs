<template>
  <div class="bone-tree">
    <h4>骨骼结构</h4>
    <ul>
      <TreeNode :node="tree" @select="select" />
    </ul>
  </div>
</template>

<script>
import TreeNode from './TreeNode.vue'

export default {
  components: { TreeNode }, // ✅ 注册组件
  props: ['tree'],
  methods: {
    select(bone) {
      this.$emit('select', bone)
    }
  }
}
</script>
