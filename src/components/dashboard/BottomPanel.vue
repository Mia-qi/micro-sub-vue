<template>
  <ScreenPanel title="告警与工单">
    <template #extra>
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'alarm' }" @click="tab = 'alarm'">
          告警列表
          <b class="tab-count">{{ store.state.alarmTotal }}</b>
        </button>
        <button class="tab" :class="{ active: tab === 'workorder' }" @click="tab = 'workorder'">
          巡检工单
          <b class="tab-count">{{ store.state.workOrderTotal }}</b>
        </button>
      </div>
    </template>
    <AlarmList v-if="tab === 'alarm'" />
    <WorkOrderList v-else />
  </ScreenPanel>
</template>

<script setup>
import { ref } from 'vue'
import AlarmList from '@/components/dashboard/AlarmList.vue'
import ScreenPanel from '@/components/common/ScreenPanel.vue'
import WorkOrderList from '@/components/dashboard/WorkOrderList.vue'
import { screenStore } from '@/store/screenStore'

const store = screenStore
const tab = ref('alarm')
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 6px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 12px;
  border: 1px solid rgba(64, 150, 255, 0.3);
  background: rgba(10, 30, 58, 0.6);
  color: #8fb2d9;
  font-size: 12px;
  border-radius: 2px;
  transition: all 0.2s;
}

.tab:hover {
  color: #eaf6ff;
  border-color: rgba(0, 212, 255, 0.6);
}

.tab.active {
  color: #eaf6ff;
  border-color: rgba(0, 212, 255, 0.85);
  background: linear-gradient(180deg, rgba(0, 150, 220, 0.5), rgba(0, 90, 160, 0.35));
  box-shadow: inset 0 0 10px rgba(0, 212, 255, 0.35);
}

.tab-count {
  font-size: 12px;
  color: #00d4ff;
  font-variant-numeric: tabular-nums;
}
</style>
