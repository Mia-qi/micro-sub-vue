<template>
  <ScreenPanel title="设备状态分布" :subtitle="subtitle">
    <div class="device-status-body">
      <div class="ring-chart">
        <BaseChart
          :option="option"
          :loading="store.state.loading.deviceStatus"
          :error="store.state.error.deviceStatus"
          :empty="isEmpty"
          empty-text="暂无设备状态数据"
        />
      </div>
      <div class="type-list">
        <div v-for="item in types" :key="item.key" class="type-row">
          <span class="type-name">{{ item.name }}</span>
          <span class="type-bar">
            <i
              v-for="segment in segmentsOf(item)"
              :key="segment.key"
              :style="{ width: `${segment.ratio}%`, background: segment.color }"
            ></i>
          </span>
          <span class="type-total">{{ item.total }}</span>
        </div>
      </div>
    </div>
  </ScreenPanel>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '@/components/common/BaseChart.vue'
import ScreenPanel from '@/components/common/ScreenPanel.vue'
import { screenStore } from '@/store/screenStore'
import { TOOLTIP_STYLE } from '@/utils/chartTheme'

const store = screenStore

const data = computed(() => store.state.deviceStatus)
const types = computed(() => data.value?.types || [])
const isEmpty = computed(() => !data.value || !data.value.total)
const subtitle = computed(() => (data.value ? `纳管设备 ${data.value.total} 台` : ''))

const STATUS_SEGMENTS = [
  { key: 'normal', name: '正常', color: '#00c48c' },
  { key: 'warning', name: '预警', color: '#ffc53d' },
  { key: 'fault', name: '故障', color: '#ff4d4f' },
  { key: 'offline', name: '离线', color: '#86909c' }
]

const segmentsOf = (item) => {
  const total = item.total || 1
  return STATUS_SEGMENTS.map((segment) => ({
    ...segment,
    ratio: (item[segment.key] / total) * 100
  }))
}

const option = computed(() => {
  const source = data.value
  if (!source || !source.total) return null
  const summary = source.summary || {}

  return {
    color: STATUS_SEGMENTS.map((item) => item.color),
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'item',
      formatter: (params) =>
        `${params.marker}${params.name}：<span style="font-weight:600">${params.value} 台</span><br/>占比：<span style="color:#00d4ff;font-weight:600">${params.percent}%</span>`
    },
    legend: {
      orient: 'horizontal',
      bottom: 2,
      left: 'center',
      itemWidth: 10,
      itemHeight: 8,
      itemGap: 12,
      textStyle: { color: '#a9c4e6', fontSize: 11 },
      data: STATUS_SEGMENTS.map((item) => item.name)
    },
    title: {
      text: `${source.total}`,
      subtext: '设备总数（台）',
      left: '50%',
      top: '36%',
      textAlign: 'center',
      textStyle: {
        color: '#eaf6ff',
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
        radius: ['42%', '64%'],
        center: ['50%', '48%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: 'rgba(4,16,34,.9)', borderWidth: 2 },
        emphasis: { scale: true, scaleSize: 5 },
        data: STATUS_SEGMENTS.map((item) => ({
          name: item.name,
          value: summary[item.key] || 0
        }))
      }
    ]
  }
})
</script>

<style scoped>
.device-status-body {
  display: flex;
  align-items: center;
  height: 100%;
  min-height: 0;
}

.ring-chart {
  flex: 0 0 58%;
  height: 100%;
  min-width: 0;
}

.type-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding-left: 8px;
  min-width: 0;
}

.type-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.type-name {
  flex: none;
  width: 46px;
  color: var(--screen-text-sub);
  white-space: nowrap;
}

.type-bar {
  flex: 1;
  display: flex;
  height: 6px;
  min-width: 0;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.type-bar i {
  height: 100%;
  transition: width 0.4s;
}

.type-total {
  flex: none;
  width: 34px;
  text-align: right;
  color: #cfe4ff;
  font-variant-numeric: tabular-nums;
}
</style>
