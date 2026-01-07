<template>
  <div class="cost-analytics">
    <div class="page-header">
      <h1 class="page-title">成本分析</h1>
      <p class="page-description">产品生命周期成本分析与优化</p>
    </div>

    <div class="analytics-grid">
      <!-- 成本概览卡片 -->
      <div class="holographic-card overview-card">
        <div class="card-header">
          <h3>成本概览</h3>
          <div class="time-selector">
            <el-select v-model="timeRange" size="small">
              <el-option label="本月" value="month" />
              <el-option label="本季度" value="quarter" />
              <el-option label="本年" value="year" />
            </el-select>
          </div>
        </div>
        <div class="cost-metrics">
          <div class="metric-item">
            <div class="metric-value">¥{{ formatNumber(totalCost) }}</div>
            <div class="metric-label">总成本</div>
            <div class="metric-trend up">+12.5%</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">¥{{ formatNumber(avgCost) }}</div>
            <div class="metric-label">平均成本</div>
            <div class="metric-trend down">-3.2%</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ costEfficiency }}%</div>
            <div class="metric-label">成本效率</div>
            <div class="metric-trend up">+5.8%</div>
          </div>
        </div>
      </div>

      <!-- 成本趋势图表 -->
      <div class="holographic-card chart-card">
        <div class="card-header">
          <h3>成本趋势</h3>
        </div>
        <div ref="costTrendChart" class="chart-container"></div>
      </div>

      <!-- 成本分布图表 -->
      <div class="holographic-card chart-card">
        <div class="card-header">
          <h3>成本分布</h3>
        </div>
        <div ref="costDistributionChart" class="chart-container"></div>
      </div>

      <!-- 成本明细表格 -->
      <div class="holographic-card table-card">
        <div class="card-header">
          <h3>成本明细</h3>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="exportData">
              <i class="el-icon-download"></i>
              导出数据
            </el-button>
          </div>
        </div>
        <el-table :data="costDetails" class="holographic-table">
          <el-table-column prop="productName" label="产品名称" />
          <el-table-column prop="category" label="类别" />
          <el-table-column prop="developmentCost" label="开发成本" :formatter="formatCurrency" />
          <el-table-column prop="productionCost" label="生产成本" :formatter="formatCurrency" />
          <el-table-column prop="maintenanceCost" label="维护成本" :formatter="formatCurrency" />
          <el-table-column prop="totalCost" label="总成本" :formatter="formatCurrency" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="viewDetails(row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const timeRange = ref('month')
const totalCost = ref(2580000)
const avgCost = ref(86000)
const costEfficiency = ref(87.5)

const costDetails = ref([
  {
    id: 1,
    productName: '智能控制器 V2.0',
    category: '电子产品',
    developmentCost: 150000,
    productionCost: 80000,
    maintenanceCost: 20000,
    totalCost: 250000
  },
  {
    id: 2,
    productName: '工业传感器 Pro',
    category: '传感设备',
    developmentCost: 120000,
    productionCost: 60000,
    maintenanceCost: 15000,
    totalCost: 195000
  },
  {
    id: 3,
    productName: '自动化模块 X1',
    category: '自动化设备',
    developmentCost: 200000,
    productionCost: 100000,
    maintenanceCost: 30000,
    totalCost: 330000
  }
])

// 图表引用
const costTrendChart = ref(null)
const costDistributionChart = ref(null)

// 方法
const formatNumber = (num) => {
  return num.toLocaleString()
}

const formatCurrency = (row, column, cellValue) => {
  return `¥${cellValue.toLocaleString()}`
}

const exportData = () => {
  // 导出数据逻辑
  console.log('导出成本数据')
}

const viewDetails = (row) => {
  // 查看详情逻辑
  console.log('查看成本详情:', row)
}

// 初始化成本趋势图表
const initCostTrendChart = () => {
  const chart = echarts.init(costTrendChart.value)
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
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
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
        name: '开发成本',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230],
        itemStyle: { color: '#00e5ff' },
        lineStyle: { color: '#00e5ff' }
      },
      {
        name: '生产成本',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330],
        itemStyle: { color: '#0080ff' },
        lineStyle: { color: '#0080ff' }
      },
      {
        name: '维护成本',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330],
        itemStyle: { color: '#40a9ff' },
        lineStyle: { color: '#40a9ff' }
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

// 初始化成本分布图表
const initCostDistributionChart = () => {
  const chart = echarts.init(costDistributionChart.value)
  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        name: '成本分布',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 1048, name: '开发成本', itemStyle: { color: '#00e5ff' } },
          { value: 735, name: '生产成本', itemStyle: { color: '#0080ff' } },
          { value: 580, name: '维护成本', itemStyle: { color: '#40a9ff' } },
          { value: 484, name: '营销成本', itemStyle: { color: '#69c0ff' } },
          { value: 300, name: '其他成本', itemStyle: { color: '#91d5ff' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 229, 255, 0.5)'
          }
        },
        label: {
          color: '#ffffff'
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

onMounted(() => {
  nextTick(() => {
    initCostTrendChart()
    initCostDistributionChart()
  })
})
</script>

<style lang="scss" scoped>
.cost-analytics {
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
      
      .cost-metrics {
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

    .table-card {
      grid-column: 1 / -1;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
    }
  }
}
</style>
