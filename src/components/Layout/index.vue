<template>
  <div class="holographic-layout">
    <!-- 全息顶部导航栏 -->
    <header class="holographic-header">
      <div class="header-content">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo-hologram">
            <div class="logo-core">PLM</div>
            <div class="logo-ring"></div>
            <div class="logo-particles"></div>
          </div>
          <span class="system-title text-gradient">全息产品生命周期管理系统</span>
        </div>
        
        <!-- 全息导航菜单 -->
        <nav class="holographic-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="['nav-item', { active: isActiveNav(item.path) }]"
            @click="triggerNavScan"
          >
            <i :class="item.icon"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
        
        <!-- 用户信息区域 -->
        <div class="user-section">
          <div class="holographic-status online">在线</div>
          <el-dropdown @command="handleUserCommand" trigger="click">
            <div class="user-avatar">
              <img src="/avatar-placeholder.png" alt="用户头像" @error="handleAvatarError">
              <div class="avatar-glow"></div>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="holographic-dropdown">
                <el-dropdown-item command="profile">
                  <i class="el-icon-user"></i> 个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <i class="el-icon-setting"></i> 系统设置
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <i class="el-icon-switch-button"></i> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    
    <!-- 主体内容区域 -->
    <div class="layout-body">
      <!-- 全息侧边栏 -->
      <aside class="holographic-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <button @click="toggleSidebar" class="sidebar-toggle holographic-button">
            <i :class="sidebarCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
          </button>
        </div>
        
        <div class="sidebar-content">
          <div class="sidebar-section" v-for="section in sidebarSections" :key="section.title">
            <div class="section-title" v-if="!sidebarCollapsed">{{ section.title }}</div>
            <div class="section-items">
              <router-link
                v-for="item in section.items"
                :key="item.path"
                :to="item.path"
                :class="['sidebar-item', { active: $route.path === item.path }]"
                @click="handleSidebarClick"
              >
                <i :class="['icon', item.icon]"></i>
                <span v-if="!sidebarCollapsed" class="item-text">{{ item.name }}</span>
                <div v-if="item.badge" class="item-badge">{{ item.badge }}</div>
              </router-link>
            </div>
          </div>
        </div>
      </aside>
      
      <!-- 主内容区域 -->
      <main class="main-content">
        <div class="content-wrapper">
          <!-- 面包屑导航 -->
          <div class="breadcrumb-section">
            <el-breadcrumb separator="/" class="holographic-breadcrumb">
              <el-breadcrumb-item
                v-for="(item, index) in breadcrumbs"
                :key="index"
                :to="item.path"
              >
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <!-- 路由视图 -->
          <div class="page-content">
            <router-view v-slot="{ Component, route }">
              <transition name="page-slide" mode="out-in">
                <component :is="Component" :key="route.path" />
              </transition>
            </router-view>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 全息浮动操作按钮 -->
    <div class="floating-actions">
      <el-tooltip content="全息扫描" placement="left">
        <button @click="triggerGlobalScan" class="floating-btn scan-btn">
          <i class="el-icon-view"></i>
        </button>
      </el-tooltip>
      <el-tooltip content="数据同步" placement="left">
        <button @click="syncData" class="floating-btn sync-btn">
          <i class="el-icon-refresh"></i>
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'HolographicLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const sidebarCollapsed = ref(false)
    
    // 导航菜单项
    const navItems = ref([
      { path: '/dashboard', name: '仪表盘', icon: 'el-icon-odometer' },
      { path: '/product', name: '产品管理', icon: 'el-icon-box' },
      { path: '/engineering', name: '工程设计', icon: 'el-icon-cpu' },
      { path: '/manufacturing', name: '制造管理', icon: 'el-icon-setting' },
      { path: '/quality', name: '质量控制', icon: 'el-icon-medal' },
      { path: '/analytics', name: '数据分析', icon: 'el-icon-data-analysis' }
    ])
    
    // 侧边栏菜单
    const sidebarSections = ref([
      {
        title: '产品管理',
        items: [
          { path: '/product/design', name: '产品设计', icon: 'el-icon-edit-outline' },
          { path: '/product/lifecycle', name: '生命周期', icon: 'el-icon-refresh' },
          { path: '/product/bom', name: 'BOM管理', icon: 'el-icon-menu' },
          { path: '/product/version', name: '版本控制', icon: 'el-icon-folder-opened' }
        ]
      },
      {
        title: '工程设计',
        items: [
          { path: '/engineering/change', name: '工程变更', icon: 'el-icon-edit' },
          { path: '/engineering/workflow', name: '工作流程', icon: 'el-icon-connection' },
          { path: '/engineering/collaboration', name: '协同设计', icon: 'el-icon-user' }
        ]
      },
      {
        title: '制造管理',
        items: [
          { path: '/manufacturing/process', name: '制造工艺', icon: 'el-icon-setting' },
          { path: '/manufacturing/resource', name: '制造资源', icon: 'el-icon-goods' },
          { path: '/manufacturing/planning', name: '生产计划', icon: 'el-icon-date' }
        ]
      },
      {
        title: '质量控制',
        items: [
          { path: '/quality/control', name: '质量控制', icon: 'el-icon-medal' },
          { path: '/quality/inspection', name: '质量检验', icon: 'el-icon-view' },
          { path: '/quality/analysis', name: '质量分析', icon: 'el-icon-pie-chart' }
        ]
      },
      {
        title: '文档管理',
        items: [
          { path: '/document/management', name: '文档管理', icon: 'el-icon-document' },
          { path: '/document/template', name: '文档模板', icon: 'el-icon-tickets' },
          { path: '/document/approval', name: '文档审批', icon: 'el-icon-circle-check' }
        ]
      },
      {
        title: '数据分析',
        items: [
          { path: '/analytics/performance', name: '性能分析', icon: 'el-icon-data-line' },
          { path: '/analytics/cost', name: '成本分析', icon: 'el-icon-money' },
          { path: '/analytics/trend', name: '趋势分析', icon: 'el-icon-trend-charts' }
        ]
      },
      {
        title: '系统设置',
        items: [
          { path: '/settings/system', name: '系统设置', icon: 'el-icon-setting' },
          { path: '/settings/user', name: '用户管理', icon: 'el-icon-user-solid' },
          { path: '/settings/security', name: '安全设置', icon: 'el-icon-lock' }
        ]
      }
    ])
    
    // 面包屑导航
    const breadcrumbs = computed(() => {
      const pathArray = route.path.split('/').filter(Boolean)
      const crumbs = [{ name: '首页', path: '/dashboard' }]
      
      let currentPath = ''
      pathArray.forEach(segment => {
        currentPath += `/${segment}`
        const menuItem = findMenuItem(currentPath)
        if (menuItem) {
          crumbs.push({ name: menuItem.name, path: currentPath })
        }
      })
      
      return crumbs
    })
    
    // 查找菜单项
    const findMenuItem = (path) => {
      // 在导航菜单中查找
      const navItem = navItems.value.find(item => item.path === path)
      if (navItem) return navItem
      
      // 在侧边栏菜单中查找
      for (const section of sidebarSections.value) {
        const item = section.items.find(item => item.path === path)
        if (item) return item
      }
      
      return null
    }
    
    // 检查导航是否激活
    const isActiveNav = (path) => {
      return route.path.startsWith(path)
    }
    
    // 切换侧边栏
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
      localStorage.setItem('plm_sidebar_collapsed', sidebarCollapsed.value)
    }
    
    // 处理用户命令
    const handleUserCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/settings/user')
          break
        case 'settings':
          router.push('/settings/system')
          break
        case 'logout':
          handleLogout()
          break
      }
    }
    
    // 退出登录
    const handleLogout = () => {
      localStorage.removeItem('plm_token')
      window.$notify('已安全退出系统', 'success')
      router.push('/login')
    }
    
    // 处理头像错误
    const handleAvatarError = (e) => {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMGU1ZmYiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEwQzEyLjIwOTEgMTAgMTQgOC4yMDkxNCAxNCA2QzE0IDMuNzkwODYgMTIuMjA5MSAyIDEwIDJDNy43OTA4NiAyIDYgMy43OTA4NiA2IDZDNiA4LjIwOTE0IDcuNzkwODYgMTAgMTAgMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMTJDNi42ODYyOSAxMiA0IDE0LjY4NjMgNCAxOFYyMEgxNlYxOEMxNiAxNC42ODYzIDEzLjMxMzcgMTIgMTAgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+'
    }
    
    // 触发导航扫描
    const triggerNavScan = (e) => {
      window.triggerHolographicScan(e.currentTarget)
    }
    
    // 处理侧边栏点击
    const handleSidebarClick = (e) => {
      window.triggerHolographicScan(e.currentTarget)
    }
    
    // 触发全局扫描
    const triggerGlobalScan = () => {
      window.holographicDataLoad()
      window.$notify('全息扫描完成', 'success')
    }
    
    // 同步数据
    const syncData = () => {
      window.$loading(true, '正在同步全息数据...')
      setTimeout(() => {
        window.$loading(false)
        window.$notify('数据同步完成', 'success')
      }, 2000)
    }
    
    onMounted(() => {
      // 恢复侧边栏状态
      const collapsed = localStorage.getItem('plm_sidebar_collapsed')
      if (collapsed !== null) {
        sidebarCollapsed.value = collapsed === 'true'
      }
    })
    
    return {
      sidebarCollapsed,
      navItems,
      sidebarSections,
      breadcrumbs,
      isActiveNav,
      toggleSidebar,
      handleUserCommand,
      handleAvatarError,
      triggerNavScan,
      handleSidebarClick,
      triggerGlobalScan,
      syncData
    }
  }
}
</script>

<style lang="scss" scoped>
.holographic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// 全息头部
.holographic-header {
  background: rgba(13, 33, 53, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: $border-holographic;
  height: 70px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-index-dropdown;
  
  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-lg;
  }
  
  .nav-item {
    padding: $spacing-md $spacing-lg;
    color: $text-secondary;
    text-decoration: none;
    transition: all $animation-normal ease;
    position: relative;
    
    &:hover, &.active {
      color: $text-holographic;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: $holographic-gradient;
      }
    }
  }
}

// Logo区域
.logo-section {
  display: flex;
  align-items: center;
  
  .logo-hologram {
    position: relative;
    width: 50px;
    height: 50px;
    margin-right: $spacing-md;
    
    .logo-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      background: $holographic-gradient;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      color: white;
      z-index: 2;
    }
    
    .logo-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 2px solid $holographic-primary;
      border-radius: 50%;
      animation: logo-rotate 10s linear infinite;
      opacity: 0.6;
    }
    
    .logo-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      
      &::before, &::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        background: $holographic-primary;
        border-radius: 50%;
        animation: logo-particle 3s ease-in-out infinite;
      }
      
      &::before {
        top: 10%;
        left: 20%;
        animation-delay: 0s;
      }
      
      &::after {
        bottom: 15%;
        right: 25%;
        animation-delay: 1.5s;
      }
    }
  }
  
  .system-title {
    font-size: 18px;
    font-weight: 600;
  }
}

@keyframes logo-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes logo-particle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

// 用户区域
.user-section {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  
  .user-avatar {
    position: relative;
    width: 40px;
    height: 40px;
    cursor: pointer;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .avatar-glow {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid $holographic-primary;
      border-radius: 50%;
      opacity: 0;
      transition: opacity $animation-normal ease;
    }
    
    &:hover .avatar-glow {
      opacity: 1;
    }
  }
}

// 布局主体
.layout-body {
  display: flex;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
}

// 全息侧边栏
.holographic-sidebar {
  background: rgba(13, 33, 53, 0.95);
  backdrop-filter: blur(20px);
  border-right: $border-holographic;
  width: 280px;
  transition: width $animation-normal ease;
  
  &.collapsed {
    width: 80px;
  }
  
  .sidebar-header {
    padding: $spacing-md;
    border-bottom: $border-holographic;
    
    .sidebar-toggle {
      width: 100%;
      padding: $spacing-sm;
    }
  }
  
  .sidebar-content {
    padding: $spacing-md 0;
    overflow-y: auto;
    height: calc(100vh - 140px);
  }
  
  .sidebar-section {
    margin-bottom: $spacing-lg;
    
    .section-title {
      padding: 0 $spacing-lg $spacing-sm;
      font-size: 12px;
      color: $text-disabled;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
  
  .sidebar-item {
    position: relative;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: $spacing-md $spacing-lg;
    color: $text-secondary;
    cursor: pointer;
    transition: all $animation-normal ease;
    border-left: 3px solid transparent;
    
    &:hover, &.active {
      color: $text-holographic;
      background: rgba(0, 229, 255, 0.1);
      border-left-color: $holographic-primary;
    }
    
    .icon {
      margin-right: $spacing-sm;
      font-size: 18px;
    }
    
    .item-badge {
      margin-left: auto;
      background: $holographic-primary;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
    }
  }
}

// 主内容区域
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .content-wrapper {
    flex: 1;
    padding: $spacing-lg;
  }
  
  .breadcrumb-section {
    margin-bottom: $spacing-lg;
    
    .holographic-breadcrumb {
      :deep(.el-breadcrumb__item) {
        .el-breadcrumb__inner {
          color: $text-secondary;
          
          &:hover {
            color: $text-holographic;
          }
        }
        
        &:last-child .el-breadcrumb__inner {
          color: $text-holographic;
        }
      }
      
      :deep(.el-breadcrumb__separator) {
        color: $text-disabled;
      }
    }
  }
  
  .page-content {
    flex: 1;
  }
}

// 页面切换动画
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.3s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 浮动操作按钮
.floating-actions {
  position: fixed;
  bottom: $spacing-xl;
  right: $spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  z-index: $z-index-popover;
  
  .floating-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    box-shadow: $shadow-holographic;
    transition: all $animation-normal ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-holographic-strong;
    }
    
    &.scan-btn {
      background: $holographic-gradient;
    }
    
    &.sync-btn {
      background: linear-gradient(135deg, $holographic-accent 0%, $holographic-info 100%);
    }
  }
}

// 全息下拉菜单
:deep(.holographic-dropdown) {
  background: rgba(13, 33, 53, 0.95);
  backdrop-filter: blur(20px);
  border: $border-holographic;
  border-radius: $border-radius-md;
  
  .el-dropdown-menu__item {
    color: $text-secondary;
    
    &:hover {
      background: rgba(0, 229, 255, 0.1);
      color: $text-holographic;
    }
    
    i {
      margin-right: $spacing-sm;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .holographic-header {
    .header-content {
      padding: 0 $spacing-md;
    }
    
    .logo-section .system-title {
      display: none;
    }
  }
  
  .holographic-sidebar {
    width: 80px;
    
    &.collapsed {
      width: 0;
      overflow: hidden;
    }
  }
  
  .main-content .content-wrapper {
    padding: $spacing-md;
  }
  
  .floating-actions {
    bottom: $spacing-lg;
    right: $spacing-lg;
  }
}
</style>
