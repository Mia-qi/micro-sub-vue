import axios from 'axios'

let screenToken = null

export function setScreenToken(token) {
  screenToken = token || null
}

export const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use((config) => {
  if (screenToken) {
    config.headers.Authorization = `Bearer ${screenToken}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code !== 200 && body.code !== 0) {
        return Promise.reject(new Error(body.message || '接口异常'))
      }
      return body.data
    }
    return body
  },
  (error) => {
    const message = error?.response?.status
      ? `接口异常（${error.response.status}）`
      : '数据加载失败'
    return Promise.reject(new Error(message))
  }
)