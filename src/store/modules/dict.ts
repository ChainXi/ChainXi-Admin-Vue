import { defineStore } from 'pinia'
// @ts-ignore
import { DictDataSimpleRespVo } from '@/api/system/dict/types'
import { CACHE_KEY, useCache } from '@/hooks/useCache'
import { listSimpleDictData } from '@/api/sys/dict/dict.data'

const wsCache = useCache('sessionStorage')
let dictInitPromise: Promise<void> | null = null
export interface DictValueType {
  value: any
  label: string
  clorType?: string
  cssClass?: string
}
export interface DictTypeType {
  dictType: string
  dictValue: DictValueType[]
}
export interface DictState {
  dictMap: object
  isSetDict: boolean
}

export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictMap: {},
    isSetDict: false
  }),
  getters: {
    getDictMap(): Recordable {
      const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
      if (dictMap) {
        this.dictMap = dictMap
      }
      return this.dictMap
    },
    getIsSetDict(): boolean {
      return this.isSetDict
    }
  },
  actions: {
    async setDictMap() {
      if (this.isSetDict) return
      if (dictInitPromise) return dictInitPromise

      dictInitPromise = (async () => {
        const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
        if (dictMap) {
          if (dictMap.size === 0) {
            console.debug('cache dictMap.length===0')
          } else {
            this.dictMap = dictMap
            this.isSetDict = true
          }
          return
        }
        const res = await listSimpleDictData()
        const dictDataMap: Record<string, any[]> = {}
        res.data.forEach((dictData: DictDataSimpleRespVo) => {
          let enumValueObj = dictDataMap[dictData.dictType]
          if (!enumValueObj) {
            enumValueObj = []
            dictDataMap[dictData.dictType] = enumValueObj
          }
          enumValueObj.push({
            value: dictData.value,
            label: dictData.label,
            colorType: dictData.colorType,
            cssClass: dictData.cssClass
          })
        })
        this.dictMap = dictDataMap
        this.isSetDict = true
        if (Object.keys(dictDataMap).length === 0) {
          console.debug('net dictDataMap.length===0')
        }
        wsCache.set(CACHE_KEY.DICT_CACHE, dictDataMap, { exp: 60 }) // 60 秒 过期
      })()
      try {
        await dictInitPromise
      } finally {
        dictInitPromise = null
      }
    },
    getDictByType(type: string) {
      if (!this.isSetDict) this.setDictMap()
      return this.dictMap[type]
    }
  }
})
