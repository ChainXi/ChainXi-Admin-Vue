<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" @keyup.enter="submitForm">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-row class="mb-5">
        <UserAvatar ref="userAvatarRef" :value="imgPreffix + modelValue.avatar" @upload:file="handleAvatarUpload" />
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item v-if="modelValue.id === undefined" :label="$t('userManager.userName')" prop="userName">
            <el-input v-model="modelValue.userName" :placeholder="$t('userManager.pleaseInputUserName')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="modelValue.id === undefined" :label="$t('userManager.password')" prop="password">
            <el-input v-model="modelValue.password" :placeholder="$t('userManager.pleaseInputPassword')" show-password type="password" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('userManager.phoneNumber')" prop="phoneNumber">
            <el-input v-model="modelValue.phoneNumber" maxlength="11" :placeholder="$t('userManager.pleaseInputPhoneNumber')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('userManager.eMail')" prop="email">
            <el-input v-model="modelValue.email" maxlength="50" :placeholder="$t('userManager.pleaseInputEMail')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('userManager.nickName')" prop="nickName">
            <el-input v-model="modelValue.nickName" :placeholder="$t('userManager.pleaseInputNickName')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('userManager.sex')">
            <el-select v-model="modelValue.sex" :placeholder="$t('common.selectText')">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="归属部门" prop="deptId">
            <el-tree-select
              v-model="modelValue.deptId"
              :data="deptList"
              :props="defaultProps"
              check-strictly
              node-key="id"
              placeholder="请选择归属部门"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('common.remark')">
            <el-input v-model="modelValue.remark" :placeholder="$t('common.pleaseInputRemark')" type="textarea" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">{{ $t('common.ok') }}</el-button>
      <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import UserAvatar from '@/views/modules/profile/components/UserAvatar.vue'
import { cloneDeep } from 'lodash-es'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'
import * as UserApi from '@/api/sys/user'
import * as DeptApi from '@/api/sys/organization/dept'
import * as FileApi from '@/api/file'
import type { FormRules } from 'element-plus'

defineOptions({ name: 'SystemUserForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const deptList = ref<Tree[]>([]) // 树形结构
const defaultData = {
  id: undefined,
  nickName: '',
  deptId: undefined,
  phoneNumber: '',
  email: '',
  userName: '',
  password: '',
  sex: undefined,
  avatar: '#',
  remark: '',
  status: CommonStatusEnum.ENABLE,
  roleIds: []
}
const imgPreffix = import.meta.env.VITE_APP_IMG_PREFIX + '/'
const newAvatar = ref<Blob>()
const modelValue = ref<UserApi.UserUpdateReqVo>(cloneDeep(defaultData))
const formRules = reactive({
  userName: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  nickname: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  password: [{ required: true, message: t('common.nonNull'), trigger: 'blur' }],
  email: [
    {
      required: true,
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change']
    }
  ],
  mobile: [
    {
      pattern: /^(?:(?:\+|00)86)?1(?:3[\d]|4[5-79]|5[0-35-9]|6[5-7]|7[0-8]|8[\d]|9[189])\d{8}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ]
} as FormRules)
const formRef = useTemplateRef('formRef') // 表单 Ref
const userAvatarRef = useTemplateRef('userAvatarRef')

onMounted(() => {
  DeptApi.getIndexMapDeptList().then((res) => {
    deptList.value = handleTree(
      res.data.map((e) => {
        return { id: e.id, name: e.deptName }
      }),
      'id',
      'children',
      getParentFunc
    )
  })
})
const handleAvatarUpload = (data: Blob) => {
  newAvatar.value = data
  unref(userAvatarRef).cropperAvatar.close()
}
const getParentFunc = (e: { id: string; name: string }) => {
  let id = BigInt(e.id)
  if (id >> 8n === 0n) {
    return null
  }
  let mask = 0n
  while (id >> (mask + 8n) !== 0n) {
    mask += 8n
  }
  return (id & ((1n << mask) - 1n)).toString()
}
/** 打开弹窗 */
const open = async (id: number | undefined | null) => {
  dialogVisible.value = true
  resetForm()
  if (id) {
    dialogTitle.value = t('action.update')
    try {
      formLoading.value = true
      const userRespVo = (await UserApi.getUser(id)).data
      modelValue.value = userRespVo
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
    if (unref(newAvatar)) {
      modelValue.value.avatar = await FileApi.uploadFile(unref(newAvatar))
    }
    const data = modelValue.value
    if (!modelValue.value.id) {
      await UserApi.createUser(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserApi.updateUser(data)
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
