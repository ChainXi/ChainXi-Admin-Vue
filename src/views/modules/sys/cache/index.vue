<template>
  <ContentWrap v-show="showSearch">
    <!-- {{ $t('common.query') }}工作栏 -->
    <el-form @submit.native.prevent class="-mb-15px" :model="viewModel.dataForm" ref="queryFormRef" :inline="true">
      <el-form-item :label="$t('cacheManager.cacheName')" prop="name">
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
        <el-table-column :label="$t('cacheManager.cacheName')" align="center" prop="name" width="200" />
        <el-table-column :label="$t('cacheManager.expireTimes')" align="left" width="280">
          <template #default="scope">
            <el-space wrap>
              <el-tag
                v-for="(et, idx) in scope.row.expireTimes"
                :key="idx"
                type="info"
                disable-transitions
              >{{ formatExpire(et) }}</el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.remark')" align="center" prop="remark" />
        <el-table-column :label="$t('common.action')" align="center">
          <template #default="scope" width="150">
            <el-button type="primary" @click="openForm(scope.row.name)" v-if="$hasPermission('menu:save')">
              <Icon icon="ep:edit" />
              {{ $t('action.update') }}
            </el-button>
            <el-button type="warning" @click="handleClear(scope.row.name)" v-if="$hasPermission('system:oauth2-token:delete')">
              <Icon icon="ep:delete" />
              {{ $t('action.clear') }}
            </el-button>
            <el-button type="danger" @click="handleDelete(scope.row.name)" v-if="$hasPermission('system:oauth2-token:delete')">
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
import * as CacheInfonApi from '@/api/sys/cache'
import { StorageCacheEnum } from '@/api/sys/cache'
import useViewModule from '@/hooks/view-module'
import type { TagSwitch } from '@/types/table'
import SysCacheFormSave from './form.vue'
const { t } = useI18n()
const message = useMessage() // 消息弹窗
const showSearch = ref<boolean>(true)
const columnControllerRef = ref()

defineOptions({ name: 'CacheInfoManager' })

const queryFormRef = ref() // 搜索的表单

const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete } = useViewModule({
  pagination: true,
  requestQuery: CacheInfonApi.getCacheInfoPage,
  requestDelete: CacheInfonApi.deleteCacheInfoByName,
  queryFormRef
})
const handleClear = (name: string) => {
  message
    .delConfirm()
    .then(() => {
      CacheInfonApi.resetCache(name)
        .then((_res) => {
          message.success(t('common.success'))
        })
        .catch((e) => {
          message.error(e)
        })
    })
    .catch(() => {})
}
/** 添加/修改操作 */
const formRef = ref()
const openForm = (name: number) => {
  formRef.value.open(name)
}

viewModel.dataForm = reactive({
  name: null
})

const formatExpire = (et: CacheInfonApi.CacheExpireTime) => {
  if (!et) return ''
  const name = et.storageCache === StorageCacheEnum.CAFFEINE ? 'CAFFEINE' : 'REDIS'
  return `${name}:${et.expireTime}s`
}
</script>
