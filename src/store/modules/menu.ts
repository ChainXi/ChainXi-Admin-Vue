import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    // 导航条, 布局风格, default(白色) / colorful(鲜艳)
    navbarLayoutType: 'colorful',
    // 侧边栏, 布局皮肤, default(白色) / dark(黑色)
    sidebarLayoutSkin: 'dark',
    // 侧边栏, 折叠状态
    sidebarFold: false,
    // 侧边栏, 菜单
    sidebarMenuList: null,
    dynamicMenuRoutes: null,
    // 所有组件,检索权限
    dynamicComponents: null,
    sidebarMenuActiveName: '',
    // 内容, 是否需要刷新
    contentIsNeedRefresh: false,
    // 内容, 标签页(默认添加首页)
    contentTabs: [
      {
        name: 'home',
        title: 'home'
      }
    ],
    contentTabsActiveName: 'home'
  }),
  getters: {},
  actions: {}
})
