<template>
  <div class="document-approval-container">
    <!-- 文档审批概览 -->
    <div class="approval-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">待审批</div>
            <div class="card-value">{{ overviewData.pendingCount }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">已通过</div>
            <div class="card-value">{{ overviewData.approvedCount }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Close /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">已拒绝</div>
            <div class="card-value">{{ overviewData.rejectedCount }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">超时</div>
            <div class="card-value">{{ overviewData.timeoutCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 审批工具栏 -->
    <div class="approval-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文档..."
          prefix-icon="Search"
          style="width: 300px;"
          @input="handleSearch"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px;">
          <el-option label="全部状态" value="" />
          <el-option label="待审批" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="超时" value="timeout" />
        </el-select>
        <el-select v-model="typeFilter" placeholder="文档类型" style="width: 150px;">
          <el-option label="全部类型" value="" />
          <el-option label="设计文档" value="design" />
          <el-option label="技术规范" value="specification" />
          <el-option label="测试报告" value="test" />
          <el-option label="用户手册" value="manual" />
        </el-select>
        <el-select v-model="priorityFilter" placeholder="优先级" style="width: 120px;">
          <el-option label="全部" value="" />
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button @click="batchApprove" :disabled="selectedApprovals.length === 0">
          <el-icon><Check /></el-icon>
          批量通过
        </el-button>
        <el-button @click="batchReject" :disabled="selectedApprovals.length === 0">
          <el-icon><Close /></el-icon>
          批量拒绝
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 审批列表 -->
    <div class="approval-list">
      <el-table 
        :data="filteredApprovals" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="文档标题" width="250">
          <template #default="scope">
            <div class="document-title-cell">
              <el-icon><Document /></el-icon>
              <span>{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" size="small">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="scope">
            <el-tag :type="getPriorityTagType(scope.row.priority)" size="small">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitter" label="提交人" width="120" />
        <el-table-column prop="approver" label="审批人" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="150" />
        <el-table-column prop="deadline" label="截止时间" width="150">
          <template #default="scope">
            <span :class="{ 'deadline-warning': isDeadlineWarning(scope.row.deadline) }">
              {{ scope.row.deadline }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewDocument(scope.row)">查看</el-button>
            <el-button 
              size="small" 
              type="success" 
              @click="approveDocument(scope.row)"
              :disabled="scope.row.status !== 'pending'"
            >
              通过
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="rejectDocument(scope.row)"
              :disabled="scope.row.status !== 'pending'"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 文档查看对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="文档详情"
      width="1200px"
      :before-close="handleViewClose"
    >
      <div v-if="selectedDocument" class="document-detail">
        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="文档标题">{{ selectedDocument.title }}</el-descriptions-item>
                <el-descriptions-item label="文档类型">
                  <el-tag :type="getTypeTagType(selectedDocument.type)">
                    {{ getTypeText(selectedDocument.type) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="当前状态">
                  <el-tag :type="getStatusTagType(selectedDocument.status)">
                    {{ getStatusText(selectedDocument.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="优先级">
                  <el-tag :type="getPriorityTagType(selectedDocument.priority)">
                    {{ getPriorityText(selectedDocument.priority) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="提交人">{{ selectedDocument.submitter }}</el-descriptions-item>
                <el-descriptions-item label="审批人">{{ selectedDocument.approver }}</el-descriptions-item>
                <el-descriptions-item label="提交时间">{{ selectedDocument.submitTime }}</el-descriptions-item>
                <el-descriptions-item label="截止时间">{{ selectedDocument.deadline }}</el-descriptions-item>
                <el-descriptions-item label="文档描述" :span="2">{{ selectedDocument.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="文档内容" name="content">
            <div class="document-content">
              <div class="content-viewer">
                <div class="document-preview">
                  <h3>{{ selectedDocument.title }}</h3>
                  <div class="content-body" v-html="selectedDocument.content"></div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="审批历史" name="history">
            <div class="approval-history">
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in selectedDocument.approvalHistory || []"
                  :key="index"
                  :timestamp="item.time"
                  :type="getHistoryType(item.action)"
                >
                  <div class="history-item">
                    <div class="history-header">
                      <span class="action">{{ item.action }}</span>
                      <span class="operator">{{ item.operator }}</span>
                    </div>
                    <div class="history-content" v-if="item.comment">
                      {{ item.comment }}
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="approval-actions" v-if="selectedDocument && selectedDocument.status === 'pending'">
            <el-input
              v-model="approvalComment"
              type="textarea"
              :rows="3"
              placeholder="请输入审批意见..."
              style="margin-bottom: 16px;"
            />
            <div class="action-buttons">
              <el-button @click="showViewDialog = false">关闭</el-button>
              <el-button type="danger" @click="rejectWithComment">拒绝</el-button>
              <el-button type="success" @click="approveWithComment">通过</el-button>
            </div>
          </div>
          <div v-else>
            <el-button @click="showViewDialog = false">关闭</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, Check, Close, Clock, Search, Refresh 
} from '@element-plus/icons-vue'

// 响应式数据
const searchKeyword = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const priorityFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const selectedApprovals = ref([])
const showViewDialog = ref(false)
const detailActiveTab = ref('basic')
const selectedDocument = ref(null)
const approvalComment = ref('')

// 概览数据
const overviewData = reactive({
  pendingCount: 15,
  approvedCount: 128,
  rejectedCount: 8,
  timeoutCount: 3
})

// 审批数据
const approvals = ref([
  {
    id: 1,
    title: '智能控制器设计规范文档',
    type: 'design',
    status: 'pending',
    priority: 'high',
    submitter: '张三',
    approver: '李经理',
    submitTime: '2024-01-15 09:30',
    deadline: '2024-01-18 18:00',
    description: '智能控制器的详细设计规范，包含硬件设计、软件架构、接口定义等内容',
    content: '<h1>智能控制器设计规范</h1><h2>1. 概述</h2><p>本文档描述了智能控制器的设计规范...</p>',
    approvalHistory: [
      { action: '提交审批', operator: '张三', time: '2024-01-15 09:30', comment: '请审批设计规范文档' }
    ]
  },
  {
    id: 2,
    title: '产品技术规格说明书',
    type: 'specification',
    status: 'pending',
    priority: 'medium',
    submitter: '李四',
    approver: '王经理',
    submitTime: '2024-01-14 14:20',
    deadline: '2024-01-17 17:00',
    description: '产品的技术规格详细说明，包含性能参数、技术指标等',
    content: '<h1>产品技术规格说明书</h1><h2>1. 产品概述</h2><p>本产品是一款...</p>',
    approvalHistory: [
      { action: '提交审批', operator: '李四', time: '2024-01-14 14:20', comment: '技术规格说明书已完成，请审批' }
    ]
  },
  {
    id: 3,
    title: '系统测试报告',
    type: 'test',
    status: 'approved',
    priority: 'high',
    submitter: '王五',
    approver: '赵经理',
    submitTime: '2024-01-12 11:15',
    deadline: '2024-01-15 16:00',
    description: '系统功能测试和性能测试的详细报告',
    content: '<h1>系统测试报告</h1><h2>1. 测试概述</h2><p>本次测试包含功能测试和性能测试...</p>',
    approvalHistory: [
      { action: '提交审批', operator: '王五', time: '2024-01-12 11:15', comment: '测试报告已完成' },
      { action: '审批通过', operator: '赵经理', time: '2024-01-13 10:30', comment: '测试报告详细完整，通过审批' }
    ]
  },
  {
    id: 4,
    title: '用户操作手册',
    type: 'manual',
    status: 'rejected',
    priority: 'low',
    submitter: '赵六',
    approver: '孙经理',
    submitTime: '2024-01-10 16:45',
    deadline: '2024-01-13 18:00',
    description: '面向最终用户的操作手册',
    content: '<h1>用户操作手册</h1><h2>1. 产品介绍</h2><p>本产品是...</p>',
    approvalHistory: [
      { action: '提交审批', operator: '赵六', time: '2024-01-10 16:45', comment: '用户手册初稿完成' },
      { action: '审批拒绝', operator: '孙经理', time: '2024-01-11 14:20', comment: '内容不够详细，需要补充操作步骤' }
    ]
  },
  {
    id: 5,
    title: '接口设计文档',
    type: 'design',
    status: 'timeout',
    priority: 'medium',
    submitter: '钱七',
    approver: '周经理',
    submitTime: '2024-01-08 10:00',
    deadline: '2024-01-11 17:00',
    description: 'API接口的详细设计文档',
    content: '<h1>接口设计文档</h1><h2>1. 接口概述</h2><p>本文档描述了系统的API接口...</p>',
    approvalHistory: [
      { action: '提交审批', operator: '钱七', time: '2024-01-08 10:00', comment: 'API接口设计文档请审批' }
    ]
  }
])

// 计算属性
const filteredApprovals = computed(() => {
  return approvals.value.filter(approval => {
    const matchesSearch = !searchKeyword.value || 
      approval.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      approval.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || approval.status === statusFilter.value
    const matchesType = !typeFilter.value || approval.type === typeFilter.value
    const matchesPriority = !priorityFilter.value || approval.priority === priorityFilter.value
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedApprovals.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const getTypeTagType = (type) => {
  const types = {
    design: 'primary',
    specification: 'success',
    test: 'warning',
    manual: 'info'
  }
  return types[type] || ''
}

const getTypeText = (type) => {
  const texts = {
    design: '设计文档',
    specification: '技术规范',
    test: '测试报告',
    manual: '用户手册'
  }
  return texts[type] || type
}

const getStatusTagType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    timeout: 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    timeout: '超时'
  }
  return texts[status] || status
}

const getPriorityTagType = (priority) => {
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

const getHistoryType = (action) => {
  const types = {
    '提交审批': 'primary',
    '审批通过': 'success',
    '审批拒绝': 'danger',
    '修改': 'warning'
  }
  return types[action] || 'primary'
}

const isDeadlineWarning = (deadline) => {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffHours = (deadlineDate - now) / (1000 * 60 * 60)
  return diffHours < 24 && diffHours > 0
}

const viewDocument = (document) => {
  selectedDocument.value = document
  showViewDialog.value = true
  approvalComment.value = ''
}

const approveDocument = (document) => {
  ElMessageBox.confirm(
    `确定要通过文档"${document.title}"的审批吗？`,
    '确认通过',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    document.status = 'approved'
    document.approvalHistory = document.approvalHistory || []
    document.approvalHistory.push({
      action: '审批通过',
      operator: '当前用户',
      time: new Date().toLocaleString(),
      comment: '审批通过'
    })
    updateOverviewData()
    ElMessage.success('审批通过')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const rejectDocument = (document) => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝审批', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '请输入拒绝原因...'
  }).then(({ value }) => {
    document.status = 'rejected'
    document.approvalHistory = document.approvalHistory || []
    document.approvalHistory.push({
      action: '审批拒绝',
      operator: '当前用户',
      time: new Date().toLocaleString(),
      comment: value || '审批拒绝'
    })
    updateOverviewData()
    ElMessage.success('已拒绝审批')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const approveWithComment = () => {
  if (selectedDocument.value) {
    selectedDocument.value.status = 'approved'
    selectedDocument.value.approvalHistory = selectedDocument.value.approvalHistory || []
    selectedDocument.value.approvalHistory.push({
      action: '审批通过',
      operator: '当前用户',
      time: new Date().toLocaleString(),
      comment: approvalComment.value || '审批通过'
    })
    updateOverviewData()
    showViewDialog.value = false
    ElMessage.success('审批通过')
  }
}

const rejectWithComment = () => {
  if (selectedDocument.value) {
    selectedDocument.value.status = 'rejected'
    selectedDocument.value.approvalHistory = selectedDocument.value.approvalHistory || []
    selectedDocument.value.approvalHistory.push({
      action: '审批拒绝',
      operator: '当前用户',
      time: new Date().toLocaleString(),
      comment: approvalComment.value || '审批拒绝'
    })
    updateOverviewData()
    showViewDialog.value = false
    ElMessage.success('已拒绝审批')
  }
}

const batchApprove = () => {
  const pendingItems = selectedApprovals.value.filter(item => item.status === 'pending')
  if (pendingItems.length === 0) {
    ElMessage.warning('没有可审批的文档')
    return
  }

  ElMessageBox.confirm(
    `确定要批量通过 ${pendingItems.length} 个文档的审批吗？`,
    '批量通过',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    pendingItems.forEach(item => {
      item.status = 'approved'
      item.approvalHistory = item.approvalHistory || []
      item.approvalHistory.push({
        action: '审批通过',
        operator: '当前用户',
        time: new Date().toLocaleString(),
        comment: '批量审批通过'
      })
    })
    updateOverviewData()
    selectedApprovals.value = []
    ElMessage.success(`已批量通过 ${pendingItems.length} 个文档`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const batchReject = () => {
  const pendingItems = selectedApprovals.value.filter(item => item.status === 'pending')
  if (pendingItems.length === 0) {
    ElMessage.warning('没有可拒绝的文档')
    return
  }

  ElMessageBox.prompt('请输入拒绝原因', '批量拒绝', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '请输入拒绝原因...'
  }).then(({ value }) => {
    pendingItems.forEach(item => {
      item.status = 'rejected'
      item.approvalHistory = item.approvalHistory || []
      item.approvalHistory.push({
        action: '审批拒绝',
        operator: '当前用户',
        time: new Date().toLocaleString(),
        comment: value || '批量审批拒绝'
      })
    })
    updateOverviewData()
    selectedApprovals.value = []
    ElMessage.success(`已批量拒绝 ${pendingItems.length} 个文档`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const updateOverviewData = () => {
  overviewData.pendingCount = approvals.value.filter(item => item.status === 'pending').length
  overviewData.approvedCount = approvals.value.filter(item => item.status === 'approved').length
  overviewData.rejectedCount = approvals.value.filter(item => item.status === 'rejected').length
  overviewData.timeoutCount = approvals.value.filter(item => item.status === 'timeout').length
}

const handleViewClose = () => {
  selectedDocument.value = null
  showViewDialog.value = false
  approvalComment.value = ''
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
  updateOverviewData()
}

// 生命周期
onMounted(() => {
  totalCount.value = approvals.value.length
  updateOverviewData()
})
</script>

<style lang="scss" scoped>
.document-approval-container {
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

  .approval-overview {
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

  .approval-toolbar {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;

    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  .approval-list {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;

    :deep(.el-table) {
      background: transparent;
      border: none;

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
          background: rgba(255, 255, 255, 0.02);
          
          &:hover {
            background: rgba(0, 229, 255, 0.1);
          }

          td {
            border-bottom: 1px solid rgba(0, 229, 255, 0.1);
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }

    .document-title-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #00e5ff;
    }

    .deadline-warning {
      color: #ff6b6b;
      font-weight: 600;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    position: relative;
    z-index: 1;

    :deep(.el-pagination) {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 12px;
      padding: 16px;

      .el-pagination__total,
      .el-pagination__jump {
        color: rgba(255, 255, 255, 0.8);
      }

      .el-pager {
        li {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            background: rgba(0, 229, 255, 0.1);
            color: #00e5ff;
          }

          &.is-active {
            background: linear-gradient(135deg, #00e5ff, #0080ff);
            color: white;
          }
        }
      }

      .btn-prev,
      .btn-next {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 229, 255, 0.2);
        color: rgba(255, 255, 255, 0.8);

        &:hover {
          background: rgba(0, 229, 255, 0.1);
          color: #00e5ff;
        }
      }
    }
  }

  // 对话框样式
  :deep(.el-dialog) {
    background: rgba(10, 25, 41, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 16px;

    .el-dialog__header {
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 128, 255, 0.1));
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 16px 16px 0 0;

      .el-dialog__title {
        color: #00e5ff;
        font-weight: 600;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
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
      color: rgba(255, 255, 255, 0.8);
    }

    .el-dialog__footer {
      border-top: 1px solid rgba(0, 229, 255, 0.2);
      background: rgba(0, 229, 255, 0.05);
      border-radius: 0 0 16px 16px;

      .approval-actions {
        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
      }
    }
  }

  .document-detail {
    .basic-info {
      :deep(.el-descriptions) {
        .el-descriptions__header {
          .el-descriptions__title {
            color: #00e5ff;
            font-weight: 600;
          }
        }

        .el-descriptions__body {
          .el-descriptions__table {
            border: 1px solid rgba(0, 229, 255, 0.2);
            border-radius: 8px;

            .el-descriptions__cell {
              border: 1px solid rgba(0, 229, 255, 0.1);
              background: rgba(255, 255, 255, 0.02);

              &.is-bordered-label {
                background: rgba(0, 229, 255, 0.05);
                color: rgba(255, 255, 255, 0.8);
                font-weight: 500;
              }

              &:not(.is-bordered-label) {
                color: rgba(255, 255, 255, 0.7);
              }
            }
          }
        }
      }
    }

    .document-content {
      .content-viewer {
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 8px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.02);

        .document-preview {
          h3 {
            color: #00e5ff;
            margin-bottom: 16px;
            text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
          }

          .content-body {
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.6;

            h1, h2, h3, h4, h5, h6 {
              color: #00e5ff;
              margin: 16px 0 8px 0;
            }

            p {
              margin: 8px 0;
            }

            code {
              background: rgba(0, 229, 255, 0.1);
              color: #00e5ff;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
            }

            pre {
              background: rgba(0, 229, 255, 0.05);
              border: 1px solid rgba(0, 229, 255, 0.2);
              border-radius: 8px;
              padding: 16px;
              overflow-x: auto;

              code {
                background: none;
                padding: 0;
              }
            }
          }
        }
      }
    }

    .approval-history {
      :deep(.el-timeline) {
        .el-timeline-item {
          .el-timeline-item__timestamp {
            color: rgba(255, 255, 255, 0.6);
          }

          .el-timeline-item__node {
            &.el-timeline-item__node--primary {
              background: #00e5ff;
            }

            &.el-timeline-item__node--success {
              background: #00ff7f;
            }

            &.el-timeline-item__node--danger {
              background: #ff453a;
            }

            &.el-timeline-item__node--warning {
              background: #ffc107;
            }
          }

          .el-timeline-item__content {
            .history-item {
              .history-header {
                display: flex;
                gap: 12px;
                align-items: center;
                margin-bottom: 8px;

                .action {
                  color: #00e5ff;
                  font-weight: 600;
                }

                .operator {
                  color: rgba(255, 255, 255, 0.7);
                  font-size: 14px;
                }
              }

              .history-content {
                color: rgba(255, 255, 255, 0.8);
                background: rgba(0, 229, 255, 0.05);
                border: 1px solid rgba(0, 229, 255, 0.2);
                border-radius: 6px;
                padding: 12px;
                margin-top: 8px;
              }
            }
          }
        }
      }
    }
  }

  // 表单样式
  :deep(.el-form) {
    .el-form-item__label {
      color: rgba(255, 255, 255, 0.8);
    }

    .el-input {
      .el-input__wrapper {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 8px;
        box-shadow: none;

        &:hover {
          border-color: rgba(0, 229, 255, 0.5);
        }

        &.is-focus {
          border-color: #00e5ff;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
        }

        .el-input__inner {
          color: rgba(255, 255, 255, 0.9);
          background: transparent;

          &::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }
        }
      }
    }

    .el-textarea {
      .el-textarea__inner {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.9);

        &:hover {
          border-color: rgba(0, 229, 255, 0.5);
        }

        &:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
        }

        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }

    .el-select {
      .el-select__wrapper {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 8px;
        box-shadow: none;

        &:hover {
          border-color: rgba(0, 229, 255, 0.5);
        }

        &.is-focus {
          border-color: #00e5ff;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
        }

        .el-select__selected-item {
          color: rgba(255, 255, 255, 0.9);
        }

        .el-select__placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }

  // 按钮样式
  :deep(.el-button) {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;

    &.el-button--primary {
      background: linear-gradient(135deg, #00e5ff, #0080ff);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #00b8cc, #0066cc);
        box-shadow: 0 4px 16px rgba(0, 229, 255, 0.4);
        transform: translateY(-1px);
      }
    }

    &.el-button--success {
      background: linear-gradient(135deg, #00ff7f, #00cc66);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #00cc66, #009944);
        box-shadow: 0 4px 16px rgba(0, 255, 127, 0.4);
        transform: translateY(-1px);
      }
    }

    &.el-button--danger {
      background: linear-gradient(135deg, #ff453a, #cc2211);
      border: none;
      color: white;

      &:hover {
        background: linear-gradient(135deg, #cc2211, #990000);
        box-shadow: 0 4px 16px rgba(255, 69, 58, 0.4);
        transform: translateY(-1px);
      }
    }

    &:not(.el-button--primary):not(.el-button--success):not(.el-button--danger) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);

      &:hover {
        background: rgba(0, 229, 255, 0.1);
        border-color: rgba(0, 229, 255, 0.5);
        color: #00e5ff;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }
  }

  // 标签样式
  :deep(.el-tag) {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #00e5ff;
    border-radius: 6px;

    &.el-tag--success {
      background: rgba(0, 255, 127, 0.1);
      border-color: rgba(0, 255, 127, 0.3);
      color: #00ff7f;
    }

    &.el-tag--warning {
      background: rgba(255, 193, 7, 0.1);
      border-color: rgba(255, 193, 7, 0.3);
      color: #ffc107;
    }

    &.el-tag--danger {
      background: rgba(255, 69, 58, 0.1);
      border-color: rgba(255, 69, 58, 0.3);
      color: #ff453a;
    }

    &.el-tag--info {
      background: rgba(142, 142, 147, 0.1);
      border-color: rgba(142, 142, 147, 0.3);
      color: #8e8e93;
    }
  }
}
</style>
