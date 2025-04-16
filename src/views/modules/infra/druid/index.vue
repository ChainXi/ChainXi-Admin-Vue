<template>
  <ContentWrap>
    <IFrame :src="src" :headers="headers" />
  </ContentWrap>
</template>
<script lang="ts" setup>
import { useCache, CACHE_KEY } from '@/hooks/useCache'
const wsCache = useCache()

defineOptions({ name: 'InfraAdminServer' })

console.debug(import.meta.env)

const src = ref(import.meta.env.VITE_APP_API_PREFIX + '/druid/login.html')
const headers = ref<Map<string, string>>(new Map().set('access_token', wsCache.get(CACHE_KEY.ACCESS_TOKEN) || ''))
</script>
