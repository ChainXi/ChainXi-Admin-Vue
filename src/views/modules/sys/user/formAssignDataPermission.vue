<template>
  <Dialog v-model="dialogVisible" :title="$t('userManager.datapermission')" @keyup.enter="submitForm">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" label-width="auto">
      <el-form-item :label="$t('common.id')">
        <el-tag>{{ modelValue.userId }}</el-tag>
      </el-form-item>
      <el-form-item :label="$t('userManager.datapermissionBatchType')" prop="matchType">
        <el-select v-model="modelValue.matchType" placeholder="Select" clearable>
          <el-option
            v-for="item in Object.keys(DataPermissionUserDeptApi.DataPermissionDeptMatchBucketType).filter(
              (key) => !Number.isNaN(Number(key))
            )"
            :label="DataPermissionUserDeptApi.DataPermissionDeptMatchBucketType[item]"
            :value="parseInt(item)"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('userManager.datapermissionTarget')">
        <el-card class="cardHeight" shadow="never">
          <template #header>
            {{ $t('roleManager.selectAllOrNo') }}
            <el-switch
              v-model="treeNodeAll"
              :active-text="$t('common.yes')"
              :inactive-text="$t('common.no')"
              inline-prompt
              @change="handleCheckedTreeNodeAll"
            />
            {{ $t('roleManager.collspaseAllOrNo') }}
            <el-switch
              v-model="menuExpand"
              :active-text="$t('common.expand')"
              :inactive-text="$t('common.shrink')"
              inline-prompt
              @change="handleCheckedTreeExpand"
            />
          </template>
          <el-tree
            ref="treeRef"
            :data="menuOptions"
            :props="defaultProps"
            :empty-text="$t('common.loading')"
            node-key="id"
            show-checkbox
            :check-strictly="true"
            :default-expand-all="menuExpand"
            @check-change="nodeAuth"
          >
            <template #default="{ node, data }">
              <span>{{ node.label }}</span>
              <el-tag class="ml-10px" v-if="data.cacheChildren?.length" effect="dark" round>{{ $t('roleManager.nodeAuth') }}</el-tag>
            </template>
          </el-tree>
        </el-card>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">{{ $t('common.ok') }}</el-button>
      <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/sys/organization/dept'
import * as DataPermissionUserDeptApi from '@/api/sys/datapermission/user-dept'

defineOptions({ name: 'FormSysRoleAssignMenu' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const defaultData: DataPermissionUserDeptApi.DataPermissionDeptMatcherUpdateReqVo = {
  userId: undefined,
  matchType: undefined,
  target: []
}
type AssignMenuTree = Tree & {
  children?: AssignMenuTree[]
  cacheChildren?: AssignMenuTree[]
}

const modelValue = ref(cloneDeep(defaultData))
const formRef = ref() // 表单 Ref
const menuOptions = ref<AssignMenuTree[]>([]) // 菜单树形结构
const menuExpand = ref(true) // 展开/折叠
const treeRef = ref() // 菜单树组件 Ref
const treeNodeAll = ref(false) // 全选/全不选

const nodeAuth = (data: AssignMenuTree, check: boolean) => {
  if (check) {
    data.cacheChildren = data.children
    data.children = []
  } else if (data.cacheChildren?.length) {
    flatNode(data)
  }
}
const flatNode = (data: AssignMenuTree) => {
  if (data.cacheChildren?.length) {
    data.children = data.cacheChildren
    data.cacheChildren = []
  }
  data.children?.forEach((e) => {
    flatNode(e)
  })
}

const getParentFunc = (e: { id: string; name: string }) => {
  let id = BigInt(e.id)
  if (id >> 8n === 0n) {
    return null
  }
  let mask = 0n
  while (id >> (mask + 8n) !== 0n) {
    mask += 8n
  }
  return (id & ((1n << mask) - 1n)).toString()
}
/** 打开弹窗 */
const open = async (userId: string) => {
  try {
    dialogVisible.value = true
    const userDept = (await DataPermissionUserDeptApi.select(userId)).data
    resetForm()
    // 加载 Menu 列表。注意，必须放在前面，不然下面 setChecked 没数据节点
    menuOptions.value = handleTree(
      (await DeptApi.getIndexMapDeptList()).data.map((e) => {
        return { id: e.id, name: e.deptName }
      }),
      'id',
      'children',
      getParentFunc
    ) as AssignMenuTree[]
    // 设置数据
    modelValue.value.userId = userId
    modelValue.value.matchType = userDept.matchType
    formLoading.value = true
    modelValue.value.target = userDept.target
    // 设置选中
    console.debug(modelValue.value.target)
    treeRef.value.setCheckedKeys(modelValue.value.target)
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const menuIds: string[] = treeRef.value.getCheckedNodes(false, false).map((e: AssignMenuTree) => e.id)
    await DataPermissionUserDeptApi.update({
      userId: modelValue.value.userId,
      matchType: modelValue.value.matchType,
      target: menuIds
    })
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  console.debug('resetForm')
  // 重置选项
  treeNodeAll.value = false
  menuExpand.value = true
  // 重置表单
  modelValue.value = cloneDeep(defaultData)
  treeRef.value?.setCheckedNodes([])
  formRef.value?.resetFields()
}

/** 全选/全不选 */
const handleCheckedTreeNodeAll = () => {
  if (!treeNodeAll.value) {
    menuOptions.value.forEach((e) => {
      flatNode(e)
    })
  }
  treeRef.value.setCheckedNodes(treeNodeAll.value ? menuOptions.value : [])
}

/** 展开/折叠全部 */
const handleCheckedTreeExpand = () => {
  const nodes = treeRef.value?.store.nodesMap
  for (let node in nodes) {
    if (nodes[node].expanded === menuExpand.value) {
      continue
    }
    nodes[node].expanded = menuExpand.value
  }
}
</script>
<style lang="scss" scoped>
.cardHeight {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
}
</style>
