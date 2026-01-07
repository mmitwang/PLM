<template>
  <div class="planning-container">
    <!-- 计划概览 -->
    <div class="planning-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">总计划数</div>
            <div class="card-value">{{ overviewData.totalPlans }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">进行中</div>
            <div class="card-value">{{ overviewData.inProgress }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">已完成</div>
            <div class="card-value">{{ overviewData.completed }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">延期计划</div>
            <div class="card-value">{{ overviewData.delayed }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 计划管理工具栏 -->
    <div class="planning-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索计划..."
          prefix-icon="Search"
          style="width: 300px;"
          @input="handleSearch"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px;">
          <el-option label="全部" value="" />
          <el-option label="计划中" value="planning" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已延期" value="delayed" />
        </el-select>
        <el-select v-model="priorityFilter" placeholder="优先级筛选" style="width: 150px;">
          <el-option label="全部" value="" />
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建计划
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 计划视图切换 -->
    <div class="view-tabs">
      <el-tabs v-model="activeView" @tab-click="handleViewChange">
        <el-tab-pane label="列表视图" name="list">
          <div class="planning-list">
            <el-table :data="filteredPlans" style="width: 100%">
              <el-table-column prop="name" label="计划名称" width="200" />
              <el-table-column prop="product" label="产品" width="150" />
              <el-table-column prop="quantity" label="计划数量" width="120" />
              <el-table-column prop="startDate" label="开始日期" width="120" />
              <el-table-column prop="endDate" label="结束日期" width="120" />
              <el-table-column prop="progress" label="进度" width="120">
                <template #default="scope">
                  <el-progress :percentage="scope.row.progress" :stroke-width="8" />
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100">
                <template #default="scope">
                  <el-tag :type="getPriorityType(scope.row.priority)">
                    {{ getPriorityText(scope.row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="viewPlanDetail(scope.row)">详情</el-button>
                  <el-button size="small" type="primary" @click="editPlan(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deletePlan(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="甘特图" name="gantt">
          <div class="gantt-view">
            <div ref="ganttChart" class="gantt-chart"></div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="日历视图" name="calendar">
          <div class="calendar-view">
            <el-calendar v-model="calendarDate">
              <template #date-cell="{ data }">
                <div class="calendar-cell">
                  <div class="date">{{ data.day.split('-').slice(2).join('-') }}</div>
                  <div class="plans" v-if="getPlansForDate(data.day).length > 0">
                    <div 
                      v-for="plan in getPlansForDate(data.day)" 
                      :key="plan.id"
                      class="plan-item"
                      :class="plan.status"
                    >
                      {{ plan.name }}
                    </div>
                  </div>
                </div>
              </template>
            </el-calendar>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 创建计划对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建制造计划"
      width="800px"
      :before-close="handleCreateClose"
    >
      <el-form :model="newPlan" :rules="planRules" ref="createFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划名称" prop="name">
              <el-input v-model="newPlan.name" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品" prop="product">
              <el-select v-model="newPlan.product" placeholder="选择产品" style="width: 100%;">
                <el-option label="智能控制器 v2.0" value="controller_v2" />
                <el-option label="传感器模块 A1" value="sensor_a1" />
                <el-option label="执行器单元 B3" value="actuator_b3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划数量" prop="quantity">
              <el-input-number v-model="newPlan.quantity" :min="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="newPlan.priority" placeholder="选择优先级" style="width: 100%;">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="newPlan.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="newPlan.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="计划描述" prop="description">
          <el-input
            v-model="newPlan.description"
            type="textarea"
            :rows="4"
            placeholder="请输入计划描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createPlan">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 计划详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="计划详情"
      width="1000px"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedPlan" class="plan-detail">
        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="计划名称">{{ selectedPlan.name }}</el-descriptions-item>
                <el-descriptions-item label="产品">{{ selectedPlan.product }}</el-descriptions-item>
                <el-descriptions-item label="计划数量">{{ selectedPlan.quantity }}</el-descriptions-item>
                <el-descriptions-item label="优先级">
                  <el-tag :type="getPriorityType(selectedPlan.priority)">
                    {{ getPriorityText(selectedPlan.priority) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="开始日期">{{ selectedPlan.startDate }}</el-descriptions-item>
                <el-descriptions-item label="结束日期">{{ selectedPlan.endDate }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusType(selectedPlan.status)">
                    {{ getStatusText(selectedPlan.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="进度">
                  <el-progress :percentage="selectedPlan.progress" :stroke-width="8" />
                </el-descriptions-item>
                <el-descriptions-item label="描述" :span="2">{{ selectedPlan.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="任务分解" name="tasks">
            <div class="tasks-breakdown">
              <div class="tasks-toolbar">
                <el-button type="primary" size="small" @click="addTask">添加任务</el-button>
              </div>
              <el-table :data="selectedPlan.tasks" style="width: 100%;">
                <el-table-column prop="name" label="任务名称" />
                <el-table-column prop="assignee" label="负责人" />
                <el-table-column prop="startDate" label="开始日期" />
                <el-table-column prop="endDate" label="结束日期" />
                <el-table-column prop="progress" label="进度">
                  <template #default="scope">
                    <el-progress :percentage="scope.row.progress" :stroke-width="6" />
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" size="small">
                      {{ getStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="资源分配" name="resources">
            <div class="resource-allocation">
              <div ref="resourceChart" class="resource-chart"></div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="进度跟踪" name="progress">
            <div class="progress-tracking">
              <div ref="progressChart" class="progress-chart"></div>
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
import { Calendar, Clock, Check, Warning, Plus, Refresh, Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const searchKeyword = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const activeView = ref('list')
const calendarDate = ref(new Date())
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const detailActiveTab = ref('basic')
const selectedPlan = ref(null)
const createFormRef = ref(null)

// 概览数据
const overviewData = reactive({
  totalPlans: 156,
  inProgress: 42,
  completed: 98,
  delayed: 16
})

// 新计划表单
const newPlan = reactive({
  name: '',
  product: '',
  quantity: 1,
  priority: 'medium',
  startDate: '',
  endDate: '',
  description: ''
})

// 表单验证规则
const planRules = {
  name: [
    { required: true, message: '请输入计划名称', trigger: 'blur' }
  ],
  product: [
    { required: true, message: '请选择产品', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入计划数量', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ]
}

// 计划数据
const plans = ref([
  {
    id: 1,
    name: '智能控制器批量生产计划',
    product: '智能控制器 v2.0',
    quantity: 1000,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    progress: 75,
    status: 'in_progress',
    priority: 'high',
    description: '智能控制器v2.0的批量生产计划，包含硬件组装、软件烧录、质量检测等环节。',
    tasks: [
      { name: '物料采购', assignee: '张三', startDate: '2024-01-15', endDate: '2024-01-25', progress: 100, status: 'completed' },
      { name: '生产准备', assignee: '李四', startDate: '2024-01-20', endDate: '2024-01-30', progress: 100, status: 'completed' },
      { name: '批量生产', assignee: '王五', startDate: '2024-02-01', endDate: '2024-03-10', progress: 60, status: 'in_progress' },
      { name: '质量检测', assignee: '赵六', startDate: '2024-03-05', endDate: '2024-03-15', progress: 20, status: 'planning' }
    ]
  },
  {
    id: 2,
    name: '传感器模块小批量试产',
    product: '传感器模块 A1',
    quantity: 100,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    progress: 90,
    status: 'in_progress',
    priority: 'medium',
    description: '传感器模块A1的小批量试产计划，验证生产工艺和产品质量。',
    tasks: [
      { name: '工艺验证', assignee: '钱七', startDate: '2024-02-01', endDate: '2024-02-10', progress: 100, status: 'completed' },
      { name: '试产准备', assignee: '孙八', startDate: '2024-02-08', endDate: '2024-02-15', progress: 100, status: 'completed' },
      { name: '小批量生产', assignee: '周九', startDate: '2024-02-15', endDate: '2024-02-25', progress: 95, status: 'in_progress' },
      { name: '数据分析', assignee: '吴十', startDate: '2024-02-25', endDate: '2024-02-28', progress: 30, status: 'in_progress' }
    ]
  },
  {
    id: 3,
    name: '执行器单元定制生产',
    product: '执行器单元 B3',
    quantity: 50,
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    progress: 100,
    status: 'completed',
    priority: 'high',
    description: '执行器单元B3的定制生产计划，满足特殊客户需求。',
    tasks: [
      { name: '需求分析', assignee: '郑一', startDate: '2024-01-10', endDate: '2024-01-15', progress: 100, status: 'completed' },
      { name: '设计优化', assignee: '王二', startDate: '2024-01-15', endDate: '2024-01-20', progress: 100, status: 'completed' },
      { name: '定制生产', assignee: '张三', startDate: '2024-01-20', endDate: '2024-02-05', progress: 100, status: 'completed' },
      { name: '交付验收', assignee: '李四', startDate: '2024-02-05', endDate: '2024-02-10', progress: 100, status: 'completed' }
    ]
  }
])

// 计算属性
const filteredPlans = computed(() => {
  return plans.value.filter(plan => {
    const matchesSearch = !searchKeyword.value || 
      plan.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      plan.product.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || plan.status === statusFilter.value
    const matchesPriority = !priorityFilter.value || plan.priority === priorityFilter.value
    
    return matchesSearch && matchesStatus && matchesPriority
  })
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const handleViewChange = (tab) => {
  if (tab.name === 'gantt') {
    nextTick(() => {
      initGanttChart()
    })
  }
}

const getStatusType = (status) => {
  const types = {
    planning: '',
    in_progress: 'warning',
    completed: 'success',
    delayed: 'danger'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    planning: '计划中',
    in_progress: '进行中',
    completed: '已完成',
    delayed: '已延期'
  }
  return texts[status] || status
}

const getPriorityType = (priority) => {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || ''
}

const getPriorityText = (priority) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[priority] || priority
}

const getPlansForDate = (date) => {
  return plans.value.filter(plan => {
    const startDate = new Date(plan.startDate)
    const endDate = new Date(plan.endDate)
    const currentDate = new Date(date)
    return currentDate >= startDate && currentDate <= endDate
  })
}

const viewPlanDetail = (plan) => {
  selectedPlan.value = plan
  showDetailDialog.value = true
  nextTick(() => {
    initResourceChart()
    initProgressChart()
  })
}

const editPlan = (plan) => {
  ElMessage.info('编辑功能开发中...')
}

const deletePlan = (plan) => {
  ElMessageBox.confirm(
    `确定要删除计划"${plan.name}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = plans.value.findIndex(p => p.id === plan.id)
    if (index > -1) {
      plans.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const createPlan = () => {
  createFormRef.value.validate((valid) => {
    if (valid) {
      const plan = {
        id: Date.now(),
        ...newPlan,
        progress: 0,
        status: 'planning',
        tasks: []
      }
      plans.value.unshift(plan)
      showCreateDialog.value = false
      resetNewPlan()
      ElMessage.success('计划创建成功')
    }
  })
}

const resetNewPlan = () => {
  Object.assign(newPlan, {
    name: '',
    product: '',
    quantity: 1,
    priority: 'medium',
    startDate: '',
    endDate: '',
    description: ''
  })
}

const handleCreateClose = () => {
  resetNewPlan()
  showCreateDialog.value = false
}

const handleDetailClose = () => {
  selectedPlan.value = null
  showDetailDialog.value = false
}

const addTask = () => {
  ElMessage.info('添加任务功能开发中...')
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

// 图表初始化
const ganttChart = ref(null)
const resourceChart = ref(null)
const progressChart = ref(null)

const initGanttChart = () => {
  if (!ganttChart.value) return
  
  const chart = echarts.init(ganttChart.value)
  const option = {
    title: {
      text: '制造计划甘特图',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    yAxis: {
      type: 'category',
      data: plans.value.map(plan => plan.name),
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    series: [{
      type: 'bar',
      data: plans.value.map(plan => [
        new Date(plan.startDate).getTime(),
        new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()
      ]),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#00e5ff' },
          { offset: 1, color: '#0080ff' }
        ])
      }
    }]
  }
  chart.setOption(option)
}

const initResourceChart = () => {
  if (!resourceChart.value) return
  
  const chart = echarts.init(resourceChart.value)
  const option = {
    title: {
      text: '资源分配情况',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 35, name: '人力资源' },
        { value: 25, name: '设备资源' },
        { value: 20, name: '物料资源' },
        { value: 20, name: '其他资源' }
      ],
      itemStyle: {
        color: (params) => {
          const colors = ['#00e5ff', '#0080ff', '#40a9ff', '#69c0ff']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  chart.setOption(option)
}

const initProgressChart = () => {
  if (!progressChart.value) return
  
  const chart = echarts.init(progressChart.value)
  const option = {
    title: {
      text: '进度跟踪',
      textStyle: { color: '#00e5ff' }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: '#0080ff' } },
      axisLabel: { color: '#00e5ff' }
    },
    series: [{
      name: '计划进度',
      type: 'line',
      data: [0, 15, 25, 40, 55, 65, 75, 85],
      lineStyle: { color: '#00e5ff' },
      itemStyle: { color: '#00e5ff' }
    }, {
      name: '实际进度',
      type: 'line',
      data: [0, 12, 28, 35, 50, 68, 75, 82],
      lineStyle: { color: '#0080ff' },
      itemStyle: { color: '#0080ff' }
    }]
  }
  chart.setOption(option)
}

onMounted(() => {
  // 组件挂载后的初始化
})
</script>

<style lang="scss" scoped>
.planning-container {
  padding: 20px;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
  min-height: 100vh;
  color: #ffffff;

  .planning-overview {
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

  .planning-toolbar {
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

  .view-tabs {
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

    .planning-list {
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

    .gantt-view {
      .gantt-chart {
        width: 100%;
        height: 400px;
        background: rgba(0, 229, 255, 0.05);
        border-radius: 8px;
      }
    }

    .calendar-view {
      :deep(.el-calendar) {
        background: transparent;

        .el-calendar__header {
          color: #ffffff;
          border-color: rgba(0, 229, 255, 0.3);
        }

        .el-calendar__body {
          .el-calendar-table {
            .el-calendar-day {
              border-color: rgba(0, 229, 255, 0.2);
              
              &:hover {
                background: rgba(0, 229, 255, 0.1);
              }
            }
          }
        }
      }

      .calendar-cell {
        .date {
          color: #ffffff;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .plans {
          .plan-item {
            font-size: 10px;
            padding: 2px 4px;
            border-radius: 4px;
            margin-bottom: 2px;
            
            &.planning {
              background: rgba(255, 255, 255, 0.2);
            }
            
            &.in_progress {
              background: rgba(255, 193, 7, 0.3);
            }
            
            &.completed {
              background: rgba(40, 167, 69, 0.3);
            }
            
            &.delayed {
              background: rgba(220, 53, 69, 0.3);
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

  .plan-detail {
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

    .tasks-breakdown {
      .tasks-toolbar {
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

    .resource-allocation {
      .resource-chart {
        width: 100%;
        height: 300px;
        background: rgba(0, 229, 255, 0.05);
        border-radius: 8px;
      }
    }

    .progress-tracking {
      .progress-chart {
        width: 100%;
        height: 300px;
        background: rgba(0, 229, 255, 0.05);
        border-radius: 8px;
      }
    }
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
</style>
