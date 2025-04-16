<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import * as Iconify from '@iconify/vue'
import { useDesign } from '@/hooks/useDesign'
import { Ref } from 'vue'

defineOptions({ name: 'Icon' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('icon')

const props = defineProps({
  // icon name
  icon: propTypes.string,
  // icon color
  color: propTypes.string,
  // icon size
  size: propTypes.number.def(16),
  // icon svg class
  svgClass: propTypes.string.def('')
})

const elRef = ref<ElRef>(null)

const isLocal = computed(() => props.icon.startsWith('svg-icon:'))

const symbolId = computed(() => {
  return unref(isLocal) ? `#icon-${props.icon.split('svg-icon:')[1]}` : props.icon
})

const getIconifyStyle = computed(() => {
  const { color, size } = props
  return {
    fontSize: `${size}px`,
    height: '1em',
    color
  }
})
const getSvgClass = computed(() => {
  const { svgClass } = props
  return `iconify ${svgClass}`
})

const modules = import.meta.glob('@/assets/icons/svg/*.svg', {
  import: 'default',
  query: '?raw'
}) as Record<string, () => Promise<string>>
const parser = new DOMParser()

const icondata: Ref<Iconify.IconifyIconBuildResult> = ref(null)
const updateIcon = async (icon: string) => {
  const el = unref(elRef)
  if (!el) return
  if (!icon || '#' === icon) return
  try {
    if (unref(isLocal)) {
      let svgEle = parser
        .parseFromString(await modules['/src/assets/icons/svg/' + icon.split('svg-icon:')[1] + '.svg'](), 'image/svg+xml')
        .querySelector('svg')
      const { x, y, width, height } = svgEle.viewBox.baseVal
      Iconify.addIcon(icon, { body: svgEle.innerHTML, left: x, top: y, width: width, height: height })
    }
    icondata.value = Iconify.buildIcon(Iconify.iconLoaded(icon) ? Iconify.getIcon(icon) : await Iconify.loadIcon(icon))
  } catch (error) {
    console.warn('unknown icon' + error)
  }
  const data = unref(icondata)
  if (data && data.body) {
    // Create element
    const svgDefaults = {
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'aria-hidden': true,
      focusable: false,
      role: 'img'
    }
    Object.keys(svgDefaults).forEach((attr) => {
      el.setAttribute(attr, svgDefaults[attr])
    })
    el.textContent = ''
    el.innerHTML = Iconify.replaceIDs(data.body)
  } else {
    el.textContent = ''
  }
}
watchEffect(() => {
  updateIcon(props.icon)
})
</script>

<template>
  <ElIcon :class="prefixCls" :color="color" :size="size">
    <span :style="getIconifyStyle">
      <svg
        ref="elRef"
        :view-box.camel="
          icondata ? icondata.viewBox[0] + ' ' + icondata.viewBox[1] + ' ' + icondata.viewBox[2] + ' ' + icondata.viewBox[3] : null
        "
      ></svg>
    </span>
  </ElIcon>
</template>
