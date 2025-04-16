<template>
  <ElDropdown class="custom-hover" :class="prefixCls" trigger="click">
    <div class="flex items-center">
      <img
        :src="APP_IMG_PREFIX + '/' + user.avatar"
        @error="e => { e.target.src = defaultAvatar }"
        alt=""
        class="h-[calc(var(--logo-height)-25px)] w-[calc(var(--logo-height)-25px)] rounded-[50%]"
      />
      <span class="<lg:hidden text-14px pl-[5px] text-[var(--top-header-text-color)]">
        {{ user.nickName ? user.nickName : 'Admin' }}
      </span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem>
          <Icon icon="ep:tools" />
          <div @click="toProfile">{{ t('common.profile') }}</div>
        </ElDropdownItem>
        <ElDropdownItem>
          <Icon icon="ep:menu" />
          <div @click="toDocument">{{ t('common.document') }}</div>
        </ElDropdownItem>
        <ElDropdownItem divided @click="loginOut">
          <Icon icon="ep:switch-button" />
          <div>{{ t('common.loginOut') }}</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<script lang="ts" setup>

import { useCache } from '@/hooks/useCache'
import { useDesign } from '@/hooks/useDesign'
import defaultAvatar from '@/assets/imgs/avatar.svg'
import { useUserStore } from '@/store/modules/user'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useRouterStore } from '@/store/modules/permission'
import { logout } from '@/api/sys/auth'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'UserInfo' })

const { t } = useI18n()

const wsCache = useCache()
const userStore = useUserStore()

const { push, replace } = useRouter()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const { user } = storeToRefs(userStore)
const APP_IMG_PREFIX = import.meta.env.VITE_APP_IMG_PREFIX

const loginOut = () => {
  ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
    confirmButtonText: t('common.ok'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  })
    .then(async () => {
      await logout()
      wsCache.clear()
      useTagsViewStore().$reset()
      useRouterStore().$reset()
      useUserStore().$reset()
      replace('/login?redirect=/home')
    })
    .catch(() => {})
}
const toProfile = async () => {
  push('/profile')
}
const toDocument = () => {
  window.open('https://chainxi.github.io/ChainXi-Admin-Doc')
}
</script>
