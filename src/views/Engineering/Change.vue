<template>
  <div class="engineering-change">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">工程变更管理</h1>
      <p class="page-subtitle">管理产品工程变更请求、审批流程和变更实施</p>
    </div>

    <!-- 变更概览 -->
    <div class="change-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ changeStats.total }}</h3>
              <p>总变更数</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ changeStats.pending }}</h3>
              <p>待审批</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ changeStats.approved }}</h3>
              <p>已批准</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ changeStats.rejected }}</h3>
              <p>已拒绝</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 变更管理工具栏 -->
    <div class="change-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建变更请求
        </el-button>
        <el-button @click="batchApprove">
          <el-icon><Check /></el-icon>
          批量审批
        </el-button>
        <el-button @click="exportChanges">
          <el-icon><Download /></el-icon>
          导出变更
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px">
          <el-option label="全部" value=""></el-option>
          <el-option label="草稿" value="draft"></el-option>
          <el-option label="待审批" value="pending"></el-option>
          <el-option label="已批准" value="approved"></el-option>
          <el-option label="已拒绝" value="rejected"></el-option>
          <el-option label="已实施" value="implemented"></el-option>
        </el-select>
        <el-select v-model="filterPriority" placeholder="优先级筛选" style="width: 120px; margin-left: 10px">
          <el-option label="全部" value=""></el-option>
          <el-option label="紧急" value="urgent"></el-option>
          <el-option label="高" value="high"></el-option>
          <el-option label="中" value="medium"></el-option>
          <el-option label="低" value="low"></el-option>
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索变更..."
          style="width: 200px; margin-left: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 变更列表 -->
    <div class="change-list">
      <el-table
        :data="filteredChanges"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="变更编号" width="120">
          <template #default="scope">
            <el-link type="primary" @click="viewChange(scope.row)">
              {{ scope.row.id }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="变更标题" min-width="200"></el-table-column>
        <el-table-column prop="type" label="变更类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="scope">
            <el-tag :type="getPriorityTagType(scope.row.priority)">
              {{ getPriorityText(scope.row.priority) }}
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
        <el-table-column prop="requester" label="申请人" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewChange(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editChange(scope.row)" v-if="scope.row.status === 'draft'">编辑</el-button>
            <el-dropdown @command="handleChangeAction">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'approve', row: scope.row}" v-if="scope.row.status === 'pending'">批准</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'reject', row: scope.row}" v-if="scope.row.status === 'pending'">拒绝</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'implement', row: scope.row}" v-if="scope.row.status === 'approved'">实施</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'delete', row: scope.row}" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 变更统计图表 -->
    <div class="change-charts">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <h3>变更状态分布</h3>
            <div class="status-chart" ref="statusChart"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h3>变更趋势分析</h3>
            <div class="trend-chart" ref="trendChart"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 创建变更请求对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建变更请求"
      width="800px"
      :before-close="handleCreateDialogClose"
    >
      <el-form :model="newChange" :rules="changeRules" ref="changeForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="变更标题" prop="title">
              <el-input v-model="newChange.title" placeholder="请输入变更标题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="变更类型" prop="type">
              <el-select v-model="newChange.type" placeholder="选择变更类型" style="width: 100%">
                <el-option label="设计变更" value="design"></el-option>
                <el-option label="工艺变更" value="process"></el-option>
                <el-option label="材料变更" value="material"></el-option>
                <el-option label="规格变更" value="specification"></el-option>
                <el-option label="其他变更" value="other"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="newChange.priority" placeholder="选择优先级" style="width: 100%">
                <el-option label="紧急" value="urgent"></el-option>
                <el-option label="高" value="high"></el-option>
                <el-option label="中" value="medium"></el-option>
                <el-option label="低" value="low"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="影响产品" prop="affectedProducts">
              <el-select v-model="newChange.affectedProducts" multiple placeholder="选择影响的产品" style="width: 100%">
                <el-option label="产品A" value="product-a"></el-option>
                <el-option label="产品B" value="product-b"></el-option>
                <el-option label="产品C" value="product-c"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="变更原因" prop="reason">
          <el-input
            v-model="newChange.reason"
            type="textarea"
            :rows="3"
            placeholder="请详细描述变更原因"
          ></el-input>
        </el-form-item>
        <el-form-item label="变更描述" prop="description">
          <el-input
            v-model="newChange.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述变更内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="预期效果" prop="expectedResult">
          <el-input
            v-model="newChange.expectedResult"
            type="textarea"
            :rows="3"
            placeholder="请描述变更后的预期效果"
          ></el-input>
        </el-form-item>
        <el-form-item label="风险评估" prop="riskAssessment">
          <el-input
            v-model="newChange.riskAssessment"
            type="textarea"
            :rows="3"
            placeholder="请评估变更可能带来的风险"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button @click="saveAsDraft">保存草稿</el-button>
          <el-button type="primary" @click="submitChange">提交审批</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 变更详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="变更详情"
      width="900px"
    >
      <div v-if="selectedChange" class="change-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="变更编号">{{ selectedChange.id }}</el-descriptions-item>
          <el-descriptions-item label="变更标题">{{ selectedChange.title }}</el-descriptions-item>
          <el-descriptions-item label="变更类型">
            <el-tag :type="getTypeTagType(selectedChange.type)">
              {{ getTypeText(selectedChange.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(selectedChange.priority)">
              {{ getPriorityText(selectedChange.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedChange.status)">
              {{ getStatusText(selectedChange.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selectedChange.requester }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedChange.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ selectedChange.updateTime }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px;">变更原因</h4>
        <p>{{ selectedChange.reason }}</p>
        
        <h4 style="margin-top: 20px;">变更描述</h4>
        <p>{{ selectedChange.description }}</p>
        
        <h4 style="margin-top: 20px;">预期效果</h4>
        <p>{{ selectedChange.expectedResult }}</p>
        
        <h4 style="margin-top: 20px;">风险评估</h4>
        <p>{{ selectedChange.riskAssessment }}</p>
        
        <h4 style="margin-top: 20px;">审批流程</h4>
        <el-timeline>
          <el-timeline-item
            v-for="approval in selectedChange.approvals"
            :key="approval.id"
            :timestamp="approval.time"
            :type="approval.type"
          >
            <strong>{{ approval.approver }}</strong> - {{ approval.action }}
            <p v-if="approval.comment">{{ approval.comment }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Check, Clock, Warning, Plus, Download, Search, ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const searchKeyword = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const selectedChanges = ref([])
const selectedChange = ref(null)
const statusChart = ref(null)
const trendChart = ref(null)

// 变更统计数据
const changeStats = reactive({
  total: 156,
  pending: 23,
  approved: 89,
  rejected: 12
})

// 新变更表单数据
const newChange = reactive({
  title: '',
  type: '',
  priority: '',
  affectedProducts: [],
  reason: '',
  description: '',
  expectedResult: '',
  riskAssessment: ''
})

// 表单验证规则
const changeRules = {
  title: [
    { required: true, message: '请输入变更标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择变更类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入变更原因', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入变更描述', trigger: 'blur' }
  ]
}

// 变更数据
const changes = ref([
  {
    id: 'ECR-2024-001',
    title: '产品A外壳材料变更',
    type: 'material',
    priority: 'high',
    status: 'pending',
    requester: '张工程师',
    createTime: '2024-01-15',
    updateTime: '2024-01-16',
    reason: '原材料供应商停产，需要更换新的材料供应商',
    description: '将产品A外壳材料从ABS塑料更换为PC塑料，保持相同的机械性能',
    expectedResult: '确保产品质量不受影响，降低材料成本10%',
    riskAssessment: '需要重新进行材料测试，可能影响交付时间',
    approvals: [
      { id: 1, time: '2024-01-15', type: 'info', approver: '张工程师', action: '提交变更请求' }
    ]
  },
  {
    id: 'ECR-2024-002',
    title: '产品B工艺流程优化',
    type: 'process',
    priority: 'medium',
    status: 'approved',
    requester: '李工程师',
    createTime: '2024-01-10',
    updateTime: '2024-01-14',
    reason: '现有工艺流程效率低下，需要优化提升生产效率',
    description: '优化产品B的装配工艺，减少装配步骤，提高生产效率',
    expectedResult: '生产效率提升20%，降低人工成本',
    riskAssessment: '需要重新培训操作人员，短期内可能影响产量',
    approvals: [
      { id: 1, time: '2024-01-10', type: 'info', approver: '李工程师', action: '提交变更请求' },
      { id: 2, time: '2024-01-12', type: 'primary', approver: '王主管', action: '技术审批通过' },
      { id: 3, time: '2024-01-14', type: 'success', approver: '陈经理', action: '最终批准' }
    ]
  },
  {
    id: 'ECR-2024-003',
    title: '产品C规格参数调整',
    type: 'specification',
    priority: 'urgent',
    status: 'implemented',
    requester: '王工程师',
    createTime: '2024-01-08',
    updateTime: '2024-01-12',
    reason: '客户要求调整产品规格以满足新的应用场景',
    description: '调整产品C的电压规格从12V改为24V，相应调整相关电路设计',
    expectedResult: '满足客户新需求，扩大产品应用范围',
    riskAssessment: '需要重新设计电路板，增加开发成本',
    approvals: [
      { id: 1, time: '2024-01-08', type: 'info', approver: '王工程师', action: '提交变更请求' },
      { id: 2, time: '2024-01-09', type: 'success', approver: '紧急审批', action: '快速通道批准' },
      { id: 3, time: '2024-01-12', type: 'success', approver: '生产部', action: '变更实施完成' }
    ]
  },
  {
    id: 'ECR-2024-004',
    title: '产品D设计优化',
    type: 'design',
    priority: 'low',
    status: 'rejected',
    requester: '陈工程师',
    createTime: '2024-01-05',
    updateTime: '2024-01-07',
    reason: '优化产品外观设计，提升用户体验',
    description: '调整产品D的外观设计，增加圆角处理，改善手感',
    expectedResult: '提升产品美观度和用户满意度',
    riskAssessment: '需要重新开模，成本较高',
    approvals: [
      { id: 1, time: '2024-01-05', type: 'info', approver: '陈工程师', action: '提交变更请求' },
      { id: 2, time: '2024-01-07', type: 'danger', approver: '成本控制部', action: '成本过高，拒绝批准', comment: '当前阶段不适合进行此类变更，建议推迟到下一版本' }
    ]
  }
])

// 计算属性
const filteredChanges = computed(() => {
  let result = changes.value
  
  if (filterStatus.value) {
    result = result.filter(change => change.status === filterStatus.value)
  }
  
  if (filterPriority.value) {
    result = result.filter(change => change.priority === filterPriority.value)
  }
  
  if (searchKeyword.value) {
    result = result.filter(change => 
      change.id.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      change.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  return result
})

// 方法
const getTypeTagType = (type) => {
  const typeMap = {
    'design': 'primary',
    'process': 'success',
    'material': 'warning',
    'specification': 'info',
    'other': 'default'
  }
  return typeMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    'design': '设计变更',
    'process': '工艺变更',
    'material': '材料变更',
    'specification': '规格变更',
    'other': '其他变更'
  }
  return textMap[type] || '未知'
}

const getPriorityTagType = (priority) => {
  const typeMap = {
    'urgent': 'danger',
    'high': 'warning',
    'medium': 'primary',
    'low': 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const textMap = {
    'urgent': '紧急',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || '未知'
}

const getStatusTagType = (status) => {
  const typeMap = {
    'draft': 'info',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'implemented': 'primary'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'draft': '草稿',
    'pending': '待审批',
    'approved': '已批准',
    'rejected': '已拒绝',
    'implemented': '已实施'
  }
  return textMap[status] || '未知'
}

const handleSelectionChange = (selection) => {
  selectedChanges.value = selection
}

const viewChange = (change) => {
  selectedChange.value = change
  showDetailDialog.value = true
}

const editChange = (change) => {
  ElMessage.info('编辑变更功能开发中...')
}

const handleChangeAction = ({ action, row }) => {
  switch (action) {
    case 'approve':
      approveChange(row)
      break
    case 'reject':
      rejectChange(row)
      break
    case 'implement':
      implementChange(row)
      break
    case 'delete':
      deleteChange(row)
      break
  }
}

const approveChange = (change) => {
  ElMessageBox.confirm(
    `确定要批准变更 ${change.id} 吗？`,
    '确认批准',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    change.status = 'approved'
    change.updateTime = new Date().toISOString().split('T')[0]
    change.approvals.push({
      id: change.approvals.length + 1,
      time: new Date().toISOString().split('T')[0],
      type: 'success',
      approver: '当前用户',
      action: '批准变更'
    })
    ElMessage.success('变更批准成功')
  }).catch(() => {
    ElMessage.info('已取消批准')
  })
}

const rejectChange = (change) => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝变更', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入拒绝原因'
  }).then(({ value }) => {
    change.status = 'rejected'
    change.updateTime = new Date().toISOString().split('T')[0]
    change.approvals.push({
      id: change.approvals.length + 1,
      time: new Date().toISOString().split('T')[0],
      type: 'danger',
      approver: '当前用户',
      action: '拒绝变更',
      comment: value
    })
    ElMessage.success('变更已拒绝')
  }).catch(() => {
    ElMessage.info('已取消拒绝')
  })
}

const implementChange = (change) => {
  ElMessageBox.confirm(
    `确定要实施变更 ${change.id} 吗？`,
    '确认实施',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    change.status = 'implemented'
    change.updateTime = new Date().toISOString().split('T')[0]
    change.approvals.push({
      id: change.approvals.length + 1,
      time: new Date().toISOString().split('T')[0],
      type: 'success',
      approver: '当前用户',
      action: '变更实施完成'
    })
    ElMessage.success('变更实施成功')
  }).catch(() => {
    ElMessage.info('已取消实施')
  })
}

const deleteChange = (change) => {
  ElMessageBox.confirm(
    `确定要删除变更 ${change.id} 吗？此操作不可恢复！`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = changes.value.findIndex(c => c.id === change.id)
    if (index > -1) {
      changes.value.splice(index, 1)
      ElMessage.success('变更删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const batchApprove = () => {
  if (selectedChanges.value.length === 0) {
    ElMessage.warning('请选择要批准的变更')
    return
  }
  ElMessage.info('批量审批功能开发中...')
}

const exportChanges = () => {
  ElMessage.info('导出变更功能开发中...')
}

const handleCreateDialogClose = (done) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的数据将丢失。')
    .then(() => {
      resetNewChange()
      done()
    })
    .catch(() => {})
}

const resetNewChange = () => {
  Object.assign(newChange, {
    title: '',
    type: '',
    priority: '',
    affectedProducts: [],
    reason: '',
    description: '',
    expectedResult: '',
    riskAssessment: ''
  })
}

const saveAsDraft = () => {
  const change = {
    id: `ECR-${new Date().getFullYear()}-${String(changes.value.length + 1).padStart(3, '0')}`,
    title: newChange.title,
    type: newChange.type,
    priority: newChange.priority,
    status: 'draft',
    requester: '当前用户',
    createTime: new Date().toISOString().split('T')[0],
    updateTime: new Date().toISOString().split('T')[0],
    reason: newChange.reason,
    description: newChange.description,
    expectedResult: newChange.expectedResult,
    riskAssessment: newChange.riskAssessment,
    approvals: [
      { id: 1, time: new Date().toISOString().split('T')[0], type: 'info', approver: '当前用户', action: '保存草稿' }
    ]
  }
  
  changes.value.unshift(change)
  changeStats.total++
  
  ElMessage.success('变更草稿保存成功')
  showCreateDialog.value = false
  resetNewChange()
}

const submitChange = () => {
  const change = {
    id: `ECR-${new Date().getFullYear()}-${String(changes.value.length + 1).padStart(3, '0')}`,
    title: newChange.title,
    type: newChange.type,
    priority: newChange.priority,
    status: 'pending',
    requester: '当前用户',
    createTime: new Date().toISOString().split('T')[0],
    updateTime: new Date().toISOString().split('T')[0],
    reason: newChange.reason,
    description: newChange.description,
    expectedResult: newChange.expectedResult,
    riskAssessment: newChange.riskAssessment,
    approvals: [
      { id: 1, time: new Date().toISOString().split('T')[0], type: 'info', approver: '当前用户', action: '提交变更请求' }
    ]
  }
  
  changes.value.unshift(change)
  changeStats.total++
  changeStats.pending++
  
  ElMessage.success('变更请求提交成功')
  showCreateDialog.value = false
  resetNewChange()
}

const initStatusChart = () => {
  if (!statusChart.value) return
  
  const chart = echarts.init(statusChart.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: '#00e5ff',
      textStyle: {
        color: '#ffffff'
      }
    },
    series: [
      {
        name: '变更状态',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: changeStats.pending, name: '待审批' },
          { value: changeStats.approved, name: '已批准' },
          { value: changeStats.rejected, name: '已拒绝' },
          { value: 32, name: '已实施' }
        ],
        itemStyle: {
          borderRadius: 10,
          borderColor: '#0a1929',
          borderWidth: 2
        },
        label: {
          color: '#ffffff'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 229, 255, 0.5)'
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initTrendChart = () => {
  if (!trendChart.value) return
  
  const chart = echarts.init(trendChart.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: '#00e5ff',
      textStyle: {
        color: '#ffffff'
      }
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: {
        lineStyle: {
          color: '#0080ff'
        }
      },
      axisLabel: {
        color: '#ffffff'
      }
    },
    yAxis: {
      type: 'value',
      name: '变更数量',
      axisLine: {
        lineStyle: {
          color: '#0080ff'
        }
      },
      axisLabel: {
        color: '#ffffff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 128, 255, 0.2)'
        }
      }
    },
    series: [
      {
        name: '变更数量',
        type: 'line',
        data: [12, 19, 15, 23, 18, 25],
        lineStyle: {
          color: '#00e5ff',
          width: 3
        },
        itemStyle: {
          color: '#00e5ff',
          borderColor: '#ffffff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 229, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 229, 255, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initStatusChart()
    initTrendChart()
  })
})
</script>

<style lang="scss" scoped>
.engineering-change {
  padding: 20px;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
  min-height: 100vh;
  color: #ffffff;

  .page-header {
    margin-bottom: 30px;
    text-align: center;

    .page-title {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(45deg, #00e5ff, #0080ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
    }

    .page-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
  }

  .change-overview {
    margin-bottom: 30px;

    .overview-card {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.2), transparent);
        transition: left 1s ease;
      }

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 229, 255, 0.3);

        &::before {
          left: 100%;
        }
      }

      .card-icon {
        font-size: 32px;
        color: #00e5ff;
        margin-bottom: 15px;
      }

      .card-content {
        h3 {
          font-size: 28px;
          font-weight: bold;
          color: #00e5ff;
          margin: 0 0 5px 0;
        }

        p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      }
    }
  }

  .change-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;

    .toolbar-left {
      display: flex;
      gap: 10px;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
    }
  }

  .change-list {
    margin-bottom: 30px;
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;
    padding: 20px;
  }

  .change-charts {
    .chart-container {
      background: rgba(0, 229, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 8px;
      padding: 20px;

      h3 {
        color: #00e5ff;
        margin-bottom: 20px;
        font-size: 18px;
      }

      .status-chart,
      .trend-chart {
        height: 300px;
        width: 100%;
      }
    }
  }

  .change-detail {
    h4 {
      color: #00e5ff;
      margin-bottom: 10px;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
    }
  }
}

// Element Plus 样式覆盖
:deep(.el-button--primary) {
  background: linear-gradient(45deg, #00e5ff, #0080ff);
  border: none;
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3);

  &:hover {
    background: linear-gradient(45deg, #0080ff, #00e5ff);
    box-shadow: 0 6px 20px rgba(0, 229, 255, 0.4);
  }
}

:deep(.el-button) {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;

  &:hover {
    background: rgba(0, 229, 255, 0.2);
    border-color: #00e5ff;
  }
}

:deep(.el-select) {
  .el-input__inner {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #ffffff;
  }
}

:deep(.el-input__inner) {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #ffffff;
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
}

:deep(.el-dialog) {
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
  border: 1px solid rgba(0, 229, 255, 0.3);

  .el-dialog__header {
    background: rgba(0, 229, 255, 0.1);
    border-bottom: 1px solid rgba(0, 229, 255, 0.3);
  }

  .el-dialog__title {
    color: #00e5ff;
  }

  .el-dialog__body {
    color: #ffffff;
  }
}
</style>
