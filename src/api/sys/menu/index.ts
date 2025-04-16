import http from '@/utils/request'

export const getMenu = (id: string): Promise<ResponseResult<SysMenuRespVo>> => {
  return http.get('/sys/menu/query', { id })
}
export const getMenuList = (data: SysMenuListReqVo): Promise<ResponseResult<SysMenuRespVo[]>> => {
  return http.get('/sys/menu/query-list', data)
}
export const getIndexMapMenusList = (): Promise<ResponseResult<SysMenuSimpleRespVo[]>> => {
  return http.get('/sys/menu/query-index-map')
}
export const saveMenu = (data: SysMenuUpdateReqVo): Promise<ResponseResult> => {
  return http.post('/sys/menu/create', data)
}
export const updateMenu = (data: SysMenuUpdateReqVo): Promise<ResponseResult> => {
  return http.put('/sys/menu/update', data)
}
export const deleteMenu = (id: string): Promise<ResponseResult> => {
  return http.delete('/sys/menu/delete', { id })
}

export enum MenuType {
  MENU = 0,
  PAGE = 1,
  BUTTON = 2
}

export type SysMenuRespVo = {
  id: string
  pid: string
  name: string
  type: MenuType
  routerPath: string
  componentPath: string
  resourceIds: number[]
  sort: number
  icon: string
  keepAlive: boolean
  status: number
}

export type SysMenuSimpleRespVo = {
  id: string
  pid: string
  name: string
  type: MenuType
}

export type SysMenuListReqVo = {
  name: string
  rooId: string
  status: number
}

export type SysMenuUpdateReqVo = {
  id: string
  pid: string
  name: string
  type: MenuType
  routerPath: string
  componentPath: string
  perPath: string
  sort: number
  status: number
  icon: string
}
