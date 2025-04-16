<template>
  <!-- {{ $t('common.query') }}工作栏 -->
  <ContentWrap v-show="showSearch">
    <el-form ref="queryFormRef" :inline="true" :model="viewModel.dataForm" class="-mb-15px"  label-width="auto">
      <el-form-item :label="$t('dictManager.name')" prop="name">
        <el-input v-model="viewModel.dataForm.name"  clearable :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('dictManager.type')" prop="type">
        <el-input v-model="viewModel.dataForm.type"  clearable :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="viewModel.dataForm.status"  clearable :placeholder="$t('common.selectText')" class="!w-240px">
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
        <el-button @click="handleSearchQuery">
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
        <el-table-column align="center" :label="$t('dictManager.name')" prop="name" show-overflow-tooltip />
        <el-table-column align="center" :label="$t('dictManager.type')" prop="type" width="300" />
        <el-table-column align="center" :label="$t('common.status')" prop="status">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('common.remark')" prop="remark" />
        <el-table-column :formatter="dateFormatter" align="center" :label="$t('common.createTime')" prop="createTime" width="180" />
        <el-table-column align="center" :label="$t('common.action')" fixed="right">
          <template #default="scope">
            <el-button v-if="$hasPermission('menu:save')" link type="primary" @click="openForm(scope.row.id)">
              {{ $t('action.update') }}
            </el-button>
            <router-link :to="'/sys/dict-type/dict-data/' + scope.row.type">
              <el-button link type="primary">{{ $t('dictManager.data') }}</el-button>
            </router-link>
            <el-button v-if="$hasPermission('menu:save')" link type="danger" @click="handleDelete(scope.row.id)">
              {{ $t('action.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </tag-controller>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="viewModel.total" v-model:page="viewModel.pageNo" v-model:limit="viewModel.pageSize" @pagination="handleQuery" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <SysDictTypeForm ref="formRef" @on-success="handleQuery" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import useViewModule from '@/hooks/view-module'
import * as DictTypeApi from '@/api/sys/dict/dict.type'
import SysDictTypeForm from './form.vue'
import { TagSwitch } from '@/types/table'

defineOptions({ name: 'SystemDictType' })

const columnControllerRef = ref() //表格
const queryFormRef = ref() // 搜索的表单
const showSearch = ref<boolean>(true)
const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete, handleExport } = useViewModule({
  queryFormRef: queryFormRef,
  pagination: true,
  requestQuery: DictTypeApi.getDictTypePage,
  requestDelete: DictTypeApi.deleteDictType,
  requestExported: DictTypeApi.exportDictType
})
viewModel.dataForm = {
  name: '',
  type: '',
  status: undefined,
  createTime: []
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (id: number) => {
  formRef.value.open(id)
}
</script>
