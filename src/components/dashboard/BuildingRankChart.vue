<template>
  <ScreenPanel title="楼栋能耗排行" :subtitle="subtitle">
    <template #extra>
      <span class="chart-tip">点击楼栋可联动筛选</span>
    </template>
    <BaseChart
      :option="option"
      :loading="store.state.loading.buildingRank"
      :error="store.state.error.buildingRank"
      :empty="isEmpty"
      empty-text="暂无楼栋能耗数据"
      @chart-click="onChartClick"
    />
  </ScreenPanel>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '@/components/common/BaseChart.vue'
import ScreenPanel from '@/components/common/ScreenPanel.vue'
import { screenStore } from '@/store/screenStore'
import { CHART_TEXT_COLOR, SPLIT_LINE_COLOR, TOOLTIP_STYLE, valueAxis } from '@/utils/chartTheme'

const store = screenStore

const data = computed(() => store.state.buildingRank)
const isEmpty = computed(() => !data.value || !data.value.list?.length)

const subtitle = computed(() => (data.value ? `预警阈值 ${data.value.threshold} kWh` : ''))

const option = computed(() => {
  const source = data.value
  if (!source || !source.list?.length) return null
  const threshold = source.threshold
  const sorted = [...source.list].sort((a, b) => b.value - a.value)

  return {
    grid: { left: 8, right: 46, top: 12, bottom: 6, containLabel: true },
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,212,255,.08)' } },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params
        const row = sorted[item.dataIndex]
        const flag = row.value > threshold ? '（超过预警阈值）' : ''
        return `<div style="margin-bottom:4px;color:#9fc3ef">${row.buildingName}</div>总耗电量：<span style="color:#00d4ff;font-weight:600">${row.value} kWh</span>${flag}`
      }
    },
    xAxis: valueAxis({ splitNumber: 3, axisLabel: { color: CHART_TEXT_COLOR, fontSize: 11 } }),
    yAxis: {
      type: 'category',
      inverse: true,
      data: sorted.map((item) => item.buildingName),
      axisLine: { lineStyle: { color: 'rgba(90,150,230,.28)' } },
      axisTick: { show: false },
      axisLabel: { color: CHART_TEXT_COLOR, fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        barWidth: 10,
        data: sorted.map((item) => ({
          value: item.value,
          itemStyle: {
            color:
              item.value > threshold
                ? {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [
                      { offset: 0, color: 'rgba(255,77,79,.55)' },
                      { offset: 1, color: '#ff4d4f' }
                    ]
                  }
                : {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [
                      { offset: 0, color: 'rgba(0,150,220,.35)' },
                      { offset: 1, color: '#00d4ff' }
                    ]
                  }
          }
        })),
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          color: CHART_TEXT_COLOR,
          fontSize: 11,
          formatter: ({ value }) => value
        },
        backgroundStyle: { color: SPLIT_LINE_COLOR }
      }
    ]
  }
})

const onChartClick = (params) => {
  if (params?.componentType !== 'series') return
  const row = data.value?.list ? [...data.value.list].sort((a, b) => b.value - a.value)[params.dataIndex] : null
  if (row) store.selectBuilding(row.buildingId, row.buildingName)
}
</script>

<style scoped>
.chart-tip {
  font-size: 11px;
  color: var(--screen-text-muted);
}
</style>
