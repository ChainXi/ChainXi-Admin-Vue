<template>
  <div class="badges" aria-label="Site traffic statistics">
    <!-- UV Badge -->
    <span class="badge" aria-live="polite" title="Unique Visitors (Site UV)">
      <span class="t">UV</span>
      <span class="v">
        <!-- Container per busuanzi spec: hidden automatically on error/timeout -->
        <span id="busuanzi_container_site_uv" style="display:none">
          <span id="busuanzi_value_site_uv"></span>
        </span>
        <!-- Fallback loading animation while value not yet injected -->
        <span v-if="uvLoading" class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </span>
    </span>
    <!-- PV Badge -->
    <span class="badge" aria-live="polite" title="Page Views (Site PV)">
      <span class="t">PV</span>
      <span class="v">
        <span id="busuanzi_container_site_pv" style="display:none">
          <span id="busuanzi_value_site_pv"></span>
        </span>
        <span v-if="pvLoading" class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
// 使用已安装的 busuanzi.pure.js 模块，而不是远程 script
let busuanziModule: any = null

const uvLoading = ref(true)
const pvLoading = ref(true)
const route = useRoute()
let busuanziLoaded = false

const markLoadedIfReady = () => {
  // When busuanzi fills values, the inner spans get textContent; poll briefly.
  const uvSpan = document.getElementById('busuanzi_value_site_uv')
  const pvSpan = document.getElementById('busuanzi_value_site_pv')
  if (uvSpan && uvSpan.textContent) uvLoading.value = false
  if (pvSpan && pvSpan.textContent) pvLoading.value = false
}

// Observe changes to value spans so we don't rely only on polling timing.
const setupObservers = () => {
  const uvSpan = document.getElementById('busuanzi_value_site_uv')
  const pvSpan = document.getElementById('busuanzi_value_site_pv')
  const uvContainer = document.getElementById('busuanzi_container_site_uv')
  const pvContainer = document.getElementById('busuanzi_container_site_pv')

  const handle = (type: 'uv'|'pv') => {
    if (type === 'uv') uvLoading.value = false
    else pvLoading.value = false
  }

  const makeObserver = (el: HTMLElement | null, type: 'uv'|'pv') => {
    if (!el) return
    // If already has content, mark immediately.
    if (el.textContent && el.textContent.trim() !== '') handle(type)
    const obs = new MutationObserver(() => {
      if (el.textContent && el.textContent.trim() !== '') {
        handle(type)
        obs.disconnect()
      }
    })
    obs.observe(el, { childList: true, characterData: true, subtree: true })
  }

  makeObserver(uvSpan as HTMLElement | null, 'uv')
  makeObserver(pvSpan as HTMLElement | null, 'pv')

  // Also watch container display changes (busuanzi sets display inline-block to show)
  const watchDisplay = (container: HTMLElement | null, type: 'uv'|'pv') => {
    if (!container) return
    const obs = new MutationObserver(() => {
      const style = (container as HTMLElement).style.display
      if (style && style !== 'none') {
        handle(type)
        obs.disconnect()
      }
    })
    obs.observe(container, { attributes: true, attributeFilter: ['style'] })
  }
  watchDisplay(uvContainer as HTMLElement | null, 'uv')
  watchDisplay(pvContainer as HTMLElement | null, 'pv')

  // Fallback safety: ensure after 6s we stop loading even若脚本超时
  setTimeout(() => {
    if (uvLoading.value) uvLoading.value = false
    if (pvLoading.value) pvLoading.value = false
  }, 6000)
}

const refreshBusuanzi = () => {
  if (busuanziModule && typeof busuanziModule.fetch === 'function') {
    try {
      uvLoading.value = true
      pvLoading.value = true
      busuanziModule.fetch()
      setTimeout(markLoadedIfReady, 200)
      setTimeout(markLoadedIfReady, 800)
      setTimeout(markLoadedIfReady, 1600)
    } catch {}
  }
}

const importBusuanzi = async () => {
  if (busuanziLoaded) return refreshBusuanzi()
  try {
    // 动态导入，避免在 SSR 或构建阶段报错
    busuanziModule = await import('busuanzi.pure.js')
    // 部分版本默认导出或挂载到 window，做兼容
    const w: any = window as any
    if (!w.Busuanzi && busuanziModule) {
      // 常见包导出： { fetch: f } 或 default:{ fetch }
      w.Busuanzi = busuanziModule.default || busuanziModule
    }
    busuanziLoaded = true
    refreshBusuanzi()
  } catch (e) {
    uvLoading.value = false
    pvLoading.value = false
  }
}

onMounted(() => {
  importBusuanzi()
  setTimeout(setupObservers, 0)
})

// Refresh counts when route path changes (exclude hash only changes)
watch(() => route.fullPath, (to, from) => {
  if (busuanziLoaded && to !== from) {
    refreshBusuanzi()
  }
})
</script>

<style scoped>
.badges{display:flex;gap:8px;padding-left:16px}
.badge{display:inline-flex;align-items:stretch;font:600 11px/1 'Segoe UI',Arial,sans-serif;background:var(--badge-bg);border-radius:20px;color:var(--badge-text);padding:0;box-shadow:var(--badge-shadow,0 1px 2px rgba(0,0,0,.4));border:1px solid var(--badge-border,#222);transition:box-shadow .35s ease,transform .28s ease,background-color .4s ease,color .35s ease,border-color .4s ease;overflow:hidden;height:24px}
.t{display:flex;align-items:center;padding:0 10px 0 12px;margin:0;letter-spacing:.5px;transition:color .3s ease,opacity .3s ease}
.v{display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,#2563eb,#1d4ed8,#6366f1);background-size:200% 100%;animation:breathe 3.8s ease-in-out infinite;border-radius:0 20px 20px 0;padding:0 12px;min-width:0;text-align:center;font-weight:700;transition:background-position 1.2s ease,filter .4s ease,color .3s ease;border-left:1px solid rgba(255,255,255,.08);position:relative;min-width:48px}
.badge:hover{box-shadow:var(--badge-hover-shadow,0 4px 10px -2px rgba(0,0,0,.55));transform:translateY(-1px)}
.badge:active{transform:translateY(0);box-shadow:0 2px 4px -1px rgba(0,0,0,.5)}
.badge:hover .v{filter:brightness(1.15);background-position:100% 0}
.badge:hover .t{opacity:.9}
@keyframes breathe{0%{filter:brightness(1)}50%{filter:brightness(1.28)}100%{filter:brightness(1)}}
.v.v-flash{animation:vflash .6s ease}
@media (prefers-reduced-motion:reduce){.v{animation:breathe 6s ease-in-out infinite}}
/* Loading dots */
.loading-dots{display:inline-flex;align-items:center;justify-content:space-between;width:32px}
.loading-dots span{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.25;animation:dotPulse 1.1s ease-in-out infinite}
.loading-dots span:nth-child(2){animation-delay:.18s}
.loading-dots span:nth-child(3){animation-delay:.36s}
@keyframes dotPulse{0%,80%,100%{opacity:.25;transform:scale(.75)}40%{opacity:1;transform:scale(1)}}
</style>
<style>
:root{--badge-bg:#111;--badge-text:#fff;--badge-num-bg:#2563eb;--badge-border:#222;--badge-shadow:0 1px 2px rgba(0,0,0,.4);--badge-hover-shadow:0 4px 10px -2px rgba(0,0,0,.55)}
html.dark,body.dark{--badge-bg:#0f1720;--badge-text:#e2e8f0;--badge-num-bg:linear-gradient(135deg,#3b82f6,#6366f1);--badge-border:#334155;--badge-shadow:0 2px 6px -2px rgba(0,0,0,.7),0 0 0 1px rgba(59,130,246,.25);--badge-hover-shadow:0 4px 14px -3px rgba(0,0,0,.85),0 0 0 1px rgba(99,102,241,.45),0 0 0 4px rgba(59,130,246,.15)}
html.dark .badge .t,body.dark .badge .t{background:linear-gradient(90deg,#ffffff,#fffbdd);color:#111;border-top-left-radius:20px;border-bottom-left-radius:20px;}
</style>