import http from '@/utils/request'

/**
 * 获取redis 监控信息
 */
export const getCache = () => {
  return http.get('/infra/redis/get-monitor-info')
}
