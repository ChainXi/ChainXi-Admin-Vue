<template>
  <Dialog v-model="dialogVisible" :title="$t('userManager.userImport')" width="400">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">
        {{ $t('fileUpload.dragFileForUploadding') }}
        <em>{{ $t('fileUpload.clickForUploadding') }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            {{ $t('userManager.whetherUpdateExisitUser') }}
          </div>
          <span>{{ $t('fileUpload.onlySupportXLSXLSX') }}</span>
          <el-link :underline="false" style="font-size: 12px; vertical-align: baseline" type="primary" @click="importTemplate">
            {{ $t('fileUpload.tmplateDowload') }}
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">{{ $t('common.ok') }}</el-button>
      <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as UserApi from '@/api/sys/user'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/utils/download'

defineOptions({ name: 'SystemUserImportForm' })

const { t } = useI18n()

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const uploadRef = ref()
const importUrl = import.meta.env.VITE_API_URL + '/sys/user/import'
const uploadHeaders = ref() // 上传 Header 头
const fileList = ref([]) // 文件列表
const updateSupport = ref(0) // 是否更新已经存在的用户数据

/** 打开弹窗 */
const open = () => {
  dialogVisible.value = true
  resetForm()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const submitForm = async () => {
  if (fileList.value.length == 0) {
    message.error(t('fileUpload.pleaseUploadFile'))
    return
  }
  // 提交请求
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getAccessToken(),
    'tenant-id': getTenantId()
  }
  formLoading.value = true
  uploadRef.value!.submit()
}

/** 文件上传成功 */
const emits = defineEmits(['success'])
const submitFormSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    formLoading.value = false
    return
  }
  // 拼接提示语
  const data = response.data
  let text = t('fileUpload.numberOfUploadSuccess') + data.createUsernames.length + ';'
  for (let username of data.createUsernames) {
    text += '< ' + username + ' >'
  }
  text += t('fileUpload.numberOfUpdateSuccess')  + data.updateUsernames.length + ';'
  for (const username of data.updateUsernames) {
    text += '< ' + username + ' >'
  }
  text += t('fileUpload.numberOfUpdateFailed')  + Object.keys(data.failureUsernames).length + ';'
  for (const username in data.failureUsernames) {
    text += '< ' + username + ': ' + data.failureUsernames[username] + ' >'
  }
  message.alert(text)
  // 发送操作成功的事件
  emits('success')
}

/** 上传错误提示 */
const submitFormError = (): void => {
  message.error(t('fileUpload.numberOfUpdateSuccess'))
  formLoading.value = false
}

/** 重置表单 */
const resetForm = () => {
  // 重置上传状态和文件
  formLoading.value = false
  uploadRef.value?.clearFiles()
}

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error(t('fileUpload.uploadMaximumOfOneFile'))
}

/** 下载模板操作 */
const importTemplate = async () => {
  const res = (await UserApi.importUserTemplate()).data
  download.excel(res, '用户导入模版.xls')
}
</script>
