import http from '@/utils/request'

export enum StorageCacheEnum {
  CAFFEINE = 0,
  REDIS = 1
}
export interface CacheExpireTime {
  storageCache: StorageCacheEnum
  expireTime: number
}

export interface SysCacheInfoDo {
  id?: number
  name: string
  expireTimes: CacheExpireTime[]
  remark?: string
}

export const getCacheInfo = (name: string): Promise<ResponseResult<SysCacheInfoDo>> => {
  return http.get('/sys/cache-info/query', { name }).then((r: any) => {
    const data = r.data
    const et = (data as any).expireTimes
    if (et && !Array.isArray(et)) {
      const arr: CacheExpireTime[] = []
      Object.keys(et).forEach((k) => {
        const v = et[k]
  if (k === '0') arr.push({ storageCache: StorageCacheEnum.CAFFEINE, expireTime: Math.floor(v / 1000) })
  else if (k === '1') arr.push({ storageCache: StorageCacheEnum.REDIS, expireTime: Math.floor(v / 1000) })
      })
      ;(data as any).expireTimes = arr
    }
    return { ...r, data }
  })
}

export const getCacheInfoPage = (params: PageParam): Promise<ResponseResult<PageResult<SysCacheInfoDo>>> => {
  return http.get('/sys/cache-info/query-page', params).then((r: any) => {
    const list = r.data?.list || []
    list.forEach((item: any) => {
      const et = item.expireTimes
      if (et && !Array.isArray(et)) {
        const arr: CacheExpireTime[] = []
        Object.keys(et).forEach((k) => {
          const v = et[k]
          if (k === '0') arr.push({ storageCache: StorageCacheEnum.CAFFEINE, expireTime: Math.floor(v / 1000) })
          else if (k === '1') arr.push({ storageCache: StorageCacheEnum.REDIS, expireTime: Math.floor(v / 1000) })
        })
        item.expireTimes = arr
      }
    })
    return r
  })
}

export const updateCacheInfo = (req: SysCacheInfoDo) => {
  const body: any = { ...req }
  if (Array.isArray(req.expireTimes)) {
    const map: Record<string, number> = {}
    req.expireTimes.forEach((e) => {
      if (e.storageCache === StorageCacheEnum.CAFFEINE) map['0'] = e.expireTime * 1000
      else if (e.storageCache === StorageCacheEnum.REDIS) map['1'] = e.expireTime * 1000
    })
    body.expireTimes = map
  }
  return http.post('/sys/cache-info/update', body)
}

export const createCacheInfo = (req: SysCacheInfoDo) => {
  const body: any = { ...req }
  if (Array.isArray(req.expireTimes)) {
    const map: Record<string, number> = {}
    req.expireTimes.forEach((e) => {
      if (e.storageCache === StorageCacheEnum.CAFFEINE) map['0'] = e.expireTime * 1000
      else if (e.storageCache === StorageCacheEnum.REDIS) map['1'] = e.expireTime * 1000
    })
    body.expireTimes = map
  }
  return http.put('/sys/cache-info/create', body)
}

export const deleteCacheInfoByName = (name: string) => {
  return http.delete('/sys/cache-info/delete-cache-info', { name })
}

export const resetCache = (name: string) => {
  return http.delete('/sys/cache-info/reset-cache', { name })
}
