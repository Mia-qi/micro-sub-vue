import { createApp } from 'vue'
import App from './App.vue'

let app = null

// 渲染函数：如果主应用传了 container，就挂载到 container 内；否则挂载到自己的 #app
function render(props = {}) {
  const { container } = props
  app = createApp(App)
  app.mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时的判断（如果直接访问 5174 端口）
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// === 必须导出的 qiankun 生命周期 ===
export async function bootstrap() {
  console.log('子应用 bootstrap')
}

export async function mount(props) {
  console.log('子应用 mount，收到主应用数据:', props)
  render(props)
}

export async function unmount() {
  console.log('子应用 unmount')
  if (app) {
    app.unmount()
    app = null
  }
}