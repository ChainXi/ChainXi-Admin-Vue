<template>
  <el-row>
    <el-col>
      <!-- {{ $t('common.query') }} -->
      <ContentWrap v-show="showSearch">
        <el-form class="-mb-15px" :model="viewModel.dataForm" ref="queryFormRef" :inline="true" label-width="auto">
          <el-form-item :label="$t('userManager.userName')" prop="username">
            <el-input
              v-model="viewModel.dataForm.username"
              :placeholder="$t('userManager.pleaseInputUserName')"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item :label="$t('userManager.phoneNumber')" prop="mobile">
            <el-input
              v-model="viewModel.dataForm.mobile"
              :placeholder="$t('userManager.pleaseInputPhoneNumber')"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item :label="$t('common.status')" prop="status">
            <el-select v-model="viewModel.dataForm.status" :placeholder="$t('userManager.statusDesc')" clearable class="!w-240px">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="(dict.value as string)"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('common.createTime')" prop="createTime">
            <el-date-picker
              v-model="viewModel.dataForm.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              :start-placeholder="$t('common.startDate')"
              :end-placeholder="$t('common.startDate')"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleSearchQuery">
              <Icon icon="ep:search" />
              {{ $t('common.query') }}
            </el-button>
            <el-button @click="handleResetQuery">
              <Icon icon="ep:refresh" />
              {{ $t('common.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
      <ContentWrap>
        <el-row>
          <el-col :span="12">
            <el-form-item>
              <el-button v-if="$hasPermission('menu:save')" plain type="primary" @click="openForm(undefined)">
                <Icon class="mr-5px" icon="ep:plus" />
                {{ $t('action.create') }}
              </el-button>
              <el-button type="warning" plain @click="handleImport" v-if="$hasPermission('system:user:import')">
                <Icon icon="ep:upload" />
                {{ $t('action.import') }}
              </el-button>
              <el-button
                type="success"
                plain
                @click="handleExport"
                :loading="viewModel.exportLoading"
                v-if="$hasPermission('system:user:export')"
              >
                <Icon icon="ep:download" />
                {{ $t('action.export') }}
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <right-toolbar
              v-model:show-search="showSearch"
              @refresh="handleQuery()"
              :columns="(columnControllerRef?.controller as TagSwitch[])"
            />
          </el-col>
        </el-row>
        <el-table v-loading="viewModel.queryLoading" :data="viewModel.dataList">
          <tag-controller ref="columnControllerRef">
            <el-table-column :label="$t('userManager.avatar')" align="center" key="id" prop="id">
              <template #default="scope">
                <el-avatar :src="imgPreffix + scope.row.avatar" alt="avatar" class="img-circle" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.id')" align="center" key="id" prop="id" />
            <el-table-column :label="$t('userManager.userName')" align="center" prop="userName" :show-overflow-tooltip="true" />
            <el-table-column :label="$t('userManager.nickName')" align="center" prop="nickName" :show-overflow-tooltip="true" />
            <el-table-column :label="$t('userManager.phoneNumber')" align="center" prop="phoneNumber" width="120" />
            <el-table-column :label="$t('common.status')" align="center" key="status">
              <template #default="scope">
                <el-switch v-model="scope.row.status" :active-value="0" :inactive-value="1" @change="handleStatusChange(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.createTime')" align="center" prop="createTime" :formatter="dateFormatter" width="180" />
            <el-table-column :label="$t('common.action')" align="center" width="160">
              <template #default="scope">
                <div class="flex justify-center items-center">
                  <el-button type="primary" link @click="openForm(scope.row.id)" v-if="$hasPermission('menu:save')">
                    <Icon icon="ep:edit" />
                    {{ $t('action.update') }}
                  </el-button>
                  <el-dropdown @command="(command) => handleCommand(command, scope.row)" v-if="$hasPermission('menu:save')">
                    <el-button type="primary" link>
                      <Icon icon="ep:d-arrow-right" />
                      {{ $t('action.more') }}
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="handleDelete" v-if="$hasPermission('menu:save')">
                          <Icon icon="ep:delete" />
                          {{ $t('action.delete') }}
                        </el-dropdown-item>
                        <el-dropdown-item command="handleResetPwd" v-if="$hasPermission('menu:save')">
                          <Icon icon="ep:key" />
                          {{ $t('userManager.resetPassword') }}
                        </el-dropdown-item>
                        <el-dropdown-item command="handleRole" v-if="$hasPermission('menu:save')">
                          <Icon icon="ep:circle-check" />
                          {{ $t('userManager.assignRoles') }}
                        </el-dropdown-item>
                        <el-dropdown-item command="handleDataPermission" v-if="$hasPermission('menu:save')">
                          <Icon icon="ep:circle-check" />
                          {{ $t('userManager.datapermission') }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </tag-controller>
        </el-table>
        <Pagination :total="viewModel.total" v-model:page="viewModel.pageNo" v-model:limit="viewModel.pageSize" />
      </ContentWrap>
    </el-col>
  </el-row>
  <!-- 添加或修改用户对话框 -->
  <SystemUserFormSave ref="formRef" @success="handleSearchQuery" />
  <!-- 用户导入对话框 -->
  <SystemUserFormImport ref="importFormRef" @success="handleSearchQuery" />
  <!-- 分配角色 -->
  <SystemUserFormAssignRole ref="assignRoleFormRef" @success="handleSearchQuery" />
  <SystemUserFormAssignDataPermission ref="assignDataPermissionFormRef" @success="handleSearchQuery" />
</template>
<script lang="ts" setup>
import SystemUserFormSave from './formSave.vue'
import SystemUserFormImport from './formImport.vue'
import SystemUserFormAssignRole from './formAssignRole.vue'
import SystemUserFormAssignDataPermission from './formAssignDataPermission.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { dateFormatter } from '@/utils/formatTime'
import useViewModule from '@/hooks/view-module'
import * as UserApi from '@/api/sys/user'
import { TagSwitch } from '@/types/table'
import type { DateOrDates } from 'element-plus'

const imgPreffix = import.meta.env.VITE_APP_IMG_PREFIX + '/'

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const columnControllerRef = ref() //表格
const queryFormRef = ref() // 搜索的表单
const showSearch = ref<boolean>(true)

const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete, handleExport } = useViewModule({
  pagination: true,
  requestQuery: UserApi.getUserList,
  requestDelete: UserApi.deleteUser,
  requestExported: UserApi.exportUser,
  queryFormRef
})
viewModel.dataForm = {
  pageNo: 1,
  pageSize: 10,
  username: '',
  mobile: '',
  status: '',
  createTime: [] as unknown as DateOrDates
}
/** 修改用户状态 */
const handleStatusChange = async (row: UserApi.UserRespVo) => {
  try {
    // 修改状态的二次确认
    const text = row.status === CommonStatusEnum.ENABLE ? t('common.status0') : t('common.status1')
    await message.confirm(t('userManager.confirmUpdateUserStatus', { action: text, name: row.userName }))
    // 发起修改状态
    await UserApi.updateUserStatus(row.id, row.status)
    // 刷新列表
    handleQuery()
  } catch {
    // 取消后，进行恢复按钮
    row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

/** 操作分发 */
const handleCommand = (command: string, row: UserApi.UserRespVo) => {
  switch (command) {
    case 'handleDelete':
      handleDelete(row.id)
      break
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleRole':
      handleRole(row)
      break
    case 'handleDataPermission':
      handleDataPermission(row.id)
      break
    default:
      break
  }
}

/** 重置密码 */
const handleResetPwd = async (row: UserApi.UserRespVo) => {
  try {
    // 重置的二次确认
    const result = await message.prompt(t('userManager.pleaseInputNewPassword', { name: row.userName }), t('common.reminder'))
    const password = result.value
    // 发起重置
    await UserApi.resetUserPwd(row.id, password)
    message.success(t('userManager.passwordUpdateSuccess', { password }))
  } catch {}
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (id: number) => {
  formRef.value.open(id)
}
/** 用户导入 */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}
/** 分配角色 */
const assignRoleFormRef = ref()
const handleRole = (row: UserApi.UserRespVo) => {
  assignRoleFormRef.value.open(row)
}
const assignDataPermissionFormRef = ref()
const handleDataPermission = (userId: string) => {
  assignDataPermissionFormRef.value.open(userId)
}
</script>

<style scoped></style>
