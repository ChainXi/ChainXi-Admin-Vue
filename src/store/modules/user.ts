import { defineStore } from 'pinia'
import { getAccessToken } from '@/utils/auth'
import * as AuthApi from '@/api/sys/auth'

interface UserRespVo {
  avatar: string
  nickName: string
}
interface UserInfoVO {
  permissions: string[]
  roles: string[]
  isSetUser: boolean
  user: UserRespVo
}

export const useUserStore = defineStore('userStore', {
  state: (): UserInfoVO => ({
    permissions: [],
    roles: [],
    isSetUser: false,
    user: {
      avatar: '',
      nickName: ''
    }
  }),
  actions: {
    setUserInfoAction(userInfo: AuthApi.AuthVo) {
      if (!getAccessToken()) {
        this.$reset()
        return null
      }
      this.permissions = userInfo.menus.map((item) => item.name)
      this.user = { nickName: userInfo.nickName, avatar: userInfo.avatar } as UserRespVo
      this.isSetUser = true
    }
  }
})
