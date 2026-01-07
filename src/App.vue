<template>
  <div id="app" class="holographic-app">
    <!-- 全息背景效果 -->
    <div class="holographic-background">
      <div class="holographic-grid"></div>
      <div class="holographic-particles"></div>
    </div>
    
    <!-- 路由视图 -->
    <router-view v-slot="{ Component, route }">
      <transition name="holographic-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    
    <!-- 全局加载指示器 -->
    <div v-if="loading" class="global-loading">
      <div class="holographic-loading"></div>
      <p class="loading-text">{{ loadingText }}</p>
    </div>
    
    <!-- 全息通知系统 -->
    <div class="holographic-notifications">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['holographic-notification', notification.type]"
        >
          <div class="notification-content">
            <i :class="getNotificationIcon(notification.type)"></i>
            <span>{{ notification.message }}</span>
          </div>
          <button @click="removeNotification(notification.id)" class="notification-close">
            <i class="el-icon-close"></i>
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const loadingText = ref('正在加载全息数据...')
    const notifications = reactive([])
    
    // 全息粒子动画
    const initHolographicParticles = () => {
      const particlesContainer = document.querySelector('.holographic-particles')
      if (!particlesContainer) return
      
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.top = Math.random() * 100 + '%'
        particle.style.animationDelay = Math.random() * 10 + 's'
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's'
        particlesContainer.appendChild(particle)
      }
    }
    
    // 添加通知
    const addNotification = (message, type = 'info', duration = 3000) => {
      const id = Date.now()
      notifications.push({ id, message, type })
      
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    // 移除通知
    const removeNotification = (id) => {
      const index = notifications.findIndex(n => n.id === id)
      if (index > -1) {
        notifications.splice(index, 1)
      }
    }
    
    // 获取通知图标
    const getNotificationIcon = (type) => {
      const icons = {
        success: 'el-icon-success',
        warning: 'el-icon-warning',
        error: 'el-icon-error',
        info: 'el-icon-info'
      }
      return icons[type] || icons.info
    }
    
    // 全局加载控制
    const setLoading = (isLoading, text = '正在加载全息数据...') => {
      loading.value = isLoading
      loadingText.value = text
    }
    
    // 监听路由变化
    router.beforeEach((to, from, next) => {
      setLoading(true, '正在切换全息界面...')
      next()
    })
    
    router.afterEach(() => {
      setTimeout(() => {
        setLoading(false)
      }, 800)
    })
    
    onMounted(() => {
      // 初始化全息效果
      initHolographicParticles()
      
      // 全局方法注册
      window.$notify = addNotification
      window.$loading = setLoading
      
      // 欢迎消息
      setTimeout(() => {
        addNotification('🌟 欢迎使用PLM全息投影系统', 'success', 5000)
      }, 1000)
    })
    
    onUnmounted(() => {
      // 清理全局方法
      delete window.$notify
      delete window.$loading
    })
    
    return {
      loading,
      loadingText,
      notifications,
      removeNotification,
      getNotificationIcon
    }
  }
}
</script>

<style lang="scss" scoped>
.holographic-app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

// 全息背景效果
.holographic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.holographic-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.holographic-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  :deep(.particle) {
    position: absolute;
    width: 2px;
    height: 2px;
    background: $holographic-primary;
    border-radius: 50%;
    box-shadow: 0 0 6px $holographic-primary;
    animation: particle-float 15s linear infinite;
  }
}

@keyframes particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

// 路由过渡动画
.holographic-fade-enter-active,
.holographic-fade-leave-active {
  transition: all 0.5s ease;
}

.holographic-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.holographic-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 全局加载
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 25, 41, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  
  .loading-text {
    margin-top: $spacing-lg;
    color: $text-holographic;
    font-size: 16px;
    text-align: center;
  }
}

// 全息通知系统
.holographic-notifications {
  position: fixed;
  top: $spacing-lg;
  right: $spacing-lg;
  z-index: $z-index-tooltip;
  max-width: 400px;
}

.holographic-notification {
  background: var(--hologram-card-bg);
  border: 1px solid var(--hologram-border);
  border-radius: var(--hologram-border-radius);
  backdrop-filter: blur(10px);
  margin-bottom: $spacing-sm;
  padding: $spacing-md;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  
  &.success {
    border-left: 4px solid $holographic-success;
    .notification-content i {
      color: $holographic-success;
    }
  }
  
  &.warning {
    border-left: 4px solid $holographic-warning;
    .notification-content i {
      color: $holographic-warning;
    }
  }
  
  &.error {
    border-left: 4px solid $holographic-error;
    .notification-content i {
      color: $holographic-error;
    }
  }
  
  &.info {
    border-left: 4px solid $holographic-info;
    .notification-content i {
      color: $holographic-info;
    }
  }
}

.notification-content {
  display: flex;
  align-items: center;
  flex: 1;
  
  i {
    margin-right: $spacing-sm;
    font-size: 18px;
  }
  
  span {
    color: $text-primary;
    font-size: 14px;
  }
}

.notification-close {
  background: none;
  border: none;
  color: $text-secondary;
  cursor: pointer;
  padding: $spacing-xs;
  margin-left: $spacing-sm;
  border-radius: $border-radius-sm;
  transition: all $animation-fast ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: $text-primary;
  }
}

// 通知动画
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .holographic-notifications {
    top: $spacing-sm;
    right: $spacing-sm;
    left: $spacing-sm;
    max-width: none;
  }
  
  .holographic-notification {
    min-width: auto;
  }
}
</style>
