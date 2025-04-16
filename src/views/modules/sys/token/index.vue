<template>
  <ContentWrap v-show="showSearch">
    <!-- {{ $t('common.query') }}工作栏 -->
    <el-form @submit.native.prevent class="-mb-15px" :model="viewModel.dataForm" ref="queryFormRef" :inline="true" label-width="auto">
      <el-form-item :label="$t('tokenManager.userId')" prop="userId">
        <el-input
          v-model="viewModel.dataForm.userId"
          :placeholder="$t('tokenManager.pleaseInoutUserId')"
          clearable
          @keyup.enter="handleSearchQuery"
          
        />
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
    <right-toolbar v-model:show-search="showSearch" @refresh="handleQuery()" :columns="(columnControllerRef?.controller as TagSwitch[])" />
    <el-table v-loading="viewModel.queryLoading" :data="viewModel.dataList">
      <tag-controller ref="columnControllerRef">
        <el-table-column :label="$t('tokenManager.userId')" align="center" prop="userId" />
        <el-table-column :label="$t('tokenManager.accessToken')" align="center" prop="accessToken" width="300" />
        <el-table-column :label="$t('tokenManager.refreshToken')" align="center" prop="refreshToken" width="300" />
        <el-table-column :label="$t('tokenManager.expiresTime')" align="center" prop="expiresTime" :formatter="dateFormatter" width="180" />
        <el-table-column :label="$t('common.createTime')" align="center" prop="createTime" :formatter="dateFormatter" width="180" />
        <el-table-column :label="$t('common.query')" align="center">
          <template #default="scope">
            <el-button link type="danger" @click="handleDelete(scope.row.refreshToken)" v-if="$hasPermission('system:oauth2-token:delete')">
              {{ $t('tokenManager.kickOff') }}
            </el-button>
          </template>
        </el-table-column>
      </tag-controller>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="viewModel.total" v-model:page="viewModel.pageNo" v-model:limit="viewModel.pageSize" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as TokenApi from '@/api/sys/auth/token'
import useViewModule from '@/hooks/view-module'
import { TagSwitch } from '@/types/table'
const showSearch = ref<boolean>(true)
const columnControllerRef = ref()

defineOptions({ name: 'SystemTokenClient' })

const queryFormRef = ref() // 搜索的表单

const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete } = useViewModule({
  pagination: true,
  requestQuery: TokenApi.getAccessTokenPage,
  requestDelete: TokenApi.deleteRAToken,
  queryFormRef
})

viewModel.dataForm = reactive({
  userId: null
})
</script>
