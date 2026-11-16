# 智慧园区运维监控大屏（qiankunsub）

> 基于 **Vue 3 + Vite + ECharts** 的数据可视化大屏项目，同时作为 **qiankun 微前端子应用**，可独立访问，也可被主应用以 `/screen` 路由挂载运行。

## 一、项目简介

`qiankunsub` 是面向智慧园区场景的 **运维监控可视化大屏**，以 1920×1080 设计稿为基准，通过 `transform: scale` 等比缩放适配不同分辨率，集成能源、安防、消防、设备、告警、工单等多维数据，支持时间范围 / 楼栋 / 设备类型 / 告警等级筛选，自动刷新与一键全屏。

项目作为 qiankun 子应用存在：

- **独立运行**：`npm run dev` 后直接访问 `http://localhost:5175`，方便本地开发与演示。
- **作为子应用**：主应用通过 qiankun 注册并以 `activeRule: '/screen'` 加载，主应用隐藏自身框架后全屏展示。

## 二、技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3（`script setup` 组合式 API） |
| 构建 | Vite 8 |
| 路由 | Vue Router 4 |
| 图表 | ECharts 6 |
| HTTP | Axios |
| 微前端 | qiankun（子应用形态） |
| 状态 | Vue `reactive` 自建轻量 store |

## 三、核心功能

- **核心指标概览（KPI）**：设备总数 / 在线 / 离线、当前告警（高/中/低分布）、在处理 / 待派单工单、今日水电消耗、园区实时人流量，并显示环比与运行状态。
- **能源分析**：能耗趋势折线图、楼栋能耗排行、能源结构占比（空调 / 照明 / 动力配电 / 其他）。
- **安防与消防**：安防事件统计、消防告警分类（烟感 / 温感 / 水压异常 / 其他）。
- **设备状态**：按设备类型（配电、消防、空调、门禁、摄像头、给排水）统计正常 / 预警 / 故障 / 离线。
- **告警与工单**：实时告警跑马灯、告警列表（支持确认）、工单列表（支持从告警 / 设备详情生成工单）。
- **设备详情**：点击楼栋 / 设备打开弹窗，查看设备信息、关联告警与工单。
- **筛选与交互**：时间范围（今日/本周/本月/本季度/本年/自定义）、楼栋、设备类型、告警等级筛选；图表点击联动筛选。
- **刷新策略**：可开关的自动刷新（30/60/120 秒），页面不可见时暂停轮询以节省请求。
- **全屏展示**：一键进入 / 退出浏览器全屏。
- **微前端通信**：通过 qiankun `props` 接收 `token` 等上下文，子应用通过 `CustomEvent` 与全局状态把筛选 / 选中事件回传给主应用。

## 四、目录结构

```text
qiankunsub/
├── docs/
│   └── 大屏可视化技术方案.md       # 微前端大屏技术方案（架构/适配/性能/接口/安全）
├── src/
│   ├── api/
│   │   ├── request.js              # axios 实例、拦截器、mock 开关
│   │   └── screen.js               # 大屏相关接口封装
│   ├── assets/
│   │   └── screen.css              # 大屏全局样式（主题变量等）
│   ├── components/
│   │   ├── common/
│   │   │   ├── BaseChart.vue       # ECharts 通用封装（loading/error/empty）
│   │   │   └── ScreenPanel.vue     # 通用面板容器（标题/边框/装饰）
│   │   ├── dashboard/              # 业务图表与面板组件
│   │   │   ├── KpiCards.vue
│   │   │   ├── EnergyTrendChart.vue
│   │   │   ├── BuildingRankChart.vue
│   │   │   ├── EnergyRatioChart.vue
│   │   │   ├── SecurityStats.vue
│   │   │   ├── FireStats.vue
│   │   │   ├── DeviceStatusChart.vue
│   │   │   ├── AlarmList.vue
│   │   │   ├── WorkOrderList.vue
│   │   │   ├── BottomPanel.vue
│   │   │   └── DeviceDetailModal.vue
│   │   └── layout/
│   │       ├── TopBar.vue          # 顶部标题 + 筛选栏 + 全屏/刷新
│   │       └── AlarmMarquee.vue    # 告警跑马灯
│   ├── composables/
│   │   ├── useScreenScale.js       # 大屏等比缩放（1920×1080）
│   │   └── useEChart.js            # ECharts 实例生命周期与自动 resize
│   ├── constants/index.js          # 楼栋/时间范围/设备类型/状态映射等常量
│   ├── mock/dashboard.js           # 本地 Mock 数据
│   ├── router/index.js             # 路由（qiankun 下 base 为 /screen）
│   ├── store/screenStore.js        # 轻量响应式 store（数据/筛选/轮询/弹窗）
│   ├── utils/
│   │   ├── chartTheme.js           # ECharts 主题配置
│   │   ├── screenRuntime.js        # 统一资源清理（定时器/图表/事件）
│   │   ├── screenEvents.js         # 对外事件派发（CustomEvent + 全局状态）
│   │   └── time.js                 # 时间范围解析与格式化
│   ├── views/Index.vue             # 大屏主视图（布局装配）
│   ├── App.vue
│   └── main.js                     # 入口 + qiankun 生命周期（bootstrap/mount/unmount）
├── index.html
├── vite.config.js                  # 含 qiankun 子应用入口改造插件
└── package.json
```

## 五、快速开始

### 环境要求

- Node.js ≥ 18
- npm（或 pnpm / yarn）

### 安装依赖

```bash
npm install
```

### 本地开发（独立运行）

```bash
npm run dev
```

默认端口 `5175`，访问 `http://localhost:5175` 即可查看大屏。

### 构建

```bash
npm run build
```

构建产物输出到 `dist/`，入口为 `index.js`，CSS 内联到 `index.html`，便于 qiankun 直接加载。

### 本地预览构建产物

```bash
npm run preview
```

## 六、环境变量

在项目根目录创建 `.env` / `.env.development` / `.env.production` 进行配置：

```env
# 是否使用本地 mock 数据（默认开启）；设为 false 走真实接口
VITE_USE_MOCK=true

# 接口基础地址（真实接口模式下生效）
VITE_API_BASE=

# 生产部署 publicPath（qiankun 主应用加载子应用的资源地址）
VITE_PUBLIC_PATH=/
```

## 七、qiankun 子应用集成

### 子应用侧

`src/main.js` 已导出 qiankun 生命周期：

```js
export async function bootstrap() { /* ... */ }
export async function mount(props) { /* render(props) */ }
export async function unmount() { /* 销毁 app、清理资源 */ }
```

`vite.config.js` 通过自定义插件实现：

- **开发态**：移除 `<script type="module">`，注入入口引导脚本，兼容 qiankun `import-html-entry` 加载。
- **构建态**：关闭 CSS 分包，将 CSS 内联进 `index.html`，并注入运行时 publicPath 与生命周期暴露脚本。

### 主应用侧注册示例

```js
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'big-screen',
    entry: '//localhost:5175',          // 开发态；生产改为子应用部署地址
    container: '#subapp-container',
    activeRule: '/screen',
    props: {
      token: () => localStorage.getItem('access_token')
    }
  }
])

start({ sandbox: { experimentalStyleIsolation: true } })
```

主应用在命中 `/screen` 时隐藏自身 Header / Sidebar，让子应用容器占满视口即可实现全屏展示。

### 通信约定

| 方向 | 方式 | 内容 |
| --- | --- | --- |
| 主 → 子 | `props.token` | 只读鉴权 Token |
| 子 → 主 | `CustomEvent('screen:xxx')` | 楼栋 / 楼层 / 设备选中、筛选变更等 |
| 子 → 主 | `setGlobalState` | 同步 `screenEvent` 全局状态 |

## 八、关键设计

### 1. 屏幕适配

以 1920×1080 为设计稿，通过 `transform: scale` 等比缩放（取宽高比的较小值），保证图表与地图不变形；监听 `resize` 并使用 `requestAnimationFrame` 节流。

### 2. ECharts 封装

`useEChart` 统一管理图表实例：

- 自动 `init` / `dispose`，`ResizeObserver` 监听容器尺寸自动 `resize`。
- 支持 option 预挂载（容器尚未就绪时暂存，就绪后应用）。
- 所有图表实例与监听通过 `screenRuntime` 统一登记，`unmount` 时一次性释放，避免内存泄漏。

### 3. 数据与轮询

`screenStore` 集中管理响应式状态：

- `fetchAll` 并发请求所有模块数据，每个模块独立 `loading` / `error`。
- 自动刷新默认 30 秒，`document.visibilityState !== 'visible'` 时暂停，避免后台无效请求。
- 筛选变更（时间 / 楼栋 / 设备 / 告警等级）立即触发刷新。

### 4. 资源清理

`utils/screenRuntime.js` 提供 `registerTask` 机制，定时器、`ResizeObserver`、ECharts 实例、事件监听等资源统一登记，`unmount` 时调用 `destroyScreenRuntime` 集中释放。

## 九、接口概览（真实接口模式）

统一响应结构：

```json
{ "code": 200, "message": "ok", "data": {} }
```

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/dashboard/kpi` | 核心指标概览 |
| GET | `/api/dashboard/energy/trend` | 能耗趋势 |
| GET | `/api/dashboard/energy/building-rank` | 楼栋能耗排行 |
| GET | `/api/dashboard/energy/ratio` | 能源结构占比 |
| GET | `/api/dashboard/security/stats` | 安防事件统计 |
| GET | `/api/dashboard/fire/stats` | 消防告警统计 |
| GET | `/api/dashboard/device/status` | 设备状态分布 |
| GET | `/api/warn/list` | 告警列表 |
| POST | `/api/warn/confirm` | 确认告警 |
| GET | `/api/workorder/list` | 工单列表 |
| POST | `/api/workorder/create` | 生成工单 |
| GET | `/api/device/detail` | 设备详情 |

## 十、部署

1. `npm run build` 生成 `dist/`。
2. 将 `dist/` 部署到静态服务器（如 Nginx），确保主应用可跨域访问其 `index.html`。
3. 配置 `VITE_PUBLIC_PATH` 为子应用的实际访问地址，保证资源路径正确。
4. 主应用 qiankun 注册时把 `entry` 指向该地址。

## 十一、文档

- [微前端大屏可视化技术方案](./docs/大屏可视化技术方案.md)：涵盖架构决策、屏幕适配、图表性能、数据更新策略、后端接口规范、安全要求与验收指标。