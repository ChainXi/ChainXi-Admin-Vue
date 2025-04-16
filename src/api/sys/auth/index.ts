import http from '@/utils/request'

export const authorize = (redirect: string, clientId: string): Promise<ResponseResult<string>> => {
  return http.get('/sys/auth/authorize', { clientId, redirect })
}

export const getInfo = (rootId: string): Promise<ResponseResult<AuthVo>> => {
  return http.get('/sys/auth/query', { rootId })
}

export const queryPubKey = (): Promise<ResponseResult<string>> => {
  return http.get('/sys/auth/query-pub-key')
}

export const queryCaptcha = (): Promise<ResponseResult<CaptchaRespVo>> => {
  return http.get('/sys/auth/query-captcha')
}

export const refreshToken = (rt: string): Promise<ResponseResult<TokenType>> => {
  return http.get('/sys/auth/refresh-token', { rt })
}

export const login = (data: UserLoginVO): Promise<ResponseResult<TokenType>> => {
  return http.post('/sys/auth/login', data)
}

export const logout = () => {
  return http.post('/sys/auth/logout')
}

// 查询角色拥有的菜单权限
export const getRoleMenuList = async (roleId: number) => {
  return await http.get('/sys/auth/query-role-menus', { roleId })
}

// 赋予角色菜单权限
export const assignRoleMenu = async (data: PermissionAssignRoleMenuReqVO) => {
  return await http.post('/sys/auth/assign-role-menu', data)
}

// 赋予角色数据权限
export const assignRoleDataScope = async (data: PermissionAssignRoleDataScopeReqVO) => {
  return await http.post('/sys/auth/assign-role-data-scope', data)
}

// 查询用户拥有的角色数组
export const getUserRoleList = async (userId: string) => {
  return await http.get('/sys/auth/query-user-roles', { userId })
}

// 赋予用户角色
export const assignUserRole = async (data: PermissionAssignUserRoleReqVO) => {
  return await http.post('/sys/auth/assign-user-role', data)
}

export type UserLoginVO = {
  userName: string
  password: string
  trace: string
  captcha: string
  uuid: string
}

export type TokenType = {
  id: number // 编号
  accessToken: string // 访问令牌
  refreshToken: string // 刷新令牌
  userId: number // 用户编号
  userType: number //用户类型
  clientId: string //客户端编号
  expiresTime: number //过期时间
}

export type AuthVo = {
  nickName: string
  avatar: string
  menus: AppCustomRouteRecordRaw[]
}

export type PermissionAssignUserRoleReqVO = {
  userId: number
  roleIds: number[]
}

export type PermissionAssignRoleMenuReqVO = {
  roleId: number
  menuIds: AssignMenu[]
}

export type AssignMenu = {
  menuId: number | string
  mappingType: number
}

export type PermissionAssignRoleDataScopeReqVO = {
  roleId: number
  dataScope: number
}

export type CaptchaRespVo = {
  uuid: string
  image: string
}
