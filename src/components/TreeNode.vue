<template>
  <li>
    <div @click="toggle" :style="{ paddingLeft: (level * 16) + 'px' }">
      <span
        @click.stop="$emit('select', node.bone)"
        style="cursor: pointer;"
        :title="node.bone.name || '无名骨骼'"
      >
        {{ isOpen ? '📂' : '📁' }} {{ node.bone.name || '无名骨骼' }}
      </span>
    </div>
    <ul v-show="isOpen" v-if="node.children && node.children.length">
      <TreeNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :level="level + 1"
        @select="$emit('select', $event)"
      />
    </ul>
  </li>
</template>

<script>
export default {
  name: 'TreeNode',
  props: {
    node: Object,
    level: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isOpen: true
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen
    }
  }
}
</script>

<style scoped>
li {
  margin: 2px 0;
  user-select: none;
}
</style>
