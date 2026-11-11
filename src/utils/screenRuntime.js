const tasks = new Set()

export function registerTask(fn) {
  if (typeof fn !== 'function') return () => {}
  tasks.add(fn)
  let released = false
  return () => {
    if (released) return
    released = true
    tasks.delete(fn)
    try {
      fn()
    } catch (error) {
      console.warn('[screenRuntime] 资源释放失败', error)
    }
  }
}

export function destroyScreenRuntime() {
  const list = Array.from(tasks)
  tasks.clear()
  list.forEach((fn) => {
    try {
      fn()
    } catch (error) {
      console.warn('[screenRuntime] 资源释放失败', error)
    }
  })
}