<template>
  <div class="holographic-login">
    <!-- 全息背景动画 -->
    <div class="login-background">
      <div class="holographic-grid"></div>
      <div class="floating-elements">
        <div class="element element-1"></div>
        <div class="element element-2"></div>
        <div class="element element-3"></div>
        <div class="element element-4"></div>
      </div>
    </div>
    
    <!-- 登录表单容器 -->
    <div class="login-container">
      <div class="login-card holographic-card">
        <!-- Logo和标题 -->
        <div class="login-header">
          <div class="logo-hologram">
            <div class="logo-core">PLM</div>
            <div class="logo-rings">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
            </div>
          </div>
          <h1 class="login-title text-gradient">PLM全息投影系统</h1>
          <p class="login-subtitle">产品生命周期管理平台</p>
        </div>
        
        <!-- 登录表单 -->
        <el-form
          ref="loginForm"
          :model="loginData"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <div class="form-item-wrapper">
              <i class="el-icon-user form-icon"></i>
              <el-input
                v-model="loginData.username"
                placeholder="请输入用户名"
                class="holographic-input"
                size="large"
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>
          
          <el-form-item prop="password">
            <div class="form-item-wrapper">
              <i class="el-icon-lock form-icon"></i>
              <el-input
                v-model="loginData.password"
                type="password"
                placeholder="请输入密码"
                class="holographic-input"
                size="large"
                show-password
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>
          
          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginData.remember" class="remember-checkbox">
                记住密码
              </el-checkbox>
              <a href="#" class="forgot-password">忘记密码？</a>
            </div>
          </el-form-item>
          
          <el-form-item>
            <button
              type="submit"
              :loading="loading"
              class="login-button holographic-button"
              :disabled="loading"
            >
              <span v-if="!loading">登录系统</span>
              <span v-else>正在验证...</span>
            </button>
          </el-form-item>
        </el-form>
        
        <!-- 快速登录选项 -->
        <div class="quick-login">
          <div class="divider">
            <span>或使用以下方式登录</span>
          </div>
          <div class="quick-login-buttons">
            <button @click="quickLogin('demo')" class="quick-btn demo-btn">
              <i class="el-icon-user"></i>
              <span>演示账号</span>
            </button>
            <button @click="quickLogin('admin')" class="quick-btn admin-btn">
              <i class="el-icon-key"></i>
              <span>管理员</span>
            </button>
          </div>
        </div>
        
        <!-- 系统信息 -->
        <div class="system-info">
          <p class="version-info">版本 v1.0.0 | 全息投影技术驱动</p>
          <p class="copyright">© 2024 PLM全息系统 保留所有权利</p>
        </div>
      </div>
    </div>
    
    <!-- 全息扫描效果 -->
    <div v-if="scanningEffect" class="scanning-overlay">
      <div class="scan-line"></div>
      <div class="scan-text">正在进行全息身份验证...</div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'HolographicLogin',
  setup() {
    const router = useRouter()
    const loginForm = ref(null)
    const loading = ref(false)
    const scanningEffect = ref(false)
    
    // 登录数据
    const loginData = reactive({
      username: '',
      password: '',
      remember: false
    })
    
    // 表单验证规则
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }
    
    // 处理登录
    const handleLogin = async () => {
      if (!loginForm.value) return
      
      try {
        const valid = await loginForm.value.validate()
        if (!valid) return
        
        loading.value = true
        scanningEffect.value = true
        
        // 模拟登录验证 - 接受任何用户名和密码
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 保存登录状态
        localStorage.setItem('plm_token', 'holographic_user_token')
        localStorage.setItem('plm_user', JSON.stringify({
          username: loginData.username,
          loginTime: new Date().toISOString()
        }))
        
        scanningEffect.value = false
        
        // 使用简单的通知方式
        if (window.$notify) {
          window.$notify('登录成功，欢迎使用PLM全息系统！', 'success')
        } else {
          console.log('登录成功，欢迎使用PLM全息系统！')
        }
        
        // 跳转到仪表盘
        router.push('/dashboard')
        
      } catch (error) {
        console.error('登录失败:', error)
        if (window.$notify) {
          window.$notify('登录失败，请重试', 'error')
        } else {
          alert('登录失败，请重试')
        }
      } finally {
        loading.value = false
        scanningEffect.value = false
      }
    }
    
    // 快速登录
    const quickLogin = async (type) => {
      const accounts = {
        demo: { username: 'demo', password: 'demo123' },
        admin: { username: 'admin', password: 'admin123' }
      }
      
      const account = accounts[type]
      if (!account) return
      
      loginData.username = account.username
      loginData.password = account.password
      
      await handleLogin()
    }
    
    // 初始化动画效果
    const initAnimations = () => {
      // 创建浮动元素动画
      const elements = document.querySelectorAll('.floating-elements .element')
      elements.forEach((element, index) => {
        const delay = index * 0.5
        const duration = 3 + Math.random() * 2
        element.style.animationDelay = `${delay}s`
        element.style.animationDuration = `${duration}s`
      })
    }
    
    onMounted(() => {
      initAnimations()
      
      // 如果已经登录，直接跳转
      const token = localStorage.getItem('plm_token')
      if (token) {
        router.push('/dashboard')
      }
    })
    
    return {
      loginForm,
      loginData,
      loginRules,
      loading,
      scanningEffect,
      handleLogin,
      quickLogin
    }
  }
}
</script>

<style lang="scss" scoped>
.holographic-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

// 背景动画
.login-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  
  .holographic-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: grid-drift 30s linear infinite;
  }
  
  .floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    
    .element {
      position: absolute;
      background: $holographic-primary;
      border-radius: 50%;
      opacity: 0.3;
      animation: float-up 6s ease-in-out infinite;
      
      &.element-1 {
        width: 8px;
        height: 8px;
        left: 10%;
        animation-delay: 0s;
      }
      
      &.element-2 {
        width: 12px;
        height: 12px;
        left: 30%;
        animation-delay: 1s;
      }
      
      &.element-3 {
        width: 6px;
        height: 6px;
        left: 70%;
        animation-delay: 2s;
      }
      
      &.element-4 {
        width: 10px;
        height: 10px;
        left: 90%;
        animation-delay: 3s;
      }
    }
  }
}

@keyframes grid-drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

@keyframes float-up {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

// 登录容器
.login-container {
  width: 100%;
  max-width: 420px;
  padding: $spacing-lg;
}

.login-card {
  padding: $spacing-xxl;
  text-align: center;
}

// 登录头部
.login-header {
  margin-bottom: $spacing-xxl;
  
  .logo-hologram {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto $spacing-lg;
    
    .logo-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      background: $holographic-gradient;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      color: white;
      z-index: 2;
      box-shadow: $shadow-holographic-strong;
    }
    
    .logo-rings {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      
      .ring {
        position: absolute;
        border: 2px solid $holographic-primary;
        border-radius: 50%;
        opacity: 0.6;
        
        &.ring-1 {
          top: 10%;
          left: 10%;
          width: 80%;
          height: 80%;
          animation: ring-spin 8s linear infinite;
        }
        
        &.ring-2 {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          animation: ring-spin 12s linear infinite reverse;
        }
      }
    }
  }
  
  .login-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: $spacing-sm;
  }
  
  .login-subtitle {
    color: $text-secondary;
    font-size: 16px;
    margin: 0;
  }
}

@keyframes ring-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 登录表单
.login-form {
  text-align: left;
  margin-bottom: $spacing-xl;
  
  .form-item-wrapper {
    position: relative;
    
    .form-icon {
      position: absolute;
      left: $spacing-md;
      top: 50%;
      transform: translateY(-50%);
      color: $text-secondary;
      z-index: 2;
      font-size: 18px;
    }
    
    :deep(.el-input__wrapper) {
      background: rgba(0, 229, 255, 0.05);
      border: $border-holographic;
      border-radius: $border-radius-md;
      padding-left: 45px;
      
      &:hover, &.is-focus {
        border-color: $holographic-primary;
        box-shadow: $shadow-holographic;
      }
      
      .el-input__inner {
        color: $text-primary;
        background: transparent;
        
        &::placeholder {
          color: $text-disabled;
        }
      }
    }
  }
  
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .remember-checkbox {
      :deep(.el-checkbox__label) {
        color: $text-secondary;
      }
      
      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: $holographic-primary;
        border-color: $holographic-primary;
      }
    }
    
    .forgot-password {
      color: $text-holographic;
      text-decoration: none;
      font-size: 14px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

// 快速登录
.quick-login {
  margin-bottom: $spacing-xl;
  
  .divider {
    position: relative;
    text-align: center;
    margin-bottom: $spacing-lg;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(0, 229, 255, 0.2);
    }
    
    span {
      background: $holographic-surface;
      padding: 0 $spacing-md;
      color: $text-disabled;
      font-size: 14px;
    }
  }
  
  .quick-login-buttons {
    display: flex;
    gap: $spacing-md;
    
    .quick-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-sm;
      padding: $spacing-md;
      border: $border-holographic;
      border-radius: $border-radius-md;
      background: rgba(0, 229, 255, 0.05);
      color: $text-secondary;
      cursor: pointer;
      transition: all $animation-normal ease;
      
      &:hover {
        border-color: $holographic-primary;
        color: $text-holographic;
        box-shadow: $shadow-holographic;
      }
      
      i {
        font-size: 16px;
      }
      
      span {
        font-size: 14px;
      }
    }
  }
}

// 系统信息
.system-info {
  text-align: center;
  
  .version-info {
    color: $text-disabled;
    font-size: 12px;
    margin-bottom: $spacing-xs;
  }
  
  .copyright {
    color: $text-disabled;
    font-size: 12px;
    margin: 0;
  }
}

// 扫描效果
.scanning-overlay {
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
  
  .scan-line {
    width: 300px;
    height: 2px;
    background: $holographic-gradient;
    box-shadow: $shadow-holographic-strong;
    animation: scan-move 2s ease-in-out infinite;
    margin-bottom: $spacing-lg;
  }
  
  .scan-text {
    color: $text-holographic;
    font-size: 16px;
    text-align: center;
    animation: text-pulse 1s ease-in-out infinite;
  }
}

@keyframes scan-move {
  0%, 100% {
    transform: translateX(-150px);
    opacity: 0;
  }
  50% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes text-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

// 响应式设计
@media (max-width: $breakpoint-sm) {
  .login-container {
    padding: $spacing-md;
  }
  
  .login-card {
    padding: $spacing-lg;
  }
  
  .login-header {
    .login-title {
      font-size: 24px;
    }
    
    .login-subtitle {
      font-size: 14px;
    }
  }
  
  .quick-login .quick-login-buttons {
    flex-direction: column;
  }
}
</style>
