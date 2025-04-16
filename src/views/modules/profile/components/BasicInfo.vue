<template>
  <el-form ref="formRef" :model="modelValue" :rules="rules" label-width="auto">
    <el-form-item :label="$t('profile.user.nickName')" prop="nickName">
      <el-input v-model="modelValue.nickName" :placeholder="$t('common.inputText')" />
    </el-form-item>
    <el-form-item :label="$t('profile.user.phoneNumber')" prop="phoneNumber">
      <el-input v-model="modelValue.phoneNumber" maxlength="11" :placeholder="$t('common.inputText')" />
    </el-form-item>
    <el-form-item :label="$t('profile.user.email')" prop="email">
      <el-input v-model="modelValue.email" maxlength="50" :placeholder="$t('common.inputText')" />
    </el-form-item>
    <el-form-item :label="$t('profile.user.sex')">
      <el-select v-model="modelValue.sex" :placeholder="$t('common.selectText')">
        <el-option v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)" :key="dict.value" :label="dict.label" :value="dict.value" />
      </el-select>
    </el-form-item>
  </el-form>
  <div style="text-align: center">
    <XButton :title="$t('common.save')" type="primary" @click="submit()" />
    <XButton :title="$t('common.reset')" type="danger" @click="reset()" />
  </div>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import type { FormRules } from 'element-plus'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getUserProfile, updateUserProfile, UserProfileUpdateReqVO } from '@/api/sys/user/profile'

defineOptions({ name: 'BasicInfo' })

const { t } = useI18n()
const message = useMessage() // 消息弹窗
// 表单校验
const rules = reactive<FormRules>({
  nickname: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  email: [
    { required: true, message: t('common.nonNull'), trigger: 'blur' },
    {
      type: 'email',
      message: t('profile.user.invalidEmail'),
      trigger: ['blur', 'change']
    }
  ],
  mobile: [
    { required: true, message: t('common.nonNull'), trigger: 'blur' },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t('profile.user.invalidPhoneNumber'),
      trigger: 'blur'
    }
  ]
})
var defaultData: UserProfileUpdateReqVO = {
  nickName: '',
  email: '',
  phoneNumber: '',
  sex: 0
}
const modelValue = ref<UserProfileUpdateReqVO>(defaultData)
const formRef = ref() // 表单 Ref
const submit = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    await updateUserProfile(unref(modelValue))
    message.success(t('common.updateSuccess'))
    await init()
  }
}
const init = async () => {
  const res = (await getUserProfile()).data
  defaultData = res
  modelValue.value = cloneDeep(defaultData)
}
const reset = () => {
  modelValue.value = cloneDeep(defaultData)
}
onMounted(async () => {
  await init()
})
</script>
