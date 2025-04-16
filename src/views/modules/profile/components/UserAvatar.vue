<template>
  <CropperAvatar
    ref="cropperAvatar"
    class="change-avatar text-center"
    :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
    :showBtn="false"
    width="120px"
    @change="handleUpload"
  />
</template>
<script lang="ts" setup>

defineOptions({ name: 'UserAvatar' })
const emit = defineEmits(['upload:file'])

const cropperAvatar = useTemplateRef('cropperAvatar')

const handleUpload = ({ data }) => {
  emit('upload:file', data)
}

defineExpose({
  cropperAvatar
})
</script>

<style lang="scss" scoped>
.change-avatar {
  img {
    display: block;
    margin-bottom: 15px;
    border-radius: 50%;
  }
}
</style>
