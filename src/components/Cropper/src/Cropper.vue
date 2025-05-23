<template>
  <div :class="getClass" :style="getWrapperStyle">
    <img v-show="isReady" ref="imgElRef" :alt="alt" :crossorigin="crossorigin" :src="src" :style="getImageStyle" />
  </div>
</template>
<script lang="ts" setup>
import { CSSProperties, PropType } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { useDesign } from '@/hooks/useDesign'
import { propTypes } from '@/utils/propTypes'
import { useDebounceFn } from '@vueuse/core'

defineOptions({ name: 'Cropper' })

const defaultOptions: Cropper.Options = {
  aspectRatio: 1,
  viewMode: 1,
  autoCropArea: 1.0,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  cropBoxMovable: true,
  cropBoxResizable: true,
  toggleDragModeOnDblclick: true,
  autoCrop: true,
  background: true,
  highlight: true,
  center: true,
  responsive: true,
  restore: true,
  checkCrossOrigin: true,
  checkOrientation: true,
  scalable: true,
  modal: true,
  guides: true,
  movable: true,
  rotatable: true
}

const props = defineProps({
  src: propTypes.string.def(''),
  alt: propTypes.string.def(''),
  circled: propTypes.bool.def(false),
  realTimePreview: propTypes.bool.def(true),
  height: propTypes.string.def('360px'),
  crossorigin: {
    type: String as PropType<'' | 'anonymous' | 'use-credentials' | undefined>,
    default: undefined
  },
  imageStyle: { type: Object as PropType<CSSProperties>, default: () => ({}) },
  options: { type: Object as PropType<Cropper.Options>, default: () => ({}) }
})

const emit = defineEmits(['cropend', 'ready', 'cropendError'])
const attrs = useAttrs()
const imgElRef = ref<ElRef<HTMLImageElement>>()
const cropper = ref<Nullable<Cropper>>()
const isReady = ref(false)

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('cropper-image')
const debounceRealTimeCroppered = useDebounceFn(realTimeCroppered, 80)

const getImageStyle = computed((): CSSProperties => {
  return {
    height: props.height,
    maxWidth: '100%',
    ...props.imageStyle
  }
})

const getClass = computed(() => {
  return [
    prefixCls,
    attrs.class,
    {
      [`${prefixCls}--circled`]: true
    }
  ]
})
const getWrapperStyle = computed((): CSSProperties => {
  return {
    height: `${props.height}`.replace(/px/, '') + 'px'
  }
})

onMounted(init)

onUnmounted(() => {
  cropper.value?.destroy()
})

async function init() {
  const imgEl = unref(imgElRef)
  if (!imgEl) {
    return
  }
  cropper.value = new Cropper(imgEl, {
    ...defaultOptions,
    ready: () => {
      isReady.value = true
      realTimeCroppered()
      emit('ready', cropper.value)
    },
    crop() {
      debounceRealTimeCroppered()
    },
    zoom() {
      debounceRealTimeCroppered()
    },
    cropmove() {
      debounceRealTimeCroppered()
    },
    ...props.options
  })
}

// Real-time display preview
function realTimeCroppered() {
  props.realTimePreview && croppered()
}

// event: return base64 and width and height information after cropping
function croppered() {
  if (!cropper.value) {
    return
  }
  let imgInfo = cropper.value.getData()
  const canvas = false ? getRoundedCanvas() : cropper.value.getCroppedCanvas()
  canvas.toBlob((blob) => {
    if (!blob) {
      return
    }
    let fileReader: FileReader = new FileReader()
    fileReader.onloadend = (e) => {
      emit('cropend', {
        imgBase64: e.target?.result ?? '',
        imgInfo
      })
    }
    fileReader.onerror = () => {
      emit('cropendError')
    }
    fileReader.readAsDataURL(blob)
  }, 'image/png')
}

// Get a circular picture canvas
function getRoundedCanvas() {
  const sourceCanvas = cropper.value.getCroppedCanvas()
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  const width = sourceCanvas.width
  const height = sourceCanvas.height
  canvas.width = width
  canvas.height = height
  context.imageSmoothingEnabled = true
  context.drawImage(sourceCanvas, 0, 0, width, height)
  context.globalCompositeOperation = 'destination-in'
  context.beginPath()
  context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true)
  context.fill()
  return canvas
}
</script>
<style lang="scss">
$prefix-cls: #{$namespace}-cropper-image;

.#{$prefix-cls} {
  &--circled {
    .cropper-view-box,
    .cropper-face {
      border-radius: 50%;
    }
  }
}
</style>
