// 粒子特效逻辑（缓慢流动，爆炸等动画效果）
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

export default class ParticlesEffect {
  /**
   * @param {THREE.Scene} scene - Three.js场景，用于添加粒子系统
   */
  constructor(scene) {
    this.scene = scene
    this.particles = null
    this.clock = new THREE.Clock()

    this.initParticles()
  }

  // 初始化简单粒子系统
  initParticles() {
    const particleCount = 100
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.02,
      transparent: true,
      opacity: 0.8
    })

    this.particles = new THREE.Points(geometry, material)
    this.particles.visible = false
    this.scene.add(this.particles)
  }

  /**
   * 在指定骨骼位置显示粒子特效
   * @param {THREE.Object3D} bone 
   */
  showEffect(bone) {
    this.particles.position.copy(bone.getWorldPosition(new THREE.Vector3()))
    this.particles.visible = true

    // 缓慢放大缩小模拟流动
    this.particles.scale.set(0.1, 0.1, 0.1)
    new TWEEN.Tween(this.particles.scale)
      .to({ x: 1, y: 1, z: 1 }, 800)
      .yoyo(true)
      .repeat(3)
      .start()

    // 3秒后隐藏粒子
    setTimeout(() => {
      this.particles.visible = false
    }, 3000)
  }

  // 如需在主循环调用此方法更新动画
  update() {
    if (this.particles.visible) {
      const positions = this.particles.geometry.attributes.position.array
      const time = this.clock.getElapsedTime()

      // 简单粒子位置轻微上下浮动效果
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.001
      }
      this.particles.geometry.attributes.position.needsUpdate = true
    }
  }
}
