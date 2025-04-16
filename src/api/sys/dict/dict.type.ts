import http from '@/utils/request'

export type DictTypeRespVo = {
  id: number
  name: string
  type: string
  status: number
  remark: string
  createTime: Date
}

export type DictTypeSimpleRespVo = {
  id: number
  name: string
  type: string
}

export type DictTypeSaveReqVo = {
  id: string | undefined
  name: string
  type: string
  status: number
  remark: string
}

export type DictTypeExportReqVo = {
  id: string
  name: string
  status: number
  createTime: Date[]
}
// 查询字典详情
export const getDictType = (id: number): Promise<ResponseResult<DictTypeRespVo>> => {
  return http.get('/sys/dict-type/query', { id })
}

// 查询字典列表
export const getDictTypePage = (params: PageParam): Promise<ResponseResult<PageResult<DictTypeRespVo>>> => {
  return http.get('/sys/dict-type/query-page', params)
}

// 查询字典（精简)列表
export const getIndexMapDictTypeList = (): Promise<ResponseResult<DictTypeSimpleRespVo[]>> => {
  return http.get('/sys/dict-type/query-index-map')
}

// 新增字典
export const createDictType = (data: DictTypeSaveReqVo): Promise<ResponseResult<string>> => {
  return http.post('/sys/dict-type/create', data)
}

// 修改字典
export const updateDictType = (data: DictTypeSaveReqVo): Promise<ResponseResult<boolean>> => {
  return http.put('/sys/dict-type/update', data)
}

// 删除字典
export const deleteDictType = (id: string): Promise<ResponseResult<boolean>> => {
  return http.delete('/sys/dict-type/delete', { id })
}
// 导出字典类型
export const exportDictType = (params: DictTypeExportReqVo): Promise<ResponseResult<void>> => {
  return http.download('/sys/dict-type/export', params)
}
