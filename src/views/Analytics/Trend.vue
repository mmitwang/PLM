<template>
  <div class="trend-analytics">
    <div class="page-header">
      <h1 class="page-title">趋势分析</h1>
      <p class="page-description">产品生命周期趋势预测与分析</p>
    </div>

    <div class="analytics-grid">
      <!-- 趋势概览 -->
      <div class="holographic-card overview-card">
        <div class="card-header">
          <h3>趋势概览</h3>
          <div class="time-selector">
            <el-select v-model="timeRange" size="small">
              <el-option label="近7天" value="7days" />
              <el-option label="近30天" value="30days" />
              <el-option label="近90天" value="90days" />
              <el-option label="近1年" value="1year" />
            </el-select>
          </div>
        </div>
        <div class="trend-metrics">
          <div class="metric-item">
            <div class="metric-value">{{ growthRate }}%</div>
            <div class="metric-label">增长率</div>
            <div class="metric-trend up">+{{ growthRate }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ predictedValue }}</div>
            <div class="metric-label">预测值</div>
            <div class="metric-trend up">+15.2%</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ volatility }}%</div>
            <div class="metric-label">波动率</div>
            <div class="metric-trend down">-2.1%</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ confidence }}%</div>
            <div class="metric-label">置信度</div>
            <div class="metric-trend up">+3.5%</div>
          </div>
        </div>
      </div>

      <!-- 主趋势图表 -->
      <div class="holographic-card chart-card main-trend">
        <div class="card-header">
          <h3>主要趋势</h3>
          <div class="chart-controls">
            <el-button-group size="small">
              <el-button :type="chartType === 'line' ? 'primary' : ''" @click="chartType = 'line'">
                线性图
              </el-button>
              <el-button :type="chartType === 'area' ? 'primary' : ''" @click="chartType = 'area'">
                面积图
              </el-button>
              <el-button :type="chartType === 'bar' ? 'primary' : ''" @click="chartType = 'bar'">
                柱状图
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div ref="mainTrendChart" class="chart-container large"></div>
      </div>

      <!-- 预测模型 -->
      <div class="holographic-card chart-card">
        <div class="card-header">
          <h3>预测模型</h3>
        </div>
        <div ref="predictionChart" class="chart-container"></div>
      </div>

      <!-- 季节性分析 -->
      <div class="holographic-card chart-card">
        <div class="card-header">
          <h3>季节性分析</h3>
        </div>
        <div ref="seasonalChart" class="chart-container"></div>
      </div>

      <!-- 趋势指标 -->
      <div class="holographic-card indicators-card">
        <div class="card-header">
          <h3>趋势指标</h3>
        </div>
        <div class="indicators-grid">
          <div class="indicator-item" v-for="indicator in trendIndicators" :key="indicator.id">
            <div class="indicator-header">
              <div class="indicator-name">{{ indicator.name }}</div>
              <div class="indicator-value" :class="indicator.trend">
                {{ indicator.value }}
              </div>
            </div>
            <div class="indicator-chart">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: indicator.progress + '%' }"></div>
              </div>
            </div>
            <div class="indicator-description">{{ indicator.description }}</div>
          </div>
        </div>
      </div>

      <!-- 异常检测 -->
      <div class="holographic-card anomaly-card">
        <div class="card-header">
          <h3>异常检测</h3>
          <el-badge :value="anomalyCount" class="anomaly-badge">
            <i class="el-icon-warning-outline"></i>
          </el-badge>
        </div>
        <div class="anomaly-list">
          <div class="anomaly-item" v-for="anomaly in anomalies" :key="anomaly.id" :class="anomaly.severity">
            <div class="anomaly-time">{{ anomaly.time }}</div>
            <div class="anomaly-content">
              <div class="anomaly-title">{{ anomaly.title }}</div>
              <div class="anomaly-description">{{ anomaly.description }}</div>
            </div>
            <div class="anomaly-impact">
              <div class="impact-label">影响度</div>
              <div class="impact-value">{{ anomaly.impact }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const timeRange = ref('30days')
const chartType = ref('line')
const growthRate = ref(12.5)
const predictedValue = ref(8750)
const volatility = ref(8.3)
const confidence = ref(92.8)
const anomalyCount = ref(2)

const trendIndicators = ref([
  {
    id: 1,
    name: '上升趋势强度',
    value: '强',
    progress: 85,
    trend: 'positive',
    description: '当前呈现强劲上升趋势'
  },
  {
    id: 2,
    name: '市场饱和度',
    value: '中等',
    progress: 60,
    trend: 'neutral',
    description: '市场仍有增长空间'
  },
  {
    id: 3,
    name: '竞争激烈程度',
    value: '高',
    progress: 75,
    trend: 'negative',
    description: '竞争环境较为激烈'
  },
  {
    id: 4,
    name: '技术成熟度',
    value: '成熟',
    progress: 90,
    trend: 'positive',
    description: '技术已达到成熟阶段'
  }
])

const anomalies = ref([
  {
    id: 1,
    time: '2024-01-15',
    title: '异常峰值',
    description: '数据出现异常高峰，可能受外部因素影响',
    impact: '中等',
    severity: 'warning'
  },
  {
    id: 2,
    time: '2024-01-10',
    title: '趋势偏离',
    description: '实际数据偏离预测趋势线',
    impact: '低',
    severity: 'info'
  }
])

// 图表引用
const mainTrendChart = ref(null)
const predictionChart = ref(null)
const seasonalChart = ref(null)

// 方法
const initMainTrendChart = () => {
  const chart = echarts.init(mainTrendChart.value)
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
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
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
        name: '实际值',
        type: chartType.value,
        data: [820, 932, 901, 934, 1290, 1330, 1320, 1450, 1380, 1520, 1600, 1680],
        itemStyle: { color: '#00e5ff' },
        lineStyle: { color: '#00e5ff', width: 3 },
        areaStyle: chartType.value === 'area' ? {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 229, 255, 0.4)' },
              { offset: 1, color: 'rgba(0, 229, 255, 0.1)' }
            ]
          }
        } : undefined
      },
      {
        name: '预测值',
        type: 'line',
        data: [null, null, null, null, null, null, null, null, null, 1500, 1580, 1650, 1720, 1800],
        itemStyle: { color: '#0080ff' },
        lineStyle: { color: '#0080ff', type: 'dashed', width: 2 }
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

const initPredictionChart = () => {
  const chart = echarts.init(predictionChart.value)
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
      data: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1+1', 'Q2+1'],
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
        name: '置信区间上限',
        type: 'line',
        data: [3200, 3500, 3800, 4200, 4600, 5000],
        itemStyle: { color: 'rgba(0, 229, 255, 0.3)' },
        lineStyle: { color: 'rgba(0, 229, 255, 0.3)' },
        symbol: 'none'
      },
      {
        name: '预测值',
        type: 'line',
        data: [3000, 3200, 3400, 3800, 4100, 4400],
        itemStyle: { color: '#00e5ff' },
        lineStyle: { color: '#00e5ff', width: 3 }
      },
      {
        name: '置信区间下限',
        type: 'line',
        data: [2800, 2900, 3000, 3400, 3600, 3800],
        itemStyle: { color: 'rgba(0, 229, 255, 0.3)' },
        lineStyle: { color: 'rgba(0, 229, 255, 0.3)' },
        symbol: 'none',
        areaStyle: {
          color: 'rgba(0, 229, 255, 0.1)'
        },
        stack: 'confidence'
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

const initSeasonalChart = () => {
  const chart = echarts.init(seasonalChart.value)
  const option = {
    backgroundColor: 'transparent',
    polar: {
      radius: [20, '80%']
    },
    angleAxis: {
      type: 'category',
      data: ['春季', '夏季', '秋季', '冬季'],
      startAngle: 90,
      axisLabel: { color: '#ffffff' }
    },
    radiusAxis: {
      type: 'value',
      axisLabel: { color: '#ffffff' },
      splitLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.2)' } }
    },
    series: [
      {
        name: '季节性指数',
        type: 'bar',
        data: [1.2, 0.8, 1.1, 0.9],
        coordinateSystem: 'polar',
        itemStyle: {
          color: (params) => {
            const colors = ['#00e5ff', '#0080ff', '#40a9ff', '#69c0ff']
            return colors[params.dataIndex]
          }
        }
      }
    ],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: '#00e5ff',
      textStyle: { color: '#ffffff' }
    }
  }
  chart.setOption(option)
}

// 监听图表类型变化
watch(chartType, () => {
  initMainTrendChart()
})

onMounted(() => {
  nextTick(() => {
    initMainTrendChart()
    initPredictionChart()
    initSeasonalChart()
  })
})
</script>

<style lang="scss" scoped>
.trend-analytics {
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
      
      .trend-metrics {
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

    .main-trend {
      grid-column: 1 / -1;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .chart-container.large {
        height: 400px;
      }
    }

    .chart-card {
      .chart-container {
        height: 300px;
      }
    }

    .indicators-card {
      .indicators-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        
        .indicator-item {
          padding: 16px;
          background: rgba(0, 229, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 8px;
          
          .indicator-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            
            .indicator-name {
              color: #ffffff;
              font-weight: 500;
            }
            
            .indicator-value {
              font-weight: 600;
              
              &.positive {
                color: #52c41a;
              }
              
              &.neutral {
                color: #00e5ff;
              }
              
              &.negative {
                color: #ff4d4f;
              }
            }
          }
          
          .indicator-chart {
            margin-bottom: 8px;
            
            .progress-bar {
              height: 4px;
              background: rgba(0, 229, 255, 0.2);
              border-radius: 2px;
              overflow: hidden;
              
              .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00e5ff, #0080ff);
                transition: width 0.3s ease;
              }
            }
          }
          
          .indicator-description {
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
          }
        }
      }
    }

    .anomaly-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        .anomaly-badge {
          color: #ffc107;
        }
      }
      
      .anomaly-list {
        .anomaly-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 12px;
          border-radius: 8px;
          border-left: 4px solid;
          
          &.warning {
            background: rgba(255, 193, 7, 0.1);
            border-left-color: #ffc107;
          }
          
          &.info {
            background: rgba(24, 144, 255, 0.1);
            border-left-color: #1890ff;
          }
          
          .anomaly-time {
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
            min-width: 80px;
            margin-right: 12px;
          }
          
          .anomaly-content {
            flex: 1;
            
            .anomaly-title {
              color: #ffffff;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .anomaly-description {
              color: rgba(255, 255, 255, 0.7);
              font-size: 14px;
            }
          }
          
          .anomaly-impact {
            text-align: center;
            margin-left: 12px;
            
            .impact-label {
              color: rgba(255, 255, 255, 0.5);
              font-size: 12px;
              margin-bottom: 4px;
            }
            
            .impact-value {
              color: #00e5ff;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}
</style>
