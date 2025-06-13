// ModelTransformManager.js
export default class ModelTransformManager {
  constructor(model) {
    this.model = model;
    this.scale = 1;
  }

  setScale(scale) {
    this.scale = Math.min(Math.max(scale, 0.2), 5);
    if (this.model) {
      this.model.scale.set(this.scale, this.scale, this.scale);
    }
  }

  adjustScaleByDelta(delta) {
    this.setScale(this.scale + delta);
  }
}
