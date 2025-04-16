import { defineComponent, h } from 'vue'
import { makeMap } from '@/utils/index'

const isAttr = makeMap(
  'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' +
  'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' +
  'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,' +
  'name,contenteditable,contextmenu,controls,coords,data,datetime,default,' +
  'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,' +
  'form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,' +
  'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' +
  'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' +
  'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' +
  'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' +
  'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' +
  'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' +
  'target,title,type,usemap,value,width,wrap' + 'prefix-icon'
)
const isNotProps = makeMap(
  'layout,prepend,regList,tag,document,changeTag,defaultValue'
)

function useVModel (props, emit) {
  return {
    modelValue: props.defaultValue,
    'onUpdate:modelValue': (val) => emit('update:modelValue', val),
  }
}
const componentChild = {
  'ElButton': {
    default (h, conf, key) {
      return conf[key]
    },
  },
  'ElSelect': {
    options (h, conf, key) {
      return conf.options.map(item => h(ElOption, {
        label: item.label,
        value: item.value,
      }))
    }
  },
  'ElRadioGroup': {
    options (h, conf, key) {
      return conf.optionType === 'button' ? conf.options.map(item => h(ElCheckboxButton, {
        label: item.value,
      }, () => item.label)) : conf.options.map(item => h(ElRadio, {
        label: item.value,
        border: conf.border,
      }, () => item.label))
    }
  },
  'ElCheckboxGroup': {
    options (h, conf, key) {
      return conf.optionType === 'button' ? conf.options.map(item => h(ElCheckboxButton, {
        label: item.value,
      }, () => item.label)) : conf.options.map(item => h(ElCheckbox, {
        label: item.value,
        border: conf.border,
      }, () => item.label))
    }
  },
  'ElUpload': {
    'list-type': (h, conf, key) => {
      const option = {}
      // if (conf.showTip) {
      //   tip = h('div', {
      //     class: "el-upload__tip"
      //   }, () => '只能上传不超过' + conf.fileSize + conf.sizeUnit + '的' + conf.accept + '文件')
      // }
      if (conf['list-type'] === 'picture-card') {
        option.icon = "ep:Upload"
        return h(icon, option)
      } else {
        // option.size = "small"
        option.type = "primary"
        option.icon = "Upload"
        return h(ElButton, option, () => conf.buttonText)
      }
    },

  }
}
const componentSlot = {
  'ElUpload': {
    'tip': (h, conf, key) => {
      if (conf.showTip) {
        return () => h('div', {
          class: "el-upload__tip"
        }, '只能上传不超过' + conf.fileSize + conf.sizeUnit + '的' + conf.accept + '文件')
      }
    },
  }
}
export default defineComponent({

  // 使用 render 函数
  render () {
    const dataObject = {
      attrs: {},
      props: {},
      on: {},
      style: {}
    }

    const confClone = cloneDeep(unref(this.conf))
    const children = []
    const slot = {}
    const childObjs = componentChild[confClone.tag.name]
    if (childObjs) {
      Object.keys(childObjs).forEach(key => {
        const childFunc = childObjs[key]
        if (confClone[key]) {
          children.push(childFunc(h, confClone, key))
        }
      })
    }
    const slotObjs = componentSlot[confClone.tag.name]
    if (slotObjs) {
      Object.keys(slotObjs).forEach(key => {
        const childFunc = slotObjs[key]
        if (confClone[key]) {
          slot[key] = childFunc(h, confClone, key)
        }
      })
    }
    Object.keys(confClone).forEach(key => {
      const val = confClone[key]
      if (dataObject[key]) {
        dataObject[key] = val
      } else if (isAttr(key)) {
        dataObject.attrs[key] = val
      } else if (!isNotProps(key)) {
        dataObject.props[key] = val
      }
    })
    if (children.length > 0) {
      slot.default = () => children
    }
    return h(toRaw(this.conf.tag),
      {
        modelValue: this.$attrs.modelValue,
        ...dataObject.props,
        ...dataObject.attrs,
        style: {
          ...dataObject.style
        },
      }
      , slot ?? null)
  },
  props: {
    conf: {
      type: Object,
      required: true,
    },
  }
})