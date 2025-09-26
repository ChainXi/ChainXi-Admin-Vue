<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/useDesign'

// eslint-disable-next-line vue/no-reserved-component-names
defineOptions({ name: 'Footer' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('footer')

const appStore = useAppStore()

const title = computed(() => appStore.getTitle)
const props = defineProps<{ showStat?: boolean }>()
const showStat = computed(() => props.showStat !== false)
</script>

<template>
  <div
    :class="prefixCls"
    class="text-center text-[var(--el-text-color-placeholder)] bg-[var(--app-contnet-bg-color)] h-[var(--app-footer-height)] dark:bg-[var(--el-bg-color)] flex items-center justify-center"
  >
    <p style="font-size:14px;margin:0;display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:center;">
      <span>{{ new Date().getFullYear() }} ©-{{ title }}</span>
      <span>|</span>
      <a href="https://beian.miit.gov.cn/#/Integrated/recordQuery" target="_blank" rel="noopener" style="color:inherit;">粤ICP备2025470412号-1</a>
      <template v-if="showStat">
        <span id="busuanzi_container_site_pv">| PV <span id="busuanzi_value_site_pv"></span></span>
        <span id="busuanzi_container_site_uv">| UV <span id="busuanzi_value_site_uv"></span></span>
      </template>
    </p>
  </div>
</template>
