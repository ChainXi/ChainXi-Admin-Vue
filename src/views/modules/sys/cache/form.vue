<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-form-item :label="$t('cacheManager.cacheName')" prop="name">
        <el-input v-model="modelValue.name" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('cacheManager.localExpireTime')" prop="localExpireTime">
        <el-input v-model="modelValue.localExpireTime" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('cacheManager.remoteExpireTime')" prop="remoteExpireTime">
        <el-input v-model="modelValue.remoteExpireTime" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('common.remark')" prop="remark">
        <el-input v-model="modelValue.remark" :placeholder="$t('common.inputText')" />
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
import * as CacheApi from '@/api/sys/cache'

defineOptions({ name: 'SysCacheFormSave' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用

const defaultData: CacheApi.SysCacheInfoDo = {
  id: undefined,
  name: '',
  localExpireTime: 0,
  remoteExpireTime: 0,
  remark: ''
}

const modelValue = ref(cloneDeep(defaultData))
const formRules = reactive({
  name: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  localExpireTime: [{ required: true, message: t('common.nonNull'), trigger: 'change' }],
  remoteExpireTime: [{ required: true, message: t('common.nonNull'), trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (name: string | undefined | null) => {
  dialogVisible.value = true
  resetForm()
  // 修改时，设置数据
  if (name) {
    dialogTitle.value = t('action.update')
    try {
      formLoading.value = true
      modelValue.value = (await CacheApi.getCacheInfo(name)).data
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
    const data = modelValue.value as CacheApi.SysCacheInfoDo
    if (!modelValue.value.id) {
      await CacheApi.createCacheInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await CacheApi.updateCacheInfo(data)
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
