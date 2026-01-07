<template>
  <div class="manufacturing-process">
    <!-- 制造工艺概览 -->
    <div class="holographic-card overview-section">
      <div class="card-header">
        <h2 class="holographic-title">
          <i class="el-icon-setting"></i>
          制造工艺管理
        </h2>
        <div class="header-actions">
          <el-button type="primary" class="holographic-btn" @click="showCreateDialog = true">
            <i class="el-icon-plus"></i>
            创建工艺
          </el-button>
          <el-button class="holographic-btn" @click="importProcess">
            <i class="el-icon-upload"></i>
            导入工艺
          </el-button>
          <el-button class="holographic-btn" @click="exportProcess">
            <i class="el-icon-download"></i>
            导出工艺
          </el-button>
        </div>
      </div>
      
      <!-- 工艺统计 -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in processStats" :key="stat.key">
          <div class="stat-icon" :class="stat.iconClass">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺工具栏 -->
    <div class="holographic-card toolbar-section">
      <div class="toolbar-content">
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索工艺名称、编号..."
            class="holographic-input"
            clearable
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </div>
        
        <div class="filter-section">
          <el-select v-model="filterStatus" placeholder="工艺状态" class="holographic-select">
            <el-option label="全部状态" value=""></el-option>
            <el-option label="设计中" value="designing"></el-option>
            <el-option label="审核中" value="reviewing"></el-option>
            <el-option label="已发布" value="published"></el-option>
            <el-option label="已废弃" value="deprecated"></el-option>
          </el-select>
          
          <el-select v-model="filterType" placeholder="工艺类型" class="holographic-select">
            <el-option label="全部类型" value=""></el-option>
            <el-option label="机械加工" value="machining"></el-option>
            <el-option label="装配工艺" value="assembly"></el-option>
            <el-option label="表面处理" value="surface"></el-option>
            <el-option label="质量检验" value="inspection"></el-option>
          </el-select>
          
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="holographic-date-picker"
          />
        </div>
        
        <div class="view-controls">
          <el-radio-group v-model="viewMode" class="holographic-radio-group">
            <el-radio-button label="list">列表视图</el-radio-button>
            <el-radio-button label="card">卡片视图</el-radio-button>
            <el-radio-button label="flow">流程视图</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <!-- 工艺列表 -->
    <div class="holographic-card process-list-section" v-if="viewMode === 'list'">
      <el-table
        :data="filteredProcesses"
        class="holographic-table"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="code" label="工艺编号" width="120" sortable></el-table-column>
        <el-table-column prop="name" label="工艺名称" min-width="200" sortable></el-table-column>
        <el-table-column prop="type" label="工艺类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="工时(小时)" width="100" sortable></el-table-column>
        <el-table-column prop="cost" label="成本(元)" width="120" sortable></el-table-column>
        <el-table-column prop="creator" label="创建人" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" sortable></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewProcess(row)">查看</el-button>
            <el-button size="small" @click="editProcess(row)">编辑</el-button>
            <el-dropdown @command="handleCommand($event, row)">
              <el-button size="small">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy">复制工艺</el-dropdown-item>
                  <el-dropdown-item command="version">版本管理</el-dropdown-item>
                  <el-dropdown-item command="simulate">工艺仿真</el-dropdown-item>
                  <el-dropdown-item command="export">导出工艺</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除工艺</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalProcesses"
          layout="total, sizes, prev, pager, next, jumper"
          class="holographic-pagination"
        />
      </div>
    </div>

    <!-- 工艺卡片视图 -->
    <div class="process-cards-section" v-if="viewMode === 'card'">
      <div class="cards-grid">
        <div
          v-for="process in filteredProcesses"
          :key="process.id"
          class="holographic-card process-card"
          @click="viewProcess(process)"
        >
          <div class="card-header">
            <div class="process-info">
              <h3 class="process-name">{{ process.name }}</h3>
              <p class="process-code">{{ process.code }}</p>
            </div>
            <div class="process-status">
              <el-tag :type="getStatusTagType(process.status)">{{ getStatusLabel(process.status) }}</el-tag>
            </div>
          </div>
          
          <div class="card-content">
            <div class="process-details">
              <div class="detail-item">
                <span class="label">工艺类型:</span>
                <span class="value">{{ getTypeLabel(process.type) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">版本:</span>
                <span class="value">{{ process.version }}</span>
              </div>
              <div class="detail-item">
                <span class="label">工时:</span>
                <span class="value">{{ process.duration }}小时</span>
              </div>
              <div class="detail-item">
                <span class="label">成本:</span>
                <span class="value">¥{{ process.cost }}</span>
              </div>
            </div>
            
            <div class="process-progress">
              <div class="progress-label">完成进度</div>
              <el-progress :percentage="process.progress" :color="getProgressColor(process.progress)"></el-progress>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="creator-info">
              <span class="creator">{{ process.creator }}</span>
              <span class="create-time">{{ process.createTime }}</span>
            </div>
            <div class="card-actions">
              <el-button size="small" type="primary" @click.stop="editProcess(process)">编辑</el-button>
              <el-button size="small" @click.stop="simulateProcess(process)">仿真</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工艺流程视图 -->
    <div class="holographic-card process-flow-section" v-if="viewMode === 'flow'">
      <div class="flow-header">
        <h3>工艺流程图</h3>
        <div class="flow-controls">
          <el-select v-model="selectedProcessId" placeholder="选择工艺" class="holographic-select">
            <el-option
              v-for="process in processes"
              :key="process.id"
              :label="process.name"
              :value="process.id"
            ></el-option>
          </el-select>
          <el-button class="holographic-btn" @click="refreshFlow">刷新</el-button>
        </div>
      </div>
      
      <div class="flow-content" ref="flowChart" id="processFlowChart"></div>
    </div>

    <!-- 创建工艺对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建制造工艺"
      width="800px"
      class="holographic-dialog"
    >
      <el-form :model="newProcess" :rules="processRules" ref="processForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工艺编号" prop="code">
              <el-input v-model="newProcess.code" placeholder="自动生成" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工艺名称" prop="name">
              <el-input v-model="newProcess.name" placeholder="请输入工艺名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工艺类型" prop="type">
              <el-select v-model="newProcess.type" placeholder="请选择工艺类型">
                <el-option label="机械加工" value="machining"></el-option>
                <el-option label="装配工艺" value="assembly"></el-option>
                <el-option label="表面处理" value="surface"></el-option>
                <el-option label="质量检验" value="inspection"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="newProcess.version" placeholder="如: 1.0"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预计工时" prop="duration">
              <el-input-number v-model="newProcess.duration" :min="0" :step="0.5" placeholder="小时"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计成本" prop="cost">
              <el-input-number v-model="newProcess.cost" :min="0" :step="100" placeholder="元"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="工艺描述" prop="description">
          <el-input
            v-model="newProcess.description"
            type="textarea"
            :rows="4"
            placeholder="请输入工艺描述"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="工艺步骤">
          <div class="process-steps">
            <div
              v-for="(step, index) in newProcess.steps"
              :key="index"
              class="step-item"
            >
              <el-input v-model="step.name" placeholder="步骤名称"></el-input>
              <el-input v-model="step.description" placeholder="步骤描述"></el-input>
              <el-input-number v-model="step.duration" :min="0" :step="0.1" placeholder="工时"></el-input-number>
              <el-button type="danger" size="small" @click="removeStep(index)">删除</el-button>
            </div>
            <el-button type="primary" @click="addStep">添加步骤</el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createProcess">创建工艺</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 工艺详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="工艺详情"
      width="1000px"
      class="holographic-dialog"
    >
      <div class="process-detail-content" v-if="selectedProcess">
        <el-tabs v-model="activeTab" class="holographic-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="工艺编号">{{ selectedProcess.code }}</el-descriptions-item>
                <el-descriptions-item label="工艺名称">{{ selectedProcess.name }}</el-descriptions-item>
                <el-descriptions-item label="工艺类型">{{ getTypeLabel(selectedProcess.type) }}</el-descriptions-item>
                <el-descriptions-item label="版本号">{{ selectedProcess.version }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusTagType(selectedProcess.status)">{{ getStatusLabel(selectedProcess.status) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="预计工时">{{ selectedProcess.duration }}小时</el-descriptions-item>
                <el-descriptions-item label="预计成本">¥{{ selectedProcess.cost }}</el-descriptions-item>
                <el-descriptions-item label="创建人">{{ selectedProcess.creator }}</el-descriptions-item>
                <el-descriptions-item label="创建时间" :span="2">{{ selectedProcess.createTime }}</el-descriptions-item>
                <el-descriptions-item label="工艺描述" :span="2">{{ selectedProcess.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="工艺步骤" name="steps">
            <div class="process-steps-detail">
              <el-timeline>
                <el-timeline-item
                  v-for="(step, index) in selectedProcess.steps"
                  :key="index"
                  :timestamp="step.duration + '小时'"
                  placement="top"
                >
                  <el-card>
                    <h4>{{ step.name }}</h4>
                    <p>{{ step.description }}</p>
                    <div class="step-meta">
                      <span>工时: {{ step.duration }}小时</span>
                      <span>状态: {{ step.status || '待执行' }}</span>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="工艺参数" name="parameters">
            <div class="process-parameters">
              <el-table :data="selectedProcess.parameters || []" border>
                <el-table-column prop="name" label="参数名称"></el-table-column>
                <el-table-column prop="value" label="参数值"></el-table-column>
                <el-table-column prop="unit" label="单位"></el-table-column>
                <el-table-column prop="tolerance" label="公差"></el-table-column>
                <el-table-column prop="description" label="说明"></el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="质量要求" name="quality">
            <div class="quality-requirements">
              <el-table :data="selectedProcess.qualityRequirements || []" border>
                <el-table-column prop="item" label="检验项目"></el-table-column>
                <el-table-column prop="standard" label="检验标准"></el-table-column>
                <el-table-column prop="method" label="检验方法"></el-table-column>
                <el-table-column prop="frequency" label="检验频次"></el-table-column>
                <el-table-column prop="responsible" label="责任人"></el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

export default {
  name: 'ManufacturingProcess',
  setup() {
    // 响应式数据
    const searchQuery = ref('')
    const filterStatus = ref('')
    const filterType = ref('')
    const dateRange = ref([])
    const viewMode = ref('list')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const showCreateDialog = ref(false)
    const showDetailDialog = ref(false)
    const selectedProcess = ref(null)
    const selectedProcessId = ref('')
    const activeTab = ref('basic')
    const flowChart = ref(null)

    // 工艺统计数据
    const processStats = ref([
      { key: 'total', label: '总工艺数', value: 156, icon: 'el-icon-document', iconClass: 'primary' },
      { key: 'active', label: '活跃工艺', value: 89, icon: 'el-icon-check', iconClass: 'success' },
      { key: 'reviewing', label: '审核中', value: 23, icon: 'el-icon-time', iconClass: 'warning' },
      { key: 'deprecated', label: '已废弃', value: 12, icon: 'el-icon-close', iconClass: 'danger' }
    ])

    // 工艺数据
    const processes = ref([
      {
        id: 1,
        code: 'PROC-001',
        name: '电机外壳加工工艺',
        type: 'machining',
        version: '2.1',
        status: 'published',
        duration: 8.5,
        cost: 1200,
        progress: 85,
        creator: '张工程师',
        createTime: '2024-01-15 09:30:00',
        description: '电机外壳的精密加工工艺，包含车削、铣削、钻孔等工序',
        steps: [
          { name: '毛坯准备', description: '检查毛坯尺寸和材质', duration: 0.5 },
          { name: '粗加工', description: '车削外圆和端面', duration: 2.0 },
          { name: '精加工', description: '精车配合面', duration: 3.0 },
          { name: '钻孔', description: '钻削螺纹孔', duration: 1.5 },
          { name: '检验', description: '尺寸和表面质量检验', duration: 1.5 }
        ],
        parameters: [
          { name: '切削速度', value: '120', unit: 'm/min', tolerance: '±5', description: '车削时的线速度' },
          { name: '进给量', value: '0.2', unit: 'mm/r', tolerance: '±0.05', description: '每转进给量' }
        ],
        qualityRequirements: [
          { item: '外圆尺寸', standard: 'φ100±0.02', method: '千分尺测量', frequency: '每件', responsible: '质检员' },
          { item: '表面粗糙度', standard: 'Ra1.6', method: '粗糙度仪', frequency: '首件+抽检', responsible: '质检员' }
        ]
      },
      {
        id: 2,
        code: 'PROC-002',
        name: '泵体装配工艺',
        type: 'assembly',
        version: '1.5',
        status: 'reviewing',
        duration: 6.0,
        cost: 800,
        progress: 60,
        creator: '李技师',
        createTime: '2024-01-20 14:15:00',
        description: '离心泵泵体的装配工艺流程',
        steps: [
          { name: '零件准备', description: '检查装配零件', duration: 1.0 },
          { name: '预装配', description: '轴承和密封件安装', duration: 2.0 },
          { name: '主装配', description: '叶轮和泵体装配', duration: 2.5 },
          { name: '调试', description: '装配精度调试', duration: 0.5 }
        ]
      },
      {
        id: 3,
        code: 'PROC-003',
        name: '表面镀锌工艺',
        type: 'surface',
        version: '3.0',
        status: 'published',
        duration: 4.0,
        cost: 300,
        progress: 100,
        creator: '王师傅',
        createTime: '2024-01-18 11:20:00',
        description: '钢铁零件表面镀锌防腐处理工艺',
        steps: [
          { name: '前处理', description: '除油除锈处理', duration: 1.0 },
          { name: '镀锌', description: '电镀锌层', duration: 2.0 },
          { name: '后处理', description: '钝化和干燥', duration: 1.0 }
        ]
      }
    ])

    // 新建工艺表单
    const newProcess = reactive({
      code: '',
      name: '',
      type: '',
      version: '1.0',
      duration: 0,
      cost: 0,
      description: '',
      steps: [
        { name: '', description: '', duration: 0 }
      ]
    })

    // 表单验证规则
    const processRules = {
      name: [{ required: true, message: '请输入工艺名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择工艺类型', trigger: 'change' }],
      version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
    }

    // 计算属性
    const filteredProcesses = computed(() => {
      let filtered = processes.value

      if (searchQuery.value) {
        filtered = filtered.filter(process =>
          process.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          process.code.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (filterStatus.value) {
        filtered = filtered.filter(process => process.status === filterStatus.value)
      }

      if (filterType.value) {
        filtered = filtered.filter(process => process.type === filterType.value)
      }

      return filtered
    })

    const totalProcesses = computed(() => filteredProcesses.value.length)

    // 方法
    const getStatusTagType = (status) => {
      const statusMap = {
        designing: 'info',
        reviewing: 'warning',
        published: 'success',
        deprecated: 'danger'
      }
      return statusMap[status] || 'info'
    }

    const getStatusLabel = (status) => {
      const statusMap = {
        designing: '设计中',
        reviewing: '审核中',
        published: '已发布',
        deprecated: '已废弃'
      }
      return statusMap[status] || '未知'
    }

    const getTypeTagType = (type) => {
      const typeMap = {
        machining: 'primary',
        assembly: 'success',
        surface: 'warning',
        inspection: 'info'
      }
      return typeMap[type] || 'info'
    }

    const getTypeLabel = (type) => {
      const typeMap = {
        machining: '机械加工',
        assembly: '装配工艺',
        surface: '表面处理',
        inspection: '质量检验'
      }
      return typeMap[type] || '未知'
    }

    const getProgressColor = (percentage) => {
      if (percentage < 30) return '#f56c6c'
      if (percentage < 70) return '#e6a23c'
      return '#67c23a'
    }

    const handleSelectionChange = (selection) => {
      console.log('选中的工艺:', selection)
    }

    const handleCommand = (command, row) => {
      switch (command) {
        case 'copy':
          copyProcess(row)
          break
        case 'version':
          manageVersion(row)
          break
        case 'simulate':
          simulateProcess(row)
          break
        case 'export':
          exportSingleProcess(row)
          break
        case 'delete':
          deleteProcess(row)
          break
      }
    }

    const viewProcess = (process) => {
      selectedProcess.value = process
      showDetailDialog.value = true
    }

    const editProcess = (process) => {
      // 编辑工艺逻辑
      ElMessage.info('编辑工艺功能开发中...')
    }

    const copyProcess = (process) => {
      ElMessage.success(`已复制工艺: ${process.name}`)
    }

    const manageVersion = (process) => {
      ElMessage.info('版本管理功能开发中...')
    }

    const simulateProcess = (process) => {
      ElMessage.info(`正在启动工艺仿真: ${process.name}`)
    }

    const deleteProcess = (process) => {
      ElMessageBox.confirm(
        `确定要删除工艺 "${process.name}" 吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = processes.value.findIndex(p => p.id === process.id)
        if (index > -1) {
          processes.value.splice(index, 1)
          ElMessage.success('删除成功')
        }
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    }

    const importProcess = () => {
      ElMessage.info('导入工艺功能开发中...')
    }

    const exportProcess = () => {
      ElMessage.info('导出工艺功能开发中...')
    }

    const exportSingleProcess = (process) => {
      ElMessage.success(`正在导出工艺: ${process.name}`)
    }

    const addStep = () => {
      newProcess.steps.push({ name: '', description: '', duration: 0 })
    }

    const removeStep = (index) => {
      if (newProcess.steps.length > 1) {
        newProcess.steps.splice(index, 1)
      }
    }

    const createProcess = () => {
      // 生成工艺编号
      const maxId = Math.max(...processes.value.map(p => p.id), 0)
      const newId = maxId + 1
      newProcess.code = `PROC-${String(newId).padStart(3, '0')}`

      // 添加到工艺列表
      processes.value.push({
        id: newId,
        code: newProcess.code,
        name: newProcess.name,
        type: newProcess.type,
        version: newProcess.version,
        status: 'designing',
        duration: newProcess.duration,
        cost: newProcess.cost,
        progress: 0,
        creator: '当前用户',
        createTime: new Date().toLocaleString(),
        description: newProcess.description,
        steps: [...newProcess.steps]
      })

      ElMessage.success('工艺创建成功')
      showCreateDialog.value = false
      
      // 重置表单
      Object.assign(newProcess, {
        code: '',
        name: '',
        type: '',
        version: '1.0',
        duration: 0,
        cost: 0,
        description: '',
        steps: [{ name: '', description: '', duration: 0 }]
      })
    }

    const refreshFlow = () => {
      if (selectedProcessId.value && flowChart.value) {
        initFlowChart()
      }
    }

    const initFlowChart = () => {
      if (!flowChart.value) return
      
      const chart = echarts.init(flowChart.value)
      const option = {
        backgroundColor: 'transparent',
        title: {
          text: '工艺流程图',
          textStyle: {
            color: '#00e5ff'
          }
        },
        series: [{
          type: 'graph',
          layout: 'force',
          data: [
            { name: '开始', x: 100, y: 100, symbolSize: 50, itemStyle: { color: '#00e5ff' } },
            { name: '准备', x: 200, y: 100, symbolSize: 40, itemStyle: { color: '#0080ff' } },
            { name: '加工', x: 300, y: 100, symbolSize: 40, itemStyle: { color: '#0080ff' } },
            { name: '检验', x: 400, y: 100, symbolSize: 40, itemStyle: { color: '#0080ff' } },
            { name: '完成', x: 500, y: 100, symbolSize: 50, itemStyle: { color: '#00e5ff' } }
          ],
          links: [
            { source: '开始', target: '准备' },
            { source: '准备', target: '加工' },
            { source: '加工', target: '检验' },
            { source: '检验', target: '完成' }
          ],
          label: {
            show: true,
            color: '#ffffff'
          },
          lineStyle: {
            color: '#00e5ff',
            width: 2
          }
        }]
      }
      chart.setOption(option)
    }

    // 生命周期钩子
    onMounted(() => {
      nextTick(() => {
        if (viewMode.value === 'flow') {
          initFlowChart()
        }
      })
    })

    return {
      searchQuery,
      filterStatus,
      filterType,
      dateRange,
      viewMode,
      currentPage,
      pageSize,
      showCreateDialog,
      showDetailDialog,
      selectedProcess,
      selectedProcessId,
      activeTab,
      flowChart,
      processStats,
      processes,
      newProcess,
      processRules,
      filteredProcesses,
      totalProcesses,
      getStatusTagType,
      getStatusLabel,
      getTypeTagType,
      getTypeLabel,
      getProgressColor,
      handleSelectionChange,
      handleCommand,
      viewProcess,
      editProcess,
      copyProcess,
      manageVersion,
      simulateProcess,
      deleteProcess,
      importProcess,
      exportProcess,
      exportSingleProcess,
      addStep,
      removeStep,
      createProcess,
      refreshFlow
    }
  }
}
</script>

<style lang="scss" scoped>
.manufacturing-process {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);

  .overview-section {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;

      .stat-card {
        display: flex;
        align-items: center;
        padding: 20px;
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 8px;

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 24px;

          &.primary { background: rgba(0, 229, 255, 0.2); color: #00e5ff; }
          &.success { background: rgba(103, 194, 58, 0.2); color: #67c23a; }
          &.warning { background: rgba(230, 162, 60, 0.2); color: #e6a23c; }
          &.danger { background: rgba(245, 108, 108, 0.2); color: #f56c6c; }
        }

        .stat-content {
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #00e5ff;
            margin-bottom: 5px;
          }

          .stat-label {
            color: #ffffff;
            opacity: 0.8;
          }
        }
      }
    }
  }

  .toolbar-section {
    margin-bottom: 20px;

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;

      .search-section {
        flex: 1;
        min-width: 200px;
      }

      .filter-section {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .view-controls {
        flex-shrink: 0;
      }
    }
  }

  .process-list-section {
    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .process-cards-section {
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;

      .process-card {
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 229, 255, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;

          .process-info {
            .process-name {
              color: #00e5ff;
              margin: 0 0 5px 0;
              font-size: 16px;
            }

            .process-code {
              color: #ffffff;
              opacity: 0.7;
              margin: 0;
              font-size: 12px;
            }
          }
        }

        .card-content {
          margin-bottom: 15px;

          .process-details {
            margin-bottom: 15px;

            .detail-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;

              .label {
                color: #ffffff;
                opacity: 0.7;
              }

              .value {
                color: #00e5ff;
                font-weight: 500;
              }
            }
          }

          .process-progress {
            .progress-label {
              color: #ffffff;
              opacity: 0.7;
              margin-bottom: 8px;
              font-size: 12px;
            }
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .creator-info {
            display: flex;
            flex-direction: column;
            font-size: 12px;

            .creator {
              color: #00e5ff;
              margin-bottom: 2px;
            }

            .create-time {
              color: #ffffff;
              opacity: 0.5;
            }
          }

          .card-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }

  .process-flow-section {
    .flow-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        color: #00e5ff;
        margin: 0;
      }

      .flow-controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    }

    .flow-content {
      height: 500px;
      background: rgba(0, 229, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 8px;
    }
  }

  .process-steps {
    .step-item {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: center;

      .el-input {
        flex: 1;
      }

      .el-input-number {
        width: 120px;
      }
    }
  }

  .process-detail-content {
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
                color: #ffffff;
              }

              .el-descriptions__content {
                color: #ffffff;
              }
            }
          }
        }
      }
    }

    .process-steps-detail {
      :deep(.el-timeline) {
        .el-timeline-item__timestamp {
          color: #00e5ff;
        }

        .el-timeline-item__node {
          background: #00e5ff;
          border-color: #00e5ff;
        }

        .el-timeline-item__wrapper {
          .el-card {
            background: rgba(0, 229, 255, 0.1);
            border-color: rgba(0, 229, 255, 0.3);

            .el-card__body {
              h4 {
                color: #00e5ff;
                margin: 0 0 10px 0;
              }

              p {
                color: #ffffff;
                opacity: 0.8;
                margin: 0 0 10px 0;
              }

              .step-meta {
                display: flex;
                gap: 20px;
                font-size: 12px;
                color: #ffffff;
                opacity: 0.6;
              }
            }
          }
        }
      }
    }
  }
}
</style>
