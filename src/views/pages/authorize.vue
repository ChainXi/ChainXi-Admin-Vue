<template></template>

<script lang="ts" setup>
import * as AuthApi from '@/api/sys/auth'
let route = useRoute()
onMounted(async () => {
  console.debug(route.query.redirect, route.query.client_id)
  let redirect = (await AuthApi.authorize(route.query.redirect as string, route.query.client_id as string)).data
  window.location.href = redirect
})
</script>
