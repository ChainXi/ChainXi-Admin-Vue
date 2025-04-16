import http from '@/utils/request'

export interface SysCacheInfoDo {
  id: number
  name: string
  localExpireTime: number
  remoteExpireTime: number
  remark: string
}

export const getCacheInfo = (name: string): Promise<ResponseResult<SysCacheInfoDo>> => {
  return http.get('/sys/cache-info/query', { name })
}

export const getCacheInfoPage = (params: PageParam): Promise<ResponseResult<PageResult<SysCacheInfoDo>>> => {
  return http.get('/sys/cache-info/query-page', params)
}

export const updateCacheInfo = (req: SysCacheInfoDo) => {
  return http.post('/sys/cache-info/update', req)
}

export const createCacheInfo = (req: SysCacheInfoDo) => {
  return http.put('/sys/cache-info/create', req)
}

export const deleteCacheInfoByName = (name: string) => {
  return http.delete('/sys/cache-info/delete-cache-info', { name })
}

export const resetCache = (name: string) => {
  return http.delete('/sys/cache-info/reset-cache', { name })
}
