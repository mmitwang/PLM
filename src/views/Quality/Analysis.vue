<template>
  <div class="quality-analysis-container">
    <!-- 质量分析概览 -->
    <div class="analysis-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">质量趋势</div>
            <div class="card-value">{{ overviewData.qualityTrend }}%</div>
            <div class="card-change positive">+2.3%</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">缺陷率</div>
            <div class="card-value">{{ overviewData.defectRate }}%</div>
            <div class="card-change negative">-0.5%</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">过程能力</div>
            <div class="card-value">{{ overviewData.processCapability }}</div>
            <div class="card-change positive">+0.1</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">客户满意度</div>
            <div class="card-value">{{ overviewData.customerSatisfaction }}%</div>
            <div class="card-change positive">+1.2%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析工具栏 -->
    <div class="analysis-toolbar">
      <div class="toolbar-left">
        <el-select v-model="timeRange" placeholder="时间范围" style="width: 150px;">
          <el-option label="最近7天" value="7d" />
          <el-option label="最近30天" value="30d" />
          <el-option label="最近3个月" value="3m" />
          <el-option label="最近6个月" value="6m" />
          <el-option label="最近1年" value="1y" />
        </el-select>
        <el-select v-model="productFilter" placeholder="产品筛选" style="width: 200px;">
          <el-option label="全部产品" value="" />
          <el-option label="智能控制器 v2.0" value="智能控制器 v2.0" />
          <el-option label="传感器模块 A1" value="传感器模块 A1" />
          <el-option label="执行器单元 B3" value="执行器单元 B3" />
        </el-select>
        <el-select v-model="analysisType" placeholder="分析类型" style="width: 150px;">
          <el-option label="全部分析" value="" />
          <el-option label="趋势分析" value="trend" />
          <el-option label="对比分析" value="compare" />
          <el-option label="相关性分析" value="correlation" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="generateReport">
          <el-icon><Document /></el-icon>
          生成报告
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button @click="refreshAnalysis">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 分析图表区域 -->
    <div class="analysis-charts">
      <div class="chart-row">
        <div class="chart-item">
          <div class="chart-header">
            <h3>质量趋势分析</h3>
            <el-button-group size="small">
              <el-button :type="trendViewType === 'line' ? 'primary' : ''" @click="trendViewType = 'line'">线图</el-button>
              <el-button :type="trendViewType === 'bar' ? 'primary' : ''" @click="trendViewType = 'bar'">柱图</el-button>
            </el-button-group>
          </div>
          <div ref="trendChart" class="chart-container"></div>
        </div>
        <div class="chart-item">
          <div class="chart-header">
            <h3>缺陷分布分析</h3>
            <el-button-group size="small">
              <el-button :type="defectViewType === 'pie' ? 'primary' : ''" @click="defectViewType = 'pie'">饼图</el-button>
              <el-button :type="defectViewType === 'bar' ? 'primary' : ''" @click="defectViewType = 'bar'">柱图</el-button>
            </el-button-group>
          </div>
          <div ref="defectChart" class="chart-container"></div>
        </div>
      </div>
      
      <div class="chart-row">
        <div class="chart-item">
          <div class="chart-header">
            <h3>过程能力分析</h3>
            <el-dropdown @command="handleProcessCommand">
              <el-button size="small">
                分析选项<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="cpk">Cpk分析</el-dropdown-item>
                  <el-dropdown-item command="spc">SPC控制图</el-dropdown-item>
                  <el-dropdown-item command="histogram">直方图</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div ref="processChart" class="chart-container"></div>
        </div>
        <div class="chart-item">
          <div class="chart-header">
            <h3>质量成本分析</h3>
            <el-button-group size="small">
              <el-button :type="costViewType === 'stack' ? 'primary' : ''" @click="costViewType = 'stack'">堆叠图</el-button>
              <el-button :type="costViewType === 'line' ? 'primary' : ''" @click="costViewType = 'line'">趋势图</el-button>
            </el-button-group>
          </div>
          <div ref="costChart" class="chart-container"></div>
        </div>
      </div>
      
      <div class="chart-row">
        <div class="chart-item full-width">
          <div class="chart-header">
            <h3>质量相关性分析</h3>
            <div class="correlation-controls">
              <el-select v-model="correlationX" placeholder="X轴指标" size="small" style="width: 150px;">
                <el-option label="温度" value="temperature" />
                <el-option label="湿度" value="humidity" />
                <el-option label="压力" value="pressure" />
                <el-option label="速度" value="speed" />
              </el-select>
              <el-select v-model="correlationY" placeholder="Y轴指标" size="small" style="width: 150px;">
                <el-option label="缺陷率" value="defectRate" />
                <el-option label="合格率" value="passRate" />
                <el-option label="返工率" value="reworkRate" />
              </el-select>
              <el-button size="small" type="primary" @click="updateCorrelation">更新分析</el-button>
            </div>
          </div>
          <div ref="correlationChart" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 分析报告表格 -->
    <div class="analysis-table">
      <div class="table-header">
        <h3>详细分析数据</h3>
        <div class="table-controls">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索分析项..."
            prefix-icon="Search"
            style="width: 250px;"
            size="small"
          />
          <el-button size="small" @click="showAnalysisDialog = true">
            <el-icon><Plus /></el-icon>
            新增分析
          </el-button>
        </div>
      </div>
      
      <el-table :data="filteredAnalysisData" style="width: 100%">
        <el-table-column prop="analysisName" label="分析项目" width="200" />
        <el-table-column prop="product" label="产品" width="150" />
        <el-table-column prop="analysisType" label="分析类型" width="120">
          <template #default="scope">
            <el-tag :type="getAnalysisTypeTag(scope.row.analysisType)">
              {{ getAnalysisTypeText(scope.row.analysisType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timeRange" label="时间范围" width="120" />
        <el-table-column prop="sampleSize" label="样本量" width="100" />
        <el-table-column prop="result" label="分析结果" width="150">
          <template #default="scope">
            <span :class="getResultClass(scope.row.result)">{{ scope.row.result }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="scope">
            <el-progress :percentage="scope.row.confidence" :stroke-width="6" :show-text="false" />
            <span class="confidence-text">{{ scope.row.confidence }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="analyst" label="分析员" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewAnalysisDetail(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="editAnalysis(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteAnalysis(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增分析对话框 -->
    <el-dialog
      v-model="showAnalysisDialog"
      title="新增质量分析"
      width="800px"
      :before-close="handleAnalysisClose"
    >
      <el-form :model="newAnalysis" :rules="analysisRules" ref="analysisFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析名称" prop="analysisName">
              <el-input v-model="newAnalysis.analysisName" placeholder="请输入分析名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品" prop="product">
              <el-select v-model="newAnalysis.product" placeholder="选择产品" style="width: 100%;">
                <el-option label="智能控制器 v2.0" value="智能控制器 v2.0" />
                <el-option label="传感器模块 A1" value="传感器模块 A1" />
                <el-option label="执行器单元 B3" value="执行器单元 B3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析类型" prop="analysisType">
              <el-select v-model="newAnalysis.analysisType" placeholder="选择分析类型" style="width: 100%;">
                <el-option label="趋势分析" value="trend" />
                <el-option label="对比分析" value="compare" />
                <el-option label="相关性分析" value="correlation" />
                <el-option label="过程能力分析" value="capability" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间范围" prop="timeRange">
              <el-select v-model="newAnalysis.timeRange" placeholder="选择时间范围" style="width: 100%;">
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
                <el-option label="最近3个月" value="3m" />
                <el-option label="最近6个月" value="6m" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析员" prop="analyst">
              <el-select v-model="newAnalysis.analyst" placeholder="选择分析员" style="width: 100%;">
                <el-option label="张三" value="张三" />
                <el-option label="李四" value="李四" />
                <el-option label="王五" value="王五" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样本量" prop="sampleSize">
              <el-input-number v-model="newAnalysis.sampleSize" :min="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="分析描述" prop="description">
          <el-input
            v-model="newAnalysis.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分析描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAnalysisDialog = false">取消</el-button>
          <el-button type="primary" @click="createAnalysis">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  TrendCharts, DataAnalysis, PieChart, Monitor, Document, Download, 
  Refresh, ArrowDown, Search, Plus 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const timeRange = ref('30d')
const productFilter = ref('')
const analysisType = ref('')
const trendViewType = ref('line')
const defectViewType = ref('pie')
const costViewType = ref('stack')
const correlationX = ref('temperature')
const correlationY = ref('defectRate')
const searchKeyword = ref('')
const showAnalysisDialog = ref(false)
const analysisFormRef = ref(null)

// 概览数据
const overviewData = reactive({
  qualityTrend: 96.8,
  defectRate: 2.1,
  processCapability: 1.67,
  customerSatisfaction: 94.5
})

// 新分析表单
const newAnalysis = reactive({
  analysisName: '',
  product: '',
  analysisType: '',
  timeRange: '',
  analyst: '',
  sampleSize: 100,
  description: ''
})

// 表单验证规则
const analysisRules = {
  analysisName: [
    { required: true, message: '请输入分析名称', trigger: 'blur' }
  ],
  product: [
    { required: true, message: '请选择产品', trigger: 'change' }
  ],
  analysisType: [
    { required: true, message: '请选择分析类型', trigger: 'change' }
  ],
  timeRange: [
    { required: true, message: '请选择时间范围', trigger: 'change' }
  ],
  analyst: [
    { required: true, message: '请选择分析员', trigger: 'change' }
  ]
}

// 分析数据
const analysisData = ref([
  {
    id: 1,
    analysisName: '智能控制器质量趋势分析',
    product: '智能控制器 v2.0',
    analysisType: 'trend',
    timeRange: '30d',
    sampleSize: 500,
    result: '质量稳定上升',
    confidence: 95,
    analyst: '张三',
    createTime: '2024-01-15 10:30'
  },
  {
    id: 2,
    analysisName: '传感器缺陷相关性分析',
    product: '传感器模块 A1',
    analysisType: 'correlation',
    timeRange: '3m',
    sampleSize: 800,
    result: '温度与缺陷率强相关',
    confidence: 88,
    analyst: '李四',
    createTime: '2024-01-14 14:20'
  },
  {
    id: 3,
    analysisName: '执行器过程能力分析',
    product: '执行器单元 B3',
    analysisType: 'capability',
    timeRange: '6m',
    sampleSize: 1200,
    result: 'Cpk=1.45，过程能力良好',
    confidence: 92,
    analyst: '王五',
    createTime: '2024-01-13 09:15'
  }
])

// 计算属性
const filteredAnalysisData = computed(() => {
  return analysisData.value.filter(item => {
    const matchesSearch = !searchKeyword.value || 
      item.analysisName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.product.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchesProduct = !productFilter.value || item.product === productFilter.value
    const matchesType = !analysisType.value || item.analysisType === analysisType.value
    
    return matchesSearch && matchesProduct && matchesType
  })
})

// 方法
const getAnalysisTypeTag = (type) => {
  const tags = {
    trend: 'primary',
    compare: 'success',
    correlation: 'warning',
    capability: 'info'
  }
  return tags[type] || ''
}

const getAnalysisTypeText = (type) => {
  const texts = {
    trend: '趋势分析',
    compare: '对比分析',
    correlation: '相关性分析',
    capability: '过程能力分析'
  }
  return texts[type] || type
}

const getResultClass = (result) => {
  if (result.includes('上升') || result.includes('良好') || result.includes('稳定')) {
    return 'result-positive'
  } else if (result.includes('下降') || result.includes('异常')) {
    return 'result-negative'
  }
  return 'result-neutral'
}

const handleProcessCommand = (command) => {
  ElMessage.info(`执行${command}分析`)
  // 根据命令更新过程分析图表
  nextTick(() => {
    initProcessChart(command)
  })
}

const updateCorrelation = () => {
  nextTick(() => {
    initCorrelationChart()
  })
}

const generateReport = () => {
  ElMessage.success('正在生成质量分析报告...')
}

const exportData = () => {
  ElMessage.success('正在导出分析数据...')
}

const refreshAnalysis = () => {
  ElMessage.success('分析数据已刷新')
  // 重新初始化所有图表
  nextTick(() => {
    initAllCharts()
  })
}

const viewAnalysisDetail = (analysis) => {
  ElMessage.info(`查看分析详情：${analysis.analysisName}`)
}

const editAnalysis = (analysis) => {
  ElMessage.info(`编辑分析：${analysis.analysisName}`)
}

const deleteAnalysis = (analysis) => {
  ElMessageBox.confirm(
    `确定要删除分析"${analysis.analysisName}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = analysisData.value.findIndex(item => item.id === analysis.id)
    if (index > -1) {
      analysisData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const createAnalysis = () => {
  analysisFormRef.value.validate((valid) => {
    if (valid) {
      const analysis = {
        id: Date.now(),
        ...newAnalysis,
        result: '分析中...',
        confidence: 0,
        createTime: new Date().toLocaleString()
      }
      analysisData.value.unshift(analysis)
      showAnalysisDialog.value = false
      resetNewAnalysis()
      ElMessage.success('分析创建成功')
    }
  })
}

const resetNewAnalysis = () => {
  Object.assign(newAnalysis, {
    analysisName: '',
    product: '',
    analysisType: '',
    timeRange: '',
    analyst: '',
    sampleSize: 100,
    description: ''
  })
}

const handleAnalysisClose = () => {
  resetNewAnalysis()
  showAnalysisDialog.value = false
}

// 图表引用
const trendChart = ref(null)
const defectChart = ref(null)
const processChart = ref(null)
const costChart = ref(null)
const correlationChart = ref(null)

// 图表初始化方法
const initTrendChart = () => {
  if (!trendChart.value) return
  
  const chart = echarts.init(trendChart.value)
  const option = {
    title: {
      text: '质量趋势分析',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['合格率', '缺陷率', '返工率'],
      textStyle: { color: '#00e5ff' }
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    series: [
      {
        name: '合格率',
        type: trendViewType.value,
        data: [95, 97, 94, 96, 98, 95],
        itemStyle: { color: '#52c41a' },
        lineStyle: { color: '#52c41a' }
      },
      {
        name: '缺陷率',
        type: trendViewType.value,
        data: [3.2, 2.1, 4.1, 2.8, 1.5, 3.0],
        itemStyle: { color: '#ff4d4f' },
        lineStyle: { color: '#ff4d4f' }
      },
      {
        name: '返工率',
        type: trendViewType.value,
        data: [1.8, 0.9, 1.9, 1.2, 0.5, 2.0],
        itemStyle: { color: '#faad14' },
        lineStyle: { color: '#faad14' }
      }
    ]
  }
  chart.setOption(option)
}

const initDefectChart = () => {
  if (!defectChart.value) return
  
  const chart = echarts.init(defectChart.value)
  
  if (defectViewType.value === 'pie') {
    const option = {
      title: {
        text: '缺陷分布分析',
        textStyle: { color: '#00e5ff' }
      },
      tooltip: {
        trigger: 'item'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 35, name: '外观缺陷' },
          { value: 25, name: '尺寸偏差' },
          { value: 20, name: '性能缺陷' },
          { value: 15, name: '功能异常' },
          { value: 5, name: '其他' }
        ],
        itemStyle: {
          color: (params) => {
            const colors = ['#ff4d4f', '#faad14', '#52c41a', '#1890ff', '#722ed1']
            return colors[params.dataIndex]
          }
        }
      }]
    }
    chart.setOption(option)
  } else {
    const option = {
      title: {
        text: '缺陷分布分析',
        textStyle: { color: '#00e5ff' }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['外观缺陷', '尺寸偏差', '性能缺陷', '功能异常', '其他'],
        axisLine: { lineStyle: { color: '#0080ff' } },
        axisLabel: { color: '#00e5ff' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#0080ff' } },
        axisLabel: { color: '#00e5ff' }
      },
      series: [{
        name: '缺陷数量',
        type: 'bar',
        data: [35, 25, 20, 15, 5],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00e5ff' },
            { offset: 1, color: '#0080ff' }
          ])
        }
      }]
    }
    chart.setOption(option)
  }
}

const initProcessChart = (type = 'cpk') => {
  if (!processChart.value) return
  
  const chart = echarts.init(processChart.value)
  
  if (type === 'cpk') {
    const option = {
      title: {
        text: '过程能力分析 (Cpk)',
        textStyle: { color: '#00e5ff' }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['产品A', '产品B', '产品C', '产品D', '产品E'],
        axisLine: { lineStyle: { color: '#0080ff' } },
        axisLabel: { color: '#00e5ff' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 2,
        axisLine: { lineStyle: { color: '#0080ff' } },
        axisLabel: { color: '#00e5ff' }
      },
      series: [{
        name: 'Cpk值',
        type: 'bar',
        data: [1.67, 1.45, 1.89, 1.23, 1.56],
        itemStyle: {
          color: (params) => {
            const value = params.value
            if (value >= 1.67) return '#52c41a'
            if (value >= 1.33) return '#faad14'
            return '#ff4d4f'
          }
        },
        markLine: {
          data: [
            { yAxis: 1.33, name: '最低要求', lineStyle: { color: '#faad14' } },
            { yAxis: 1.67, name: '优秀水平', lineStyle: { color: '#52c41a' } }
          ]
        }
      }]
    }
    chart.setOption(option)
  }
}

const initCostChart = () => {
  if (!costChart.value) return
  
  const chart = echarts.init(costChart.value)
  
  if (costViewType.value === 'stack') {
    const option = {
      title: {
        text: '质量成本分析',
        textStyle: { color: '#00e5ff' }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['预防成本', '评价成本', '内部失效成本', '外部失效成本'],
        textStyle: { color: '#00e5ff' }
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        axisLine: { lineStyle: { color: '#0080ff' } },
        axisLabel: { color: '#00e5ff' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#0080ff' } },
        axisLabel: { color: '#00e5ff' }
      },
      series: [
        {
          name: '预防成本',
          type: 'bar',
          stack: 'total',
          data: [20, 25, 18, 22, 28, 24],
          itemStyle: { color: '#52c41a' }
        },
        {
          name: '评价成本',
          type: 'bar',
          stack: 'total',
          data: [15, 18, 12, 16, 20, 17],
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '内部失效成本',
          type: 'bar',
          stack: 'total',
          data: [8, 12, 15, 10, 6, 9],
          itemStyle: { color: '#faad14' }
        },
        {
          name: '外部失效成本',
          type: 'bar',
          stack: 'total',
          data: [5, 8, 12, 7, 3, 6],
          itemStyle: { color: '#ff4d4f' }
        }
      ]
    }
    chart.setOption(option)
  } else {
    const option = {
      title: {
        text: '质量成本趋势',
        textStyle: { color: '#00e5ff' }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['总成本', '预防成本', '失效成本'],
        textStyle: { color: '#00e5ff' }
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        axisLine: { lineStyle: { color: '#0080ff' } },
        axisLabel: { color: '#00e5ff' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#0080ff' } },
        axisLabel: { color: '#00e5ff' }
      },
      series: [
        {
          name: '总成本',
          type: 'line',
          data: [48, 63, 57, 55, 57, 56],
          itemStyle: { color: '#722ed1' },
          lineStyle: { color: '#722ed1' }
        },
        {
          name: '预防成本',
          type: 'line',
          data: [35, 43, 30, 38, 48, 41],
          itemStyle: { color: '#52c41a' },
          lineStyle: { color: '#52c41a' }
        },
        {
          name: '失效成本',
          type: 'line',
          data: [13, 20, 27, 17, 9, 15],
          itemStyle: { color: '#ff4d4f' },
          lineStyle: { color: '#ff4d4f' }
        }
      ]
    }
    chart.setOption(option)
  }
}

const initCorrelationChart = () => {
  if (!correlationChart.value) return
  
  const chart = echarts.init(correlationChart.value)
  
  // 生成相关性散点数据
  const generateCorrelationData = () => {
    const data = []
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 100
      const y = x * 0.8 + Math.random() * 20 // 模拟相关性
      data.push([x, y])
    }
    return data
  }
  
  const option = {
    title: {
      text: `${correlationX.value} vs ${correlationY.value} 相关性分析`,
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${correlationX.value}: ${params.value[0].toFixed(2)}<br/>${correlationY.value}: ${params.value[1].toFixed(2)}`
      }
    },
    xAxis: {
      type: 'value',
      name: correlationX.value,
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' },
      nameTextStyle: { color: '#00e5ff' }
    },
    yAxis: {
      type: 'value',
      name: correlationY.value,
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' },
      nameTextStyle: { color: '#00e5ff' }
    },
    series: [{
      type: 'scatter',
      data: generateCorrelationData(),
      itemStyle: {
        color: '#00e5ff',
        opacity: 0.7
      },
      symbolSize: 8
    }]
  }
  chart.setOption(option)
}

const initAllCharts = () => {
  initTrendChart()
  initDefectChart()
  initProcessChart()
  initCostChart()
  initCorrelationChart()
}

// 监听视图类型变化
watch(trendViewType, () => {
  nextTick(() => {
    initTrendChart()
  })
})

watch(defectViewType, () => {
  nextTick(() => {
    initDefectChart()
  })
})

watch(costViewType, () => {
  nextTick(() => {
    initCostChart()
  })
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    initAllCharts()
  })
})
</script>

<style lang="scss" scoped>
.quality-analysis-container {
  padding: 20px;
  background: linear-gradient(135deg, var(--hologram-bg-start) 0%, var(--hologram-bg-end) 100%);
  min-height: 100vh;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(0, 229, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 128, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(0, 229, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }

  .analysis-overview {
    margin-bottom: 24px;
    position: relative;
    z-index: 1;

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;

      .overview-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1), transparent);
          transition: left 1s ease;
        }

        &:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 229, 255, 0.6);
          box-shadow: 0 8px 32px rgba(0, 229, 255, 0.2);

          &::before {
            left: 100%;
          }
        }

        .card-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #00e5ff, #0080ff);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }

        .card-content {
          flex: 1;

          .card-title {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 8px;
          }

          .card-value {
            font-size: 28px;
            font-weight: bold;
            color: #00e5ff;
            text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
            margin-bottom: 4px;
          }

          .card-change {
            font-size: 12px;
            font-weight: 500;

            &.positive {
              color: #52c41a;
            }

            &.negative {
              color: #ff4d4f;
            }
          }
        }
      }
    }
  }

  .analysis-toolbar {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 12px;
    padding: 16px 24px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;

    .toolbar-left {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  .analysis-charts {
    margin-bottom: 24px;
    position: relative;
    z-index: 1;

    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .chart-item {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 12px;
        padding: 20px;

        &.full-width {
          grid-column: 1 / -1;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h3 {
            color: #00e5ff;
            font-size: 16px;
            font-weight: 600;
            margin: 0;
          }

          .correlation-controls {
            display: flex;
            gap: 12px;
            align-items: center;
          }
        }

        .chart-container {
          width: 100%;
          height: 350px;
        }
      }
    }
  }

  .analysis-table {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 12px;
    padding: 24px;
    position: relative;
    z-index: 1;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        color: #00e5ff;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }

      .table-controls {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    :deep(.el-table) {
      background: transparent;
      color: rgba(255, 255, 255, 0.9);

      .el-table__header {
        background: rgba(0, 229, 255, 0.1);
      }

      th {
        background: rgba(0, 229, 255, 0.1);
        border-bottom: 1px solid rgba(0, 229, 255, 0.3);
        color: #00e5ff;
      }

      td {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .el-table__row {
        &:hover {
          background: rgba(0, 229, 255, 0.05);
        }
      }
    }

    .result-positive {
      color: #52c41a;
      font-weight: 500;
    }

    .result-negative {
      color: #ff4d4f;
      font-weight: 500;
    }

    .result-neutral {
      color: rgba(255, 255, 255, 0.8);
    }

    .confidence-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      margin-left: 8px;
    }
  }

  :deep(.el-dialog) {
    background: rgba(10, 25, 41, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 229, 255, 0.3);

    .el-dialog__header {
      border-bottom: 1px solid rgba(0, 229, 255, 0.3);
      padding: 20px 24px 16px;

      .el-dialog__title {
        color: #00e5ff;
        font-weight: 600;
      }

      .el-dialog__headerbtn {
        .el-dialog__close {
          color: rgba(255, 255, 255, 0.7);

          &:hover {
            color: #00e5ff;
          }
        }
      }
    }

    .el-dialog__body {
      padding: 24px;
      color: rgba(255, 255, 255, 0.9);
    }

    .el-dialog__footer {
      border-top: 1px solid rgba(0, 229, 255, 0.3);
      padding: 16px 24px 20px;
    }
  }

  :deep(.el-form) {
    .el-form-item__label {
      color: rgba(255, 255, 255, 0.8);
    }

    .el-input__wrapper {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.3);
      box-shadow: none;

      &:hover {
        border-color: rgba(0, 229, 255, 0.5);
      }

      &.is-focus {
        border-color: #00e5ff;
        box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.2);
      }

      .el-input__inner {
        color: rgba(255, 255, 255, 0.9);

        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }

    .el-select {
      .el-input__wrapper {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 229, 255, 0.3);
      }
    }

    .el-textarea__inner {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: rgba(255, 255, 255, 0.9);

      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }

      &:hover {
        border-color: rgba(0, 229, 255, 0.5);
      }

      &:focus {
        border-color: #00e5ff;
        box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.2);
      }
    }

    .el-input-number {
      .el-input__wrapper {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 229, 255, 0.3);
      }
    }
  }

  :deep(.el-button) {
    border: 1px solid rgba(0, 229, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      border-color: rgba(0, 229, 255, 0.6);
      background: rgba(0, 229, 255, 0.1);
      color: #00e5ff;
    }

    &.el-button--primary {
      background: linear-gradient(135deg, #00e5ff, #0080ff);
      border-color: #00e5ff;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #33ebff, #3399ff);
        border-color: #33ebff;
      }
    }

    &.el-button--danger {
      background: linear-gradient(135deg, #ff4d4f, #cf1322);
      border-color: #ff4d4f;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #ff7875, #ff4d4f);
        border-color: #ff7875;
      }
    }

    &.el-button--small {
      padding: 5px 11px;
      font-size: 12px;
    }
  }

  :deep(.el-button-group) {
    .el-button {
      &:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:last-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      &:not(:first-child):not(:last-child) {
        border-radius: 0;
      }
    }
  }

  :deep(.el-tag) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);

    &.el-tag--primary {
      background: rgba(24, 144, 255, 0.2);
      border-color: rgba(24, 144, 255, 0.4);
      color: #1890ff;
    }

    &.el-tag--success {
      background: rgba(82, 196, 26, 0.2);
      border-color: rgba(82, 196, 26, 0.4);
      color: #52c41a;
    }

    &.el-tag--warning {
      background: rgba(250, 173, 20, 0.2);
      border-color: rgba(250, 173, 20, 0.4);
      color: #faad14;
    }

    &.el-tag--info {
      background: rgba(0, 229, 255, 0.2);
      border-color: rgba(0, 229, 255, 0.4);
      color: #00e5ff;
    }
  }

  :deep(.el-progress) {
    .el-progress-bar__outer {
      background: rgba(255, 255, 255, 0.1);
    }

    .el-progress-bar__inner {
      background: linear-gradient(90deg, #00e5ff, #0080ff);
    }
  }

  :deep(.el-dropdown) {
    .el-dropdown__caret-button {
      border-left: 1px solid rgba(0, 229, 255, 0.3);
    }
  }
}
</style>
