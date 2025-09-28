<template>
  <div class="home-wrapper">
    <!-- 统计演示面板 -->
    <div class="stats-demo" aria-label="Traffic Statistics Panel">
      <div class="stat-card" :class="{ ready: !sitePvLoading }" title="站点总访问量 (Site PV)">
        <div class="label">Site PV</div>
        <div class="value">
          <span id="busuanzi_container_site_pv" style="display:none"><span id="busuanzi_value_site_pv"></span></span>
          <span v-if="sitePvLoading" class="dots" aria-hidden="true"><span></span><span></span><span></span></span>
        </div>
      </div>
      <div class="stat-card" :class="{ ready: !siteUvLoading }" title="站点访客数 (Site UV)">
        <div class="label">Site UV</div>
        <div class="value">
          <span id="busuanzi_container_site_uv" style="display:none"><span id="busuanzi_value_site_uv"></span></span>
          <span v-if="siteUvLoading" class="dots" aria-hidden="true"><span></span><span></span><span></span></span>
        </div>
      </div>
      <div class="stat-card" :class="{ ready: !pagePvLoading }" title="当前页浏览量 (Page PV)">
        <div class="label">Page PV</div>
        <div class="value">
          <span id="busuanzi_container_page_pv" style="display:none"> <span id="busuanzi_value_page_pv"></span> </span>
          <span v-if="pagePvLoading" class="dots" aria-hidden="true"><span></span><span></span><span></span></span>
        </div>
      </div>
      <button class="refresh-btn" type="button" @click="manualRefresh" :disabled="refreshing">
        <span v-if="!refreshing">刷新</span>
        <span v-else class="rotating">...</span>
      </button>
    </div>
    <!-- 原有内容 -->
    <IFrame v-if="!loading" v-loading="loading" :src="src" :headers="headers" />
  </div>
</template>
<script lang="ts" setup>
import { useCache, CACHE_KEY } from '@/hooks/useCache'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
// 使用本地依赖 busuanzi.pure.js
let busuanziModule: any = null
const wsCache = useCache()

defineOptions({ name: 'InfraAdminServer' })

const loading = ref(true) // 是否加载中
console.debug(import.meta.env)

const src = ref('/op')
// const src = ref(import.meta.env.VITE_APP_API_PREFIX + '/druid/login.html')
const headers = ref<Map<string, string>>(new Map().set('access_token', wsCache.get(CACHE_KEY.ACCESS_TOKEN) || ''))

// ---------------- Busuanzi 统计逻辑 ----------------
const sitePvLoading = ref(true)
const siteUvLoading = ref(true)
const pagePvLoading = ref(true)
const refreshing = ref(false)
let busuanziReady = false
const route = useRoute()

const markLoaded = () => {
  const sitePv = document.getElementById('busuanzi_value_site_pv')
  const siteUv = document.getElementById('busuanzi_value_site_uv')
  const pagePv = document.getElementById('busuanzi_value_page_pv')
  if (sitePv && sitePv.textContent) sitePvLoading.value = false
  if (siteUv && siteUv.textContent) siteUvLoading.value = false
  if (pagePv && pagePv.textContent) pagePvLoading.value = false
}

const observeValue = (id: string, loadingRef: any) => {
  const el = document.getElementById(id)
  if (!el) return
  if (el.textContent && el.textContent.trim() !== '') loadingRef.value = false
  const obs = new MutationObserver(() => {
    if (el.textContent && el.textContent.trim() !== '') {
      loadingRef.value = false
      obs.disconnect()
    }
  })
  obs.observe(el, { childList: true, subtree: true, characterData: true })
}

const busuanziFetch = () => {
  if (busuanziModule && typeof busuanziModule.fetch === 'function') {
    sitePvLoading.value = true
    siteUvLoading.value = true
    pagePvLoading.value = true
    try { busuanziModule.fetch() } catch {}
    setTimeout(markLoaded, 200)
    setTimeout(markLoaded, 800)
    setTimeout(markLoaded, 1600)
  }
}

const importBusuanzi = async () => {
  if (busuanziReady) return busuanziFetch()
  try {
    busuanziModule = await import('busuanzi.pure.js')
    const w: any = window as any
    if (!w.Busuanzi) w.Busuanzi = busuanziModule.default || busuanziModule
    busuanziReady = true
    busuanziFetch()
  } catch (e) {
    sitePvLoading.value = siteUvLoading.value = pagePvLoading.value = false
  }
}

const setupObservers = () => {
  observeValue('busuanzi_value_site_pv', sitePvLoading)
  observeValue('busuanzi_value_site_uv', siteUvLoading)
  observeValue('busuanzi_value_page_pv', pagePvLoading)
  setTimeout(() => { // 兜底
    if (sitePvLoading.value) sitePvLoading.value = false
    if (siteUvLoading.value) siteUvLoading.value = false
    if (pagePvLoading.value) pagePvLoading.value = false
  }, 8000)
}

const manualRefresh = () => {
  if (refreshing.value) return
  refreshing.value = true
  busuanziFetch()
  setTimeout(() => { refreshing.value = false }, 1200)
}

/** 初始化 */
onMounted(async () => {
  try {
  } finally {
    loading.value = false
  }
  importBusuanzi()
  setTimeout(setupObservers, 0)
})

// 路由变化刷新（类似官方示例）
watch(() => route.fullPath, (to, from) => {
  if (busuanziReady && to !== from) busuanziFetch()
})
</script>
<style scoped>
.home-wrapper{display:flex;flex-direction:column;gap:16px;padding:8px 8px 0}
.stats-demo{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch;background:var(--panel-bg,#0f1720);border:1px solid var(--panel-border,#1e293b);padding:14px 16px;border-radius:14px;box-shadow:0 4px 14px -4px rgba(0,0,0,.55),0 0 0 1px rgba(59,130,246,.15)}
.stat-card{--grad:linear-gradient(120deg,#2563eb,#6366f1,#3b82f6);position:relative;display:flex;flex-direction:column;min-width:130px;padding:10px 14px;border-radius:12px;background:linear-gradient(135deg,#111827 0%,#0f172a 60%);border:1px solid rgba(255,255,255,.06);color:#e2e8f0;overflow:hidden}
.stat-card:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,rgba(99,102,241,.35),transparent 70%);opacity:.6;pointer-events:none}
.stat-card.ready{border-color:rgba(99,102,241,.55);box-shadow:0 0 0 1px rgba(99,102,241,.35),0 2px 6px -2px rgba(0,0,0,.7)}
.label{font-size:12px;letter-spacing:.5px;font-weight:600;opacity:.85;margin-bottom:6px;text-transform:uppercase}
.value{font-size:22px;font-weight:700;min-height:26px;display:flex;align-items:center;gap:4px;font-variant-numeric:tabular-nums}
.refresh-btn{margin-left:auto;background:#1e293b;color:#e2e8f0;border:1px solid #334155;font-size:13px;padding:8px 14px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:6px;font-weight:600;transition:.3s ease;background-image:linear-gradient(90deg,#1e293b,#0f172a);}
.refresh-btn:hover:not(:disabled){filter:brightness(1.15);box-shadow:0 0 0 1px rgba(99,102,241,.45),0 3px 10px -2px rgba(0,0,0,.6)}
.refresh-btn:disabled{opacity:.5;cursor:not-allowed}
.dots{display:inline-flex;width:34px;justify-content:space-between}
.dots span{width:7px;height:7px;border-radius:50%;background:#64748b;animation:pulse 1s ease-in-out infinite;opacity:.35}
.dots span:nth-child(2){animation-delay:.18s}
.dots span:nth-child(3){animation-delay:.36s}
@keyframes pulse{0%,80%,100%{opacity:.25;transform:scale(.7)}40%{opacity:1;transform:scale(1)}}
.rotating{display:inline-block;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media (max-width:720px){.stats-demo{flex-direction:column}.refresh-btn{width:100%;justify-content:center;margin-top:4px}}
</style>
