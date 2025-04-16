import http from '@/utils/request'

export type DictDataUpdateReqVo = {
  id: string | undefined
  sort: number
  label: string
  value: string
  dictType: string
  status: number
  colorType: string
  cssClass: string
  remark: string
}

export type DictDataRespVo = {
  id: string
  sort: number
  label: string
  value: string
  dictType: string
  status: number
  colorType: string
  cssClass: string
  remark: string
  createTime: Date
}

export type DictDataSimpleRespVo = {
  dictType: string
  label: string
  value: string
  colorType: string
  cssClass: string
}

// 查询字典数据详情
export const getDictData = (id: string): Promise<ResponseResult<DictDataRespVo>> => {
  return http.get('/sys/dict-data/query', { id })
}

// 查询字典数据（精简)列表
export const listSimpleDictData = (): Promise<ResponseResult<DictDataSimpleRespVo[]>> => {
  return http.get('/sys/dict-data/query-index-map')
}

// 查询字典数据列表
export const getDictDataPage = (params: PageParam): Promise<ResponseResult<PageResult<DictDataRespVo>>> => {
  return http.get('/sys/dict-data/query-page', params)
}

// 新增字典数据
export const createDictData = (data: DictDataUpdateReqVo): Promise<ResponseResult<number>> => {
  return http.post('/sys/dict-data/create', data)
}

// 修改字典数据
export const updateDictData = (data: DictDataUpdateReqVo): Promise<ResponseResult<boolean>> => {
  return http.put('/sys/dict-data/update', data)
}

// 删除字典数据
export const deleteDictData = (id: number): Promise<ResponseResult<boolean>> => {
  return http.delete('/sys/dict-data/delete', { id })
}

// 导出字典类型数据
export const exportDictData = (params): Promise<ResponseResult> => {
  return http.download('/sys/dict-data/export', params)
}
