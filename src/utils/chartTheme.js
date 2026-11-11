export const CHART_TEXT_COLOR = '#7d9bc4'
export const CHART_TEXT_LIGHT = '#a9c4e6'
export const AXIS_LINE_COLOR = 'rgba(90,150,230,.28)'
export const SPLIT_LINE_COLOR = 'rgba(70,120,200,.16)'

export const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(6,20,42,.94)',
  borderColor: 'rgba(64,150,255,.45)',
  borderWidth: 1,
  padding: [8, 12],
  textStyle: { color: '#dbe9ff', fontSize: 13 },
  extraCssText: 'border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.45);'
}

export function categoryAxis(data, options = {}) {
  return {
    type: 'category',
    data,
    boundaryGap: options.boundaryGap ?? true,
    axisLine: { lineStyle: { color: AXIS_LINE_COLOR } },
    axisTick: { show: false },
    axisLabel: {
      color: CHART_TEXT_COLOR,
      fontSize: 12,
      hideOverlap: true,
      interval: options.interval ?? 'auto'
    },
    ...options.extra
  }
}

export function valueAxis(options = {}) {
  return {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: CHART_TEXT_COLOR, fontSize: 12 },
    splitLine: { lineStyle: { color: SPLIT_LINE_COLOR, type: 'dashed' } },
    ...options
  }
}

export const LEGEND_STYLE = {
  itemWidth: 12,
  itemHeight: 8,
  itemGap: 14,
  textStyle: { color: CHART_TEXT_LIGHT, fontSize: 12 }
}