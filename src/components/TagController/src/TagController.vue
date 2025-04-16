<template>
  <slot />
</template>

<script lang="tsx">
import { defineComponent } from 'vue'

import type { TagSwitch } from '@/types/table'
import type { Ref } from 'vue'

//TODO 无法提供类型推断且HMR失效,不知道如何修复,请知道的大佬帮忙提个PR
export default defineComponent({
  name: 'TagController',
  setup(props, { slots, expose }) {
    const columnSlot = slots.default()
    const controller = ref(
      columnSlot.map((item) => {
        return { label: item.props['label'], visiable: true, ignore: item.props['ignoreControl'] || false }
      })
    ) as Ref<TagSwitch[]>
    expose({ controller })
    // 注册
    return () => (
      <>
        {controller && controller.value.length != 0
          ? Object.keys(controller.value).map((key) => {
              const item: TagSwitch = controller.value[key]
              return item.ignore || item.visiable ? columnSlot[key] : undefined
            })
          : columnSlot}
      </>
    )
  }
})
</script>
