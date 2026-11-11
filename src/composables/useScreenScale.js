import { onMounted, onUnmounted, ref } from 'vue'

export function useScreenScale(designWidth = 1920, designHeight = 1080) {
  const scale = ref(1)
  let frame = null

  const calc = () => {
    const viewportWidth = window.innerWidth || designWidth
    const viewportHeight = window.innerHeight || designHeight
    scale.value = Math.min(viewportWidth / designWidth, viewportHeight / designHeight)
  }

  const schedule = () => {
    if (frame) cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      frame = null
      calc()
    })
  }

  onMounted(() => {
    calc()
    window.addEventListener('resize', schedule)
  })

  onUnmounted(() => {
    if (frame) cancelAnimationFrame(frame)
    window.removeEventListener('resize', schedule)
  })

  return { scale, recalc: calc }
}