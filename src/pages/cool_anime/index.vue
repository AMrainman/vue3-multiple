<template>
  <canvas ref="canvasRef" id="matrix"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

// 核心配置
const fontSize = 16
const chars =
  'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

let drops: number[] = []
let columns = 0

// 初始化雨滴位置数组
function initDrops(canvas: HTMLCanvasElement) {
  columns = Math.floor(canvas.width / fontSize)
  drops = []
  for (let i = 0; i < columns; i++) {
    drops[i] = 1
  }
}

// 绘图主函数
function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  // 用半透明黑色覆盖，制造拖尾效果
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 设置字体样式
  ctx.fillStyle = '#0F0' // 荧光绿
  ctx.font = fontSize + 'px arial'

  // 遍历每一列
  for (let i = 0; i < drops.length; i++) {
    const text = chars.charAt(Math.floor(Math.random() * chars.length))
    const x = i * fontSize
    const y = drops[i] * fontSize

    ctx.fillText(text, x, y)

    // 边界判断与随机重置
    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0
    }

    drops[i]++
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置 Canvas 全屏
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initDrops(canvas)

  // 监听屏幕大小改变
  const handleResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initDrops(canvas)
  }
  window.addEventListener('resize', handleResize)

  // 动画循环
  const animate = () => {
    draw(ctx, canvas)
    animationId = setInterval(() => draw(ctx, canvas), 33)
  }
  animate()
})

onUnmounted(() => {
  if (animationId) {
    clearInterval(animationId)
  }
})
</script>

<style scoped>
#matrix {
  display: block;
}
</style>
