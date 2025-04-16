export const formConf = {
  formRef: 'formRef',
  formModel: 'formData',
  size: 'default',
  labelPosition: 'right',
  labelWidth: 100,
  formRules: 'rules',
  gutter: 15,
  disabled: false,
  span: 24,
  formBtns: true,
}

export const inputComponents = [
  {
    label: '单行文本',
    tag: ElInput,
    tagIcon: 'svg-icon:input',
    type: 'text',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    prepend: '',
    append: '',
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/input',
  },
  {
    label: '多行文本',
    tag: ElInput,
    tagIcon: 'svg-icon:textarea',
    type: 'textarea',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    autosize: {
      minRows: 4,
      maxRows: 4,
    },
    style: { width: '100%' },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/input',
  },
  {
    label: '密码',
    tag: ElInput,
    tagIcon: 'svg-icon:password',
    type: 'password',
    placeholder: '请输入',
    defaultValue: undefined,
    span: 24,
    'show-password': true,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    prepend: '',
    append: '',
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/input',
  },
  {
    label: '计数器',
    tag: ElInputNumber,
    tagIcon: 'svg-icon:number',
    placeholder: '',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    min: undefined,
    max: undefined,
    step: undefined,
    'step-strictly': false,
    precision: undefined,
    'controls-position': '',
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/input-number',
  },
]

export const selectComponents = [
  {
    label: '下拉选择',
    tag: ElSelect,
    tagIcon: 'svg-icon:select',
    placeholder: '请选择',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    disabled: false,
    required: true,
    filterable: false,
    multiple: false,
    options: [
      {
        label: '选项一',
        value: 1,
      },
      {
        label: '选项二',
        value: 2,
      },
    ],
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/select',
  },
  {
    label: '级联选择',
    tag: ElCascader,
    tagIcon: 'svg-icon:cascader',
    placeholder: '请选择',
    defaultValue: [],
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    props: {
      props: {
        multiple: false,
      },
    },
    'show-all-levels': true,
    disabled: false,
    clearable: true,
    filterable: false,
    required: true,
    options: [
      {
        id: 1,
        value: 1,
        label: '选项1',
        children: [
          {
            id: 2,
            value: 2,
            label: '选项1-1',
          },
        ],
      },
    ],
    dataType: 'dynamic',
    labelKey: 'label',
    valueKey: 'value',
    childrenKey: 'children',
    separator: '/',
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/cascader',
  },
  {
    label: '单选框组',
    tag: ElRadioGroup,
    tagIcon: 'svg-icon:radio',
    defaultValue: 0,
    span: 24,
    labelWidth: null,
    style: {},
    optionType: 'default',
    border: false,
    size: 'default',
    disabled: false,
    required: true,
    options: [
      {
        label: '选项一',
        value: 1,
      },
      {
        label: '选项二',
        value: 2,
      },
    ],
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/radio',
  },
  {
    label: '多选框组',
    tag: ElCheckboxGroup,
    tagIcon: 'svg-icon:checkbox',
    defaultValue: [],
    span: 24,
    labelWidth: null,
    style: {},
    optionType: 'default',
    border: false,
    size: 'default',
    disabled: false,
    required: true,
    options: [
      {
        label: '选项一',
        value: 1,
      },
      {
        label: '选项二',
        value: 2,
      },
    ],
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/checkbox',
  },
  {
    label: '开关',
    tag: ElSwitch,
    tagIcon: 'svg-icon:switch',
    defaultValue: false,
    span: 24,
    labelWidth: null,
    style: {},
    disabled: false,
    required: true,
    'active-text': '',
    'inactive-text': '',
    'active-color': null,
    'inactive-color': null,
    'active-value': true,
    'inactive-value': false,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/switch',
  },
  {
    label: '滑块',
    tag: ElSlider,
    tagIcon: 'svg-icon:slider',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    disabled: false,
    required: true,
    min: 0,
    max: 100,
    step: 1,
    'show-stops': false,
    range: false,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/slider',
  },
  {
    label: '时间选择',
    tag: ElTimePicker,
    tagIcon: 'svg-icon:time',
    placeholder: '请选择',
    defaultValue: '',
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    format: 'HH:mm:ss',
    'value-format': 'HH:mm:ss',
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/time-picker',
  },
  {
    label: '时间范围',
    tag: ElTimePicker,
    tagIcon: 'svg-icon:time-range',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    'is-range': true,
    'range-separator': '至',
    'start-placeholder': '开始时间',
    'end-placeholder': '结束时间',
    format: 'HH:mm:ss',
    'value-format': 'HH:mm:ss',
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/time-picker',
  },
  {
    label: '日期选择',
    tag: ElDatePicker,
    tagIcon: 'svg-icon:date',
    placeholder: '请选择',
    defaultValue: null,
    type: 'date',
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    format: 'YYYY-MM-DD',
    'value-format': 'YYYY-MM-DD',
    readonly: false,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/date-picker',
  },
  {
    label: '日期范围',
    tag: ElDatePicker,
    tagIcon: 'svg-icon:date-range',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    type: 'daterange',
    'range-separator': '至',
    'start-placeholder': '开始日期',
    'end-placeholder': '结束日期',
    disabled: false,
    clearable: true,
    required: true,
    format: 'YYYY-MM-DD',
    'value-format': 'YYYY-MM-DD',
    readonly: false,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/date-picker',
  },
  {
    label: '评分',
    tag: ElRate,
    tagIcon: 'svg-icon:rate',
    defaultValue: 0,
    span: 24,
    labelWidth: null,
    style: {},
    max: 5,
    'allow-half': false,
    'show-text': false,
    'show-score': false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/rate',
  },
  {
    label: '颜色选择',
    tag: ElColorPicker,
    tagIcon: 'svg-icon:color',
    defaultValue: null,
    labelWidth: null,
    'show-alpha': false,
    'color-format': '',
    disabled: false,
    required: true,
    size: 'default',
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/color-picker',
  },
  {
    label: '上传',
    tag: ElUpload,
    tagIcon: 'svg-icon:upload',
    action: 'https://jsonplaceholder.typicode.com/posts/',
    defaultValue: null,
    labelWidth: null,
    disabled: false,
    required: true,
    accept: '',
    name: 'file',
    'auto-upload': true,
    showTip: false,
    buttonText: '点击上传',
    fileSize: 2,
    sizeUnit: 'MB',
    'list-type': 'text',
    multiple: false,
    regList: [],
    changeTag: true,
    document: 'https://element-plus.org/zh-CN/component/upload',
    tip: '只能上传不超过 2MB 的文件',
    style: { width: '100%' },
  },
]

export const layoutComponents = [
  {
    layout: 'rowFormItem',
    tagIcon: 'svg-icon:row',
    type: 'default',
    justify: 'start',
    align: 'top',
    label: '行容器',
    layoutTree: true,
    children: [],
    document: 'https://element-plus.org/zh-CN/component/layout',
  },
  {
    layout: 'colFormItem',
    label: '按钮',
    changeTag: true,
    labelWidth: null,
    tag: ElButton,
    tagIcon: 'svg-icon:button',
    span: 24,
    default: '主要按钮',
    type: 'primary',
    icon: 'Search',
    size: 'default',
    disabled: false,
    document: 'https://element-plus.org/zh-CN/component/button',
  },
]

// 组件rule的触发方式，无触发方式的组件不生成rule
export const trigger = {
  'el-input': 'blur',
  'el-input-number': 'blur',
  'el-select': 'change',
  'el-radio-grouo': 'change',
  'el-checkbox-group': 'change',
  'el-cascader': 'change',
  'ElTimePicker': 'change',
  'el-date-picker': 'change',
  'el-rate': 'change',
}
