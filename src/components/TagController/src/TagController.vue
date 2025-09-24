<template>
  <slot />
</template>

<script lang="tsx">
import { defineComponent, ref } from 'vue'

import type { TagSwitch } from '@/types/table'
import type { Ref } from 'vue'

export default defineComponent({
  name: 'TagController',
  setup(props, { slots, expose }) {
    const controller = ref([]) as Ref<TagSwitch[]>
    const signature = ref('')
    expose({ controller })

    const getSignature = (nodes: any[]) => nodes.map((n, i) => n?.props?.prop ?? n?.props?.label ?? i).join('|')
    const rebuild = (nodes: any[]) => {
      controller.value = nodes.map((n) => ({
        label: n?.props?.label,
        visiable: true,
        ignore: n?.props?.ignoreControl || false
      })) as TagSwitch[]
    }

    return () => {
      const children = slots.default?.() ?? []
      const sig = getSignature(children)
      if (!controller.value.length || sig !== signature.value) {
        rebuild(children)
        signature.value = sig
      }
      return <>{controller.value.map((cfg, idx) => (cfg.ignore || cfg.visiable ? children[idx] : undefined))}</>
    }
  }
})
</script>
