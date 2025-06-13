// 递归骨骼节点管理、骨骼选中状态、高亮和拆分动画
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

export default class BoneManager {
  /**
   * @param {THREE.Object3D} model - 加载的骨骼模型
   * @param {number} splitDistance - 拆分时骨骼移动距离
   */
  constructor(model, splitDistance = 0.3) {
    this.model = model;
    this.splitDistance = splitDistance;

    this.bones = [];
    this.originalPositions = new Map();
    this.highlighted = null;
    this.traverseBones(model);
    this.assignRandomColors();
  }

  // 递归遍历所有骨骼节点，存储骨骼mesh及原始位置
  traverseBones(object) {
    let colorIndex = 0;
    object.traverse((child) => {
      if (child.isMesh) {
        this.bones.push(child);
        this.originalPositions.set(child.uuid, child.position.clone());

        child.userData.floatOffset = Math.random() * 100;
        child.material = child.material.clone();
        child.material.color.setHSL((colorIndex++ / 20) % 1, 0.6, 0.5);
        child.material.emissive = new THREE.Color(0x000000);
      }
      if (child.isSkinnedMesh) {
        this.meshes.push(child);

        // 提取骨骼列表（Skeleton.bones 是数组）
        if (child.skeleton && child.skeleton.bones) {
          child.skeleton.bones.forEach((bone) => {
            this.bones.push(bone);
            this.originalPositions.set(bone.uuid, bone.position.clone());
          });
        }
      }
    });
  }

  assignRandomColors() {
    // 这里只给可视的 mesh 上色，而不是 bone
    this.bones.forEach((bone) => {
      const color = new THREE.Color(
        Math.random(),
        Math.random(),
        Math.random(),
      );
      bone.material = bone.material.clone();
      bone.material.color = color;
    });
  }
  buildBoneTree() {
    const rootBones = this.bones.filter((b) => !b.parent?.isBone);
    const buildNode = (bone) => ({
      bone,
      children: bone.children.filter((c) => c.isBone).map(buildNode),
    });
    return {
      bone: { name: "根骨骼" },
      children: rootBones.map(buildNode),
    };
  }
  /**
   * 选中骨骼，执行拆分动画
   * @param {THREE.Object3D} mesh - 被点击的骨骼网格
   * @returns {THREE.Object3D|null} bone - 返回选中的骨骼
   */
  // selectBone(mesh) {
  //   const bone = this.bones.find((b) => b.uuid === mesh.uuid);
  //   if (!bone) return null;

  //   // 计算拆分的目标位置，基于当前拆分距离
  //   const newPos = bone.position
  //     .clone()
  //     .add(new THREE.Vector3(this.splitDistance, this.splitDistance, 0));

  //   // 使用Tween动画平滑移动到新位置
  //   new TWEEN.Tween(bone.position).to(newPos, 500).start();

  //   return bone;
  // }
  selectBone(mesh) {
    // 确认传入的是 Mesh
    if (!mesh.isMesh) return null;

    // 找到对应骨骼 Mesh
    const bone = this.bones.find(b => b.uuid === mesh.uuid);
    if (!bone) return null;

    // 计算拆分方向（你也可以自定义更合理方向）
    const offset = new THREE.Vector3(this.splitDistance, this.splitDistance, 0);

    // 目标位置 = 原始位置 + 偏移（避免多次点击叠加）
    const origPos = this.originalPositions.get(bone.uuid);
    if (!origPos) return null;

    const newPos = origPos.clone().add(offset);

    // Tween 动画移动到目标位置
    new TWEEN.Tween(bone.position)
      .to(newPos, 500)
      .start();

    return bone;
  }
  /**
   * 重置骨骼到原始位置
   * @param {THREE.Object3D} bone
   */
  resetBone(bone) {
    const orig = this.originalPositions.get(bone.uuid);
    if (orig) {
      new TWEEN.Tween(bone.position).to(orig, 500).start();
    }
  }

  /**
   * 动态设置拆分距离（通过控制面板修改时调用）
   * @param {number} distance
   */
  setSplitDistance(distance) {
    this.splitDistance = distance;
  }
  // getBoneTree() {
  //   const buildTree = (bone) => {
  //     const children = bone.children
  //       .filter(child => this.bones.includes(child))
  //       .map(child => buildTree(child))
  //     return { bone, children }
  //   }

  //   const roots = this.model.children.filter(c => this.bones.includes(c))
  //   return buildTree(roots[0]) // 以第一个 mesh 为根节点构建树
  // }
  getBoneTree() {
    const map = new Map();
    const roots = [];

    // 第一次遍历：建立所有节点
    this.model.traverse((child) => {
      if (child.isMesh) {
        map.set(child.uuid, {
          name: child.name || "Unnamed Bone",
          bone: child,
          children: [],
        });
      }
    });

    // 第二次遍历：建立父子关系
    this.model.traverse((child) => {
      if (child.isMesh) {
        const node = map.get(child.uuid);
        const parent = child.parent;
        const parentNode = map.get(parent?.uuid);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          roots.push(node); // 没有父节点的，认为是根节点
        }
      }
    });

    // 返回一个虚拟的根节点（防止 BoneTree 组件报错）
    return {
      name: "根骨骼",
      bone: null,
      children: roots,
    };
  }
  /**
   * 爆炸拆分动画
   * @param {THREE.Object3D} bone
   */
  explodeBone(bone, index = 0, total = 1) {
    const angle = (index / total) * Math.PI * 2;
    const radius = 1.5; // 拆得更远
    const dir = new THREE.Vector3(Math.cos(angle), 0.5, Math.sin(angle))
      .normalize()
      .multiplyScalar(radius);
    const newPos = bone.position.clone().add(dir);
    new TWEEN.Tween(bone.position)
      .to(newPos, 1200)
      .easing(TWEEN.Easing.Exponential.Out)
      .start();
  }
  explodeAllBones() {
    // 遍历所有骨骼 mesh 对象
    this.bones.forEach((bone) => {
      // 生成一个随机方向向量（x, y, z 各方向都是随机值）
      const dir = new THREE.Vector3(Math.random(), Math.random(), Math.random())
        .normalize() // 将向量归一化为单位长度，表示方向
        .multiplyScalar(0.5); // 缩放向量长度为 0.5，用于控制骨骼“爆炸”距离

      // 计算新的目标位置 = 当前骨骼位置 + 方向偏移量
      const newPos = bone.position.clone().add(dir);

      // 使用 Tween.js 创建一个动画，让骨骼平滑移动到新位置
      new TWEEN.Tween(bone.position) // 初始位置
        .to(newPos, 1000) // 目标位置，动画持续时间为 1000 毫秒
        .easing(TWEEN.Easing.Elastic.Out) // 使用“弹性”缓动函数，效果更自然、有弹性
        .start(); // 启动动画
    });
  }
  resetAllBones() {
    // 遍历所有骨骼 mesh 对象
    this.bones.forEach((bone) => {
      // 从原始位置映射表中获取该骨骼对应的初始位置
      const orig = this.originalPositions.get(bone.uuid);
      if (orig) {
        // 使用 Tween 动画将当前骨骼位置平滑移动回初始位置（耗时 500 毫秒）
        new TWEEN.Tween(bone.position).to(orig, 500).start();
      }
    });
  }
  highlight(bone) {
    if (this.highlighted && this.highlighted !== bone) {
      this.unhighlight(this.highlighted);
    }
    // 骨骼是不可见对象，可考虑添加辅助对象或发光球体高亮
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    );
    bone.add(sphere);
    bone.userData.highlightSphere = sphere;
    this.highlighted = bone;
  }

  unhighlight(bone) {
    if (bone.userData.highlightSphere) {
      bone.remove(bone.userData.highlightSphere);
      delete bone.userData.highlightSphere;
    }
    if (this.highlighted === bone) this.highlighted = null;
  }
}
