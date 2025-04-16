<template>
  <!-- {{ $t('common.query') }}工作栏 -->
  <ContentWrap v-show="showSearch">
    <el-form ref="queryFormRef" :model="viewModel.dataForm" :inline="true" @keyup.enter.native="handleQuery()" label-width="auto">
      <el-form-item class="!mb-0" :label="$t('menuManager.name')" prop="name">
        <el-input v-model="viewModel.dataForm.name" clearable :placeholder="$t('menuManager.name')">
          <template #prefix>
            <Icon icon="ep:document" style="color: #4b4b4b" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item class="!mb-0" :label="$t('common.status')" prop="status">
        <el-select v-model="viewModel.dataForm.status" clearable :placeholder="$t('menuManager.pleaseSelectMenuStatus')" class="!w-240px">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_STATUS)" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="!mb-0">
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
  <ContentWrap>
    <el-row>
      <el-col :span="12">
        <el-form-item>
          <el-button v-if="$hasPermission('menu:save')" plain type="primary" @click="openForm(undefined)">
            <Icon class="mr-5px" icon="ep:plus" />
            {{ $t('action.create') }}
          </el-button>
          <el-button type="primary" @click="toggleExpandAll">{{ $t('common.expandOrCollapse') }}</el-button>
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
    <!-- 列表 -->
    <el-table v-if="refreshTable" v-loading="viewModel.queryLoading" row-key="id" :data="menuTree" :default-expand-all="collapse" border>
      <tag-controller ref="columnControllerRef">
        <el-table-column :label="$t('menuManager.name')" header-align="center" :ignoreControl="true" min-width="150">
          <template #default="scope">
            {{ $t(scope.row.name) }}
          </template>
        </el-table-column>
        <el-table-column prop="icon" :label="$t('menuManager.icon')" header-align="center" align="center">
          <template #default="scope">
            <div class="flex flex-items-center justify-center">
              <Icon :size="24" :icon="`${scope.row.icon}`" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('menuManager.type')" header-align="center" align="center">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.SYSTEM_MENU_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('common.sort')" header-align="center" align="center" />
        <el-table-column prop="status" :label="$t('common.status')" header-align="center" align="center">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.SYSTEM_MENU_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column
          prop="componentPath"
          :label="$t('menuManager.componentPath')"
          header-align="center"
          align="center"
          width="150"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          prop="perPath"
          :label="$t('menuManager.permissions')"
          header-align="center"
          align="center"
          width="150"
          :show-overflow-tooltip="true"
        >
          <template #default="scope">
            <el-tag size="small">{{ scope.row.perPath || 'N/A' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.action')" fixed="right" header-align="center" align="center" width="150">
          <template #default="scope">
            <el-button v-if="$hasPermission('menu:save')" type="primary" size="small" @click="openForm(scope.row.id)">
              {{ $t('action.update') }}
            </el-button>
            <el-button v-if="$hasPermission('menu:remove')" type="danger" size="small" @click="handleDelete(scope.row.id)">
              {{ $t('action.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </tag-controller>
    </el-table>

    <!-- 弹窗, 新增 / 修改 -->
    <menu-form ref="formRef" :menu-tree="menuTree" @on-success="handleQuery" />
  </ContentWrap>
</template>

<script setup lang="ts">
import menuForm from './form.vue'
import useViewModule from '@/hooks/view-module'
import * as MenuApi from '@/api/sys/menu'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

import type { TagSwitch } from '@/types/table'
import { handleTree } from '@/utils/tree'

const queryFormRef = useTemplateRef('queryFormRef') // 搜索的表单
const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete } = useViewModule({
  requestQuery: MenuApi.getMenuList,
  requestDelete: MenuApi.deleteMenu,
  queryFormRef
})
const menuTree = computed(() => handleTree(viewModel.dataList, 'id', 'children', (e) => e.pid))
const columnControllerRef = ref()
const showSearch = ref<boolean>(true)

const collapse = ref<boolean>(true)
const refreshTable = ref<boolean>(true)
/** 展开/折叠操作 */
const toggleExpandAll = () => {
  refreshTable.value = false
  collapse.value = !collapse.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (id: number) => {
  formRef.value.open(id)
}
</script>

<style scoped></style>
