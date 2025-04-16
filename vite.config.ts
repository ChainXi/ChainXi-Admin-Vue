import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { defineConfig, loadEnv } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import Inspect from 'vite-plugin-inspect'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')
}
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, './viteEnv')
  console.debug('env', env)
  return {
    envDir: './viteEnv',
    server: {
      proxy: {
        [env.VITE_APP_API_PREFIX]: {
          target: env.VITE_APP_BASE_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp('^' + escapeRegExp(env.VITE_APP_API_PREFIX)), ''),
          // 解决跨域引起的session问题，这段代码改变cookie 的作用于为 path="/"
          cookiePathRewrite: {
            '*': env.VITE_APP_API_PREFIX
          }
        },
        [env.VITE_APP_IMG_PREFIX]: {
          target: env.VITE_APP_RESOURCE_BASE_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp('^' + escapeRegExp(env.VITE_APP_IMG_PREFIX)), '/file/img')
        }
      },
      hmr: true
    },
    plugins: [
      Inspect(),
      vue(),
      vueJsx(),
      // UnoCSS({ mode: 'vue-scoped' }),
      UnoCSS(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          {
            '@/hooks/useI18n': ['useI18n'],
            '@/hooks/useMessage': ['useMessage'],
            'lodash-es': ['cloneDeep'],
            '@/utils/dict': ['DICT_TYPE']
          }
        ],
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        // 要搜索组件的目录的相对路径
        dirs: ['src/components'],
        // 组件的有效文件扩展名
        // extensions: ['vue', 'md', 'tsx'],
        // 搜索子目录
        deep: true,
        include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
        // 生成自定义 `auto-components.d.ts` 全局声明
        dts: 'src/types/auto-components.d.ts',
        // 自定义组件的解析器
        resolvers: [ElementPlusResolver()]
      }),
      VueI18nPlugin({
        runtimeOnly: true,
        compositionOnly: true,
        include: [resolve(__dirname, 'src/locales/**')]
      })
    ],
    build: {
      rollupOptions: {
        output: {}
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/variables.scss" as *;',
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css'],
      alias: {
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
