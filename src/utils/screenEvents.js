let externalHandler = null
let globalStateSetter = null

export const SCREEN_EVENT = {
  selectBuilding: 'selectBuilding',
  selectFloor: 'selectFloor',
  selectDevice: 'selectDevice',
  clearFilter: 'clearFilter',
  selectTime: 'selectTime',
  filterAlarmType: 'filterAlarmType'
}

export function setScreenEventSink(handler) {
  externalHandler = typeof handler === 'function' ? handler : null
}

export function setGlobalStateSetter(setter) {
  globalStateSetter = typeof setter === 'function' ? setter : null
}

export function emitScreenEvent(type, payload = {}) {
  const detail = { type, payload, time: Date.now() }
  try {
    window.dispatchEvent(new CustomEvent(`screen:${type}`, { detail }))
  } catch (error) {
    console.warn('[screenEvents] 事件抛出失败', error)
  }
  if (externalHandler) {
    try {
      externalHandler(detail)
    } catch (error) {
      console.warn('[screenEvents] 外部事件回调失败', error)
    }
  }
  if (globalStateSetter) {
    try {
      globalStateSetter({ screenEvent: detail })
    } catch (error) {
      console.warn('[screenEvents] 全局状态同步失败', error)
    }
  }
  return detail
}