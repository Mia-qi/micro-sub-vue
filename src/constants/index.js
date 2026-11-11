export const BUILDINGS = [
  { id: 'B001', name: '1号楼' },
  { id: 'B002', name: '2号楼' },
  { id: 'B003', name: '3号楼' },
  { id: 'B004', name: '4号楼' },
  { id: 'B005', name: '5号楼' },
  { id: 'B006', name: '6号楼' }
]

export const TIME_RANGE_OPTIONS = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '本年' },
  { value: 'custom', label: '自定义' }
]

export const BUILDING_OPTIONS = [
  { value: '', label: '全部楼栋' },
  ...BUILDINGS.map((item) => ({ value: item.id, label: item.name }))
]

export const DEVICE_TYPE_OPTIONS = [
  { value: 'all', label: '全部设备' },
  { value: 'power', label: '配电' },
  { value: 'fire', label: '消防' },
  { value: 'aircon', label: '空调' },
  { value: 'access', label: '门禁' },
  { value: 'camera', label: '摄像头' },
  { value: 'water', label: '给排水' }
]

export const DEVICE_TYPE_LIST = [
  { key: 'power', name: '配电', base: 980 },
  { key: 'fire', name: '消防', base: 760 },
  { key: 'aircon', name: '空调', base: 620 },
  { key: 'access', name: '门禁', base: 540 },
  { key: 'camera', name: '摄像头', base: 680 },
  { key: 'water', name: '给排水', base: 420 }
]

export const WARN_LEVEL_OPTIONS = [
  { value: 'all', label: '全部等级' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
]

export const WARN_LEVEL_MAP = {
  high: { label: '高', color: '#ff4d4f' },
  medium: { label: '中', color: '#ffc53d' },
  low: { label: '低', color: '#8aa2c8' }
}

export const ALARM_STATUS_MAP = {
  unhandled: { label: '未处理', color: '#ff4d4f' },
  confirmed: { label: '已确认', color: '#ffc53d' },
  dispatched: { label: '已派单', color: '#00c48c' }
}

export const WORKORDER_STATUS_MAP = {
  pending: { label: '待派单', color: '#ffc53d' },
  processing: { label: '处理中', color: '#00d4ff' },
  done: { label: '已完成', color: '#00c48c' },
  closed: { label: '已关闭', color: '#86909c' },
  timeout: { label: '超时', color: '#ff4d4f' }
}

export const DEVICE_STATUS_MAP = {
  normal: { label: '正常', color: '#00c48c' },
  warning: { label: '预警', color: '#ffc53d' },
  fault: { label: '告警故障', color: '#ff4d4f' },
  offline: { label: '离线', color: '#86909c' }
}

export const FIRE_CATEGORIES = [
  { key: 'smoke', name: '烟感告警' },
  { key: 'temp', name: '温感告警' },
  { key: 'pressure', name: '水压异常' },
  { key: 'other', name: '其他消防告警' }
]

export const ENERGY_CATEGORY_COLORS = {
  空调: '#00d4ff',
  照明: '#00c48c',
  动力配电: '#ffc53d',
  其他: '#86909c'
}

export const DEVICE_TYPE_COLORS = ['#00d4ff', '#3d7dff', '#7a5cff', '#00c48c', '#ffc53d', '#ff8f4d']

export const REFRESH_INTERVAL_OPTIONS = [
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
  { value: 120, label: '120s' }
]