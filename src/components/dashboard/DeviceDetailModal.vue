<template>
  <div v-if="store.state.dialog.visible" class="modal-mask" @click.self="close">
    <div class="modal">
      <div class="modal-head">
        <div class="head-title">
          <span class="title-text">设备详情</span>
          <span v-if="device" class="title-device">{{ device.deviceName }}</span>
        </div>
        <div class="head-right">
          <span v-if="device" class="status-tag" :class="`is-${device.status}`">{{ device.statusName }}</span>
          <button class="close-btn" @click="close">×</button>
        </div>
      </div>

      <div class="modal-body">
        <div v-if="store.state.dialog.loading" class="modal-state">数据加载中…</div>
        <div v-else-if="store.state.dialog.error" class="modal-state is-error">
          {{ store.state.dialog.error }}
        </div>
        <div v-else-if="!data" class="modal-state">暂无设备数据</div>

        <template v-else>
          <section class="detail-section">
            <div class="section-title">设备基础档案</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">设备编号</span>
                <span class="info-value">{{ device.deviceId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">所属位置</span>
                <span class="info-value">{{ device.buildingName }} - {{ device.floor }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">设备类型</span>
                <span class="info-value">{{ device.typeName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">设备型号</span>
                <span class="info-value">{{ device.model }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">安装时间</span>
                <span class="info-value">{{ device.installTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">运行状态</span>
                <span class="info-value" :class="`status-${device.status}`">{{ device.statusName }}</span>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <div class="section-title">实时采集指标</div>
            <div class="metric-grid">
              <div v-for="metric in data.metrics" :key="metric.label" class="metric-item">
                <span class="metric-label">{{ metric.label }}</span>
                <div class="metric-value">
                  <b>{{ metric.value }}</b>
                  <span class="metric-unit">{{ metric.unit }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <div class="section-title">
              历史告警记录
              <span class="section-sub">最近 {{ data.alarms.length }} 条</span>
            </div>
            <div class="mini-table">
              <div class="mini-head">
                <span>时间</span>
                <span>告警类型</span>
                <span>等级</span>
                <span>处理状态</span>
              </div>
              <div v-if="!data.alarms.length" class="mini-empty">暂无告警记录</div>
              <template v-else>
                <div v-for="item in data.alarms" :key="item.id" class="mini-row">
                  <span class="mini-cell">{{ item.time }}</span>
                  <span class="mini-cell">{{ item.typeName }}</span>
                  <span class="mini-cell">
                    <i class="level-tag" :class="`is-${item.level}`">{{ item.levelName }}</i>
                  </span>
                  <span class="mini-cell">{{ item.statusName }}</span>
                </div>
              </template>
            </div>
          </section>

          <section class="detail-section">
            <div class="section-title">
              关联工单记录
              <span class="section-sub">最近 {{ data.workorders.length }} 条</span>
            </div>
            <div class="mini-table">
              <div class="mini-head workorder-head">
                <span>工单编号</span>
                <span>工单类型</span>
                <span>当前状态</span>
                <span>指派人员</span>
                <span>上报时间</span>
              </div>
              <div v-if="!data.workorders.length" class="mini-empty">暂无关联工单</div>
              <template v-else>
                <div v-for="item in data.workorders" :key="item.id" class="mini-row workorder-row">
                  <span class="mini-cell">{{ item.id }}</span>
                  <span class="mini-cell">{{ item.typeName }}</span>
                  <span class="mini-cell" :class="`wo-${item.status}`">{{ item.statusName }}</span>
                  <span class="mini-cell">{{ item.assignee }}</span>
                  <span class="mini-cell">{{ item.reportTime }}</span>
                </div>
              </template>
            </div>
          </section>
        </template>
      </div>

      <div class="modal-foot">
        <span class="action-tip">{{ actionTip }}</span>
        <button class="foot-btn ghost" :disabled="!hasUnhandledAlarm" @click="onConfirmAlarm">标记告警已确认</button>
        <button class="foot-btn primary" :disabled="!device" @click="onCreateWorkOrder">生成工单</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { screenStore } from '@/store/screenStore'

const store = screenStore
const actionTip = ref('')
let tipTimer = null

const data = computed(() => store.state.dialog.data)
const device = computed(() => data.value?.device || null)
const hasUnhandledAlarm = computed(() => !!data.value?.alarms?.some((item) => item.statusName === '未处理'))

const close = () => {
  store.closeDeviceDetail()
}

const flashTip = (text) => {
  actionTip.value = text
  if (tipTimer) clearTimeout(tipTimer)
  tipTimer = setTimeout(() => {
    actionTip.value = ''
    tipTimer = null
  }, 2600)
}

const onConfirmAlarm = async () => {
  const alarm = data.value?.alarms?.find((item) => item.statusName === '未处理')
  if (!alarm) return
  try {
    await store.confirmAlarm(alarm.id)
    flashTip('告警已标记为已确认')
  } catch (error) {
    flashTip(error?.message || '操作失败，请重试')
  }
}

const onCreateWorkOrder = async () => {
  try {
    const alarm = data.value?.alarms?.find((item) => item.statusName === '未处理')
    await store.generateWorkOrder({ deviceId: device.value?.deviceId, alarmId: alarm?.id || '' })
    flashTip('工单已生成，可在巡检工单列表查看')
  } catch (error) {
    flashTip(error?.message || '工单生成失败')
  }
}

onUnmounted(() => {
  if (tipTimer) clearTimeout(tipTimer)
})
</script>

<style scoped>
.modal-mask {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 8, 20, 0.72);
  backdrop-filter: blur(3px);
}

.modal {
  display: flex;
  flex-direction: column;
  width: 820px;
  max-height: 780px;
  background: linear-gradient(180deg, rgba(12, 34, 66, 0.98), rgba(6, 18, 36, 0.98));
  border: 1px solid rgba(0, 212, 255, 0.45);
  box-shadow: 0 0 40px rgba(0, 140, 220, 0.35);
}

.modal-head {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  flex: none;
  border-bottom: 1px solid rgba(64, 150, 255, 0.25);
  background: linear-gradient(90deg, rgba(0, 110, 190, 0.45), rgba(0, 110, 190, 0));
}

.head-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.title-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #eaf6ff;
}

.title-device {
  font-size: 13px;
  color: #8fb2d9;
}

.head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid transparent;
  border-radius: 2px;
}

.status-tag.is-normal {
  color: var(--status-normal);
  border-color: rgba(0, 196, 140, 0.45);
  background: rgba(0, 196, 140, 0.12);
}

.status-tag.is-warning {
  color: var(--status-warning);
  border-color: rgba(255, 197, 61, 0.45);
  background: rgba(255, 197, 61, 0.12);
}

.status-tag.is-fault {
  color: var(--status-danger);
  border-color: rgba(255, 77, 79, 0.45);
  background: rgba(255, 77, 79, 0.12);
}

.status-tag.is-offline {
  color: var(--status-offline);
  border-color: rgba(134, 144, 156, 0.45);
  background: rgba(134, 144, 156, 0.12);
}

.close-btn {
  width: 26px;
  height: 26px;
  border: 1px solid rgba(64, 150, 255, 0.35);
  background: transparent;
  color: #8fb2d9;
  font-size: 18px;
  line-height: 1;
}

.close-btn:hover {
  color: #ff4d4f;
  border-color: rgba(255, 77, 79, 0.6);
}

.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px;
}

.modal-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260px;
  font-size: 14px;
  color: var(--screen-text-muted);
}

.modal-state.is-error {
  color: var(--status-danger);
}

.detail-section {
  margin-bottom: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #cfe4ff;
  padding-left: 8px;
  border-left: 3px solid #00d4ff;
}

.section-sub {
  font-size: 11px;
  font-weight: 400;
  color: var(--screen-text-muted);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(16, 44, 82, 0.5);
  border: 1px solid rgba(64, 150, 255, 0.16);
}

.info-label {
  font-size: 12px;
  color: var(--screen-text-muted);
  flex: none;
}

.info-value {
  font-size: 13px;
  color: #dbe9ff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-normal {
  color: var(--status-normal);
}

.status-warning {
  color: var(--status-warning);
}

.status-fault {
  color: var(--status-danger);
}

.status-offline {
  color: var(--status-offline);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: linear-gradient(160deg, rgba(0, 110, 190, 0.22), rgba(8, 24, 48, 0.5));
  border: 1px solid rgba(64, 150, 255, 0.2);
}

.metric-label {
  font-size: 12px;
  color: var(--screen-text-muted);
}

.metric-value b {
  font-size: 22px;
  font-weight: 700;
  color: #00d4ff;
  font-variant-numeric: tabular-nums;
}

.metric-unit {
  margin-left: 4px;
  font-size: 11px;
  color: var(--screen-text-muted);
}

.mini-table {
  border: 1px solid rgba(64, 150, 255, 0.18);
}

.mini-head,
.mini-row {
  display: grid;
  grid-template-columns: 170px 150px 90px 1fr;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  font-size: 12px;
}

.mini-head {
  height: 28px;
  color: #6f8db4;
  background: rgba(20, 58, 110, 0.4);
}

.mini-row {
  height: 28px;
  color: #b6d0ee;
  border-top: 1px dashed rgba(64, 150, 255, 0.14);
}

.workorder-head,
.workorder-row {
  grid-template-columns: 180px 120px 90px 100px 1fr;
}

.mini-cell {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mini-empty {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: var(--screen-text-muted);
}

.level-tag {
  display: inline-block;
  padding: 0 5px;
  font-size: 10px;
  font-style: normal;
  border-radius: 2px;
  border: 1px solid transparent;
}

.level-tag.is-high {
  color: #ff4d4f;
  border-color: rgba(255, 77, 79, 0.45);
  background: rgba(255, 77, 79, 0.12);
}

.level-tag.is-medium {
  color: #ffc53d;
  border-color: rgba(255, 197, 61, 0.45);
  background: rgba(255, 197, 61, 0.1);
}

.level-tag.is-low {
  color: #86909c;
  border-color: rgba(134, 144, 156, 0.4);
  background: rgba(134, 144, 156, 0.1);
}

.wo-pending {
  color: var(--status-warning);
}

.wo-processing {
  color: #00d4ff;
}

.wo-done {
  color: var(--status-normal);
}

.wo-closed {
  color: var(--status-offline);
}

.wo-timeout {
  color: var(--status-danger);
  font-weight: 600;
}

.modal-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  height: 58px;
  padding: 0 16px;
  flex: none;
  border-top: 1px solid rgba(64, 150, 255, 0.2);
  background: rgba(8, 24, 48, 0.6);
}

.action-tip {
  margin-right: auto;
  font-size: 12px;
  color: var(--status-normal);
}

.foot-btn {
  height: 32px;
  padding: 0 18px;
  border: 1px solid rgba(64, 150, 255, 0.45);
  background: rgba(22, 62, 118, 0.45);
  color: #cfe4ff;
  font-size: 13px;
  border-radius: 2px;
  transition: all 0.2s;
}

.foot-btn:hover:not(:disabled) {
  border-color: rgba(0, 212, 255, 0.85);
  color: #fff;
}

.foot-btn.primary {
  border-color: rgba(0, 212, 255, 0.7);
  background: linear-gradient(180deg, rgba(0, 150, 220, 0.6), rgba(0, 90, 160, 0.5));
}

.foot-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
