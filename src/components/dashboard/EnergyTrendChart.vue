<template>
  <ScreenPanel title="能耗趋势分析" :subtitle="granularityText">
    <template #extra>
      <span class="chart-tip">点击时间节点可联动筛选</span>
    </template>
    <BaseChart
      :option="option"
      :loading="store.state.loading.energyTrend"
      :error="store.state.error.energyTrend"
      :empty="isEmpty"
      empty-text="暂无能耗趋势数据"
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

const data = computed(() => store.state.energyTrend)
const isEmpty = computed(() => !data.value || !data.value.xAxis?.length)

const granularityText = computed(() => {
  const granularity = data.value?.granularity
  if (granularity === 'hour') return '按小时统计'
  if (granularity === 'month') return '按月统计'
  return '按天统计'
})

const pointData = (values, threshold) =>
  values.map((value) => ({
    value,
    itemStyle: value > threshold ? { color: '#ff4d4f' } : undefined
  }))

const option = computed(() => {
  const source = data.value
  if (!source || !source.xAxis?.length) return null
  const threshold = source.threshold || {}
  const electric = source.series.find((item) => item.key === 'electricity')
  const water = source.series.find((item) => item.key === 'water')

  return {
    color: ['#00d4ff', '#00c48c'],
    grid: { left: 8, right: 8, top: 42, bottom: 6, containLabel: true },
    legend: { ...LEGEND_STYLE, top: 2, right: 6, data: ['用电量', '用水量'] },
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(0,212,255,.4)' } },
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params]
        const title = list[0]?.axisValue ?? ''
        const rows = list
          .map((item) => {
            const series = source.series.find((entry) => entry.name === item.seriesName)
            return `${item.marker}${item.seriesName}<span style="float:right;margin-left:18px;font-weight:600">${item.data?.value ?? item.value} ${series?.unit || ''}</span>`
          })
          .join('<br/>')
        return `<div style="margin-bottom:4px;color:#9fc3ef">${title}</div>${rows}`
      }
    },
    xAxis: categoryAxis(source.xAxis, { boundaryGap: false }),
    yAxis: [
      valueAxis({ name: '电量 kWh', nameTextStyle: { color: '#7d9bc4', fontSize: 11 }, splitNumber: 4 }),
      valueAxis({ name: '水量 t', nameTextStyle: { color: '#7d9bc4', fontSize: 11 }, splitLine: { show: false } })
    ],
    series: [
      {
        name: '用电量',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        data: pointData(electric?.data || [], threshold.electricity ?? Infinity),
        lineStyle: { width: 2, color: '#00d4ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,212,255,.32)' },
              { offset: 1, color: 'rgba(0,212,255,0)' }
            ]
          }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(255,77,79,.7)', type: 'dashed', width: 1 },
          label: {
            formatter: '电量预警阈值',
            color: '#ff7875',
            fontSize: 11,
            position: 'insideEndTop'
          },
          data: [{ yAxis: threshold.electricity }]
        }
      },
      {
        name: '用水量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        data: pointData(water?.data || [], threshold.water ?? Infinity),
        lineStyle: { width: 2, color: '#00c48c' }
      }
    ]
  }
})

const onChartClick = (params) => {
  if (params?.componentType !== 'series') return
  const label = params.axisValue ?? params.name
  if (label) store.selectTimePoint(label)
}
</script>

<style scoped>
.chart-tip {
  font-size: 11px;
  color: var(--screen-text-muted);
}
</style>
