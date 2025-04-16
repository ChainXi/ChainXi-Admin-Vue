<template>
  <Dialog v-model="dialogVisible" :title="$t('roleManager.assignMenu')" @keyup.enter="submitForm">
    <el-form ref="formRef" v-loading="formLoading" :model="modelValue" label-width="auto">
      <el-form-item :label="$t('roleManager.roleName')">
        <el-tag>{{ modelValue.name }}</el-tag>
      </el-form-item>
      <el-form-item :label="$t('roleManager.menuAuth')">
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
            :default-expand-all="menuExpand"
            @node-contextmenu="nodeAuth"
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
import * as RoleApi from '@/api/sys/role'
import * as MenuApi from '@/api/sys/menu'
import * as AuthApi from '@/api/sys/auth'
import type Node from 'element-plus/es/components/tree/src/model/node'

defineOptions({ name: 'FormSysRoleAssignMenu' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const defaultData = {
  id: 0,
  name: '',
  menuIds: [] as AuthApi.AssignMenu[]
}
type AssignMenuTree = MenuApi.SysMenuSimpleRespVo & {
  children?: AssignMenuTree[]
  cacheChildren?: AssignMenuTree[]
}

const modelValue = ref(cloneDeep(defaultData))
const formRef = ref() // 表单 Ref
const menuOptions = ref<AssignMenuTree[]>([]) // 菜单树形结构
const menuExpand = ref(true) // 展开/折叠
const treeRef = ref() // 菜单树组件 Ref
const treeNodeAll = ref(false) // 全选/全不选

const nodeAuth = (_, data: AssignMenuTree, node: Node) => {
  if (data.children?.length) {
    data.cacheChildren = data.children
    data.children = []
  } else if (data.cacheChildren?.length) {
    flatNode(data)
  }
  nextTick(() => {
    node.setChecked(true, true)
  })
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

/** 打开弹窗 */
const open = async (row: RoleApi.RoleVO) => {
  dialogVisible.value = true
  resetForm()
  // 加载 Menu 列表。注意，必须放在前面，不然下面 setChecked 没数据节点
  menuOptions.value = handleTree((await MenuApi.getIndexMapMenusList()).data, 'id', 'children', (e) => e.pid) as AssignMenuTree[]
  // 设置数据
  modelValue.value.id = row.id
  modelValue.value.name = row.name
  formLoading.value = true
  try {
    modelValue.value.menuIds = (await AuthApi.getRoleMenuList(row.id)).data
    // 设置选中
    modelValue.value.menuIds.forEach((assignMenu: AuthApi.AssignMenu) => {
      treeRef.value.setChecked(assignMenu.menuId, true, false)
      if (assignMenu.mappingType === 0) {
        const nodeList = Array.from(menuOptions.value)
        while (nodeList && nodeList.length !== 0) {
          const data = nodeList.pop()
          if (data.id === assignMenu.menuId) {
            data.cacheChildren = data.children
            data.children = []
          } else {
            data.children?.forEach((e) => {
              nodeList.push(e)
            })
          }
        }
      }
    })
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
    const menuIds: AuthApi.AssignMenu[] = treeRef.value
      .getCheckedNodes(false, true)
      .map((e: AssignMenuTree) => ({ menuId: e.id, mappingType: e.cacheChildren?.length ? 0 : 1 }))
    const data = {
      roleId: modelValue.value.id,
      menuIds: menuIds
    }
    await AuthApi.assignRoleMenu(data)
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
