export const filterBreadcrumb = (routes: AppRouteRecordRaw[]): AppRouteRecordRaw[] => {
  const res: AppRouteRecordRaw[] = []
  for (const route of routes) {
    const data: AppRouteRecordRaw = route.type === 0 && route.children?.length === 1 ? { ...route.children[0] } : { ...route }

    if (data.children) {
      data.children = filterBreadcrumb(data.children)
    }
    if (data) {
      res.push(data)
    }
  }
  return res
}
