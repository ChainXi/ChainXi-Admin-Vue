import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import createI18n from '@/plugins/vueI18n'
import http from '@/utils/request'
import pinia from '@/store'
import { hasPermission } from '@/utils'
// 引入全局样式
import '@/styles/index.scss'
// 引入unocss css
import 'virtual:uno.css'
// 引入动画
import 'animate.css'

createI18n().then((i18n) => {
  const app = createApp(App)
  app.use(i18n)
  app.use(pinia)
  app.use(router)
  app.config.globalProperties.$http = http
  app.config.globalProperties.$hasPermission = hasPermission
  app.mount('#app')
  console.debug(app.config.globalProperties)
})

// app.config.devtools = true
