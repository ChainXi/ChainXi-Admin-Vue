import http from '@/utils/request'
import { CommonStatusEnum } from '@/utils/constants'
import { UserIndexMapVo } from '@/api/sys/user'

export interface SysDeptMapRespVo {
  id: string
  deptName: string
}

export interface SysDeptDetailRespVo {
  id: string
  deptName: string
  leader: UserIndexMapVo
  sort: number
  status: CommonStatusEnum
}
export interface SysDeptRespVo {
  id: string
  deptName: string
  leaderName: string
  sort: number
  status: CommonStatusEnum
}

export interface DeptCreateReqVo {
  deptName: string
  pid: string
  leaderId: string
  sort: number
}

export interface DeptQueryReqVo {
  deptName: string
  status: CommonStatusEnum
}

export interface DeptUpdateReqVo {
  id: string
  deptName: string
  leaderId: string
  sort: number
}

export interface DeptUpdateStatusReqVo {
  id: string
  status: CommonStatusEnum
}

export const getDeptDetail = (id: string): Promise<ResponseResult<SysDeptDetailRespVo>> => {
  return http.get('/sys/dept/query', { id })
}
export const getIndexMapDeptList = (): Promise<ResponseResult<SysDeptMapRespVo[]>> => {
  return http.get('/sys/dept/query-index-map')
}
export const queryAllDept = (params: DeptQueryReqVo): Promise<ResponseResult<SysDeptRespVo[]>> => {
  return http.get('/sys/dept/query-all', params)
}
export const createDept = (param: DeptCreateReqVo): Promise<ResponseResult> => {
  return http.post('/sys/dept/create', param)
}
export const updateDept = (param: DeptUpdateReqVo): Promise<ResponseResult> => {
  return http.put('/sys/dept/update', param)
}
export const updateDeptStatus = (param: DeptUpdateStatusReqVo): Promise<ResponseResult<number>> => {
  return http.put('/sys/dept/update-status', param)
}
export const deleteDept = (id: string): Promise<ResponseResult<number>> => {
  return http.delete('/sys/dept/delete', { id })
}
