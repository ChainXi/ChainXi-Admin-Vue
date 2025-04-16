import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import createI18n from '@/plugins/vueI18n'
import http from '@/utils/request'
import pinia from '@/store'
import directive from '@/directive'
import { hasPermission } from '@/utils'
// 引入全局样式
import '@/styles/index.scss'
// 引入unocss css
import 'virtual:uno.css'
// 引入动画
import 'animate.css'

const app = createApp(App)
directive(app)
app.use(pinia)
app.use(await createI18n())
app.use(router)
app.config.globalProperties.$http = http
app.config.globalProperties.$hasPermission = hasPermission

app.mount('#app')
console.debug(app.config.globalProperties)

// app.config.devtools = true
