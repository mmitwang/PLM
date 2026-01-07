<template>
  <div class="product-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">产品管理中心</h1>
        <p class="page-subtitle">统一管理产品信息、设计文档、BOM清单和版本控制</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateProductDialog = true">
          <el-icon><Plus /></el-icon>
          新建产品
        </el-button>
        <el-button @click="importProducts">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button @click="exportProducts">
          <el-icon><Download /></el-icon>
          导出产品
        </el-button>
      </div>
    </div>

    <!-- 产品概览统计 -->
    <div class="product-overview">
      <div class="overview-grid">
        <div class="overview-card" v-for="stat in productStats" :key="stat.key">
          <div class="card-icon" :class="stat.type">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.label }}</p>
            <span class="trend" :class="stat.trend > 0 ? 'up' : 'down'">
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 产品筛选工具栏 -->
    <div class="product-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索产品名称、编号、分类..."
          prefix-icon="Search"
          style="width: 300px"
          @input="handleSearch"
          clearable
        />
        <el-select v-model="categoryFilter" placeholder="产品分类" style="width: 150px; margin-left: 10px">
          <el-option label="全部分类" value=""></el-option>
          <el-option label="电子产品" value="electronic"></el-option>
          <el-option label="机械产品" value="mechanical"></el-option>
          <el-option label="软件产品" value="software"></el-option>
          <el-option label="复合产品" value="composite"></el-option>
        </el-select>
        <el-select v-model="statusFilter" placeholder="产品状态" style="width: 120px; margin-left: 10px">
          <el-option label="全部状态" value=""></el-option>
          <el-option label="设计中" value="designing"></el-option>
          <el-option label="开发中" value="developing"></el-option>
          <el-option label="测试中" value="testing"></el-option>
          <el-option label="已发布" value="released"></el-option>
          <el-option label="已停产" value="discontinued"></el-option>
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="grid">
            <el-icon><Grid /></el-icon>
            卡片视图
          </el-radio-button>
          <el-radio-button label="table">
            <el-icon><List /></el-icon>
            列表视图
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 产品列表 - 卡片视图 -->
    <div v-if="viewMode === 'grid'" class="product-grid">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        @click="viewProductDetail(product)"
      >
        <div class="card-header">
          <div class="product-image">
            <img :src="product.image || '/images/product-placeholder.png'" :alt="product.name" />
            <div class="image-overlay">
              <el-icon><View /></el-icon>
            </div>
          </div>
          <div class="product-status" :class="product.status">
            {{ getStatusText(product.status) }}
          </div>
        </div>
        <div class="card-content">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-code">{{ product.code }}</p>
          <div class="product-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ product.manager }}
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(product.createTime) }}
            </span>
          </div>
          <div class="product-progress">
            <div class="progress-info">
              <span>完成度</span>
              <span>{{ product.progress }}%</span>
            </div>
            <el-progress :percentage="product.progress" :status="getProgressStatus(product.progress)" />
          </div>
          <div class="product-tags">
            <el-tag
              v-for="tag in product.tags"
              :key="tag"
              size="small"
              class="product-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="card-actions">
          <el-button size="small" type="text" @click.stop="editProduct(product)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button size="small" type="text" @click.stop="viewBOM(product)">
            <el-icon><Document /></el-icon>
            BOM
          </el-button>
          <el-button size="small" type="text" @click.stop="viewVersions(product)">
            <el-icon><Clock /></el-icon>
            版本
          </el-button>
          <el-dropdown @command="handleProductAction" trigger="click">
            <el-button size="small" type="text">
              <el-icon><More /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="`clone_${product.id}`">克隆产品</el-dropdown-item>
                <el-dropdown-item :command="`archive_${product.id}`">归档产品</el-dropdown-item>
                <el-dropdown-item :command="`export_${product.id}`">导出数据</el-dropdown-item>
                <el-dropdown-item :command="`delete_${product.id}`" divided>删除产品</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 产品列表 - 表格视图 -->
    <div v-else class="product-table">
      <el-table
        :data="filteredProducts"
        style="width: 100%"
        @row-click="viewProductDetail"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="产品编号" width="120" />
        <el-table-column prop="name" label="产品名称" min-width="200">
          <template #default="{ row }">
            <div class="product-name-cell">
              <img :src="row.image || '/images/product-placeholder.png'" class="product-thumb" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryText(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="getProgressStatus(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="负责人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="text" @click.stop="editProduct(row)">编辑</el-button>
            <el-button size="small" type="text" @click.stop="viewBOM(row)">BOM</el-button>
            <el-button size="small" type="text" @click.stop="viewVersions(row)">版本</el-button>
            <el-button size="small" type="text" @click.stop="deleteProduct(row)">删除</el-button>
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
        :page-sizes="[12, 24, 48, 96]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 创建产品对话框 -->
    <el-dialog
      v-model="showCreateProductDialog"
      title="新建产品"
      width="800px"
      :before-close="handleCreateDialogClose"
    >
      <el-form :model="newProduct" :rules="productRules" ref="productFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="newProduct.name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品编号" prop="code">
              <el-input v-model="newProduct.code" placeholder="自动生成或手动输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品分类" prop="category">
              <el-select v-model="newProduct.category" placeholder="请选择分类" style="width: 100%">
                <el-option label="电子产品" value="electronic" />
                <el-option label="机械产品" value="mechanical" />
                <el-option label="软件产品" value="software" />
                <el-option label="复合产品" value="composite" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="manager">
              <el-select v-model="newProduct.manager" placeholder="请选择负责人" style="width: 100%">
                <el-option
                  v-for="user in users"
                  :key="user.id"
                  :label="user.name"
                  :value="user.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="newProduct.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品描述"
          />
        </el-form-item>
        <el-form-item label="产品标签">
          <el-tag
            v-for="tag in newProduct.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="tagInputRef"
            v-model="inputValue"
            size="small"
            style="width: 100px;"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else size="small" @click="showInput">+ 添加标签</el-button>
        </el-form-item>
        <el-form-item label="产品图片">
          <el-upload
            class="product-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :on-success="handleImageSuccess"
          >
            <img v-if="newProduct.image" :src="newProduct.image" class="product-image" />
            <el-icon v-else class="product-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateProductDialog = false">取消</el-button>
          <el-button type="primary" @click="createProduct">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 产品详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="产品详情"
      width="1000px"
    >
      <div v-if="selectedProduct" class="product-detail">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="product-image-large">
                    <img :src="selectedProduct.image || '/images/product-placeholder.png'" :alt="selectedProduct.name" />
                  </div>
                </el-col>
                <el-col :span="16">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="产品名称">{{ selectedProduct.name }}</el-descriptions-item>
                    <el-descriptions-item label="产品编号">{{ selectedProduct.code }}</el-descriptions-item>
                    <el-descriptions-item label="产品分类">{{ getCategoryText(selectedProduct.category) }}</el-descriptions-item>
                    <el-descriptions-item label="产品状态">
                      <el-tag :type="getStatusType(selectedProduct.status)">
                        {{ getStatusText(selectedProduct.status) }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="负责人">{{ selectedProduct.manager }}</el-descriptions-item>
                    <el-descriptions-item label="创建时间">{{ selectedProduct.createTime }}</el-descriptions-item>
                    <el-descriptions-item label="完成进度">
                      <el-progress :percentage="selectedProduct.progress" :status="getProgressStatus(selectedProduct.progress)" />
                    </el-descriptions-item>
                    <el-descriptions-item label="产品标签">
                      <el-tag
                        v-for="tag in selectedProduct.tags"
                        :key="tag"
                        size="small"
                        style="margin-right: 8px;"
                      >
                        {{ tag }}
                      </el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                  <div style="margin-top: 20px;">
                    <h4>产品描述</h4>
                    <p>{{ selectedProduct.description }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          <el-tab-pane label="设计文档" name="design">
            <div class="design-documents">
              <div class="document-list">
                <div
                  v-for="doc in selectedProduct.documents"
                  :key="doc.id"
                  class="document-item"
                >
                  <div class="doc-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="doc-info">
                    <h4>{{ doc.name }}</h4>
                    <p>{{ doc.description }}</p>
                    <span class="doc-meta">{{ doc.updateTime }} | {{ doc.size }}</span>
                  </div>
                  <div class="doc-actions">
                    <el-button size="small" type="text">预览</el-button>
                    <el-button size="small" type="text">下载</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="BOM清单" name="bom">
            <div class="bom-summary">
              <el-table :data="selectedProduct.bomItems" style="width: 100%">
                <el-table-column prop="code" label="物料编码" width="120" />
                <el-table-column prop="name" label="物料名称" width="200" />
                <el-table-column prop="specification" label="规格" width="150" />
                <el-table-column prop="quantity" label="数量" width="80" />
                <el-table-column prop="unit" label="单位" width="60" />
                <el-table-column prop="unitCost" label="单价" width="80" />
                <el-table-column label="小计" width="80">
                  <template #default="{ row }">
                    ¥{{ (row.quantity * row.unitCost).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="版本历史" name="versions">
            <div class="version-history">
              <el-timeline>
                <el-timeline-item
                  v-for="version in selectedProduct.versions"
                  :key="version.id"
                  :timestamp="version.date"
                  :type="version.type"
                >
                  <h4>{{ version.version }} - {{ version.name }}</h4>
                  <p>{{ version.description }}</p>
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
import {
  Plus, Upload, Download, Search, Grid, List, View, User, Calendar,
  Edit, Document, Clock, More, Check, Warning
} from '@element-plus/icons-vue'

// 响应式数据
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const showCreateProductDialog = ref(false)
const showDetailDialog = ref(false)
const selectedProducts = ref([])
const selectedProduct = ref(null)
const activeTab = ref('basic')
const inputVisible = ref(false)
const inputValue = ref('')
const productFormRef = ref(null)
const tagInputRef = ref(null)

// 产品统计数据
const productStats = ref([
  {
    key: 'total',
    label: '总产品数',
    value: 156,
    icon: 'Document',
    type: 'primary',
    trend: 12.5
  },
  {
    key: 'active',
    label: '活跃产品',
    value: 89,
    icon: 'Check',
    type: 'success',
    trend: 8.3
  },
  {
    key: 'developing',
    label: '开发中',
    value: 23,
    icon: 'Clock',
    type: 'warning',
    trend: -2.1
  },
  {
    key: 'issues',
    label: '问题产品',
    value: 5,
    icon: 'Warning',
    type: 'danger',
    trend: -15.6
  }
])

// 用户列表
const users = ref([
  { id: 1, name: '张工程师' },
  { id: 2, name: '李工程师' },
  { id: 3, name: '王工程师' },
  { id: 4, name: '赵工程师' },
  { id: 5, name: '孙工程师' }
])

// 新产品表单数据
const newProduct = reactive({
  name: '',
  code: '',
  category: '',
  manager: '',
  description: '',
  tags: [],
  image: ''
})

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入产品编号', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择产品分类', trigger: 'change' }
  ],
  manager: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ]
}

// 产品数据
const products = ref([
  {
    id: 1,
    name: '智能控制器 Pro',
    code: 'CTRL-PRO-001',
    category: 'electronic',
    status: 'released',
    progress: 100,
    manager: '张工程师',
    createTime: '2024-01-15',
    description: '新一代智能控制器，集成AI算法和云端连接功能',
    tags: ['智能', 'AI', '云端'],
    image: '/images/product-1.jpg',
    documents: [
      {
        id: 1,
        name: '产品规格书.pdf',
        description: '详细的产品技术规格文档',
        updateTime: '2024-01-15',
        size: '2.5MB'
      },
      {
        id: 2,
        name: '设计图纸.dwg',
        description: 'CAD设计图纸文件',
        updateTime: '2024-01-12',
        size: '15.8MB'
      }
    ],
    bomItems: [
      {
        id: 1,
        code: 'IC001',
        name: '主控芯片',
        specification: 'STM32F407',
        quantity: 1,
        unit: '个',
        unitCost: 45.60
      },
      {
        id: 2,
        code: 'R001',
        name: '电阻',
        specification: '10KΩ 0805',
        quantity: 10,
        unit: '个',
        unitCost: 0.05
      }
    ],
    versions: [
      {
        id: 1,
        version: 'v2.1.0',
        name: '智能优化版本',
        date: '2024-01-15',
        type: 'success',
        description: '新增AI智能推荐功能，优化系统性能'
      },
      {
        id: 2,
        version: 'v2.0.0',
        name: '重大更新版本',
        date: '2023-12-01',
        type: 'primary',
        description: '全新架构设计，提升稳定性'
      }
    ]
  },
  {
    id: 2,
    name: '精密传感器模块',
    code: 'SENS-MOD-002',
    category: 'electronic',
    status: 'developing',
    progress: 75,
    manager: '李工程师',
    createTime: '2024-01-10',
    description: '高精度环境监测传感器模块',
    tags: ['传感器', '高精度', '环境监测'],
    image: '/images/product-2.jpg',
    documents: [],
    bomItems: [],
    versions: []
  },
  {
    id: 3,
    name: '机械臂控制系统',
    code: 'ARM-CTRL-003',
    category: 'mechanical',
    status: 'testing',
    progress: 85,
    manager: '王工程师',
    createTime: '2024-01-05',
    description: '六轴机械臂精密控制系统',
    tags: ['机械臂', '六轴', '精密控制'],
    image: '/images/product-3.jpg',
    documents: [],
    bomItems: [],
    versions: []
  },
  {
    id: 4,
    name: '数据分析软件',
    code: 'DATA-SOFT-004',
    category: 'software',
    status: 'designing',
    progress: 45,
    manager: '赵工程师',
    createTime: '2024-01-01',
    description: '企业级数据分析和可视化软件平台',
    tags: ['数据分析', '可视化', '企业级'],
    image: '/images/product-4.jpg',
    documents: [],
    bomItems: [],
    versions: []
  }
])

// 计算属性
const filteredProducts = computed(() => {
  let result = products.value

  if (searchQuery.value) {
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }

  if (categoryFilter.value) {
    result = result.filter(product => product.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(product => product.status === statusFilter.value)
  }

  totalCount.value = result.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
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

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const getStatusText = (status) => {
  const statusMap = {
    designing: '设计中',
    developing: '开发中',
    testing: '测试中',
    released: '已发布',
    discontinued: '已停产'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    designing: 'info',
    developing: 'warning',
    testing: 'primary',
    released: 'success',
    discontinued: 'danger'
  }
  return typeMap[status] || 'info'
}

const getCategoryText = (category) => {
  const categoryMap = {
    electronic: '电子产品',
    mechanical: '机械产品',
    software: '软件产品',
    composite: '复合产品'
  }
  return categoryMap[category] || category
}

const getProgressStatus = (progress) => {
  if (progress === 100) return 'success'
  if (progress >= 80) return ''
  if (progress >= 60) return 'warning'
  return 'exception'
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}

const viewProductDetail = (product) => {
  selectedProduct.value = product
  activeTab.value = 'basic'
  showDetailDialog.value = true
}

const editProduct = (product) => {
  ElMessage.info(`编辑产品: ${product.name}`)
}

const viewBOM = (product) => {
  ElMessage.info(`查看BOM: ${product.name}`)
}

const viewVersions = (product) => {
  ElMessage.info(`查看版本: ${product.name}`)
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

const handleProductAction = (command) => {
  const [action, id] = command.split('_')
  const product = products.value.find(p => p.id === parseInt(id))
  
  switch (action) {
    case 'clone':
      cloneProduct(product)
      break
    case 'archive':
      archiveProduct(product)
      break
    case 'export':
      exportProduct(product)
      break
    case 'delete':
      deleteProduct(product)
      break
  }
}

const cloneProduct = (product) => {
  const clonedProduct = {
    ...product,
    id: Date.now(),
    name: product.name + ' (副本)',
    code: product.code + '-COPY',
    status: 'designing',
    progress: 0,
    createTime: new Date().toISOString().split('T')[0]
  }
  products.value.push(clonedProduct)
  ElMessage.success('产品克隆成功')
}

const archiveProduct = (product) => {
  ElMessage.info('产品归档功能开发中...')
}

const exportProduct = (product) => {
  ElMessage.info(`导出产品数据: ${product.name}`)
}

const importProducts = () => {
  ElMessage.info('批量导入功能开发中...')
}

const exportProducts = () => {
  ElMessage.info('批量导出功能开发中...')
}

const handleCreateDialogClose = (done) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的数据将丢失。')
    .then(() => {
      resetNewProduct()
      done()
    })
    .catch(() => {})
}

const resetNewProduct = () => {
  Object.assign(newProduct, {
    name: '',
    code: '',
    category: '',
    manager: '',
    description: '',
    tags: [],
    image: ''
  })
}

const createProduct = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    
    const product = {
      id: Date.now(),
      ...newProduct,
      status: 'designing',
      progress: 0,
      createTime: new Date().toISOString().split('T')[0],
      documents: [],
      bomItems: [],
      versions: []
    }
    
    products.value.unshift(product)
    ElMessage.success('产品创建成功')
    showCreateProductDialog.value = false
    resetNewProduct()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const removeTag = (tag) => {
  const index = newProduct.tags.indexOf(tag)
  if (index > -1) {
    newProduct.tags.splice(index, 1)
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !newProduct.tags.includes(inputValue.value)) {
    newProduct.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const beforeImageUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

const handleImageSuccess = (response, file) => {
  newProduct.image = URL.createObjectURL(file.raw)
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.product-management {
  padding: 20px;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
  min-height: 100vh;
  color: #ffffff;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .header-content {
      .page-title {
        font-size: 28px;
        font-weight: bold;
        background: linear-gradient(45deg, #00e5ff, #0080ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 8px;
        text-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
      }

      .page-subtitle {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .product-overview {
    margin-bottom: 30px;

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;

      .overview-card {
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
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
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;

          &.primary {
            background: linear-gradient(135deg, #00e5ff, #0080ff);
            color: #ffffff;
          }

          &.success {
            background: linear-gradient(135deg, #4caf50, #2e7d32);
            color: #ffffff;
          }

          &.warning {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: #ffffff;
          }

          &.danger {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: #ffffff;
          }
        }

        .card-content {
          flex: 1;

          h3 {
            margin: 0 0 5px 0;
            font-size: 24px;
            font-weight: bold;
            color: #00e5ff;
          }

          p {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
          }

          .trend {
            font-size: 12px;
            font-weight: bold;

            &.up {
              color: #4caf50;
            }

            &.down {
              color: #f44336;
            }
          }
        }
      }
    }
  }

  .product-toolbar {
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
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .product-card {
      background: rgba(0, 229, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 229, 255, 0.3);
        border-color: #00e5ff;
      }

      .card-header {
        position: relative;
        height: 200px;
        overflow: hidden;

        .product-image {
          width: 100%;
          height: 100%;
          position: relative;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;

            .el-icon {
              font-size: 24px;
              color: white;
            }
          }

          &:hover .image-overlay {
            opacity: 1;
          }
        }

        .product-status {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          color: white;

          &.designing {
            background: rgba(64, 158, 255, 0.9);
          }

          &.developing {
            background: rgba(255, 152, 0, 0.9);
          }

          &.testing {
            background: rgba(0, 229, 255, 0.9);
          }

          &.released {
            background: rgba(76, 175, 80, 0.9);
          }

          &.discontinued {
            background: rgba(244, 67, 54, 0.9);
          }
        }
      }

      .card-content {
        padding: 20px;

        .product-name {
          font-size: 18px;
          font-weight: bold;
          color: #00e5ff;
          margin-bottom: 8px;
          text-shadow: 0 0 5px rgba(0, 229, 255, 0.3);
        }

        .product-code {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-bottom: 15px;
        }

        .product-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);

            .el-icon {
              font-size: 14px;
            }
          }
        }

        .product-progress {
          margin-bottom: 15px;

          .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
          }
        }

        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;

          .product-tag {
            background: rgba(0, 229, 255, 0.2);
            border-color: #00e5ff;
            color: #00e5ff;
          }
        }
      }

      .card-actions {
        padding: 15px 20px;
        border-top: 1px solid rgba(0, 229, 255, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  .product-table {
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 30px;

    .product-name-cell {
      display: flex;
      align-items: center;
      gap: 10px;

      .product-thumb {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        object-fit: cover;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  .product-detail {
    .basic-info {
      .product-image-large {
        text-align: center;

        img {
          width: 100%;
          max-width: 300px;
          border-radius: 8px;
        }
      }
    }

    .design-documents {
      .document-list {
        .document-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 8px;
          margin-bottom: 10px;

          .doc-icon {
            font-size: 24px;
            color: #00e5ff;
          }

          .doc-info {
            flex: 1;

            h4 {
              margin: 0 0 5px 0;
              color: #00e5ff;
            }

            p {
              margin: 0 0 5px 0;
              color: rgba(255, 255, 255, 0.7);
              font-size: 14px;
            }

            .doc-meta {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.5);
            }
          }

          .doc-actions {
            display: flex;
            gap: 10px;
          }
        }
      }
    }
  }

  .product-uploader {
    border: 2px dashed rgba(0, 229, 255, 0.3);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s ease;

    &:hover {
      border-color: #00e5ff;
    }

    .product-uploader-icon {
      font-size: 28px;
      color: rgba(0, 229, 255, 0.6);
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
    }

    .product-image {
      width: 178px;
      height: 178px;
      display: block;
      object-fit: cover;
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

:deep(.el-input__inner) {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #ffffff;

  &:focus {
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

:deep(.el-table) {
  background: transparent;
  color: #ffffff;

  .el-table__header {
    background: rgba(0, 229, 255, 0.1);
    color: #ffffff;
  }

  .el-table__body {
    background: transparent;
  }

  td, th {
    border-color: rgba(0, 229, 255, 0.2);
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

    .el-form-item__label {
      color: #ffffff;
    }
  }
}

:deep(.el-radio-group) {
  .el-radio-button__inner {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #ffffff;

    &:hover {
      color: #00e5ff;
    }
  }

  .el-radio-button__original-radio:checked + .el-radio-button__inner {
    background: linear-gradient(45deg, #00e5ff, #0080ff);
    border-color: #00e5ff;
    color: #ffffff;
  }
}

:deep(.el-progress-bar__outer) {
  background: rgba(0, 229, 255, 0.2);
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(135deg, #00e5ff, #0080ff);
}

:deep(.el-tag) {
  background: rgba(0, 229, 255, 0.2);
  border-color: #00e5ff;
  color: #00e5ff;
}

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
      }

      .el-descriptions__label {
        background: rgba(0, 229, 255, 0.1);
        color: #ffffff;
      }

      .el-descriptions__content {
        color: #ffffff;
      }
    }
  }
}

:deep(.el-tabs) {
  .el-tabs__header {
    .el-tabs__nav {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 8px;
    }

    .el-tabs__item {
      color: rgba(255, 255, 255, 0.7);

      &.is-active {
        color: #00e5ff;
      }
    }
  }

  .el-tabs__content {
    color: #ffffff;
  }
}

:deep(.el-timeline) {
  .el-timeline-item__timestamp {
    color: rgba(255, 255, 255, 0.6);
  }

  .el-timeline-item__content {
    color: #ffffff;
  }
}
</style>
