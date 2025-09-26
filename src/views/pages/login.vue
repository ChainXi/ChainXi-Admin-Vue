<template>
  <div class="login-page">
    <div class="login-main">
      <div class="login-simple">
        <div class="login-head">
          <h1 class="login-title">{{ $t('login.title') }}</h1>
          <biz />
        </div>
        <el-form ref="ruleFormRef" :model="dataForm" :rules="rules" @submit.prevent="dataFormSubmitHandle()">
          <el-form-item prop="userName">
            <el-input
              v-model="dataForm.userName"
              :placeholder="$t('login.username')"
              autocomplete="username"
              :disabled="submitting"
              autofocus
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="dataForm.password"
              type="password"
              show-password
              :placeholder="$t('login.password')"
              autocomplete="current-password"
              :disabled="submitting"
            />
          </el-form-item>
          <el-form-item prop="captcha" v-if="needCaptcha">
            <div class="captcha-row">
              <el-input v-model="dataForm.captcha" :placeholder="$t('login.captcha')" :disabled="submitting" />
              <img :src="captchaPath" @click="!submitting && reloadCaptcha()" class="captcha-img" alt="captcha" />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button class="login-btn" native-type="submit" type="primary" :loading="submitting" :disabled="submitting">
              {{ submitting ? $t('common.loading') : $t('login.title') }}
            </el-button>
          </el-form-item>
          <Footer class="login-footer" :show-stat="false" />
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 极简版本：仅保留核心登录逻辑
import { useAppStore } from '@/store/modules/app'
import Footer from '@/layout/components/Footer/src/Footer.vue'
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
const needCaptcha = ref(false)
const pubKey = ref('')
const year = new Date().getFullYear()

const dataForm = reactive<AuthApi.UserLoginVO>({
  userName: 'admin',
  password: 'chainxi-admin123',
  trace: '',
  uuid: '',
  captcha: ''
})

onMounted(async () => {
  try {
    const keyResp = AuthApi.queryPubKey()
    const capResp = AuthApi.queryCaptcha()
    const [pubKeyRes, cap] = await Promise.all([keyResp, capResp])
    pubKey.value = pubKeyRes.data
    dataForm.trace = (md5 as unknown as Hash)(base64ToByteArray(unref(pubKey)))
    dataForm.uuid = cap.data.uuid
    captchaPath.value = URL.createObjectURL(base64ToBlob(cap.data.image, 'image/jpg'))
    needCaptcha.value = true
  } catch (e) {
    message.error(t('common.loadError'))
  }
})

const rules = computed<FormRules>(() => ({
  userName: [{ required: true, message: t('validate.required'), trigger: 'blur' }],
  password: [{ required: true, message: t('validate.required'), trigger: 'blur' }],
  captcha: [{ required: false, message: t('validate.required'), trigger: 'blur' }]
}))

const reloadCaptcha = async () => {
  try {
    const data: AuthApi.CaptchaRespVo = (await AuthApi.queryCaptcha()).data
    dataForm.uuid = data.uuid
    captchaPath.value = URL.createObjectURL(base64ToBlob(data.image, 'image/jpg'))
  } catch {}
}

const submit = () => {
  if (submitting.value) return
  ruleFormRef.value?.validate((valid) => {
    if (!valid) return
    submitting.value = true
    const payload = cloneDeep(unref(dataForm)) as AuthApi.UserLoginVO
    if (payload.password) payload.password = rsaEncrypt(unref(pubKey), payload.password)
    AuthApi.login(payload as AuthApi.UserLoginVO)
      .then((res) => {
        if (res.code !== 200) {
          reloadCaptcha()
          needCaptcha.value = true
          message.error(res.msg || t('common.error'))
          return
        }
        AuthUtils.setToken(res.data)
        router.replace({ name: 'home' })
        message.success(t('login.loginSuccessr'))
      })
      .catch((e) => {
        reloadCaptcha()
        needCaptcha.value = true
        message.error(e)
      })
      .finally(() => (submitting.value = false))
  })
}

const dataFormSubmitHandle = debounce(submit, 500, { leading: true, trailing: false })
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 40px 16px 24px;
  background: linear-gradient(160deg, #f5f7fa, #eef3f9, #f6f9ff);
}
.dark .login-page {
  background: linear-gradient(160deg, #1d2229, #1c2530, #1a1f27);
}
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-simple {
  width: 100%;
  max-width: 380px;
  margin: 0 auto 32px;
  padding: 34px 34px 26px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 28px -10px rgba(0, 0, 0, 0.18), 0 4px 14px -6px rgba(0, 0, 0, 0.12);
  backdrop-filter: saturate(180%) blur(4px);
  transition: box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease;
}
.dark .login-simple {
  background: rgba(34, 38, 46, 0.85);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 28px -12px rgba(0, 0, 0, 0.65), 0 3px 10px -6px rgba(0, 0, 0, 0.55);
}
.login-simple:hover {
  box-shadow: 0 14px 36px -12px rgba(0, 0, 0, 0.22), 0 6px 18px -8px rgba(0, 0, 0, 0.18);
}
.dark .login-simple:hover {
  box-shadow: 0 14px 40px -14px rgba(0, 0, 0, 0.85), 0 6px 18px -10px rgba(0, 0, 0, 0.7);
}
.login-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 0 18px;
}
.login-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #1d4ed8, #6366f1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.dark .login-title {
  background: linear-gradient(90deg, #93c5fd, #c3dafe);
}
.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}
.captcha-img {
  height: 36px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.3s ease;
  background: #fff;
}
.captcha-img:hover {
  border-color: #b3c0d1;
  box-shadow: 0 2px 6px -2px rgba(0, 0, 0, 0.22);
}
.captcha-img:active {
  transform: scale(0.96);
}
.dark .captcha-img {
  background: #2d333b;
  border-color: #3d4652;
}
.dark .captcha-img:hover {
  border-color: #556170;
}
.login-btn {
  width: 100%;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.login-btn:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
.login-year {
  text-align: center;
  margin: 10px 0 0;
  font-size: 12px;
  opacity: 0.52;
  transition: opacity 0.3s ease;
}
.login-year:hover {
  opacity: 0.8;
}
.login-footer {
  margin-top: auto;
  --app-footer-height: 48px;
  height: 48px;
  line-height: 48px;
}
/* Element Plus wrapper 微调 */
:deep(.el-input__wrapper) {
  box-shadow: none;
  transition: box-shadow 0.28s ease, border-color 0.28s ease;
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #2563eb, 0 0 0 4px rgba(37, 99, 235, 0.12);
}
.dark :deep(.el-input__wrapper.is-focus),
.dark :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.25);
}
@media (max-width: 640px) {
  .login-simple {
    padding: 28px 26px 22px;
    border-radius: 14px;
  }
  .login-head {
    gap: 10px;
    margin-bottom: 14px;
  }
  .login-title {
    font-size: 20px;
  }
}
@media (max-width: 420px) {
  .login-page {
    padding: 28px 12px 16px;
  }
  .login-simple {
    padding: 24px 20px 18px;
    margin-bottom: 24px;
  }
  .captcha-row {
    gap: 8px;
  }
  .captcha-img {
    height: 34px;
  }
}
</style>
