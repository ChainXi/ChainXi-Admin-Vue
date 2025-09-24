import WebStorageCache from 'web-storage-cache'
type CacheType = 'localStorage' | 'sessionStorage'

export const CACHE_KEY = {
  ACCESS_TOKEN: 'access_token',
  ACCESS_TOKEN_EXPIRE: 'access_token_expire',
  REFRESH_TOKEN: 'refresh_token',
  IS_DARK: 'isDark',
  USER: 'user',
  LANG: 'lang',
  THEME: 'theme',
  LAYOUT: 'layout',
  ROLE_ROUTERS: 'roleRouters',
  DICT_CACHE: 'dictCache'
}

export const useCache = (type: CacheType = 'localStorage') => new WebStorageCache({ storage: type })
