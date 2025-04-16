<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-form-item :label="$t('oauth2Manager.name')" prop="name">
        <el-input v-model="modelValue.name" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('oauth2Manager.origin')" prop="origin">
        <el-input v-model="modelValue.origin" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('oauth2Manager.logoutCall')" prop="logoutCall">
        <el-input v-model="modelValue.logoutCall" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('common.remark')" prop="description">
        <el-input v-model="modelValue.description" :placeholder="$t('common.inputText')" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">{{ $t('common.ok') }}</el-button>
      <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import * as OAuth2ClientInfoApi from '@/api/sys/auth/oauth2-client'

defineOptions({ name: 'OAuth2ClientInfoFormSave' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用

const defaultData: OAuth2ClientInfoApi.Oauth2ClientInfoUpdateReqVo = {
  clientId: undefined,
  name: '',
  origin: '',
  logoutCall: '',
  description: ''
}

const modelValue = ref(cloneDeep(defaultData))
const formRules = reactive({
  name: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  origin: [{ required: true, message: t('common.nonNull'), trigger: 'change' }],
  description: [{ required: true, message: t('common.nonNull'), trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (clientId: number | undefined | null) => {
  dialogVisible.value = true
  resetForm()
  // 修改时，设置数据
  if (clientId != null && clientId != undefined) {
    dialogTitle.value = t('action.update')
    try {
      formLoading.value = true
      modelValue.value = (await OAuth2ClientInfoApi.query(clientId)).data
    } finally {
      formLoading.value = false
    }
  } else {
    dialogTitle.value = t('action.create')
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = modelValue.value as OAuth2ClientInfoApi.Oauth2ClientInfoUpdateReqVo
    if (modelValue.value.clientId == null || modelValue.value.clientId == undefined) {
      await OAuth2ClientInfoApi.createClientInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await OAuth2ClientInfoApi.updateClientInfo(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  modelValue.value = cloneDeep(defaultData)
}
</script>
