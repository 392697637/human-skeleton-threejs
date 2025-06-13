<template>
  <!-- 信息面板，只有当传入的 bone 对象存在时才显示 -->
  <div class="info-panel" :style="panelStyle" v-if="bone">
    <!-- 显示骨骼名称，如果没有名称则显示“无名骨骼” -->
    <h3>{{ bone.name || "无名骨骼" }}</h3>
    <!-- 这里可以放更多骨骼详情，比如属性、描述等 -->
  </div>
</template>

<script>
export default {
  name: "InfoPanel",
  props: {
    bone: Object, // 传入当前选中的骨骼对象
    pos: {
      // 弹窗位置，包含x,y坐标（屏幕坐标）
      type: Object,
      default: () => ({ x: 0, y: 0 }),
    },
    distance: {
      // 摄像机与骨骼的距离，用于控制弹窗缩放和透明度
      type: Number,
      default: 0,
    },
  },
  computed: {
    panelStyle() {
      // 如果位置参数不合法，则隐藏弹窗（透明且不可点击）
      if (
        !this.pos ||
        typeof this.pos.x !== "number" ||
        typeof this.pos.y !== "number"
      ) {
        return {
          opacity: 0,
          pointerEvents: "none",
        };
      }

      // 弹窗基础偏移，保证弹窗位置相对于点击点上方且水平居中
      const baseTransform = `translate(-50%, -110%)`;

      // 根据距离动态计算弹窗缩放比例
      // 距离越远，弹窗越小，范围限定在0.5~1.5之间
      const maxDistance = 10;
      const minScale = 0.5;
      const maxScale = 1.5;
      let scale =
        maxScale - (this.distance / maxDistance) * (maxScale - minScale);
      scale = Math.min(maxScale, Math.max(minScale, scale));

      // 根据距离动态计算弹窗透明度
      // 距离越远，透明度越低，范围限定在0.4~1.0之间
      const minOpacity = 0.4;
      const maxOpacity = 1.0;
      let opacity =
        maxOpacity - (this.distance / maxDistance) * (maxOpacity - minOpacity);
      opacity = Math.min(maxOpacity, Math.max(minOpacity, opacity));

      // 返回样式对象，设置弹窗的位置、缩放、透明度及其他视觉样式
      return {
        position: "absolute",
        top: this.pos.y + "px",
        left: this.pos.x + "px",
        transform: `${baseTransform} scale(${scale})`,
        opacity: opacity,
        pointerEvents: "auto", // 启用鼠标事件
        backgroundColor: "rgba(0,0,0,0.7)", // 半透明黑背景
        color: "#fff", // 白色文字
        padding: "8px 12px",
        borderRadius: "4px",
        whiteSpace: "nowrap", // 不换行
        userSelect: "none", // 禁止选中文本
        transition: "opacity 0.3s, transform 0.3s", // 平滑过渡
      };
    },
  },
};
</script>

<style>
/* 信息面板基础样式 */
.info-panel {
  position: fixed; /* 固定定位，避免随页面滚动 */
  background: rgba(255, 255, 255, 0.95); /* 白色半透明背景 */
  border: 1px solid #ccc;
  padding: 12px 16px;
  border-radius: 6px;
  pointer-events: auto; /* 允许响应鼠标事件 */
  z-index: 1000; /* 置顶显示 */
  user-select: none; /* 禁止文本选中 */
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease; /* 位置和透明度变化时平滑动画 */
}

/* 箭头样式（如果用到） */
.arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.95);
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
}

/* 关闭按钮基础样式 */
.close-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #999;
}

/* 关闭按钮悬停时颜色加深 */
.close-btn:hover {
  color: #333;
}
</style>
