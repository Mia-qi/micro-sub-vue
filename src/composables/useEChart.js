import * as echartsNs from 'echarts'
import { nextTick, onMounted, onUnmounted, shallowRef } from 'vue'
import { registerTask } from '@/utils/screenRuntime'

const echarts = echartsNs && typeof echartsNs.init === 'function' ? echartsNs : echartsNs.default

export function useEChart(elRef, options = {}) {
  const chart = shallowRef(null)
  let observer = null
  let release = null
  let rafId = null
  let alive = true
  let attempts = 0
  let pending = null

  const sizeOf = (el) => ({
    width: Math.floor(el.clientWidth || 0),
    height: Math.floor(el.clientHeight || 0)
  })

  const applyPending = () => {
    if (!pending || !chart.value) return
    const task = pending
    pending = null
    try {
      chart.value.setOption(task.option, task.notMerge)
    } catch (error) {
      console.error('[EChart] 待渲染 option 应用失败', error)
    }
  }

  const ensureChart = () => {
    if (!alive) return null
    const el = elRef.value
    if (!el) return null
    if (!echarts || typeof echarts.init !== 'function') {
      console.error('[EChart] echarts 导出异常，init 不可用', echartsNs)
      return null
    }
    if (chart.value && chart.value.getDom() === el) return chart.value
    if (chart.value) {
      try {
        chart.value.dispose()
      } catch (error) {
        console.warn('[EChart] 旧实例释放失败', error)
      }
      chart.value = null
    }
    const size = sizeOf(el)
    if (!size.width || !size.height) return null
    try {
      chart.value = echarts.init(el, null, {
        renderer: 'canvas',
        devicePixelRatio: window.devicePixelRatio || 1,
        width: size.width,
        height: size.height
      })
    } catch (error) {
      console.error('[EChart] 初始化失败', error)
      chart.value = null
      return null
    }
    if (typeof options.onClick === 'function') {
      chart.value.on('click', options.onClick)
    }
    applyPending()
    return chart.value
  }

  const boot = () => {
    if (!alive) return
    if (ensureChart()) {
      resize()
      return
    }
    if (attempts >= 60) {
      console.warn('[EChart] 容器宽高始终为 0，图表无法初始化', elRef.value)
      return
    }
    attempts += 1
    rafId = requestAnimationFrame(boot)
  }

  function resize() {
    const el = elRef.value
    if (!el || !chart.value) return
    const size = sizeOf(el)
    if (!size.width || !size.height) return
    try {
      chart.value.resize({ width: size.width, height: size.height })
    } catch (error) {
      console.error('[EChart] resize 失败', error)
    }
  }

  function setOption(option, notMerge = false) {
    if (!option) return
    const instance = ensureChart()
    if (!instance) {
      pending = { option, notMerge }
      return
    }
    try {
      instance.setOption(option, notMerge)
    } catch (error) {
      console.error('[EChart] setOption 失败', error)
      try {
        instance.clear()
        instance.setOption(option, true)
      } catch (retryError) {
        console.error('[EChart] setOption 重试仍失败', retryError)
      }
    }
  }

  onMounted(async () => {
    await nextTick()
    boot()
    const el = elRef.value
    if (el && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (!alive) return
        const instance = ensureChart()
        if (instance) resize()
      })
      observer.observe(el)
    }
    release = registerTask(() => {
      alive = false
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      if (observer) {
        observer.disconnect()
        observer = null
      }
      if (chart.value) {
        chart.value.dispose()
        chart.value = null
      }
    })
  })

  onUnmounted(() => {
    if (release) {
      release()
      release = null
    }
  })

  return { chart, setOption, resize }
}