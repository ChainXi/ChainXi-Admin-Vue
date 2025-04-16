<template>
  <IFrame v-if="!loading" v-loading="loading" :src="src" :headers="headers" />
</template>
<script lang="ts" setup>
import { useCache, CACHE_KEY } from '@/hooks/useCache'
const wsCache = useCache()

defineOptions({ name: 'InfraAdminServer' })

const loading = ref(true) // 是否加载中
console.debug(import.meta.env)

const src = ref('/op')
// const src = ref(import.meta.env.VITE_APP_API_PREFIX + '/druid/login.html')
const headers = ref<Map<string, string>>(new Map().set('access_token', wsCache.get(CACHE_KEY.ACCESS_TOKEN) || ''))

/** 初始化 */
onMounted(async () => {
  try {
  } finally {
    loading.value = false
  }
})
</script>
