<!-- <template>
  <div ref="container" class="three-container"></div>
</template> -->
<template>
  <div ref="container" class="three-container">
    <BoneTree v-if="boneTree" :tree="boneTree" @select="onSelectBone" />
  </div>
</template>
<script>
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import BoneManager from './js/BoneManager'
import ParticlesEffect from './js/ParticlesEffect'
import { GUI } from 'dat.gui'  // 导入dat.gui库
import BoneTree from './BoneTree.vue'

export default {
  emits: ['boneSelected'],
  components: { BoneTree },
  data() {
    return {
      scene: null,            // Three.js 场景对象
      camera: null,           // 摄像机
      renderer: null,         // 渲染器
      raycaster: new THREE.Raycaster(), // 射线检测工具
      mouse: new THREE.Vector2(),       // 鼠标坐标（标准设备坐标系）
      boneManager: null,      // 骨骼管理器实例
      particleSystem: null,   // 粒子特效实例
      ambientLight: null,     // 环境光对象
      gui: null,              // dat.GUI实例

      // 可通过GUI调节的参数
      params: {
        splitDistance: 0.3,         // 骨骼拆分距离，默认0.3
        lightColor: '#ffffff',      // 环境光颜色，白色
        lightIntensity: 0.8,        // 环境光亮度
        backgroundColor: '#202020'  // 场景背景色，深灰色
      },
      boneTree: null
    }
  },
  mounted() {
    this.initThree()      // 初始化Three.js环境
    this.loadModel()      // 加载骨骼模型

    // 监听窗口大小变化，响应式调整摄像机和渲染器
    window.addEventListener('resize', this.onResize)

    // 监听点击事件，实现骨骼选中
    this.$refs.container.addEventListener('click', this.onClick)

    this.initGUI()        // 初始化GUI控件面板
  },
  beforeDestroy() {
    // 组件销毁时，移除事件监听，释放资源
    window.removeEventListener('resize', this.onResize)
    this.$refs.container.removeEventListener('click', this.onClick)
    if (this.gui) this.gui.destroy()
  },
  methods: {
    // 初始化Three.js场景、相机、渲染器、光照和控件
    initThree() {
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(this.params.backgroundColor)  // 设置场景背景色

      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
      this.camera.position.set(0, 1.5, 3)  // 摄像机位置

      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.$refs.container.appendChild(this.renderer.domElement)  // 将canvas添加到DOM

      // 轨道控制器，支持拖拽旋转视角
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)

      // 环境光，模拟全局漫反射光照
      this.ambientLight = new THREE.AmbientLight(this.params.lightColor, this.params.lightIntensity)
      this.scene.add(this.ambientLight)
    },
    loadModel() {
      const loader = new GLTFLoader()
      loader.load('/models/lkn_by_get3dmodels.glb', (gltf) => {
        try {
          const model = gltf.scene
          this.scene.add(model)
          // 传入模型根节点和拆分距离，创建骨骼管理器
          this.boneManager = new BoneManager(model)
          this.boneTree = this.boneManager.getBoneTree() // 获取树形结构
          this.$emit('boneTreeReady', this.boneTree)

          this.particleSystem = new ParticlesEffect(this.scene);  // 创建粒子特效系统
          this.animate(); // 开始动画渲染循环
        } catch (ex) {
          console.log("模型加载错误", ex)
        }

      })
    },
    selectBoneFromTree(bone) {
      this.particleSystem.showEffect(bone)
      this.controls.target.copy(bone.position)
      this.$emit('boneSelected', bone)
    },
    
    onClick(event) {
      const rect = this.$refs.container.getBoundingClientRect()
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.raycaster.intersectObjects(this.scene.children, true)

      if (intersects.length) {
        const bone = this.boneManager.selectBone(intersects[0].object)
        if (bone) {
          this.particleSystem.showEffect(bone)

          // 计算骨骼在世界空间的位置
          const boneWorldPos = new THREE.Vector3()
          bone.getWorldPosition(boneWorldPos)

          // 计算相机与骨骼的距离
          const distance = this.camera.position.distanceTo(boneWorldPos)

          // 传递骨骼，点击位置和距离
          this.$emit('boneSelected', { bone, x: event.clientX, y: event.clientY, distance })
        }
      }
    }
    ,
    // 渲染动画循环
    animate() {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)

      // 如果引入了Tween.js，更新动画
      if (window.TWEEN) window.TWEEN.update()

      // 更新控制器（阻尼等）
      this.controls.update()
    },

    // 窗口尺寸变化时更新相机比例和渲染器尺寸
    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },

    // 重置骨骼位置，复原拆分效果
    resetBone(bone) {
      this.boneManager.resetBone(bone)
    },

    // 触发骨骼爆炸拆分动画
    explodeBone(bone) {
      this.boneManager.explodeBone(bone)
    },

    // 初始化dat.GUI控制面板，绑定控制参数和回调
    initGUI() {
      this.gui = new GUI()

      // 控制拆分距离，0~1，步长0.05
      this.gui.add(this.params, 'splitDistance', 0, 1, 0.05).name('拆分距离').onChange(value => {
        if (this.boneManager) this.boneManager.setSplitDistance(value)
      })

      // 控制环境光颜色，颜色选择器
      this.gui.addColor(this.params, 'lightColor').name('环境光颜色').onChange(value => {
        this.ambientLight.color.set(value)
      })

      // 控制环境光强度，范围0~2，步长0.1
      this.gui.add(this.params, 'lightIntensity', 0, 2, 0.1).name('环境光亮度').onChange(value => {
        this.ambientLight.intensity = value
      })

      // 新增背景颜色控制
      this.gui.addColor(this.params, 'backgroundColor').name('背景颜色').onChange(value => {
        this.scene.background.set(value)      // 改变Three.js场景背景颜色
      })
    },
    onSelectBone(bone) {
      if (!bone) return
      this.particleSystem.showEffect(bone)
      this.controls.target.copy(bone.position) // 摄像机聚焦选中骨骼
      this.controls.update()
      this.$emit('boneSelected', bone)
    }
  }
}
</script>

<style>
.three-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
