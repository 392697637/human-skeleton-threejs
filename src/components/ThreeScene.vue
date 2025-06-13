<template>
  <div ref="container" class="three-container">
    <!-- 如果骨骼树数据存在，则显示骨骼树组件，绑定选择事件 -->
    <BoneTree v-if="boneTree" :tree="boneTree" @select="onSelectBone" />
  </div>
</template>
<script>
import * as THREE from "three"; // 导入Three.js核心库
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; // glTF模型加载器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // 轨道控制器
import BoneManager from "./js/BoneManager"; // 自定义骨骼管理类
import ParticlesEffect from "./js/ParticlesEffect"; // 自定义粒子特效类
import { GUI } from "dat.gui"; // dat.GUI界面控制库
import BoneTree from "./BoneTree.vue"; // 骨骼树组件

export default {
  emits: ["boneSelected"], // 组件向外派发 boneSelected 事件
  components: { BoneTree },
  data() {
    return {
      scene: null, // Three.js 场景对象
      camera: null, // 摄像机对象
      renderer: null, // 渲染器对象
      raycaster: new THREE.Raycaster(), // 射线检测器，用于拾取模型
      mouse: new THREE.Vector2(), // 鼠标坐标（归一化设备坐标）

      boneManager: null, // 骨骼管理器实例
      particleSystem: null, // 粒子特效实例
      ambientLight: null, // 环境光对象
      gui: null, // dat.GUI实例

      // 可通过GUI调节的参数集合
      params: {
        splitDistance: 0.3, // 骨骼拆分距离（0~1）
        lightColor: "#ffffff", // 环境光颜色
        lightIntensity: 0.8, // 环境光强度
        backgroundColor: "#202020", // 场景背景颜色
      },

      boneTree: null, // 骨骼树数据（用于骨骼树组件展示）
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
    // 加载glb模型，构建骨骼管理器和骨骼树
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
    // 当通过骨骼树组件选中某个骨骼时触发该方法
    // 参数 bone 是被选中的骨骼对象
    onSelectBone(bone) {
      if (!bone) return; // 如果骨骼为空，则直接返回，避免报错

      // 显示粒子特效，突出显示选中的骨骼
      this.particleSystem.showEffect(bone);

      // 将摄像机控制器的目标点设置为选中骨骼的位置，实现摄像机聚焦效果
      this.controls.target.copy(bone.position);

      // 更新控制器，使摄像机视角立即响应目标点的改变
      this.controls.update();

      // 向父组件派发“boneSelected”事件，传递当前选中的骨骼对象
      this.$emit("boneSelected", bone);
    },
    selectBoneFromTree(bone) {
      this.particleSystem.showEffect(bone);
      this.controls.target.copy(bone.position);
      this.$emit("boneSelected", bone);
    },
    // 鼠标点击Three.js容器时触发，进行射线拾取以选中骨骼
    onClick(event) {
      // 获取渲染容器在页面中的位置和尺寸，用于转换鼠标坐标
      const rect = this.$refs.container.getBoundingClientRect();

      // 将鼠标点击的屏幕坐标转换为Three.js的标准设备坐标（范围从 -1 到 1）
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // 利用摄像机和鼠标位置设置射线检测器
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 计算射线与场景中所有对象的交点（true 表示递归检测子对象）
      const intersects = this.raycaster.intersectObjects(
        this.scene.children,
        true,
      );

      // 如果有交点，说明点击到了某个物体
      if (intersects.length) {
        // 通过骨骼管理器找到与第一个交点物体对应的骨骼
        const bone = this.boneManager.selectBone(intersects[0].object);

        if (bone) {
          // 显示选中骨骼的粒子特效，增强视觉反馈
          this.particleSystem.showEffect(bone);

          // 获取骨骼在世界坐标系中的位置
          const boneWorldPos = new THREE.Vector3();
          bone.getWorldPosition(boneWorldPos);

          // 计算摄像机与骨骼之间的距离，用于后续显示或动画参考
          const distance = this.camera.position.distanceTo(boneWorldPos);

          // 向父组件派发事件，传递选中骨骼及点击的屏幕坐标和距离信息
          this.$emit("boneSelected", {
            bone, // 被选中的骨骼对象
            x: event.clientX, // 鼠标点击的水平屏幕坐标
            y: event.clientY, // 鼠标点击的垂直屏幕坐标
            distance, // 摄像机与骨骼的距离
          });
        }
      }
    },

    // 渲染动画循环，持续更新画面和控制器状态
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

    // 复位某个骨骼位置，撤销拆分效果
    resetBone(bone) {
      this.boneManager.resetBone(bone);
    },

    // 拆分某个骨骼，播放爆炸动画效果
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
    // 爆炸拆分全部骨骼
    explodeAllBones() {
      this.boneManager.explodeAllBones();
    },
    // 恢复全部骨骼到初始状态
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
  /* 防止滚动条出现，保证全屏渲染 */
}
</style>
