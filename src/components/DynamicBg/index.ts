import type { App } from 'vue'
import DynamicBg from './src/DynamicBg.vue'
// 显式带上扩展名，避免个别工具链对相对类型文件解析失败
import type { DynamicBgProps } from './src/types.ts'

export type { DynamicBgProps }
export { DynamicBg }
export default DynamicBg

;(DynamicBg as any).install = (app: App) => {
  app.component('DynamicBg', DynamicBg as any)
  return app
}
