<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-form-item :label="$t('resourceManager.name')" prop="name">
        <el-input v-model="modelValue.name" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('resourceManager.patterns')" prop="patterns">
        <el-input v-model="modelValue.patterns" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('resourceManager.methods')" prop="methods">
        <el-select v-model="modelValue.methods" multiple placeholder="Select">
          <el-option
            v-for="item in Object.keys(RequestMethod).filter((key) => !Number.isNaN(Number(key)))"
            :label="RequestMethod[item]"
            :value="parseInt(item)"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.remark')" prop="description">
        <el-input v-model="modelValue.description" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('resourceManager.categoryId')" prop="categoryId">
        <el-input v-model="modelValue.categoryId" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('resourceManager.mappingType')" prop="mappingType">
        <el-select v-model="modelValue.mappingType" collapse-tags collapse-tags-tooltip placeholder="Select" style="width: 200px">
          <el-option
            v-for="item in Object.keys(ResourceApi.ResourceMappingType).filter((key) => !Number.isNaN(Number(key)))"
            :label="ResourceApi.ResourceMappingType[item]"
            :value="parseInt(item)"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('resourceManager.accessType')" prop="accessType">
        <el-select v-model="modelValue.accessType" collapse-tags collapse-tags-tooltip placeholder="Select" style="width: 200px">
          <el-option
            v-for="item in Object.keys(ResourceApi.ResourceAccessType).filter((key) => !Number.isNaN(Number(key)))"
            :label="ResourceApi.ResourceAccessType[item]"
            :value="parseInt(item)"
          />
        </el-select>
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
import * as ResourceApi from '@/api/sys/resource'
import { RequestMethod } from '@/utils/constants'

defineOptions({ name: 'SysResourceFormSave' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改

const defaultData: ResourceApi.SysResourceVo = {
  id: undefined,
  name: '',
  patterns: '',
  methods: [],
  description: '',
  categoryId: '',
  mappingType: undefined,
  accessType: undefined
}
const modelValue = ref(cloneDeep(defaultData))
const formRules = reactive({
  name: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  localExpireTime: [{ required: true, message: t('common.nonNull'), trigger: 'change' }],
  remoteExpireTime: [{ required: true, message: t('common.nonNull'), trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (id: number | undefined | null) => {
  dialogVisible.value = true
  resetForm()
  // 修改时，设置数据
  if (id) {
    dialogTitle.value = t('action.update')
    try {
      formLoading.value = true
      modelValue.value = (await ResourceApi.getResource(id)).data
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
    const data = modelValue.value as ResourceApi.SysResourceVo
    if (!modelValue.value.id) {
      await ResourceApi.createResource(data)
      message.success(t('common.createSuccess'))
    } else {
      await ResourceApi.updateResource(data)
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
