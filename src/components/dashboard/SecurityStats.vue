<template>
  <ScreenPanel title="安防统计" :subtitle="peopleSubtitle">
    <div class="security-body">
      <div class="stat-row">
        <div class="stat-item">
          <span class="stat-label">开门总次数</span>
          <b class="stat-value">{{ access.openTotal ?? '--' }}</b>
        </div>
        <div class="stat-item">
          <span class="stat-label">异常开门</span>
          <b class="stat-value is-danger">{{ access.abnormal ?? '--' }}</b>
        </div>
        <div class="stat-item">
          <span class="stat-label">摄像头在线</span>
          <b class="stat-value is-normal">{{ camera.online ?? '--' }}</b>
        </div>
        <div class="stat-item">
          <span class="stat-label">摄像头离线</span>
          <b class="stat-value is-offline">{{ camera.offline ?? '--' }}</b>
        </div>
      </div>
      <div class="flow-chart">
        <div class="chart-caption">实时人流量趋势（当日时段）</div>
        <BaseChart
          :option="option"
          :loading="store.state.loading.security"
          :error="store.state.error.security"
          :empty="isEmpty"
          empty-text="暂无安防统计数据"
        />
      </div>
    </div>
  </ScreenPanel>
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from '@/components/common/BaseChart.vue'
import ScreenPanel from '@/components/common/ScreenPanel.vue'
import { screenStore } from '@/store/screenStore'
import { TOOLTIP_STYLE, categoryAxis, valueAxis } from '@/utils/chartTheme'

const store = screenStore

const data = computed(() => store.state.security)
const isEmpty = computed(() => !data.value || !data.value.peopleFlow?.data?.length)
const access = computed(() => data.value?.access || {})
const camera = computed(() => data.value?.camera || {})
const peopleSubtitle = computed(() => (data.value ? `当日累计人流 ${data.value.peopleFlow?.total ?? 0} 人次` : ''))

const option = computed(() => {
  const flow = data.value?.peopleFlow
  if (!flow || !flow.data?.length) return null

  return {
    grid: { left: 4, right: 8, top: 14, bottom: 2, containLabel: true },
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(0,212,255,.4)' } },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params
        return `<div style="margin-bottom:4px;color:#9fc3ef">${item.axisValue}</div>${item.marker}人流量：<span style="color:#00d4ff;font-weight:600">${item.value} 人</span>`
      }
    },
    xAxis: categoryAxis(flow.xAxis, {
      boundaryGap: false,
      interval: 3,
      extra: { axisLabel: { color: '#7d9bc4', fontSize: 11, interval: 3 } }
    }),
    yAxis: valueAxis({ splitNumber: 3, axisLabel: { color: '#7d9bc4', fontSize: 11 } }),
    series: [
      {
        name: '人流量',
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 5,
        data: flow.data,
        lineStyle: { width: 2, color: '#00d4ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,212,255,.35)' },
              { offset: 1, color: 'rgba(0,212,255,0)' }
            ]
          }
        }
      }
    ]
  }
})
</script>

<style scoped>
.security-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  flex: none;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(14, 38, 74, 0.5);
  border: 1px solid rgba(64, 150, 255, 0.18);
}

.stat-label {
  font-size: 11px;
  color: var(--screen-text-muted);
  white-space: nowrap;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #eaf6ff;
  font-variant-numeric: tabular-nums;
}

.stat-value.is-danger {
  color: var(--status-danger);
}

.stat-value.is-normal {
  color: var(--status-normal);
}

.stat-value.is-offline {
  color: var(--status-offline);
}

.flow-chart {
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  min-height: 0;
}

.chart-caption {
  font-size: 11px;
  color: var(--screen-text-muted);
  padding-left: 2px;
  height: 16px;
  line-height: 16px;
  flex: none;
}

.flow-chart .base-chart {
  flex: 1;
  height: auto;
  min-height: 0;
}
</style>
