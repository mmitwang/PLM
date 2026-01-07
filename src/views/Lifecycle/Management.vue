<template>
  <div class="lifecycle-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">产品生命周期管理</h1>
        <p class="page-description">跟踪和管理产品从概念到退市的完整生命周期</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" class="hologram-btn" @click="showCreateDialog = true">
          <i class="el-icon-plus"></i>
          新建产品
        </el-button>
      </div>
    </div>

    <!-- 生命周期概览 -->
    <div class="lifecycle-overview">
      <div class="overview-cards">
        <div class="overview-card" v-for="stage in lifecycleStages" :key="stage.key">
          <div class="card-icon" :class="stage.key">
            <i :class="stage.icon"></i>
          </div>
          <div class="card-content">
            <h3>{{ stage.name }}</h3>
            <div class="card-stats">
              <span class="count">{{ stage.count }}</span>
              <span class="label">个产品</span>
            </div>
          </div>
          <div class="card-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: stage.percentage + '%' }"
                :class="stage.key"
              ></div>
            </div>
            <span class="progress-text">{{ stage.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="filter-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索产品名称、编号..."
          prefix-icon="el-icon-search"
          class="search-input"
          @input="handleSearch"
        />
        <el-select v-model="stageFilter" placeholder="生命周期阶段" class="filter-select">
          <el-option label="全部阶段" value=""></el-option>
          <el-option label="概念设计" value="concept"></el-option>
          <el-option label="详细设计" value="design"></el-option>
          <el-option label="原型开发" value="prototype"></el-option>
          <el-option label="测试验证" value="testing"></el-option>
          <el-option label="批量生产" value="production"></el-option>
          <el-option label="市场投放" value="market"></el-option>
          <el-option label="维护支持" value="maintenance"></el-option>
          <el-option label="产品退市" value="retirement"></el-option>
        </el-select>
        <el-select v-model="priorityFilter" placeholder="优先级筛选" class="filter-select">
          <el-option label="全部优先级" value=""></el-option>
          <el-option label="高优先级" value="high"></el-option>
          <el-option label="中优先级" value="medium"></el-option>
          <el-option label="低优先级" value="low"></el-option>
        </el-select>
      </div>
      <div class="filter-right">
        <el-button-group>
          <el-button :class="{ active: viewMode === 'timeline' }" @click="viewMode = 'timeline'">
            <i class="el-icon-time"></i>
            时间线
          </el-button>
          <el-button :class="{ active: viewMode === 'kanban' }" @click="viewMode = 'kanban'">
            <i class="el-icon-menu"></i>
            看板
          </el-button>
          <el-button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
            <i class="el-icon-s-order"></i>
            列表
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 时间线视图 -->
    <div v-if="viewMode === 'timeline'" class="timeline-view">
      <div class="timeline-container">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="timeline-item"
          @click="viewProduct(product)"
        >
          <div class="timeline-marker" :class="product.currentStage">
            <i :class="getStageIcon(product.currentStage)"></i>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h3 class="product-name">{{ product.name }}</h3>
              <span class="product-code">{{ product.code }}</span>
              <el-tag :type="getPriorityType(product.priority)" size="mini">
                {{ getPriorityText(product.priority) }}
              </el-tag>
            </div>
            <div class="timeline-body">
              <p class="stage-info">
                当前阶段：<span class="stage-name">{{ getStageText(product.currentStage) }}</span>
              </p>
              <div class="progress-info">
                <span>进度：{{ product.progress }}%</span>
                <div class="mini-progress">
                  <div 
                    class="mini-progress-fill" 
                    :style="{ width: product.progress + '%' }"
                  ></div>
                </div>
              </div>
              <div class="timeline-meta">
                <span><i class="el-icon-user"></i>{{ product.manager }}</span>
                <span><i class="el-icon-date"></i>{{ formatDate(product.updateTime) }}</span>
              </div>
            </div>
            <div class="timeline-actions">
              <el-button size="mini" type="text" @click.stop="editProduct(product)">
                编辑
              </el-button>
              <el-button size="mini" type="text" @click.stop="viewHistory(product)">
                历史
              </el-button>
              <el-button size="mini" type="text" @click.stop="nextStage(product)">
                下一阶段
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 看板视图 -->
    <div v-else-if="viewMode === 'kanban'" class="kanban-view">
      <div class="kanban-columns">
        <div 
          v-for="stage in lifecycleStages" 
          :key="stage.key" 
          class="kanban-column"
        >
          <div class="column-header" :class="stage.key">
            <h3>{{ stage.name }}</h3>
            <span class="count">{{ getStageProducts(stage.key).length }}</span>
          </div>
          <div class="column-content">
            <div 
              v-for="product in getStageProducts(stage.key)" 
              :key="product.id"
              class="kanban-card"
              @click="viewProduct(product)"
            >
              <div class="card-header">
                <h4>{{ product.name }}</h4>
                <el-tag :type="getPriorityType(product.priority)" size="mini">
                  {{ getPriorityText(product.priority) }}
                </el-tag>
              </div>
              <div class="card-body">
                <p class="product-code">{{ product.code }}</p>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: product.progress + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ product.progress }}%</span>
              </div>
              <div class="card-footer">
                <span class="manager">{{ product.manager }}</span>
                <span class="date">{{ formatDate(product.updateTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-else class="table-view">
      <el-table
        :data="filteredProducts"
        style="width: 100%"
        @row-click="viewProduct"
        class="hologram-table"
      >
        <el-table-column prop="code" label="产品编号" width="120" />
        <el-table-column prop="name" label="产品名称" min-width="200" />
        <el-table-column prop="currentStage" label="当前阶段" width="120">
          <template #default="{ row }">
            <el-tag size="mini" :class="row.currentStage">
              {{ getStageText(row.currentStage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <div class="table-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: row.progress + '%' }"
                ></div>
              </div>
              <span>{{ row.progress }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="mini">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="mini" type="text" @click.stop="editProduct(row)">
              编辑
            </el-button>
            <el-button size="mini" type="text" @click.stop="viewHistory(row)">
              历史
            </el-button>
            <el-button size="mini" type="text" @click.stop="nextStage(row)">
              推进
            </el-button>
            <el-button size="mini" type="text" @click.stop="deleteProduct(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalCount"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 创建产品对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建产品生命周期"
      width="600px"
      class="hologram-dialog"
    >
      <el-form :model="newProduct" :rules="productRules" ref="productForm" label-width="100px">
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="newProduct.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品编号" prop="code">
          <el-input v-model="newProduct.code" placeholder="自动生成或手动输入" />
        </el-form-item>
        <el-form-item label="初始阶段" prop="currentStage">
          <el-select v-model="newProduct.currentStage" placeholder="请选择初始阶段">
            <el-option 
              v-for="stage in lifecycleStages" 
              :key="stage.key"
              :label="stage.name" 
              :value="stage.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="newProduct.priority" placeholder="请选择优先级">
            <el-option label="高优先级" value="high"></el-option>
            <el-option label="中优先级" value="medium"></el-option>
            <el-option label="低优先级" value="low"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="newProduct.manager" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="newProduct.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createProduct">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const searchKeyword = ref('')
const stageFilter = ref('')
const priorityFilter = ref('')
const viewMode = ref('timeline')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const showCreateDialog = ref(false)

// 生命周期阶段定义
const lifecycleStages = ref([
  { key: 'concept', name: '概念设计', icon: 'el-icon-light-bulb', count: 5, percentage: 12 },
  { key: 'design', name: '详细设计', icon: 'el-icon-edit', count: 8, percentage: 20 },
  { key: 'prototype', name: '原型开发', icon: 'el-icon-cpu', count: 6, percentage: 15 },
  { key: 'testing', name: '测试验证', icon: 'el-icon-check', count: 4, percentage: 10 },
  { key: 'production', name: '批量生产', icon: 'el-icon-goods', count: 10, percentage: 25 },
  { key: 'market', name: '市场投放', icon: 'el-icon-sell', count: 7, percentage: 18 },
  { key: 'maintenance', name: '维护支持', icon: 'el-icon-service', count: 0, percentage: 0 },
  { key: 'retirement', name: '产品退市', icon: 'el-icon-delete', count: 0, percentage: 0 }
])

// 产品数据
const products = ref([
  {
    id: 1,
    code: 'PLC-2024-001',
    name: '智能控制器V3.0',
    currentStage: 'production',
    progress: 85,
    priority: 'high',
    manager: '张工程师',
    updateTime: '2024-01-15 14:30:00',
    description: '新一代智能控制器，支持多协议通信'
  },
  {
    id: 2,
    code: 'PLC-2024-002',
    name: '工业网关设备',
    currentStage: 'testing',
    progress: 70,
    priority: 'medium',
    manager: '李工程师',
    updateTime: '2024-01-14 16:45:00',
    description: '工业物联网网关设备，支持边缘计算'
  },
  {
    id: 3,
    code: 'PLC-2024-003',
    name: '传感器模块',
    currentStage: 'design',
    progress: 45,
    priority: 'high',
    manager: '王工程师',
    updateTime: '2024-01-13 10:20:00',
    description: '多功能传感器模块，集成温湿度、压力等传感器'
  },
  {
    id: 4,
    code: 'PLC-2024-004',
    name: '人机界面终端',
    currentStage: 'prototype',
    progress: 60,
    priority: 'medium',
    manager: '赵工程师',
    updateTime: '2024-01-12 09:15:00',
    description: '工业级人机界面终端，支持触摸操作'
  }
])

// 新建产品表单
const newProduct = reactive({
  name: '',
  code: '',
  currentStage: 'concept',
  priority: 'medium',
  manager: '',
  description: ''
})

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入产品编号', trigger: 'blur' }
  ],
  currentStage: [
    { required: true, message: '请选择初始阶段', trigger: 'change' }
  ],
  manager: [
    { required: true, message: '请输入负责人', trigger: 'blur' }
  ]
}

// 计算属性
const filteredProducts = computed(() => {
  let result = products.value

  if (searchKeyword.value) {
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      product.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (stageFilter.value) {
    result = result.filter(product => product.currentStage === stageFilter.value)
  }

  if (priorityFilter.value) {
    result = result.filter(product => product.priority === priorityFilter.value)
  }

  totalCount.value = result.length
  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const getStageText = (stage) => {
  const stageMap = {
    concept: '概念设计',
    design: '详细设计',
    prototype: '原型开发',
    testing: '测试验证',
    production: '批量生产',
    market: '市场投放',
    maintenance: '维护支持',
    retirement: '产品退市'
  }
  return stageMap[stage] || stage
}

const getStageIcon = (stage) => {
  const iconMap = {
    concept: 'el-icon-light-bulb',
    design: 'el-icon-edit',
    prototype: 'el-icon-cpu',
    testing: 'el-icon-check',
    production: 'el-icon-goods',
    market: 'el-icon-sell',
    maintenance: 'el-icon-service',
    retirement: 'el-icon-delete'
  }
  return iconMap[stage] || 'el-icon-info'
}

const getPriorityText = (priority) => {
  const priorityMap = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return priorityMap[priority] || priority
}

const getPriorityType = (priority) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getStageProducts = (stage) => {
  return filteredProducts.value.filter(product => product.currentStage === stage)
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}

const viewProduct = (product) => {
  ElMessage.info(`查看产品: ${product.name}`)
}

const editProduct = (product) => {
  ElMessage.info(`编辑产品: ${product.name}`)
}

const viewHistory = (product) => {
  ElMessage.info(`查看历史: ${product.name}`)
}

const nextStage = (product) => {
  ElMessage.info(`推进到下一阶段: ${product.name}`)
}

const deleteProduct = (product) => {
  ElMessageBox.confirm(
    `确定要删除产品 "${product.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = products.value.findIndex(p => p.id === product.id)
    if (index > -1) {
      products.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const createProduct = () => {
  const newId = Math.max(...products.value.map(p => p.id)) + 1
  products.value.unshift({
    id: newId,
    ...newProduct,
    progress: 0,
    updateTime: new Date().toISOString()
  })
  
  // 重置表单
  Object.assign(newProduct, {
    name: '',
    code: '',
    currentStage: 'concept',
    priority: 'medium',
    manager: '',
    description: ''
  })
  
  showCreateDialog.value = false
  ElMessage.success('创建成功')
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.lifecycle-management {
  padding: 1.5rem;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.header-content {
  .page-title {
    font-size: 1.8rem;
    color: var(--hologram-primary);
    margin-bottom: 0.5rem;
    text-shadow: 0 0 10px var(--hologram-primary);
  }
  
  .page-description {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
  }
}

// 生命周期概览
.lifecycle-overview {
  margin-bottom: 2rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.overview-card {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 229, 255, 0.2);
  }
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  
  i {
    font-size: 1.2rem;
    color: white;
  }
  
  &.concept { background: rgba(255, 193, 7, 0.8); }
  &.design { background: rgba(0, 123, 255, 0.8); }
  &.prototype { background: rgba(108, 117, 125, 0.8); }
  &.testing { background: rgba(40, 167, 69, 0.8); }
  &.production { background: rgba(220, 53, 69, 0.8); }
  &.market { background: rgba(23, 162, 184, 0.8); }
  &.maintenance { background: rgba(111, 66, 193, 0.8); }
  &.retirement { background: rgba(52, 58, 64, 0.8); }
}

.card-content {
  h3 {
    color: var(--hologram-primary);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
}

.card-stats {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  
  .count {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--hologram-primary);
  }
  
  .label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }
}

.card-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  
  &.concept { background: #ffc107; }
  &.design { background: #007bff; }
  &.prototype { background: #6c757d; }
  &.testing { background: #28a745; }
  &.production { background: #dc3545; }
  &.market { background: #17a2b8; }
  &.maintenance { background: #6f42c1; }
  &.retirement { background: #343a40; }
}

.progress-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  min-width: 30px;
}

// 筛选工具栏
.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 128, 255, 0.05);
  border: 1px solid rgba(0, 128, 255, 0.2);
  border-radius: 8px;
}

.filter-left {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 150px;
}

// 时间线视图
.timeline-view {
  margin-bottom: 2rem;
}

.timeline-container {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 30px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--hologram-primary), var(--hologram-secondary));
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  cursor: pointer;
  
  &:hover .timeline-content {
    transform: translateX(5px);
    box-shadow: 0 8px 25px rgba(0, 229, 255, 0.3);
  }
}

.timeline-marker {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  
  i {
    font-size: 0.8rem;
    color: white;
  }
  
  &.concept { background: #ffc107; }
  &.design { background: #007bff; }
  &.prototype { background: #6c757d; }
  &.testing { background: #28a745; }
  &.production { background: #dc3545; }
  &.market { background: #17a2b8; }
  &.maintenance { background: #6f42c1; }
  &.retirement { background: #343a40; }
}

.timeline-content {
  margin-left: 60px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  .product-name {
    color: var(--hologram-primary);
    font-size: 1.1rem;
    margin: 0;
  }
  
  .product-code {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }
}

.timeline-body {
  margin-bottom: 1rem;
  
  .stage-info {
    margin-bottom: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    
    .stage-name {
      color: var(--hologram-primary);
      font-weight: 500;
    }
  }
  
  .progress-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
    
    span {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }
  }
  
  .mini-progress {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    
    .mini-progress-fill {
      height: 100%;
      background: var(--hologram-primary);
      transition: width 0.3s ease;
    }
  }
  
  .timeline-meta {
    display: flex;
    gap: 1.5rem;
    
    span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
      
      i {
        font-size: 0.75rem;
      }
    }
  }
}

.timeline-actions {
  display: flex;
  gap: 0.5rem;
}

// 看板视图
.kanban-view {
  margin-bottom: 2rem;
}

.kanban-columns {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.kanban-column {
  min-width: 280px;
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.column-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    color: var(--hologram-primary);
    font-size: 1rem;
    margin: 0;
  }
  
  .count {
    background: rgba(0, 229, 255, 0.2);
    color: var(--hologram-primary);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  &.concept { border-left: 4px solid #ffc107; }
  &.design { border-left: 4px solid #007bff; }
  &.prototype { border-left: 4px solid #6c757d; }
  &.testing { border-left: 4px solid #28a745; }
  &.production { border-left: 4px solid #dc3545; }
  &.market { border-left: 4px solid #17a2b8; }
  &.maintenance { border-left: 4px solid #6f42c1; }
  &.retirement { border-left: 4px solid #343a40; }
}

.column-content {
  padding: 1rem;
  min-height: 400px;
}

.kanban-card {
  background: rgba(0, 128, 255, 0.05);
  border: 1px solid rgba(0, 128, 255, 0.2);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 229, 255, 0.2);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    
    h4 {
      color: var(--hologram-primary);
      font-size: 0.9rem;
      margin: 0;
      flex: 1;
    }
  }
  
  .card-body {
    margin-bottom: 0.75rem;
    
    .product-code {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
    }
    
    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.25rem;
      
      .progress-fill {
        height: 100%;
        background: var(--hologram-primary);
        transition: width 0.3s ease;
      }
    }
    
    .progress-text {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    
    .manager {
      font-weight: 500;
    }
  }
}

// 表格视图
.table-view {
  margin-bottom: 2rem;
}

.table-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: var(--hologram-primary);
      transition: width 0.3s ease;
    }
  }
  
  span {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    min-width: 35px;
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

// 响应式设计
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-toolbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-left {
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
  
  .overview-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .timeline-content {
    margin-left: 40px;
  }
  
  .timeline-marker {
    left: 10px;
  }
  
  .timeline-container::before {
    left: 20px;
  }
  
  .kanban-columns {
    flex-direction: column;
  }
  
  .kanban-column {
    min-width: auto;
  }
}
