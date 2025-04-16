<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="queryParams.tableName" placeholder="请输入表名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="queryParams.tableComment" placeholder="请输入表描述" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearchQuery">
          <Icon icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="handleResetQuery">
          <Icon icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain :disabled="multiple" @click="handleGenTable" v-if="$hasPermission('tool:gen:code')">
          <Icon icon="ep:download" />
          生成
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain @click="openCreateTable" v-if="$hasPermission('admin')">
          <Icon icon="ep:plus" />
          创建
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain @click="openImportTable" v-if="$hasPermission('tool:gen:import')">
          <Icon icon="ep:upload" />
          导入
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain :disabled="single" @click="handleEditTable" v-if="$hasPermission('tool:gen:edit')">
          <Icon icon="ep:edit" />
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain :disabled="multiple" @click="handleDelete" v-if="$hasPermission('tool:gen:remove')">
          <Icon icon="ep:delete" />
          删除
        </el-button>
      </el-col>
      <right-toolbar
        v-model:show-search="showSearch"
        @refresh="handleQuery()"
        :columns="(columnControllerRef?.controller as TagSwitch[])"
      />
    </el-row>

    <el-table v-loading="viewModel.queryLoading" :data="viewModel.dataList" @selection-change="handleSelectionChange">
      <tag-controller ref="columnControllerRef">
        <el-table-column type="selection" align="center" width="55"></el-table-column>
        <el-table-column label="序号" type="index" width="50" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="表名称" align="center" prop="tableName" :show-overflow-tooltip="true" />
        <el-table-column label="表描述" align="center" prop="tableComment" :show-overflow-tooltip="true" />
        <el-table-column label="实体" align="center" prop="className" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />
        <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="预览" placement="top">
              <el-button link type="primary" @click="handlePreview(scope.row)" v-if="$hasPermission('tool:gen:preview')">
                <Icon icon="ep:view" />
              </el-button>
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" @click="handleEditTable(scope.row)" v-if="$hasPermission('tool:gen:edit')">
                <Icon icon="ep:edit" />
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" @click="handleDelete(scope.row.tableId)" v-if="$hasPermission('tool:gen:remove')">
                <Icon icon="ep:delete" />
              </el-button>
            </el-tooltip>
            <el-tooltip content="同步" placement="top">
              <el-button link type="primary" @click="handleSynchDb(scope.row)" v-if="$hasPermission('tool:gen:edit')">
                <Icon icon="ep:refresh" />
              </el-button>
            </el-tooltip>
            <el-tooltip content="生成代码" placement="top">
              <el-button link type="primary" @click="handleGenTable(scope.row)" v-if="$hasPermission('tool:gen:code')">
                <Icon icon="ep:download" />
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </tag-controller>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="viewModel.total" v-model:page="viewModel.pageNo" v-model:limit="viewModel.pageSize" />
    <!-- 预览界面 -->
    <el-dialog :title="preview.title" v-model="preview.open" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :label="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :key="value"
        >
          <el-link :underline="false" icon="DocumentCopy" v-copyText="value" v-copyText:callback="copyTextSuccess" style="float: right">
            &nbsp;复制
          </el-link>
          <pre>{{ value }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="importRef" @ok="handleQuery" />
    <create-table ref="createRef" @ok="handleQuery" />
  </div>
</template>

<script lang="ts" setup name="Gen">
import type { TagSwitch } from '@/types/table'
import { listTable, previewTable, delTable, genCode, synchDb, batchGenCode } from '@/api/tool/gen'
import useViewModule from '@/hooks/view-module'
import router from '@/router'
import importTable from './importTable.vue'
import createTable from './createTable.vue'
import download from '@/utils/download'

const message = useMessage()

const queryRef = useTemplateRef('queryRef')
const createRef = useTemplateRef('createRef')
const importRef = useTemplateRef('importRef')
const columnControllerRef = useTemplateRef('columnControllerRef')

const { viewModel, handleQuery, handleResetQuery, handleSearchQuery, handleDelete } = useViewModule({
  pagination: true,
  requestQuery: listTable,
  requestDelete: delTable,
  queryRef
})
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const tableNames = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tableName: undefined,
    tableComment: undefined
  },
  preview: {
    open: false,
    title: '代码预览',
    data: {},
    activeName: 'domain.java'
  }
})

const { queryParams, preview } = toRefs(data)

/** 生成代码操作 */
function handleGenTable(row) {
  const tbNames = row.tableName || tableNames.value
  console.debug(row)
  if (tbNames == '') {
    message.error('请选择要生成的数据')
    return
  }
  if (row.genType === '1') {
    genCode(row.tableName).then((response) => {
      message.success('成功生成到自定义路径：' + row.genPath)
    })
  } else {
    batchGenCode(tbNames).then((response) => {
      download.zip(response.data, 'ruoyi.zip')
    })
  }
}

/** 同步数据库操作 */
function handleSynchDb(row) {
  const tableName = row.tableName
  message
    .confirm('确认要强制同步"' + tableName + '"表结构吗？')
    .then(function () {
      return synchDb(tableName)
    })
    .then(() => {
      message.success('同步成功')
    })
    .catch(() => {})
}

/** 打开导入表弹窗 */
function openImportTable() {
  importRef.value.show()
}

/** 打开创建表弹窗 */
function openCreateTable() {
  createRef.value.show()
}

/** 预览按钮 */
function handlePreview(row) {
  previewTable(row.tableId).then((response) => {
    preview.value.data = response.data
    preview.value.open = true
    preview.value.activeName = 'domain.java'
  })
}

/** 复制代码成功 */
function copyTextSuccess() {
  message.success('复制成功')
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.tableId)
  tableNames.value = selection.map((item) => item.tableName)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 修改按钮操作 */
function handleEditTable(row) {
  const tableId = row.tableId || ids.value[0]
  router.push({ path: '/tool/build/column/' + tableId, query: { pageNum: queryParams.value.pageNum } })
}
</script>
