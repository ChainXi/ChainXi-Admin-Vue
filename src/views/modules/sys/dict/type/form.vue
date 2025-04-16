<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-form-item :label="$t('dictManager.name')" prop="name">
        <el-input v-model="modelValue.name" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('dictManager.type')" prop="type">
        <el-input v-model="modelValue.type" :disabled="typeof modelValue.id !== 'undefined'" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-radio-group v-model="modelValue.status">
          <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :value="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { cloneDeep } from 'lodash-es'
import * as DictTypeApi from '@/api/sys/dict/dict.type'
import { CommonStatusEnum } from '@/utils/constants'
import { FormInstance } from 'element-plus/es/components/form'

defineOptions({ name: 'SysDictTypeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用

const defaultData = {
  id: undefined,
  name: '',
  type: '',
  status: CommonStatusEnum.ENABLE,
  remark: ''
}

const modelValue = ref(cloneDeep(defaultData))
const formRules = reactive({
  name: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  type: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  status: [{ required: true, message: t('common.nonNull'), trigger: 'change' }]
})
const formRef = ref<FormInstance>() // 表单 Ref

/** 打开弹窗 */
const open = async (id: number | undefined | null) => {
  dialogVisible.value = true
  resetForm()
  if (id) {
    dialogTitle.value = t('action.update')
    try {
      formLoading.value = true
      modelValue.value = (await DictTypeApi.getDictType(id)).data
    } finally {
      formLoading.value = false
    }
  } else {
    dialogTitle.value = t('action.create')
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['onSuccess']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = modelValue.value as DictTypeApi.DictTypeSaveReqVo
    if (!modelValue.value.id) {
      await DictTypeApi.createDictType(data)
      message.success(t('common.createSuccess'))
    } else {
      await DictTypeApi.updateDictType(data)
      message.success(t('common.updateSuccess'))
    }
    // 发送操作成功的事件
    emit('onSuccess')
  } finally {
    dialogVisible.value = false
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  modelValue.value = cloneDeep(defaultData)
}
</script>
