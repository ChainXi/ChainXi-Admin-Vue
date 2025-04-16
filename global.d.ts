export {}
declare global {
  interface Fn<T = any> {
    (...arg: T[]): T
  }

  interface Window {
    SITE_CONFIG: any
  }

  type Nullable<T> = T | null

  type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>

  type Recordable<T = any, K extends string | number | symbol = string> = Record<K extends null | undefined ? string : K, T>

  type ComponentRef<T extends abstract new (...args: any) => any> = InstanceType<T>

  type LocaleType = 'zh-CN' | 'en'

  type AxiosHeaders = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data'

  type AxiosMethod = 'get' | 'post' | 'delete' | 'put' | 'GET' | 'POST' | 'DELETE' | 'PUT'

  type AxiosResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream'

  interface AxiosConfig {
    params?: any
    data?: any
    url?: string
    method?: AxiosMethod
    headersType?: string
    responseType?: AxiosResponseType
  }

  interface ResponseResult<T = any> {
    code: number
    msg: string
    data: T
  }

  interface PageResult<T = any> {
    list: T[]
    total: string
  }

  interface PageParam {
    pageSize?: number
    pageNo?: number
  }

  interface Tree {
    id: any
    name: string
    children?: Tree[] | any[]
  }
}
