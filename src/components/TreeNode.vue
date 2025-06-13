<template>
  <li>
    <!-- 每个节点的点击区域，左侧缩进根据层级 level 控制 -->
    <div @click="toggle" :style="{ paddingLeft: level * 16 + 'px' }">
      <!-- ✅ 若当前节点含有 bone 对象（代表真实骨骼节点），则可点击选中 -->
      <!-- 发出 select 事件，父组件可捕获选中骨骼 -->
      <span
        v-if="node.bone"
        @click.stop="$emit('select', node.bone)"
        style="cursor: pointer"
        :title="node.bone.name || '无名骨骼'"
      >
        <!-- 图标表示是否展开：📂 展开，📁 收起 -->
        {{ isOpen ? "📂" : "📁" }} {{ node.bone.name || "无名骨骼" }}
      </span>

      <!-- 🚫 若当前节点无 bone（如虚拟根节点），只显示名称，不可点击 -->
      <span v-else style="font-weight: bold">
        {{ node.name || "根节点" }}
      </span>
    </div>

    <!-- ✅ 子节点递归渲染 -->
    <ul v-show="isOpen" v-if="node.children && node.children.length">
      <!-- :node="child"  当前子节点数据 -->
      <!-- :level="level + 1" 传递层级 +1，增加缩进 -->
      <!-- @select="$emit('select', $event)"  子组件选中事件向上传递 -->
      <!-- @click.stop="$emit('select', node.bone)"  防止事件穿透 -->
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
  name: "TreeNode", // 组件名称
  props: {
    node: Object, // 当前节点的数据对象（包括 bone / children 等字段）
    level: {
      // 节点的层级，用于控制左侧缩进
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isOpen: true, // 控制当前节点是否展开（默认展开）
    };
  },
  methods: {
    // 切换展开 / 收起
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>

<style scoped>
/* 每个节点间距微调 */
li {
  margin: 2px 0;
  user-select: none; /* 禁止文字被选中，提升交互体验 */
}

/* 清除 ul 的默认样式 */
ul {
  list-style: none;
  padding-left: 0;
}
</style>
