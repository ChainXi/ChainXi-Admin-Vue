<template>
  <ContentWrap v-if="showSearch">
    <el-form class="-mb-15px" :model="viewModel.dataForm" ref="queryFormRef" :inline="true" label-width="auto">
      <el-form-item :label="$t('dictManager.name')" prop="dictType">
        <el-select v-model="viewModel.dataForm.dictType">
          <el-option v-for="item in dictTypeList" :key="item.type" :label="item.name" :value="item.type" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('dictManager.label')" prop="label">
        <el-input v-model="viewModel.dataForm.label" :placeholder="$t('common.inputText')" />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select v-model="viewModel.dataForm.status" placeholder="数据状态" clearable class="!w-240px">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleSearchQuery">
          <Icon icon="ep:search" class="mr-5px" />
          {{ $t('common.query') }}
        </el-button>
        <el-button @click="handleResetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
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
          <el-button type="success" plain @click="handleExport" :loading="viewModel.exportLoading" v-if="$hasPermission('menu:save')">
            <Icon icon="ep:download" class="mr-5px" />
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
        <el-table-column :label="$t('common.id')" align="center" prop="id" />
        <el-table-column :label="$t('dictManager.name')" align="center" prop="label" />
        <el-table-column :label="$t('dictManager.value')" align="center" prop="value" />
        <el-table-column :label="$t('common.sort')" align="center" prop="sort" />
        <el-table-column :label="$t('common.status')" align="center" prop="status">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('dictManager.colorType')" align="center" prop="colorType" />
        <el-table-column :label="$t('dictManager.cssClass')" align="center" prop="cssClass" />
        <el-table-column :label="$t('common.remark')" align="center" prop="remark" show-overflow-tooltip />
        <el-table-column :label="$t('common.createTime')" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
        <el-table-column :label="$t('common.action')" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="openForm(scope.row.id)" v-if="$hasPermission('menu:save')">
              {{ $t('action.update') }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row.id)" v-if="$hasPermission('menu:save')">
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
  <SystemDictDataForm ref="formRef" @success="handleQuery" />
</template>
<script lang="ts" setup>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as DictDataApi from '@/api/sys/dict/dict.data'
import * as DictTypeApi from '@/api/sys/dict/dict.type'
import SystemDictDataForm from './form.vue'
import useViewModule from '@/hooks/view-module'
import { TagSwitch } from '@/types/table'

defineOptions({ name: 'SystemDictData' })
const route = useRoute() // 路由

const columnControllerRef = ref() //表格
const queryFormRef = ref() // 搜索的表单
const showSearch = ref<boolean>(true)
const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete, handleExport } = useViewModule({
  queryFormRef: queryFormRef,
  pagination: true,
  requestQuery: DictDataApi.getDictDataPage,
  requestDelete: DictDataApi.exportDictData,
  requestExported: DictDataApi.exportDictData
})
viewModel.dataForm.dictType = route.params.pathMatch

/** 添加/修改操作 */
const formRef = ref()
const openForm = (id?: number) => {
  formRef.value.open(id, viewModel.dataForm.dictType)
}
const dictTypeList = ref<DictTypeApi.DictTypeSimpleRespVo[]>() // 字典类型的列表
/** 初始化 **/
onMounted(async () => {
  // 查询字典（精简)列表
  dictTypeList.value = (await DictTypeApi.getIndexMapDictTypeList()).data
})
</script>
