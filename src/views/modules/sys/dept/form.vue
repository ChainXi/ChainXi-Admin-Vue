<template>
  <Dialog v-model="dialogVisible" :title="!modelValue.id ? $t('action.create') : $t('action.update')" @keyup.enter="submitForm">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" :rules="formRules" label-width="auto">
      <el-row v-if="pid">
        <el-col :span="24">
          <el-form-item :label="$t('deptManager.deptParenName')" prop="deptName">
            <el-input v-model="pid" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('deptManager.deptName')" prop="deptName">
            <el-input v-model="modelValue.deptName" :placeholder="$t('common.inputText')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('deptManager.leader')" prop="leaderId">
            <el-select
              v-model="modelValue.leader.id"
              filterable
              remote
              :placeholder="$t('common.inputText')"
              remote-show-suffix
              :remote-method="remoteMethod"
              :loading="filterLoading"
            >
              <el-option v-for="item in userIndexMapPage.dataList" :key="item.id" :label="item.userName" :value="item.id" />
              <template #footer>
                <Pagination :total="parseInt(userIndexMapPage.total)" />
              </template>
            </el-select>
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
import { debounce, cloneDeep } from 'lodash-es'
import type { FormInstance, FormRules } from 'element-plus'
import * as DeptApi from '@/api/sys/organization/dept'
import * as UserApi from '@/api/sys/user'
import { Ref } from 'vue'

const { t } = useI18n()
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref<boolean>(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formRef = ref<FormInstance>()

const formRules = computed<FormRules>(() => {
  return {
    deptName: [{ required: true, message: t('validate.required'), trigger: 'blur' }],
    sort: [{ required: true, message: t('validate.required'), trigger: 'change' }]
  }
})
const pid = ref<string>(undefined)
const defaultData: DeptApi.SysDeptDetailRespVo = {
  id: undefined,
  deptName: '',
  status: 0,
  sort: 0,
  leader: { id: undefined, userName: undefined, nickName: undefined }
}

const modelValue: Ref<DeptApi.SysDeptDetailRespVo> = ref(cloneDeep(defaultData))

/** 打开弹窗 */
const open = async (id: string | undefined | null, pNode?: string | undefined | null) => {
  resetForm()
  dialogVisible.value = true
  pid.value = pNode
  if (id) {
    try {
      formLoading.value = true
      let data = (await DeptApi.getDeptDetail(id)).data
      modelValue.value = data
      userIndexMapPage.dataList = [data.leader]
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
      const reqVo: DeptApi.DeptCreateReqVo = {
        deptName: data.deptName,
        leaderId: data.leader?.id,
        sort: 0,
        pid: pid.value
      }
      await DeptApi.createDept(reqVo)
      message.success(t('common.createSuccess'))
    } else {
      const reqVo: DeptApi.DeptUpdateReqVo = {
        id: data.id,
        deptName: data.deptName,
        leaderId: data.leader?.id,
        sort: 0
      }
      await DeptApi.updateDept(reqVo)
      message.success(t('common.updateSuccess'))
    }
    // 发送操作成功的事件
    emit('onSuccess')
  } finally {
    dialogVisible.value = false
    formLoading.value = false
  }
}

const filterLoading = ref(false)
const userIndexMapPage = reactive({
  dataList: [] as UserApi.UserIndexMapVo[],
  pageNo: 1,
  pageSize: 10,
  total: '0',
  name: undefined
})
const remoteMethod = debounce(async (name: string) => {
  if (name === userIndexMapPage.name) {
    return
  }
  userIndexMapPage.name = name
  filterLoading.value = true
  const reqVo: UserApi.UserIndexMapPageReqVo = {
    pageNo: userIndexMapPage.pageNo,
    pageSize: userIndexMapPage.pageSize,
    name: userIndexMapPage.name
  }
  const data = (await UserApi.getIndexMapUserList(reqVo)).data
  userIndexMapPage.dataList = data.list
  userIndexMapPage.total = data.total
  filterLoading.value = false
}, 200)
</script>
