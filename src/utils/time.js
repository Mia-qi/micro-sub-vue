const pad = (value) => String(value).padStart(2, '0')

export function formatDateTime(input) {
  const date = input instanceof Date ? input : new Date(input)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatDate(input) {
  const date = input instanceof Date ? input : new Date(input)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatClock(input = new Date()) {
  const date = input instanceof Date ? input : new Date(input)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatShortTime(input) {
  const date = input instanceof Date ? input : new Date(input)
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function parseDateTime(input) {
  if (!input) return null
  const normalized = typeof input === 'string' ? input.replace(/-/g, '/') : input
  const date = normalized instanceof Date ? normalized : new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function spanGranularity(start, end) {
  const days = (end.getTime() - start.getTime()) / 86400000
  if (days <= 1) return 'hour'
  if (days <= 130) return 'day'
  return 'month'
}

export function resolveRange(type = 'today', custom = {}) {
  const now = new Date()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  let start = dayStart
  let end = dayEnd

  if (type === 'week') {
    const weekday = now.getDay() || 7
    start = new Date(dayStart)
    start.setDate(start.getDate() - (weekday - 1))
    end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59)
  } else if (type === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  } else if (type === 'quarter') {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
    start = new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0)
    end = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59)
  } else if (type === 'year') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
  } else if (type === 'custom') {
    const customStart = parseDateTime(custom.start)
    const customEnd = parseDateTime(custom.end)
    if (customStart && customEnd && customStart <= customEnd) {
      start = customStart
      end = customEnd
    }
  }

  return {
    startTime: formatDateTime(start),
    endTime: formatDateTime(end),
    granularity: spanGranularity(start, end)
  }
}

export function rangeLabel(filters) {
  if (!filters) return ''
  if (filters.timeRange === 'custom') {
    return `${filters.startTime.slice(5, 16)} ~ ${filters.endTime.slice(5, 16)}`
  }
  const matched = {
    today: '今日',
    week: '本周',
    month: '本月',
    quarter: '本季度',
    year: '本年'
  }
  return matched[filters.timeRange] || ''
}

export function toDatetimeLocal(value) {
  const date = parseDateTime(value)
  if (!date) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function resolvePointRange(label, granularity, baseStart) {
  const base = parseDateTime(baseStart) || new Date()
  if (granularity === 'hour') {
    const hour = Number(String(label).slice(0, 2))
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, 0, 0)
    const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, 59, 59)
    return { startTime: formatDateTime(start), endTime: formatDateTime(end) }
  }
  if (granularity === 'day') {
    const parts = String(label).split('-')
    const year = parts.length === 3 ? Number(parts[0]) : base.getFullYear()
    const month = parts.length === 3 ? Number(parts[1]) : Number(parts[0])
    const day = parts.length === 3 ? Number(parts[2]) : Number(parts[1])
    const start = new Date(year, month - 1, day, 0, 0, 0)
    const end = new Date(year, month - 1, day, 23, 59, 59)
    return { startTime: formatDateTime(start), endTime: formatDateTime(end) }
  }
  const parts = String(label).split('-')
  const year = Number(parts[0])
  const month = Number(parts[1])
  const start = new Date(year, month - 1, 1, 0, 0, 0)
  const end = new Date(year, month, 0, 23, 59, 59)
  return { startTime: formatDateTime(start), endTime: formatDateTime(end) }
}

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--'
  const num = Number(value)
  const fixed = digits > 0 ? num.toFixed(digits) : String(Math.round(num))
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}