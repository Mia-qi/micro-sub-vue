<template>
  <header class="top-bar">
    <div class="title-row">
      <div class="title-left">
        <span class="brand-tag">SMART PARK O&amp;M</span>
      </div>
      <h1 class="screen-title">智慧园区运维监控大屏</h1>
      <div class="title-right">
        <div class="meta clock">
          <span class="meta-label">系统时间</span>
          <b class="meta-value clock-value">{{ clock }}</b>
        </div>
        <div class="meta inspectors">
          <span class="meta-label">在线巡检</span>
          <b class="meta-value">{{ inspectors }}</b>
          <span class="meta-unit">人</span>
        </div>
        <button class="tool-btn" @click="toggleFullscreen">
          {{ isFullscreen ? '退出全屏' : '一键全屏' }}
        </button>
        <div class="auto-refresh">
          <button class="switch" :class="{ on: store.state.autoRefresh }" @click="toggleAutoRefresh">
            <span class="switch-dot"></span>
          </button>
          <span class="meta-label">自动刷新</span>
          <select class="mini-select" :value="store.state.refreshInterval" @change="onIntervalChange">
            <option v-for="item in REFRESH_INTERVAL_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="filter-row">
      <div class="filter-group">
        <span class="filter-label">时间范围</span>
        <div class="range-buttons">
          <button
            v-for="item in TIME_RANGE_OPTIONS"
            :key="item.value"
            class="range-btn"
            :class="{ active: filters.timeRange === item.value }"
            @click="onRange(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div v-if="filters.timeRange === 'custom'" class="filter-group custom-range">
        <input v-model="customStart" class="mini-input" type="datetime-local" />
        <span class="tilde">~</span>
        <input v-model="customEnd" class="mini-input" type="datetime-local" />
        <button class="tool-btn small primary" @click="applyCustomRange">确定</button>
      </div>

      <div class="filter-group">
        <span class="filter-label">楼栋</span>
        <select class="mini-select" :value="filters.buildingId" @change="onBuildingChange">
          <option v-for="item in BUILDING_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <span class="filter-label">设备类型</span>
        <select class="mini-select" :value="filters.deviceType" @change="onFilterChange('deviceType', $event)">
          <option v-for="item in DEVICE_TYPE_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <span class="filter-label">告警等级</span>
        <select class="mini-select" :value="filters.warnLevel" @change="onFilterChange('warnLevel', $event)">
          <option v-for="item in WARN_LEVEL_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="tool-btn ghost" @click="onReset">重置筛选</button>
        <button class="tool-btn primary" @click="onRefresh">手动刷新</button>
        <span class="refresh-time">最近刷新 {{ store.state.lastRefresh || '--:--:--' }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  BUILDING_OPTIONS,
  DEVICE_TYPE_OPTIONS,
  REFRESH_INTERVAL_OPTIONS,
  TIME_RANGE_OPTIONS,
  WARN_LEVEL_OPTIONS
} from '@/constants'
import { screenStore } from '@/store/screenStore'
import { formatClock } from '@/utils/time'
import { registerTask } from '@/utils/screenRuntime'

const store = screenStore
const filters = computed(() => store.state.filters)
const inspectors = computed(() => store.state.kpi?.inspectorsOnline ?? '--')

const clock = ref(formatClock(new Date()))
const customStart = ref(filters.value.customStart)
const customEnd = ref(filters.value.customEnd)
const isFullscreen = ref(false)
let clockTimer = null

const syncCustom = () => {
  customStart.value = filters.value.customStart
  customEnd.value = filters.value.customEnd
}

const onRange = (value) => {
  if (value === 'custom') {
    store.state.filters.timeRange = 'custom'
    syncCustom()
    return
  }
  store.setTimeRange(value)
  syncCustom()
}

const applyCustomRange = () => {
  if (!customStart.value || !customEnd.value) return
  store.applyCustomRange(customStart.value, customEnd.value)
}

const onBuildingChange = (event) => {
  const value = event.target.value
  const option = BUILDING_OPTIONS.find((item) => item.value === value)
  store.selectBuilding(value, option?.label || '')
}

const onFilterChange = (key, event) => {
  store.setFilter(key, event.target.value)
}

const onIntervalChange = (event) => {
  store.setRefreshInterval(event.target.value)
}

const toggleAutoRefresh = () => {
  store.setAutoRefresh(!store.state.autoRefresh)
}

const onReset = () => {
  store.resetFilters()
  syncCustom()
}

const onRefresh = () => {
  store.refresh()
}

const toggleFullscreen = () => {
  const target = document.documentElement
  if (!document.fullscreenElement) {
    const request = target.requestFullscreen || target.webkitRequestFullscreen
    if (request) request.call(target)
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen
    if (exit) exit.call(document)
  }
}

const syncFullscreen = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreen)
  clockTimer = setInterval(() => {
    clock.value = formatClock(new Date())
  }, 1000)
  registerTask(() => {
    if (clockTimer) clearInterval(clockTimer)
    clockTimer = null
    document.removeEventListener('fullscreenchange', syncFullscreen)
  })
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  clockTimer = null
  document.removeEventListener('fullscreenchange', syncFullscreen)
})
</script>

<style scoped>
.top-bar {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 120px;
  flex: none;
  background: linear-gradient(180deg, rgba(18, 52, 104, 0.7), rgba(5, 16, 34, 0.2));
  border-bottom: 1px solid rgba(64, 150, 255, 0.28);
}

.top-bar::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -1px;
  width: 900px;
  height: 2px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.9), transparent);
}

.title-row {
  position: relative;
  display: flex;
  align-items: center;
  height: 68px;
  padding: 0 6px;
}

.title-left,
.title-right {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}

.title-right {
  justify-content: flex-end;
}

.screen-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #eaf6ff;
  text-shadow: 0 0 18px rgba(0, 212, 255, 0.55);
  white-space: nowrap;
}

.brand-tag {
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(0, 212, 255, 0.75);
  border: 1px solid rgba(0, 212, 255, 0.35);
  padding: 3px 8px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-label {
  font-size: 13px;
  color: var(--screen-text-sub);
}

.meta-value {
  font-size: 20px;
  font-weight: 700;
  color: #00d4ff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.clock-value {
  font-size: 18px;
  color: #dbe9ff;
  text-shadow: none;
}

.meta-unit {
  font-size: 12px;
  color: var(--screen-text-sub);
}

.tool-btn {
  height: 30px;
  padding: 0 14px;
  border: 1px solid rgba(64, 150, 255, 0.45);
  background: rgba(22, 62, 118, 0.4);
  color: #cfe4ff;
  font-size: 13px;
  border-radius: 2px;
  transition: all 0.2s;
}

.tool-btn:hover {
  border-color: rgba(0, 212, 255, 0.85);
  color: #fff;
  background: rgba(0, 120, 200, 0.45);
}

.tool-btn.primary {
  border-color: rgba(0, 212, 255, 0.7);
  background: linear-gradient(180deg, rgba(0, 150, 220, 0.55), rgba(0, 90, 160, 0.45));
  color: #eaf6ff;
}

.tool-btn.ghost {
  background: rgba(12, 30, 58, 0.5);
}

.tool-btn.small {
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch {
  position: relative;
  width: 38px;
  height: 18px;
  border-radius: 9px;
  border: 1px solid rgba(64, 150, 255, 0.5);
  background: rgba(10, 30, 60, 0.8);
  padding: 0;
  transition: all 0.2s;
}

.switch .switch-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #5f7ea6;
  transition: all 0.2s;
}

.switch.on {
  border-color: rgba(0, 212, 255, 0.8);
  background: rgba(0, 120, 190, 0.4);
}

.switch.on .switch-dot {
  left: 22px;
  background: #00d4ff;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.9);
}

.mini-select,
.mini-input {
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgba(64, 150, 255, 0.4);
  background: rgba(8, 24, 48, 0.9);
  color: #cfe4ff;
  font-size: 13px;
  border-radius: 2px;
}

.mini-select {
  min-width: 108px;
  cursor: pointer;
}

.mini-input {
  width: 168px;
  color-scheme: dark;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 52px;
  padding: 0 6px;
  flex-wrap: nowrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

.filter-label {
  font-size: 13px;
  color: var(--screen-text-sub);
  white-space: nowrap;
}

.range-buttons {
  display: flex;
  border: 1px solid rgba(64, 150, 255, 0.35);
  background: rgba(8, 24, 48, 0.6);
}

.range-btn {
  height: 28px;
  padding: 0 12px;
  border: none;
  border-right: 1px solid rgba(64, 150, 255, 0.22);
  background: transparent;
  color: #9cbbe0;
  font-size: 13px;
  transition: all 0.2s;
}

.range-btn:last-child {
  border-right: none;
}

.range-btn:hover {
  color: #fff;
  background: rgba(0, 120, 200, 0.25);
}

.range-btn.active {
  color: #eaf6ff;
  background: linear-gradient(180deg, rgba(0, 170, 235, 0.75), rgba(0, 100, 170, 0.6));
  box-shadow: inset 0 0 12px rgba(0, 212, 255, 0.45);
}

.custom-range .tilde {
  color: var(--screen-text-sub);
  font-size: 12px;
}

.filter-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-time {
  font-size: 12px;
  color: var(--screen-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
