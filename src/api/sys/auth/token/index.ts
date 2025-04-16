import http from '@/utils/request'

export interface OAuth2TokenVO {
  id: number
  accessToken: string
  refreshToken: string
  userId: number
  userType: number
  clientId: string
  createTime: Date
  expiresTime: Date
}

// 查询 token列表
export const getAccessTokenPage = (params: PageParam): Promise<ResponseResult<PageResult<OAuth2TokenVO>>> => {
  return http.get('/system/oauth2-token/page', params)
}

// 删除 token
export const deleteRAToken = (rt: string) => {
  return http.delete('/system/oauth2-token/delete', { rt })
}
