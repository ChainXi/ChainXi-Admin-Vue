<template>
  <div class="dynamic-bg" :class="modeClass">
    <canvas ref="canvasRef" class="dynamic-bg-canvas" />
    <!-- 可插槽再扩展前景元素 -->
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
}

const props = withDefaults(
  defineProps<{
    baseCount?: number
    color?: string
    linkDistance?: number
    frameDelay?: number
    dark?: boolean
    /** 主题：默认 default，可选 pink | pinkblue（粉+蓝光斑） */
    theme?: 'default' | 'pink' | 'pinkblue'
  }>(),
  {
    baseCount: 60,
    color: '#4f8ef7',
    linkDistance: 140,
    frameDelay: 16,
    dark: undefined,
    theme: 'default'
  }
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let rafTimer: number | null = null
let loopTimer: number | null = null

const isDark = computed(() => {
  if (props.dark === undefined) {
    return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark')
  }
  return props.dark
})

const modeClass = computed(() => [isDark.value ? 'is-dark' : 'is-light', `theme-${props.theme}`])

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx = canvas.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

function createParticles() {
  const count = Math.round(props.baseCount * (window.innerWidth / 1440 + 0.2))
  particles = new Array(count).fill(0).map(() => spawnParticle())
}

function spawnParticle(): Particle {
  const speed = 0.4 + Math.random() * 0.8
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    size: 1 + Math.random() * 2,
    life: 0,
    maxLife: 600 + Math.random() * 600
  }
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  drawParticles()
  drawLinks()
}

function drawParticles() {
  if (!ctx) return
  const baseColor = props.color
  particles.forEach((p, i) => {
    p.x += p.vx
    p.y += p.vy
    p.life++
    if (p.x < -50 || p.x > window.innerWidth + 50 || p.y < -50 || p.y > window.innerHeight + 50 || p.life > p.maxLife) {
      particles[i] = spawnParticle()
      return
    }
    const alpha = 0.15 + 0.35 * Math.sin((p.life / p.maxLife) * Math.PI)
    ctx!.beginPath()
    ctx!.fillStyle = hexToRgba(baseColor, alpha)
    ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx!.fill()
  })
}

function drawLinks() {
  if (!ctx) return
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < props.linkDistance) {
        const alpha = 1 - dist / props.linkDistance
        ctx.strokeStyle = hexToRgba(props.color, 0.12 * alpha)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }
}

function hexToRgba(hex: string, alpha: number) {
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('')
  }
  const bigint = parseInt(c, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function animate() {
  draw()
  rafTimer = window.requestAnimationFrame(animate)
}

function start() {
  stop()
  initCanvas()
  createParticles()
  animate()
  if (props.frameDelay > 16) {
    // 降帧模式：若 frameDelay >16ms，则用定时器节流 draw，提高性能
    stop()
    loopTimer = window.setInterval(draw, props.frameDelay)
  }
}

function stop() {
  if (rafTimer) {
    cancelAnimationFrame(rafTimer)
    rafTimer = null
  }
  if (loopTimer) {
    clearInterval(loopTimer)
    loopTimer = null
  }
}

function handleResize() {
  start()
}

onMounted(() => {
  start()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  stop()
})

watch(isDark, () => {
  // 深色模式切换时可调整颜色亮度（简单策略：深色模式颜色稍微提亮）
  // 这里留空但触发重绘
  draw()
})
</script>

<style scoped>
.dynamic-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(circle at 25% 25%, rgba(80,120,255,0.18), transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(0,180,160,0.18), transparent 65%),
    linear-gradient(135deg, #0f1320, #111a2e 60%, #0f1320);
}
.dynamic-bg.is-dark {
  background: radial-gradient(circle at 25% 25%, rgba(90,130,255,0.23), transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(0,200,170,0.20), transparent 65%),
    linear-gradient(135deg, #0b0e17, #141b2c 55%, #0b0e17);
}
.dynamic-bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 粉色主题（浅色） */
.theme-pink.dynamic-bg.is-light {
  background:
    radial-gradient(circle at 25% 30%, rgba(255,160,200,0.30), transparent 62%),
    radial-gradient(circle at 75% 70%, rgba(255,190,230,0.28), transparent 65%),
    linear-gradient(135deg, #ffeff6, #ffd3e8 55%, #ffe5f1);
}
/* 粉色主题（深色） */
.theme-pink.dynamic-bg.is-dark {
  background:
    radial-gradient(circle at 22% 28%, rgba(255,140,195,0.35), transparent 60%),
    radial-gradient(circle at 78% 72%, rgba(255,170,215,0.30), transparent 63%),
    linear-gradient(135deg, #1b1219, #2a1824 55%, #1b121f);
}

/* 粉+蓝混合主题（浅色） */
.theme-pinkblue.dynamic-bg.is-light {
  background:
    radial-gradient(circle at 24% 30%, rgba(255,170,215,0.28), transparent 62%),
    radial-gradient(circle at 78% 68%, rgba(140,190,255,0.30), transparent 63%),
    radial-gradient(circle at 55% 40%, rgba(120,170,255,0.18), transparent 60%),
    radial-gradient(circle at 78% 24%, rgba(255,120,120,0.20), transparent 60%),
    linear-gradient(135deg, #fef2f8, #f0f7ff 55%, #ffe9f4);
}
/* 粉+蓝混合主题（深色） */
.theme-pinkblue.dynamic-bg.is-dark {
  background:
    radial-gradient(circle at 22% 28%, rgba(255,140,195,0.33), transparent 60%),
    radial-gradient(circle at 75% 72%, rgba(110,160,255,0.30), transparent 63%),
    radial-gradient(circle at 58% 38%, rgba(90,140,235,0.20), transparent 60%),
    radial-gradient(circle at 78% 24%, rgba(255,90,90,0.20), transparent 62%),
    linear-gradient(135deg, #151823, #231a26 55%, #181822);
}
</style>
