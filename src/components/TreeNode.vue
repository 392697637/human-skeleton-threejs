<template>
  <li>
    <div @click="toggle" :style="{ paddingLeft: (level * 16) + 'px' }">
      <!-- 如果有 bone，则显示并支持点击选中 -->
      <span
        v-if="node.bone"
        @click.stop="$emit('select', node.bone)"
        style="cursor: pointer;"
        :title="node.bone.name || '无名骨骼'"
      >
        {{ isOpen ? '📂' : '📁' }} {{ node.bone.name || '无名骨骼' }}
      </span>

      <!-- 如果没有 bone，比如虚拟根节点 -->
      <span v-else style="font-weight: bold;">
        {{ node.name || '根节点' }}
      </span>
    </div>

    <!-- 子节点递归展示 -->
    <ul v-show="isOpen" v-if="node.children && node.children.length">
      <TreeNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @click.stop="$emit('select', node.bone)"
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
      isOpen: true // 控制是否展开
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

ul {
  list-style: none;
  padding-left: 0;
}
</style>
