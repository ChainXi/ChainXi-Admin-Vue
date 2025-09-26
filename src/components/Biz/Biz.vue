<template>
  <div class="badges">
    <span class="badge">
      <span class="t">UV</span>
      <span class="v">
        <span id="busuanzi_site_uv"><span class="loading-dots"><span></span><span></span><span></span></span></span>
        <span id="busuanzi_value_site_uv" style="display:none"></span>
      </span>
    </span>
    <span class="badge">
      <span class="t">PV</span>
      <span class="v">
        <span id="busuanzi_site_pv"><span class="loading-dots"><span></span><span></span><span></span></span></span>
        <span id="busuanzi_value_site_pv" style="display:none"></span>
      </span>
    </span>
  </div>
</template>

<script lang="ts" setup>
const refreshBusuanzi = () => {
  const w = window as any
  if (w.Busuanzi && typeof w.Busuanzi.fetch === 'function') {
    try { w.Busuanzi.fetch() } catch {}
  }
}
onMounted(() => {
  if (document.getElementById('busuanzi-script')) {
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