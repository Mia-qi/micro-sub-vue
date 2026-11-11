import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const APP_NAME = 'big-screen'
const DEV_PORT = 5175
const DEV_ORIGIN = `http://localhost:${DEV_PORT}`
const DEV_ENTRY = 'src/main.js'
const BUILD_ENTRY = 'index.js'

const MODULE_SCRIPT_RE = /<script\s+type="module"[^>]*>\s*<\/script>\s*/g
const CSS_LINK_RE = /<link\s+rel="stylesheet"[^>]*>\s*/g
const MODULE_PRELOAD_RE = /<link\s+rel="modulepreload"[^>]*>\s*/g

function bootstrapScript(entry, fallbackPublicPath, withViteClient) {
  const lines = [
    '<script>',
    '(function () {',
    `  var appName = '${APP_NAME}'`,
    '  var host = document.defaultView',
    '  var embedded = !!window.__POWERED_BY_QIANKUN__',
    '  if (embedded) {',
    '    host.__POWERED_BY_QIANKUN__ = true',
    '  }',
    `  var base = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || '${fallbackPublicPath}'`,
    "  if (base.indexOf('//') === 0) base = host.location.protocol + base",
    "  if (base.charAt(base.length - 1) !== '/') base += '/'"
  ]

  if (withViteClient) {
    lines.push("  import(base + '@vite/client').catch(function () {})")
  }

  lines.push(
    `  var ready = import(base + '${entry}')`,
    '  ready.catch(function (error) {',
    `    console.error('[${APP_NAME}] 入口模块加载失败', error)`,
    '  })',
    '  if (embedded) {',
    '    window[appName] = {',
    '      bootstrap: function () { return ready.then(function (mod) { return mod.bootstrap() }) },',
    '      mount: function (props) { return ready.then(function (mod) { return mod.mount(props) }) },',
    '      unmount: function () { return ready.then(function (mod) { return mod.unmount() }) }',
    '    }',
    '  }',
    '})()',
    '</script>'
  )

  return lines.join('\n')
}

function qiankunServeEntry() {
  return {
    name: 'qiankun-serve-entry',
    apply: 'serve',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replace(MODULE_SCRIPT_RE, '')
          .replace('</body>', `${bootstrapScript(DEV_ENTRY, DEV_ORIGIN, true)}\n  </body>`)
      }
    }
  }
}

function qiankunBuildEntry(publicPath) {
  return {
    name: 'qiankun-build-entry',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const cssFiles = Object.keys(bundle).filter((file) => file.endsWith('.css'))
      const css = cssFiles.map((file) => bundle[file].source).join('\n')
      const htmlFiles = Object.keys(bundle).filter((file) => file.endsWith('.html'))

      htmlFiles.forEach((file) => {
        let html = bundle[file].source
        html = html
          .replace(MODULE_SCRIPT_RE, '')
          .replace(CSS_LINK_RE, '')
          .replace(MODULE_PRELOAD_RE, '')

        if (css) {
          html = html.replace('</head>', `<style>\n${css}\n</style>\n  </head>`)
        }

        html = html.replace('</body>', `${bootstrapScript(BUILD_ENTRY, publicPath, false)}\n  </body>`)
        bundle[file].source = html
      })

      cssFiles.forEach((file) => {
        delete bundle[file]
      })
    }
  }
}

function qkAppRoot(appRoot) {
  const virtualId = 'virtual:qk-app-root'
  const resolvedId = `\0${virtualId}`

  return {
    name: 'qk-app-root',
    resolveId(source) {
      return source === virtualId ? resolvedId : null
    },
    load(id) {
      if (id !== resolvedId) return null
      return `export const appRoot = ${JSON.stringify(appRoot)}`
    }
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isBuild = command === 'build'
  const base = isBuild ? env.VITE_PUBLIC_PATH || '/' : '/'
  const appRoot = process.cwd().replace(/\\/g, '/')

  return {
    base,
    plugins: [
      vue(),
      qkAppRoot(appRoot),
      qiankunServeEntry(),
      qiankunBuildEntry(base)
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: DEV_PORT,
      strictPort: true,
      cors: true,
      origin: DEV_ORIGIN
    },
    build: {
      cssCodeSplit: false,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          format: 'es',
          codeSplitting: false,
          entryFileNames: BUILD_ENTRY,
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name][extname]'
        }
      }
    }
  }
})