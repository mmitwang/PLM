<template>
  <div class="quality-inspection-container">
    <!-- 质量检验概览 -->
    <div class="inspection-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Search /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">总检验项</div>
            <div class="card-value">{{ overviewData.totalInspections }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">合格数</div>
            <div class="card-value">{{ overviewData.passedCount }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Close /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">不合格数</div>
            <div class="card-value">{{ overviewData.failedCount }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">待检验</div>
            <div class="card-value">{{ overviewData.pendingCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 检验工具栏 -->
    <div class="inspection-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索检验项..."
          prefix-icon="Search"
          style="width: 300px;"
          @input="handleSearch"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px;">
          <el-option label="全部" value="" />
          <el-option label="待检验" value="pending" />
          <el-option label="检验中" value="inspecting" />
          <el-option label="合格" value="passed" />
          <el-option label="不合格" value="failed" />
        </el-select>
        <el-select v-model="typeFilter" placeholder="类型筛选" style="width: 150px;">
          <el-option label="全部" value="" />
          <el-option label="进料检验" value="incoming" />
          <el-option label="过程检验" value="process" />
          <el-option label="成品检验" value="final" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增检验
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 检验视图 -->
    <div class="inspection-tabs">
      <el-tabs v-model="activeView" @tab-click="handleViewChange">
        <el-tab-pane label="检验列表" name="list">
          <div class="inspection-list">
            <el-table :data="filteredInspections" style="width: 100%">
              <el-table-column prop="batchNo" label="批次号" width="120" />
              <el-table-column prop="product" label="产品名称" width="180" />
              <el-table-column prop="type" label="检验类型" width="120">
                <template #default="scope">
                  <el-tag :type="getTypeTagType(scope.row.type)">
                    {{ getTypeText(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="检验数量" width="100" />
              <el-table-column prop="inspector" label="检验员" width="100" />
              <el-table-column prop="inspectionDate" label="检验日期" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="result" label="检验结果" width="100">
                <template #default="scope">
                  <el-tag v-if="scope.row.result" :type="scope.row.result === '合格' ? 'success' : 'danger'">
                    {{ scope.row.result }}
                  </el-tag>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="viewInspectionDetail(scope.row)">详情</el-button>
                  <el-button size="small" type="primary" @click="startInspection(scope.row)" v-if="scope.row.status === 'pending'">开始检验</el-button>
                  <el-button size="small" type="success" @click="completeInspection(scope.row)" v-if="scope.row.status === 'inspecting'">完成检验</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="检验报告" name="report">
          <div class="inspection-report">
            <div class="report-charts">
              <div class="chart-row">
                <div class="chart-item">
                  <div ref="passRateChart" class="chart-container"></div>
                </div>
                <div class="chart-item">
                  <div ref="defectTypeChart" class="chart-container"></div>
                </div>
              </div>
              <div class="chart-row">
                <div class="chart-item">
                  <div ref="trendChart" class="chart-container"></div>
                </div>
                <div class="chart-item">
                  <div ref="inspectorChart" class="chart-container"></div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="不合格品处理" name="nonconforming">
          <div class="nonconforming-view">
            <div class="nonconforming-toolbar">
              <el-button type="primary" @click="showNonconformingDialog = true">
                <el-icon><Plus /></el-icon>
                新增不合格品
              </el-button>
            </div>
            <el-table :data="nonconformingItems" style="width: 100%">
              <el-table-column prop="batchNo" label="批次号" width="120" />
              <el-table-column prop="product" label="产品名称" width="180" />
              <el-table-column prop="defectType" label="缺陷类型" width="120" />
              <el-table-column prop="defectDescription" label="缺陷描述" width="200" />
              <el-table-column prop="quantity" label="不合格数量" width="120" />
              <el-table-column prop="handler" label="处理人" width="100" />
              <el-table-column prop="handleMethod" label="处理方式" width="120">
                <template #default="scope">
                  <el-tag :type="getHandleMethodType(scope.row.handleMethod)">
                    {{ scope.row.handleMethod }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="handleStatus" label="处理状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.handleStatus === '已处理' ? 'success' : 'warning'">
                    {{ scope.row.handleStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button size="small" @click="handleNonconforming(scope.row)">处理</el-button>
                  <el-button size="small" type="primary" @click="viewNonconformingDetail(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增检验对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新增质量检验"
      width="800px"
      :before-close="handleCreateClose"
    >
      <el-form :model="newInspection" :rules="inspectionRules" ref="createFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="newInspection.batchNo" placeholder="请输入批次号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="product">
              <el-select v-model="newInspection.product" placeholder="选择产品" style="width: 100%;">
                <el-option label="智能控制器 v2.0" value="智能控制器 v2.0" />
                <el-option label="传感器模块 A1" value="传感器模块 A1" />
                <el-option label="执行器单元 B3" value="执行器单元 B3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验类型" prop="type">
              <el-select v-model="newInspection.type" placeholder="选择检验类型" style="width: 100%;">
                <el-option label="进料检验" value="incoming" />
                <el-option label="过程检验" value="process" />
                <el-option label="成品检验" value="final" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检验数量" prop="quantity">
              <el-input-number v-model="newInspection.quantity" :min="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验员" prop="inspector">
              <el-select v-model="newInspection.inspector" placeholder="选择检验员" style="width: 100%;">
                <el-option label="张三" value="张三" />
                <el-option label="李四" value="李四" />
                <el-option label="王五" value="王五" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检验日期" prop="inspectionDate">
              <el-date-picker
                v-model="newInspection.inspectionDate"
                type="date"
                placeholder="选择检验日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="检验说明" prop="remarks">
          <el-input
            v-model="newInspection.remarks"
            type="textarea"
            :rows="4"
            placeholder="请输入检验说明"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createInspection">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 检验详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="检验详情"
      width="1000px"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedInspection" class="inspection-detail">
        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="批次号">{{ selectedInspection.batchNo }}</el-descriptions-item>
                <el-descriptions-item label="产品名称">{{ selectedInspection.product }}</el-descriptions-item>
                <el-descriptions-item label="检验类型">
                  <el-tag :type="getTypeTagType(selectedInspection.type)">
                    {{ getTypeText(selectedInspection.type) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="检验数量">{{ selectedInspection.quantity }}</el-descriptions-item>
                <el-descriptions-item label="检验员">{{ selectedInspection.inspector }}</el-descriptions-item>
                <el-descriptions-item label="检验日期">{{ selectedInspection.inspectionDate }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusType(selectedInspection.status)">
                    {{ getStatusText(selectedInspection.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="检验结果">
                  <el-tag v-if="selectedInspection.result" :type="selectedInspection.result === '合格' ? 'success' : 'danger'">
                    {{ selectedInspection.result }}
                  </el-tag>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="检验说明" :span="2">{{ selectedInspection.remarks || '-' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="检验项目" name="items">
            <div class="inspection-items">
              <div class="items-toolbar">
                <el-button type="primary" size="small" @click="addInspectionItem">添加检验项</el-button>
              </div>
              <el-table :data="selectedInspection.items || []" style="width: 100%;">
                <el-table-column prop="itemName" label="检验项目" />
                <el-table-column prop="standard" label="标准要求" />
                <el-table-column prop="actualValue" label="实际值" />
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
          
          <el-tab-pane label="检验记录" name="records">
            <div class="inspection-records">
              <el-timeline>
                <el-timeline-item
                  v-for="record in selectedInspection.records || []"
                  :key="record.id"
                  :timestamp="record.time"
                  :type="record.type"
                >
                  <div class="record-content">
                    <div class="record-title">{{ record.title }}</div>
                    <div class="record-desc">{{ record.description }}</div>
                    <div class="record-operator">操作人：{{ record.operator }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
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
import { Search, Check, Close, Clock, Plus, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const searchKeyword = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const activeView = ref('list')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const showNonconformingDialog = ref(false)
const detailActiveTab = ref('basic')
const selectedInspection = ref(null)
const createFormRef = ref(null)

// 概览数据
const overviewData = reactive({
  totalInspections: 156,
  passedCount: 142,
  failedCount: 8,
  pendingCount: 6
})

// 新检验表单
const newInspection = reactive({
  batchNo: '',
  product: '',
  type: '',
  quantity: 1,
  inspector: '',
  inspectionDate: '',
  remarks: ''
})

// 表单验证规则
const inspectionRules = {
  batchNo: [
    { required: true, message: '请输入批次号', trigger: 'blur' }
  ],
  product: [
    { required: true, message: '请选择产品', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择检验类型', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入检验数量', trigger: 'blur' }
  ],
  inspector: [
    { required: true, message: '请选择检验员', trigger: 'change' }
  ],
  inspectionDate: [
    { required: true, message: '请选择检验日期', trigger: 'change' }
  ]
}

// 检验数据
const inspections = ref([
  {
    id: 1,
    batchNo: 'B20240115001',
    product: '智能控制器 v2.0',
    type: 'final',
    quantity: 100,
    inspector: '张三',
    inspectionDate: '2024-01-15',
    status: 'passed',
    result: '合格',
    remarks: '成品检验，各项指标符合要求',
    items: [
      { itemName: '外观检查', standard: '无划痕、无变形', actualValue: '外观良好', result: '合格', remarks: '正常' },
      { itemName: '功能测试', standard: '功能正常', actualValue: '功能正常', result: '合格', remarks: '测试通过' }
    ],
    records: [
      { id: 1, time: '2024-01-15 09:00', type: 'primary', title: '开始检验', description: '开始进行成品检验', operator: '张三' },
      { id: 2, time: '2024-01-15 11:30', type: 'success', title: '检验完成', description: '检验完成，结果合格', operator: '张三' }
    ]
  },
  {
    id: 2,
    batchNo: 'B20240115002',
    product: '传感器模块 A1',
    type: 'incoming',
    quantity: 200,
    inspector: '李四',
    inspectionDate: '2024-01-15',
    status: 'inspecting',
    result: null,
    remarks: '进料检验进行中',
    items: [
      { itemName: '尺寸检查', standard: '±0.1mm', actualValue: '0.05mm', result: '合格', remarks: '尺寸符合要求' }
    ],
    records: [
      { id: 1, time: '2024-01-15 14:00', type: 'primary', title: '开始检验', description: '开始进行进料检验', operator: '李四' }
    ]
  },
  {
    id: 3,
    batchNo: 'B20240115003',
    product: '执行器单元 B3',
    type: 'process',
    quantity: 50,
    inspector: '王五',
    inspectionDate: '2024-01-15',
    status: 'failed',
    result: '不合格',
    remarks: '过程检验发现质量问题',
    items: [
      { itemName: '响应时间', standard: '≤100ms', actualValue: '120ms', result: '不合格', remarks: '超出标准要求' }
    ],
    records: [
      { id: 1, time: '2024-01-15 10:00', type: 'primary', title: '开始检验', description: '开始进行过程检验', operator: '王五' },
      { id: 2, time: '2024-01-15 12:00', type: 'danger', title: '检验不合格', description: '响应时间超出标准要求', operator: '王五' }
    ]
  }
])

// 不合格品数据
const nonconformingItems = ref([
  {
    id: 1,
    batchNo: 'B20240115003',
    product: '执行器单元 B3',
    defectType: '性能缺陷',
    defectDescription: '响应时间超出标准要求',
    quantity: 5,
    handler: '赵六',
    handleMethod: '返工',
    handleStatus: '处理中'
  },
  {
    id: 2,
    batchNo: 'B20240114001',
    product: '智能控制器 v2.0',
    defectType: '外观缺陷',
    defectDescription: '外壳有轻微划痕',
    quantity: 2,
    handler: '钱七',
    handleMethod: '报废',
    handleStatus: '已处理'
  }
])

// 计算属性
const filteredInspections = computed(() => {
  return inspections.value.filter(inspection => {
    const matchesSearch = !searchKeyword.value || 
      inspection.batchNo.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      inspection.product.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || inspection.status === statusFilter.value
    const matchesType = !typeFilter.value || inspection.type === typeFilter.value
    
    return matchesSearch && matchesStatus && matchesType
  })
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const handleViewChange = (tab) => {
  if (tab.name === 'report') {
    nextTick(() => {
      initPassRateChart()
      initDefectTypeChart()
      initTrendChart()
      initInspectorChart()
    })
  }
}

const getStatusType = (status) => {
  const types = {
    pending: 'info',
    inspecting: 'warning',
    passed: 'success',
    failed: 'danger'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    pending: '待检验',
    inspecting: '检验中',
    passed: '合格',
    failed: '不合格'
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
    process: '过程检验',
    final: '成品检验'
  }
  return texts[type] || type
}

const getHandleMethodType = (method) => {
  const types = {
    '返工': 'warning',
    '报废': 'danger',
    '让步接收': 'info'
  }
  return types[method] || ''
}

const viewInspectionDetail = (inspection) => {
  selectedInspection.value = inspection
  showDetailDialog.value = true
}

const startInspection = (inspection) => {
  inspection.status = 'inspecting'
  ElMessage.success('检验已开始')
}

const completeInspection = (inspection) => {
  ElMessageBox.prompt('请输入检验结果', '完成检验', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValidator: (value) => {
      if (!value) {
        return '请输入检验结果'
      }
      return true
    }
  }).then(({ value }) => {
    inspection.status = value === '合格' ? 'passed' : 'failed'
    inspection.result = value
    ElMessage.success('检验已完成')
  }).catch(() => {
    ElMessage.info('已取消')
  })
}

const createInspection = () => {
  createFormRef.value.validate((valid) => {
    if (valid) {
      const inspection = {
        id: Date.now(),
        ...newInspection,
        status: 'pending',
        result: null,
        items: [],
        records: []
      }
      inspections.value.unshift(inspection)
      showCreateDialog.value = false
      resetNewInspection()
      ElMessage.success('检验创建成功')
    }
  })
}

const resetNewInspection = () => {
  Object.assign(newInspection, {
    batchNo: '',
    product: '',
    type: '',
    quantity: 1,
    inspector: '',
    inspectionDate: '',
    remarks: ''
  })
}

const handleCreateClose = () => {
  resetNewInspection()
  showCreateDialog.value = false
}

const handleDetailClose = () => {
  selectedInspection.value = null
  showDetailDialog.value = false
}

const addInspectionItem = () => {
  ElMessage.info('添加检验项功能开发中...')
}

const handleNonconforming = (item) => {
  ElMessage.info('处理不合格品功能开发中...')
}

const viewNonconformingDetail = (item) => {
  ElMessage.info('查看不合格品详情功能开发中...')
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

// 图表初始化
const passRateChart = ref(null)
const defectTypeChart = ref(null)
const trendChart = ref(null)
const inspectorChart = ref(null)

const initPassRateChart = () => {
  if (!passRateChart.value) return
  
  const chart = echarts.init(passRateChart.value)
  const option = {
    title: {
      text: '合格率统计',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 142, name: '合格' },
        { value: 8, name: '不合格' },
        { value: 6, name: '待检验' }
      ],
      itemStyle: {
        color: (params) => {
          const colors = ['#52c41a', '#ff4d4f', '#faad14']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  chart.setOption(option)
}

const initDefectTypeChart = () => {
  if (!defectTypeChart.value) return
  
  const chart = echarts.init(defectTypeChart.value)
  const option = {
    title: {
      text: '缺陷类型分析',
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
      data: [3, 2, 5, 1, 2],
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

const initTrendChart = () => {
  if (!trendChart.value) return
  
  const chart = echarts.init(trendChart.value)
  const option = {
    title: {
      text: '质量趋势图',
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
      data: [95, 97, 94, 96, 98, 95],
      itemStyle: { color: '#52c41a' },
      lineStyle: { color: '#52c41a' }
    }, {
      name: '不合格率',
      type: 'line',
      data: [5, 3, 6, 4, 2, 5],
      itemStyle: { color: '#ff4d4f' },
      lineStyle: { color: '#ff4d4f' }
    }]
  }
  chart.setOption(option)
}

const initInspectorChart = () => {
  if (!inspectorChart.value) return
  
  const chart = echarts.init(inspectorChart.value)
  const option = {
    title: {
      text: '检验员统计',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['张三', '李四', '王五', '赵六', '钱七'],
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    series: [{
      name: '检验数量',
      type: 'bar',
      data: [45, 38, 42, 35, 28],
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

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.quality-inspection-container {
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

  .inspection-overview {
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
          }
        }
      }
    }
  }

  .inspection-toolbar {
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

  .inspection-tabs {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 12px;
    padding: 24px;
    position: relative;
    z-index: 1;

    :deep(.el-tabs__header) {
      border-bottom: 1px solid rgba(0, 229, 255, 0.3);
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__item) {
      color: rgba(255, 255, 255, 0.7);
      border-bottom: 2px solid transparent;

      &.is-active {
        color: #00e5ff;
        border-bottom-color: #00e5ff;
      }

      &:hover {
        color: #00e5ff;
      }
    }

    .inspection-list {
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
    }

    .inspection-report {
      .report-charts {
        .chart-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }

          .chart-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(0, 229, 255, 0.2);
            border-radius: 8px;
            padding: 16px;

            .chart-container {
              width: 100%;
              height: 300px;
            }
          }
        }
      }
    }

    .nonconforming-view {
      .nonconforming-toolbar {
        margin-bottom: 16px;
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

    .el-date-editor {
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

    &.el-button--success {
      background: linear-gradient(135deg, #52c41a, #389e0d);
      border-color: #52c41a;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #73d13d, #52c41a);
        border-color: #73d13d;
      }
    }
  }

  :deep(.el-tag) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);

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

    &.el-tag--danger {
      background: rgba(255, 77, 79, 0.2);
      border-color: rgba(255, 77, 79, 0.4);
      color: #ff4d4f;
    }

    &.el-tag--info {
      background: rgba(0, 229, 255, 0.2);
      border-color: rgba(0, 229, 255, 0.4);
      color: #00e5ff;
    }
  }

  .basic-info {
    :deep(.el-descriptions) {
      .el-descriptions__header {
        margin-bottom: 20px;
      }

      .el-descriptions__title {
        color: #00e5ff;
        font-weight: 600;
      }

      .el-descriptions__body {
        .el-descriptions__table {
          border: 1px solid rgba(0, 229, 255, 0.3);

          .el-descriptions__cell {
            border: 1px solid rgba(0, 229, 255, 0.2);
            background: rgba(255, 255, 255, 0.02);

            &.is-bordered-label {
              background: rgba(0, 229, 255, 0.1);
              color: #00e5ff;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .inspection-items {
    .items-toolbar {
      margin-bottom: 16px;
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
    }
  }

  .inspection-records {
    :deep(.el-timeline) {
      .el-timeline-item__wrapper {
        .el-timeline-item__tail {
          border-left: 2px solid rgba(0, 229, 255, 0.3);
        }

        .el-timeline-item__node {
          background: #00e5ff;
          border-color: #00e5ff;
        }

        .el-timeline-item__content {
          color: rgba(255, 255, 255, 0.9);

          .record-content {
            .record-title {
              font-weight: 600;
              color: #00e5ff;
              margin-bottom: 8px;
            }

            .record-desc {
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 4px;
            }

            .record-operator {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.5);
            }
          }
        }

        .el-timeline-item__timestamp {
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}
</style>
