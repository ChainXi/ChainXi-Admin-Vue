<template>
  <div>
    <div>
      <main>
        <div>
          <h2>{{ $t('brand.lg') }}</h2>
        </div>
        <div>
          <h3>{{ $t('login.title') }}</h3>
          <el-form :model="dataForm" :rules="rules" ref="ruleFormRef" @keyup.enter.native="dataFormSubmitHandle()" status-icon>
            <el-form-item prop="username">
              <el-input v-model="dataForm.userName" :placeholder="$t('login.username')">
                <span slot="prefix" class="el-input__icon">
                  <svg class="icon-svg" aria-hidden="true">
                    <use xlink:href="#icon-user"></use>
                  </svg>
                </span>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="dataForm.password" type="password" :placeholder="$t('login.password')">
                <span slot="prefix" class="el-input__icon">
                  <svg class="icon-svg" aria-hidden="true">
                    <use xlink:href="#icon-lock"></use>
                  </svg>
                </span>
              </el-input>
            </el-form-item>
            <el-form-item prop="captcha">
              <el-row :gutter="20">
                <el-col :span="14">
                  <el-input v-model="dataForm.captcha" :placeholder="$t('login.captcha')">
                    <span slot="prefix" class="el-input__icon">
                      <svg class="icon-svg" aria-hidden="true">
                        <use xlink:href="#icon-safetycertificate" />
                      </svg>
                    </span>
                  </el-input>
                </el-col>
                <el-col :span="10">
                  <img class="!h-30px" :src="captchaPath" @click="reloadCaptcha()" />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="dataFormSubmitHandle()">{{ $t('login.title') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div>
          <a href="#" target="_blank">{{ $t('common.copyright') }}</a>
          <p>{{ new Date().getFullYear() }} ©-{{ appStore.getTitle }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import * as AuthUtils from '@/utils/auth'
import { debounce } from 'lodash-es'

import * as AuthApi from '@/api/sys/auth'

import type { FormInstance, FormRules } from 'element-plus'
import { rsaEncrypt, base64ToByteArray, base64ToBlob } from '@/utils/encrypt'
import { cloneDeep } from 'lodash-es'
import md5, { Hash } from 'js-md5'

const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()
const message = useMessage() // 消息弹窗
const captchaPath = ref('')
const dataForm = reactive<AuthApi.UserLoginVO>({
  userName: 'admin',
  password: 'zhj250566372',
  trace: '',
  uuid: '',
  captcha: ''
})
const pubKey = ref('')

onMounted(async () => {
  pubKey.value = (await AuthApi.queryPubKey()).data
  dataForm.trace = (md5 as unknown as Hash)(base64ToByteArray(unref(pubKey)))
  reloadCaptcha()
})
const ruleFormRef = ref<FormInstance>()
const rules = computed<FormRules>(() => {
  return {
    userName: [{ required: true, message: t('validate.required'), trigger: 'blur' }],
    password: [{ required: true, message: t('validate.required'), trigger: 'blur' }],
    captcha: [{ required: false, message: t('validate.required'), trigger: 'blur' }]
  }
})

const reloadCaptcha = async () => {
  const data: AuthApi.CaptchaRespVo = (await AuthApi.queryCaptcha()).data
  dataForm.uuid = data.uuid
  captchaPath.value = URL.createObjectURL(base64ToBlob(data.image, 'image/jpg'))
  // image/jpg
}

// 表单提交
const dataFormSubmitHandle = debounce(
  () => {
    ruleFormRef.value.validate((valid, fields) => {
      if (!valid) {
        return false
      }
      const data: AuthApi.UserLoginVO = cloneDeep(unref(dataForm))
      data.password = rsaEncrypt(unref(pubKey), data.password)
      AuthApi.login(data)
        .then((res) => {
          if (res.code !== 200) {
            reloadCaptcha()
            return message.error(res.msg)
          }
          message.success(t('login.loginSuccessr'))
          AuthUtils.setToken(res.data)
          router.replace({ name: 'home' })
        })
        .catch((e) => {
          reloadCaptcha()
          message.error(e)
          console.error(e)
        })
    })
  },
  1000,
  { leading: true, trailing: false }
)
</script>

<style scoped>
.layout-container-demo {
  height: 100vh;
}
</style>
