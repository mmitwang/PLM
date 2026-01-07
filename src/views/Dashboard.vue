<template>
  <div class="holographic-dashboard">
    <!-- 全息欢迎区域 -->
    <div class="welcome-section holographic-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="text-gradient">欢迎使用PLM全息投影系统</h1>
          <p class="welcome-subtitle">产品生命周期管理 - 未来科技体验</p>
        </div>
        <div class="welcome-hologram">
          <div class="hologram-sphere">
            <div class="sphere-core"></div>
            <div class="sphere-rings">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全息数据概览 -->
    <div class="overview-grid">
      <div class="overview-card holographic-card" v-for="item in overviewData" :key="item.key">
        <div class="card-header">
          <div class="card-icon" :class="item.iconClass">
            <i :class="item.icon"></i>
          </div>
          <div class="card-title">{{ item.title }}</div>
        </div>
        <div class="card-content">
          <div class="card-value text-holographic">{{ item.value }}</div>
          <div class="card-trend" :class="item.trend > 0 ? 'positive' : 'negative'">
            <i :class="item.trend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
            <span>{{ Math.abs(item.trend) }}%</span>
          </div>
        </div>
        <div class="card-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ item.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- 全息图表区域 -->
    <div class="charts-section">
      <div class="chart-row">
        <!-- 产品生命周期分析 -->
        <div class="chart-card holographic-chart">
          <div class="chart-title">产品生命周期分析</div>
          <div class="chart-container" ref="lifecycleChart"></div>
        </div>
        
        <!-- 工程变更趋势 -->
        <div class="chart-card holographic-chart">
          <div class="chart-title">工程变更趋势</div>
          <div class="chart-container" ref="changeChart"></div>
        </div>
      </div>
      
      <div class="chart-row">
        <!-- 质量指标监控 -->
        <div class="chart-card holographic-chart">
          <div class="chart-title">质量指标监控</div>
          <div class="chart-container" ref="qualityChart"></div>
        </div>
        
        <!-- 制造资源利用率 -->
        <div class="chart-card holographic-chart">
          <div class="chart-title">制造资源利用率</div>
          <div class="chart-container" ref="resourceChart"></div>
        </div>
      </div>
    </div>

    <!-- 全息活动流 -->
    <div class="activity-section">
      <div class="activity-card holographic-card">
        <div class="activity-header">
          <h3 class="text-holographic">实时活动流</h3>
          <button @click="refreshActivities" class="holographic-button">
            <i class="el-icon-refresh"></i> 刷新
          </button>
        </div>
        <div class="activity-timeline">
          <div class="timeline-item" v-for="activity in activities" :key="activity.id">
            <div class="timeline-dot" :class="activity.type"></div>
            <div class="timeline-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-meta">
                <span class="activity-user">{{ activity.user }}</span>
                <span class="activity-time">{{ formatTime(activity.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全息快捷操作 -->
    <div class="quick-actions">
      <div class="actions-card holographic-card">
        <h3 class="text-holographic">快捷操作</h3>
        <div class="actions-grid">
          <button
            v-for="action in quickActions"
            :key="action.key"
            @click="handleQuickAction(action.key)"
            class="action-btn holographic-button"
          >
            <i :class="action.icon"></i>
            <span>{{ action.title }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

export default {
  name: 'HolographicDashboard',
  setup() {
    const router = useRouter()
    
    // 图表引用
    const lifecycleChart = ref(null)
    const changeChart = ref(null)
    const qualityChart = ref(null)
    const resourceChart = ref(null)
    
    // 概览数据
    const overviewData = ref([
      {
        key: 'products',
        title: '产品总数',
        value: '1,247',
        trend: 12.5,
        progress: 85,
        icon: 'el-icon-box',
        iconClass: 'icon-primary'
      },
      {
        key: 'projects',
        title: '活跃项目',
        value: '89',
        trend: 8.3,
        progress: 72,
        icon: 'el-icon-folder-opened',
        iconClass: 'icon-success'
      },
      {
        key: 'changes',
        title: '工程变更',
        value: '156',
        trend: -3.2,
        progress: 68,
        icon: 'el-icon-edit',
        iconClass: 'icon-warning'
      },
      {
        key: 'quality',
        title: '质量评分',
        value: '94.2',
        trend: 5.7,
        progress: 94,
        icon: 'el-icon-medal',
        iconClass: 'icon-info'
      }
    ])
    
    // 活动数据
    const activities = ref([
      {
        id: 1,
        type: 'success',
        title: '产品设计完成',
        description: '智能传感器 v2.1 设计方案已通过审核',
        user: '张工程师',
        time: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 2,
        type: 'info',
        title: '工程变更申请',
        description: '电机控制器PCB布局优化申请已提交',
        user: '李设计师',
        time: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: 3,
        type: 'warning',
        title: '质量问题反馈',
        description: '批次 #2024001 发现轻微质量偏差',
        user: '王质检员',
        time: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 4,
        type: 'primary',
        title: 'BOM更新',
        description: '产品 SKU-001 物料清单已更新至 v1.3',
        user: '陈工程师',
        time: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        id: 5,
        type: 'success',
        title: '制造工艺优化',
        description: '装配线效率提升 15%，工艺参数已优化',
        user: '刘工艺师',
        time: new Date(Date.now() - 60 * 60 * 1000)
      }
    ])
    
    // 快捷操作
    const quickActions = ref([
      { key: 'new-product', title: '新建产品', icon: 'el-icon-plus' },
      { key: 'design-review', title: '设计评审', icon: 'el-icon-view' },
      { key: 'change-request', title: '变更申请', icon: 'el-icon-edit-outline' },
      { key: 'quality-report', title: '质量报告', icon: 'el-icon-document' },
      { key: 'resource-plan', title: '资源规划', icon: 'el-icon-date' },
      { key: 'data-analysis', title: '数据分析', icon: 'el-icon-data-analysis' }
    ])
    
    // 初始化图表
    const initCharts = () => {
      // 全息主题配置
      const holographicTheme = {
        backgroundColor: 'transparent',
        textStyle: {
          color: '#ffffff'
        },
        grid: {
          borderColor: 'rgba(0, 229, 255, 0.3)'
        }
      }
      
      // 产品生命周期分析图表
      if (lifecycleChart.value) {
        const chart1 = echarts.init(lifecycleChart.value)
        chart1.setOption({
          ...holographicTheme,
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(13, 33, 53, 0.9)',
            borderColor: 'rgba(0, 229, 255, 0.5)',
            textStyle: { color: '#ffffff' }
          },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: 35, name: '概念设计', itemStyle: { color: '#00e5ff' } },
              { value: 25, name: '详细设计', itemStyle: { color: '#0080ff' } },
              { value: 20, name: '原型制作', itemStyle: { color: '#00bcd4' } },
              { value: 15, name: '测试验证', itemStyle: { color: '#2196f3' } },
              { value: 5, name: '量产准备', itemStyle: { color: '#4caf50' } }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 229, 255, 0.5)'
              }
            }
          }]
        })
      }
      
      // 工程变更趋势图表
      if (changeChart.value) {
        const chart2 = echarts.init(changeChart.value)
        chart2.setOption({
          ...holographicTheme,
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(13, 33, 53, 0.9)',
            borderColor: 'rgba(0, 229, 255, 0.5)',
            textStyle: { color: '#ffffff' }
          },
          xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月'],
            axisLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.3)' } },
            axisLabel: { color: '#ffffff' }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.3)' } },
            axisLabel: { color: '#ffffff' },
            splitLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.1)' } }
          },
          series: [{
            data: [12, 19, 15, 25, 18, 22],
            type: 'line',
            smooth: true,
            lineStyle: { color: '#00e5ff', width: 3 },
            itemStyle: { color: '#00e5ff' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 229, 255, 0.3)' },
                  { offset: 1, color: 'rgba(0, 229, 255, 0.05)' }
                ]
              }
            }
          }]
        })
      }
      
      // 质量指标监控图表
      if (qualityChart.value) {
        const chart3 = echarts.init(qualityChart.value)
        chart3.setOption({
          ...holographicTheme,
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(13, 33, 53, 0.9)',
            borderColor: 'rgba(0, 229, 255, 0.5)',
            textStyle: { color: '#ffffff' }
          },
          radar: {
            indicator: [
              { name: '设计质量', max: 100 },
              { name: '制造质量', max: 100 },
              { name: '测试通过率', max: 100 },
              { name: '客户满意度', max: 100 },
              { name: '合规性', max: 100 }
            ],
            axisLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.3)' } },
            splitLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.2)' } },
            axisLabel: { color: '#ffffff' }
          },
          series: [{
            type: 'radar',
            data: [{
              value: [92, 88, 95, 89, 96],
              itemStyle: { color: '#00e5ff' },
              areaStyle: { color: 'rgba(0, 229, 255, 0.2)' }
            }]
          }]
        })
      }
      
      // 制造资源利用率图表
      if (resourceChart.value) {
        const chart4 = echarts.init(resourceChart.value)
        chart4.setOption({
          ...holographicTheme,
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(13, 33, 53, 0.9)',
            borderColor: 'rgba(0, 229, 255, 0.5)',
            textStyle: { color: '#ffffff' }
          },
          xAxis: {
            type: 'category',
            data: ['设备A', '设备B', '设备C', '设备D', '设备E'],
            axisLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.3)' } },
            axisLabel: { color: '#ffffff' }
          },
          yAxis: {
            type: 'value',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.3)' } },
            axisLabel: { color: '#ffffff', formatter: '{value}%' },
            splitLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.1)' } }
          },
          series: [{
            data: [85, 92, 78, 88, 95],
            type: 'bar',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#00e5ff' },
                  { offset: 1, color: '#0080ff' }
                ]
              }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 229, 255, 0.5)'
              }
            }
          }]
        })
      }
    }
    
    // 格式化时间
    const formatTime = (time) => {
      const now = new Date()
      const diff = now - time
      const minutes = Math.floor(diff / (1000 * 60))
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}小时前`
      
      const days = Math.floor(hours / 24)
      return `${days}天前`
    }
    
    // 刷新活动
    const refreshActivities = () => {
      window.$loading(true, '正在刷新活动数据...')
      setTimeout(() => {
        window.$loading(false)
        window.$notify('活动数据已刷新', 'success')
        // 触发扫描效果
        window.holographicDataLoad()
      }, 1000)
    }
    
    // 处理快捷操作
    const handleQuickAction = (key) => {
      const routes = {
        'new-product': '/product/design',
        'design-review': '/engineering/workflow',
        'change-request': '/engineering/change',
        'quality-report': '/quality/analysis',
        'resource-plan': '/manufacturing/planning',
        'data-analysis': '/analytics/performance'
      }
      
      if (routes[key]) {
        router.push(routes[key])
      }
    }
    
    onMounted(() => {
      // 设置登录状态
      localStorage.setItem('plm_token', 'holographic_user_token')
      
      nextTick(() => {
        initCharts()
        // 触发初始扫描效果
        setTimeout(() => {
          window.holographicDataLoad()
        }, 500)
      })
    })
    
    return {
      lifecycleChart,
      changeChart,
      qualityChart,
      resourceChart,
      overviewData,
      activities,
      quickActions,
      formatTime,
      refreshActivities,
      handleQuickAction
    }
  }
}
</script>

<style lang="scss" scoped>
.holographic-dashboard {
  padding: $spacing-lg;
  min-height: calc(100vh - 140px);
}

// 欢迎区域
.welcome-section {
  margin-bottom: $spacing-xl;
  
  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .welcome-text {
      flex: 1;
      
      h1 {
        font-size: 32px;
        margin-bottom: $spacing-sm;
        font-weight: 700;
      }
      
      .welcome-subtitle {
        font-size: 16px;
        color: $text-secondary;
        margin: 0;
      }
    }
    
    .welcome-hologram {
      width: 120px;
      height: 120px;
      position: relative;
      
      .hologram-sphere {
        width: 100%;
        height: 100%;
        position: relative;
        
        .sphere-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: $holographic-gradient;
          border-radius: 50%;
          box-shadow: $shadow-holographic-strong;
          animation: sphere-pulse 2s ease-in-out infinite;
        }
        
        .sphere-rings {
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
              top: 20%;
              left: 20%;
              width: 60%;
              height: 60%;
              animation: ring-rotate 8s linear infinite;
            }
            
            &.ring-2 {
              top: 10%;
              left: 10%;
              width: 80%;
              height: 80%;
              animation: ring-rotate 12s linear infinite reverse;
            }
            
            &.ring-3 {
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              animation: ring-rotate 16s linear infinite;
            }
          }
        }
      }
    }
  }
}

@keyframes sphere-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes ring-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 概览网格
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
  
  .overview-card {
    padding: $spacing-lg;
    
    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: $spacing-md;
      
      .card-icon {
        width: 50px;
        height: 50px;
        border-radius: $border-radius-lg;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: $spacing-md;
        
        i {
          font-size: 24px;
          color: white;
        }
        
        &.icon-primary { background: $holographic-gradient; }
        &.icon-success { background: linear-gradient(135deg, #4caf50, #66bb6a); }
        &.icon-warning { background: linear-gradient(135deg, #ff9800, #ffb74d); }
        &.icon-info { background: linear-gradient(135deg, #2196f3, #42a5f5); }
      }
      
      .card-title {
        font-size: 14px;
        color: $text-secondary;
        font-weight: 500;
      }
    }
    
    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-md;
      
      .card-value {
        font-size: 28px;
        font-weight: 700;
      }
      
      .card-trend {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        
        &.positive {
          color: $holographic-success;
        }
        
        &.negative {
          color: $holographic-error;
        }
        
        i {
          margin-right: $spacing-xs;
        }
      }
    }
    
    .card-progress {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .progress-bar {
        flex: 1;
        height: 6px;
        background: rgba(0, 229, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
        margin-right: $spacing-sm;
        
        .progress-fill {
          height: 100%;
          background: $holographic-gradient;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      }
      
      .progress-text {
        font-size: 12px;
        color: $text-secondary;
        min-width: 35px;
        text-align: right;
      }
    }
  }
}

// 图表区域
.charts-section {
  margin-bottom: $spacing-xl;
  
  .chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 活动区域
.activity-section {
  margin-bottom: $spacing-xl;
  
  .activity-card {
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-lg;
      
      h3 {
        margin: 0;
        font-size: 18px;
      }
    }
    
    .activity-timeline {
      .timeline-item {
        display: flex;
        margin-bottom: $spacing-lg;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: $spacing-md;
          margin-top: 6px;
          flex-shrink: 0;
          
          &.success { background: $holographic-success; }
          &.info { background: $holographic-info; }
          &.warning { background: $holographic-warning; }
          &.primary { background: $holographic-primary; }
        }
        
        .timeline-content {
          flex: 1;
          
          .activity-title {
            font-weight: 600;
            color: $text-primary;
            margin-bottom: $spacing-xs;
          }
          
          .activity-description {
            color: $text-secondary;
            font-size: 14px;
            margin-bottom: $spacing-xs;
          }
          
          .activity-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: $text-disabled;
            
            .activity-user {
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

// 快捷操作
.quick-actions {
  .actions-card {
    h3 {
      margin: 0 0 $spacing-lg 0;
      font-size: 18px;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: $spacing-md;
      
      .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: $spacing-lg;
        text-align: center;
        
        i {
          font-size: 24px;
          margin-bottom: $spacing-sm;
        }
        
        span {
          font-size: 14px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-lg) {
  .charts-section .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: $breakpoint-md) {
  .holographic-dashboard {
    padding: $spacing-md;
  }
  
  .welcome-section .welcome-content {
    flex-direction: column;
    text-align: center;
    
    .welcome-hologram {
      margin-top: $spacing-lg;
    }
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
