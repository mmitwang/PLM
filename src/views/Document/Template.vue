<template>
  <div class="document-template-container">
    <!-- 文档模板概览 -->
    <div class="template-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">模板总数</div>
            <div class="card-value">{{ overviewData.totalTemplates }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">已启用</div>
            <div class="card-value">{{ overviewData.enabledCount }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">使用次数</div>
            <div class="card-value">{{ overviewData.usageCount }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">收藏数</div>
            <div class="card-value">{{ overviewData.favoriteCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板工具栏 -->
    <div class="template-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板..."
          prefix-icon="Search"
          style="width: 300px;"
          @input="handleSearch"
        />
        <el-select v-model="categoryFilter" placeholder="分类筛选" style="width: 150px;">
          <el-option label="全部分类" value="" />
          <el-option label="设计文档" value="design" />
          <el-option label="技术规范" value="specification" />
          <el-option label="测试报告" value="test" />
          <el-option label="用户手册" value="manual" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px;">
          <el-option label="全部状态" value="" />
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建模板
        </el-button>
        <el-button @click="importTemplate">
          <el-icon><Upload /></el-icon>
          导入模板
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 模板视图 -->
    <div class="template-tabs">
      <el-tabs v-model="activeView" @tab-click="handleViewChange">
        <el-tab-pane label="卡片视图" name="card">
          <div class="template-cards">
            <div 
              v-for="template in filteredTemplates" 
              :key="template.id" 
              class="template-card"
              @click="viewTemplateDetail(template)"
            >
              <div class="card-header">
                <div class="template-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="card-actions">
                  <el-dropdown @command="handleCardCommand">
                    <el-button size="small" text>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :command="`edit-${template.id}`">编辑</el-dropdown-item>
                        <el-dropdown-item :command="`copy-${template.id}`">复制</el-dropdown-item>
                        <el-dropdown-item :command="`favorite-${template.id}`">收藏</el-dropdown-item>
                        <el-dropdown-item :command="`delete-${template.id}`" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
              
              <div class="card-content">
                <h3 class="template-name">{{ template.name }}</h3>
                <p class="template-description">{{ template.description }}</p>
                
                <div class="template-meta">
                  <el-tag :type="getCategoryTagType(template.category)" size="small">
                    {{ getCategoryText(template.category) }}
                  </el-tag>
                  <el-tag :type="getStatusTagType(template.status)" size="small">
                    {{ getStatusText(template.status) }}
                  </el-tag>
                </div>
                
                <div class="template-stats">
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ template.usageCount }}
                  </span>
                  <span class="stat-item">
                    <el-icon><Star /></el-icon>
                    {{ template.favoriteCount }}
                  </span>
                  <span class="stat-item">
                    <el-icon><Calendar /></el-icon>
                    {{ template.updateTime }}
                  </span>
                </div>
              </div>
              
              <div class="card-footer">
                <div class="creator-info">
                  <el-avatar :size="24" :src="template.creatorAvatar">{{ template.creator }}</el-avatar>
                  <span class="creator-name">{{ template.creator }}</span>
                </div>
                <el-button size="small" type="primary" @click.stop="useTemplate(template)">
                  使用模板
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="列表视图" name="list">
          <div class="template-list">
            <el-table :data="filteredTemplates" style="width: 100%">
              <el-table-column prop="name" label="模板名称" width="200">
                <template #default="scope">
                  <div class="template-name-cell">
                    <el-icon><Document /></el-icon>
                    <span>{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" width="250" show-overflow-tooltip />
              <el-table-column prop="category" label="分类" width="120">
                <template #default="scope">
                  <el-tag :type="getCategoryTagType(scope.row.category)" size="small">
                    {{ getCategoryText(scope.row.category) }}
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
              <el-table-column prop="usageCount" label="使用次数" width="100" />
              <el-table-column prop="favoriteCount" label="收藏数" width="100" />
              <el-table-column prop="creator" label="创建者" width="120" />
              <el-table-column prop="updateTime" label="更新时间" width="150" />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="viewTemplateDetail(scope.row)">详情</el-button>
                  <el-button size="small" type="primary" @click="useTemplate(scope.row)">使用</el-button>
                  <el-button size="small" @click="editTemplate(scope.row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新建模板对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建文档模板"
      width="800px"
      :before-close="handleCreateClose"
    >
      <el-form :model="newTemplate" :rules="templateRules" ref="createFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="newTemplate.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板分类" prop="category">
              <el-select v-model="newTemplate.category" placeholder="选择分类" style="width: 100%;">
                <el-option label="设计文档" value="design" />
                <el-option label="技术规范" value="specification" />
                <el-option label="测试报告" value="test" />
                <el-option label="用户手册" value="manual" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="模板描述" prop="description">
          <el-input
            v-model="newTemplate.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        
        <el-form-item label="模板内容" prop="content">
          <div class="template-editor">
            <el-input
              v-model="newTemplate.content"
              type="textarea"
              :rows="10"
              placeholder="请输入模板内容，支持Markdown格式"
            />
          </div>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标签">
              <el-input v-model="newTemplate.tags" placeholder="请输入标签，用逗号分隔" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="newTemplate.status">
                <el-radio label="enabled">启用</el-radio>
                <el-radio label="disabled">禁用</el-radio>
                <el-radio label="draft">草稿</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createTemplate">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 模板详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="模板详情"
      width="1000px"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedTemplate" class="template-detail">
        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="basic-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="模板名称">{{ selectedTemplate.name }}</el-descriptions-item>
                <el-descriptions-item label="分类">
                  <el-tag :type="getCategoryTagType(selectedTemplate.category)">
                    {{ getCategoryText(selectedTemplate.category) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusTagType(selectedTemplate.status)">
                    {{ getStatusText(selectedTemplate.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建者">{{ selectedTemplate.creator }}</el-descriptions-item>
                <el-descriptions-item label="使用次数">{{ selectedTemplate.usageCount }}</el-descriptions-item>
                <el-descriptions-item label="收藏数">{{ selectedTemplate.favoriteCount }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ selectedTemplate.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ selectedTemplate.updateTime }}</el-descriptions-item>
                <el-descriptions-item label="描述" :span="2">{{ selectedTemplate.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="模板内容" name="content">
            <div class="template-content">
              <div class="content-toolbar">
                <el-button-group size="small">
                  <el-button :type="contentViewMode === 'edit' ? 'primary' : ''" @click="contentViewMode = 'edit'">编辑</el-button>
                  <el-button :type="contentViewMode === 'preview' ? 'primary' : ''" @click="contentViewMode = 'preview'">预览</el-button>
                </el-button-group>
                <div class="toolbar-actions">
                  <el-button size="small" @click="copyContent">复制内容</el-button>
                  <el-button size="small" type="primary" @click="saveContent">保存</el-button>
                </div>
              </div>
              
              <div v-if="contentViewMode === 'edit'" class="content-editor">
                <el-input
                  v-model="selectedTemplate.content"
                  type="textarea"
                  :rows="15"
                  placeholder="请输入模板内容"
                />
              </div>
              
              <div v-else class="content-preview">
                <div class="markdown-content" v-html="selectedTemplate.content"></div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="使用记录" name="usage">
            <div class="usage-records">
              <el-table :data="selectedTemplate.usageRecords || []" style="width: 100%;">
                <el-table-column prop="user" label="使用者" width="120" />
                <el-table-column prop="document" label="生成文档" width="200" />
                <el-table-column prop="useTime" label="使用时间" width="150" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'" size="small">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="remarks" label="备注" />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, Check, User, Star, Search, Plus, Upload, Refresh, 
  MoreFilled, View, Calendar 
} from '@element-plus/icons-vue'

// 响应式数据
const searchKeyword = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const activeView = ref('card')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const detailActiveTab = ref('basic')
const contentViewMode = ref('edit')
const selectedTemplate = ref(null)
const createFormRef = ref(null)

// 概览数据
const overviewData = reactive({
  totalTemplates: 24,
  enabledCount: 18,
  usageCount: 156,
  favoriteCount: 42
})

// 新模板表单
const newTemplate = reactive({
  name: '',
  category: '',
  description: '',
  content: '',
  tags: '',
  status: 'enabled'
})

// 表单验证规则
const templateRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择模板分类', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入模板描述', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入模板内容', trigger: 'blur' }
  ]
}

// 模板数据
const templates = ref([
  {
    id: 1,
    name: '产品设计规范模板',
    description: '用于产品设计阶段的标准化文档模板，包含设计要求、技术参数等',
    category: 'design',
    status: 'enabled',
    content: '# 产品设计规范\n\n## 1. 设计概述\n\n## 2. 技术要求\n\n## 3. 设计约束',
    tags: '设计,规范,产品',
    usageCount: 45,
    favoriteCount: 12,
    creator: '张三',
    creatorAvatar: '',
    createTime: '2024-01-10 09:30',
    updateTime: '2024-01-15 14:20',
    usageRecords: [
      { user: '李四', document: '智能控制器设计规范', useTime: '2024-01-15 10:30', status: '成功', remarks: '正常使用' },
      { user: '王五', document: '传感器设计规范', useTime: '2024-01-14 16:20', status: '成功', remarks: '正常使用' }
    ]
  },
  {
    id: 2,
    name: '技术规格说明书模板',
    description: '标准的技术规格说明书模板，适用于各类产品的技术文档编写',
    category: 'specification',
    status: 'enabled',
    content: '# 技术规格说明书\n\n## 1. 产品概述\n\n## 2. 技术参数\n\n## 3. 性能指标',
    tags: '技术,规格,说明书',
    usageCount: 38,
    favoriteCount: 8,
    creator: '李四',
    creatorAvatar: '',
    createTime: '2024-01-08 11:15',
    updateTime: '2024-01-12 09:45',
    usageRecords: []
  },
  {
    id: 3,
    name: '测试报告模板',
    description: '产品测试报告的标准模板，包含测试计划、执行过程和结果分析',
    category: 'test',
    status: 'enabled',
    content: '# 测试报告\n\n## 1. 测试概述\n\n## 2. 测试环境\n\n## 3. 测试结果',
    tags: '测试,报告,质量',
    usageCount: 29,
    favoriteCount: 15,
    creator: '王五',
    creatorAvatar: '',
    createTime: '2024-01-05 15:20',
    updateTime: '2024-01-10 11:30',
    usageRecords: []
  },
  {
    id: 4,
    name: '用户操作手册模板',
    description: '面向最终用户的操作手册模板，包含安装、配置和使用说明',
    category: 'manual',
    status: 'draft',
    content: '# 用户操作手册\n\n## 1. 产品介绍\n\n## 2. 安装指南\n\n## 3. 使用说明',
    tags: '用户,手册,操作',
    usageCount: 12,
    favoriteCount: 5,
    creator: '赵六',
    creatorAvatar: '',
    createTime: '2024-01-03 13:45',
    updateTime: '2024-01-08 16:10',
    usageRecords: []
  }
])

// 计算属性
const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    const matchesSearch = !searchKeyword.value || 
      template.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      template.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchesCategory = !categoryFilter.value || template.category === categoryFilter.value
    const matchesStatus = !statusFilter.value || template.status === statusFilter.value
    
    return matchesSearch && matchesCategory && matchesStatus
  })
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const handleViewChange = (tab) => {
  // 视图切换逻辑
}

const getCategoryTagType = (category) => {
  const types = {
    design: 'primary',
    specification: 'success',
    test: 'warning',
    manual: 'info'
  }
  return types[category] || ''
}

const getCategoryText = (category) => {
  const texts = {
    design: '设计文档',
    specification: '技术规范',
    test: '测试报告',
    manual: '用户手册'
  }
  return texts[category] || category
}

const getStatusTagType = (status) => {
  const types = {
    enabled: 'success',
    disabled: 'danger',
    draft: 'warning'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    enabled: '启用',
    disabled: '禁用',
    draft: '草稿'
  }
  return texts[status] || status
}

const handleCardCommand = (command) => {
  const [action, id] = command.split('-')
  const template = templates.value.find(t => t.id === parseInt(id))
  
  switch (action) {
    case 'edit':
      editTemplate(template)
      break
    case 'copy':
      copyTemplate(template)
      break
    case 'favorite':
      toggleFavorite(template)
      break
    case 'delete':
      deleteTemplate(template)
      break
  }
}

const viewTemplateDetail = (template) => {
  selectedTemplate.value = template
  showDetailDialog.value = true
}

const useTemplate = (template) => {
  ElMessage.success(`正在使用模板：${template.name}`)
  template.usageCount++
}

const editTemplate = (template) => {
  ElMessage.info(`编辑模板：${template.name}`)
}

const copyTemplate = (template) => {
  ElMessage.success(`模板已复制：${template.name}`)
}

const toggleFavorite = (template) => {
  template.favoriteCount = template.favoriteCount + (Math.random() > 0.5 ? 1 : -1)
  ElMessage.success('收藏状态已更新')
}

const deleteTemplate = (template) => {
  ElMessageBox.confirm(
    `确定要删除模板"${template.name}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = templates.value.findIndex(t => t.id === template.id)
    if (index > -1) {
      templates.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const createTemplate = () => {
  createFormRef.value.validate((valid) => {
    if (valid) {
      const template = {
        id: Date.now(),
        ...newTemplate,
        usageCount: 0,
        favoriteCount: 0,
        creator: '当前用户',
        creatorAvatar: '',
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString(),
        usageRecords: []
      }
      templates.value.unshift(template)
      showCreateDialog.value = false
      resetNewTemplate()
      ElMessage.success('模板创建成功')
    }
  })
}

const resetNewTemplate = () => {
  Object.assign(newTemplate, {
    name: '',
    category: '',
    description: '',
    content: '',
    tags: '',
    status: 'enabled'
  })
}

const handleCreateClose = () => {
  resetNewTemplate()
  showCreateDialog.value = false
}

const handleDetailClose = () => {
  selectedTemplate.value = null
  showDetailDialog.value = false
}

const importTemplate = () => {
  ElMessage.info('导入模板功能开发中...')
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const copyContent = () => {
  if (selectedTemplate.value) {
    navigator.clipboard.writeText(selectedTemplate.value.content)
    ElMessage.success('内容已复制到剪贴板')
  }
}

const saveContent = () => {
  if (selectedTemplate.value) {
    selectedTemplate.value.updateTime = new Date().toLocaleString()
    ElMessage.success('内容已保存')
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.document-template-container {
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

  .template-overview {
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

  .template-toolbar {
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

  .template-tabs {
    position: relative;
    z-index: 1;

    :deep(.el-tabs__header) {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 12px 12px 0 0;
      margin: 0;
      padding: 0 20px;
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        display: none;
      }
    }

    :deep(.el-tabs__item) {
      color: rgba(255, 255, 255, 0.7);
      border: none;
      
      &.is-active {
        color: #00e5ff;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
      }

      &:hover {
        color: #00e5ff;
      }
    }

    :deep(.el-tabs__active-bar) {
      background: linear-gradient(90deg, #00e5ff, #0080ff);
      height: 3px;
    }

    :deep(.el-tabs__content) {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-top: none;
      border-radius: 0 0 12px 12px;
      padding: 24px;
    }
  }

  .template-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;

    .template-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
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
        transform: translateY(-4px);
        border-color: rgba(0, 229, 255, 0.6);
        box-shadow: 0 12px 40px rgba(0, 229, 255, 0.2);

        &::before {
          left: 100%;
        }
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .template-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #00e5ff, #0080ff);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
      }

      .card-content {
        .template-name {
          font-size: 18px;
          font-weight: 600;
          color: #00e5ff;
          margin-bottom: 8px;
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
        }

        .template-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .template-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .template-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid rgba(0, 229, 255, 0.2);

        .creator-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .creator-name {
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
          }
        }
      }
    }
  }

  .template-list {
    :deep(.el-table) {
      background: transparent;
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 12px;
      overflow: hidden;

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

    .template-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #00e5ff;
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

    .el-radio-group {
      .el-radio {
        .el-radio__label {
          color: rgba(255, 255, 255, 0.8);
        }

        &.is-checked {
          .el-radio__label {
            color: #00e5ff;
          }
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

    &:not(.el-button--primary) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);

      &:hover {
        background: rgba(0, 229, 255, 0.1);
        border-color: rgba(0, 229, 255, 0.5);
        color: #00e5ff;
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

  .template-detail {
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

    .template-content {
      .content-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 12px;
        background: rgba(0, 229, 255, 0.05);
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 8px;

        .toolbar-actions {
          display: flex;
          gap: 8px;
        }
      }

      .content-editor,
      .content-preview {
        min-height: 400px;
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 8px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.02);
      }

      .markdown-content {
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

    .usage-records {
      :deep(.el-table) {
        background: transparent;
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 8px;

        .el-table__header {
          background: rgba(0, 229, 255, 0.05);
          
          th {
            background: transparent;
            border-bottom: 1px solid rgba(0, 229, 255, 0.2);
            color: #00e5ff;
          }
        }

        .el-table__body {
          tr {
            background: rgba(255, 255, 255, 0.01);
            
            &:hover {
              background: rgba(0, 229, 255, 0.05);
            }

            td {
              border-bottom: 1px solid rgba(0, 229, 255, 0.1);
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }
      }
    }
  }
}
</style>
