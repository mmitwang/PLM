<template>
  <div class="version-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">产品版本管理</h1>
      <p class="page-subtitle">管理产品版本迭代、发布计划和版本对比</p>
    </div>

    <!-- 版本概览 -->
    <div class="version-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ versionStats.total }}</h3>
              <p>总版本数</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ versionStats.released }}</h3>
              <p>已发布版本</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ versionStats.development }}</h3>
              <p>开发中版本</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ versionStats.deprecated }}</h3>
              <p>已废弃版本</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 版本管理工具栏 -->
    <div class="version-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建版本
        </el-button>
        <el-button @click="compareVersions">
          <el-icon><Operation /></el-icon>
          版本对比
        </el-button>
        <el-button @click="exportVersions">
          <el-icon><Download /></el-icon>
          导出版本
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px">
          <el-option label="全部" value=""></el-option>
          <el-option label="开发中" value="development"></el-option>
          <el-option label="测试中" value="testing"></el-option>
          <el-option label="已发布" value="released"></el-option>
          <el-option label="已废弃" value="deprecated"></el-option>
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索版本..."
          style="width: 200px; margin-left: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 版本列表 -->
    <div class="version-list">
      <el-table
        :data="filteredVersions"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="version" label="版本号" width="120">
          <template #default="scope">
            <el-tag :type="getVersionTagType(scope.row.status)">
              {{ scope.row.version }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="版本名称" width="200"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="releaseDate" label="发布日期" width="120"></el-table-column>
        <el-table-column prop="features" label="主要特性" min-width="200">
          <template #default="scope">
            <el-tooltip :content="scope.row.features.join(', ')" placement="top">
              <span>{{ scope.row.features.slice(0, 2).join(', ') }}{{ scope.row.features.length > 2 ? '...' : '' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建者" width="100"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewVersion(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editVersion(scope.row)">编辑</el-button>
            <el-dropdown @command="handleVersionAction">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'release', row: scope.row}">发布版本</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'rollback', row: scope.row}">回滚版本</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'deprecate', row: scope.row}">废弃版本</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'delete', row: scope.row}" divided>删除版本</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 版本时间线 -->
    <div class="version-timeline">
      <h3>版本发布时间线</h3>
      <div class="timeline-container">
        <div class="timeline-chart" ref="timelineChart"></div>
      </div>
    </div>

    <!-- 创建版本对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建新版本"
      width="600px"
      :before-close="handleCreateDialogClose"
    >
      <el-form :model="newVersion" :rules="versionRules" ref="versionForm" label-width="100px">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="newVersion.version" placeholder="如: v1.2.0"></el-input>
        </el-form-item>
        <el-form-item label="版本名称" prop="name">
          <el-input v-model="newVersion.name" placeholder="版本名称"></el-input>
        </el-form-item>
        <el-form-item label="基于版本" prop="baseVersion">
          <el-select v-model="newVersion.baseVersion" placeholder="选择基础版本" style="width: 100%">
            <el-option
              v-for="version in versions"
              :key="version.id"
              :label="version.version"
              :value="version.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计划发布日期" prop="plannedReleaseDate">
          <el-date-picker
            v-model="newVersion.plannedReleaseDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="主要特性" prop="features">
          <el-input
            v-model="newVersion.featuresText"
            type="textarea"
            :rows="3"
            placeholder="请输入主要特性，用逗号分隔"
          ></el-input>
        </el-form-item>
        <el-form-item label="版本描述" prop="description">
          <el-input
            v-model="newVersion.description"
            type="textarea"
            :rows="4"
            placeholder="版本详细描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createVersion">创建</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 版本详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="版本详情"
      width="800px"
    >
      <div v-if="selectedVersion" class="version-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="版本号">{{ selectedVersion.version }}</el-descriptions-item>
          <el-descriptions-item label="版本名称">{{ selectedVersion.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedVersion.status)">
              {{ getStatusText(selectedVersion.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布日期">{{ selectedVersion.releaseDate }}</el-descriptions-item>
          <el-descriptions-item label="创建者">{{ selectedVersion.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedVersion.createTime }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px;">主要特性</h4>
        <el-tag v-for="feature in selectedVersion.features" :key="feature" style="margin-right: 8px; margin-bottom: 8px;">
          {{ feature }}
        </el-tag>
        
        <h4 style="margin-top: 20px;">版本描述</h4>
        <p>{{ selectedVersion.description }}</p>
        
        <h4 style="margin-top: 20px;">变更记录</h4>
        <el-timeline>
          <el-timeline-item
            v-for="change in selectedVersion.changes"
            :key="change.id"
            :timestamp="change.time"
            :type="change.type"
          >
            {{ change.description }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Check, Clock, Warning, Plus, Operation, Download, Search, ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const searchKeyword = ref('')
const filterStatus = ref('')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const selectedVersions = ref([])
const selectedVersion = ref(null)
const timelineChart = ref(null)

// 版本统计数据
const versionStats = reactive({
  total: 24,
  released: 18,
  development: 4,
  deprecated: 2
})

// 新版本表单数据
const newVersion = reactive({
  version: '',
  name: '',
  baseVersion: '',
  plannedReleaseDate: '',
  featuresText: '',
  features: [],
  description: ''
})

// 表单验证规则
const versionRules = {
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入版本名称', trigger: 'blur' }
  ],
  baseVersion: [
    { required: true, message: '请选择基础版本', trigger: 'change' }
  ]
}

// 版本数据
const versions = ref([
  {
    id: 1,
    version: 'v2.1.0',
    name: '智能优化版本',
    status: 'released',
    releaseDate: '2024-01-15',
    features: ['AI智能推荐', '性能优化', '界面升级'],
    creator: '张工程师',
    createTime: '2024-01-01',
    description: '本版本主要针对系统性能进行了全面优化，新增AI智能推荐功能。',
    changes: [
      { id: 1, time: '2024-01-15', type: 'success', description: '版本正式发布' },
      { id: 2, time: '2024-01-10', type: 'primary', description: '完成测试验证' },
      { id: 3, time: '2024-01-05', type: 'info', description: '开始集成测试' }
    ]
  },
  {
    id: 2,
    version: 'v2.0.5',
    name: '稳定性修复版本',
    status: 'released',
    releaseDate: '2023-12-20',
    features: ['Bug修复', '稳定性提升', '安全加固'],
    creator: '李工程师',
    createTime: '2023-12-10',
    description: '修复了多个关键Bug，提升了系统稳定性。',
    changes: [
      { id: 1, time: '2023-12-20', type: 'success', description: '版本正式发布' },
      { id: 2, time: '2023-12-15', type: 'warning', description: '发现并修复关键Bug' }
    ]
  },
  {
    id: 3,
    version: 'v2.2.0',
    name: '功能增强版本',
    status: 'development',
    releaseDate: '2024-03-01',
    features: ['新增模块', '工作流优化', '报表增强'],
    creator: '王工程师',
    createTime: '2024-01-20',
    description: '正在开发中的新版本，将新增多个重要功能模块。',
    changes: [
      { id: 1, time: '2024-01-25', type: 'info', description: '开始功能开发' },
      { id: 2, time: '2024-01-20', type: 'info', description: '版本规划完成' }
    ]
  },
  {
    id: 4,
    version: 'v1.9.0',
    name: '旧版本',
    status: 'deprecated',
    releaseDate: '2023-06-15',
    features: ['基础功能', '初始版本'],
    creator: '陈工程师',
    createTime: '2023-06-01',
    description: '已废弃的旧版本，建议升级到新版本。',
    changes: [
      { id: 1, time: '2024-01-01', type: 'danger', description: '版本废弃' },
      { id: 2, time: '2023-06-15', type: 'success', description: '版本发布' }
    ]
  }
])

// 计算属性
const filteredVersions = computed(() => {
  let result = versions.value
  
  if (filterStatus.value) {
    result = result.filter(version => version.status === filterStatus.value)
  }
  
  if (searchKeyword.value) {
    result = result.filter(version => 
      version.version.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      version.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  return result
})

// 方法
const getVersionTagType = (status) => {
  const typeMap = {
    'development': 'warning',
    'testing': 'info',
    'released': 'success',
    'deprecated': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusTagType = (status) => {
  const typeMap = {
    'development': 'warning',
    'testing': 'info',
    'released': 'success',
    'deprecated': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'development': '开发中',
    'testing': '测试中',
    'released': '已发布',
    'deprecated': '已废弃'
  }
  return textMap[status] || '未知'
}

const handleSelectionChange = (selection) => {
  selectedVersions.value = selection
}

const viewVersion = (version) => {
  selectedVersion.value = version
  showDetailDialog.value = true
}

const editVersion = (version) => {
  // 编辑版本逻辑
  ElMessage.info('编辑版本功能开发中...')
}

const handleVersionAction = ({ action, row }) => {
  switch (action) {
    case 'release':
      releaseVersion(row)
      break
    case 'rollback':
      rollbackVersion(row)
      break
    case 'deprecate':
      deprecateVersion(row)
      break
    case 'delete':
      deleteVersion(row)
      break
  }
}

const releaseVersion = (version) => {
  ElMessageBox.confirm(
    `确定要发布版本 ${version.version} 吗？`,
    '确认发布',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    version.status = 'released'
    version.releaseDate = new Date().toISOString().split('T')[0]
    ElMessage.success('版本发布成功')
  }).catch(() => {
    ElMessage.info('已取消发布')
  })
}

const rollbackVersion = (version) => {
  ElMessage.info('版本回滚功能开发中...')
}

const deprecateVersion = (version) => {
  ElMessageBox.confirm(
    `确定要废弃版本 ${version.version} 吗？`,
    '确认废弃',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    version.status = 'deprecated'
    ElMessage.success('版本已废弃')
  }).catch(() => {
    ElMessage.info('已取消废弃')
  })
}

const deleteVersion = (version) => {
  ElMessageBox.confirm(
    `确定要删除版本 ${version.version} 吗？此操作不可恢复！`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = versions.value.findIndex(v => v.id === version.id)
    if (index > -1) {
      versions.value.splice(index, 1)
      ElMessage.success('版本删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const compareVersions = () => {
  if (selectedVersions.value.length < 2) {
    ElMessage.warning('请至少选择两个版本进行对比')
    return
  }
  ElMessage.info('版本对比功能开发中...')
}

const exportVersions = () => {
  ElMessage.info('版本导出功能开发中...')
}

const handleCreateDialogClose = (done) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的数据将丢失。')
    .then(() => {
      resetNewVersion()
      done()
    })
    .catch(() => {})
}

const resetNewVersion = () => {
  Object.assign(newVersion, {
    version: '',
    name: '',
    baseVersion: '',
    plannedReleaseDate: '',
    featuresText: '',
    features: [],
    description: ''
  })
}

const createVersion = () => {
  // 创建版本逻辑
  newVersion.features = newVersion.featuresText.split(',').map(f => f.trim()).filter(f => f)
  
  const version = {
    id: Date.now(),
    version: newVersion.version,
    name: newVersion.name,
    status: 'development',
    releaseDate: newVersion.plannedReleaseDate,
    features: newVersion.features,
    creator: '当前用户',
    createTime: new Date().toISOString().split('T')[0],
    description: newVersion.description,
    changes: [
      { id: 1, time: new Date().toISOString().split('T')[0], type: 'info', description: '版本创建' }
    ]
  }
  
  versions.value.unshift(version)
  versionStats.total++
  versionStats.development++
  
  ElMessage.success('版本创建成功')
  showCreateDialog.value = false
  resetNewVersion()
}

const initTimelineChart = () => {
  if (!timelineChart.value) return
  
  const chart = echarts.init(timelineChart.value)
  
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: '版本发布时间线',
      textStyle: {
        color: '#00e5ff'
      }
    },
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
      data: ['2023-06', '2023-09', '2023-12', '2024-01', '2024-03'],
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
      name: '版本数量',
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
        name: '发布版本',
        type: 'line',
        data: [1, 2, 3, 5, 6],
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
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initTimelineChart()
  })
})
</script>

<style lang="scss" scoped>
.version-management {
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

  .version-overview {
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

  .version-toolbar {
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

  .version-list {
    margin-bottom: 30px;
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;
    padding: 20px;
  }

  .version-timeline {
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;
    padding: 20px;

    h3 {
      color: #00e5ff;
      margin-bottom: 20px;
      font-size: 18px;
    }

    .timeline-container {
      .timeline-chart {
        height: 300px;
        width: 100%;
      }
    }
  }

  .version-detail {
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
