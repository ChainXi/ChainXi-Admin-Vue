// 正常工作。
export { }
declare module 'vue' {
  interface ComponentCustomProperties {
    $http: any,
    $hasPermission: any
  }
}