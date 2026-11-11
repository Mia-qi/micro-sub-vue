<template>
  <div class="screen-app">
    <router-view />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background: #030a1a;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.screen-app {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
</style>
