<template>
  <div class="bom-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">BOM物料清单管理</h1>
        <p class="page-description">管理产品物料清单、结构层次和成本分析</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" class="hologram-btn" @click="showCreateDialog = true">
          <i class="el-icon-plus"></i>
          新建BOM
        </el-button>
        <el-button type="success" class="hologram-btn" @click="importBOM">
          <i class="el-icon-upload"></i>
          导入BOM
        </el-button>
      </div>
    </div>

    <!-- BOM统计概览 -->
    <div class="bom-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon primary">
            <i class="el-icon-document"></i>
          </div>
          <div class="card-content">
            <h3>总BOM数量</h3>
            <div class="card-stats">
              <span class="count">{{ totalBOMs }}</span>
              <span class="label">个</span>
            </div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon success">
            <i class="el-icon-goods"></i>
          </div>
          <div class="card-content">
            <h3>物料种类</h3>
            <div class="card-stats">
              <span class="count">{{ totalMaterials }}</span>
              <span class="label">种</span>
            </div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon warning">
            <i class="el-icon-money"></i>
          </div>
          <div class="card-content">
            <h3>总成本</h3>
            <div class="card-stats">
              <span class="count">{{ totalCost }}</span>
              <span class="label">万元</span>
            </div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon danger">
            <i class="el-icon-warning"></i>
          </div>
          <div class="card-content">
            <h3>缺料预警</h3>
            <div class="card-stats">
              <span class="count">{{ shortageCount }}</span>
              <span class="label">项</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="filter-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索BOM名称、编号..."
          prefix-icon="el-icon-search"
          class="search-input"
          @input="handleSearch"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="filter-select">
          <el-option label="全部状态" value=""></el-option>
          <el-option label="设计中" value="designing"></el-option>
          <el-option label="已发布" value="released"></el-option>
          <el-option label="已生效" value="active"></el-option>
          <el-option label="已停用" value="inactive"></el-option>
        </el-select>
        <el-select v-model="typeFilter" placeholder="类型筛选" class="filter-select">
          <el-option label="全部类型" value=""></el-option>
          <el-option label="工程BOM" value="ebom"></el-option>
          <el-option label="制造BOM" value="mbom"></el-option>
          <el-option label="采购BOM" value="pbom"></el-option>
        </el-select>
      </div>
      <div class="filter-right">
        <el-button-group>
          <el-button :class="{ active: viewMode === 'tree' }" @click="viewMode = 'tree'">
            <i class="el-icon-share"></i>
            树形
          </el-button>
          <el-button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
            <i class="el-icon-s-order"></i>
            列表
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- BOM列表 -->
    <div class="bom-list">
      <!-- 树形视图 -->
      <div v-if="viewMode === 'tree'" class="tree-view">
        <div 
          v-for="bom in filteredBOMs" 
          :key="bom.id" 
          class="bom-tree-item"
        >
          <div class="bom-header" @click="toggleBOM(bom)">
            <div class="header-left">
              <i 
                :class="bom.expanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
                class="expand-icon"
              ></i>
              <div class="bom-info">
                <h3 class="bom-name">{{ bom.name }}</h3>
                <span class="bom-code">{{ bom.code }}</span>
              </div>
            </div>
            <div class="header-right">
              <el-tag :type="getStatusType(bom.status)" size="mini">
                {{ getStatusText(bom.status) }}
              </el-tag>
              <el-tag size="mini" class="type-tag">
                {{ getTypeText(bom.type) }}
              </el-tag>
              <span class="cost-info">成本: ¥{{ bom.totalCost }}</span>
            </div>
          </div>
          
          <!-- BOM结构树 -->
          <div v-if="bom.expanded" class="bom-structure">
            <el-tree
              :data="bom.structure"
              :props="treeProps"
              node-key="id"
              :default-expand-all="false"
              class="hologram-tree"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <div class="node-content">
                    <span class="material-name">{{ data.name }}</span>
                    <span class="material-spec">{{ data.specification }}</span>
                  </div>
                  <div class="node-meta">
                    <span class="quantity">数量: {{ data.quantity }}{{ data.unit }}</span>
                    <span class="cost">单价: ¥{{ data.unitPrice }}</span>
                    <span class="total">小计: ¥{{ (data.quantity * data.unitPrice).toFixed(2) }}</span>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
          
          <!-- 操作按钮 -->
          <div class="bom-actions">
            <el-button size="mini" type="text" @click="editBOM(bom)">
              编辑
            </el-button>
            <el-button size="mini" type="text" @click="copyBOM(bom)">
              复制
            </el-button>
            <el-button size="mini" type="text" @click="exportBOM(bom)">
              导出
            </el-button>
            <el-button size="mini" type="text" @click="analyzeCost(bom)">
              成本分析
            </el-button>
            <el-dropdown @command="handleCommand" trigger="click">
              <el-button size="mini" type="text">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="`version_${bom.id}`">版本管理</el-dropdown-item>
                <el-dropdown-item :command="`compare_${bom.id}`">对比分析</el-dropdown-item>
                <el-dropdown-item :command="`release_${bom.id}`">发布BOM</el-dropdown-item>
                <el-dropdown-item :command="`delete_${bom.id}`" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-else class="table-view">
        <el-table
          :data="filteredBOMs"
          style="width: 100%"
          @row-click="viewBOM"
          class="hologram-table"
        >
          <el-table-column prop="code" label="BOM编号" width="120" />
          <el-table-column prop="name" label="BOM名称" min-width="200" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="mini">{{ getTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="mini">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="version" label="版本" width="80" />
          <el-table-column prop="materialCount" label="物料数" width="80" />
          <el-table-column prop="totalCost" label="总成本" width="120">
            <template #default="{ row }">
              ¥{{ row.totalCost }}
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" width="100" />
          <el-table-column prop="updateTime" label="更新时间" width="150">
            <template #default="{ row }">
              {{ formatDate(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="mini" type="text" @click.stop="editBOM(row)">
                编辑
              </el-button>
              <el-button size="mini" type="text" @click.stop="copyBOM(row)">
                复制
              </el-button>
              <el-button size="mini" type="text" @click.stop="exportBOM(row)">
                导出
              </el-button>
              <el-button size="mini" type="text" @click.stop="deleteBOM(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
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

    <!-- 创建BOM对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建BOM"
      width="600px"
      class="hologram-dialog"
    >
      <el-form :model="newBOM" :rules="bomRules" ref="bomForm" label-width="100px">
        <el-form-item label="BOM名称" prop="name">
          <el-input v-model="newBOM.name" placeholder="请输入BOM名称" />
        </el-form-item>
        <el-form-item label="BOM编号" prop="code">
          <el-input v-model="newBOM.code" placeholder="自动生成或手动输入" />
        </el-form-item>
        <el-form-item label="BOM类型" prop="type">
          <el-select v-model="newBOM.type" placeholder="请选择BOM类型">
            <el-option label="工程BOM" value="ebom"></el-option>
            <el-option label="制造BOM" value="mbom"></el-option>
            <el-option label="采购BOM" value="pbom"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="newBOM.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="newBOM.version" placeholder="如: v1.0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newBOM.description"
            type="textarea"
            :rows="3"
            placeholder="请输入BOM描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createBOM">确定</el-button>
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
const statusFilter = ref('')
const typeFilter = ref('')
const viewMode = ref('tree')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const showCreateDialog = ref(false)

// 统计数据
const totalBOMs = ref(15)
const totalMaterials = ref(156)
const totalCost = ref(245.8)
const shortageCount = ref(3)

// 树形结构属性
const treeProps = {
  children: 'children',
  label: 'name'
}

// BOM数据
const boms = ref([
  {
    id: 1,
    code: 'BOM-2024-001',
    name: '智能控制器主板BOM',
    type: 'ebom',
    status: 'active',
    version: 'v2.1',
    materialCount: 45,
    totalCost: 1250.50,
    creator: '张工程师',
    updateTime: '2024-01-15 14:30:00',
    expanded: false,
    structure: [
      {
        id: 'mat-001',
        name: '主控芯片',
        specification: 'STM32F407VGT6',
        quantity: 1,
        unit: '个',
        unitPrice: 45.50,
        children: []
      },
      {
        id: 'mat-002',
        name: '电阻',
        specification: '0805 10KΩ ±1%',
        quantity: 20,
        unit: '个',
        unitPrice: 0.05,
        children: []
      },
      {
        id: 'mat-003',
        name: '电容',
        specification: '0805 100nF ±10%',
        quantity: 15,
        unit: '个',
        unitPrice: 0.08,
        children: []
      }
    ]
  },
  {
    id: 2,
    code: 'BOM-2024-002',
    name: '外壳组件BOM',
    type: 'mbom',
    status: 'released',
    version: 'v1.5',
    materialCount: 12,
    totalCost: 85.30,
    creator: '李工程师',
    updateTime: '2024-01-14 16:45:00',
    expanded: false,
    structure: [
      {
        id: 'mat-004',
        name: '上盖',
        specification: 'ABS塑料 黑色',
        quantity: 1,
        unit: '个',
        unitPrice: 25.00,
        children: []
      },
      {
        id: 'mat-005',
        name: '下盖',
        specification: 'ABS塑料 黑色',
        quantity: 1,
        unit: '个',
        unitPrice: 22.00,
        children: []
      }
    ]
  },
  {
    id: 3,
    code: 'BOM-2024-003',
    name: '电源模块BOM',
    type: 'pbom',
    status: 'designing',
    version: 'v1.0',
    materialCount: 8,
    totalCost: 156.80,
    creator: '王工程师',
    updateTime: '2024-01-13 10:20:00',
    expanded: false,
    structure: [
      {
        id: 'mat-006',
        name: '开关电源',
        specification: '24V 2A',
        quantity: 1,
        unit: '个',
        unitPrice: 120.00,
        children: []
      }
    ]
  }
])

// 新建BOM表单
const newBOM = reactive({
  name: '',
  code: '',
  type: 'ebom',
  productName: '',
  version: 'v1.0',
  description: ''
})

// 表单验证规则
const bomRules = {
  name: [
    { required: true, message: '请输入BOM名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入BOM编号', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择BOM类型', trigger: 'change' }
  ],
  productName: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ]
}

// 计算属性
const filteredBOMs = computed(() => {
  let result = boms.value

  if (searchKeyword.value) {
    result = result.filter(bom =>
      bom.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      bom.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    result = result.filter(bom => bom.status === statusFilter.value)
  }

  if (typeFilter.value) {
    result = result.filter(bom => bom.type === typeFilter.value)
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
    released: '已发布',
    active: '已生效',
    inactive: '已停用'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    designing: 'warning',
    released: 'info',
    active: 'success',
    inactive: 'danger'
  }
  return typeMap[status] || 'info'
}

const getTypeText = (type) => {
  const typeMap = {
    ebom: '工程BOM',
    mbom: '制造BOM',
    pbom: '采购BOM'
  }
  return typeMap[type] || type
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString()
}

const toggleBOM = (bom) => {
  bom.expanded = !bom.expanded
}

const viewBOM = (bom) => {
  ElMessage.info(`查看BOM: ${bom.name}`)
}

const editBOM = (bom) => {
  ElMessage.info(`编辑BOM: ${bom.name}`)
}

const copyBOM = (bom) => {
  ElMessage.success(`复制BOM: ${bom.name}`)
}

const exportBOM = (bom) => {
  ElMessage.info(`导出BOM: ${bom.name}`)
}

const analyzeCost = (bom) => {
  ElMessage.info(`成本分析: ${bom.name}`)
}

const importBOM = () => {
  ElMessage.info('导入BOM功能')
}

const deleteBOM = (bom) => {
  ElMessageBox.confirm(
    `确定要删除BOM "${bom.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = boms.value.findIndex(b => b.id === bom.id)
    if (index > -1) {
      boms.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleCommand = (command) => {
  const [action, id] = command.split('_')
  const bom = boms.value.find(b => b.id === parseInt(id))
  
  switch (action) {
    case 'version':
      ElMessage.info(`版本管理: ${bom.name}`)
      break
    case 'compare':
      ElMessage.info(`对比分析: ${bom.name}`)
      break
    case 'release':
      ElMessage.info(`发布BOM: ${bom.name}`)
      break
    case 'delete':
      deleteBOM(bom)
      break
  }
}

const createBOM = () => {
  const newId = Math.max(...boms.value.map(b => b.id)) + 1
  boms.value.unshift({
    id: newId,
    ...newBOM,
    status: 'designing',
    materialCount: 0,
    totalCost: 0,
    creator: '当前用户',
    updateTime: new Date().toISOString(),
    expanded: false,
    structure: []
  })
  
  // 重置表单
  Object.assign(newBOM, {
    name: '',
    code: '',
    type: 'ebom',
    productName: '',
    version: 'v1.0',
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
.bom-management {
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

.header-actions {
  display: flex;
  gap: 1rem;
}

// BOM概览
.bom-overview {
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
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 229, 255, 0.2);
  }
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  
  i {
    font-size: 1.5rem;
    color: white;
  }
  
  &.primary { background: rgba(0, 229, 255, 0.8); }
  &.success { background: rgba(0, 255, 136, 0.8); }
  &.warning { background: rgba(255, 170, 0, 0.8); }
  &.danger { background: rgba(255, 69, 58, 0.8); }
}

.card-content {
  h3 {
    color: var(--hologram-primary);
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
}

.card-stats {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  
  .count {
    font-size: 2rem;
    font-weight: 700;
    color: var(--hologram-primary);
  }
  
  .label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
  }
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

// BOM列表
.bom-list {
  margin-bottom: 2rem;
}

// 树形视图
.tree-view {
  .bom-tree-item {
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;
    margin-bottom: 1rem;
    backdrop-filter: blur(10px);
    overflow: hidden;
  }
  
  .bom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background: rgba(0, 229, 255, 0.1);
    }
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .expand-icon {
      color: var(--hologram-primary);
      transition: transform 0.3s ease;
    }
    
    .bom-info {
      .bom-name {
        color: var(--hologram-primary);
        font-size: 1.1rem;
        margin: 0 0 0.25rem 0;
      }
      
      .bom-code {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .type-tag {
      background: rgba(0, 128, 255, 0.2);
      border-color: var(--hologram-secondary);
      color: var(--hologram-secondary);
    }
    
    .cost-info {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }
  }
  
  .bom-structure {
    padding: 0 1rem 1rem 1rem;
    border-top: 1px solid rgba(0, 229, 255, 0.2);
  }
  
  .bom-actions {
    padding: 1rem;
    border-top: 1px solid rgba(0, 229, 255, 0.2);
    display: flex;
    gap: 0.5rem;
  }
}

// 树形节点样式
.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0;
  
  .node-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    
    .material-name {
      color: var(--hologram-primary);
      font-weight: 500;
    }
    
    .material-spec {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
    }
  }
  
  .node-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    
    .quantity, .cost, .total {
      white-space: nowrap;
    }
    
    .total {
      color: var(--hologram-primary);
      font-weight: 500;
    }
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
  
  .header-actions {
    flex-direction: column;
    width: 100%;
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
  
  .bom-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-right {
    flex-wrap: wrap;
  }
  
  .tree-node {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .node-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
