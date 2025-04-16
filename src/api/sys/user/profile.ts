import http from '@/utils/request'
import * as FileApi from '@/api/file'
import { AxiosRequestConfig } from 'axios'

export interface ProfileVO {
  id: number
  userName: string
  nickName: string
  roles: {
    id: number
    name: string
  }[]
  socialUsers: {
    type: number
    openid: string
  }[]
  email: string
  phoneNumber: string
  sex: number
  avatar: string
  status: number
  remark: string
  loginIp: string
  loginDate: Date
  createTime: Date
}

export interface UserProfileUpdateReqVO {
  nickName: string
  email: string
  phoneNumber: string
  sex: number
}
export interface AvatarReqVo {
  file: Blob
}

// 查询用户个人信息
export const getUserProfile = (): Promise<ResponseResult<ProfileVO>> => {
  return http.get('/sys/user/profile/get')
}

// 修改用户个人信息
export const updateUserProfile = (data: UserProfileUpdateReqVO) => {
  return http.put('/sys/user/profile/update', data)
}

// 用户密码重置
export const updateUserPassword = (oldPassword: string, newPassword: string, trace: string) => {
  return http.put('/sys/user/profile/update-password', { oldPassword, newPassword, trace })
}

// 用户头像上传
export const uploadAvatar = async (data: Blob): Promise<ResponseResult> => {
  const option: AxiosRequestConfig = { headers: { 'Content-Type': 'text/plain' } }
  return http.post('/sys/user/profile/update-avatar', await FileApi.uploadFile(data), option)
}
