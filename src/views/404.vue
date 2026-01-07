<template>
  <div class="error-page">
    <!-- 全息背景网格 -->
    <div class="hologram-grid"></div>
    
    <!-- 浮动粒子 -->
    <div class="floating-particles">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- 错误内容 -->
    <div class="error-content">
      <!-- 全息404数字 -->
      <div class="error-number">
        <span class="digit" data-digit="4">4</span>
        <span class="digit" data-digit="0">0</span>
        <span class="digit" data-digit="4">4</span>
      </div>

      <!-- 全息扫描线 -->
      <div class="scan-line"></div>

      <!-- 错误信息 -->
      <div class="error-info">
        <h2 class="error-title">页面未找到</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移动
        </p>
        
        <!-- 全息按钮组 -->
        <div class="action-buttons">
          <button class="hologram-btn primary" @click="goHome">
            <i class="icon-home"></i>
            返回首页
          </button>
          <button class="hologram-btn secondary" @click="goBack">
            <i class="icon-back"></i>
            返回上页
          </button>
        </div>
      </div>

      <!-- 系统状态指示器 -->
      <div class="system-status">
        <div class="status-item">
          <div class="status-dot active"></div>
          <span>系统运行正常</span>
        </div>
        <div class="status-item">
          <div class="status-dot warning"></div>
          <span>页面路径异常</span>
        </div>
      </div>
    </div>

    <!-- 全息装饰元素 -->
    <div class="hologram-decorations">
      <div class="decoration-ring ring-1"></div>
      <div class="decoration-ring ring-2"></div>
      <div class="decoration-ring ring-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 粒子动画参数
const particles = ref([])

// 生成粒子样式
const getParticleStyle = (index) => {
  return {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: Math.random() * 3 + 's',
    animationDuration: (3 + Math.random() * 4) + 's'
  }
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// 全息扫描动画
const startHologramScan = () => {
  const scanLine = document.querySelector('.scan-line')
  if (scanLine) {
    scanLine.style.animation = 'hologramScan 2s ease-in-out'
    setTimeout(() => {
      scanLine.style.animation = ''
    }, 2000)
  }
}

onMounted(() => {
  // 启动全息扫描动画
  setTimeout(startHologramScan, 500)
  
  // 定期重复扫描动画
  const scanInterval = setInterval(startHologramScan, 8000)
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(scanInterval)
  })
})
</script>

<style lang="scss" scoped>
.error-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0a1929 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'Orbitron', monospace;
}

// 全息背景网格
.hologram-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

// 浮动粒子
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--hologram-primary);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 0 10px var(--hologram-primary);
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
}

// 错误内容
.error-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 600px;
  padding: 2rem;
}

// 全息404数字
.error-number {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.digit {
  font-size: 8rem;
  font-weight: 700;
  color: var(--hologram-primary);
  text-shadow: 
    0 0 20px var(--hologram-primary),
    0 0 40px var(--hologram-primary),
    0 0 60px var(--hologram-primary);
  position: relative;
  animation: digitGlow 3s ease-in-out infinite alternate;
  
  &::before {
    content: attr(data-digit);
    position: absolute;
    top: 0;
    left: 0;
    color: rgba(0, 229, 255, 0.3);
    z-index: -1;
    transform: translate(2px, 2px);
  }
  
  &::after {
    content: attr(data-digit);
    position: absolute;
    top: 0;
    left: 0;
    color: rgba(0, 128, 255, 0.2);
    z-index: -2;
    transform: translate(-2px, -2px);
  }
}

@keyframes digitGlow {
  0% { 
    text-shadow: 
      0 0 20px var(--hologram-primary),
      0 0 40px var(--hologram-primary),
      0 0 60px var(--hologram-primary);
  }
  100% { 
    text-shadow: 
      0 0 30px var(--hologram-primary),
      0 0 60px var(--hologram-primary),
      0 0 90px var(--hologram-primary);
  }
}

// 全息扫描线
.scan-line {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--hologram-primary) 50%, 
    transparent 100%);
  box-shadow: 0 0 20px var(--hologram-primary);
}

@keyframes hologramScan {
  0% { left: -100%; }
  100% { left: 100%; }
}

// 错误信息
.error-info {
  margin-bottom: 3rem;
}

.error-title {
  font-size: 2rem;
  color: var(--hologram-primary);
  margin-bottom: 1rem;
  text-shadow: 0 0 20px var(--hologram-primary);
}

.error-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  line-height: 1.6;
}

// 全息按钮组
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hologram-btn {
  padding: 0.8rem 2rem;
  border: 1px solid var(--hologram-primary);
  background: rgba(0, 229, 255, 0.1);
  color: var(--hologram-primary);
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(0, 229, 255, 0.3) 50%, 
      transparent 100%);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: rgba(0, 229, 255, 0.2);
    box-shadow: 
      0 0 20px rgba(0, 229, 255, 0.5),
      inset 0 0 20px rgba(0, 229, 255, 0.1);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
  
  &.secondary {
    border-color: var(--hologram-secondary);
    color: var(--hologram-secondary);
    background: rgba(0, 128, 255, 0.1);
    
    &:hover {
      background: rgba(0, 128, 255, 0.2);
      box-shadow: 
        0 0 20px rgba(0, 128, 255, 0.5),
        inset 0 0 20px rgba(0, 128, 255, 0.1);
    }
  }
  
  i {
    margin-right: 0.5rem;
  }
}

// 系统状态指示器
.system-status {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &.active {
    background: #00ff88;
    box-shadow: 0 0 10px #00ff88;
    animation: pulse 2s ease-in-out infinite;
  }
  
  &.warning {
    background: #ffaa00;
    box-shadow: 0 0 10px #ffaa00;
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 全息装饰元素
.hologram-decorations {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.decoration-ring {
  position: absolute;
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 50%;
  
  &.ring-1 {
    width: 300px;
    height: 300px;
    top: -150px;
    left: -150px;
    animation: rotate 20s linear infinite;
  }
  
  &.ring-2 {
    width: 500px;
    height: 500px;
    top: -250px;
    left: -250px;
    animation: rotate 30s linear infinite reverse;
  }
  
  &.ring-3 {
    width: 700px;
    height: 700px;
    top: -350px;
    left: -350px;
    animation: rotate 40s linear infinite;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .error-number {
    gap: 0.5rem;
  }
  
  .digit {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hologram-btn {
    width: 200px;
  }
  
  .system-status {
    flex-direction: column;
    gap: 1rem;
  }
}

// 图标样式
.icon-home::before {
  content: '🏠';
}

.icon-back::before {
  content: '↩️';
}
</style>
