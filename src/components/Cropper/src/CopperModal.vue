<template>
  <div>
    <Dialog v-model="dialogVisible" :canFullscreen="false" :title="t('cropper.modalTitle')" maxHeight="380px" width="800px">
      <div :class="prefixCls">
        <div :class="`${prefixCls}-left`">
          <div :class="`${prefixCls}-cropper`">
            <CropperImage v-if="src" :circled="false" :src="src" height="300px" @cropend="handleCropend" @ready="handleReady" />
          </div>

          <div :class="`${prefixCls}-toolbar`">
            <el-upload :beforeUpload="handleBeforeUpload" :fileList="[]" accept="image/*">
              <el-tooltip :content="t('cropper.selectImage')" placement="bottom">
                <XButton preIcon="ant-design:upload-outlined" type="primary" />
              </el-tooltip>
            </el-upload>
            <el-space>
              <el-tooltip :content="t('cropper.btnReset')" placement="bottom">
                <XButton
                  :disabled="!src"
                  preIcon="ant-design:reload-outlined"
                  size="small"
                  type="primary"
                  @click="handlerToolbar('reset')"
                />
              </el-tooltip>
              <el-tooltip :content="t('cropper.btnRotateLeft')" placement="bottom">
                <XButton
                  :disabled="!src"
                  preIcon="ant-design:rotate-left-outlined"
                  size="small"
                  type="primary"
                  @click="handlerToolbar('rotate', -45)"
                />
              </el-tooltip>
              <el-tooltip :content="t('cropper.btnRotateRight')" placement="bottom">
                <XButton
                  :disabled="!src"
                  preIcon="ant-design:rotate-right-outlined"
                  size="small"
                  type="primary"
                  @click="handlerToolbar('rotate', 45)"
                />
              </el-tooltip>
              <el-tooltip :content="t('cropper.btnCcaleX')" placement="bottom">
                <XButton :disabled="!src" preIcon="vaadin:arrows-long-h" size="small" type="primary" @click="handlerToolbar('scaleX')" />
              </el-tooltip>
              <el-tooltip :content="t('cropper.btnScaleY')" placement="bottom">
                <XButton :disabled="!src" preIcon="vaadin:arrows-long-v" size="small" type="primary" @click="handlerToolbar('scaleY')" />
              </el-tooltip>
              <el-tooltip :content="t('cropper.btnZoomIn')" placement="bottom">
                <XButton
                  :disabled="!src"
                  preIcon="ant-design:zoom-in-outlined"
                  size="small"
                  type="primary"
                  @click="handlerToolbar('zoom', 0.1)"
                />
              </el-tooltip>
              <el-tooltip :content="t('cropper.btnZoomOut')" placement="bottom">
                <XButton
                  :disabled="!src"
                  preIcon="ant-design:zoom-out-outlined"
                  size="small"
                  type="primary"
                  @click="handlerToolbar('zoom', -0.1)"
                />
              </el-tooltip>
            </el-space>
          </div>
        </div>
        <div :class="`${prefixCls}-right`">
          <div :class="`${prefixCls}-preview`">
            <img v-if="previewSource" :alt="t('cropper.preview')" :src="previewSource" />
          </div>
          <template v-if="previewSource">
            <div :class="`${prefixCls}-group`">
              <el-avatar :src="previewSource" size="large" />
              <el-avatar :size="48" :src="previewSource" />
              <el-avatar :size="64" :src="previewSource" />
              <el-avatar :size="80" :src="previewSource" />
            </div>
          </template>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleOk">{{ t('cropper.okText') }}</el-button>
      </template>
    </Dialog>
  </div>
</template>
<script lang="ts" setup>
import { useDesign } from '@/hooks/useDesign'
import { dataURLtoBlob } from '@/utils/filt'
import { useI18n } from 'vue-i18n'
import type { CropendResult, Cropper } from './types'
import { propTypes } from '@/utils/propTypes'
import { CropperImage } from '@/components/Cropper'

defineOptions({ name: 'CopperModal' })

const props = defineProps({
  srcValue: propTypes.string.def(''),
  circled: propTypes.bool.def(true)
})
const emit = defineEmits(['uploadSuccess'])
const { t } = useI18n()
const { getPrefixCls } = useDesign()
const message = useMessage()
const prefixCls = getPrefixCls('cropper-am')

const src = ref<string>('')
watch(
  () => props.srcValue,
  (srcValue) => {
    src.value = srcValue
  }
)
const previewSource = ref<string>('')
const cropper = ref<Cropper>()
const dialogVisible = ref(false)
let filename = ''
let scaleX = 1
let scaleY = 1

// Block upload
function handleBeforeUpload(file: File) {
  const reader = new FileReader()
  src.value = ''
  previewSource.value = ''
  filename = file.name
  reader.onload = function (e) {
    console.debug(reader)
    var img = new Image()
    img.src = e.target.result as string
    img.onload = function () {
      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')

      canvas.width = (img.width / img.height) * 512
      canvas.height = 512

      ctx.drawImage(img, 0, 0, (img.width / img.height) * 512, 512)

      var dataURL = canvas.toDataURL('image/jpeg', 1.0)
      src.value = dataURL ?? ''
    }
  }
  reader.readAsDataURL(file)
  return false
}

function handleCropend({ imgBase64 }: CropendResult) {
  previewSource.value = imgBase64
}

function handleReady(cropperInstance: Cropper) {
  cropper.value = cropperInstance
}

function handlerToolbar(event: string, arg?: number) {
  if (event === 'scaleX') {
    scaleX = arg = scaleX === -1 ? 1 : -1
  }
  if (event === 'scaleY') {
    scaleY = arg = scaleY === -1 ? 1 : -1
  }
  cropper?.value?.[event]?.(arg)
}

async function handleOk() {
  if (previewSource.value) {
    const blob = dataURLtoBlob(previewSource.value)
    emit('uploadSuccess', { source: previewSource.value, data: blob, filename: filename })
  } else {
    message.warning(t('common.nonNull'))
  }
}

function openModal() {
  dialogVisible.value = true
}

function closeModal() {
  dialogVisible.value = false
}

defineExpose({ openModal, closeModal })
</script>
<style lang="scss">
$prefix-cls: #{$namespace}-cropper-am;

.#{$prefix-cls} {
  display: flex;

  &-left,
  &-right {
    height: 340px;
  }

  &-left {
    width: 55%;
  }

  &-right {
    width: 45%;
  }

  &-cropper {
    height: 300px;
    background: #eee;
    background-image: linear-gradient(45deg, rgb(0 0 0 / 25%) 25%, transparent 0, transparent 75%, rgb(0 0 0 / 25%) 0),
      linear-gradient(45deg, rgb(0 0 0 / 25%) 25%, transparent 0, transparent 75%, rgb(0 0 0 / 25%) 0);
    background-position: 0 0, 12px 12px;
    background-size: 24px 24px;
  }

  &-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  &-preview {
    width: 220px;
    height: 220px;
    margin: 0 auto;
    overflow: hidden;
    border: 1px solid;
    border-radius: 50%;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &-group {
    display: flex;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid;
    justify-content: space-around;
    align-items: center;
  }
}
</style>
