<!-- 骨骼树形结构 -->
<template>
  <div class="bone-tree">
    <h4>骨骼结构（左侧）</h4>
    <input
      v-model="searchText"
      placeholder="搜索骨骼名"
      class="search-input"
      @input="onSearch"
    />
    <ul>
      <TreeNode
        v-for="(node, index) in filteredTree"
        :key="index"
        :node="node"
        @select="select"
      />
      
    </ul>
  </div>
</template>

<script>
import TreeNode from './TreeNode.vue'

export default {
  components: { TreeNode },
  props: {
    tree: {
      type: Array,
      default: () => []
  }
},
  data() {
    return {
      searchText: '',
      filteredTree: []
    }
  },
  watch: {
    tree: {
      immediate: true,
      handler(newTree) {
        this.filteredTree = newTree ? [newTree] : []
      }
    }
  },
  methods: {
    select(bone) {
      this.$emit('select', bone)
    },
    onSearch() {
      if (!this.searchText.trim()) {
        this.filteredTree = this.tree ? [this.tree] : []
        return
      }
      this.filteredTree = this.filterTree(this.tree, this.searchText.trim().toLowerCase())
    },
    filterTree(node, searchText) {
      if (!node) return []
      const boneName = (node.bone.name || '').toLowerCase()
      const children = node.children
        ? node.children
            .map(child => this.filterTree(child, searchText))
            .filter(child => child.length)
        : []

      if (boneName.includes(searchText) || children.length > 0) {
        return [{
          bone: node.bone,
          children: children.flat()
        }]
      }
      return []
    }
  }
}
</script>

<style>
.bone-tree {
  position: absolute;
  top: 20px;
  left: 20px; /* 左侧显示 */
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ccc;
  padding: 10px;
  max-height: 80vh;
  overflow-y: auto;
  width: 260px;
  z-index: 15;
  font-size: 14px;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.bone-tree ul {
  list-style: none;
  padding-left: 15px;
  margin: 0;
}
.search-input {
  width: 100%;
  margin-bottom: 6px;
  padding: 5px 8px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 13px;
}
</style>
