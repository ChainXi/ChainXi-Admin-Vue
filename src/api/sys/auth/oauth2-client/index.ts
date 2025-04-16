import http from '@/utils/request'

export interface OAuth2ClientDo {
  clientId: number
  name: string
  secret: string
  origin: string
  logoutCall: string
  description: string
}

export interface OAuth2ClientInfoPageReqVo {
  name: string
}

export interface Oauth2ClientInfoUpdateReqVo {
  clientId: number
  name: string
  origin: string
  logoutCall: string
  description: string
}

export const query = (clientId: number): Promise<ResponseResult<OAuth2ClientDo>> => {
  return http.get('/sys/oauth2-client/query', { clientId })
}

export const queryPage = (reqVo: OAuth2ClientInfoPageReqVo): Promise<ResponseResult<PageResult<OAuth2ClientDo>>> => {
  return http.get('/sys/oauth2-client/query-page', reqVo)
}

export const createClientInfo = (reqVo: Oauth2ClientInfoUpdateReqVo): Promise<ResponseResult> => {
  return http.put('/sys/oauth2-client/create', reqVo)
}
export const updateClientInfo = (reqVo: Oauth2ClientInfoUpdateReqVo): Promise<ResponseResult> => {
  return http.post('/sys/oauth2-client/update', reqVo)
}
export const deleteClientInfoByClientId = (clientId: Oauth2ClientInfoUpdateReqVo): Promise<ResponseResult> => {
  return http.delete('/sys/oauth2-client/delete', { clientId })
}
