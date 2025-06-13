# human-skeleton-threejs

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


src/
├── components/
│   ├── HumanSkeleton.vue           # 主组件，容器，负责加载和布局
│   ├── ThreeScene.vue              # Three.js 场景初始化，渲染，事件管理
│   ├── BoneManager.js              # JS模块，递归遍历骨骼，选中，拆分动画逻辑
│   ├── ParticlesEffect.js          # JS模块，粒子特效管理（初始化，爆炸，动画）
│   └── InfoPanel.vue               # 选中骨骼信息展示组件
├── App.vue
├── main.js

HumanSkeleton.vue	主Vue组件，渲染ThreeScene，InfoPanel，传递交互数据
ThreeScene.vue	负责Three.js环境搭建、模型加载、鼠标/触摸事件监听
BoneManager.js	递归骨骼节点管理、骨骼选中状态、高亮和拆分动画
ParticlesEffect.js	粒子特效逻辑（缓慢流动，爆炸等动画效果）
InfoPanel.vue	显示选中骨骼详细信息，控制拆分复原和爆炸特效按钮

npm run lint:pritter  来美化代码