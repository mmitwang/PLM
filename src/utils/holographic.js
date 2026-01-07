/**
 * 全息投影效果工具类
 * 实现全息扫描动效、数据投影、轻量扫描动效等核心功能
 */

class HolographicEffects {
  constructor() {
    this.scanningElements = new Set()
    this.isGlobalScanning = false
    this.scanDuration = 1000 // 1秒扫描时长
    this.init()
  }

  /**
   * 初始化全息效果
   */
  init() {
    this.createGlobalStyles()
    this.bindGlobalEvents()
    this.initParticleSystem()
  }

  /**
   * 创建全局样式
   */
  createGlobalStyles() {
    if (document.getElementById('holographic-styles')) return

    const style = document.createElement('style')
    style.id = 'holographic-styles'
    style.textContent = `
      /* 全息扫描动效 */
      @keyframes holographic-scan {
        0% {
          transform: translateX(-100%);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes holographic-glow {
        0%, 100% {
          box-shadow: 0 0 5px rgba(0, 229, 255, 0.3);
        }
        50% {
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.8), 0 0 30px rgba(0, 229, 255, 0.4);
        }
      }

      @keyframes data-projection {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.9);
        }
        100% {
          opacity: 0.6;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes holographic-pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.6;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.8;
        }
      }

      /* 扫描线效果 */
      .holographic-scan-line {
        position: absolute;
        top: 0;
        left: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(to bottom, 
          transparent 0%, 
          rgba(0, 229, 255, 0.8) 20%, 
          rgba(0, 229, 255, 1) 50%, 
          rgba(0, 229, 255, 0.8) 80%, 
          transparent 100%
        );
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.8);
        animation: holographic-scan 1s ease-out;
        z-index: 9999;
        pointer-events: none;
      }

      /* 数据投影效果 */
      .data-projection {
        position: absolute;
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12px;
        color: rgba(0, 229, 255, 0.9);
        backdrop-filter: blur(10px);
        animation: data-projection 0.5s ease-out;
        z-index: 9998;
        pointer-events: none;
      }

      /* 全息加载效果 */
      .holographic-loading {
        width: 60px;
        height: 60px;
        border: 3px solid transparent;
        border-top: 3px solid #00e5ff;
        border-right: 3px solid #0080ff;
        border-radius: 50%;
        animation: holographic-spin 1s linear infinite;
        position: relative;
      }

      .holographic-loading::before {
        content: '';
        position: absolute;
        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;
        border: 3px solid transparent;
        border-bottom: 3px solid rgba(0, 229, 255, 0.3);
        border-left: 3px solid rgba(0, 128, 255, 0.3);
        border-radius: 50%;
        animation: holographic-spin 2s linear infinite reverse;
      }

      @keyframes holographic-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* 全息状态指示器 */
      .holographic-status {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .holographic-status.online {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      .holographic-status.offline {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
        border: 1px solid rgba(244, 67, 54, 0.3);
      }

      .holographic-status.processing {
        background: rgba(255, 152, 0, 0.2);
        color: #ff9800;
        border: 1px solid rgba(255, 152, 0, 0.3);
        animation: holographic-pulse 2s ease-in-out infinite;
      }

      /* 全息按钮效果 */
      .holographic-button {
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        color: #00e5ff;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        position: relative;
        overflow: hidden;
      }

      .holographic-button:hover {
        background: rgba(0, 229, 255, 0.2);
        border-color: rgba(0, 229, 255, 0.6);
        box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
        transform: translateY(-1px);
      }

      .holographic-button:active {
        transform: translateY(0);
      }

      /* 全息卡片效果 */
      .holographic-card {
        background: rgba(13, 33, 53, 0.6);
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 12px;
        backdrop-filter: blur(20px);
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .holographic-card:hover {
        border-color: rgba(0, 229, 255, 0.4);
        box-shadow: 0 8px 32px rgba(0, 229, 255, 0.1);
        transform: translateY(-2px);
      }

      .holographic-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(0, 229, 255, 0.1), 
          transparent
        );
        transition: left 0.5s ease;
      }

      .holographic-card:hover::before {
        left: 100%;
      }

      /* 全息图表容器 */
      .holographic-chart {
        background: rgba(13, 33, 53, 0.4);
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 12px;
        padding: 20px;
        backdrop-filter: blur(15px);
        position: relative;
      }

      .holographic-chart .chart-title {
        color: #00e5ff;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        text-align: center;
      }

      .holographic-chart .chart-container {
        height: 300px;
        position: relative;
      }

      /* 文本渐变效果 */
      .text-gradient {
        background: linear-gradient(135deg, #00e5ff 0%, #0080ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .text-holographic {
        color: #00e5ff;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
      }

      /* 全息网格背景 */
      .holographic-grid {
        background-image: 
          linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 绑定全局事件
   */
  bindGlobalEvents() {
    // 绑定到window对象，供全局调用
    window.triggerHolographicScan = (element) => this.triggerScan(element)
    window.holographicDataLoad = () => this.triggerGlobalScan()
    window.createDataProjection = (element, data) => this.createDataProjection(element, data)
    window.holographicPulse = (element) => this.triggerPulse(element)
  }

  /**
   * 初始化粒子系统
   */
  initParticleSystem() {
    // 创建全局粒子容器
    if (!document.querySelector('.global-particles')) {
      const particleContainer = document.createElement('div')
      particleContainer.className = 'global-particles'
      particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      `
      document.body.appendChild(particleContainer)
    }
  }

  /**
   * 触发扫描效果
   * @param {HTMLElement} element - 目标元素
   */
  triggerScan(element) {
    if (!element || this.scanningElements.has(element)) return

    this.scanningElements.add(element)
    
    // 创建扫描线
    const scanLine = document.createElement('div')
    scanLine.className = 'holographic-scan-line'
    
    // 设置扫描线位置
    const rect = element.getBoundingClientRect()
    element.style.position = 'relative'
    element.appendChild(scanLine)
    
    // 添加发光效果
    element.style.animation = 'holographic-glow 1s ease-out'
    
    // 创建数据投影
    setTimeout(() => {
      this.createDataProjection(element, {
        status: '扫描完成',
        timestamp: new Date().toLocaleTimeString()
      })
    }, 500)
    
    // 清理效果
    setTimeout(() => {
      if (scanLine.parentNode) {
        scanLine.parentNode.removeChild(scanLine)
      }
      element.style.animation = ''
      this.scanningElements.delete(element)
    }, this.scanDuration)
  }

  /**
   * 触发全局扫描
   */
  triggerGlobalScan() {
    if (this.isGlobalScanning) return
    
    this.isGlobalScanning = true
    
    // 扫描所有卡片元素
    const cards = document.querySelectorAll('.holographic-card, .overview-card, .chart-card')
    cards.forEach((card, index) => {
      setTimeout(() => {
        this.triggerScan(card)
      }, index * 200)
    })
    
    // 创建全局粒子效果
    this.createGlobalParticles()
    
    setTimeout(() => {
      this.isGlobalScanning = false
    }, cards.length * 200 + this.scanDuration)
  }

  /**
   * 创建数据投影
   * @param {HTMLElement} element - 目标元素
   * @param {Object} data - 投影数据
   */
  createDataProjection(element, data) {
    const projection = document.createElement('div')
    projection.className = 'data-projection'
    
    // 设置投影内容
    if (typeof data === 'string') {
      projection.textContent = data
    } else {
      projection.innerHTML = Object.entries(data)
        .map(([key, value]) => `<div>${key}: ${value}</div>`)
        .join('')
    }
    
    // 设置投影位置
    const rect = element.getBoundingClientRect()
    projection.style.cssText += `
      top: ${rect.top - 40}px;
      left: ${rect.left + rect.width / 2 - 50}px;
      position: fixed;
    `
    
    document.body.appendChild(projection)
    
    // 自动清理
    setTimeout(() => {
      if (projection.parentNode) {
        projection.parentNode.removeChild(projection)
      }
    }, 3000)
  }

  /**
   * 触发脉冲效果
   * @param {HTMLElement} element - 目标元素
   */
  triggerPulse(element) {
    if (!element) return
    
    element.style.animation = 'holographic-pulse 0.6s ease-out'
    
    setTimeout(() => {
      element.style.animation = ''
    }, 600)
  }

  /**
   * 创建全局粒子效果
   */
  createGlobalParticles() {
    const container = document.querySelector('.global-particles')
    if (!container) return
    
    // 创建20个粒子
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div')
      particle.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        background: #00e5ff;
        border-radius: 50%;
        box-shadow: 0 0 6px #00e5ff;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particle-float ${3 + Math.random() * 4}s ease-out forwards;
      `
      
      container.appendChild(particle)
      
      // 清理粒子
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }, 7000)
    }
  }

  /**
   * 创建全息加载指示器
   * @param {HTMLElement} container - 容器元素
   */
  createLoadingIndicator(container) {
    const loading = document.createElement('div')
    loading.className = 'holographic-loading'
    container.appendChild(loading)
    return loading
  }

  /**
   * 创建全息状态指示器
   * @param {string} status - 状态 (online/offline/processing)
   * @param {string} text - 显示文本
   */
  createStatusIndicator(status, text) {
    const indicator = document.createElement('div')
    indicator.className = `holographic-status ${status}`
    indicator.textContent = text
    return indicator
  }

  /**
   * 应用全息主题到图表
   * @param {Object} chartOption - ECharts配置对象
   */
  applyHolographicTheme(chartOption) {
    const holographicTheme = {
      backgroundColor: 'transparent',
      textStyle: {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      },
      title: {
        textStyle: {
          color: '#00e5ff'
        }
      },
      legend: {
        textStyle: {
          color: '#ffffff'
        }
      },
      grid: {
        borderColor: 'rgba(0, 229, 255, 0.3)',
        backgroundColor: 'transparent'
      },
      categoryAxis: {
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 229, 255, 0.3)'
          }
        },
        axisLabel: {
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 229, 255, 0.1)'
          }
        }
      },
      valueAxis: {
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 229, 255, 0.3)'
          }
        },
        axisLabel: {
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 229, 255, 0.1)'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(13, 33, 53, 0.9)',
        borderColor: 'rgba(0, 229, 255, 0.5)',
        textStyle: {
          color: '#ffffff'
        }
      }
    }
    
    return { ...chartOption, ...holographicTheme }
  }

  /**
   * 销毁全息效果
   */
  destroy() {
    // 清理样式
    const style = document.getElementById('holographic-styles')
    if (style) {
      style.remove()
    }
    
    // 清理粒子容器
    const particles = document.querySelector('.global-particles')
    if (particles) {
      particles.remove()
    }
    
    // 清理全局方法
    delete window.triggerHolographicScan
    delete window.holographicDataLoad
    delete window.createDataProjection
    delete window.holographicPulse
    
    // 清理扫描元素
    this.scanningElements.clear()
  }
}

// 创建全局实例
const holographicEffects = new HolographicEffects()

export default holographicEffects
