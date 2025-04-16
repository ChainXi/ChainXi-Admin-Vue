<template>
  <ContentWrap v-show="showSearch">
    <!-- {{ $t('common.query') }}工作栏 -->
    <el-form @submit.native.prevent class="-mb-15px" :model="viewModel.dataForm" ref="queryFormRef" :inline="true">
      <el-form-item :label="$t('oauth2Manager.name')" prop="name">
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
    <el-table v-loading="viewModel.queryLoading" :data="viewModel.dataList" show-overflow-tooltip>
      <tag-controller ref="columnControllerRef">
        <el-table-column :label="$t('common.id')" align="center" prop="clientId" width="100" />
        <el-table-column :label="$t('oauth2Manager.name')" align="center" prop="name" />
        <el-table-column :label="$t('oauth2Manager.secret')" align="center" prop="secret" />
        <el-table-column :label="$t('oauth2Manager.origin')" align="center" prop="origin" />
        <el-table-column :label="$t('oauth2Manager.logoutCall')" align="center" prop="logoutCall" />
        <el-table-column :label="$t('common.remark')" align="center" prop="description" />
        <el-table-column :label="$t('common.action')" align="center">
          <template #default="scope" width="150">
            <el-button type="primary" @click="openForm(scope.row.clientId)" v-if="$hasPermission('menu:save')">
              <Icon icon="ep:edit" />
              {{ $t('action.update') }}
            </el-button>
            <el-button type="danger" @click="handleDelete(scope.row.clientId)" v-if="$hasPermission('system:oauth2-token:delete')">
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
  <OAuth2ClientInfoFormSave ref="formRef" @success="handleSearchQuery" />
</template>

<script lang="ts" setup>
import * as OAuth2ClientInfoApi from '@/api/sys/auth/oauth2-client'
import useViewModule from '@/hooks/view-module'
import { TagSwitch } from '@/types/table'
import OAuth2ClientInfoFormSave from './form.vue'
const { t } = useI18n()
const message = useMessage() // 消息弹窗
const showSearch = ref<boolean>(true)
const columnControllerRef = ref()

defineOptions({ name: 'CacheInfoManager' })

const queryFormRef = ref() // 搜索的表单

const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete } = useViewModule({
  pagination: true,
  requestQuery: OAuth2ClientInfoApi.queryPage,
  requestDelete: OAuth2ClientInfoApi.deleteClientInfoByClientId,
  queryFormRef
})
/** 添加/修改操作 */
const formRef = ref()
const openForm = (clientId: number) => {
  formRef.value.open(clientId)
}

viewModel.dataForm = reactive({
  name: null
})
</script>
