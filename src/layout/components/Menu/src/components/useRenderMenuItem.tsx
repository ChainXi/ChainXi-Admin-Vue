import type { RouteMeta } from 'vue-router'
import { useRenderMenuTitle } from './useRenderMenuTitle'
import { useDesign } from '@/hooks/useDesign'

export const useRenderMenuItem = (menuMode: 'vertical' | 'horizontal') => {
  const renderMenuItem = (routers: AppRouteRecordRaw[]) => {
    return routers.map((v: AppRouteRecordRaw) => {
      const meta = (v.meta ?? {}) as RouteMeta
      if (meta.status !== 0) {
        return
      }
      const { renderMenuTitle } = useRenderMenuTitle()
      const showingChildren = v.children?.filter((v) => v.meta?.status === 0)
      if (!showingChildren || showingChildren.length === 0) {
        return (
          <ElMenuItem index={v.path}>
            {{
              default: () => renderMenuTitle(meta)
            }}
          </ElMenuItem>
        )
      } else if (showingChildren?.length === 1 && !showingChildren[0].children) {
        return (
          <ElMenuItem index={showingChildren[0].path}>
            {{
              default: () => renderMenuTitle(showingChildren[0].meta)
            }}
          </ElMenuItem>
        )
      } else {
        const { getPrefixCls } = useDesign()

        const preFixCls = getPrefixCls('menu-popper')
        return (
          <ElSubMenu index={v.path} popperClass={menuMode === 'vertical' ? `${preFixCls}--vertical` : `${preFixCls}--horizontal`}>
            {{
              title: () => renderMenuTitle(meta),
              default: () => renderMenuItem(v.children!)
            }}
          </ElSubMenu>
        )
      }
    })
  }

  return {
    renderMenuItem
  }
}
