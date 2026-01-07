import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './styles/index.scss'
import './utils/holographic.js'

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  // Element Plus 全息主题配置
  size: 'default',
  zIndex: 3000,
})

// 全局属性
app.config.globalProperties.$ELEMENT = {
  size: 'default',
  zIndex: 3000
}

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err, info)
}

// 挂载应用
app.mount('#app')

// 全息扫描效果工具函数
window.triggerHolographicScan = (element) => {
  if (element) {
    element.classList.add('scanning')
    setTimeout(() => {
      element.classList.remove('scanning')
    }, 1000)
  }
}

// 全息数据加载效果
window.holographicDataLoad = (callback, delay = 1000) => {
  const elements = document.querySelectorAll('.holographic-card, .holographic')
  elements.forEach((el, index) => {
    setTimeout(() => {
      window.triggerHolographicScan(el)
    }, index * 200)
  })
  
  if (callback) {
    setTimeout(callback, delay)
  }
}

console.log('🌟 PLM全息投影系统已启动')
