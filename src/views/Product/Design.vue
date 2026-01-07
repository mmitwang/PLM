<template>
  <div class="product-design">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">产品设计管理</h1>
        <p class="page-description">管理产品设计文档、版本控制和协作流程</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" class="hologram-btn" @click="showCreateDialog = true">
          <i class="el-icon-plus"></i>
          新建设计
        </el-button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="filter-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索设计名称、编号..."
          prefix-icon="el-icon-search"
          class="search-input"
          @input="handleSearch"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="filter-select">
          <el-option label="全部状态" value=""></el-option>
          <el-option label="设计中" value="designing"></el-option>
          <el-option label="评审中" value="reviewing"></el-option>
          <el-option label="已完成" value="completed"></el-option>
          <el-option label="已发布" value="released"></el-option>
        </el-select>
        <el-select v-model="categoryFilter" placeholder="分类筛选" class="filter-select">
          <el-option label="全部分类" value=""></el-option>
          <el-option label="机械设计" value="mechanical"></el-option>
          <el-option label="电气设计" value="electrical"></el-option>
          <el-option label="软件设计" value="software"></el-option>
          <el-option label="工艺设计" value="process"></el-option>
        </el-select>
      </div>
      <div class="filter-right">
        <el-button-group>
          <el-button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
            <i class="el-icon-menu"></i>
          </el-button>
          <el-button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <i class="el-icon-s-order"></i>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 设计列表 - 网格视图 -->
    <div v-if="viewMode === 'grid'" class="design-grid">
      <div
        v-for="design in filteredDesigns"
        :key="design.id"
        class="design-card"
        @click="viewDesign(design)"
      >
        <div class="card-header">
          <div class="design-preview">
            <img :src="design.preview" :alt="design.name" />
            <div class="preview-overlay">
              <i class="el-icon-view"></i>
            </div>
          </div>
          <div class="design-status" :class="design.status">
            {{ getStatusText(design.status) }}
          </div>
        </div>
        <div class="card-content">
          <h3 class="design-name">{{ design.name }}</h3>
          <p class="design-code">{{ design.code }}</p>
          <div class="design-meta">
            <span class="meta-item">
              <i class="el-icon-user"></i>
              {{ design.designer }}
            </span>
            <span class="meta-item">
              <i class="el-icon-date"></i>
              {{ formatDate(design.updateTime) }}
            </span>
          </div>
          <div class="design-tags">
            <el-tag
              v-for="tag in design.tags"
              :key="tag"
              size="mini"
              class="design-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="card-actions">
          <el-button size="mini" type="text" @click.stop="editDesign(design)">
            编辑
          </el-button>
          <el-button size="mini" type="text" @click.stop="copyDesign(design)">
            复制
          </el-button>
          <el-dropdown @command="handleCommand" trigger="click">
            <el-button size="mini" type="text">
              更多<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="`version_${design.id}`">版本管理</el-dropdown-item>
              <el-dropdown-item :command="`share_${design.id}`">共享协作</el-dropdown-item>
              <el-dropdown-item :command="`export_${design.id}`">导出文件</el-dropdown-item>
              <el-dropdown-item :command="`delete_${design.id}`" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 设计列表 - 列表视图 -->
    <div v-else class="design-table">
      <el-table
        :data="filteredDesigns"
        style="width: 100%"
        @row-click="viewDesign"
        class="hologram-table"
      >
        <el-table-column prop="code" label="设计编号" width="120" />
        <el-table-column prop="name" label="设计名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="mini">{{ getCategoryText(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="mini">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="designer" label="设计师" width="120" />
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="updateTime" label="更新时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="mini" type="text" @click.stop="editDesign(row)">
              编辑
            </el-button>
            <el-button size="mini" type="text" @click.stop="viewVersions(row)">
              版本
            </el-button>
            <el-button size="mini" type="text" @click.stop="shareDesign(row)">
              共享
            </el-button>
            <el-button size="mini" type="text" @click.stop="deleteDesign(row)">
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

    <!-- 创建设计对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建产品设计"
      width="600px"
      class="hologram-dialog"
    >
      <el-form :model="newDesign" :rules="designRules" ref="designForm" label-width="100px">
        <el-form-item label="设计名称" prop="name">
          <el-input v-model="newDesign.name" placeholder="请输入设计名称" />
        </el-form-item>
        <el-form-item label="设计编号" prop="code">
          <el-input v-model="newDesign.code" placeholder="自动生成或手动输入" />
        </el-form-item>
        <el-form-item label="设计分类" prop="category">
          <el-select v-model="newDesign.category" placeholder="请选择分类">
            <el-option label="机械设计" value="mechanical"></el-option>
            <el-option label="电气设计" value="electrical"></el-option>
            <el-option label="软件设计" value="software"></el-option>
            <el-option label="工艺设计" value="process"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设计描述" prop="description">
          <el-input
            v-model="newDesign.description"
            type="textarea"
            :rows="3"
            placeholder="请输入设计描述"
          />
        </el-form-item>
        <el-form-item label="设计标签">
          <el-tag
            v-for="tag in newDesign.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="tagInput"
            v-model="inputValue"
            size="mini"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
            class="tag-input"
          />
          <el-button v-else size="mini" @click="showInput">+ 添加标签</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createDesign">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const searchKeyword = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const showCreateDialog = ref(false)
const inputVisible = ref(false)
const inputValue = ref('')

// 设计数据
const designs = ref([
  {
    id: 1,
    code: 'PD-2024-001',
    name: '智能控制器外壳设计',
    category: 'mechanical',
    status: 'designing',
    designer: '张工程师',
    version: 'v1.2',
    updateTime: '2024-01-15 14:30:00',
    preview: '/images/design-preview-1.jpg',
    tags: ['外壳', '防水', 'IP65'],
    description: '智能控制器外壳的机械设计，包含防水密封结构'
  },
  {
    id: 2,
    code: 'PD-2024-002',
    name: '电路板PCB设计',
    category: 'electrical',
    status: 'reviewing',
    designer: '李工程师',
    version: 'v2.0',
    updateTime: '2024-01-14 16:45:00',
    preview: '/images/design-preview-2.jpg',
    tags: ['PCB', '多层板', '高频'],
    description: '主控制板PCB设计，支持高频信号传输'
  },
  {
    id: 3,
    code: 'PD-2024-003',
    name: '嵌入式软件架构',
    category: 'software',
    status: 'completed',
    designer: '王工程师',
    version: 'v1.0',
    updateTime: '2024-01-13 10:20:00',
    preview: '/images/design-preview-3.jpg',
    tags: ['嵌入式', 'RTOS', '模块化'],
    description: '嵌入式控制软件的整体架构设计'
  },
  {
    id: 4,
    code: 'PD-2024-004',
    name: '生产工艺流程',
    category: 'process',
    status: 'released',
    designer: '赵工程师',
    version: 'v1.1',
    updateTime: '2024-01-12 09:15:00',
    preview: '/images/design-preview-4.jpg',
    tags: ['工艺', '自动化', '质量控制'],
    description: '产品生产工艺流程设计和优化方案'
  }
])

// 新建设计表单
const newDesign = reactive({
  name: '',
  code: '',
  category: '',
  description: '',
  tags: []
})

// 表单验证规则
const designRules = {
  name: [
    { required: true, message: '请输入设计名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入设计编号', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择设计分类', trigger: 'change' }
  ]
}

// 计算属性
const filteredDesigns = computed(() => {
  let result = designs.value

  if (searchKeyword.value) {
    result = result.filter(design =>
      design.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      design.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    result = result.filter(design => design.status === statusFilter.value)
  }

  if (categoryFilter.value) {
    result = result.filter(design => design.category === categoryFilter.value)
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

const getStatusText = (status) => {
  const statusMap = {
    designing: '设计中',
    reviewing: '评审中',
    completed: '已完成',
    released: '已发布'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    designing: 'warning',
    reviewing: 'info',
    completed: 'success',
    released: 'primary'
  }
  return typeMap[status] || 'info'
}

const getCategoryText = (category) => {
  const categoryMap = {
    mechanical: '机械设计',
    electrical: '电气设计',
    software: '软件设计',
    process: '工艺设计'
  }
  return categoryMap[category] || category
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}

const viewDesign = (design) => {
  ElMessage.info(`查看设计: ${design.name}`)
}

const editDesign = (design) => {
  ElMessage.info(`编辑设计: ${design.name}`)
}

const copyDesign = (design) => {
  ElMessage.success(`复制设计: ${design.name}`)
}

const deleteDesign = (design) => {
  ElMessageBox.confirm(
    `确定要删除设计 "${design.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = designs.value.findIndex(d => d.id === design.id)
    if (index > -1) {
      designs.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const viewVersions = (design) => {
  ElMessage.info(`查看版本: ${design.name}`)
}

const shareDesign = (design) => {
  ElMessage.info(`共享设计: ${design.name}`)
}

const handleCommand = (command) => {
  const [action, id] = command.split('_')
  const design = designs.value.find(d => d.id === parseInt(id))
  
  switch (action) {
    case 'version':
      viewVersions(design)
      break
    case 'share':
      shareDesign(design)
      break
    case 'export':
      ElMessage.info(`导出设计: ${design.name}`)
      break
    case 'delete':
      deleteDesign(design)
      break
  }
}

const createDesign = () => {
  // 表单验证和创建逻辑
  const newId = Math.max(...designs.value.map(d => d.id)) + 1
  designs.value.unshift({
    id: newId,
    ...newDesign,
    status: 'designing',
    designer: '当前用户',
    version: 'v1.0',
    updateTime: new Date().toISOString(),
    preview: '/images/design-preview-default.jpg'
  })
  
  // 重置表单
  Object.assign(newDesign, {
    name: '',
    code: '',
    category: '',
    description: '',
    tags: []
  })
  
  showCreateDialog.value = false
  ElMessage.success('创建成功')
}

const removeTag = (tag) => {
  const index = newDesign.tags.indexOf(tag)
  if (index > -1) {
    newDesign.tags.splice(index, 1)
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    document.querySelector('.tag-input input').focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !newDesign.tags.includes(inputValue.value)) {
    newDesign.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.product-design {
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

.design-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.design-card {
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 229, 255, 0.3);
    border-color: var(--hologram-primary);
  }
}

.card-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.design-preview {
  width: 100%;
  height: 100%;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .preview-overlay {
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
    
    i {
      font-size: 2rem;
      color: white;
    }
  }
  
  &:hover .preview-overlay {
    opacity: 1;
  }
}

.design-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  
  &.designing {
    background: rgba(255, 170, 0, 0.9);
    color: white;
  }
  
  &.reviewing {
    background: rgba(64, 158, 255, 0.9);
    color: white;
  }
  
  &.completed {
    background: rgba(0, 255, 136, 0.9);
    color: white;
  }
  
  &.released {
    background: rgba(0, 229, 255, 0.9);
    color: white;
  }
}

.card-content {
  padding: 1rem;
}

.design-name {
  font-size: 1.1rem;
  color: var(--hologram-primary);
  margin-bottom: 0.5rem;
  text-shadow: 0 0 5px var(--hologram-primary);
}

.design-code {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.design-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  
  i {
    font-size: 0.75rem;
  }
}

.design-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.design-tag {
  background: rgba(0, 229, 255, 0.2);
  border-color: var(--hologram-primary);
  color: var(--hologram-primary);
}

.card-actions {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(0, 229, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.tag-item {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag-input {
  width: 100px;
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
  
  .design-grid {
    grid-template-columns: 1fr;
  }
}
</style>
