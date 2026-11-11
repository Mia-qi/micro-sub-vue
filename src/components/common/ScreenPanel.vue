<template>
  <section class="screen-panel">
    <div class="panel-head">
      <span class="panel-mark"></span>
      <span class="panel-title">{{ title }}</span>
      <span v-if="subtitle" class="panel-sub">{{ subtitle }}</span>
      <div class="panel-extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
})
</script>

<style scoped>
.screen-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: linear-gradient(180deg, rgba(18, 42, 80, 0.55), rgba(7, 20, 40, 0.36));
  border: 1px solid rgba(64, 150, 255, 0.24);
  box-shadow: inset 0 0 24px rgba(24, 92, 190, 0.14);
}

.screen-panel::before,
.screen-panel::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: rgba(0, 212, 255, 0.7);
  border-style: solid;
  pointer-events: none;
}

.screen-panel::before {
  top: -1px;
  left: -1px;
  border-width: 2px 0 0 2px;
}

.screen-panel::after {
  right: -1px;
  bottom: -1px;
  border-width: 0 2px 2px 0;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border-bottom: 1px solid rgba(64, 150, 255, 0.16);
  background: linear-gradient(90deg, rgba(24, 74, 148, 0.36), rgba(24, 74, 148, 0));
  flex: none;
}

.panel-mark {
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #00d4ff, #2f7cff);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.8);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #e6f2ff;
}

.panel-sub {
  font-size: 12px;
  color: #6f8db4;
}

.panel-extra {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-body {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 8px 12px 10px;
}
</style>
