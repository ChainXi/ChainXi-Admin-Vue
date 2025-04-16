<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-form-item :label="$t('dictManager.type')" prop="type">
        <el-input v-model="modelValue.dictType" disabled :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('dictManager.label')" prop="label">
        <el-input v-model="modelValue.label" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('dictManager.value')" prop="value">
        <el-input v-model="modelValue.value" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('common.sort')" prop="sort">
        <el-input-number v-model="modelValue.sort" :min="0" controls-position="right" />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-radio-group v-model="modelValue.status">
          <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('dictManager.colorType')" prop="colorType">
        <el-select v-model="modelValue.colorType">
          <el-option v-for="item in colorTypeOptions" :key="item.value" :label="item.label + '(' + item.value + ')'" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('dictManager.cssClass')" prop="cssClass">
        <el-input v-model="modelValue.cssClass" :placeholder="$t('common.inputText')" />
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
import * as DictDataApi from '@/api/sys/dict/dict.data'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'SystemDictDataForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const defaultData = {
  id: undefined,
  sort: undefined,
  label: '',
  value: '',
  dictType: '',
  status: CommonStatusEnum.ENABLE,
  colorType: '',
  cssClass: '',
  remark: ''
}
const modelValue = ref(cloneDeep(defaultData))
const formRules = reactive({
  label: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  value: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  sort: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  status: [{ required: true, message: t('common.nonNull'), trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

// 数据标签回显样式
const colorTypeOptions = readonly([
  {
    value: 'default',
    label: '默认'
  },
  {
    value: 'primary',
    label: '主要'
  },
  {
    value: 'success',
    label: '成功'
  },
  {
    value: 'info',
    label: '信息'
  },
  {
    value: 'warning',
    label: '警告'
  },
  {
    value: 'danger',
    label: '危险'
  }
])

/** 打开弹窗 */
const open = async (id: string | undefined | null, dictType: string) => {
  dialogVisible.value = true
  resetForm()
  modelValue.value.dictType = dictType
  if (id) {
    dialogTitle.value = t('action.update')
    try {
      formLoading.value = true
      modelValue.value = (await DictDataApi.getDictData(id)).data
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
    const data = modelValue.value as DictDataApi.DictDataUpdateReqVo
    if (!modelValue.value.id) {
      await DictDataApi.createDictData(data)
      message.success(t('common.createSuccess'))
    } else {
      await DictDataApi.updateDictData(data)
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
