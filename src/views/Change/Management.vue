<template>
  <div class="change-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="el-icon-edit-outline"></i>
            工程变更管理
          </h1>
          <p class="page-subtitle">Engineering Change Management</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" class="hologram-button" @click="showCreateDialog = true">
            <i class="el-icon-plus"></i>
            创建变更请求
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.key">
          <div class="stat-icon" :class="stat.iconClass">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-trend" :class="stat.trendClass">
            <i :class="stat.trendIcon"></i>
            <span>{{ stat.trend }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="filter-left">
        <el-select v-model="filters.status" placeholder="变更状态" clearable class="filter-select">
          <el-option label="全部状态" value=""></el-option>
          <el-option label="草稿" value="draft"></el-option>
          <el-option label="待审核" value="pending"></el-option>
          <el-option label="审核中" value="reviewing"></el-option>
          <el-option label="已批准" value="approved"></el-option>
          <el-option label="已拒绝" value="rejected"></el-option>
          <el-option label="已实施" value="implemented"></el-option>
          <el-option label="已关闭" value="closed"></el-option>
        </el-select>
        
        <el-select v-model="filters.priority" placeholder="优先级" clearable class="filter-select">
          <el-option label="全部优先级" value=""></el-option>
          <el-option label="紧急" value="urgent"></el-option>
          <el-option label="高" value="high"></el-option>
          <el-option label="中" value="medium"></el-option>
          <el-option label="低" value="low"></el-option>
        </el-select>

        <el-select v-model="filters.type" placeholder="变更类型" clearable class="filter-select">
          <el-option label="全部类型" value=""></el-option>
          <el-option label="设计变更" value="design"></el-option>
          <el-option label="工艺变更" value="process"></el-option>
          <el-option label="材料变更" value="material"></el-option>
          <el-option label="规格变更" value="specification"></el-option>
        </el-select>

        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="filter-date">
        </el-date-picker>
      </div>
      
      <div class="filter-right">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索变更请求..."
          prefix-icon="el-icon-search"
          class="search-input"
          @keyup.enter="handleSearch">
        </el-input>
        <el-button @click="handleSearch" class="search-button">
          <i class="el-icon-search"></i>
        </el-button>
        <el-button @click="resetFilters" class="reset-button">
          <i class="el-icon-refresh"></i>
        </el-button>
      </div>
    </div>

    <!-- 变更请求列表 -->
    <div class="change-list">
      <el-table
        :data="changeRequests"
        class="hologram-table"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick">
        
        <el-table-column type="selection" width="55"></el-table-column>
        
        <el-table-column prop="id" label="变更编号" width="120">
          <template #default="{ row }">
            <span class="change-id">{{ row.id }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="变更标题" min-width="200">
          <template #default="{ row }">
            <div class="change-title">
              <span>{{ row.title }}</span>
              <el-tag v-if="row.urgent" type="danger" size="mini" class="urgent-tag">紧急</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="变更类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="mini">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)" size="mini">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="mini">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="requester" label="申请人" width="100">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.requesterAvatar">
                {{ row.requester.charAt(0) }}
              </el-avatar>
              <span>{{ row.requester }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="120">
          <template #default="{ row }">
            <span>{{ formatDate(row.createTime) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="dueDate" label="截止日期" width="120">
          <template #default="{ row }">
            <span :class="{ 'overdue': isOverdue(row.dueDate) }">
              {{ formatDate(row.dueDate) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="mini" @click.stop="viewChange(row)">
                <i class="el-icon-view"></i>
                查看
              </el-button>
              <el-button size="mini" type="primary" @click.stop="editChange(row)" v-if="canEdit(row)">
                <i class="el-icon-edit"></i>
                编辑
              </el-button>
              <el-dropdown @command="handleCommand" trigger="click" v-if="canOperate(row)">
                <el-button size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="`approve_${row.id}`" v-if="row.status === 'pending'">
                      <i class="el-icon-check"></i> 批准
                    </el-dropdown-item>
                    <el-dropdown-item :command="`reject_${row.id}`" v-if="row.status === 'pending'">
                      <i class="el-icon-close"></i> 拒绝
                    </el-dropdown-item>
                    <el-dropdown-item :command="`implement_${row.id}`" v-if="row.status === 'approved'">
                      <i class="el-icon-success"></i> 实施
                    </el-dropdown-item>
                    <el-dropdown-item :command="`close_${row.id}`" v-if="row.status === 'implemented'">
                      <i class="el-icon-circle-close"></i> 关闭
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </div>

    <!-- 创建变更请求对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建变更请求"
      width="800px"
      class="hologram-dialog"
      :before-close="handleCreateDialogClose">
      
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="变更标题" prop="title">
              <el-input v-model="createForm.title" placeholder="请输入变更标题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="变更类型" prop="type">
              <el-select v-model="createForm.type" placeholder="请选择变更类型">
                <el-option label="设计变更" value="design"></el-option>
                <el-option label="工艺变更" value="process"></el-option>
                <el-option label="材料变更" value="material"></el-option>
                <el-option label="规格变更" value="specification"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="createForm.priority" placeholder="请选择优先级">
                <el-option label="紧急" value="urgent"></el-option>
                <el-option label="高" value="high"></el-option>
                <el-option label="中" value="medium"></el-option>
                <el-option label="低" value="low"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="dueDate">
              <el-date-picker
                v-model="createForm.dueDate"
                type="date"
                placeholder="选择截止日期"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="影响产品" prop="affectedProducts">
          <el-select v-model="createForm.affectedProducts" multiple placeholder="选择影响的产品">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="变更原因" prop="reason">
          <el-input
            v-model="createForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请描述变更原因">
          </el-input>
        </el-form-item>
        
        <el-form-item label="变更描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述变更内容">
          </el-input>
        </el-form-item>
        
        <el-form-item label="附件">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            multiple
            :auto-upload="false"
            :file-list="createForm.attachments">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">只能上传jpg/png/pdf文件，且不超过10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreate" :loading="creating">
            创建变更请求
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ChangeManagement',
  setup() {
    // 响应式数据
    const loading = ref(false)
    const creating = ref(false)
    const showCreateDialog = ref(false)
    const createFormRef = ref(null)
    
    // 统计数据
    const stats = ref([
      {
        key: 'total',
        label: '总变更请求',
        value: '156',
        icon: 'el-icon-document',
        iconClass: 'primary',
        trend: '+12%',
        trendIcon: 'el-icon-top',
        trendClass: 'up'
      },
      {
        key: 'pending',
        label: '待审核',
        value: '23',
        icon: 'el-icon-time',
        iconClass: 'warning',
        trend: '+5',
        trendIcon: 'el-icon-top',
        trendClass: 'up'
      },
      {
        key: 'approved',
        label: '已批准',
        value: '89',
        icon: 'el-icon-check',
        iconClass: 'success',
        trend: '+8%',
        trendIcon: 'el-icon-top',
        trendClass: 'up'
      },
      {
        key: 'urgent',
        label: '紧急变更',
        value: '7',
        icon: 'el-icon-warning',
        iconClass: 'danger',
        trend: '-2',
        trendIcon: 'el-icon-bottom',
        trendClass: 'down'
      }
    ])
    
    // 筛选条件
    const filters = reactive({
      status: '',
      priority: '',
      type: '',
      dateRange: null,
      keyword: ''
    })
    
    // 分页
    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 156
    })
    
    // 变更请求数据
    const changeRequests = ref([
      {
        id: 'ECR-2024-001',
        title: '主板电路设计优化',
        type: 'design',
        priority: 'high',
        status: 'pending',
        requester: '张工程师',
        requesterAvatar: '',
        createTime: '2024-01-15',
        dueDate: '2024-02-15',
        urgent: false,
        affectedProducts: ['产品A', '产品B'],
        reason: '提升性能，降低功耗',
        description: '对主板电路进行重新设计，优化信号路径...'
      },
      {
        id: 'ECR-2024-002',
        title: '材料规格变更',
        type: 'material',
        priority: 'urgent',
        status: 'approved',
        requester: '李经理',
        requesterAvatar: '',
        createTime: '2024-01-14',
        dueDate: '2024-01-20',
        urgent: true,
        affectedProducts: ['产品C'],
        reason: '供应商停产，需要替换材料',
        description: '将原材料A替换为材料B，保持性能不变...'
      },
      {
        id: 'ECR-2024-003',
        title: '生产工艺改进',
        type: 'process',
        priority: 'medium',
        status: 'reviewing',
        requester: '王主管',
        requesterAvatar: '',
        createTime: '2024-01-13',
        dueDate: '2024-02-28',
        urgent: false,
        affectedProducts: ['产品D'],
        reason: '提高生产效率，降低成本',
        description: '优化装配流程，减少人工操作步骤...'
      }
    ])
    
    // 产品列表
    const products = ref([
      { id: 1, name: '智能控制器 v1.0' },
      { id: 2, name: '传感器模块 v2.1' },
      { id: 3, name: '通信网关 v1.5' },
      { id: 4, name: '显示屏组件 v3.0' }
    ])
    
    // 创建表单
    const createForm = reactive({
      title: '',
      type: '',
      priority: 'medium',
      dueDate: null,
      affectedProducts: [],
      reason: '',
      description: '',
      attachments: []
    })
    
    // 表单验证规则
    const createRules = {
      title: [
        { required: true, message: '请输入变更标题', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择变更类型', trigger: 'change' }
      ],
      priority: [
        { required: true, message: '请选择优先级', trigger: 'change' }
      ],
      dueDate: [
        { required: true, message: '请选择截止日期', trigger: 'change' }
      ],
      reason: [
        { required: true, message: '请输入变更原因', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入变更描述', trigger: 'blur' }
      ]
    }
    
    // 方法
    const handleSearch = () => {
      console.log('搜索:', filters)
      // 实现搜索逻辑
    }
    
    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        if (key === 'dateRange') {
          filters[key] = null
        } else {
          filters[key] = ''
        }
      })
      handleSearch()
    }
    
    const handleSelectionChange = (selection) => {
      console.log('选择变更:', selection)
    }
    
    const handleRowClick = (row) => {
      viewChange(row)
    }
    
    const viewChange = (row) => {
      console.log('查看变更:', row)
      // 跳转到变更详情页面
    }
    
    const editChange = (row) => {
      console.log('编辑变更:', row)
      // 打开编辑对话框
    }
    
    const handleCommand = (command) => {
      const [action, id] = command.split('_')
      console.log('执行操作:', action, id)
      
      switch (action) {
        case 'approve':
          approveChange(id)
          break
        case 'reject':
          rejectChange(id)
          break
        case 'implement':
          implementChange(id)
          break
        case 'close':
          closeChange(id)
          break
      }
    }
    
    const approveChange = (id) => {
      ElMessageBox.confirm('确认批准此变更请求？', '确认操作', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('变更请求已批准')
        // 更新状态
      })
    }
    
    const rejectChange = (id) => {
      ElMessageBox.confirm('确认拒绝此变更请求？', '确认操作', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('变更请求已拒绝')
        // 更新状态
      })
    }
    
    const implementChange = (id) => {
      ElMessageBox.confirm('确认实施此变更？', '确认操作', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('变更已开始实施')
        // 更新状态
      })
    }
    
    const closeChange = (id) => {
      ElMessageBox.confirm('确认关闭此变更？', '确认操作', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('变更已关闭')
        // 更新状态
      })
    }
    
    const handleSizeChange = (size) => {
      pagination.pageSize = size
      // 重新加载数据
    }
    
    const handleCurrentChange = (page) => {
      pagination.currentPage = page
      // 重新加载数据
    }
    
    const handleCreate = () => {
      createFormRef.value.validate((valid) => {
        if (valid) {
          creating.value = true
          
          // 模拟创建请求
          setTimeout(() => {
            creating.value = false
            showCreateDialog.value = false
            ElMessage.success('变更请求创建成功')
            
            // 重置表单
            Object.keys(createForm).forEach(key => {
              if (key === 'attachments' || key === 'affectedProducts') {
                createForm[key] = []
              } else if (key === 'priority') {
                createForm[key] = 'medium'
              } else {
                createForm[key] = ''
              }
            })
          }, 1500)
        }
      })
    }
    
    const handleCreateDialogClose = (done) => {
      ElMessageBox.confirm('确认关闭？未保存的数据将丢失。', '确认关闭', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done()
      }).catch(() => {
        // 取消关闭
      })
    }
    
    // 工具方法
    const getTypeLabel = (type) => {
      const labels = {
        design: '设计',
        process: '工艺',
        material: '材料',
        specification: '规格'
      }
      return labels[type] || type
    }
    
    const getTypeTagType = (type) => {
      const types = {
        design: 'primary',
        process: 'success',
        material: 'warning',
        specification: 'info'
      }
      return types[type] || ''
    }
    
    const getPriorityLabel = (priority) => {
      const labels = {
        urgent: '紧急',
        high: '高',
        medium: '中',
        low: '低'
      }
      return labels[priority] || priority
    }
    
    const getPriorityTagType = (priority) => {
      const types = {
        urgent: 'danger',
        high: 'warning',
        medium: 'primary',
        low: 'info'
      }
      return types[priority] || ''
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        draft: '草稿',
        pending: '待审核',
        reviewing: '审核中',
        approved: '已批准',
        rejected: '已拒绝',
        implemented: '已实施',
        closed: '已关闭'
      }
      return labels[status] || status
    }
    
    const getStatusTagType = (status) => {
      const types = {
        draft: 'info',
        pending: 'warning',
        reviewing: 'primary',
        approved: 'success',
        rejected: 'danger',
        implemented: 'success',
        closed: 'info'
      }
      return types[status] || ''
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }
    
    const isOverdue = (dueDate) => {
      return new Date(dueDate) < new Date()
    }
    
    const canEdit = (row) => {
      return ['draft', 'pending'].includes(row.status)
    }
    
    const canOperate = (row) => {
      return !['closed'].includes(row.status)
    }
    
    // 生命周期
    onMounted(() => {
      // 初始化数据
      handleSearch()
    })
    
    return {
      loading,
      creating,
      showCreateDialog,
      createFormRef,
      stats,
      filters,
      pagination,
      changeRequests,
      products,
      createForm,
      createRules,
      handleSearch,
      resetFilters,
      handleSelectionChange,
      handleRowClick,
      viewChange,
      editChange,
      handleCommand,
      handleSizeChange,
      handleCurrentChange,
      handleCreate,
      handleCreateDialogClose,
      getTypeLabel,
      getTypeTagType,
      getPriorityLabel,
      getPriorityTagType,
      getStatusLabel,
      getStatusTagType,
      formatDate,
      isOverdue,
      canEdit,
      canOperate
    }
  }
}
</script>

<style lang="scss" scoped>
.change-management {
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title-section {
      .page-title {
        font-size: 28px;
        font-weight: 600;
        color: var(--hologram-primary);
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;
        
        i {
          font-size: 32px;
        }
      }
      
      .page-subtitle {
        color: var(--hologram-text-secondary);
        margin: 0;
        font-size: 14px;
      }
    }
  }
}

.stats-overview {
  margin-bottom: 24px;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .stat-card {
    background: var(--hologram-card-bg);
    border: 1px solid var(--hologram-border);
    border-radius: var(--hologram-border-radius);
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 229, 255, 0.2);
      border-color: var(--hologram-primary);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      
      &.primary {
        background: linear-gradient(135deg, var(--hologram-primary), var(--hologram-secondary));
        color: white;
      }
      
      &.success {
        background: linear-gradient(135deg, #00e676, #00c853);
        color: white;
      }
      
      &.warning {
        background: linear-gradient(135deg, #ffab00, #ff8f00);
        color: white;
      }
      
      &.danger {
        background: linear-gradient(135deg, #ff5252, #f44336);
        color: white;
      }
    }
    
    .stat-content {
      flex: 1;
      
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--hologram-text-primary);
        line-height: 1;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 14px;
        color: var(--hologram-text-secondary);
      }
    }
    
    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      
      &.up {
        color: #00e676;
      }
      
      &.down {
        color: #ff5252;
      }
    }
  }
}

.filter-toolbar {
  background: var(--hologram-card-bg);
  border: 1px solid var(--hologram-border);
  border-radius: var(--hologram-border-radius);
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
  
  .filter-left {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    
    .filter-select {
      width: 150px;
    }
    
    .filter-date {
      width: 240px;
    }
  }
  
  .filter-right {
    display: flex;
    gap: 12px;
    
    .search-input {
      width: 250px;
    }
  }
}

.change-list {
  background: var(--hologram-card-bg);
  border: 1px solid var(--hologram-border);
  border-radius: var(--hologram-border-radius);
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  .change-id {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: var(--hologram-primary);
  }
  
  .change-title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .urgent-tag {
      animation: pulse 2s infinite;
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    span {
      font-size: 12px;
    }
  }
  
  .overdue {
    color: #ff5252;
    font-weight: 600;
  }
  
  .action-buttons {
    display: flex;
    gap: 8px;
  }
  
  .pagination-wrapper {
    padding: 20px;
    display: flex;
    justify-content: center;
    background: var(--hologram-bg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .change-management {
    padding: 16px;
  }
  
  .page-header .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
    
    .filter-left {
      justify-content: center;
    }
    
    .filter-right {
      justify-content: center;
    }
  }
  
  .filter-select,
  .filter-date,
  .search-input {
    width: 100% !important;
  }
}
</style>
