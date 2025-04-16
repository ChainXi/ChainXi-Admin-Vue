<template>
  <div>
    <div class="text-center">
      <UserAvatar ref="userAvatarRef" :value="userInfo?.avatar" @upload:file="handleAvatarUpload" />
    </div>
    <ul class="list-group list-group-striped">
      <li class="list-group-item">
        <Icon class="mr-5px" icon="ep:user" />
        {{ t('profile.user.userName') }}
        <div class="pull-right">{{ userInfo?.userName }}</div>
      </li>
      <li class="list-group-item">
        <Icon class="mr-5px" icon="ep:phone" />
        {{ t('profile.user.phoneNumber') }}
        <div class="pull-right">{{ userInfo?.phoneNumber }}</div>
      </li>
      <li class="list-group-item">
        <Icon class="mr-5px" icon="fontisto:email" />
        {{ t('profile.user.email') }}
        <div class="pull-right">{{ userInfo?.email }}</div>
      </li>
      <li class="list-group-item">
        <Icon class="mr-5px" icon="icon-park-outline:peoples" />
        {{ t('profile.user.roles') }}
        <div v-if="userInfo?.roles" class="pull-right">
          {{ userInfo?.roles.map((role) => role.name).join(',') }}
        </div>
      </li>
      <li class="list-group-item">
        <Icon class="mr-5px" icon="ep:calendar" />
        {{ t('common.createTime') }}
        <div class="pull-right">{{ formatDate(userInfo.createTime) }}</div>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { uploadAvatar } from '@/api/sys/user/profile'
import { formatDate } from '@/utils/formatTime'
import UserAvatar from './UserAvatar.vue'
import { useUserStore } from '@/store/modules/user'
import * as AuthApi from '@/api/sys/auth'
import { CACHE_KEY, useCache } from '@/hooks/useCache'

import { getUserProfile, ProfileVO } from '@/api/sys/user/profile'

defineOptions({ name: 'ProfileUser' })

const message = useMessage()
const userStore = useUserStore()
const { t } = useI18n()
const wsCache = useCache()
const userInfo = ref<ProfileVO>({} as ProfileVO)
const userAvatarRef = useTemplateRef('userAvatarRef')
const getUserInfo = async () => {
  const users = (await getUserProfile()).data
  users.avatar = import.meta.env.VITE_APP_IMG_PREFIX + '/' + users.avatar
  userInfo.value = users
}

const handleAvatarUpload = (data: Blob) => {
  uploadAvatar(data)
    .then(async () => {
      unref(userAvatarRef).cropperAvatar.close()
      const info = (await AuthApi.getInfo('' + 0)).data
      wsCache.set(CACHE_KEY.USER, info)
      userStore.setUserInfoAction(info)
      message.success(t('common.success'))
    })
    .catch((e: Error) => {
      message.error(e.message)
    })
}
onMounted(async () => {
  await getUserInfo()
})
</script>

<style scoped>
.text-center {
  position: relative;
  height: 120px;
  text-align: center;
}

.list-group-striped > .list-group-item {
  padding-right: 0;
  padding-left: 0;
  border-right: 0;
  border-left: 0;
  border-radius: 0;
}

.list-group {
  padding-left: 0;
  list-style: none;
}

.list-group-item {
  padding: 11px 0;
  margin-bottom: -1px;
  font-size: 13px;
  border-top: 1px solid #e7eaec;
  border-bottom: 1px solid #e7eaec;
}

.pull-right {
  float: right !important;
}
</style>
