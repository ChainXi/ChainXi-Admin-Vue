import type { RouteMeta } from 'vue-router'
import { Icon } from '@/components/Icon'

export const useRenderMenuTitle = () => {
  const renderMenuTitle = (meta: RouteMeta) => {
    const { t } = useI18n()
    const { title = 'Please set title', icon } = meta
    return icon ? (
      <>
        <Icon icon={meta.icon} />
        <span class="v-menu__title">{t(title as string)}</span>
      </>
    ) : (
      <>
        <span class="v-menu__title">{t(title as string)}</span>
      </>
    )
  }

  return {
    renderMenuTitle
  }
}
