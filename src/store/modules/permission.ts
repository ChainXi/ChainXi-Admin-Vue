import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash-es'
import { layoutRemainingRoutes } from '@/router/remaining'
import { generateRoutes } from '@/utils/routerHelper'
import { handleTree } from '@/utils/tree'

export interface PermissionState {
  addRouters: AppRouteRecordRaw[]
  routers: AppRouteRecordRaw[]
  menuTabRouters: AppRouteRecordRaw[]
}

export const useRouterStore = defineStore('router', {
  state: (): PermissionState => ({
    routers: [],
    addRouters: [],
    menuTabRouters: []
  }),
  getters: {
    getRouters(): AppRouteRecordRaw[] {
      return this.routers
    },
    getAddRouters(): AppRouteRecordRaw[] {
      return cloneDeep(this.addRouters)
    },
    getMenuTabRouters(): AppRouteRecordRaw[] {
      return this.menuTabRouters
    }
  },
  actions: {
    setRoutes(res: AppCustomRouteRecordRaw[] = []) {
      // console.debug(res)
      const routes: AppRouteRecordRaw[] = generateRoutes(res.filter((raw) => raw.type != 2))
      const layoutSubRoutes: AppRouteRecordRaw[] = routes.filter((raw) => raw.type == 1)
      const layoutRoute = {
        ...layoutRemainingRoutes,
        name: 'layout-dynamic',
        children: layoutSubRoutes
      }
      const redirect404Route = {
        path: '/:pathMatch(.*)',
        redirect: { name: '404' }
      }
      // 动态路由，404一定要放到最后面
      this.addRouters = [layoutRoute, redirect404Route]
      // 渲染菜单的所有路由
      this.routers = handleTree(routes, 'id', 'children', (e) => e.pid).filter((e) => e.meta.status === 0)[0]?.children ?? []
    },
    setMenuTabRouters(routers: AppRouteRecordRaw[]): void {
      this.menuTabRouters = routers
    }
  }
})
