<template>
  <div class="base-chart">
    <div ref="elRef" class="chart-canvas"></div>
    <div v-if="showPlaceholder" class="chart-state">
      <span v-if="loading" class="state-text">数据加载中…</span>
      <span v-else-if="error" class="state-text is-error">{{ error }}</span>
      <span v-else class="state-text">{{ emptyText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useEChart } from '@/composables/useEChart'

const props = defineProps({
  option: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  empty: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无数据' }
})

const emit = defineEmits(['chart-click'])

const elRef = ref(null)
const lastOption = ref(null)

const { setOption, resize } = useEChart(elRef, {
  onClick: (params) => emit('chart-click', params)
})

const showPlaceholder = computed(() => props.loading || !!props.error || props.empty)

const apply = async () => {
  if (!props.option) return
  lastOption.value = props.option
  setOption(props.option, false)
  await nextTick()
  resize()
}

watch(() => props.option, apply, { deep: true })

watch(showPlaceholder, async (value) => {
  if (value) return
  if (lastOption.value) setOption(lastOption.value, false)
  await nextTick()
  resize()
})

onMounted(apply)
</script>

<style scoped>
.base-chart {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.chart-canvas {
  position: absolute;
  inset: 0;
}

.chart-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-text {
  color: #5f7ea6;
  font-size: 14px;
  letter-spacing: 1px;
}

.state-text.is-error {
  color: #ff4d4f;
}
</style>
