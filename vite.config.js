import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174, // 固定端口
    strictPort: true,
    cors: true, // 允许主应用跨域请求
    origin: 'http://localhost:5174' // 强制资源绝对路径
  }
})