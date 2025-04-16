<template>
  <el-form ref="formRef" :model="password" :rules="rules" label-width="auto">
    <el-form-item :label="t('profile.password.oldPassword')" prop="oldPassword">
      <InputPassword v-model="password.oldPassword" />
    </el-form-item>
    <el-form-item :label="t('profile.password.newPassword')" prop="newPassword">
      <InputPassword v-model="password.newPassword" strength />
    </el-form-item>
    <el-form-item :label="t('profile.password.confirmPassword')" prop="confirmPassword">
      <InputPassword v-model="password.confirmPassword" strength />
    </el-form-item>
    <el-form-item>
      <XButton :title="t('common.save')" type="primary" @click="submit(formRef)" />
      <XButton :title="t('common.reset')" type="danger" @click="reset(formRef)" />
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { updateUserPassword } from '@/api/sys/user/profile'
import * as AuthApi from '@/api/sys/auth'
import { rsaEncrypt, base64ToByteArray } from '@/utils/encrypt'
import md5, { Hash } from 'js-md5'

defineOptions({ name: 'ResetPwd' })

const { t } = useI18n()
const message = useMessage()
const formRef = ref<FormInstance>()
const password = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  trace: ''
})

// 表单校验
const equalToPassword = (_rule, value, callback) => {
  if (password.newPassword !== value) {
    callback(new Error(t('profile.password.diffPwd')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  oldPassword: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: t('common.nonNull'), trigger: 'blur' },
    { min: 6, max: 20, message: t('profile.password.pwdRules'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('profile.password.diffPwd'), trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
})

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      await updateUserPassword(
        rsaEncrypt(unref(pubKey), password.oldPassword),
        rsaEncrypt(unref(pubKey), password.newPassword),
        password.trace
      )
      message.success(t('common.updateSuccess'))
    }
  })
}

const reset = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const pubKey = ref('')
onMounted(async () => {
  pubKey.value = (await AuthApi.queryPubKey()).data
  password.trace = (md5 as unknown as Hash)(base64ToByteArray(unref(pubKey)))
})
</script>
