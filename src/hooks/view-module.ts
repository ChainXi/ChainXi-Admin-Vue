import download from '@/utils/download'
//TODO 补充ts映射
export default (param = {}) => {
  const { t } = useI18n()
  const message = useMessage() // 消息弹窗

  const viewModuleOptions = {
    createdIsNeed: true, // 此页面是否在创建时，调用查询数据列表接口？
    activatedIsNeed: false, // 此页面是否在激活（进入）时，调用查询数据列表接口？
    pagination: false, // 数据列表接口，是否需要分页？
    requestQuery: null, // 数据列表接口，API地址
    requestDelete: null,
    requestExported: null,
    deleteURL: '', // 删除接口，API地址
    deleteIsBatch: false, // 删除接口，是否需要批量？
    deleteIsBatchKey: 'id', // 删除接口，批量状态下由那个key进行标记操作？比如：pid，uid...
    queryFormRef: null,
    ...param
  }

  const viewModel = reactive({
    // 默认属性
    dataForm: {} as Recordable, // 查询条件
    dataList: [], // 数据列表
    order: '', // 排序，asc／desc
    orderField: '', // 排序，字段
    pageNo: 1, // 当前页码
    pageSize: 10, // 每页数
    total: 0, // 总条数
    queryLoading: false, // 数据列表，loading状态
    exportLoading: false, // data export loading status
    dataListSelections: [] // 数据列表，多选项
  })
  const queryParams = computed(() => {
    return {
      order: viewModel.order,
      orderField: viewModel.orderField,
      pageNo: viewModuleOptions.pagination ? viewModel.pageNo : undefined,
      pageSize: viewModuleOptions.pagination ? viewModel.pageSize : undefined,
      ...viewModel.dataForm
    }
  })

  function query() {
    viewModel.queryLoading = true
    viewModuleOptions
      .requestQuery(unref(queryParams))
      .then((res) => {
        viewModel.queryLoading = false
        console.debug(res)
        if (res.code === 200) {
          viewModel.dataList = viewModuleOptions.pagination ? (res.data as PageResult).list : res.data
          viewModel.total = viewModuleOptions.pagination ? parseInt((res.data as PageResult).total) : res.data.length
        } else {
          viewModel.dataList = []
          viewModel.total = 0
          return ElMessage.error(res.msg)
        }
      })
      .catch(() => {
        viewModel.queryLoading = false
        viewModel.dataList = []
        viewModel.total = 0
      })
  }

  onMounted(() => {
    if (viewModuleOptions.createdIsNeed) {
      query()
    }
  })
  onActivated(() => {
    if (viewModuleOptions.activatedIsNeed) {
      query()
    }
  })

  return {
    viewModuleOptions,
    viewModel,
    // 多选
    dataListSelectionChangeHandle: function (val) {
      viewModel.dataListSelections = val
    },
    // 排序
    // dataListSortChangeHandle: function (data) {
    //   if (!viewModel.order || !viewModel.prop) {
    //     viewModel.order = ''
    //     viewModel.orderField = ''
    //     return false
    //   }
    //   viewModel.order = viewModel.order.replace(/ending$/, '')
    //   viewModel.orderField = viewModel.prop.replace(/([A-Z])/g, '_$1').toLowerCase()
    //   query()
    // },
    handleResetQuery: function () {
      viewModuleOptions.queryFormRef.value.resetFields()
      viewModel.pageNo = 1
      query()
    },
    handleSearchQuery: function () {
      viewModel.pageNo = 1
      query()
    },
    handleQuery: query,
    // 关闭当前窗口
    // closeCurrentTab: function (data) {
    //   var tabName = viewModel.$store.state.contentTabsActiveName
    //   viewModel.$store.state.contentTabs = viewModel.$store.state.contentTabs.filter(item => item.name !== tabName)
    //   if (viewModel.$store.state.contentTabs.length <= 0) {
    //     viewModel.$store.state.sidebarMenuActiveName = viewModel.$store.state.contentTabsActiveName = 'home'
    //     return false
    //   }
    //   if (tabName === viewModel.$store.state.contentTabsActiveName) {
    //     viewModel.$router.push({ name: viewModel.$store.state.contentTabs[viewModel.$store.state.contentTabs.length - 1].name })
    //   }
    // },
    // 删除
    handleDelete: function (id) {
      if (viewModuleOptions.deleteIsBatch && !id && viewModel.dataListSelections.length <= 0) {
        return ElMessage({
          message: t('prompt.deleteBatch'),
          type: 'warning',
          duration: 500
        })
      }
      message
        .delConfirm()
        .then(() => {
          viewModuleOptions
            .requestDelete(id)
            .then((res) => {
              ElMessage({
                message: t('prompt.success'),
                type: 'success',
                duration: 500,
                onClose: () => {
                  query()
                }
              })
            })
            .catch((e) => {
              ElMessage.error(e)
            })
        })
        .catch(() => {})
    },
    // 导出
    handleExport: async function () {
      try {
        // 导出的二次确认
        await message.exportConfirm()
        // 发起导出
        viewModel.exportLoading = true
        const res = await viewModuleOptions.requestExported(unref(queryParams))
        console.debug(res)
        download.excel(res.data, 'excel.xls')
      } catch {
      } finally {
        viewModel.exportLoading = false
      }
    }
  }
}
