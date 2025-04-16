const { t } = useI18n()
export const ROUTER_PATH_LOGIN = '/login'
export const ROUTER_PATH_AUTH = '/authorize'
// import ROOT_LAYOUT from '@/layout/Layout.vue'
const ROOT_LAYOUT = () => import('@/layout/Layout.vue')
export const layoutRemainingRoutes = {
  path: '/',
  component: ROOT_LAYOUT,
  redirect: '/home',
  name: 'main',
  meta: {},
  children: [
    {
      path: 'home',
      component: () => import('@/views/modules/home.vue'),
      name: 'home',
      meta: {
        title: 'home',
        icon: 'ep:home-filled',
        noCache: false,
        affix: true
      }
    }
  ]
} as AppRouteRecordRaw

export const remainingRouter: AppRouteRecordRaw[] = [
  layoutRemainingRoutes,
  {
    path: '/redirect',
    component: ROOT_LAYOUT,
    name: 'redirect',
    children: [
      {
        path: ':path(.*)',
        name: 'RedirectNode',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  { path: ROUTER_PATH_AUTH, component: () => import('@/views/pages/authorize.vue'), name: 'authorize', meta: { title: t('common.login') } },
  { path: ROUTER_PATH_LOGIN, component: () => import('@/views/pages/login.vue'), name: 'login', meta: { title: t('common.login') } }
]
