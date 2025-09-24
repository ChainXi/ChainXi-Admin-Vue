import { createRouter, createWebHistory } from 'vue-router'
import * as AuthApi from '@/api/sys/auth'
import { useUserStore } from '@/store/modules/user'
import { useRouterStore } from '@/store/modules/permission'
import { CACHE_KEY, useCache } from '@/hooks/useCache'
import type { RouteRecordRaw } from 'vue-router'
import { getAccessToken } from '@/utils/auth'
import { remainingRouter, ROUTER_PATH_LOGIN } from '@/router/remaining'
let hasPingedAfterRefresh = false
const whiteList = [ROUTER_PATH_LOGIN]
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes: remainingRouter as RouteRecordRaw[] })
router.beforeEach(async (to, from, next) => {
  console.log(to)
  if (!hasPingedAfterRefresh && getAccessToken()) {
    hasPingedAfterRefresh = true
    AuthApi.ping().catch(() => {})
  }
  if (to.path === ROUTER_PATH_LOGIN && getAccessToken()) next(`/`)
  else if (getAccessToken()) {
    const wsCache = useCache()
    const userStore = useUserStore()
    const routerStore = useRouterStore()
    let info: AuthApi.AuthVo = wsCache.get(CACHE_KEY.USER)
    if (!info) {
      info = (await AuthApi.getInfo('' + 0)).data
      wsCache.set(CACHE_KEY.USER, info)
    }
    if (routerStore.getRouters.length === 0) {
      userStore.setUserInfoAction(info)
      routerStore.setRoutes(info.menus)
      routerStore.getAddRouters.forEach((route) => {
        router.addRoute(route as RouteRecordRaw)
      })
      const redirectPath = from.query.redirect || to.path
      const redirect = decodeURIComponent(redirectPath as string)
      const nextData = to.path === redirect ? { ...to, replace: true } : redirect
      next(nextData)
    } else next()
  } else {
    if (whiteList.indexOf(to.path) !== -1) next()
    else next({ path: ROUTER_PATH_LOGIN, query: { redirect: encodeURIComponent(to.fullPath) } })
  }
})
export default router
