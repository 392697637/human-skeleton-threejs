<template>
  <li>
    <div @click="$emit('select', node.bone)" style="cursor: pointer;">
      📎 {{ node.bone.name || '无名骨骼' }}
    </div>
    <ul v-if="node.children && node.children.length">
      <!-- ✅ 递归调用本组件 -->
      <TreeNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        @select="$emit('select', $event)"
      />
    </ul>
  </li>
</template>

<script>
export default {
  name: 'TreeNode', // ✅ 关键点：设置组件名供递归识别
  props: ['node']
}
</script>
