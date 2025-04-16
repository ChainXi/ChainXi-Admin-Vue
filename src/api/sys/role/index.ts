import http from '@/utils/request'

export interface RoleVO {
  id: number
  name: string
  code: string
  sort: number
  status: number
  remark: string
  dataScope: number
  createTime: Date
}

export interface UpdateStatusReqVO {
  id: number
  status: number
}

// 查询角色详情
export const getRole = (id: number) => {
  return http.get('/sys/role/query', { id })
}

// 查询角色列表
export const getRolePage = (params: PageParam): Promise<ResponseResult<PageResult<RoleVO[]>>> => {
  return http.get('/sys/role/query-page', params)
}

// 查询角色（精简)列表
export const getIndexMapRoleList = (): Promise<ResponseResult<RoleVO[]>> => {
  return http.get('/sys/role/query-index-map')
}

// 新增角色
export const createRole = (data: RoleVO) => {
  return http.post('/sys/role/create', data)
}

// 修改角色
export const updateRole = (data: RoleVO) => {
  return http.put('/sys/role/update', data)
}

// 修改角色状态
export const updateRoleStatus = (data: UpdateStatusReqVO) => {
  return http.put('/sys/role/update-status', data)
}

// 删除角色
export const deleteRole = (id: number) => {
  return http.delete('/sys/role/delete', { id })
}

// 导出角色
export const exportRole = (params: any) => {
  return http.download('/sys/role/export', params)
}
