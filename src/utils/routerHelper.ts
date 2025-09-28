import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router'
import type { Component } from '@/types/router'
import { isUrl } from '@/utils/is'
import router from '@/router'

function registerComponentName(componentName: string, component: Component): Component {
  return () => {
    return component().then((res: { default: { name: string } }) => {
      console.debug(router)
      // res.default.name = componentName
      return res
    })
  }
}

export const getRawRoute = (route: RouteLocationNormalized): RouteLocationNormalized => {
  if (!route) return route
  const { matched, ...opt } = route
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path
        }))
      : undefined) as RouteRecordNormalized[]
  }
}

/**
 * 添加动态(菜单)路由
 * @param {*} menuList 菜单列表
 * @param {*} routes 递归创建的动态(菜单)路由
 */

const modules = import.meta.glob('@/views/modules/**/*.{vue,tsx}')

/* Layout */
// export const Layout =

export function generateRoutes(menuList: AppCustomRouteRecordRaw[] = [], routes: AppRouteRecordRaw[] = []) {
  const map = {}
  menuList.forEach((item) => {
    map[item.id] = item
  })
  const resolvePath = (id: string) => {
    const menu = map[id]
    return (menu.pid ? resolvePath(menu.pid) : '') + menu.routerPath
  }
  const modulesRoutesKeys = Object.keys(modules)
  for (var i = 0; i < menuList.length; i++) {
    // 组装路由
    var route: AppRouteRecordRaw = {
      id: menuList[i].id,
      pid: menuList[i].pid,
      path: resolvePath(menuList[i].id),
      type: menuList[i].type,
      component: null,
      name: menuList[i].name,
      meta: {
        icon: menuList[i].icon,
        menuId: menuList[i].id,
        title: menuList[i].name,
        keepAlive: menuList[i].keepAlive,
        status: menuList[i].status,
        sort: menuList[i].sort
      }
    }
    // eslint-disable-next-line
    let URL = (menuList[i].componentPath || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)) // URL支持{{ window.xxx }}占位符变量
    if (isUrl(URL)) {
      route.path = route.name = `i-${menuList[i].id}`
      route.meta.iframeURL = URL
    } else if (URL) {
      var index = modulesRoutesKeys.findIndex((ev) => ev.match(URL + '(/index|\\.)'))
      route.component = registerComponentName(route.path, modules[modulesRoutesKeys[index]])
      route.name = menuList[i].componentPath
    }
    routes.push(route)
  }
  routes.sort((a, b) => (a.meta.sort - b.meta.sort || (a.id as any) - (b.id as any)))
  console.log(modulesRoutesKeys)
  console.log(menuList)
  console.log(routes)
  return routes
}
