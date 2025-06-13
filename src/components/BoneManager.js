import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

export default class BoneManager {
  /**
   * @param {THREE.Object3D} model - 加载的骨骼模型
   * @param {number} splitDistance - 拆分时骨骼移动距离
   */
  constructor(model, splitDistance = 0.3) {
    this.model = model
    this.splitDistance = splitDistance

    this.bones = []
    this.originalPositions = new Map()
    this.traverseBones(model)
  }

  // 递归遍历所有骨骼节点，存储骨骼mesh及原始位置
  traverseBones(object) {
    object.traverse(child => {
      if (child.isMesh) {
        this.bones.push(child)
        this.originalPositions.set(child.uuid, child.position.clone())
      }
    })
  }
  buildBoneTree() {
    const rootBones = this.bones.filter(b => !b.parent?.isBone)
    const buildNode = (bone) => ({
      bone,
      children: bone.children.filter(c => c.isBone).map(buildNode)
    })
    return {
      bone: { name: '根骨骼' },
      children: rootBones.map(buildNode)
    }
  }
  /**
   * 选中骨骼，执行拆分动画
   * @param {THREE.Object3D} mesh - 被点击的骨骼网格
   * @returns {THREE.Object3D|null} bone - 返回选中的骨骼
   */
  selectBone(mesh) {
    const bone = this.bones.find(b => b.uuid === mesh.uuid)
    if (!bone) return null

    // 计算拆分的目标位置，基于当前拆分距离
    const newPos = bone.position.clone().add(new THREE.Vector3(this.splitDistance, this.splitDistance, 0))

    // 使用Tween动画平滑移动到新位置
    new TWEEN.Tween(bone.position).to(newPos, 500).start()

    return bone
  }

  /**
   * 重置骨骼到原始位置
   * @param {THREE.Object3D} bone
   */
  resetBone(bone) {
    const orig = this.originalPositions.get(bone.uuid)
    if (orig) {
      new TWEEN.Tween(bone.position).to(orig, 500).start()
    }
  }

  /**
   * 爆炸拆分动画
   * @param {THREE.Object3D} bone
   */
  explodeBone(bone) {
    // 随机方向单位向量，缩放为0.5倍距离
    const dir = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize().multiplyScalar(0.5)
    const newPos = bone.position.clone().add(dir)

    new TWEEN.Tween(bone.position).to(newPos, 1000).easing(TWEEN.Easing.Elastic.Out).start()
  }

  /**
   * 动态设置拆分距离（通过控制面板修改时调用）
   * @param {number} distance
   */
  setSplitDistance(distance) {
    this.splitDistance = distance
  }
  getBoneTree() {
    const buildTree = (bone) => {
      const children = bone.children
        .filter(child => this.bones.includes(child))
        .map(child => buildTree(child))
      return { bone, children }
    }
  
    const roots = this.model.children.filter(c => this.bones.includes(c))
    return buildTree(roots[0]) // 以第一个 mesh 为根节点构建树
  }

}
