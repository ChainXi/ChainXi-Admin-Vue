<template>
  <!-- 导入表 -->
  <el-dialog title="导入表" v-model="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="queryParams.tableName" placeholder="请输入表名称" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="queryParams.tableComment" placeholder="请输入表描述" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" />重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="dbTableList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="tableName" label="表名称" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="tableComment" label="表描述" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间"></el-table-column>
      </el-table>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleImportTable">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { listDbTable, importTable } from '@/api/tool/gen'

const tableRef = useTemplateRef('table')
const queryRef = useTemplateRef('queryRef')
const message = useMessage()
const visible = ref(false)
const tables = ref([])
const dbTableList = ref([])

const queryParams = reactive({
  tableName: undefined,
  tableComment: undefined
})

const emit = defineEmits(['ok'])

/** 查询参数列表 */
function show() {
  getList()
  visible.value = true
}

/** 单击选择行 */
function clickRow(row) {
  tableRef.value?.toggleRowSelection(row, null)
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  tables.value = selection.map((item) => item.tableName)
}

/** 查询表数据 */
function getList() {
  listDbTable(queryParams).then((res) => {
    dbTableList.value = res.data
    // total.value = res.data.total;
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryRef.value?.resetFields()
  handleQuery()
}

/** 导入按钮操作 */
function handleImportTable() {
  if (tables.value.length === 0) {
    message.error('请选择要导入的表')
    return
  }
  importTable({ tables: tables.value }).then((res) => {
    message.success(res.msg)
    if (res.code === 200) {
      visible.value = false
      emit('ok')
    }
  })
}

defineExpose({
  show
})
</script>
