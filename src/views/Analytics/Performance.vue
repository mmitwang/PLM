<template>
  <div class="performance-analytics">
    <div class="page-header">
      <h1 class="page-title">性能分析</h1>
      <p class="page-description">产品性能指标监控与分析</p>
    </div>

    <div class="analytics-grid">
      <!-- 性能概览 -->
      <div class="holographic-card overview-card">
        <div class="card-header">
          <h3>性能概览</h3>
          <div class="time-selector">
            <el-select v-model="timeRange" size="small">
              <el-option label="实时" value="realtime" />
              <el-option label="今日" value="today" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
            </el-select>
          </div>
        </div>
        <div class="performance-metrics">
          <div class="metric-item">
            <div class="metric-value">{{ overallScore }}</div>
            <div class="metric-label">综合评分</div>
            <div class="metric-trend up">+2.3</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ efficiency }}%</div>
            <div class="metric-label">运行效率</div>
            <div class="metric-trend up">+5.2%</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ reliability }}%</div>
            <div class="metric-label">可靠性</div>
            <div class="metric-trend down">-1.1%</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ responseTime }}ms</div>
            <div class="metric-label">响应时间</div>
            <div class="metric-trend up">-15ms</div>
          </div>
        </div>
      </div>

      <!-- 性能趋势图 -->
      <div class="holographic-card chart-card">
        <div class="card-header">
          <h3>性能趋势</h3>
        </div>
        <div ref="performanceTrendChart" class="chart-container"></div>
      </div>

      <!-- 系统负载监控 -->
      <div class="holographic-card chart-card">
        <div class="card-header">
          <h3>系统负载</h3>
        </div>
        <div ref="systemLoadChart" class="chart-container"></div>
      </div>

      <!-- 性能指标详情 -->
      <div class="holographic-card metrics-detail-card">
        <div class="card-header">
          <h3>性能指标详情</h3>
        </div>
        <div class="metrics-grid">
          <div class="metric-card" v-for="metric in performanceMetrics" :key="metric.id">
            <div class="metric-icon">
              <i :class="metric.icon"></i>
            </div>
            <div class="metric-info">
              <div class="metric-name">{{ metric.name }}</div>
              <div class="metric-current">{{ metric.current }}</div>
              <div class="metric-status" :class="metric.status">
                {{ getStatusText(metric.status) }}
              </div>
            </div>
            <div class="metric-chart">
              <div class="mini-chart" :ref="el => setMiniChartRef(el, metric.id)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 告警信息 -->
      <div class="holographic-card alert-card">
        <div class="card-header">
          <h3>性能告警</h3>
          <el-badge :value="alertCount" class="alert-badge">
            <i class="el-icon-warning"></i>
          </el-badge>
        </div>
        <div class="alert-list">
          <div class="alert-item" v-for="alert in alerts" :key="alert.id" :class="alert.level">
            <div class="alert-icon">
              <i :class="getAlertIcon(alert.level)"></i>
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-description">{{ alert.description }}</div>
              <div class="alert-time">{{ alert.time }}</div>
            </div>
            <div class="alert-actions">
              <el-button type="text" size="small" @click="handleAlert(alert)">
                处理
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const timeRange = ref('realtime')
const overallScore = ref(8.7)
const efficiency = ref(92.5)
const reliability = ref(98.2)
const responseTime = ref(125)
const alertCount = ref(3)

const performanceMetrics = ref([
  {
    id: 1,
    name: 'CPU使用率',
    current: '45%',
    status: 'normal',
    icon: 'el-icon-cpu'
  },
  {
    id: 2,
    name: '内存使用率',
    current: '68%',
    status: 'warning',
    icon: 'el-icon-memory'
  },
  {
    id: 3,
    name: '磁盘I/O',
    current: '23MB/s',
    status: 'normal',
    icon: 'el-icon-disk'
  },
  {
    id: 4,
    name: '网络延迟',
    current: '12ms',
    status: 'good',
    icon: 'el-icon-network'
  },
  {
    id: 5,
    name: '并发连接',
    current: '1,245',
    status: 'normal',
    icon: 'el-icon-connection'
  },
  {
    id: 6,
    name: '错误率',
    current: '0.02%',
    status: 'good',
    icon: 'el-icon-error'
  }
])

const alerts = ref([
  {
    id: 1,
    level: 'warning',
    title: '内存使用率偏高',
    description: '当前内存使用率达到68%，建议优化内存分配',
    time: '2分钟前'
  },
  {
    id: 2,
    level: 'info',
    title: '系统性能良好',
    description: 'CPU使用率保持在正常范围内',
    time: '5分钟前'
  },
  {
    id: 3,
    level: 'critical',
    title: '响应时间异常',
    description: '部分接口响应时间超过阈值',
    time: '8分钟前'
  }
])

// 图表引用
const performanceTrendChart = ref(null)
const systemLoadChart = ref(null)
const miniChartRefs = ref({})

// 方法
const setMiniChartRef = (el, id) => {
  if (el) {
    miniChartRefs.value[id] = el
  }
}

const getStatusText = (status) => {
  const statusMap = {
    good: '优秀',
    normal: '正常',
    warning: '警告',
    critical: '严重'
  }
  return statusMap[status] || '未知'
}

const getAlertIcon = (level) => {
  const iconMap = {
    info: 'el-icon-info',
    warning: 'el-icon-warning',
    critical: 'el-icon-error'
  }
  return iconMap[level] || 'el-icon-info'
}

const handleAlert = (alert) => {
  console.log('处理告警:', alert)
}

// 初始化性能趋势图表
const initPerformanceTrendChart = () => {
  const chart = echarts.init(performanceTrendChart.value)
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      axisLine: { lineStyle: { color: '#00e5ff' } },
      axisLabel: { color: '#ffffff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#00e5ff' } },
      axisLabel: { color: '#ffffff' },
      splitLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.2)' } }
    },
    series: [
      {
        name: '综合评分',
        type: 'line',
        data: [8.2, 8.5, 8.7, 8.9, 8.6, 8.7],
        itemStyle: { color: '#00e5ff' },
        lineStyle: { color: '#00e5ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 229, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 229, 255, 0.1)' }
            ]
          }
        }
      },
      {
        name: '运行效率',
        type: 'line',
        data: [90, 92, 94, 93, 92, 95],
        itemStyle: { color: '#0080ff' },
        lineStyle: { color: '#0080ff' }
      }
    ],
    legend: {
      textStyle: { color: '#ffffff' }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: '#00e5ff',
      textStyle: { color: '#ffffff' }
    }
  }
  chart.setOption(option)
}

// 初始化系统负载图表
const initSystemLoadChart = () => {
  const chart = echarts.init(systemLoadChart.value)
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['CPU', '内存', '磁盘', '网络'],
      axisLine: { lineStyle: { color: '#00e5ff' } },
      axisLabel: { color: '#ffffff' }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: '#00e5ff' } },
      axisLabel: { color: '#ffffff', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.2)' } }
    },
    series: [
      {
        name: '使用率',
        type: 'bar',
        data: [45, 68, 23, 35],
        itemStyle: {
          color: (params) => {
            const colors = ['#00e5ff', '#ff6b6b', '#4ecdc4', '#45b7d1']
            return colors[params.dataIndex]
          }
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: '#00e5ff',
      textStyle: { color: '#ffffff' },
      formatter: '{b}: {c}%'
    }
  }
  chart.setOption(option)
}

onMounted(() => {
  nextTick(() => {
    initPerformanceTrendChart()
    initSystemLoadChart()
  })
})
</script>

<style lang="scss" scoped>
.performance-analytics {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);

  .page-header {
    margin-bottom: 24px;
    
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 8px 0;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }
    
    .page-description {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;

    .overview-card {
      grid-column: 1 / -1;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .performance-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        
        .metric-item {
          text-align: center;
          
          .metric-value {
            font-size: 32px;
            font-weight: 700;
            color: #00e5ff;
            margin-bottom: 8px;
            text-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
          }
          
          .metric-label {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 4px;
          }
          
          .metric-trend {
            font-size: 14px;
            font-weight: 600;
            
            &.up {
              color: #52c41a;
            }
            
            &.down {
              color: #ff4d4f;
            }
          }
        }
      }
    }

    .chart-card {
      .chart-container {
        height: 300px;
      }
    }

    .metrics-detail-card {
      grid-column: 1 / -1;
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        
        .metric-card {
          display: flex;
          align-items: center;
          padding: 16px;
          background: rgba(0, 229, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 8px;
          
          .metric-icon {
            font-size: 24px;
            color: #00e5ff;
            margin-right: 16px;
          }
          
          .metric-info {
            flex: 1;
            
            .metric-name {
              color: #ffffff;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .metric-current {
              color: #00e5ff;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 4px;
            }
            
            .metric-status {
              font-size: 12px;
              padding: 2px 8px;
              border-radius: 4px;
              
              &.good {
                background: rgba(82, 196, 26, 0.2);
                color: #52c41a;
              }
              
              &.normal {
                background: rgba(0, 229, 255, 0.2);
                color: #00e5ff;
              }
              
              &.warning {
                background: rgba(255, 193, 7, 0.2);
                color: #ffc107;
              }
              
              &.critical {
                background: rgba(255, 77, 79, 0.2);
                color: #ff4d4f;
              }
            }
          }
          
          .metric-chart {
            width: 60px;
            height: 40px;
            
            .mini-chart {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }

    .alert-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        .alert-badge {
          color: #ff4d4f;
        }
      }
      
      .alert-list {
        .alert-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 12px;
          border-radius: 8px;
          border-left: 4px solid;
          
          &.info {
            background: rgba(24, 144, 255, 0.1);
            border-left-color: #1890ff;
          }
          
          &.warning {
            background: rgba(255, 193, 7, 0.1);
            border-left-color: #ffc107;
          }
          
          &.critical {
            background: rgba(255, 77, 79, 0.1);
            border-left-color: #ff4d4f;
          }
          
          .alert-icon {
            font-size: 20px;
            margin-right: 12px;
            
            .el-icon-info { color: #1890ff; }
            .el-icon-warning { color: #ffc107; }
            .el-icon-error { color: #ff4d4f; }
          }
          
          .alert-content {
            flex: 1;
            
            .alert-title {
              color: #ffffff;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .alert-description {
              color: rgba(255, 255, 255, 0.7);
              font-size: 14px;
              margin-bottom: 4px;
            }
            
            .alert-time {
              color: rgba(255, 255, 255, 0.5);
              font-size: 12px;
            }
          }
          
          .alert-actions {
            margin-left: 12px;
          }
        }
      }
    }
  }
}
</style>
