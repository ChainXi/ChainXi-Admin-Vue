import type { RouteMeta, RouteLocationNormalizedLoaded } from 'vue-router'

export const filterAffixTags = (routes: AppRouteRecordRaw[]) => {
  let tags: RouteLocationNormalizedLoaded[] = []
  routes.forEach((route) => {
    const meta = route.meta as RouteMeta
    const tagPath = route.path
    if (meta?.affix) {
      tags.push({ ...route, path: tagPath, fullPath: tagPath } as RouteLocationNormalizedLoaded)
    }
    if (route.children) {
      const tempTags: RouteLocationNormalizedLoaded[] = filterAffixTags(route.children)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })

  return tags
}
