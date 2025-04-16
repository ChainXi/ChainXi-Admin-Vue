import Cookies from 'js-cookie'
import qs from 'qs'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useCache, CACHE_KEY } from '@/hooks/useCache'
import { getRefreshToken } from './auth'
import * as AuthApi from '@/api/sys/auth'
import * as AuthUtils from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useRouterStore } from '@/store/modules/permission'

const wsCache = useCache()
const http = axios.create({
  baseURL: import.meta.env.VITE_APP_API_PREFIX,
  timeout: 1000 * 180,
  withCredentials: false
})

/**
 * 请求拦截
 */
http.interceptors.request.use(
  (option: InternalAxiosRequestConfig) => {
    option.headers['Accept-Language'] = Cookies.get('language') || 'zh-CN'
    option.headers['access_token'] = wsCache.get(CACHE_KEY.ACCESS_TOKEN) || ''
    option.headers['Content-Type'] = option.headers['Content-Type'] ?? 'application/json'
    if (
      typeof option.headers['Content-Type'] === 'string' &&
      option.method?.toUpperCase() !== 'POST' &&
      option.data &&
      /^application\/x-www-form-urlencoded/.test(option.headers['Content-Type'])
    ) {
      option.data = qs.stringify(option.data)
    }
    // 防止缓存，GET请求默认带_t参数
    if (option.params) {
      if (option.method?.toUpperCase() === 'GET') {
        option.params = {
          ...option.params,
          ...{ _t: new Date().getTime() }
        }
      }
      const paramsStr = qs.stringify(option.params, { allowDots: true, arrayFormat: 'brackets' })
      if (paramsStr) {
        option.url = option.url + ((/\?.*/.test(option.url) && '&') || '?') + paramsStr
      }
      option.params = {}
    }
    return option
  },
  (error) => {
    console.debug(error)
    return Promise.reject(error)
  }
)

let refreshing: boolean = false
// Axios 无感知刷新令牌，参考 https://www.dashingdog.cn/article/11 与 https://segmentfault.com/a/1190000020210980 实现
// 请求队列
let requestQueue: Function[] = []

/**
 * 响应拦截
 */
http.interceptors.response.use(
  async (response) => {
    console.debug(response)
    if (response.data.code === 401) {
      if (refreshing) {
        return new Promise((resolve) => {
          requestQueue.push(() => {
            response.config.headers['access_token'] = wsCache.get(CACHE_KEY.ACCESS_TOKEN)
            resolve(http(response.config))
          })
        })
      } else {
        const rt = getRefreshToken()
        if (rt) {
          try {
            refreshing = true
            const res: AxiosResponse<ResponseResult<AuthApi.TokenType>> = await axios.post(
              import.meta.env.VITE_APP_API_PREFIX + '/sys/auth/refresh-token?rt=' + rt
            )
            AuthUtils.setToken(res.data.data)
            requestQueue.forEach((callback: Function) => {
              callback()
            })
            requestQueue = []
            response.config.headers['access_token'] = wsCache.get(CACHE_KEY.ACCESS_TOKEN)
            return http(response.config)
          } catch (e) {
            requestQueue.forEach((callback: Function) => {
              callback()
            })
            return handleAuthorized()
          } finally {
            requestQueue = []
            refreshing = false
          }
        } else {
          return handleAuthorized()
        }
      }
    }
    return response
  },
  (error: AxiosError) => {
    console.error(error)
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)

let isRelogin = false
const handleAuthorized = () => {
  const { t } = useI18n()
  if (!isRelogin) {
    // 如果已经到重新登录页面则不进行弹窗提示
    if (window.location.href.includes('login?redirect=')) {
      return
    }
    isRelogin = true
    ElMessageBox.confirm(t('common.toeknExpired'), t('common.confirmTitle'), {
      showCancelButton: false,
      closeOnClickModal: false,
      showClose: false,
      confirmButtonText: t('login.relogin'),
      type: 'warning'
    }).then(() => {
      wsCache.clear()
      useTagsViewStore().$reset()
      useRouterStore().$reset()
      useUserStore().$reset()
      isRelogin = false
      // 干掉token后再走一次路由让它过router.beforeEach的校验
      window.location.href = window.location.href
    })
  }
  return Promise.reject(t('common.toeknExpired'))
}

export default {
  get: async <T = any>(url: string, params?: any, option?: AxiosRequestConfig) => {
    const res = await http(url, { method: 'GET', params, ...option })
    return res.data as unknown as T
  },
  post: async <T = any>(url: string, data?: any, option?: AxiosRequestConfig) => {
    const res = await http(url, { method: 'POST', data, ...option })
    return res.data as unknown as T
  },
  postOriginal: async (url: string, data?: any, option?: AxiosRequestConfig) => {
    const res = await http(url, { method: 'POST', data, ...option })
    return res
  },
  delete: async <T = any>(url: string, params?: any, option?: AxiosRequestConfig) => {
    const res = await http(url, { method: 'DELETE', params, ...option })
    return res.data as unknown as T
  },
  put: async <T = any>(url: string, data?: any, option?: AxiosRequestConfig) => {
    const res = await http(url, { method: 'PUT', data, ...option })
    return res.data as unknown as T
  },
  download: async <T = any>(url: string, params?: any, option?: AxiosRequestConfig) => {
    const res = await http(url, { method: 'GET', responseType: 'blob', params, ...option })
    return res as unknown as Promise<T>
  },
  upload: async <T = any>(url: string, data?: any, option?: AxiosRequestConfig) => {
    option.headers = option.headers ?? {}
    option.headers['Content-Type'] = 'multipart/form-data'
    const res = await http(url, { method: 'POST', data, ...option })
    return res as unknown as Promise<T>
  }
}
