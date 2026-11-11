<template>
  <div class="list-wrap">
    <div class="list-head">
      <span>工单编号</span>
      <span>关联位置</span>
      <span>工单类型</span>
      <span>等级</span>
      <span>当前状态</span>
      <span>指派人员</span>
      <span>上报时间</span>
      <span>预计完成</span>
    </div>
    <div class="list-body">
      <div v-if="store.state.loading.workOrders && !rows.length" class="list-state">数据加载中…</div>
      <div v-else-if="store.state.error.workOrders" class="list-state is-error">
        {{ store.state.error.workOrders }}
      </div>
      <div v-else-if="!rows.length" class="list-state">暂无巡检工单</div>
      <template v-else>
        <div
          v-for="row in rows"
          :key="row.id"
          class="list-row"
          :class="{ 'is-timeout': row.status === 'timeout' }"
          @click="onRowClick(row)"
        >
          <span class="cell id-cell">{{ row.id }}</span>
          <span class="cell">{{ row.location }}</span>
          <span class="cell">{{ row.typeName }}</span>
          <span class="cell">
            <i class="level-tag" :class="`is-${row.level}`">{{ row.levelName }}</i>
          </span>
          <span class="cell" :class="`status-${row.status}`">{{ row.statusName }}</span>
          <span class="cell">{{ row.assignee }}</span>
          <span class="cell time-cell">{{ row.reportTime?.slice(5, 16) }}</span>
          <span class="cell time-cell">{{ row.expectTime?.slice(5, 16) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { screenStore } from '@/store/screenStore'

const store = screenStore
const rows = computed(() => store.state.workOrders || [])

const onRowClick = (row) => {
  store.focusLocation({
    buildingId: row.buildingId,
    buildingName: row.buildingName,
    floor: row.floor,
    deviceId: row.deviceId
  })
}
</script>

<style scoped>
.list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.list-head,
.list-row {
  display: grid;
  grid-template-columns: 16% 14% 12% 7% 11% 10% 15% 15%;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.list-head {
  height: 28px;
  flex: none;
  padding: 0 8px;
  color: #6f8db4;
  background: rgba(20, 58, 110, 0.45);
  border-bottom: 1px solid rgba(64, 150, 255, 0.2);
}

.list-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 8px;
}

.list-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 13px;
  color: var(--screen-text-muted);
}

.list-state.is-error {
  color: var(--status-danger);
}

.list-row {
  height: 30px;
  border-bottom: 1px dashed rgba(64, 150, 255, 0.12);
  color: #b6d0ee;
  cursor: pointer;
  transition: background 0.15s;
}

.list-row:hover {
  background: rgba(0, 150, 220, 0.14);
}

.list-row.is-timeout {
  background: rgba(255, 77, 79, 0.08);
}

.cell {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.id-cell {
  color: #7fa4cf;
  font-variant-numeric: tabular-nums;
}

.time-cell {
  color: #8fb2d9;
  font-variant-numeric: tabular-nums;
}

.level-tag {
  display: inline-block;
  padding: 0 4px;
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

.status-pending {
  color: #ffc53d;
}

.status-processing {
  color: #00d4ff;
}

.status-done {
  color: #00c48c;
}

.status-closed {
  color: #86909c;
}

.status-timeout {
  color: #ff4d4f;
  font-weight: 600;
}
</style>