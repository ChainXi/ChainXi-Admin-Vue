import http from '@/utils/request'

export interface UserRespVo {
  id: string
  userName: string
  nickName: string
  deptId: string
  email: string
  phoneNumber: string
  sex: number
  avatar: string
  remark: string
  status: number
  loginIp: string
  loginDate: Date
  createTime: Date
}

export interface UserCreateReqVo {
  userName: string
  nickName: string
  password: string
  deptId: string
  email: string
  phoneNumber: string
  sex: number
  status: number
  remark: string
}

export interface UserUpdateReqVo {
  id: string
  userName: string
  password?: string
  nickName: string
  deptId: string
  email: string
  phoneNumber: string
  sex: number
  avatar: string
  status: number
  remark: string
}
export interface UserIndexMapVo {
  id: string
  userName: string
  nickName: string
}
export interface UserIndexMapPageReqVo extends PageParam {
  name: string
}

// 查询用户详情
export const getUser = (id: number): Promise<ResponseResult<UserRespVo>> => {
  return http.get('/sys/user/query', { id })
}

// 查询用户分页
export const getUserList = (params: PageParam): Promise<ResponseResult<PageResult<UserRespVo>>> => {
  return http.get('/sys/user/query-page', params)
}

// 获取用户精简信息列表
export const getIndexMapUserList = (params: UserIndexMapPageReqVo): Promise<ResponseResult<PageResult<UserIndexMapVo>>> => {
  return http.get('/sys/user/query-index-map-page', params)
}

// 新增用户
export const createUser = (data: UserUpdateReqVo) => {
  return http.post('/sys/user/create', data)
}

// 修改用户
export const updateUser = (data: UserUpdateReqVo) => {
  return http.put('/sys/user/update', data)
}

// 用户密码重置
export const resetUserPwd = (id: string, password: string) => {
  return http.put('/sys/user/update-password', { id, password })
}

// 用户状态修改
export const updateUserStatus = (id: string, status: number) => {
  return http.put('/sys/user/update-status', { id, status })
}

// 删除用户
export const deleteUser = (id: string) => {
  return http.delete('/sys/user/delete', { id })
}

// 导出用户
export const exportUser = (params) => {
  return http.download('/sys/user/export', params)
}

// 下载用户导入模板
export const importUserTemplate = () => {
  return http.download('/sys/user/download-import-template')
}
