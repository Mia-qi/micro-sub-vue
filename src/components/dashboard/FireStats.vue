<template>
  <ScreenPanel title="消防告警统计" :subtitle="subtitle">
    <template #extra>
      <span class="chart-tip">点击分类可过滤告警</span>
    </template>
    <BaseChart
      :option="option"
      :loading="store.state.loading.fire"
      :error="store.state.error.fire"
      :empty="isEmpty"
      empty-text="暂无消防告警数据"
      @chart-click="onChartClick"
    />
  </ScreenPanel>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '@/components/common/BaseChart.vue'
import ScreenPanel from '@/components/common/ScreenPanel.vue'
import { screenStore } from '@/store/screenStore'
import { LEGEND_STYLE, TOOLTIP_STYLE, categoryAxis, valueAxis } from '@/utils/chartTheme'

const store = screenStore

const data = computed(() => store.state.fire)
const isEmpty = computed(() => !data.value || !data.value.list?.length)
const subtitle = computed(() => (data.value ? `告警总数 ${data.value.total} 条` : ''))

const option = computed(() => {
  const source = data.value
  if (!source || !source.list?.length) return null
  const selectedKey = store.state.filters.warnType
  const opacityOf = (key) => (selectedKey && selectedKey !== key ? 0.35 : 1)
  const totals = source.list.map((item) => item.high + item.medium)

  return {
    grid: { left: 4, right: 8, top: 34, bottom: 2, containLabel: true },
    legend: { ...LEGEND_STYLE, top: 0, right: 4, data: ['高风险', '中风险'] },
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,212,255,.08)' } },
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params]
        const row = source.list[list[0]?.dataIndex ?? 0]
        if (!row) return ''
        return `<div style="margin-bottom:4px;color:#9fc3ef">${row.name}</div>${list
          .map((item) => `${item.marker}${item.seriesName}：<span style="font-weight:600">${item.value} 条</span>`)
          .join('<br/>')}<br/>合计：<span style="color:#00d4ff;font-weight:600">${row.high + row.medium} 条</span>`
      }
    },
    xAxis: categoryAxis(source.list.map((item) => item.name)),
    yAxis: valueAxis({ splitNumber: 3, axisLabel: { color: '#7d9bc4', fontSize: 11 } }),
    series: [
      {
        name: '高风险',
        type: 'bar',
        stack: 'fire',
        barWidth: 18,
        data: source.list.map((item) => ({
          value: item.high,
          itemStyle: { color: '#ff4d4f', opacity: opacityOf(item.key) }
        }))
      },
      {
        name: '中风险',
        type: 'bar',
        stack: 'fire',
        barWidth: 18,
        data: source.list.map((item) => ({
          value: item.medium,
          itemStyle: { color: '#ffc53d', opacity: opacityOf(item.key) }
        })),
        label: {
          show: true,
          position: 'top',
          color: '#a9c4e6',
          fontSize: 11,
          formatter: ({ dataIndex }) => totals[dataIndex]
        }
      }
    ]
  }
})

const onChartClick = (params) => {
  if (params?.componentType !== 'series') return
  const row = data.value?.list?.[params.dataIndex]
  if (row) store.filterFireCategory(row.key, row.name)
}
</script>

<style scoped>
.chart-tip {
  font-size: 11px;
  color: var(--screen-text-muted);
}
</style>
