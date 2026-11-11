import { BUILDINGS, DEVICE_TYPE_LIST, FIRE_CATEGORIES } from '@/constants'
import { formatDateTime, formatShortTime, parseDateTime } from '@/utils/time'

const pad = (value) => String(value).padStart(2, '0')
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const round = (value, digits = 0) => Number(Number(value).toFixed(digits))

function hashString(input) {
  let hash = 2166136261
  const text = String(input)
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = (hash * 16777619) >>> 0
  }
  return hash
}

function createRandom(seed) {
  let state = hashString(seed) || 1
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function pick(random, list) {
  return list[Math.floor(random() * list.length) % list.length]
}

function buildingById(id) {
  return BUILDINGS.find((item) => item.id === id) || null
}

function scopeOf(params) {
  const typeItem = DEVICE_TYPE_LIST.find((item) => item.key === params.deviceType)
  const typeTotal = typeItem ? typeItem.base : DEVICE_TYPE_LIST.reduce((sum, item) => sum + item.base, 0)
  const buildingScale = params.buildingId ? 0.19 : 1
  return { typeTotal, buildingScale, scale: typeTotal * buildingScale }
}

function axisInfo(params) {
  const start = parseDateTime(params.startTime) || new Date()
  const end = parseDateTime(params.endTime) || new Date()
  const days = Math.round((end.getTime() - start.getTime()) / 86400000)
  if (days <= 1) {
    return { granularity: 'hour', labels: Array.from({ length: 24 }, (_, index) => `${pad(index)}:00`) }
  }
  if (days <= 130) {
    const labels = []
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    while (cursor <= end) {
      labels.push(`${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`)
      cursor.setDate(cursor.getDate() + 1)
    }
    return { granularity: 'day', labels }
  }
  const labels = []
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cursor <= end) {
    labels.push(`${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return { granularity: 'month', labels }
}

function energyBase(granularity) {
  if (granularity === 'hour') return { electric: 560, water: 72 }
  if (granularity === 'day') return { electric: 13200, water: 1680 }
  return { electric: 398000, water: 51000 }
}

function mockKpi(params) {
  const random = createRandom(`kpi|${params.startTime}|${params.endTime}|${params.buildingId}|${params.deviceType}`)
  const { scale } = scopeOf(params)
  const total = Math.round(scale)
  const offline = Math.round(total * (0.04 + random() * 0.03))
  const online = total - offline
  const warnHigh = 2 + Math.floor(random() * 4)
  const warnMedium = 4 + Math.floor(random() * 6)
  const warnLow = 6 + Math.floor(random() * 9)
  const granularity = axisInfo(params).granularity
  const base = energyBase(granularity)
  const energyFactor = params.buildingId ? 0.18 : 1
  const trend = (range) => round((random() * 2 - 1) * range, 1)

  return {
    deviceTotal: total,
    deviceOnline: online,
    deviceOffline: offline,
    warnTotal: warnHigh + warnMedium + warnLow,
    warnHigh,
    warnMedium,
    warnLow,
    workorderProcessing: 8 + Math.floor(random() * 7),
    workorderPending: 3 + Math.floor(random() * 6),
    electricityToday: round(base.electric * 0.86 * energyFactor, 1),
    waterToday: round(base.water * 0.9 * energyFactor, 1),
    peopleRealtime: 980 + Math.floor(random() * 720),
    inspectorsOnline: 8 + Math.floor(random() * 8),
    updateTime: formatDateTime(new Date()),
    compare: {
      deviceTotal: trend(3.4),
      deviceOnline: trend(2.8),
      deviceOffline: trend(6.5),
      warnTotal: trend(9),
      workorderProcessing: trend(7),
      workorderPending: trend(8),
      electricityToday: trend(6),
      waterToday: trend(5),
      peopleRealtime: trend(12)
    }
  }
}

function mockEnergyTrend(params) {
  const random = createRandom(`trend|${params.startTime}|${params.endTime}|${params.buildingId}|${params.deviceType}`)
  const { granularity, labels } = axisInfo(params)
  const base = energyBase(granularity)
  const buildingFactor = params.buildingId ? 0.18 : 1
  const typeFactor = params.deviceType && params.deviceType !== 'all' ? 0.26 : 1
  const hourFactor = [0.68, 0.64, 0.62, 0.66, 0.74, 0.86, 1.02, 1.18, 1.3, 1.36, 1.32, 1.26, 1.18, 1.24, 1.3, 1.28, 1.32, 1.42, 1.44, 1.3, 1.08, 0.94, 0.84, 0.74]

  const electric = []
  const water = []
  labels.forEach((label, index) => {
    let factor = 1
    if (granularity === 'hour') factor = hourFactor[index % 24]
    else if (granularity === 'day') factor = 0.94 + Math.sin((index % 7) / 7 * Math.PI * 2) * 0.1
    else factor = 0.96 + Math.sin(index / 2.4) * 0.09
    electric.push(round(base.electric * factor * buildingFactor * typeFactor * (0.9 + random() * 0.2), 1))
    water.push(round(base.water * factor * buildingFactor * (0.88 + random() * 0.24), 1))
  })

  const avgElectric = electric.reduce((sum, item) => sum + item, 0) / (electric.length || 1)
  const avgWater = water.reduce((sum, item) => sum + item, 0) / (water.length || 1)

  return {
    granularity,
    xAxis: labels,
    threshold: {
      electricity: round(avgElectric * 1.18, 1),
      water: round(avgWater * 1.22, 1)
    },
    series: [
      { key: 'electricity', name: '用电量', unit: 'kWh', data: electric },
      { key: 'water', name: '用水量', unit: 't', data: water }
    ]
  }
}

function mockBuildingRank(params) {
  const random = createRandom(`rank|${params.startTime}|${params.endTime}|${params.deviceType}`)
  const { granularity } = axisInfo(params)
  const base = energyBase(granularity).electric
  const list = BUILDINGS.map((building) => ({
    buildingId: building.id,
    buildingName: building.name,
    value: round(base * (0.68 + random() * 0.62), 1)
  }))
  const threshold = round(base * 1.02, 1)
  list.sort((a, b) => b.value - a.value)
  return { threshold, list }
}

function mockEnergyRatio(params) {
  const random = createRandom(`ratio|${params.startTime}|${params.endTime}|${params.buildingId}`)
  const { granularity } = axisInfo(params)
  const base = energyBase(granularity).electric
  const buildingFactor = params.buildingId ? 0.18 : 1
  const categories = [
    { name: '空调', share: 0.4 },
    { name: '照明', share: 0.26 },
    { name: '动力配电', share: 0.24 },
    { name: '其他', share: 0.1 }
  ]
  const list = categories.map((item) => ({
    name: item.name,
    value: round(base * buildingFactor * 6 * item.share * (0.88 + random() * 0.24), 1)
  }))
  const total = list.reduce((sum, item) => sum + item.value, 0)
  return { total: round(total, 1), unit: 'kWh', list }
}

function mockSecurityStats(params) {
  const random = createRandom(`security|${params.startTime}|${params.buildingId}`)
  const buildingFactor = params.buildingId ? 0.2 : 1
  const hourFactor = [0.16, 0.1, 0.08, 0.1, 0.18, 0.34, 0.62, 0.86, 1.02, 1.14, 1.2, 1.16, 1.04, 1.08, 1.14, 1.1, 1.18, 1.32, 1.26, 1.04, 0.82, 0.6, 0.4, 0.26]
  const xAxis = Array.from({ length: 24 }, (_, index) => `${pad(index)}:00`)
  const data = hourFactor.map((factor) => Math.round(260 * factor * buildingFactor * (0.86 + random() * 0.28)))

  return {
    peopleFlow: {
      xAxis,
      data,
      total: data.reduce((sum, item) => sum + item, 0)
    },
    access: {
      openTotal: Math.round((980 + random() * 460) * buildingFactor),
      abnormal: Math.round((8 + random() * 16) * buildingFactor)
    },
    camera: {
      online: Math.round(486 * buildingFactor),
      offline: Math.round((6 + random() * 12) * buildingFactor)
    }
  }
}

function mockFireStats(params) {
  const random = createRandom(`fire|${params.startTime}|${params.buildingId}`)
  const buildingFactor = params.buildingId ? 0.22 : 1
  const list = FIRE_CATEGORIES.map((item) => ({
    key: item.key,
    name: item.name,
    high: Math.round((1 + random() * 5) * buildingFactor),
    medium: Math.round((2 + random() * 8) * buildingFactor)
  }))
  return {
    list,
    total: list.reduce((sum, item) => sum + item.high + item.medium, 0)
  }
}

function mockDeviceStatus(params) {
  const random = createRandom(`status|${params.startTime}|${params.buildingId}`)
  const buildingFactor = params.buildingId ? 0.19 : 1
  const types = DEVICE_TYPE_LIST.map((item) => {
    const total = Math.round(item.base * buildingFactor)
    const fault = Math.round(total * (0.004 + random() * 0.008))
    const offline = Math.round(total * (0.02 + random() * 0.03))
    const warning = Math.round(total * (0.012 + random() * 0.02))
    return {
      key: item.key,
      name: item.name,
      total,
      normal: Math.max(total - fault - offline - warning, 0),
      warning,
      fault,
      offline
    }
  })
  const summary = types.reduce(
    (acc, item) => {
      acc.normal += item.normal
      acc.warning += item.warning
      acc.fault += item.fault
      acc.offline += item.offline
      return acc
    },
    { normal: 0, warning: 0, fault: 0, offline: 0 }
  )
  return {
    total: summary.normal + summary.warning + summary.fault + summary.offline,
    summary,
    types
  }
}

const DEVICE_BASE_NAME = {
  power: '配电柜',
  fire: '消防主机',
  aircon: '空调机组',
  access: '门禁控制器',
  camera: '网络摄像机',
  water: '给排水泵'
}

const ALARM_TEMPLATES = [
  { typeKey: 'fire', typeName: '烟感报警', level: 'high', fireCategory: 'smoke', content: '烟感探测器触发火警，请立即核查' },
  { typeKey: 'fire', typeName: '温感报警', level: 'high', fireCategory: 'temp', content: '温感探测器温度超限' },
  { typeKey: 'fire', typeName: '水压异常', level: 'medium', fireCategory: 'pressure', content: '消防水管压力低于下限值' },
  { typeKey: 'fire', typeName: '消防主机故障', level: 'medium', fireCategory: 'other', content: '消防主机通讯链路异常' },
  { typeKey: 'power', typeName: '配电严重过载', level: 'high', content: '配电柜负载超过额定值 92%' },
  { typeKey: 'power', typeName: '负载超标', level: 'medium', content: '回路负载持续高于预警阈值' },
  { typeKey: 'power', typeName: '能耗临近阈值', level: 'low', content: '支路能耗接近预警阈值' },
  { typeKey: 'water', typeName: '漏水告警', level: 'high', content: '给排水管路检测到漏水' },
  { typeKey: 'water', typeName: '水压波动', level: 'low', content: '供水压力出现轻微波动' },
  { typeKey: 'access', typeName: '非法闯入', level: 'high', content: '非授权人员强行进入受控区域' },
  { typeKey: 'access', typeName: '异常开门', level: 'medium', content: '门禁非工作时间频繁开启' },
  { typeKey: 'camera', typeName: '通讯中断', level: 'medium', content: '摄像机离线，视频流中断' },
  { typeKey: 'camera', typeName: '画面异常', level: 'low', content: '视频画面质量轻微下降' },
  { typeKey: 'aircon', typeName: '温度异常', level: 'low', content: '空调回风温度偏离设定值' },
  { typeKey: 'aircon', typeName: '能耗临近阈值', level: 'low', content: '空调机组能耗接近阈值' }
]

const LEVEL_NAME = { high: '高', medium: '中', low: '低' }
const LEVEL_ORDER = { high: 0, medium: 1, low: 2 }
const ALARM_STATUS_NAME = { unhandled: '未处理', confirmed: '已确认', dispatched: '已派单' }
const WORKORDER_STATUS_NAME = { pending: '待派单', processing: '处理中', done: '已完成', closed: '已关闭', timeout: '超时' }
const ASSIGNEES = ['张伟', '李静', '王强', '赵敏', '陈磊', '周芳']
const WORKORDER_TYPES = ['设备巡检', '隐患整改', '故障维修', '消防巡检', '设备保养']

function alarmTime(random, params) {
  const start = parseDateTime(params.startTime) || new Date(Date.now() - 86400000)
  const end = parseDateTime(params.endTime) || new Date()
  const now = new Date()
  const limit = end > now ? now : end
  const span = Math.max(limit.getTime() - start.getTime(), 60000)
  return new Date(start.getTime() + Math.floor(random() * span))
}

function buildAlarmList(params) {
  const random = createRandom(`alarm|${params.startTime}|${params.endTime}`)
  const list = []
  for (let index = 0; index < 28; index += 1) {
    const template = pick(random, ALARM_TEMPLATES)
    const building = pick(random, BUILDINGS)
    const floor = `${1 + Math.floor(random() * 6)}F`
    const seq = 1 + Math.floor(random() * 40)
    const time = alarmTime(random, params)
    const roll = random()
    let status = 'unhandled'
    if (template.level === 'high') {
      status = roll < 0.58 ? 'unhandled' : roll < 0.85 ? 'confirmed' : 'dispatched'
    } else {
      status = roll < 0.44 ? 'unhandled' : roll < 0.76 ? 'confirmed' : 'dispatched'
    }
    const datePart = formatDateTime(time).slice(0, 10).replace(/-/g, '')
    list.push({
      id: `W${datePart}${String(index + 1).padStart(3, '0')}`,
      buildingId: building.id,
      buildingName: building.name,
      floor,
      location: `${building.name}-${floor}`,
      deviceId: `DEV-${template.typeKey}-${building.id}-${seq}`,
      deviceName: `${building.name}-${floor} ${DEVICE_BASE_NAME[template.typeKey]} #${seq}`,
      typeKey: template.typeKey,
      typeName: template.typeName,
      fireCategory: template.fireCategory || '',
      level: template.level,
      levelName: LEVEL_NAME[template.level],
      content: template.content,
      time: formatDateTime(time),
      timeShort: formatShortTime(time),
      status,
      statusName: ALARM_STATUS_NAME[status],
      _timestamp: time.getTime()
    })
  }

  let filtered = list
  if (params.buildingId) filtered = filtered.filter((item) => item.buildingId === params.buildingId)
  if (params.deviceType && params.deviceType !== 'all') filtered = filtered.filter((item) => item.typeKey === params.deviceType)
  if (params.warnLevel && params.warnLevel !== 'all') filtered = filtered.filter((item) => item.level === params.warnLevel)
  if (params.warnType) filtered = filtered.filter((item) => item.fireCategory === params.warnType)

  filtered.sort((a, b) => {
    const levelDiff = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
    if (levelDiff !== 0) return levelDiff
    return b._timestamp - a._timestamp
  })

  return {
    total: filtered.length,
    list: filtered.map(({ _timestamp, ...item }) => item)
  }
}

function buildWorkOrderList(params) {
  const random = createRandom(`workorder|${params.startTime}|${params.endTime}`)
  const list = []
  for (let index = 0; index < 20; index += 1) {
    const building = pick(random, BUILDINGS)
    const floor = `${1 + Math.floor(random() * 6)}F`
    const typeName = pick(random, WORKORDER_TYPES)
    const level = random() < 0.32 ? 'high' : random() < 0.6 ? 'medium' : 'low'
    const roll = random()
    let status = 'processing'
    if (roll < 0.2) status = 'pending'
    else if (roll < 0.52) status = 'processing'
    else if (roll < 0.72) status = 'done'
    else if (roll < 0.86) status = 'closed'
    else status = 'timeout'
    const reportTime = alarmTime(random, params)
    const expectTime = new Date(reportTime.getTime() + (2 + Math.floor(random() * 22)) * 3600000)
    const datePart = formatDateTime(reportTime).slice(0, 10).replace(/-/g, '')
    list.push({
      id: `WO${datePart}${String(index + 1).padStart(3, '0')}`,
      buildingId: building.id,
      buildingName: building.name,
      floor,
      location: `${building.name}-${floor}`,
      deviceId: `DEV-power-${building.id}-${1 + Math.floor(random() * 40)}`,
      typeName,
      level,
      levelName: LEVEL_NAME[level],
      status,
      statusName: WORKORDER_STATUS_NAME[status],
      assignee: pick(random, ASSIGNEES),
      reportTime: formatDateTime(reportTime),
      expectTime: formatDateTime(expectTime),
      _timestamp: reportTime.getTime()
    })
  }

  let filtered = list
  if (params.buildingId) filtered = filtered.filter((item) => item.buildingId === params.buildingId)
  filtered.sort((a, b) => b._timestamp - a._timestamp)

  return {
    total: filtered.length,
    list: filtered.map(({ _timestamp, ...item }) => item)
  }
}

function resolveDeviceMeta(deviceId, params) {
  const match = /^DEV-([a-z]+)-([A-Za-z0-9]+)-(\d+)$/.exec(String(deviceId || ''))
  const typeKey = (match && match[1]) || 'power'
  const buildingId = (match && match[2]) || params.buildingId || BUILDINGS[0].id
  const serial = Number((match && match[3]) || 1)
  const building = buildingById(buildingId) || BUILDINGS[0]
  const typeItem = DEVICE_TYPE_LIST.find((item) => item.key === typeKey) || DEVICE_TYPE_LIST[0]
  return {
    deviceId: String(deviceId || `DEV-${typeKey}-${building.id}-${serial}`),
    deviceName: `${building.name}${DEVICE_BASE_NAME[typeKey] || '设备'}#${pad(serial)}`,
    buildingId: building.id,
    buildingName: building.name,
    floor: `${1 + (serial % 6)}F`,
    typeKey,
    typeName: typeItem.name
  }
}

function mockDeviceDetail(params) {
  const meta = resolveDeviceMeta(params.deviceId, params)
  const random = createRandom(`device|${meta.deviceId}|${params.startTime}|${params.endTime}`)
  const roll = random()
  const status = roll < 0.06 ? 'offline' : roll < 0.16 ? 'fault' : roll < 0.3 ? 'warning' : 'normal'
  const statusName = { normal: '正常', warning: '预警', fault: '告警故障', offline: '离线' }[status]
  const installTime = new Date(
    2019 + Math.floor(random() * 5),
    Math.floor(random() * 12),
    1 + Math.floor(random() * 28)
  )
  const metrics = [
    { label: '实时功率', value: round(18 + random() * 62, 1), unit: 'kW' },
    { label: '负载率', value: round(35 + random() * 55, 1), unit: '%' },
    { label: '温度', value: round(24 + random() * 16, 1), unit: '℃' },
    { label: '运行时长', value: Math.round(1200 + random() * 8600), unit: 'h' },
    { label: '今日能耗', value: round(6 + random() * 20, 1), unit: 'kWh' },
    { label: '信号强度', value: Math.round(62 + random() * 36), unit: '%' }
  ]
  const alarmCount = Math.floor(random() * 4)
  const alarms = Array.from({ length: alarmCount }, (_, index) => {
    const template = pick(random, ALARM_TEMPLATES)
    const time = alarmTime(random, params)
    const datePart = formatDateTime(time).slice(0, 10).replace(/-/g, '')
    const alarmStatus = template.level === 'high' ? 'unhandled' : 'confirmed'
    return {
      id: `W${datePart}D${index + 1}`,
      time: formatDateTime(time),
      typeName: template.typeName,
      level: template.level,
      levelName: LEVEL_NAME[template.level],
      status: alarmStatus,
      statusName: ALARM_STATUS_NAME[alarmStatus]
    }
  })
  const workorderCount = Math.floor(random() * 3)
  const workorders = Array.from({ length: workorderCount }, (_, index) => {
    const woStatus = pick(random, ['pending', 'processing', 'done', 'closed', 'timeout'])
    const report = alarmTime(random, params)
    const datePart = formatDateTime(report).slice(0, 10).replace(/-/g, '')
    return {
      id: `WO${datePart}D${String(index + 1).padStart(2, '0')}`,
      typeName: pick(random, WORKORDER_TYPES),
      status: woStatus,
      statusName: WORKORDER_STATUS_NAME[woStatus],
      assignee: pick(random, ASSIGNEES),
      reportTime: formatDateTime(report),
      expectTime: formatDateTime(new Date(report.getTime() + (2 + Math.floor(random() * 20)) * 3600000))
    }
  })

  return {
    device: {
      ...meta,
      model: `M-${meta.typeKey.toUpperCase()}-${1000 + Math.floor(random() * 900)}`,
      installTime: formatDateTime(installTime),
      status,
      statusName
    },
    metrics,
    alarms: alarms.sort((a, b) => (a.time < b.time ? 1 : -1)),
    workorders: workorders.sort((a, b) => (a.reportTime < b.reportTime ? 1 : -1))
  }
}

const MOCK_HANDLERS = {
  kpi: mockKpi,
  energyTrend: mockEnergyTrend,
  buildingRank: mockBuildingRank,
  energyRatio: mockEnergyRatio,
  securityStats: mockSecurityStats,
  fireStats: mockFireStats,
  deviceStatus: mockDeviceStatus,
  warnList: buildAlarmList,
  workOrderList: buildWorkOrderList,
  deviceDetail: mockDeviceDetail,
  confirmAlarm: (params) => ({ alarmId: params.alarmId, success: true }),
  createWorkOrder: () => ({
    workorderId: `WO${formatDateTime(new Date()).slice(0, 10).replace(/-/g, '')}${String(
      100 + Math.floor(Math.random() * 900)
    )}`,
    success: true
  })
}

export async function fetchMock(name, params = {}) {
  const handler = MOCK_HANDLERS[name]
  if (!handler) {
    throw new Error(`未实现的模拟接口：${name}`)
  }
  await delay(80 + Math.floor(Math.random() * 120))
  return handler(params)
}