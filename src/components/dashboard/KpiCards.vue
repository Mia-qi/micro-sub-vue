<template>
  <div class="kpi-section">
    <div v-if="error" class="kpi-state is-error">{{ error }}</div>
    <div v-else-if="!hasData" class="kpi-state">数据加载中…</div>
    <div v-else class="kpi-grid">
      <div v-for="card in cards" :key="card.key" class="kpi-card" :class="`tone-${card.tone}`">
        <div class="kpi-head">
          <span class="kpi-name">{{ card.name }}</span>
          <span class="kpi-status" :class="`is-${card.statusTone}`">{{ card.status }}</span>
        </div>
        <div class="kpi-value">
          <b>{{ card.value }}</b>
          <span class="kpi-unit">{{ card.unit }}</span>
        </div>
        <div class="kpi-foot">
          <span v-if="card.compare !== undefined" class="kpi-compare" :class="compareClass(card)">
            {{ card.compare > 0 ? '↑' : card.compare < 0 ? '↓' : '—' }}
            {{ Math.abs(card.compare) }}%
          </span>
          <span v-if="card.sub" class="kpi-sub">
            <i class="sub-high">高 {{ card.sub.high }}</i>
            <i class="sub-medium">中 {{ card.sub.medium }}</i>
            <i class="sub-low">低 {{ card.sub.low }}</i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { screenStore } from '@/store/screenStore'

const store = screenStore

const hasData = computed(() => !!store.state.kpi)
const error = computed(() => store.state.error.kpi)

const cards = computed(() => {
  const kpi = store.state.kpi || {}
  const compare = kpi.compare || {}
  return [
    {
      key: 'deviceTotal',
      name: '园区设备总数',
      value: kpi.deviceTotal ?? '--',
      unit: '台',
      compare: compare.deviceTotal,
      tone: 'default',
      status: '全域纳管',
      statusTone: 'normal'
    },
    {
      key: 'deviceOnline',
      name: '在线设备数',
      value: kpi.deviceOnline ?? '--',
      unit: '台',
      compare: compare.deviceOnline,
      tone: 'normal',
      status: '运行正常',
      statusTone: 'normal'
    },
    {
      key: 'deviceOffline',
      name: '离线设备数',
      value: kpi.deviceOffline ?? '--',
      unit: '台',
      compare: compare.deviceOffline,
      tone: 'offline',
      invert: true,
      status: '需排查',
      statusTone: 'offline'
    },
    {
      key: 'warnTotal',
      name: '当前告警总数',
      value: kpi.warnTotal ?? '--',
      unit: '条',
      compare: compare.warnTotal,
      tone: 'danger',
      invert: true,
      status: kpi.warnHigh ? '存在高危' : '态势平稳',
      statusTone: kpi.warnHigh ? 'danger' : 'normal',
      sub: { high: kpi.warnHigh ?? 0, medium: kpi.warnMedium ?? 0, low: kpi.warnLow ?? 0 }
    },
    {
      key: 'workorderProcessing',
      name: '在处理工单',
      value: kpi.workorderProcessing ?? '--',
      unit: '单',
      compare: compare.workorderProcessing,
      tone: 'warning',
      status: '处理中',
      statusTone: 'warning'
    },
    {
      key: 'workorderPending',
      name: '待派单工单',
      value: kpi.workorderPending ?? '--',
      unit: '单',
      compare: compare.workorderPending,
      tone: 'warning',
      invert: true,
      status: '待派单',
      statusTone: 'warning'
    },
    {
      key: 'electricityToday',
      name: '今日耗电量',
      value: kpi.electricityToday ?? '--',
      unit: 'kWh',
      compare: compare.electricityToday,
      tone: 'primary',
      invert: true,
      status: '实时计量',
      statusTone: 'normal'
    },
    {
      key: 'waterToday',
      name: '今日耗水量',
      value: kpi.waterToday ?? '--',
      unit: 't',
      compare: compare.waterToday,
      tone: 'primary',
      invert: true,
      status: '实时计量',
      statusTone: 'normal'
    },
    {
      key: 'peopleRealtime',
      name: '园区实时人流量',
      value: kpi.peopleRealtime ?? '--',
      unit: '人',
      compare: compare.peopleRealtime,
      tone: 'default',
      status: '实时统计',
      statusTone: 'normal'
    }
  ]
})

const compareClass = (card) => {
  if (card.compare === 0) return 'flat'
  const isUp = card.compare > 0
  const isGood = card.invert ? !isUp : isUp
  return isGood ? 'good' : 'bad'
}
</script>

<style scoped>
.kpi-section {
  position: relative;
  height: 100%;
}

.kpi-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  color: var(--screen-text-muted);
}

.kpi-state.is-error {
  color: var(--status-danger);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  height: 100%;
}

.kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 10px;
  background: linear-gradient(160deg, rgba(20, 52, 100, 0.6), rgba(8, 22, 44, 0.55));
  border: 1px solid rgba(64, 150, 255, 0.22);
  border-left: 2px solid rgba(0, 212, 255, 0.55);
  transition: all 0.2s;
}

.kpi-card:hover {
  border-color: rgba(0, 212, 255, 0.7);
  box-shadow: 0 0 14px rgba(0, 212, 255, 0.2);
}

.kpi-card.tone-normal {
  border-left-color: rgba(0, 196, 140, 0.8);
}

.kpi-card.tone-offline {
  border-left-color: rgba(134, 144, 156, 0.8);
}

.kpi-card.tone-danger {
  border-left-color: rgba(255, 77, 79, 0.9);
}

.kpi-card.tone-warning {
  border-left-color: rgba(255, 197, 61, 0.9);
}

.kpi-card.tone-primary {
  border-left-color: rgba(0, 212, 255, 0.9);
}

.kpi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.kpi-name {
  font-size: 12px;
  color: var(--screen-text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-status {
  flex: none;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 2px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.kpi-status.is-normal {
  color: var(--status-normal);
  border-color: rgba(0, 196, 140, 0.4);
  background: rgba(0, 196, 140, 0.1);
}

.kpi-status.is-warning {
  color: var(--status-warning);
  border-color: rgba(255, 197, 61, 0.4);
  background: rgba(255, 197, 61, 0.1);
}

.kpi-status.is-danger {
  color: var(--status-danger);
  border-color: rgba(255, 77, 79, 0.45);
  background: rgba(255, 77, 79, 0.12);
}

.kpi-status.is-offline {
  color: var(--status-offline);
  border-color: rgba(134, 144, 156, 0.4);
  background: rgba(134, 144, 156, 0.1);
}

.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.kpi-value b {
  font-size: 26px;
  line-height: 1.1;
  font-weight: 700;
  color: #eaf6ff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.35);
}

.tone-normal .kpi-value b {
  color: var(--status-normal);
}

.tone-offline .kpi-value b {
  color: var(--status-offline);
}

.tone-danger .kpi-value b {
  color: var(--status-danger);
}

.tone-warning .kpi-value b {
  color: var(--status-warning);
}

.tone-primary .kpi-value b {
  color: #00d4ff;
}

.kpi-unit {
  font-size: 11px;
  color: var(--screen-text-muted);
}

.kpi-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-height: 14px;
}

.kpi-compare {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.kpi-compare.good {
  color: var(--status-normal);
}

.kpi-compare.bad {
  color: var(--status-danger);
}

.kpi-compare.flat {
  color: var(--screen-text-muted);
}

.kpi-sub {
  display: flex;
  gap: 5px;
  font-size: 10px;
  font-style: normal;
}

.kpi-sub i {
  font-style: normal;
}

.sub-high {
  color: var(--status-danger);
}

.sub-medium {
  color: var(--status-warning);
}

.sub-low {
  color: var(--screen-text-muted);
}
</style>
