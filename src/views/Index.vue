<template>
  <div class="screen-root">
    <div class="screen-canvas" :style="canvasStyle">
      <TopBar />
      <AlarmMarquee class="marquee-bar" />

      <main class="screen-body">
        <aside class="col-left">
          <ScreenPanel class="kpi-panel" title="核心指标概览" :subtitle="kpiSubtitle">
            <KpiCards />
          </ScreenPanel>

          <EnergyTrendChart class="trend-panel" />

          <div class="left-split">
            <BuildingRankChart />
            <EnergyRatioChart />
          </div>
        </aside>

        <section class="col-right">
          <div class="right-top">
            <SecurityStats />
            <FireStats />
            <DeviceStatusChart />
          </div>
          <BottomPanel class="right-bottom" />
        </section>
      </main>

      <DeviceDetailModal />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import AlarmMarquee from '@/components/layout/AlarmMarquee.vue'
import TopBar from '@/components/layout/TopBar.vue'
import BottomPanel from '@/components/dashboard/BottomPanel.vue'
import BuildingRankChart from '@/components/dashboard/BuildingRankChart.vue'
import DeviceDetailModal from '@/components/dashboard/DeviceDetailModal.vue'
import DeviceStatusChart from '@/components/dashboard/DeviceStatusChart.vue'
import EnergyRatioChart from '@/components/dashboard/EnergyRatioChart.vue'
import EnergyTrendChart from '@/components/dashboard/EnergyTrendChart.vue'
import FireStats from '@/components/dashboard/FireStats.vue'
import KpiCards from '@/components/dashboard/KpiCards.vue'
import SecurityStats from '@/components/dashboard/SecurityStats.vue'
import ScreenPanel from '@/components/common/ScreenPanel.vue'
import { useScreenScale } from '@/composables/useScreenScale'
import { screenStore } from '@/store/screenStore'

const store = screenStore
const { scale } = useScreenScale(1920, 1080)

const canvasStyle = computed(() => ({
  transform: `translate(-50%, -50%) scale(${scale.value})`
}))

const kpiSubtitle = computed(() =>
  store.state.kpi?.updateTime ? `数据更新于 ${store.state.kpi.updateTime.slice(11)}` : '实时汇总'
)

onMounted(() => {
  store.fetchAll()
  store.startAutoRefresh()
})

onUnmounted(() => {
  store.stopAutoRefresh()
})
</script>

<style scoped>
.screen-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(0, 90, 180, 0.35), transparent 70%),
    radial-gradient(900px 500px at 10% 100%, rgba(0, 60, 140, 0.25), transparent 70%),
    linear-gradient(180deg, #04122a 0%, #020a18 60%, #010610 100%);
}

.screen-root::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(40, 110, 200, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(40, 110, 200, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}

.screen-canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1920px;
  height: 1080px;
  transform-origin: center center;
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px;
}

.marquee-bar {
  margin: 12px 0;
}

.screen-body {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

.col-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 640px;
  flex: none;
  min-height: 0;
}

.kpi-panel {
  height: 282px;
  flex: none;
}

.trend-panel {
  flex: 1;
  min-height: 0;
}

.left-split {
  display: flex;
  gap: 16px;
  height: 330px;
  flex: none;
  min-height: 0;
}

.left-split > * {
  flex: 1;
  min-width: 0;
}

.col-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.right-top {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  height: 340px;
  flex: none;
  min-height: 0;
}

.right-top > * {
  min-width: 0;
  min-height: 0;
}

.right-bottom {
  flex: 1;
  min-height: 0;
}
</style>
