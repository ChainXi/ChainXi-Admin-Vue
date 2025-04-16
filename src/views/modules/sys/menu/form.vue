<template>
  <Dialog v-model="dialogVisible" :title="!modelValue.id ? $t('action.create') : $t('action.update')" @keyup.enter="submitForm">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-form-item :label="$t('menuManager.parentMenu')">
        <el-tree-select
          v-model="modelValue.pid"
          :data="menuTree"
          :default-expanded-keys="[0]"
          :props="{
            disabled: (e) => e.type === MenuApi.MenuType.BUTTON,
            children: 'children',
            label: (e) => $t(e.name),
            value: 'id',
            isLeaf: 'leaf'
          }"
          check-strictly
          node-key="id"
        />
      </el-form-item>
      <el-form-item :label="$t('menuManager.name')" prop="name">
        <el-input v-model="modelValue.name" clearable :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('menuManager.type')" prop="type">
        <el-radio-group v-model="modelValue.type">
          <el-radio-button v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_TYPE)" :value="dict.value">
            {{ dict.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="modelValue.type !== MenuApi.MenuType.BUTTON" :label="$t('menuManager.icon')">
        <IconSelect v-model="modelValue.icon" clearable />
      </el-form-item>
      <el-form-item v-if="modelValue.type !== MenuApi.MenuType.BUTTON" :label="$t('menuManager.routerPath')" prop="routerPath">
        <template #label>
          <Tooltip :message="$t('menuManager.routerPathDesc')" :title="$t('menuManager.routerPath')" />
        </template>
        <el-input v-model="modelValue.routerPath" clearable :placeholder="$t('menuManager.pleaseInputrouterPath')" />
      </el-form-item>
      <el-form-item v-if="modelValue.type === MenuApi.MenuType.PAGE" :label="$t('menuManager.componentPath')" prop="component">
        <el-input v-model="modelValue.componentPath" clearable :placeholder="$t('menuManager.componentPathDesc')" />
      </el-form-item>
      <el-form-item v-if="modelValue.type !== MenuApi.MenuType.MENU" :label="$t('menuManager.permissions')" prop="permission">
        <template #label>
          <Tooltip :message="$t('menuManager.permissionsDesc')" :title="$t('menuManager.permissions')" />
        </template>
        <el-select v-model="modelValue.resourceIds" :placeholder="$t('menuManager.permissionsSelected')" multiple>
          <el-option v-for="item in resourceList" :label="item.name" :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
              {{ item.patterns }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.sort')" prop="sort">
        <el-input-number v-model="modelValue.sort" :min="0" clearable controls-position="right" />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-radio-group v-model="modelValue.status">
          <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_STATUS)" :value="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="modelValue.type === 1" :label="$t('menuManager.keepAlive')" prop="keepAlive">
        <template #label>
          <Tooltip :message="$t('menuManager.keepAliveDesc')" :title="$t('menuManager.keepAlive')" />
        </template>
        <el-radio-group v-model="modelValue.keepAlive">
          <el-radio key="true" :value="true">{{ $t('common.status0') }}</el-radio>
          <el-radio key="false" :value="false">{{ $t('common.status1') }}</el-radio>
        </el-radio-group>
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
import type { FormInstance, FormRules } from 'element-plus'
import * as MenuApi from '@/api/sys/menu'
import * as ResourceApi from '@/api/sys/resource'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { Ref } from 'vue'

defineProps(['menuTree'])
const { t } = useI18n()
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref<boolean>(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formRef = ref<FormInstance>()

const formRules = computed<FormRules>(() => {
  return {
    name: [{ required: true, message: t('validate.required'), trigger: 'blur' }],
    parentName: [{ required: true, message: t('validate.required'), trigger: 'change' }]
  }
})

const defaultData: MenuApi.SysMenuUpdateReqVo = {
  id: undefined,
  pid: undefined,
  name: '',
  type: null,
  routerPath: '',
  componentPath: '',
  resourceIds: [],
  icon: '',
  keepAlive: true,
  status: 0,
  sort: 0
}
const modelValue: Ref<MenuApi.SysMenuRespVo> = ref(cloneDeep(defaultData))
const resourceList: Ref<ResourceApi.SysResourceVo[]> = ref([])

/** 打开弹窗 */
const open = async (id: string | undefined | null) => {
  resetForm()
  dialogVisible.value = true
  if (id) {
    try {
      formLoading.value = true
      resourceList.value = (await ResourceApi.queryAllResource()).data
      modelValue.value = (await MenuApi.getMenu(id)).data
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 重置表单 */
const resetForm = () => {
  modelValue.value = cloneDeep(defaultData)
}

/** 提交表单 */
const emit = defineEmits(['onSuccess']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = modelValue.value
    if (!modelValue.value.id) {
      await MenuApi.saveMenu(data)
      message.success(t('common.createSuccess'))
    } else {
      await MenuApi.updateMenu(data)
      message.success(t('common.updateSuccess'))
    }
    // 发送操作成功的事件
    emit('onSuccess')
  } finally {
    dialogVisible.value = false
    formLoading.value = false
  }
}
</script>
