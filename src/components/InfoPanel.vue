<template>
  <div class="info-panel" :style="panelStyle" v-if="bone">
    <h3>{{ bone.name || '无名骨骼' }}</h3>
    <!-- 这里可以放更多骨骼详情 -->
  </div>
</template>

<script>
export default {
  name: 'InfoPanel',
  props: {
    bone: Object,
    pos: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    },
    distance: {
      type: Number,
      default: 0
    }
  },
  computed: {
    panelStyle() {
      if (!this.pos || typeof this.pos.x !== 'number' || typeof this.pos.y !== 'number') {
        return {
          opacity: 0,
          pointerEvents: 'none'
        }
      }
  // 弹窗位置（跟随点击）
      const baseTransform = `translate(-50%, -110%)`

      // 根据距离控制缩放，距离越远，缩放越小，最小0.5，最大1.5
      // 比如距离范围0~10，按比例映射到缩放范围1.5~0.5
      const maxDistance = 10
      const minScale = 0.5
      const maxScale = 1.5
      let scale = maxScale - (this.distance / maxDistance) * (maxScale - minScale)
      scale = Math.min(maxScale, Math.max(minScale, scale))

 // 根据距离控制透明度，远透明度低，近透明度高
      const minOpacity = 0.4
      const maxOpacity = 1.0
      let opacity = maxOpacity - (this.distance / maxDistance) * (maxOpacity - minOpacity)
      opacity = Math.min(maxOpacity, Math.max(minOpacity, opacity))

      return {
        position: 'absolute',
        top: this.pos.y + 'px',
        left: this.pos.x + 'px',
        transform: `${baseTransform} scale(${scale})`,
        opacity: opacity,
        pointerEvents: 'auto',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'opacity 0.3s, transform 0.3s'
      }
    }
  }
}
</script>

<style>
.info-panel {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ccc;
  padding: 12px 16px;
  border-radius: 6px;
  pointer-events: auto;
  z-index: 1000;
  user-select: none;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* 箭头 */
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
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
}

/* 关闭按钮 */
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

.close-btn:hover {
  color: #333;
}
</style>
