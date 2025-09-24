<template>
  <div class="login-simple">
    <h2>{{ $t('login.title') }}</h2>
    <el-form ref="ruleFormRef" :model="dataForm" :rules="rules" @keyup.enter.native="dataFormSubmitHandle()">
      <el-form-item prop="userName">
        <el-input v-model="dataForm.userName" :placeholder="$t('login.username')" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="dataForm.password" type="password" show-password :placeholder="$t('login.password')" />
      </el-form-item>
      <el-form-item prop="captcha" v-if="needCaptcha">
        <div style="display:flex;gap:8px;align-items:center;width:100%">
          <el-input v-model="dataForm.captcha" :placeholder="$t('login.captcha')" />
          <img :src="captchaPath" @click="reloadCaptcha()" style="height:32px;cursor:pointer" />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" style="width:100%" @click="dataFormSubmitHandle()">
          {{ $t('login.title') }}
        </el-button>
      </el-form-item>
    </el-form>
    <small style="opacity:.6">{{ new Date().getFullYear() }} © {{ appStore.getTitle }}</small>
  </div>
</template>

<script lang="ts" setup>
// 极简版本：仅保留核心登录逻辑
import { useAppStore } from '@/store/modules/app'
import * as AuthApi from '@/api/sys/auth'
import * as AuthUtils from '@/utils/auth'
import { rsaEncrypt, base64ToByteArray, base64ToBlob } from '@/utils/encrypt'
import md5, { Hash } from 'js-md5'
import { cloneDeep, debounce } from 'lodash-es'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const { t } = useI18n()
const message = useMessage()
const appStore = useAppStore()
const ruleFormRef = ref<FormInstance>()
const submitting = ref(false)
const captchaPath = ref('')
const needCaptcha = ref(true)
const pubKey = ref('')

const dataForm = reactive<AuthApi.UserLoginVO>({
  userName: 'admin',
  password: 'chainxi-admin123',
  trace: '',
  uuid: '',
  captcha: ''
})

onMounted(async () => {
  pubKey.value = (await AuthApi.queryPubKey()).data
  dataForm.trace = (md5 as unknown as Hash)(base64ToByteArray(unref(pubKey)))
  reloadCaptcha()
})

const rules = computed<FormRules>(() => ({
  userName: [{ required: true, message: t('validate.required'), trigger: 'blur' }],
  password: [{ required: true, message: t('validate.required'), trigger: 'blur' }],
  captcha: [{ required: false, message: t('validate.required'), trigger: 'blur' }]
}))

const reloadCaptcha = async () => {
  const data: AuthApi.CaptchaRespVo = (await AuthApi.queryCaptcha()).data
  dataForm.uuid = data.uuid
  captchaPath.value = URL.createObjectURL(base64ToBlob(data.image, 'image/jpg'))
}

const submit = () => {
  if (submitting.value) return
  ruleFormRef.value?.validate((valid) => {
    if (!valid) return
    submitting.value = true
    const payload = cloneDeep(unref(dataForm))
    payload.password = rsaEncrypt(unref(pubKey), payload.password)
    AuthApi.login(payload)
      .then((res) => {
        if (res.code !== 200) {
          reloadCaptcha()
          message.error(res.msg)
          return
        }
        AuthUtils.setToken(res.data)
        router.replace({ name: 'home' })
        message.success(t('login.loginSuccessr'))
      })
      .catch((e) => {
        reloadCaptcha()
        message.error(e)
      })
      .finally(() => (submitting.value = false))
  })
}

const dataFormSubmitHandle = debounce(submit, 500, { leading: true, trailing: false })
</script>

<style scoped>
.login-simple { max-width:360px; margin:60px auto; padding:24px 28px; border:1px solid #ddd; border-radius:8px; }
.login-simple h2 { margin-top:0; font-size:20px; }
</style>
