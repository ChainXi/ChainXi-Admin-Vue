// 正常工作。
export { }
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: typeof useI18n.prototype.t
    $hasPermission: typeof import('@/utils')['hasPermission']
  }
}