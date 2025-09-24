import { useCache, CACHE_KEY } from '@/hooks/useCache'
import { TokenType } from '@/api/sys/auth'
const wsCache = useCache()
export const getAccessToken = () => wsCache.get(CACHE_KEY.ACCESS_TOKEN)
export const getRefreshToken = () => wsCache.get(CACHE_KEY.REFRESH_TOKEN)

// 设置token
export const setToken = (token: TokenType) => {
  if (token.refreshToken) wsCache.set(CACHE_KEY.REFRESH_TOKEN, token.refreshToken)
  wsCache.set(CACHE_KEY.ACCESS_TOKEN, token.accessToken)
}

// 删除token
export const removeToken = () => {
  wsCache.delete(CACHE_KEY.ACCESS_TOKEN)
  wsCache.delete(CACHE_KEY.REFRESH_TOKEN)
}

export const formatToken = (token: string): string => 'Bearer ' + token
// ========== 账号相关 ==========

const LoginFormKey = 'LOGINFORM'

export type LoginFormType = {
  tenantName: string
  username: string
  password: string
  rememberMe: boolean
}

export const getLoginForm = () => {
  const loginForm: LoginFormType = wsCache.get(LoginFormKey)
  return loginForm
}

export const setLoginForm = (loginForm: LoginFormType) => {
  wsCache.set(LoginFormKey, loginForm, { exp: 30 * 24 * 60 * 60 })
}

export const removeLoginForm = () => {
  wsCache.delete(LoginFormKey)
}

// ========== 租户相关 ==========

const TenantIdKey = 'TENANT_ID'
const TenantNameKey = 'TENANT_NAME'

export const getTenantName = () => wsCache.get(TenantNameKey)

export const setTenantName = (username: string) => {
  wsCache.set(TenantNameKey, username, { exp: 30 * 24 * 60 * 60 })
}

export const removeTenantName = () => {
  wsCache.delete(TenantNameKey)
}

export const getTenantId = () => wsCache.get(TenantIdKey)

export const setTenantId = (username: string) => {
  wsCache.set(TenantIdKey, username)
}

export const removeTenantId = () => {
  wsCache.delete(TenantIdKey)
}
