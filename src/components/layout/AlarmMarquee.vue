<template>
  <div class="marquee">
    <div class="marquee-label">
      <i class="dot"></i>
      高危告警
    </div>
    <div class="marquee-view">
      <div v-if="!items.length" class="marquee-empty">当前筛选范围内暂无高危告警</div>
      <div v-else class="marquee-track" :style="{ animationDuration: `${items.length * 14}s` }">
        <span
          v-for="(item, index) in loopItems"
          :key="`${item.id}-${index}`"
          class="marquee-item"
          @click="onClick(item)"
        >
          <span class="item-time">{{ item.time }}</span>
          <span class="item-loc">{{ item.location }}</span>
          <span class="item-device">{{ item.deviceName }}</span>
          <span class="item-content">{{ item.typeName }} · {{ item.content }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { screenStore } from '@/store/screenStore'

const store = screenStore

const items = computed(() => (store.state.alarms || []).filter((item) => item.level === 'high').slice(0, 10))

const loopItems = computed(() => (items.value.length ? [...items.value, ...items.value] : []))

const onClick = (item) => {
  store.focusLocation({
    buildingId: item.buildingId,
    buildingName: item.buildingName,
    floor: item.floor,
    deviceId: item.deviceId
  })
}
</script>

<style scoped>
.marquee {
  display: flex;
  align-items: center;
  height: 34px;
  flex: none;
  background: linear-gradient(90deg, rgba(120, 20, 30, 0.35), rgba(30, 12, 26, 0.2));
  border: 1px solid rgba(255, 77, 79, 0.3);
}

.marquee-label {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 14px;
  flex: none;
  font-size: 13px;
  font-weight: 600;
  color: #ff6b6b;
  letter-spacing: 1px;
  background: rgba(255, 77, 79, 0.16);
  border-right: 1px solid rgba(255, 77, 79, 0.3);
}

.marquee-label .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff4d4f;
  box-shadow: 0 0 8px rgba(255, 77, 79, 0.9);
  animation: blink 1.4s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

.marquee-view {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.marquee-empty {
  padding-left: 16px;
  font-size: 13px;
  color: var(--screen-text-muted);
}

.marquee-track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: marquee-move linear infinite;
  will-change: transform;
}

.marquee-track:hover {
  animation-play-state: paused;
}

@keyframes marquee-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.marquee-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  font-size: 13px;
  color: #ffb3b3;
  cursor: pointer;
  border-right: 1px dashed rgba(255, 77, 79, 0.25);
  white-space: nowrap;
}

.marquee-item:hover {
  color: #fff;
}

.item-time {
  color: #ff9a9a;
  font-variant-numeric: tabular-nums;
}

.item-loc {
  color: #ffd08a;
}

.item-device {
  color: #cfe4ff;
}

.item-content {
  color: #ff6b6b;
  font-weight: 600;
}
</style>
