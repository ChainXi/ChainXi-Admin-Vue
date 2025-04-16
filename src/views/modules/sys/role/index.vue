<template>
  <ContentWrap v-show="showSearch">
    <!-- {{ $t('common.query') }}工作栏 -->
    <el-form ref="queryFormRef" :inline="true" :model="viewModel.dataForm" class="-mb-15px" label-width="auto">
      <el-form-item :label="$t('roleManager.roleName')" prop="name">
        <el-input
          v-model="viewModel.dataForm.name"
          clearable
          :placeholder="$t('roleManager.pleaseInputRoleName')"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="viewModel.dataForm.status" clearable :placeholder="$t('common.selectText')" class="!w-240px">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.createTime')" prop="createTime">
        <el-date-picker
          v-model="viewModel.dataForm.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          :end-placeholder="$t('common.startDate')"
          :start-placeholder="$t('common.endDate')"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          {{ $t('common.query') }}
        </el-button>
        <el-button @click="handleResetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          {{ $t('common.reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-row>
      <el-col :span="12">
        <el-form-item>
          <el-button v-if="$hasPermission('menu:save')" plain type="primary" @click="openForm(undefined)">
            <Icon class="mr-5px" icon="ep:plus" />
            {{ $t('action.create') }}
          </el-button>
          <el-button v-if="$hasPermission('menu:save')" :loading="viewModel.exportLoading" plain type="success" @click="handleExport">
            <Icon class="mr-5px" icon="ep:download" />
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
        <el-table-column align="center" :label="$t('common.id')" prop="id" />
        <el-table-column align="center" :label="$t('roleManager.roleName')" prop="name" />
        <el-table-column align="center" :label="$t('common.sort')" prop="sort" />
        <el-table-column align="center" :label="$t('common.remark')" prop="remark" />
        <el-table-column align="center" :label="$t('common.status')" prop="status">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column :formatter="dateFormatter" align="center" :label="$t('common.createTime')" prop="createTime" width="180" />
        <el-table-column :width="300" align="center" :label="$t('common.status')">
          <template #default="scope">
            <el-button v-if="$hasPermission('menu:save')" link type="primary" @click="openForm(scope.row.id)">
              <Icon icon="ep:edit" />
              {{ $t('action.update') }}
            </el-button>
            <el-button
              v-if="$hasPermission('menu:save')"
              link
              :title="$t('roleManager.assignMenu')"
              type="primary"
              @click="openAssignMenuForm(scope.row)"
            >
            <Icon icon="ep:basketball" />
              {{ $t('roleManager.assignMenu') }}
            </el-button>
            <el-button v-if="$hasPermission('menu:save')" link type="danger" @click="handleDelete(scope.row.id)">
              <Icon icon="ep:delete" />
              {{ $t('action.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </tag-controller>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="viewModel.total" v-model:page="viewModel.pageNo" v-model:limit="viewModel.pageSize" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <FormSysRoleSave ref="formRef" @success="handleSearchQuery" />
  <!-- 表单弹窗：菜单权限 -->
  <FormSysRoleAssignMenu ref="assignMenuFormRef" @success="handleSearchQuery" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import useViewModule from '@/hooks/view-module'
import * as RoleApi from '@/api/sys/role'
import FormSysRoleSave from './formSave.vue'
import FormSysRoleAssignMenu from './formAssignMenu.vue'
import type { TagSwitch } from '@/types/table'
import type { DateOrDates } from 'element-plus'

defineOptions({ name: 'SystemRole' })
const columnControllerRef = ref()
const showSearch = ref<boolean>(true)

const queryFormRef = ref() // 搜索的表单
const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete, handleExport } = useViewModule({
  pagination: true,
  requestQuery: RoleApi.getRolePage,
  requestDelete: RoleApi.deleteRole,
  requestExported: RoleApi.exportRole,
  queryFormRef
})
viewModel.dataForm = {
  pageNo: 1,
  pageSize: 10,
  name: '',
  status: undefined,
  createTime: [] as unknown as DateOrDates
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (id?: number) => {
  formRef.value.open(id)
}

/** 数据权限操作 */
const dataPermissionFormRef = ref()
const openDataPermissionForm = async (row: RoleApi.RoleVO) => {
  dataPermissionFormRef.value.open(row)
}

/** 菜单权限操作 */
const assignMenuFormRef = ref()
const openAssignMenuForm = async (row: RoleApi.RoleVO) => {
  assignMenuFormRef.value.open(row)
}
</script>
