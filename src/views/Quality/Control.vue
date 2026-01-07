<template>
  <div class="quality-control-container">
    <!-- 质量控制概览 -->
    <div class="control-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">总控制点</div>
            <div class="card-value">{{ overviewData.totalPoints }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">合格率</div>
            <div class="card-value">{{ overviewData.passRate }}%</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">异常项</div>
            <div class="card-value">{{ overviewData.exceptions }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">改进项</div>
            <div class="card-value">{{ overviewData.improvements }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 质量控制工具栏 -->
    <div class="control-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索控制点..."
          prefix-icon="Search"
          style="width: 300px;"
          @input="handleSearch"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px;">
          <el-option label="全部" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="警告" value="warning" />
          <el-option label="异常" value="exception" />
        </el-select>
        <el-select v-model="typeFilter" placeholder="类型筛选" style="width: 150px;">
          <el-option label="全部" value="" />
          <el-option label="进料检验" value="incoming" />
          <el-option label="过程控制" value="process" />
          <el-option label="成品检验" value="final" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增控制点
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 质量控制视图 -->
    <div class="control-tabs">
      <el-tabs v-model="activeView" @tab-click="handleViewChange">
        <el-tab-pane label="控制点列表" name="list">
          <div class="control-list">
            <el-table :data="filteredControlPoints" style="width: 100%">
              <el-table-column prop="name" label="控制点名称" width="200" />
              <el-table-column prop="type" label="类型" width="120">
                <template #default="scope">
                  <el-tag :type="getTypeTagType(scope.row.type)">
                    {{ getTypeText(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="product" label="产品" width="150" />
              <el-table-column prop="standard" label="标准值" width="120" />
              <el-table-column prop="actualValue" label="实际值" width="120" />
              <el-table-column prop="deviation" label="偏差" width="100">
                <template #default="scope">
                  <span :class="getDeviationClass(scope.row.deviation)">
                    {{ scope.row.deviation }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastCheck" label="最后检查" width="150" />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="viewControlDetail(scope.row)">详情</el-button>
                  <el-button size="small" type="primary" @click="editControl(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteControl(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="实时监控" name="monitor">
          <div class="monitor-view">
            <div class="monitor-grid">
              <div class="monitor-chart">
                <div ref="trendChart" class="chart-container"></div>
              </div>
              <div class="monitor-chart">
                <div ref="distributionChart" class="chart-container"></div>
              </div>
            </div>
            <div class="monitor-alerts">
              <h3>实时告警</h3>
              <div class="alert-list">
                <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.level">
                  <div class="alert-icon">
                    <el-icon><Warning /></el-icon>
                  </div>
                  <div class="alert-content">
                    <div class="alert-title">{{ alert.title }}</div>
                    <div class="alert-desc">{{ alert.description }}</div>
                    <div class="alert-time">{{ alert.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="统计分析" name="analysis">
          <div class="analysis-view">
            <div class="analysis-charts">
              <div class="chart-row">
                <div class="chart-item">
                  <div ref="qualityTrendChart" class="chart-container"></div>
                </div>
                <div class="chart-item">
                  <div ref="defectAnalysisChart" class="chart-container"></div>
                </div>
              </div>
              <div class="chart-row">
                <div class="chart-item">
                  <div ref="processCapabilityChart" class="chart-container"></div>
                </div>
                <div class="chart-item">
                  <div ref="controlChartChart" class="chart-container"></div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增控制点对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新增质量控制点"
      width="800px"
      :before-close="handleCreateClose"
    >
      <el-form :model="newControl" :rules="controlRules" ref="createFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="控制点名称" prop="name">
              <el-input v-model="newControl.name" placeholder="请输入控制点名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="控制类型" prop="type">
              <el-select v-model="newControl.type" placeholder="选择控制类型" style="width: 100%;">
                <el-option label="进料检验" value="incoming" />
                <el-option label="过程控制" value="process" />
                <el-option label="成品检验" value="final" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联产品" prop="product">
              <el-select v-model="newControl.product" placeholder="选择产品" style="width: 100%;">
                <el-option label="智能控制器 v2.0" value="controller_v2" />
                <el-option label="传感器模块 A1" value="sensor_a1" />
                <el-option label="执行器单元 B3" value="actuator_b3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检查频率" prop="frequency">
              <el-select v-model="newControl.frequency" placeholder="选择检查频率" style="width: 100%;">
                <el-option label="每批次" value="batch" />
                <el-option label="每小时" value="hourly" />
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准值" prop="standard">
              <el-input v-model="newControl.standard" placeholder="请输入标准值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容差范围" prop="tolerance">
              <el-input v-model="newControl.tolerance" placeholder="请输入容差范围" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="控制描述" prop="description">
          <el-input
            v-model="newControl.description"
            type="textarea"
            :rows="4"
            placeholder="请输入控制点描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createControl">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 控制点详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="控制点详情"
      width="1000px"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedControl" class="control-detail">
        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="控制点名称">{{ selectedControl.name }}</el-descriptions-item>
                <el-descriptions-item label="控制类型">
                  <el-tag :type="getTypeTagType(selectedControl.type)">
                    {{ getTypeText(selectedControl.type) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="关联产品">{{ selectedControl.product }}</el-descriptions-item>
                <el-descriptions-item label="检查频率">{{ selectedControl.frequency }}</el-descriptions-item>
                <el-descriptions-item label="标准值">{{ selectedControl.standard }}</el-descriptions-item>
                <el-descriptions-item label="实际值">{{ selectedControl.actualValue }}</el-descriptions-item>
                <el-descriptions-item label="偏差">
                  <span :class="getDeviationClass(selectedControl.deviation)">
                    {{ selectedControl.deviation }}%
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusType(selectedControl.status)">
                    {{ getStatusText(selectedControl.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="描述" :span="2">{{ selectedControl.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="检查记录" name="records">
            <div class="check-records">
              <div class="records-toolbar">
                <el-button type="primary" size="small" @click="addRecord">添加记录</el-button>
              </div>
              <el-table :data="selectedControl.records" style="width: 100%;">
                <el-table-column prop="checkTime" label="检查时间" />
                <el-table-column prop="inspector" label="检查员" />
                <el-table-column prop="value" label="检查值" />
                <el-table-column prop="result" label="结果">
                  <template #default="scope">
                    <el-tag :type="scope.row.result === '合格' ? 'success' : 'danger'" size="small">
                      {{ scope.row.result }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="remarks" label="备注" />
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="趋势分析" name="trend">
            <div class="trend-analysis">
              <div ref="controlTrendChart" class="trend-chart"></div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="改进措施" name="improvement">
            <div class="improvement-measures">
              <div class="measures-toolbar">
                <el-button type="primary" size="small" @click="addMeasure">添加措施</el-button>
              </div>
              <el-table :data="selectedControl.improvements" style="width: 100%;">
                <el-table-column prop="title" label="改进标题" />
                <el-table-column prop="description" label="改进描述" />
                <el-table-column prop="responsible" label="负责人" />
                <el-table-column prop="deadline" label="完成期限" />
                <el-table-column prop="status" label="状态">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === '已完成' ? 'success' : 'warning'" size="small">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, Check, Warning, TrendCharts, Plus, Refresh, Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const searchKeyword = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const activeView = ref('list')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const detailActiveTab = ref('basic')
const selectedControl = ref(null)
const createFormRef = ref(null)

// 概览数据
const overviewData = reactive({
  totalPoints: 48,
  passRate: 96.8,
  exceptions: 3,
  improvements: 12
})

// 新控制点表单
const newControl = reactive({
  name: '',
  type: '',
  product: '',
  frequency: '',
  standard: '',
  tolerance: '',
  description: ''
})

// 表单验证规则
const controlRules = {
  name: [
    { required: true, message: '请输入控制点名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择控制类型', trigger: 'change' }
  ],
  product: [
    { required: true, message: '请选择关联产品', trigger: 'change' }
  ],
  frequency: [
    { required: true, message: '请选择检查频率', trigger: 'change' }
  ],
  standard: [
    { required: true, message: '请输入标准值', trigger: 'blur' }
  ]
}

// 控制点数据
const controlPoints = ref([
  {
    id: 1,
    name: '电压稳定性检测',
    type: 'process',
    product: '智能控制器 v2.0',
    standard: '5.0V ±0.1V',
    actualValue: '4.98V',
    deviation: -0.4,
    status: 'normal',
    frequency: 'hourly',
    lastCheck: '2024-01-15 14:30',
    description: '检测控制器输出电压的稳定性，确保在规定范围内。',
    records: [
      { checkTime: '2024-01-15 14:30', inspector: '张三', value: '4.98V', result: '合格', remarks: '正常' },
      { checkTime: '2024-01-15 13:30', inspector: '李四', value: '5.02V', result: '合格', remarks: '正常' },
      { checkTime: '2024-01-15 12:30', inspector: '王五', value: '4.99V', result: '合格', remarks: '正常' }
    ],
    improvements: [
      { title: '优化电压调节电路', description: '改进电压调节电路设计，提高稳定性', responsible: '赵六', deadline: '2024-02-15', status: '进行中' }
    ]
  },
  {
    id: 2,
    name: '温度传感器精度',
    type: 'incoming',
    product: '传感器模块 A1',
    standard: '±0.5°C',
    actualValue: '±0.3°C',
    deviation: 40,
    status: 'normal',
    frequency: 'batch',
    lastCheck: '2024-01-15 10:00',
    description: '检测温度传感器的测量精度，确保符合技术要求。',
    records: [
      { checkTime: '2024-01-15 10:00', inspector: '钱七', value: '±0.3°C', result: '合格', remarks: '精度良好' },
      { checkTime: '2024-01-14 15:00', inspector: '孙八', value: '±0.4°C', result: '合格', remarks: '正常' }
    ],
    improvements: []
  },
  {
    id: 3,
    name: '执行器响应时间',
    type: 'final',
    product: '执行器单元 B3',
    standard: '≤100ms',
    actualValue: '120ms',
    deviation: 20,
    status: 'warning',
    frequency: 'daily',
    lastCheck: '2024-01-15 16:00',
    description: '测试执行器的响应时间，确保满足实时控制要求。',
    records: [
      { checkTime: '2024-01-15 16:00', inspector: '周九', value: '120ms', result: '不合格', remarks: '超出标准' },
      { checkTime: '2024-01-14 16:00', inspector: '吴十', value: '95ms', result: '合格', remarks: '正常' }
    ],
    improvements: [
      { title: '优化执行器驱动算法', description: '改进驱动算法，提高响应速度', responsible: '郑一', deadline: '2024-01-30', status: '计划中' }
    ]
  }
])

// 告警数据
const alerts = ref([
  {
    id: 1,
    title: '执行器响应时间异常',
    description: '执行器单元 B3 响应时间超出标准范围',
    level: 'warning',
    time: '2024-01-15 16:05'
  },
  {
    id: 2,
    title: '温度传感器批次检验完成',
    description: '传感器模块 A1 批次检验全部合格',
    level: 'info',
    time: '2024-01-15 15:30'
  }
])

// 计算属性
const filteredControlPoints = computed(() => {
  return controlPoints.value.filter(point => {
    const matchesSearch = !searchKeyword.value || 
      point.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      point.product.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || point.status === statusFilter.value
    const matchesType = !typeFilter.value || point.type === typeFilter.value
    
    return matchesSearch && matchesStatus && matchesType
  })
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const handleViewChange = (tab) => {
  if (tab.name === 'monitor') {
    nextTick(() => {
      initTrendChart()
      initDistributionChart()
    })
  } else if (tab.name === 'analysis') {
    nextTick(() => {
      initQualityTrendChart()
      initDefectAnalysisChart()
      initProcessCapabilityChart()
      initControlChartChart()
    })
  }
}

const getStatusType = (status) => {
  const types = {
    normal: 'success',
    warning: 'warning',
    exception: 'danger'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    normal: '正常',
    warning: '警告',
    exception: '异常'
  }
  return texts[status] || status
}

const getTypeTagType = (type) => {
  const types = {
    incoming: 'info',
    process: 'warning',
    final: 'success'
  }
  return types[type] || ''
}

const getTypeText = (type) => {
  const texts = {
    incoming: '进料检验',
    process: '过程控制',
    final: '成品检验'
  }
  return texts[type] || type
}

const getDeviationClass = (deviation) => {
  if (Math.abs(deviation) <= 5) return 'deviation-normal'
  if (Math.abs(deviation) <= 10) return 'deviation-warning'
  return 'deviation-danger'
}

const viewControlDetail = (control) => {
  selectedControl.value = control
  showDetailDialog.value = true
  nextTick(() => {
    initControlTrendChart()
  })
}

const editControl = (control) => {
  ElMessage.info('编辑功能开发中...')
}

const deleteControl = (control) => {
  ElMessageBox.confirm(
    `确定要删除控制点"${control.name}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = controlPoints.value.findIndex(p => p.id === control.id)
    if (index > -1) {
      controlPoints.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const createControl = () => {
  createFormRef.value.validate((valid) => {
    if (valid) {
      const control = {
        id: Date.now(),
        ...newControl,
        actualValue: '-',
        deviation: 0,
        status: 'normal',
        lastCheck: new Date().toLocaleString(),
        records: [],
        improvements: []
      }
      controlPoints.value.unshift(control)
      showCreateDialog.value = false
      resetNewControl()
      ElMessage.success('控制点创建成功')
    }
  })
}

const resetNewControl = () => {
  Object.assign(newControl, {
    name: '',
    type: '',
    product: '',
    frequency: '',
    standard: '',
    tolerance: '',
    description: ''
  })
}

const handleCreateClose = () => {
  resetNewControl()
  showCreateDialog.value = false
}

const handleDetailClose = () => {
  selectedControl.value = null
  showDetailDialog.value = false
}

const addRecord = () => {
  ElMessage.info('添加记录功能开发中...')
}

const addMeasure = () => {
  ElMessage.info('添加改进措施功能开发中...')
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

// 图表初始化
const trendChart = ref(null)
const distributionChart = ref(null)
const qualityTrendChart = ref(null)
const defectAnalysisChart = ref(null)
const processCapabilityChart = ref(null)
const controlChartChart = ref(null)
const controlTrendChart = ref(null)

const initTrendChart = () => {
  if (!trendChart.value) return
  
  const chart = echarts.init(trendChart.value)
  const option = {
    title: {
      text: '质量趋势监控',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    series: [{
      name: '合格率',
      type: 'line',
      data: [96.5, 97.2, 96.8, 97.5, 96.3, 97.1],
      lineStyle: { color: '#00e5ff' },
      itemStyle: { color: '#00e5ff' }
    }]
  }
  chart.setOption(option)
}

const initDistributionChart = () => {
  if (!distributionChart.value) return
  
  const chart = echarts.init(distributionChart.value)
  const option = {
    title: {
      text: '质量分布统计',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 85, name: '优秀' },
        { value: 12, name: '良好' },
        { value: 2, name: '合格' },
        { value: 1, name: '不合格' }
      ],
      itemStyle: {
        color: (params) => {
          const colors = ['#00e5ff', '#0080ff', '#40a9ff', '#ff4d4f']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  chart.setOption(option)
}

const initQualityTrendChart = () => {
  if (!qualityTrendChart.value) return
  
  const chart = echarts.init(qualityTrendChart.value)
  const option = {
    title: {
      text: '质量趋势分析',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis'
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
    series: [{
      name: '合格率',
      type: 'line',
      data: [95.2, 96.1, 96.8, 97.2, 96.9, 97.5],
      lineStyle: { color: '#00e5ff' },
      itemStyle: { color: '#00e5ff' }
    }]
  }
  chart.setOption(option)
}

const initDefectAnalysisChart = () => {
  if (!defectAnalysisChart.value) return
  
  const chart = echarts.init(defectAnalysisChart.value)
  const option = {
    title: {
      text: '缺陷分析',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['电压异常', '温度超标', '响应延迟', '精度偏差', '其他'],
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
      data: [5, 3, 8, 2, 1],
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

const initProcessCapabilityChart = () => {
  if (!processCapabilityChart.value) return
  
  const chart = echarts.init(processCapabilityChart.value)
  const option = {
    title: {
      text: '过程能力分析',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'gauge',
      radius: '75%',
      data: [{ value: 1.33, name: 'Cpk值' }],
      detail: {
        valueAnimation: true,
        formatter: '{value}',
        color: '#00e5ff'
      },
      axisLine: {
        lineStyle: {
          width: 30,
          color: [
            [0.3, '#ff4d4f'],
            [0.7, '#faad14'],
            [1, '#52c41a']
          ]
        }
      },
      pointer: {
        itemStyle: {
          color: '#00e5ff'
        }
      }
    }]
  }
  chart.setOption(option)
}

const initControlChartChart = () => {
  if (!controlChartChart.value) return
  
  const chart = echarts.init(controlChartChart.value)
  const option = {
    title: {
      text: '控制图',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: Array.from({length: 20}, (_, i) => i + 1),
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    series: [{
      name: '测量值',
      type: 'line',
      data: [4.98, 5.02, 4.99, 5.01, 4.97, 5.03, 4.98, 5.00, 4.99, 5.02, 4.98, 5.01, 4.99, 5.00, 4.97, 5.02, 4.98, 5.01, 4.99, 5.00],
      lineStyle: { color: '#00e5ff' },
      itemStyle: { color: '#00e5ff' }
    }, {
      name: '上控制限',
      type: 'line',
      data: Array(20).fill(5.1),
      lineStyle: { color: '#ff4d4f', type: 'dashed' },
      itemStyle: { color: '#ff4d4f' }
    }, {
      name: '下控制限',
      type: 'line',
      data: Array(20).fill(4.9),
      lineStyle: { color: '#ff4d4f', type: 'dashed' },
      itemStyle: { color: '#ff4d4f' }
    }]
  }
  chart.setOption(option)
}

const initControlTrendChart = () => {
  if (!controlTrendChart.value) return
  
  const chart = echarts.init(controlTrendChart.value)
  const option = {
    title: {
      text: '控制点趋势分析',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1周前', '6天前', '5天前', '4天前', '3天前', '2天前', '1天前', '今天'],
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    series: [{
      name: '实际值',
      type: 'line',
      data: [4.98, 5.02, 4.99, 5.01, 4.97, 5.03, 4.98, 4.98],
      lineStyle: { color: '#00e5ff' },
      itemStyle: { color: '#00e5ff' }
    }]
  }
  chart.setOption(option)
}

onMounted(() => {
  // 组件挂载后的初始化
})
</script>

<style lang="scss" scoped>
.quality-control-container {
  padding: 20px;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
  min-height: 100vh;
  color: #ffffff;

  .control-overview {
    margin-bottom: 24px;

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;

      .overview-card {
        background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 229, 255, 0.5);
          box-shadow: 0 8px 32px rgba(0, 229, 255, 0.2);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00e5ff 0%, #0080ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #ffffff;
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
          }
        }
      }
    }
  }

  .control-toolbar {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(10px);

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

  .control-tabs {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    backdrop-filter: blur(10px);

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      background: rgba(0, 229, 255, 0.3);
    }

    :deep(.el-tabs__active-bar) {
      background: #00e5ff;
    }

    :deep(.el-tabs__item) {
      color: rgba(255, 255, 255, 0.7);
      
      &.is-active {
        color: #00e5ff;
      }
    }

    .control-list {
      :deep(.el-table) {
        background: transparent;
        color: #ffffff;

        .el-table__header {
          background: rgba(0, 229, 255, 0.1);
        }

        .el-table__row {
          background: rgba(0, 229, 255, 0.05);
          
          &:hover {
            background: rgba(0, 229, 255, 0.1);
          }
        }

        th, td {
          border-color: rgba(0, 229, 255, 0.2);
        }
      }
    }

    .monitor-view {
      .monitor-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 24px;

        .monitor-chart {
          .chart-container {
            width: 100%;
            height: 300px;
            background: rgba(0, 229, 255, 0.05);
            border-radius: 8px;
          }
        }
      }

      .monitor-alerts {
        h3 {
          color: #00e5ff;
          margin-bottom: 16px;
        }

        .alert-list {
          .alert-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            border-left: 4px solid;

            &.warning {
              background: rgba(255, 193, 7, 0.1);
              border-left-color: #faad14;
            }

            &.info {
              background: rgba(0, 229, 255, 0.1);
              border-left-color: #00e5ff;
            }

            .alert-icon {
              color: #faad14;
            }

            .alert-content {
              flex: 1;

              .alert-title {
                font-weight: bold;
                margin-bottom: 4px;
              }

              .alert-desc {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 4px;
              }

              .alert-time {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
              }
            }
          }
        }
      }
    }

    .analysis-view {
      .analysis-charts {
        .chart-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;

          .chart-item {
            .chart-container {
              width: 100%;
              height: 300px;
              background: rgba(0, 229, 255, 0.05);
              border-radius: 8px;
            }
          }
        }
      }
    }
  }

  :deep(.el-dialog) {
    background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
    border: 1px solid rgba(0, 229, 255, 0.3);

    .el-dialog__header {
      background: rgba(0, 229, 255, 0.1);
      border-bottom: 1px solid rgba(0, 229, 255, 0.3);
      
      .el-dialog__title {
        color: #00e5ff;
      }
    }

    .el-dialog__body {
      color: #ffffff;
    }
  }

  .control-detail {
    .basic-info {
      :deep(.el-descriptions) {
        .el-descriptions__header {
          .el-descriptions__title {
            color: #00e5ff;
          }
        }

        .el-descriptions__body {
          .el-descriptions__table {
            .el-descriptions__cell {
              border-color: rgba(0, 229, 255, 0.2);
              
              .el-descriptions__label {
                background: rgba(0, 229, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
              }

              .el-descriptions__content {
                color: #ffffff;
              }
            }
          }
        }
      }
    }

    .check-records, .improvement-measures {
      .records-toolbar, .measures-toolbar {
        margin-bottom: 16px;
      }

      :deep(.el-table) {
        background: transparent;
        color: #ffffff;

        .el-table__header {
          background: rgba(0, 229, 255, 0.1);
        }

        .el-table__row {
          background: rgba(0, 229, 255, 0.05);
          
          &:hover {
            background: rgba(0, 229, 255, 0.1);
          }
        }

        th, td {
          border-color: rgba(0, 229, 255, 0.2);
        }
      }
    }

    .trend-analysis {
      .trend-chart {
        width: 100%;
        height: 400px;
        background: rgba(0, 229, 255, 0.05);
        border-radius: 8px;
      }
    }
  }

  // 偏差样式
  .deviation-normal {
    color: #52c41a;
  }

  .deviation-warning {
    color: #faad14;
  }

  .deviation-danger {
    color: #ff4d4f;
  }

  // 全息扫描动效
  @keyframes hologram-scan {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .hologram-scan {
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.6), transparent);
      animation: hologram-scan 1s ease-in-out;
      pointer-events: none;
    }
  }
}
