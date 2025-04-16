<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'IFrame' })

const props = defineProps({
  headers: {
    type: Map<string, string>,
    default: () => new Map()
  },
  src: propTypes.string.def('')
})
const loading = ref(true)
const height = ref('')
const srcRef = ref<string>(null)
const init = () => {
  // populateIframe()
  height.value = document.documentElement.clientHeight - 94.5 + 'px'
  loading.value = false
}
onMounted(() => {
  setTimeout(() => {
    init()
  }, 300)
})

/**
 * iframe 添加请求头
 */
function populateIframe() {
  var xhr = new XMLHttpRequest()
  // `${this.apiUrl}${this.url}` 请求的URL
  xhr.open('GET', props.src)
  xhr.responseType = 'blob'
  props.headers.forEach((v, k) => {
    console.debug(k, v)
    xhr.setRequestHeader(k, v)
  })
  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE) {
      console.debug('xhr.response', xhr.status, xhr.response)
      if (xhr.status === 200) {
        srcRef.value = URL.createObjectURL(xhr.response)
      }
    }
  }
  xhr.send()
}
</script>
<template>
  <div v-loading="loading" :style="'height:' + height">
    <iframe :src="src" frameborder="no" scrolling="auto" style="width: 100%; height: 100%"></iframe>
  </div>
</template>
