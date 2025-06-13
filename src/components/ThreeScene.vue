<template>
  <div ref="container" class="three-container">
    <BoneTree v-if="boneTree" :tree="boneTree" @select="onSelectBone" />
  </div>
</template>
<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import BoneManager from "./js/BoneManager";
import ParticlesEffect from "./js/ParticlesEffect";
import { GUI } from "dat.gui"; // 导入dat.gui库
import BoneTree from "./BoneTree.vue";

export default {
  emits: ["boneSelected"],
  components: { BoneTree },
  data() {
    return {
      scene: null, // Three.js 场景对象
      camera: null, // 摄像机
      renderer: null, // 渲染器
      raycaster: new THREE.Raycaster(), // 射线检测工具
      mouse: new THREE.Vector2(), // 鼠标坐标（标准设备坐标系）
      boneManager: null, // 骨骼管理器实例
      particleSystem: null, // 粒子特效实例
      ambientLight: null, // 环境光对象
      gui: null, // dat.GUI实例

      // 可通过GUI调节的参数
      params: {
        splitDistance: 0.3, // 骨骼拆分距离，默认0.3
        lightColor: "#ffffff", // 环境光颜色，白色
        lightIntensity: 0.8, // 环境光亮度
        backgroundColor: "#202020", // 场景背景色，深灰色
      },
      boneTree: null,
    };
  },
  mounted() {
    this.initThree(); // 初始化Three.js环境
    this.loadModel(); // 加载骨骼模型

    // 监听窗口大小变化，响应式调整摄像机和渲染器
    window.addEventListener("resize", this.onResize);

    // 监听点击事件，实现骨骼选中
    this.$refs.container.addEventListener("click", this.onClick);

    this.initGUI(); // 初始化GUI控件面板
  },
  beforeDestroy() {
    // 组件销毁时，移除事件监听，释放资源
    window.removeEventListener("resize", this.onResize);
    this.$refs.container.removeEventListener("click", this.onClick);
    if (this.gui) this.gui.destroy();
  },
  methods: {
    // 初始化Three.js场景、相机、渲染器、光照和控件
    initThree() {
      // 创建一个新的场景（Scene 是承载所有物体、灯光、相机等元素的容器）
      this.scene = new THREE.Scene();

      // 设置场景的背景颜色（背景色可以通过参数控制，比如浅灰色或黑色等）
      this.scene.background = new THREE.Color(this.params.backgroundColor);

      // 创建一个透视投影相机（模拟人眼视觉）
      this.camera = new THREE.PerspectiveCamera(
        45, // 视野角度（越大视角越广）
        window.innerWidth / window.innerHeight, // 宽高比（保持画面不变形）
        0.1, // 近裁剪面（小于该距离的物体不会被渲染）
        1000, // 远裁剪面（大于该距离的物体不会被渲染）
      );

      // 设置相机位置
      // x = 0：居中
      // y = 1.5：略高于模型，带有俯视效果
      // z = 120：拉远距离，以容纳完整模型
      this.camera.position.set(0, 1.5, 120);

      // 创建 WebGL 渲染器（负责将场景渲染成图像）
      this.renderer = new THREE.WebGLRenderer({ antialias: true }); // 开启抗锯齿
      this.renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染器画布大小为窗口尺寸

      // 将渲染器的 canvas 元素添加到 DOM 容器中
      this.$refs.container.appendChild(this.renderer.domElement);

      // 创建轨道控制器（支持鼠标旋转、缩放、拖拽场景）
      // 用于用户交互操作场景中的相机
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);

      // 添加环境光（AmbientLight 提供全局、均匀的光照，没有方向）
      // 通常用于保证物体的基本可见性，避免完全黑暗
      this.ambientLight = new THREE.AmbientLight(
        this.params.lightColor, // 环境光颜色（例如白色、柔和色）
        this.params.lightIntensity, // 环境光强度（0 ~ 1）
      );
      this.scene.add(this.ambientLight); // 将环境光添加到场景中
    },
    loadModel() {
      // 创建一个 GLTFLoader 实例，用于加载 .glb / .gltf 格式的3D模型
      const loader = new GLTFLoader();

      // 加载模型文件（路径指向本地 public 目录下的模型文件）
      loader.load("/models/lkn_by_get3dmodels.glb", (gltf) => {
        try {
          // 加载完成后获取模型的场景对象（即模型的根节点）
          const model = gltf.scene;

          // 将模型添加到场景中
          this.scene.add(model);

          // 创建骨骼管理器，用于控制骨骼拆分、层级结构和交互
          // 参数为模型的根节点
          this.boneManager = new BoneManager(model);

          // 获取模型的骨骼层级结构（返回一个树形结构，用于构建骨骼树组件）
          this.boneTree = this.boneManager.getBoneTree();

          // 向父组件派发事件，通知骨骼树已准备好（供 BoneTree.vue 使用）
          this.$emit("boneTreeReady", this.boneTree);

          // 初始化粒子特效系统（如点击骨骼时的闪光等效果）
          this.particleSystem = new ParticlesEffect(this.scene);

          // 启动动画渲染循环
          this.animate();
        } catch (ex) {
          // 捕获并输出模型处理过程中可能的异常
          console.log("模型加载错误", ex);
        }
      });
    },
    selectBoneFromTree(bone) {
      this.particleSystem.showEffect(bone);
      this.controls.target.copy(bone.position);
      this.$emit("boneSelected", bone);
    },

    onClick(event) {
      const rect = this.$refs.container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.scene.children,
        true,
      );

      if (intersects.length) {
        const bone = this.boneManager.selectBone(intersects[0].object);
        if (bone) {
          this.particleSystem.showEffect(bone);

          // 计算骨骼在世界空间的位置
          const boneWorldPos = new THREE.Vector3();
          bone.getWorldPosition(boneWorldPos);

          // 计算相机与骨骼的距离
          const distance = this.camera.position.distanceTo(boneWorldPos);

          // 传递骨骼，点击位置和距离
          this.$emit("boneSelected", {
            bone,
            x: event.clientX,
            y: event.clientY,
            distance,
          });
        }
      }
    },
    // 渲染动画循环
    animate() {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);

      // 如果引入了Tween.js，更新动画
      if (window.TWEEN) window.TWEEN.update();

      // 更新控制器（阻尼等）
      this.controls.update();
    },

    // 窗口尺寸变化时更新相机比例和渲染器尺寸
    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    // 重置骨骼位置，复原拆分效果
    resetBone(bone) {
      this.boneManager.resetBone(bone);
    },

    // 触发骨骼爆炸拆分动画
    explodeBone(bone) {
      this.boneManager.explodeBone(bone);
    },

    // 初始化dat.GUI控制面板，绑定控制参数和回调
    initGUI() {
      this.gui = new GUI();

      // 控制拆分距离，0~1，步长0.05
      this.gui
        .add(this.params, "splitDistance", 0, 1, 0.05)
        .name("拆分距离")
        .onChange((value) => {
          if (this.boneManager) this.boneManager.setSplitDistance(value);
        });

      // 控制环境光颜色，颜色选择器
      this.gui
        .addColor(this.params, "lightColor")
        .name("环境光颜色")
        .onChange((value) => {
          this.ambientLight.color.set(value);
        });

      // 控制环境光强度，范围0~2，步长0.1
      this.gui
        .add(this.params, "lightIntensity", 0, 2, 0.1)
        .name("环境光亮度")
        .onChange((value) => {
          this.ambientLight.intensity = value;
        });

      // 新增背景颜色控制
      this.gui
        .addColor(this.params, "backgroundColor")
        .name("背景颜色")
        .onChange((value) => {
          this.scene.background.set(value); // 改变Three.js场景背景颜色
        });
    },
    onSelectBone(bone) {
      if (!bone) return;
      this.particleSystem.showEffect(bone);
      this.controls.target.copy(bone.position); // 摄像机聚焦选中骨骼
      this.controls.update();
      this.$emit("boneSelected", bone);
    },
    explodeAllBones() {
      this.boneManager.explodeAllBones();
    },
    resetAllBones() {
      this.boneManager.resetAllBones();
    },
  },
};
</script>

<style>
.three-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
