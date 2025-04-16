import { RequestMethod } from '@/utils/constants'
import http from '@/utils/request'

export interface SysResourceVo {
  id: number
  name: string
  patterns: string
  methods: RequestMethod[]
  description: string
  categoryId: string
  mappingType: ResourceMappingType
  accessType: ResourceAccessType
}

export enum ResourceMappingType {
  BUCKET,
  BLOCK
}
export enum ResourceAccessType {
  AUTHORIZATION,
  AUTHENTICATION,
  ANONYMOUS
}

export const queryAllResource = (): Promise<ResponseResult<SysResourceVo[]>> => {
  return http.get('/sys/resource/query-all')
}

export const getResource = (id: number): Promise<ResponseResult<SysResourceVo>> => {
  return http.get('/sys/resource/query', { id })
}

export const getResourcePage = (params: PageParam): Promise<ResponseResult<PageResult<SysResourceVo>>> => {
  return http.get('/sys/resource/query-page', params)
}

// 更新
export const updateResource = (req: SysResourceVo) => {
  return http.post('/sys/resource/update', req)
}
// 创建
export const createResource = (req: SysResourceVo) => {
  return http.put('/sys/resource/create', req)
}

// 删除
export const deleteResourceById = (name: string) => {
  return http.delete('/sys/resource/delete', { name })
}

