import { defineStore } from 'pinia'
// @ts-ignore
import { DictDataSimpleRespVo } from '@/api/system/dict/types'
import { CACHE_KEY, useCache } from '@/hooks/useCache'
import { listSimpleDictData } from '@/api/sys/dict/dict.data'

const wsCache = useCache('sessionStorage')
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
      const dictMap = wsCache.get(CACHE_KEY.DICT_CACHE)
      if (dictMap) {
        if (dictMap.size === 0) {
          console.debug('cache dictMap.length===0')
        } else {
          this.dictMap = dictMap
          this.isSetDict = true
        }
      } else {
        const res = await listSimpleDictData()
        // 设置数据
        const dictDataMap = {}
        res.data.forEach((dictData: DictDataSimpleRespVo) => {
          // 获得 dictType 层级
          var enumValueObj = dictDataMap[dictData.dictType]
          if (!enumValueObj) {
            enumValueObj = []
            dictDataMap[dictData.dictType] = enumValueObj
          }
          // 处理 dictValue 层级
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
      }
    },
    getDictByType(type: string) {
      if (!this.isSetDict) {
        this.setDictMap()
      }
      return this.dictMap[type]
    }
  }
})
