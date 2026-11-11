import { createApp } from 'vue'
import { appRoot } from 'virtual:qk-app-root'
import './assets/screen.css'
import App from './App.vue'
import router from './router'
import { setScreenToken } from './api/request'
import { destroyScreenRuntime } from './utils/screenRuntime'

const APP_NAME = 'big-screen'

let app = null
let releaseStyleBridge = null

function resolveMountTarget(container) {
  const target = typeof container === 'string' ? document.querySelector(container) : container
  const appNode = target && typeof target.querySelector === 'function' ? target.querySelector('#app') : null
  if (appNode) return appNode
  if (target && target.nodeType === 11) {
    const fallback = document.createElement('div')
    fallback.id = 'app'
    target.appendChild(fallback)
    return fallback
  }
  return '#app'
}

function bridgeShadowStyles(shadowRoot) {
  if (!import.meta.env.DEV || !shadowRoot || shadowRoot.nodeType !== 11) {
    return null
  }

  const mirrored = new Map()

  const isOwnStyle = (id) => typeof id === 'string' && id.indexOf(appRoot) === 0

  const sync = () => {
    document.querySelectorAll('style[data-vite-dev-id]').forEach((source) => {
      const id = source.getAttribute('data-vite-dev-id')
      if (!isOwnStyle(id)) return

      let target = mirrored.get(id)
      if (!target) {
        target = document.createElement('style')
        target.setAttribute('data-vite-dev-id', id)
        mirrored.set(id, target)
        shadowRoot.appendChild(target)
      }
      if (target.textContent !== source.textContent) {
        target.textContent = source.textContent
      }
    })
  }

  sync()

  const observer = new MutationObserver(sync)
  observer.observe(document.head, { childList: true, subtree: true, characterData: true })

  return () => observer.disconnect()
}

function render(props = {}) {
  const { container, token } = props

  setScreenToken(token || null)

  releaseStyleBridge = bridgeShadowStyles(container)

  app = createApp(App)
  app.use(router)
  app.mount(resolveMountTarget(container))
}

export async function bootstrap() {
  console.log('[big-screen] bootstrap')
}

export async function mount(props) {
  console.log('[big-screen] mount', props)
  render(props)
}

export async function unmount() {
  console.log('[big-screen] unmount')
  if (releaseStyleBridge) {
    releaseStyleBridge()
    releaseStyleBridge = null
  }
  destroyScreenRuntime()
  if (app) {
    app.unmount()
    app = null
  }
}

if (window.__POWERED_BY_QIANKUN__) {
  window[APP_NAME] = { bootstrap, mount, unmount }
} else {
  render()
}