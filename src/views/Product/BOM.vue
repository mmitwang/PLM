<template>
  <div class="bom-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">BOM物料清单管理</h1>
      <p class="page-subtitle">管理产品物料清单，实现精确的成本控制和供应链管理</p>
    </div>

    <!-- BOM概览 -->
    <div class="bom-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon active">
            <i class="el-icon-document-copy"></i>
          </div>
          <div class="card-content">
            <h3>总BOM数量</h3>
            <p class="count">{{ bomStats.totalBoms }}</p>
            <p class="change">+12 本月新增</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon completed">
            <i class="el-icon-goods"></i>
          </div>
          <div class="card-content">
            <h3>物料种类</h3>
            <p class="count">{{ bomStats.materialTypes }}</p>
            <p class="change">{{ bomStats.activeTypes }} 种在用</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon pending">
            <i class="el-icon-money"></i>
          </div>
          <div class="card-content">
            <h3>总成本</h3>
            <p class="count">¥{{ bomStats.totalCost.toLocaleString() }}</p>
            <p class="change">-5.2% 较上月</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon active">
            <i class="el-icon-warning-outline"></i>
          </div>
          <div class="card-content">
            <h3>待审核</h3>
            <p class="count">{{ bomStats.pendingReview }}</p>
            <p class="change">需要处理</p>
          </div>
        </div>
      </div>
    </div>

    <!-- BOM管理工具栏 -->
    <div class="bom-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索BOM或物料..."
          prefix-icon="el-icon-search"
          style="width: 300px"
          @input="handleSearch"
        ></el-input>
        <el-select v-model="selectedCategory" placeholder="选择分类" style="width: 150px; margin-left: 10px">
          <el-option label="全部" value=""></el-option>
          <el-option label="电子元件" value="electronic"></el-option>
          <el-option label="机械零件" value="mechanical"></el-option>
          <el-option label="原材料" value="material"></el-option>
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <i class="el-icon-plus"></i>
          新建BOM
        </el-button>
        <el-button @click="exportBOM">
          <i class="el-icon-download"></i>
          导出
        </el-button>
      </div>
    </div>

    <!-- BOM列表 -->
    <div class="bom-list">
      <div class="list-header">
        <h2>BOM清单</h2>
        <div class="view-controls">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="tree">树形视图</el-radio-button>
            <el-radio-button label="table">表格视图</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 树形视图 -->
      <div v-if="viewMode === 'tree'" class="tree-view">
        <div class="bom-tree" v-for="bom in filteredBoms" :key="bom.id">
          <div class="bom-header" @click="toggleBom(bom.id)">
            <div class="bom-info">
              <i :class="bom.expanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
              <span class="bom-name">{{ bom.name }}</span>
              <span class="bom-version">v{{ bom.version }}</span>
              <span class="bom-status" :class="bom.status">{{ bom.statusText }}</span>
            </div>
            <div class="bom-actions">
              <el-button size="small" @click.stop="editBom(bom)">编辑</el-button>
              <el-button size="small" @click.stop="copyBom(bom)">复制</el-button>
              <el-button size="small" type="danger" @click.stop="deleteBom(bom.id)">删除</el-button>
            </div>
          </div>
          
          <div v-if="bom.expanded" class="bom-materials">
            <div class="material-item" v-for="material in bom.materials" :key="material.id">
              <div class="material-info">
                <span class="material-code">{{ material.code }}</span>
                <span class="material-name">{{ material.name }}</span>
                <span class="material-spec">{{ material.specification }}</span>
              </div>
              <div class="material-details">
                <span class="quantity">数量: {{ material.quantity }} {{ material.unit }}</span>
                <span class="unit-cost">单价: ¥{{ material.unitCost }}</span>
                <span class="total-cost">小计: ¥{{ (material.quantity * material.unitCost).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-else class="table-view">
        <el-table :data="filteredBoms" style="width: 100%">
          <el-table-column prop="name" label="BOM名称" width="200"></el-table-column>
          <el-table-column prop="version" label="版本" width="80"></el-table-column>
          <el-table-column prop="category" label="分类" width="120"></el-table-column>
          <el-table-column prop="materialCount" label="物料数量" width="100"></el-table-column>
          <el-table-column prop="totalCost" label="总成本" width="120">
            <template #default="scope">
              ¥{{ scope.row.totalCost.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="statusText" label="状态" width="100">
            <template #default="scope">
              <span :class="scope.row.status">{{ scope.row.statusText }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastModified" label="最后修改" width="150"></el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="editBom(scope.row)">编辑</el-button>
              <el-button size="small" @click="copyBom(scope.row)">复制</el-button>
              <el-button size="small" type="danger" @click="deleteBom(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- BOM成本分析 -->
    <div class="cost-analysis">
      <div class="section-header">
        <h2>成本分析</h2>
      </div>
      <div class="analysis-grid">
        <div class="analysis-card">
          <h3>成本构成</h3>
          <div class="chart-container" ref="costChart"></div>
        </div>
        <div class="analysis-card">
          <h3>物料分布</h3>
          <div class="chart-container" ref="materialChart"></div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑BOM对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingBom ? '编辑BOM' : '创建BOM'"
      width="800px"
    >
      <el-form :model="bomForm" :rules="bomRules" ref="bomFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="BOM名称" prop="name">
              <el-input v-model="bomForm.name" placeholder="请输入BOM名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本" prop="version">
              <el-input v-model="bomForm.version" placeholder="如: 1.0"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="bomForm.category" placeholder="选择分类" style="width: 100%">
                <el-option label="电子元件" value="electronic"></el-option>
                <el-option label="机械零件" value="mechanical"></el-option>
                <el-option label="原材料" value="material"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="bomForm.status" placeholder="选择状态" style="width: 100%">
                <el-option label="草稿" value="draft"></el-option>
                <el-option label="审核中" value="reviewing"></el-option>
                <el-option label="已发布" value="published"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input
            v-model="bomForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入BOM描述"
          ></el-input>
        </el-form-item>
        
        <!-- 物料清单 -->
        <el-form-item label="物料清单">
          <div class="materials-section">
            <div class="materials-header">
              <el-button size="small" type="primary" @click="addMaterial">添加物料</el-button>
            </div>
            <el-table :data="bomForm.materials" style="width: 100%; margin-top: 10px">
              <el-table-column prop="code" label="物料编码" width="120"></el-table-column>
              <el-table-column prop="name" label="物料名称" width="150"></el-table-column>
              <el-table-column prop="specification" label="规格" width="120"></el-table-column>
              <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
              <el-table-column prop="unit" label="单位" width="60"></el-table-column>
              <el-table-column prop="unitCost" label="单价" width="80"></el-table-column>
              <el-table-column label="小计" width="80">
                <template #default="scope">
                  ¥{{ (scope.row.quantity * scope.row.unitCost).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button size="small" type="danger" @click="removeMaterial(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="saveBom">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加物料对话框 -->
    <el-dialog v-model="showMaterialDialog" title="添加物料" width="600px">
      <el-form :model="materialForm" ref="materialFormRef" label-width="100px">
        <el-form-item label="物料编码" prop="code">
          <el-input v-model="materialForm.code" placeholder="请输入物料编码"></el-input>
        </el-form-item>
        <el-form-item label="物料名称" prop="name">
          <el-input v-model="materialForm.name" placeholder="请输入物料名称"></el-input>
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input v-model="materialForm.specification" placeholder="请输入规格"></el-input>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="materialForm.quantity" :min="1" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="materialForm.unit" placeholder="选择单位" style="width: 100%">
                <el-option label="个" value="个"></el-option>
                <el-option label="套" value="套"></el-option>
                <el-option label="kg" value="kg"></el-option>
                <el-option label="m" value="m"></el-option>
                <el-option label="L" value="L"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="单价" prop="unitCost">
          <el-input-number v-model="materialForm.unitCost" :precision="2" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showMaterialDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAddMaterial">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('')
const viewMode = ref('tree')
const showCreateDialog = ref(false)
const showMaterialDialog = ref(false)
const editingBom = ref(null)
const costChart = ref(null)
const materialChart = ref(null)
const bomFormRef = ref(null)
const materialFormRef = ref(null)

// BOM统计数据
const bomStats = ref({
  totalBoms: 156,
  materialTypes: 89,
  activeTypes: 67,
  totalCost: 2456789,
  pendingReview: 8
})

// BOM数据
const boms = ref([
  {
    id: 1,
    name: '智能控制器主板',
    version: '2.1',
    category: 'electronic',
    status: 'published',
    statusText: '已发布',
    materialCount: 25,
    totalCost: 156.80,
    lastModified: '2024-01-15',
    expanded: false,
    materials: [
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
      },
      {
        id: 3,
        code: 'C001',
        name: '电容',
        specification: '100nF 0805',
        quantity: 8,
        unit: '个',
        unitCost: 0.08
      }
    ]
  },
  {
    id: 2,
    name: '机械外壳组件',
    version: '1.5',
    category: 'mechanical',
    status: 'reviewing',
    statusText: '审核中',
    materialCount: 12,
    totalCost: 89.50,
    lastModified: '2024-01-12',
    expanded: false,
    materials: [
      {
        id: 4,
        code: 'SHELL001',
        name: '铝合金外壳',
        specification: '150x100x50mm',
        quantity: 1,
        unit: '个',
        unitCost: 65.00
      },
      {
        id: 5,
        code: 'SCREW001',
        name: '不锈钢螺丝',
        specification: 'M3x8',
        quantity: 8,
        unit: '个',
        unitCost: 0.15
      }
    ]
  },
  {
    id: 3,
    name: '电源模块',
    version: '1.0',
    category: 'electronic',
    status: 'draft',
    statusText: '草稿',
    materialCount: 18,
    totalCost: 234.20,
    lastModified: '2024-01-10',
    expanded: false,
    materials: [
      {
        id: 6,
        code: 'PSU001',
        name: '开关电源',
        specification: '24V 5A',
        quantity: 1,
        unit: '个',
        unitCost: 180.00
      },
      {
        id: 7,
        code: 'FUSE001',
        name: '保险丝',
        specification: '5A 250V',
        quantity: 2,
        unit: '个',
        unitCost: 1.20
      }
    ]
  }
])

// 表单数据
const bomForm = reactive({
  name: '',
  version: '',
  category: '',
  status: 'draft',
  description: '',
  materials: []
})

const materialForm = reactive({
  code: '',
  name: '',
  specification: '',
  quantity: 1,
  unit: '个',
  unitCost: 0
})

// 表单验证规则
const bomRules = {
  name: [
    { required: true, message: '请输入BOM名称', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 计算属性
const filteredBoms = computed(() => {
  let filtered = boms.value

  if (searchQuery.value) {
    filtered = filtered.filter(bom =>
      bom.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      bom.materials.some(material =>
        material.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        material.code.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(bom => bom.category === selectedCategory.value)
  }

  return filtered
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const toggleBom = (bomId) => {
  const bom = boms.value.find(b => b.id === bomId)
  if (bom) {
    bom.expanded = !bom.expanded
  }
}

const editBom = (bom) => {
  editingBom.value = bom
  Object.assign(bomForm, {
    name: bom.name,
    version: bom.version,
    category: bom.category,
    status: bom.status,
    description: bom.description || '',
    materials: [...bom.materials]
  })
  showCreateDialog.value = true
}

const copyBom = (bom) => {
  const newBom = {
    ...bom,
    id: Date.now(),
    name: bom.name + ' (副本)',
    version: '1.0',
    status: 'draft',
    statusText: '草稿',
    lastModified: new Date().toISOString().split('T')[0]
  }
  boms.value.push(newBom)
  ElMessage.success('BOM复制成功')
}

const deleteBom = async (bomId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个BOM吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = boms.value.findIndex(bom => bom.id === bomId)
    if (index > -1) {
      boms.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const addMaterial = () => {
  Object.assign(materialForm, {
    code: '',
    name: '',
    specification: '',
    quantity: 1,
    unit: '个',
    unitCost: 0
  })
  showMaterialDialog.value = true
}

const confirmAddMaterial = () => {
  if (!materialForm.code || !materialForm.name) {
    ElMessage.warning('请填写物料编码和名称')
    return
  }
  
  bomForm.materials.push({
    id: Date.now(),
    ...materialForm
  })
  
  showMaterialDialog.value = false
  ElMessage.success('物料添加成功')
}

const removeMaterial = (index) => {
  bomForm.materials.splice(index, 1)
}

const saveBom = async () => {
  if (!bomFormRef.value) return
  
  try {
    await bomFormRef.value.validate()
    
    const totalCost = bomForm.materials.reduce((sum, material) => {
      return sum + (material.quantity * material.unitCost)
    }, 0)
    
    if (editingBom.value) {
      // 编辑现有BOM
      Object.assign(editingBom.value, {
        ...bomForm,
        materialCount: bomForm.materials.length,
        totalCost: totalCost,
        statusText: getStatusText(bomForm.status),
        lastModified: new Date().toISOString().split('T')[0]
      })
      ElMessage.success('BOM更新成功')
    } else {
      // 新建BOM
      const newBom = {
        id: Date.now(),
        ...bomForm,
        materialCount: bomForm.materials.length,
        totalCost: totalCost,
        statusText: getStatusText(bomForm.status),
        lastModified: new Date().toISOString().split('T')[0],
        expanded: false
      }
      boms.value.push(newBom)
      ElMessage.success('BOM创建成功')
    }
    
    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    reviewing: '审核中',
    published: '已发布'
  }
  return statusMap[status] || '未知'
}

const resetForm = () => {
  editingBom.value = null
  Object.assign(bomForm, {
    name: '',
    version: '',
    category: '',
    status: 'draft',
    description: '',
    materials: []
  })
  if (bomFormRef.value) {
    bomFormRef.value.resetFields()
  }
}

const exportBOM = () => {
  ElMessage.success('BOM导出功能开发中...')
}

// 初始化成本分析图表
const initCostChart = () => {
  if (!costChart.value) return
  
  const chart = echarts.init(costChart.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00e5ff',
      textStyle: {
        color: '#ffffff'
      }
    },
    series: [{
      name: '成本构成',
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 45, name: '电子元件' },
        { value: 25, name: '机械零件' },
        { value: 20, name: '原材料' },
        { value: 10, name: '其他' }
      ],
      itemStyle: {
        color: function(params) {
          const colors = ['#00e5ff', '#0080ff', '#0060df', '#0040bf']
          return colors[params.dataIndex]
        }
      },
      label: {
        color: '#ffffff'
      }
    }]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化物料分布图表
const initMaterialChart = () => {
  if (!materialChart.value) return
  
  const chart = echarts.init(materialChart.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00e5ff',
      textStyle: {
        color: '#ffffff'
      }
    },
    xAxis: {
      type: 'category',
      data: ['芯片', '电阻', '电容', '外壳', '螺丝', '电源'],
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
      name: '数量',
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
    series: [{
      data: [12, 156, 89, 23, 67, 34],
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#00e5ff' },
          { offset: 1, color: '#0080ff' }
        ])
      }
    }]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initCostChart()
    initMaterialChart()
  })
})
</script>

<style lang="scss" scoped>
.bom-container {
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

  .bom-overview {
    margin-bottom: 30px;

    .overview-cards {
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

          &.active {
            background: linear-gradient(135deg, #00e5ff, #0080ff);
            color: #ffffff;
          }

          &.completed {
            background: linear-gradient(135deg, #4caf50, #2e7d32);
            color: #ffffff;
          }

          &.pending {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: #ffffff;
          }
        }

        .card-content {
          flex: 1;

          h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #00e5ff;
          }

          .count {
            margin: 0 0 4px 0;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
          }

          .change {
            margin: 0;
            font-size: 12px;
            color: #b0bec5;
          }
        }
      }
    }
  }

  .bom-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 12px;

    .toolbar-left {
      display: flex;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      gap: 10px;
    }
  }

  .bom-list {
    margin-bottom: 30px;

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 {
        margin: 0;
        color: #00e5ff;
        font-size: 24px;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
      }
    }

    .tree-view {
      .bom-tree {
        margin-bottom: 20px;
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 12px;
        overflow: hidden;

        .bom-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          cursor: pointer;
          transition: background 0.3s ease;

          &:hover {
            background: rgba(0, 229, 255, 0.2);
          }

          .bom-info {
            display: flex;
            align-items: center;
            gap: 15px;

            .bom-name {
              font-size: 18px;
              font-weight: bold;
              color: #00e5ff;
            }

            .bom-version {
              padding: 2px 8px;
              background: rgba(0, 128, 255, 0.3);
              border-radius: 12px;
              font-size: 12px;
              color: #0080ff;
            }

            .bom-status {
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;

              &.published {
                background: rgba(76, 175, 80, 0.3);
                color: #4caf50;
              }

              &.reviewing {
                background: rgba(255, 152, 0, 0.3);
                color: #ff9800;
              }

              &.draft {
                background: rgba(158, 158, 158, 0.3);
                color: #9e9e9e;
              }
            }
          }

          .bom-actions {
            display: flex;
            gap: 8px;
          }
        }

        .bom-materials {
          border-top: 1px solid rgba(0, 229, 255, 0.2);
          padding: 15px 20px;

          .material-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid rgba(0, 229, 255, 0.1);

            &:last-child {
              border-bottom: none;
            }

            .material-info {
              display: flex;
              gap: 15px;

              .material-code {
                font-weight: bold;
                color: #00e5ff;
                min-width: 80px;
              }

              .material-name {
                color: #ffffff;
                min-width: 120px;
              }

              .material-spec {
                color: #b0bec5;
                font-size: 14px;
              }
            }

            .material-details {
              display: flex;
              gap: 15px;
              font-size: 14px;

              .quantity {
                color: #ffffff;
              }

              .unit-cost {
                color: #ff9800;
              }

              .total-cost {
                color: #4caf50;
                font-weight: bold;
              }
            }
          }
        }
      }
    }

    .table-view {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 12px;
      overflow: hidden;
    }
  }

  .cost-analysis {
    .section-header {
      margin-bottom: 20px;

      h2 {
        margin: 0;
        color: #00e5ff;
        font-size: 24px;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
      }
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;

      .analysis-card {
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 12px;
        padding: 20px;

        h3 {
          margin: 0 0 15px 0;
          color: #00e5ff;
          font-size: 18px;
        }

        .chart-container {
          height: 300px;
        }
      }
    }
  }

  .materials-section {
    .materials-header {
      margin-bottom: 10px;
    }
  }
}

// Element Plus 样式覆盖
:deep(.el-input__inner) {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #ffffff;

  &:focus {
    border-color: #00e5ff;
  }
}

:deep(.el-select .el-input__inner) {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #ffffff;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #00e5ff, #0080ff);
  border: none;
  color: #ffffff;

  &:hover {
    background: linear-gradient(135deg, #0080ff, #00e5ff);
  }
}

:deep(.el-table) {
  background: transparent;
  color: #ffffff;

  .el-table__header {
    background: rgba(0, 229, 255, 0.2);
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
  background: rgba(10, 25, 41, 0.95);
  border: 1px solid rgba(0, 229, 255, 0.3);

  .el-dialog__header {
    border-bottom: 1px solid rgba(0, 229, 255, 0.2);

    .el-dialog__title {
      color: #00e5ff;
    }
  }

  .el-dialog__body {
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
    background: linear-gradient(135deg, #00e5ff, #0080ff);
    border-color: #00e5ff;
    color: #ffffff;
  }
}
</style>
