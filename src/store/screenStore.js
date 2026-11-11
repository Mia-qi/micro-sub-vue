import { reactive } from 'vue'
import * as api from '@/api/screen'
import { emitScreenEvent, SCREEN_EVENT } from '@/utils/screenEvents'
import { registerTask } from '@/utils/screenRuntime'
import { formatClock, resolvePointRange, resolveRange, toDatetimeLocal } from '@/utils/time'

function createFilters() {
  const range = resolveRange('today')
  return {
    timeRange: 'today',
    startTime: range.startTime,
    endTime: range.endTime,
    granularity: range.granularity,
    customStart: toDatetimeLocal(range.startTime),
    customEnd: toDatetimeLocal(range.endTime),
    buildingId: '',
    deviceType: 'all',
    warnLevel: 'all',
    warnType: ''
  }
}

const state = reactive({
  filters: createFilters(),
  autoRefresh: true,
  refreshInterval: 30,
  lastRefresh: '',
  loading: {
    kpi: false,
    energyTrend: false,
    buildingRank: false,
    energyRatio: false,
    security: false,
    fire: false,
    deviceStatus: false,
    alarms: false,
    workOrders: false
  },
  error: {
    kpi: '',
    energyTrend: '',
    buildingRank: '',
    energyRatio: '',
    security: '',
    fire: '',
    deviceStatus: '',
    alarms: '',
    workOrders: ''
  },
  kpi: null,
  energyTrend: null,
  buildingRank: null,
  energyRatio: null,
  security: null,
  fire: null,
  deviceStatus: null,
  alarms: [],
  alarmTotal: 0,
  workOrders: [],
  workOrderTotal: 0,
  dialog: {
    visible: false,
    loading: false,
    error: '',
    deviceId: '',
    data: null,
    source: ''
  }
})

let timer = null
let fetching = false
let visibilityBound = false

async function run(key, loader) {
  state.loading[key] = true
  try {
    await loader()
    state.error[key] = ''
  } catch (error) {
    state.error[key] = error?.message || '数据加载失败'
  } finally {
    state.loading[key] = false
  }
}

async function fetchAll() {
  const params = api.buildParams(state.filters)
  const alarmParams = { ...params }
  if (state.filters.warnType) alarmParams.warnType = state.filters.warnType

  await Promise.all([
    run('kpi', async () => {
      state.kpi = await api.getKpi(params)
    }),
    run('energyTrend', async () => {
      state.energyTrend = await api.getEnergyTrend(params)
    }),
    run('buildingRank', async () => {
      state.buildingRank = await api.getBuildingRank(params)
    }),
    run('energyRatio', async () => {
      state.energyRatio = await api.getEnergyRatio(params)
    }),
    run('security', async () => {
      state.security = await api.getSecurityStats(params)
    }),
    run('fire', async () => {
      state.fire = await api.getFireStats(params)
    }),
    run('deviceStatus', async () => {
      state.deviceStatus = await api.getDeviceStatus(params)
    }),
    run('alarms', async () => {
      const result = await api.getWarnList(alarmParams)
      state.alarms = result.list || []
      state.alarmTotal = result.total || 0
    }),
    run('workOrders', async () => {
      const result = await api.getWorkOrderList(params)
      state.workOrders = result.list || []
      state.workOrderTotal = result.total || 0
    })
  ])

  state.lastRefresh = formatClock(new Date())
}

async function safeFetchAll() {
  if (fetching) return
  fetching = true
  try {
    await fetchAll()
  } finally {
    fetching = false
  }
}

function stopAutoRefresh() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startAutoRefresh() {
  stopAutoRefresh()
  if (!state.autoRefresh) return
  timer = setInterval(() => {
    if (document.visibilityState === 'visible') safeFetchAll()
  }, state.refreshInterval * 1000)
}

function bindVisibility() {
  if (visibilityBound) return
  visibilityBound = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.autoRefresh) safeFetchAll()
  })
}

function applyRange(type, custom) {
  const range = resolveRange(type, custom)
  state.filters.timeRange = type
  state.filters.startTime = range.startTime
  state.filters.endTime = range.endTime
  state.filters.granularity = range.granularity
  state.filters.customStart = toDatetimeLocal(range.startTime)
  state.filters.customEnd = toDatetimeLocal(range.endTime)
}

function setTimeRange(type) {
  applyRange(type, { start: state.filters.customStart, end: state.filters.customEnd })
  safeFetchAll()
}

function applyCustomRange(start, end) {
  state.filters.customStart = start
  state.filters.customEnd = end
  applyRange('custom', { start, end })
  safeFetchAll()
}

function setFilter(key, value) {
  if (key === 'warnType') {
    state.filters.warnType = value
    safeFetchAll()
    return
  }
  state.filters[key] = value
  safeFetchAll()
}

function resetFilters() {
  Object.assign(state.filters, createFilters())
  emitScreenEvent(SCREEN_EVENT.clearFilter, {})
  safeFetchAll()
}

function refresh() {
  safeFetchAll()
}

function setAutoRefresh(value) {
  state.autoRefresh = value
  startAutoRefresh()
}

function setRefreshInterval(value) {
  state.refreshInterval = Number(value)
  startAutoRefresh()
}

function selectBuilding(buildingId, buildingName = '') {
  state.filters.buildingId = buildingId
  emitScreenEvent(SCREEN_EVENT.selectBuilding, { buildingId, buildingName })
  safeFetchAll()
}

function selectTimePoint(label) {
  const granularity = state.energyTrend?.granularity || state.filters.granularity
  const point = resolvePointRange(label, granularity, state.filters.startTime)
  state.filters.timeRange = 'custom'
  state.filters.startTime = point.startTime
  state.filters.endTime = point.endTime
  state.filters.customStart = toDatetimeLocal(point.startTime)
  state.filters.customEnd = toDatetimeLocal(point.endTime)
  emitScreenEvent(SCREEN_EVENT.selectTime, { label, granularity, ...point })
  safeFetchAll()
}

function filterFireCategory(categoryKey, categoryName = '') {
  state.filters.warnType = categoryKey
  emitScreenEvent(SCREEN_EVENT.filterAlarmType, { categoryKey, categoryName })
  safeFetchAll()
}

function focusLocation(payload = {}) {
  const { buildingId, buildingName, floor, deviceId } = payload
  if (buildingId) {
    if (state.filters.buildingId !== buildingId) {
      state.filters.buildingId = buildingId
    }
    emitScreenEvent(SCREEN_EVENT.selectBuilding, { buildingId, buildingName })
  }
  if (floor) {
    emitScreenEvent(SCREEN_EVENT.selectFloor, { buildingId, buildingName, floor })
  }
  if (deviceId) {
    emitScreenEvent(SCREEN_EVENT.selectDevice, { deviceId, buildingId, buildingName, floor })
    openDeviceDetail(deviceId)
  }
  safeFetchAll()
}

async function openDeviceDetail(deviceId) {
  state.dialog.visible = true
  state.dialog.deviceId = deviceId
  state.dialog.error = ''
  state.dialog.loading = true
  state.dialog.data = null
  try {
    const params = { deviceId, ...api.buildParams(state.filters) }
    state.dialog.data = await api.getDeviceDetail(params)
  } catch (error) {
    state.dialog.error = error?.message || '数据加载失败'
  } finally {
    state.dialog.loading = false
  }
}

function closeDeviceDetail() {
  state.dialog.visible = false
  state.dialog.loading = false
  state.dialog.data = null
  state.dialog.deviceId = ''
}

async function confirmAlarm(alarmId) {
  if (!alarmId) return
  await api.confirmAlarm({ alarmId })
  const alarm = state.alarms.find((item) => item.id === alarmId)
  if (alarm) {
    alarm.status = 'confirmed'
    alarm.statusName = '已确认'
  }
  if (state.dialog.data?.alarms) {
    state.dialog.data.alarms.forEach((item) => {
      if (item.id === alarmId) item.statusName = '已确认'
    })
  }
}

async function generateWorkOrder(payload) {
  const result = await api.createWorkOrder(payload)
  const device = state.dialog.data?.device
  if (device) {
    state.workOrders.unshift({
      id: result.workorderId || `WO${Date.now()}`,
      buildingId: device.buildingId,
      buildingName: device.buildingName,
      floor: device.floor,
      location: `${device.buildingName}-${device.floor}`,
      deviceId: device.deviceId,
      typeName: '故障维修',
      level: 'high',
      levelName: '高',
      status: 'pending',
      statusName: '待派单',
      assignee: '待指派',
      reportTime: formatClock(new Date()),
      expectTime: '待确认'
    })
    state.workOrderTotal += 1
    if (state.dialog.data?.workorders) {
      state.dialog.data.workorders.unshift({
        id: result.workorderId || `WO${Date.now()}`,
        typeName: '故障维修',
        status: 'pending',
        statusName: '待派单',
        assignee: '待指派',
        reportTime: formatClock(new Date()),
        expectTime: '待确认'
      })
    }
  }
  const alarm = state.alarms.find((item) => item.deviceId === device?.deviceId && item.status === 'unhandled')
  if (alarm) {
    alarm.status = 'dispatched'
    alarm.statusName = '已派单'
  }
  return result
}

bindVisibility()
registerTask(() => {
  stopAutoRefresh()
})

export const screenStore = {
  state,
  fetchAll: safeFetchAll,
  startAutoRefresh,
  stopAutoRefresh,
  setTimeRange,
  applyCustomRange,
  setFilter,
  resetFilters,
  refresh,
  setAutoRefresh,
  setRefreshInterval,
  selectBuilding,
  selectTimePoint,
  filterFireCategory,
  focusLocation,
  openDeviceDetail,
  closeDeviceDetail,
  confirmAlarm,
  generateWorkOrder
}