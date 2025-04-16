<template>
  <ContentWrap v-show="showSearch">
    <!-- {{ $t('common.query') }}工作栏 -->
    <el-form @submit.native.prevent class="-mb-15px" :model="viewModel.dataForm" ref="queryFormRef" :inline="true" label-width="auto">
      <el-form-item :label="$t('resourceManager.name')" prop="name">
        <el-input v-model="viewModel.dataForm.name" :placeholder="$t('common.inputText')" clearable @keyup.enter="handleSearchQuery" />
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
        <el-button v-if="$hasPermission('menu:save')" plain type="primary" @click="openForm(undefined)">
          <Icon class="mr-5px" icon="ep:plus" />
          {{ $t('action.create') }}
        </el-button>
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
        <el-table-column :label="$t('common.id')" align="center" prop="id" width="100" />
        <el-table-column :label="$t('resourceManager.name')" align="center" prop="name" width="100" />
        <el-table-column :label="$t('resourceManager.patterns')" align="center" prop="patterns" width="150" />
        <el-table-column :label="$t('resourceManager.methods')" align="center" width="200">
          <template #default="scope">
            <el-tag v-for="item in scope.row.methods">
              {{ RequestMethod[parseInt(item)] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('resourceManager.categoryId')" align="center" prop="categoryId" width="150" />
        <el-table-column :label="$t('resourceManager.mappingType')" align="center" prop="mappingType" width="150">
          <template #default="scope">
            <el-tag>
              {{ ResourceApi.ResourceMappingType[parseInt(scope.row.mappingType)] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('resourceManager.accessType')" align="center" prop="accessType" width="150">
          <template #default="scope">
            <el-tag>
              {{ ResourceApi.ResourceAccessType[parseInt(scope.row.accessType)] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.action')" align="center">
          <template #default="scope">
            <el-button type="primary" @click="openForm(scope.row.id)" v-if="$hasPermission('menu:save')">
              <Icon icon="ep:edit" />
              {{ $t('action.update') }}
            </el-button>
            <el-button type="danger" @click="handleDelete(scope.row.id)" v-if="$hasPermission('system:oauth2-token:delete')">
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
  <!-- 添加或修改缓存对话框 -->
  <SysCacheFormSave ref="formRef" @success="handleSearchQuery" />
</template>

<script lang="ts" setup>
import * as ResourceApi from '@/api/sys/resource'
import useViewModule from '@/hooks/view-module'
import { TagSwitch } from '@/types/table'
import { RequestMethod } from '@/utils/constants'
import SysCacheFormSave from './form.vue'
const { t } = useI18n()
const message = useMessage() // 消息弹窗
const showSearch = ref<boolean>(true)
const columnControllerRef = ref()

defineOptions({ name: 'ResourceManager' })

const queryFormRef = ref() // 搜索的表单

const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete } = useViewModule({
  pagination: true,
  requestQuery: ResourceApi.getResourcePage,
  requestDelete: ResourceApi.deleteResourceById,
  queryFormRef
})

/** 添加/修改操作 */
const formRef = ref()
const openForm = (name: number) => {
  formRef.value.open(name)
}

viewModel.dataForm = reactive({
  name: null
})
</script>
