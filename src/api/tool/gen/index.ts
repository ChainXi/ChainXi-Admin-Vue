import http from '@/utils/request'

// 查询生成表数据
export function listTable(query): Promise<ResponseResult> {
  return http.get('/tool/gen/list', query)
}
// 查询db数据库列表
export function listDbTable(query): Promise<ResponseResult> {
  return http.get('/tool/gen/db/list', query)
}

// 查询表详细信息
export function getGenTable(tableId: string): Promise<ResponseResult> {
  return http.get('/tool/gen/' + tableId)
}

// 修改代码生成信息
export function updateGenTable(data): Promise<ResponseResult> {
  return http.put('/tool/gen', data)
}

// 导入表
export function importTable(data): Promise<ResponseResult> {
  return http.post('/tool/gen/importTable', data)
}

// 创建表
export function createTable(data): Promise<ResponseResult> {
  return http.post('/tool/gen/createTable', data)
}

// 预览生成代码
export function previewTable(tableId: string): Promise<ResponseResult> {
  return http.get('/tool/gen/preview/' + tableId)
}

// 删除表数据
export function delTable(tableId: string): Promise<ResponseResult> {
  return http.delete('/tool/gen/' + tableId)
}

// 生成代码（自定义路径）
export function genCode(tableName: string): Promise<ResponseResult> {
  return http.get('/tool/gen/genCode/' + tableName)
}

// 同步数据库
export function synchDb(tableName: string): Promise<ResponseResult> {
  return http.get('/tool/gen/synchDb/' + tableName)
}

export function batchGenCode(tables: string | string[]): Promise<ResponseResult> {
  return http.download('/tool/gen/batchGenCode', { tables })
}
