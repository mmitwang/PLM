<template>
  <div class="engineering-workflow">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">工程工作流程</h1>
      <p class="page-subtitle">管理产品开发工作流程、任务分配和进度跟踪</p>
    </div>

    <!-- 工作流概览 -->
    <div class="workflow-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Operation /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ workflowStats.total }}</h3>
              <p>总工作流</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ workflowStats.running }}</h3>
              <p>运行中</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ workflowStats.completed }}</h3>
              <p>已完成</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ workflowStats.delayed }}</h3>
              <p>延期任务</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 工作流管理工具栏 -->
    <div class="workflow-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建工作流
        </el-button>
        <el-button @click="showTemplateDialog = true">
          <el-icon><Document /></el-icon>
          工作流模板
        </el-button>
        <el-button @click="exportWorkflows">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px">
          <el-option label="全部" value=""></el-option>
          <el-option label="草稿" value="draft"></el-option>
          <el-option label="运行中" value="running"></el-option>
          <el-option label="暂停" value="paused"></el-option>
          <el-option label="已完成" value="completed"></el-option>
          <el-option label="已取消" value="cancelled"></el-option>
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索工作流..."
          style="width: 200px; margin-left: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 工作流列表 -->
    <div class="workflow-list">
      <el-table
        :data="filteredWorkflows"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="工作流名称" min-width="200">
          <template #default="scope">
            <el-link type="primary" @click="viewWorkflow(scope.row)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="scope">
            <el-progress :percentage="scope.row.progress" :stroke-width="8" :show-text="false"></el-progress>
            <span style="margin-left: 10px; color: #00e5ff;">{{ scope.row.progress }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="负责人" width="100"></el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="120"></el-table-column>
        <el-table-column prop="endTime" label="预计完成" width="120"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewWorkflow(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editWorkflow(scope.row)" v-if="scope.row.status === 'draft'">编辑</el-button>
            <el-dropdown @command="handleWorkflowAction">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'start', row: scope.row}" v-if="scope.row.status === 'draft'">启动</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'pause', row: scope.row}" v-if="scope.row.status === 'running'">暂停</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'resume', row: scope.row}" v-if="scope.row.status === 'paused'">恢复</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'cancel', row: scope.row}" v-if="['draft', 'running', 'paused'].includes(scope.row.status)">取消</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'delete', row: scope.row}" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 工作流图表 -->
    <div class="workflow-charts">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <h3>工作流状态分布</h3>
            <div class="status-chart" ref="statusChart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h3>任务完成趋势</h3>
            <div class="trend-chart" ref="trendChart"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 创建工作流对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建工作流"
      width="800px"
      :before-close="handleCreateDialogClose"
    >
      <el-form :model="newWorkflow" :rules="workflowRules" ref="workflowForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工作流名称" prop="name">
              <el-input v-model="newWorkflow.name" placeholder="请输入工作流名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作流类型" prop="type">
              <el-select v-model="newWorkflow.type" placeholder="选择工作流类型" style="width: 100%">
                <el-option label="产品开发" value="development"></el-option>
                <el-option label="设计评审" value="review"></el-option>
                <el-option label="测试验证" value="testing"></el-option>
                <el-option label="生产准备" value="production"></el-option>
                <el-option label="质量控制" value="quality"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="assignee">
              <el-select v-model="newWorkflow.assignee" placeholder="选择负责人" style="width: 100%">
                <el-option label="张工程师" value="zhang"></el-option>
                <el-option label="李工程师" value="li"></el-option>
                <el-option label="王工程师" value="wang"></el-option>
                <el-option label="陈工程师" value="chen"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计完成时间" prop="endTime">
              <el-date-picker
                v-model="newWorkflow.endTime"
                type="date"
                placeholder="选择完成时间"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="工作流描述" prop="description">
          <el-input
            v-model="newWorkflow.description"
            type="textarea"
            :rows="4"
            placeholder="请描述工作流的目标和要求"
          ></el-input>
        </el-form-item>
        <el-form-item label="任务步骤">
          <div class="task-steps">
            <div v-for="(step, index) in newWorkflow.steps" :key="index" class="step-item">
              <el-input v-model="step.name" placeholder="步骤名称" style="width: 200px; margin-right: 10px;"></el-input>
              <el-input v-model="step.description" placeholder="步骤描述" style="width: 300px; margin-right: 10px;"></el-input>
              <el-button @click="removeStep(index)" type="danger" size="small">删除</el-button>
            </div>
            <el-button @click="addStep" type="primary" size="small">添加步骤</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button @click="saveAsDraft">保存草稿</el-button>
          <el-button type="primary" @click="createWorkflow">创建并启动</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 工作流详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="工作流详情"
      width="900px"
    >
      <div v-if="selectedWorkflow" class="workflow-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工作流名称">{{ selectedWorkflow.name }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getTypeTagType(selectedWorkflow.type)">
              {{ getTypeText(selectedWorkflow.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedWorkflow.status)">
              {{ getStatusText(selectedWorkflow.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress :percentage="selectedWorkflow.progress" :stroke-width="8"></el-progress>
          </el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedWorkflow.assignee }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ selectedWorkflow.startTime }}</el-descriptions-item>
          <el-descriptions-item label="预计完成">{{ selectedWorkflow.endTime }}</el-descriptions-item>
          <el-descriptions-item label="实际完成">{{ selectedWorkflow.actualEndTime || '未完成' }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px;">工作流描述</h4>
        <p>{{ selectedWorkflow.description }}</p>
        
        <h4 style="margin-top: 20px;">任务步骤</h4>
        <el-steps :active="selectedWorkflow.currentStep" direction="vertical">
          <el-step
            v-for="(step, index) in selectedWorkflow.steps"
            :key="index"
            :title="step.name"
            :description="step.description"
            :status="getStepStatus(index, selectedWorkflow.currentStep)"
          ></el-step>
        </el-steps>
        
        <h4 style="margin-top: 20px;">执行记录</h4>
        <el-timeline>
          <el-timeline-item
            v-for="record in selectedWorkflow.records"
            :key="record.id"
            :timestamp="record.time"
            :type="record.type"
          >
            <strong>{{ record.operator }}</strong> - {{ record.action }}
            <p v-if="record.comment">{{ record.comment }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 工作流模板对话框 -->
    <el-dialog
      v-model="showTemplateDialog"
      title="工作流模板"
      width="700px"
    >
      <div class="template-list">
        <el-row :gutter="20">
          <el-col :span="12" v-for="template in workflowTemplates" :key="template.id">
            <div class="template-card" @click="useTemplate(template)">
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
              <div class="template-meta">
                <span>{{ template.steps.length }} 个步骤</span>
                <span>{{ template.estimatedDays }} 天</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Operation, Check, Clock, Warning, Plus, Document, Download, Search, ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const searchKeyword = ref('')
const filterStatus = ref('')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const showTemplateDialog = ref(false)
const selectedWorkflows = ref([])
const selectedWorkflow = ref(null)
const statusChart = ref(null)
const trendChart = ref(null)
const workflowForm = ref(null)

// 工作流统计数据
const workflowStats = reactive({
  total: 45,
  running: 12,
  completed: 28,
  delayed: 5
})

// 新工作流表单数据
const newWorkflow = reactive({
  name: '',
  type: '',
  assignee: '',
  endTime: '',
  description: '',
  steps: [
    { name: '', description: '' }
  ]
})

// 表单验证规则
const workflowRules = {
  name: [
    { required: true, message: '请输入工作流名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择工作流类型', trigger: 'change' }
  ],
  assignee: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择预计完成时间', trigger: 'change' }
  ]
}

// 工作流数据
const workflows = ref([
  {
    id: 1,
    name: '新产品开发流程',
    type: 'development',
    status: 'running',
    progress: 65,
    assignee: '张工程师',
    startTime: '2024-01-10',
    endTime: '2024-02-10',
    actualEndTime: '',
    description: '新产品从概念设计到量产的完整开发流程',
    currentStep: 2,
    steps: [
      { name: '需求分析', description: '分析市场需求和技术要求' },
      { name: '概念设计', description: '制定产品概念和初步设计方案' },
      { name: '详细设计', description: '完成产品详细设计和工程图纸' },
      { name: '原型制作', description: '制作产品原型并进行测试' },
      { name: '量产准备', description: '准备量产工艺和生产线' }
    ],
    records: [
      { id: 1, time: '2024-01-10', type: 'success', operator: '张工程师', action: '启动工作流' },
      { id: 2, time: '2024-01-15', type: 'primary', operator: '张工程师', action: '完成需求分析', comment: '需求文档已确认' },
      { id: 3, time: '2024-01-20', type: 'primary', operator: '张工程师', action: '开始概念设计' }
    ]
  },
  {
    id: 2,
    name: '设计评审流程',
    type: 'review',
    status: 'completed',
    progress: 100,
    assignee: '李工程师',
    startTime: '2024-01-05',
    endTime: '2024-01-15',
    actualEndTime: '2024-01-14',
    description: '产品设计方案的多轮评审流程',
    currentStep: 3,
    steps: [
      { name: '初步评审', description: '对设计方案进行初步评审' },
      { name: '专家评审', description: '邀请专家对设计进行深度评审' },
      { name: '最终确认', description: '确认最终设计方案' }
    ],
    records: [
      { id: 1, time: '2024-01-05', type: 'success', operator: '李工程师', action: '启动评审流程' },
      { id: 2, time: '2024-01-08', type: 'primary', operator: '评审委员会', action: '完成初步评审' },
      { id: 3, time: '2024-01-12', type: 'primary', operator: '专家组', action: '完成专家评审' },
      { id: 4, time: '2024-01-14', type: 'success', operator: '李工程师', action: '评审流程完成' }
    ]
  },
  {
    id: 3,
    name: '产品测试验证',
    type: 'testing',
    status: 'paused',
    progress: 40,
    assignee: '王工程师',
    startTime: '2024-01-12',
    endTime: '2024-01-25',
    actualEndTime: '',
    description: '产品功能和性能的全面测试验证',
    currentStep: 1,
    steps: [
      { name: '功能测试', description: '验证产品各项功能是否正常' },
      { name: '性能测试', description: '测试产品性能指标' },
      { name: '可靠性测试', description: '进行产品可靠性和耐久性测试' },
      { name: '测试报告', description: '编写测试报告和结论' }
    ],
    records: [
      { id: 1, time: '2024-01-12', type: 'success', operator: '王工程师', action: '启动测试流程' },
      { id: 2, time: '2024-01-16', type: 'warning', operator: '王工程师', action: '暂停测试', comment: '等待测试设备到位' }
    ]
  }
])

// 工作流模板
const workflowTemplates = ref([
  {
    id: 1,
    name: '标准产品开发',
    description: '适用于常规产品开发的标准流程',
    estimatedDays: 30,
    steps: [
      { name: '需求分析', description: '分析产品需求' },
      { name: '设计开发', description: '产品设计开发' },
      { name: '测试验证', description: '产品测试验证' },
      { name: '量产准备', description: '准备量产' }
    ]
  },
  {
    id: 2,
    name: '快速原型开发',
    description: '适用于快速原型制作和验证',
    estimatedDays: 15,
    steps: [
      { name: '概念设计', description: '快速概念设计' },
      { name: '原型制作', description: '制作原型' },
      { name: '功能验证', description: '验证核心功能' }
    ]
  },
  {
    id: 3,
    name: '设计变更流程',
    description: '适用于产品设计变更管理',
    estimatedDays: 10,
    steps: [
      { name: '变更申请', description: '提交变更申请' },
      { name: '影响评估', description: '评估变更影响' },
      { name: '变更实施', description: '实施设计变更' },
      { name: '验证确认', description: '验证变更效果' }
    ]
  }
])

// 计算属性
const filteredWorkflows = computed(() => {
  let result = workflows.value
  
  if (filterStatus.value) {
    result = result.filter(workflow => workflow.status === filterStatus.value)
  }
  
  if (searchKeyword.value) {
    result = result.filter(workflow => 
      workflow.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  return result
})

// 方法
const getTypeTagType = (type) => {
  const typeMap = {
    'development': 'primary',
    'review': 'success',
    'testing': 'warning',
    'production': 'info',
    'quality': 'danger'
  }
  return typeMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    'development': '产品开发',
    'review': '设计评审',
    'testing': '测试验证',
    'production': '生产准备',
    'quality': '质量控制'
  }
  return textMap[type] || '未知'
}

const getStatusTagType = (status) => {
  const typeMap = {
    'draft': 'info',
    'running': 'primary',
    'paused': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'draft': '草稿',
    'running': '运行中',
    'paused': '暂停',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || '未知'
}

const getStepStatus = (stepIndex, currentStep) => {
  if (stepIndex < currentStep) return 'finish'
  if (stepIndex === currentStep) return 'process'
  return 'wait'
}

const handleSelectionChange = (selection) => {
  selectedWorkflows.value = selection
}

const viewWorkflow = (workflow) => {
  selectedWorkflow.value = workflow
  showDetailDialog.value = true
}

const editWorkflow = (workflow) => {
  ElMessage.info('编辑工作流功能开发中...')
}

const handleWorkflowAction = ({ action, row }) => {
  switch (action) {
    case 'start':
      startWorkflow(row)
      break
    case 'pause':
      pauseWorkflow(row)
      break
    case 'resume':
      resumeWorkflow(row)
      break
    case 'cancel':
      cancelWorkflow(row)
      break
    case 'delete':
      deleteWorkflow(row)
      break
  }
}

const startWorkflow = (workflow) => {
  workflow.status = 'running'
  workflow.startTime = new Date().toISOString().split('T')[0]
  workflow.records.push({
    id: workflow.records.length + 1,
    time: new Date().toISOString().split('T')[0],
    type: 'success',
    operator: '当前用户',
    action: '启动工作流'
  })
  ElMessage.success('工作流已启动')
}

const pauseWorkflow = (workflow) => {
  workflow.status = 'paused'
  workflow.records.push({
    id: workflow.records.length + 1,
    time: new Date().toISOString().split('T')[0],
    type: 'warning',
    operator: '当前用户',
    action: '暂停工作流'
  })
  ElMessage.success('工作流已暂停')
}

const resumeWorkflow = (workflow) => {
  workflow.status = 'running'
  workflow.records.push({
    id: workflow.records.length + 1,
    time: new Date().toISOString().split('T')[0],
    type: 'primary',
    operator: '当前用户',
    action: '恢复工作流'
  })
  ElMessage.success('工作流已恢复')
}

const cancelWorkflow = (workflow) => {
  ElMessageBox.confirm(
    `确定要取消工作流 "${workflow.name}" 吗？`,
    '确认取消',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    workflow.status = 'cancelled'
    workflow.records.push({
      id: workflow.records.length + 1,
      time: new Date().toISOString().split('T')[0],
      type: 'danger',
      operator: '当前用户',
      action: '取消工作流'
    })
    ElMessage.success('工作流已取消')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const deleteWorkflow = (workflow) => {
  ElMessageBox.confirm(
    `确定要删除工作流 "${workflow.name}" 吗？此操作不可恢复！`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = workflows.value.findIndex(w => w.id === workflow.id)
    if (index > -1) {
      workflows.value.splice(index, 1)
      ElMessage.success('工作流删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const exportWorkflows = () => {
  ElMessage.info('导出功能开发中...')
}

const handleCreateDialogClose = (done) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的数据将丢失。')
    .then(() => {
      resetNewWorkflow()
      done()
    })
    .catch(() => {})
}

const resetNewWorkflow = () => {
  Object.assign(newWorkflow, {
    name: '',
    type: '',
    assignee: '',
    endTime: '',
    description: '',
    steps: [{ name: '', description: '' }]
  })
}

const addStep = () => {
  newWorkflow.steps.push({ name: '', description: '' })
}

const removeStep = (index) => {
  if (newWorkflow.steps.length > 1) {
    newWorkflow.steps.splice(index, 1)
  }
}

const saveAsDraft = () => {
  workflowForm.value.validate((valid) => {
    if (valid) {
      const workflow = {
        id: Date.now(),
        name: newWorkflow.name,
        type: newWorkflow.type,
        status: 'draft',
        progress: 0,
        assignee: newWorkflow.assignee,
        startTime: '',
        endTime: newWorkflow.endTime,
        actualEndTime: '',
        description: newWorkflow.description,
        currentStep: 0,
        steps: [...newWorkflow.steps],
        records: [
          {
            id: 1,
            time: new Date().toISOString().split('T')[0],
            type: 'info',
            operator: '当前用户',
            action: '创建工作流草稿'
          }
        ]
      }
      workflows.value.push(workflow)
      ElMessage.success('工作流草稿保存成功')
      showCreateDialog.value = false
      resetNewWorkflow()
    }
  })
}

const createWorkflow = () => {
  workflowForm.value.validate((valid) => {
    if (valid) {
      const workflow = {
        id: Date.now(),
        name: newWorkflow.name,
        type: newWorkflow.type,
        status: 'running',
        progress: 0,
        assignee: newWorkflow.assignee,
        startTime: new Date().toISOString().split('T')[0],
        endTime: newWorkflow.endTime,
        actualEndTime: '',
        description: newWorkflow.description,
        currentStep: 0,
        steps: [...newWorkflow.steps],
        records: [
          {
            id: 1,
            time: new Date().toISOString().split('T')[0],
            type: 'success',
            operator: '当前用户',
            action: '创建并启动工作流'
          }
        ]
      }
      workflows.value.push(workflow)
      ElMessage.success('工作流创建并启动成功')
      showCreateDialog.value = false
      resetNewWorkflow()
    }
  })
}

const useTemplate = (template) => {
  Object.assign(newWorkflow, {
    name: template.name,
    type: 'development',
    assignee: '',
    endTime: '',
    description: template.description,
    steps: [...template.steps]
  })
  showTemplateDialog.value = false
  showCreateDialog.value = true
}

const initCharts = () => {
  nextTick(() => {
    // 状态分布图表
    if (statusChart.value) {
      const statusChartInstance = echarts.init(statusChart.value)
      const statusOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00e5ff',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#ffffff'
          }
        },
        series: [
          {
            name: '工作流状态',
            type: 'pie',
            radius: '50%',
            data: [
              { value: workflowStats.running, name: '运行中' },
              { value: workflowStats.completed, name: '已完成' },
              { value: workflowStats.delayed, name: '延期' },
              { value: workflowStats.total - workflowStats.running - workflowStats.completed - workflowStats.delayed, name: '其他' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 229, 255, 0.5)'
              }
            },
            itemStyle: {
              borderColor: '#00e5ff',
              borderWidth: 1
            }
          }
        ]
      }
      statusChartInstance.setOption(statusOption)
    }

    // 趋势图表
    if (trendChart.value) {
      const trendChartInstance = echarts.init(trendChart.value)
      const trendOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#00e5ff',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          data: ['完成任务', '新增任务'],
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#00e5ff'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(0, 229, 255, 0.2)'
            }
          }
        },
        series: [
          {
            name: '完成任务',
            type: 'line',
            stack: 'Total',
            data: [12, 13, 10, 13, 9, 23, 21],
            lineStyle: {
              color: '#00e5ff'
            },
            itemStyle: {
              color: '#00e5ff'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(0, 229, 255, 0.3)'
                }, {
                  offset: 1, color: 'rgba(0, 229, 255, 0.1)'
                }]
              }
            }
          },
          {
            name: '新增任务',
            type: 'line',
            stack: 'Total',
            data: [22, 18, 19, 23, 29, 33, 31],
            lineStyle: {
              color: '#0080ff'
            },
            itemStyle: {
              color: '#0080ff'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(0, 128, 255, 0.3)'
                }, {
                  offset: 1, color: 'rgba(0, 128, 255, 0.1)'
                }]
              }
            }
          }
        ]
      }
      trendChartInstance.setOption(trendOption)
    }
  })
}

// 生命周期钩子
onMounted(() => {
  initCharts()
})
</script>

<style lang="scss" scoped>
.engineering-workflow {
  padding: 20px;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
  min-height: 100vh;
  color: #ffffff;

  .page-header {
    margin-bottom: 30px;
    text-align: center;
    
    .page-title {
      font-size: 32px;
      font-weight: 600;
      color: #00e5ff;
      margin-bottom: 10px;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
    }
    
    .page-subtitle {
      font-size: 16px;
      color: #b0bec5;
      margin: 0;
    }
  }

  .workflow-overview {
    margin-bottom: 30px;
    
    .overview-card {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 229, 255, 0.3);
        border-color: #00e5ff;
      }
      
      .card-icon {
        font-size: 32px;
        color: #00e5ff;
        margin-bottom: 15px;
      }
      
      .card-content {
        h3 {
          font-size: 28px;
          font-weight: 600;
          color: #00e5ff;
          margin: 0 0 5px 0;
        }
        
        p {
          font-size: 14px;
          color: #b0bec5;
          margin: 0;
        }
      }
    }
  }

  .workflow-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    
    .toolbar-left {
      display: flex;
      gap: 10px;
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
    }
  }

  .workflow-list {
    margin-bottom: 30px;
    
    :deep(.el-table) {
      background: rgba(0, 229, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      
      .el-table__header {
        background: rgba(0, 229, 255, 0.1);
        
        th {
          background: transparent;
          border-bottom: 1px solid rgba(0, 229, 255, 0.3);
          color: #00e5ff;
          font-weight: 600;
        }
      }
      
      .el-table__body {
        tr {
          background: transparent;
          
          &:hover {
            background: rgba(0, 229, 255, 0.1);
          }
          
          td {
            border-bottom: 1px solid rgba(0, 229, 255, 0.1);
            color: #ffffff;
          }
        }
      }
    }
  }

  .workflow-charts {
    .chart-container {
      background: rgba(0, 229, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 12px;
      padding: 20px;
      backdrop-filter: blur(10px);
      
      h3 {
        color: #00e5ff;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .status-chart,
      .trend-chart {
        height: 300px;
      }
    }
  }

  .workflow-detail {
    :deep(.el-descriptions) {
      .el-descriptions__header {
        .el-descriptions__title {
          color: #00e5ff;
        }
      }
      
      .el-descriptions__body {
        .el-descriptions__table {
          border-color: rgba(0, 229, 255, 0.3);
          
          .el-descriptions__cell {
            border-color: rgba(0, 229, 255, 0.2);
            
            .el-descriptions__label {
              background: rgba(0, 229, 255, 0.1);
              color: #00e5ff;
            }
            
            .el-descriptions__content {
              color: #ffffff;
            }
          }
        }
      }
    }
    
    h4 {
      color: #00e5ff;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    p {
      color: #b0bec5;
      line-height: 1.6;
    }
  }

  .template-list {
    .template-card {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 229, 255, 0.3);
        border-color: #00e5ff;
      }
      
      h4 {
        color: #00e5ff;
        margin-bottom: 10px;
      }
      
      p {
        color: #b0bec5;
        margin-bottom: 15px;
        line-height: 1.5;
      }
      
      .template-meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #78909c;
      }
    }
  }

  .task-steps {
    .step-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }

  // 全息扫描动效
  .hologram-scan {
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.4), transparent);
      animation: hologramScan 1s ease-in-out;
      z-index: 1;
    }
  }

  @keyframes hologramScan {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  // Element Plus 组件样式覆盖
  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #00e5ff, #0080ff);
    border-color: #00e5ff;
    
    &:hover {
      background: linear-gradient(135deg, #00b8cc, #0066cc);
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
    }
  }

  :deep(.el-input__wrapper) {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    
    &:hover {
      border-color: #00e5ff;
    }
    
    &.is-focus {
      border-color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }
    
    .el-input__inner {
      color: #ffffff;
      
      &::placeholder {
        color: #78909c;
      }
    }
  }

  :deep(.el-select) {
    .el-input__wrapper {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
    }
  }

  :deep(.el-textarea__inner) {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #ffffff;
    
    &::placeholder {
      color: #78909c;
    }
    
    &:hover {
      border-color: #00e5ff;
    }
    
    &:focus {
      border-color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }
  }

  :deep(.el-dialog) {
    background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
    border: 1px solid rgba(0, 229, 255, 0.3);
    
    .el-dialog__header {
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      
      .el-dialog__title {
        color: #00e5ff;
      }
    }
    
    .el-dialog__body {
      color: #ffffff;
    }
  }

  :deep(.el-progress-bar__outer) {
    background: rgba(0, 229, 255, 0.2);
    
    .el-progress-bar__inner {
      background: linear-gradient(90deg, #00e5ff, #0080ff);
    }
  }

  :deep(.el-tag) {
    background: rgba(0, 229, 255, 0.2);
    border-color: rgba(0, 229, 255, 0.5);
    color: #00e5ff;
  }

  :deep(.el-steps) {
    .el-step__head {
      .el-step__icon {
        border-color: rgba(0, 229, 255, 0.5);
        color: #00e5ff;
        
        &.is-text {
          background: rgba(0, 229, 255, 0.2);
        }
      }
      
      &.is-process .el-step__icon {
        background: #00e5ff;
        border-color: #00e5ff;
        color: #0a1929;
      }
      
      &.is-finish .el-step__icon {
        background: #00e5ff;
        border-color: #00e5ff;
      }
    }
    
    .el-step__title {
      color: #ffffff;
      
      &.is-process {
        color: #00e5ff;
      }
    }
    
    .el-step__description {
      color: #b0bec5;
    }
    
    .el-step__line {
      background: rgba(0, 229, 255, 0.3);
    }
  }

  :deep(.el-timeline) {
    .el-timeline-item__timestamp {
      color: #b0bec5;
    }
    
    .el-timeline-item__wrapper {
      .el-timeline-item__tail {
        border-left-color: rgba(0, 229, 255, 0.3);
      }
      
      .el-timeline-item__node {
        background: #00e5ff;
        border-color: #00e5ff;
        
        &.el-timeline-item__node--primary {
          background: #0080ff;
          border-color: #0080ff;
        }
        
        &.el-timeline-item__node--success {
          background: #4caf50;
          border-color: #4caf50;
        }
        
        &.el-timeline-item__node--warning {
          background: #ff9800;
          border-color: #ff9800;
        }
        
        &.el-timeline-item__node--danger {
          background: #f44336;
          border-color: #f44336;
        }
      }
      
      .el-timeline-item__content {
        color: #ffffff;
        
        p {
          color: #b0bec5;
          margin-top: 5px;
        }
      }
    }
  }
}
</style>
