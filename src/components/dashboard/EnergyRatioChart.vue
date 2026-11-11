<template>
  <ScreenPanel title="能耗结构占比" :subtitle="subtitle">
    <BaseChart
      :option="option"
      :loading="store.state.loading.energyRatio"
      :error="store.state.error.energyRatio"
      :empty="isEmpty"
      empty-text="暂无能耗结构数据"
    />
  </ScreenPanel>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '@/components/common/BaseChart.vue'
import ScreenPanel from '@/components/common/ScreenPanel.vue'
import { screenStore } from '@/store/screenStore'
import { TOOLTIP_STYLE } from '@/utils/chartTheme'

const store = screenStore

const data = computed(() => store.state.energyRatio)
const isEmpty = computed(() => !data.value || !data.value.list?.length)

const subtitle = computed(() => (data.value ? `统计周期总能耗 ${data.value.total} kWh` : ''))

const option = computed(() => {
  const source = data.value
  if (!source || !source.list?.length) return null
  const total = source.total || source.list.reduce((sum, item) => sum + item.value, 0) || 1
  const shareOf = (value) => `${((value / total) * 100).toFixed(1)}%`

  return {
    color: ['#00d4ff', '#2f7cff', '#00c48c', '#ffc53d'],
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'item',
      formatter: (params) =>
        `<div style="margin-bottom:4px;color:#9fc3ef">${params.name}</div>${params.marker}能耗：<span style="color:#00d4ff;font-weight:600">${params.value} kWh</span><br/>占比：<span style="color:#00c48c;font-weight:600">${params.percent}%</span>`
    },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 8,
      itemGap: 12,
      textStyle: { color: '#a9c4e6', fontSize: 12 },
      formatter: (name) => {
        const row = source.list.find((item) => item.name === name)
        return `${name}  ${shareOf(row?.value || 0)}`
      }
    },
    title: {
      text: `${source.total}`,
      subtext: `总能耗 ${source.unit || 'kWh'}`,
      left: '31%',
      top: '40%',
      textAlign: 'center',
      textStyle: {
        color: '#00d4ff',
        fontSize: 20,
        fontWeight: 700,
        textShadowColor: 'rgba(0,212,255,.5)',
        textShadowBlur: 8
      },
      subtextStyle: { color: '#6f8db4', fontSize: 11 }
    },
    series: [
      {
        type: 'pie',
        radius: ['44%', '66%'],
        center: ['31%', '52%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: 'rgba(4,16,34,.9)', borderWidth: 2 },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,212,255,.55)' }
        },
        data: source.list.map((item) => ({ name: item.name, value: item.value }))
      }
    ]
  }
})
</script>
