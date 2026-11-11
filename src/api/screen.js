import { http, useMock } from './request'
import { fetchMock } from '@/mock/dashboard'

function request(url, params, mockName) {
  if (useMock) {
    return fetchMock(mockName, params)
  }
  return http.get(url, { params })
}

export function buildParams(filters = {}) {
  const params = {
    startTime: filters.startTime,
    endTime: filters.endTime
  }
  if (filters.buildingId) params.buildingId = filters.buildingId
  if (filters.deviceType && filters.deviceType !== 'all') params.deviceType = filters.deviceType
  if (filters.warnLevel && filters.warnLevel !== 'all') params.warnLevel = filters.warnLevel
  return params
}

export function getKpi(params) {
  return request('/api/dashboard/kpi', params, 'kpi')
}

export function getEnergyTrend(params) {
  return request('/api/dashboard/energy/trend', params, 'energyTrend')
}

export function getBuildingRank(params) {
  return request('/api/dashboard/energy/building-rank', params, 'buildingRank')
}

export function getEnergyRatio(params) {
  return request('/api/dashboard/energy/ratio', params, 'energyRatio')
}

export function getSecurityStats(params) {
  return request('/api/dashboard/security/stats', params, 'securityStats')
}

export function getFireStats(params) {
  return request('/api/dashboard/fire/stats', params, 'fireStats')
}

export function getDeviceStatus(params) {
  return request('/api/dashboard/device/status', params, 'deviceStatus')
}

export function getWarnList(params) {
  return request('/api/warn/list', params, 'warnList')
}

export function getWorkOrderList(params) {
  return request('/api/workorder/list', params, 'workOrderList')
}

export function getDeviceDetail(params) {
  return request('/api/device/detail', params, 'deviceDetail')
}

export function confirmAlarm(params) {
  if (useMock) return fetchMock('confirmAlarm', params)
  return http.post('/api/warn/confirm', params)
}

export function createWorkOrder(params) {
  if (useMock) return fetchMock('createWorkOrder', params)
  return http.post('/api/workorder/create', params)
}