import http from '@/utils/request'

export interface DataPermissionDeptMatcherRespVo {
  matchType: DataPermissionDeptMatchBucketType
  target: string[]
}
export interface DataPermissionDeptMatcherUpdateReqVo {
  userId: string
  matchType: DataPermissionDeptMatchBucketType
  target: string[]
}
export enum DataPermissionDeptMatchBucketType {
  ALL = 0,
  SUB_NODES = 1,
  CURRENT_NODE = 2
}

export const select = (userId: string): Promise<ResponseResult<DataPermissionDeptMatcherRespVo>> => {
  return http.get('/sys/data-permission-user-dept/query', { userId })
}

export const update = (params: DataPermissionDeptMatcherUpdateReqVo): Promise<ResponseResult<void>> => {
  return http.post('/sys/data-permission-user-dept/update', params)
}
