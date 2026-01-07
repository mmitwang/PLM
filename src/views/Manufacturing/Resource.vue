<template>
  <div class="manufacturing-resource">
    <!-- 制造资源概览 -->
    <div class="holographic-card overview-section">
      <div class="card-header">
        <h2 class="holographic-title">
          <i class="el-icon-cpu"></i>
          制造资源管理
        </h2>
        <div class="header-actions">
          <el-button type="primary" class="holographic-btn" @click="showCreateDialog = true">
            <i class="el-icon-plus"></i>
            添加资源
          </el-button>
          <el-button class="holographic-btn" @click="importResource">
            <i class="el-icon-upload"></i>
            导入资源
          </el-button>
          <el-button class="holographic-btn" @click="exportResource">
            <i class="el-icon-download"></i>
            导出资源
          </el-button>
        </div>
      </div>
      
      <!-- 资源统计 -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in resourceStats" :key="stat.key">
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

    <!-- 资源工具栏 -->
    <div class="holographic-card toolbar-section">
      <div class="toolbar-content">
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索资源名称、编号..."
            class="holographic-input"
            clearable
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </div>
        
        <div class="filter-section">
          <el-select v-model="filterStatus" placeholder="资源状态" class="holographic-select">
            <el-option label="全部状态" value=""></el-option>
            <el-option label="空闲" value="idle"></el-option>
            <el-option label="运行中" value="running"></el-option>
            <el-option label="维护中" value="maintenance"></el-option>
            <el-option label="故障" value="fault"></el-option>
          </el-select>
          
          <el-select v-model="filterType" placeholder="资源类型" class="holographic-select">
            <el-option label="全部类型" value=""></el-option>
            <el-option label="加工设备" value="machine"></el-option>
            <el-option label="检测设备" value="inspection"></el-option>
            <el-option label="运输设备" value="transport"></el-option>
            <el-option label="工装夹具" value="fixture"></el-option>
          </el-select>
          
          <el-select v-model="filterLocation" placeholder="所在位置" class="holographic-select">
            <el-option label="全部位置" value=""></el-option>
            <el-option label="车间A" value="workshop-a"></el-option>
            <el-option label="车间B" value="workshop-b"></el-option>
            <el-option label="装配线" value="assembly-line"></el-option>
            <el-option label="质检区" value="qc-area"></el-option>
          </el-select>
        </div>
        
        <div class="view-controls">
          <el-radio-group v-model="viewMode" class="holographic-radio-group">
            <el-radio-button label="list">列表视图</el-radio-button>
            <el-radio-button label="card">卡片视图</el-radio-button>
            <el-radio-button label="monitor">监控视图</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <!-- 资源列表视图 -->
    <div class="holographic-card resource-list-section" v-if="viewMode === 'list'">
      <el-table
        :data="filteredResources"
        class="holographic-table"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="code" label="资源编号" width="120" sortable></el-table-column>
        <el-table-column prop="name" label="资源名称" min-width="200" sortable></el-table-column>
        <el-table-column prop="type" label="资源类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="120"></el-table-column>
        <el-table-column prop="utilization" label="利用率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.utilization" :color="getUtilizationColor(row.utilization)" :show-text="false"></el-progress>
            <span class="utilization-text">{{ row.utilization }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="efficiency" label="效率" width="100">
          <template #default="{ row }">
            {{ row.efficiency }}%
          </template>
        </el-table-column>
        <el-table-column prop="lastMaintenance" label="上次维护" width="120"></el-table-column>
        <el-table-column prop="responsible" label="负责人" width="100"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewResource(row)">查看</el-button>
            <el-button size="small" @click="editResource(row)">编辑</el-button>
            <el-dropdown @command="handleCommand($event, row)">
              <el-button size="small">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="schedule">排程管理</el-dropdown-item>
                  <el-dropdown-item command="maintenance">维护记录</el-dropdown-item>
                  <el-dropdown-item command="performance">性能分析</el-dropdown-item>
                  <el-dropdown-item command="export">导出数据</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除资源</el-dropdown-item>
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
          :total="totalResources"
          layout="total, sizes, prev, pager, next, jumper"
          class="holographic-pagination"
        />
      </div>
    </div>

    <!-- 资源卡片视图 -->
    <div class="resource-cards-section" v-if="viewMode === 'card'">
      <div class="cards-grid">
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="holographic-card resource-card"
          @click="viewResource(resource)"
        >
          <div class="card-header">
            <div class="resource-info">
              <h3 class="resource-name">{{ resource.name }}</h3>
              <p class="resource-code">{{ resource.code }}</p>
            </div>
            <div class="resource-status">
              <el-tag :type="getStatusTagType(resource.status)">{{ getStatusLabel(resource.status) }}</el-tag>
            </div>
          </div>
          
          <div class="card-content">
            <div class="resource-details">
              <div class="detail-item">
                <span class="label">类型:</span>
                <span class="value">{{ getTypeLabel(resource.type) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">位置:</span>
                <span class="value">{{ resource.location }}</span>
              </div>
              <div class="detail-item">
                <span class="label">负责人:</span>
                <span class="value">{{ resource.responsible }}</span>
              </div>
            </div>
            
            <div class="resource-metrics">
              <div class="metric-item">
                <div class="metric-label">利用率</div>
                <el-progress :percentage="resource.utilization" :color="getUtilizationColor(resource.utilization)"></el-progress>
              </div>
              <div class="metric-item">
                <div class="metric-label">效率: {{ resource.efficiency }}%</div>
                <el-progress :percentage="resource.efficiency" color="#67c23a"></el-progress>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="maintenance-info">
              <span class="maintenance-label">上次维护:</span>
              <span class="maintenance-date">{{ resource.lastMaintenance }}</span>
            </div>
            <div class="card-actions">
              <el-button size="small" type="primary" @click.stop="editResource(resource)">编辑</el-button>
              <el-button size="small" @click.stop="scheduleResource(resource)">排程</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 资源监控视图 -->
    <div class="holographic-card resource-monitor-section" v-if="viewMode === 'monitor'">
      <div class="monitor-header">
        <h3>实时监控</h3>
        <div class="monitor-controls">
          <el-button class="holographic-btn" @click="refreshMonitor">刷新数据</el-button>
          <el-switch v-model="autoRefresh" active-text="自动刷新"></el-switch>
        </div>
      </div>
      
      <div class="monitor-content">
        <div class="monitor-charts">
          <div class="chart-item">
            <div class="chart-title">资源利用率分布</div>
            <div class="chart-container" ref="utilizationChart" id="utilizationChart"></div>
          </div>
          <div class="chart-item">
            <div class="chart-title">设备状态统计</div>
            <div class="chart-container" ref="statusChart" id="statusChart"></div>
          </div>
        </div>
        
        <div class="monitor-alerts">
          <div class="alerts-title">实时告警</div>
          <div class="alerts-list">
            <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.level">
              <div class="alert-icon">
                <i :class="getAlertIcon(alert.level)"></i>
              </div>
              <div class="alert-content">
                <div class="alert-message">{{ alert.message }}</div>
                <div class="alert-time">{{ alert.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加资源对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="添加制造资源"
      width="800px"
      class="holographic-dialog"
    >
      <el-form :model="newResource" :rules="resourceRules" ref="resourceForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资源编号" prop="code">
              <el-input v-model="newResource.code" placeholder="自动生成" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源名称" prop="name">
              <el-input v-model="newResource.name" placeholder="请输入资源名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资源类型" prop="type">
              <el-select v-model="newResource.type" placeholder="请选择资源类型">
                <el-option label="加工设备" value="machine"></el-option>
                <el-option label="检测设备" value="inspection"></el-option>
                <el-option label="运输设备" value="transport"></el-option>
                <el-option label="工装夹具" value="fixture"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在位置" prop="location">
              <el-select v-model="newResource.location" placeholder="请选择位置">
                <el-option label="车间A" value="workshop-a"></el-option>
                <el-option label="车间B" value="workshop-b"></el-option>
                <el-option label="装配线" value="assembly-line"></el-option>
                <el-option label="质检区" value="qc-area"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsible">
              <el-input v-model="newResource.responsible" placeholder="请输入负责人"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contact">
              <el-input v-model="newResource.contact" placeholder="请输入联系方式"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="资源描述" prop="description">
          <el-input
            v-model="newResource.description"
            type="textarea"
            :rows="4"
            placeholder="请输入资源描述"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="技术参数">
          <div class="parameters-section">
            <div
              v-for="(param, index) in newResource.parameters"
              :key="index"
              class="parameter-item"
            >
              <el-input v-model="param.name" placeholder="参数名称"></el-input>
              <el-input v-model="param.value" placeholder="参数值"></el-input>
              <el-input v-model="param.unit" placeholder="单位"></el-input>
              <el-button type="danger" size="small" @click="removeParameter(index)">删除</el-button>
            </div>
            <el-button type="primary" @click="addParameter">添加参数</el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createResource">添加资源</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 资源详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="资源详情"
      width="1000px"
      class="holographic-dialog"
    >
      <div class="resource-detail-content" v-if="selectedResource">
        <el-tabs v-model="activeTab" class="holographic-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="资源编号">{{ selectedResource.code }}</el-descriptions-item>
                <el-descriptions-item label="资源名称">{{ selectedResource.name }}</el-descriptions-item>
                <el-descriptions-item label="资源类型">{{ getTypeLabel(selectedResource.type) }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusTagType(selectedResource.status)">{{ getStatusLabel(selectedResource.status) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="所在位置">{{ selectedResource.location }}</el-descriptions-item>
                <el-descriptions-item label="负责人">{{ selectedResource.responsible }}</el-descriptions-item>
                <el-descriptions-item label="利用率">{{ selectedResource.utilization }}%</el-descriptions-item>
                <el-descriptions-item label="效率">{{ selectedResource.efficiency }}%</el-descriptions-item>
                <el-descriptions-item label="上次维护" :span="2">{{ selectedResource.lastMaintenance }}</el-descriptions-item>
                <el-descriptions-item label="资源描述" :span="2">{{ selectedResource.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="技术参数" name="parameters">
            <div class="parameters-detail">
              <el-table :data="selectedResource.parameters || []" border>
                <el-table-column prop="name" label="参数名称"></el-table-column>
                <el-table-column prop="value" label="参数值"></el-table-column>
                <el-table-column prop="unit" label="单位"></el-table-column>
                <el-table-column prop="description" label="说明"></el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="维护记录" name="maintenance">
            <div class="maintenance-records">
              <el-timeline>
                <el-timeline-item
                  v-for="(record, index) in selectedResource.maintenanceRecords || []"
                  :key="index"
                  :timestamp="record.date"
                  placement="top"
                >
                  <el-card>
                    <h4>{{ record.type }}</h4>
                    <p>{{ record.description }}</p>
                    <div class="record-meta">
                      <span>维护人员: {{ record.technician }}</span>
                      <span>费用: ¥{{ record.cost }}</span>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="使用历史" name="history">
            <div class="usage-history">
              <el-table :data="selectedResource.usageHistory || []" border>
                <el-table-column prop="date" label="日期"></el-table-column>
                <el-table-column prop="workOrder" label="工单号"></el-table-column>
                <el-table-column prop="product" label="产品"></el-table-column>
                <el-table-column prop="duration" label="使用时长(小时)"></el-table-column>
                <el-table-column prop="operator" label="操作员"></el-table-column>
                <el-table-column prop="status" label="状态">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
                      {{ row.status === 'completed' ? '已完成' : '进行中' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

export default {
  name: 'ManufacturingResource',
  setup() {
    // 响应式数据
    const searchQuery = ref('')
    const filterStatus = ref('')
    const filterType = ref('')
    const filterLocation = ref('')
    const viewMode = ref('list')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const showCreateDialog = ref(false)
    const showDetailDialog = ref(false)
    const selectedResource = ref(null)
    const activeTab = ref('basic')
    const autoRefresh = ref(false)
    const utilizationChart = ref(null)
    const statusChart = ref(null)
    let refreshTimer = null

    // 资源统计数据
    const resourceStats = ref([
      { key: 'total', label: '总资源数', value: 68, icon: 'el-icon-cpu', iconClass: 'primary' },
      { key: 'running', label: '运行中', value: 45, icon: 'el-icon-check', iconClass: 'success' },
      { key: 'idle', label: '空闲', value: 15, icon: 'el-icon-time', iconClass: 'warning' },
      { key: 'maintenance', label: '维护中', value: 8, icon: 'el-icon-setting', iconClass: 'danger' }
    ])

    // 资源数据
    const resources = ref([
      {
        id: 1,
        code: 'RES-001',
        name: 'CNC加工中心-01',
        type: 'machine',
        status: 'running',
        location: '车间A',
        utilization: 85,
        efficiency: 92,
        lastMaintenance: '2024-01-10',
        responsible: '张师傅',
        contact: '13800138001',
        description: '高精度数控加工中心，适用于复杂零件加工',
        parameters: [
          { name: '最大加工尺寸', value: '800x600x500', unit: 'mm', description: '工作台最大尺寸' },
          { name: '主轴转速', value: '12000', unit: 'rpm', description: '最大主轴转速' }
        ],
        maintenanceRecords: [
          { date: '2024-01-10', type: '定期保养', description: '更换润滑油，检查传动系统', technician: '李技师', cost: 500 },
          { date: '2023-12-15', type: '故障维修', description: '更换主轴轴承', technician: '王技师', cost: 2000 }
        ],
        usageHistory: [
          { date: '2024-01-20', workOrder: 'WO-001', product: '电机外壳', duration: 6.5, operator: '张操作员', status: 'completed' },
          { date: '2024-01-21', workOrder: 'WO-002', product: '泵体', duration: 4.2, operator: '李操作员', status: 'running' }
        ]
      },
      {
        id: 2,
        code: 'RES-002',
        name: '三坐标测量机',
        type: 'inspection',
        status: 'idle',
        location: '质检区',
        utilization: 65,
        efficiency: 88,
        lastMaintenance: '2024-01-05',
        responsible: '王检验员',
        contact: '13800138002',
        description: '高精度三坐标测量设备，用于产品质量检测',
        parameters: [
          { name: '测量精度', value: '±0.002', unit: 'mm', description: '测量精度范围' },
          { name: '测量范围', value: '500x400x300', unit: 'mm', description: '最大测量范围' }
        ]
      },
      {
        id: 3,
        code: 'RES-003',
        name: 'AGV运输车-01',
        type: 'transport',
        status: 'running',
        location: '装配线',
        utilization: 75,
        efficiency: 95,
        lastMaintenance: '2024-01-08',
        responsible: '刘调度员',
        contact: '13800138003',
        description: '自动导引运输车，用于物料自动运输',
        parameters: [
          { name: '载重量', value: '500', unit: 'kg', description: '最大载重量' },
          { name: '运行速度', value: '1.2', unit: 'm/s', description: '最大运行速度' }
        ]
      }
    ])

    // 告警数据
    const alerts = ref([
      { id: 1, level: 'warning', message: 'CNC加工中心-02 利用率过低', time: '10分钟前' },
      { id: 2, level: 'error', message: '激光切割机-01 出现故障', time: '25分钟前' },
      { id: 3, level: 'info', message: '三坐标测量机 完成校准', time: '1小时前' }
    ])

    // 新建资源表单
    const newResource = reactive({
      code: '',
      name: '',
      type: '',
      location: '',
      responsible: '',
      contact: '',
      description: '',
      parameters: [
        { name: '', value: '', unit: '' }
      ]
    })

    // 表单验证规则
    const resourceRules = {
      name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
      location: [{ required: true, message: '请选择所在位置', trigger: 'change' }],
      responsible: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
    }

    // 计算属性
    const filteredResources = computed(() => {
      let filtered = resources.value

      if (searchQuery.value) {
        filtered = filtered.filter(resource =>
          resource.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          resource.code.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (filterStatus.value) {
        filtered = filtered.filter(resource => resource.status === filterStatus.value)
      }

      if (filterType.value) {
        filtered = filtered.filter(resource => resource.type === filterType.value)
      }

      if (filterLocation.value) {
        filtered = filtered.filter(resource => resource.location === filterLocation.value)
      }

      return filtered
    })

    const totalResources = computed(() => filteredResources.value.length)

    // 方法
    const getStatusTagType = (status) => {
      const statusMap = {
        idle: 'info',
        running: 'success',
        maintenance: 'warning',
        fault: 'danger'
      }
      return statusMap[status] || 'info'
    }

    const getStatusLabel = (status) => {
      const statusMap = {
        idle: '空闲',
        running: '运行中',
        maintenance: '维护中',
        fault: '故障'
      }
      return statusMap[status] || '未知'
    }

    const getTypeTagType = (type) => {
      const typeMap = {
        machine: 'primary',
        inspection: 'success',
        transport: 'warning',
        fixture: 'info'
      }
      return typeMap[type] || 'info'
    }

    const getTypeLabel = (type) => {
      const typeMap = {
        machine: '加工设备',
        inspection: '检测设备',
        transport: '运输设备',
        fixture: '工装夹具'
      }
      return typeMap[type] || '未知'
    }

    const getUtilizationColor = (percentage) => {
      if (percentage < 30) return '#f56c6c'
      if (percentage < 70) return '#e6a23c'
      return '#67c23a'
    }

    const getAlertIcon = (level) => {
      const iconMap = {
        info: 'el-icon-info',
        warning: 'el-icon-warning',
        error: 'el-icon-error'
      }
      return iconMap[level] || 'el-icon-info'
    }

    const handleSelectionChange = (selection) => {
      console.log('选中的资源:', selection)
    }

    const handleCommand = (command, row) => {
      switch (command) {
        case 'schedule':
          scheduleResource(row)
          break
        case 'maintenance':
          viewMaintenance(row)
          break
        case 'performance':
          viewPerformance(row)
          break
        case 'export':
          exportSingleResource(row)
          break
        case 'delete':
          deleteResource(row)
          break
      }
    }

    const viewResource = (resource) => {
      selectedResource.value = resource
      showDetailDialog.value = true
    }

    const editResource = (resource) => {
      ElMessage.info('编辑资源功能开发中...')
    }

    const scheduleResource = (resource) => {
      ElMessage.info(`正在打开排程管理: ${resource.name}`)
    }

    const viewMaintenance = (resource) => {
      ElMessage.info(`查看维护记录: ${resource.name}`)
    }

    const viewPerformance = (resource) => {
      ElMessage.info(`查看性能分析: ${resource.name}`)
    }

    const deleteResource = (resource) => {
      ElMessageBox.confirm(
        `确定要删除资源 "${resource.name}" 吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = resources.value.findIndex(r => r.id === resource.id)
        if (index > -1) {
          resources.value.splice(index, 1)
          ElMessage.success('删除成功')
        }
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    }

    const importResource = () => {
      ElMessage.info('导入资源功能开发中...')
    }

    const exportResource = () => {
      ElMessage.info('导出资源功能开发中...')
    }

    const exportSingleResource = (resource) => {
      ElMessage.success(`正在导出资源: ${resource.name}`)
    }

    const addParameter = () => {
      newResource.parameters.push({ name: '', value: '', unit: '' })
    }

    const removeParameter = (index) => {
      if (newResource.parameters.length > 1) {
        newResource.parameters.splice(index, 1)
      }
    }

    const createResource = () => {
      // 生成资源编号
      const maxId = Math.max(...resources.value.map(r => r.id), 0)
      const newId = maxId + 1
      newResource.code = `RES-${String(newId).padStart(3, '0')}`

      // 添加到资源列表
      resources.value.push({
        id: newId,
        code: newResource.code,
        name: newResource.name,
        type: newResource.type,
        status: 'idle',
        location: newResource.location,
        utilization: 0,
        efficiency: 0,
        lastMaintenance: '未维护',
        responsible: newResource.responsible,
        contact: newResource.contact,
        description: newResource.description,
        parameters: [...newResource.parameters]
      })

      ElMessage.success('资源添加成功')
      showCreateDialog.value = false
      
      // 重置表单
      Object.assign(newResource, {
        code: '',
        name: '',
        type: '',
        location: '',
        responsible: '',
        contact: '',
        description: '',
        parameters: [{ name: '', value: '', unit: '' }]
      })
    }

    const refreshMonitor = () => {
      ElMessage.success('监控数据已刷新')
      initCharts()
    }

    const initCharts = () => {
      nextTick(() => {
        if (utilizationChart.value) {
          const chart1 = echarts.init(utilizationChart.value)
          const option1 = {
            backgroundColor: 'transparent',
            title: {
              text: '资源利用率分布',
              textStyle: { color: '#00e5ff' }
            },
            tooltip: { trigger: 'item' },
            series: [{
              type: 'pie',
              radius: '60%',
              data: [
                { value: 45, name: '高利用率(>80%)', itemStyle: { color: '#67c23a' } },
                { value: 15, name: '中利用率(50-80%)', itemStyle: { color: '#e6a23c' } },
                { value: 8, name: '低利用率(<50%)', itemStyle: { color: '#f56c6c' } }
              ],
              label: { color: '#ffffff' }
            }]
          }
          chart1.setOption(option1)
        }

        if (statusChart.value) {
          const chart2 = echarts.init(statusChart.value)
          const option2 = {
            backgroundColor: 'transparent',
            title: {
              text: '设备状态统计',
              textStyle: { color: '#00e5ff' }
            },
            tooltip: { trigger: 'axis' },
            xAxis: {
              type: 'category',
              data: ['运行中', '空闲', '维护中', '故障'],
              axisLabel: { color: '#ffffff' }
            },
            yAxis: {
              type: 'value',
              axisLabel: { color: '#ffffff' }
            },
            series: [{
              type: 'bar',
              data: [45, 15, 8, 0],
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#00e5ff' },
                  { offset: 1, color: '#0080ff' }
                ])
              }
            }]
          }
          chart2.setOption(option2)
        }
      })
    }

    // 自动刷新监控
    const startAutoRefresh = () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
      refreshTimer = setInterval(() => {
        if (autoRefresh.value && viewMode.value === 'monitor') {
          refreshMonitor()
        }
      }, 30000) // 30秒刷新一次
    }

    // 生命周期钩子
    onMounted(() => {
      startAutoRefresh()
      if (viewMode.value === 'monitor') {
        initCharts()
      }
    })

    onUnmounted(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
    })

    return {
      searchQuery,
      filterStatus,
      filterType,
      filterLocation,
      viewMode,
      currentPage,
      pageSize,
      showCreateDialog,
      showDetailDialog,
      selectedResource,
      activeTab,
      autoRefresh,
      utilizationChart,
      statusChart,
      resourceStats,
      resources,
      alerts,
      newResource,
      resourceRules,
      filteredResources,
      totalResources,
      getStatusTagType,
      getStatusLabel,
      getTypeTagType,
      getTypeLabel,
      getUtilizationColor,
      getAlertIcon,
      handleSelectionChange,
      handleCommand,
      viewResource,
      editResource,
      scheduleResource,
      viewMaintenance,
      viewPerformance,
      deleteResource,
      importResource,
      exportResource,
      exportSingleResource,
      addParameter,
      removeParameter,
      createResource,
      refreshMonitor
    }
  }
}
</script>

<style lang="scss" scoped>
.manufacturing-resource {
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

  .resource-list-section {
    .utilization-text {
      margin-left: 8px;
      color: #ffffff;
      font-size: 12px;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .resource-cards-section {
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;

      .resource-card {
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

          .resource-info {
            .resource-name {
              color: #00e5ff;
              margin: 0 0 5px 0;
              font-size: 16px;
            }

            .resource-code {
              color: #ffffff;
              opacity: 0.7;
              margin: 0;
              font-size: 12px;
            }
          }
        }

        .card-content {
          margin-bottom: 15px;

          .resource-details {
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

          .resource-metrics {
            .metric-item {
              margin-bottom: 10px;

              .metric-label {
                color: #ffffff;
                opacity: 0.7;
                margin-bottom: 5px;
                font-size: 12px;
              }
            }
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .maintenance-info {
            display: flex;
            flex-direction: column;
            font-size: 12px;

            .maintenance-label {
              color: #ffffff;
              opacity: 0.7;
              margin-bottom: 2px;
            }

            .maintenance-date {
              color: #00e5ff;
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

  .resource-monitor-section {
    .monitor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        color: #00e5ff;
        margin: 0;
      }

      .monitor-controls {
        display: flex;
        gap: 15px;
        align-items: center;
      }
    }

    .monitor-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;

      .monitor-charts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        .chart-item {
          .chart-title {
            color: #00e5ff;
            margin-bottom: 10px;
            font-weight: 500;
          }

          .chart-container {
            height: 300px;
            background: rgba(0, 229, 255, 0.05);
            border: 1px solid rgba(0, 229, 255, 0.2);
            border-radius: 8px;
          }
        }
      }

      .monitor-alerts {
        .alerts-title {
          color: #00e5ff;
          margin-bottom: 15px;
          font-weight: 500;
        }

        .alerts-list {
          .alert-item {
            display: flex;
            align-items: center;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid;

            &.info {
              background: rgba(64, 158, 255, 0.1);
              border-left-color: #409eff;
            }

            &.warning {
              background: rgba(230, 162, 60, 0.1);
              border-left-color: #e6a23c;
            }

            &.error {
              background: rgba(245, 108, 108, 0.1);
              border-left-color: #f56c6c;
            }

            .alert-icon {
              margin-right: 12px;
              font-size: 18px;

              i {
                color: inherit;
              }
            }

            .alert-content {
              flex: 1;

              .alert-message {
                color: #ffffff;
                margin-bottom: 4px;
              }

              .alert-time {
                color: #ffffff;
                opacity: 0.6;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }

  .parameters-section {
    .parameter-item {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: center;

      .el-input {
        flex: 1;
      }
    }
  }

  .resource-detail-content {
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

    .maintenance-records {
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

              .record-meta {
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
