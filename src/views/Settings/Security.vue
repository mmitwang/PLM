<template>
  <div class="security-settings-container">
    <!-- 安全设置概览 -->
    <div class="security-overview">
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Lock /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">密码策略</div>
            <div class="card-value">{{ overviewData.passwordPolicies }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Shield /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">访问控制</div>
            <div class="card-value">{{ overviewData.accessControls }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">安全事件</div>
            <div class="card-value">{{ overviewData.securityEvents }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon">
            <el-icon><View /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">审计日志</div>
            <div class="card-value">{{ overviewData.auditLogs }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全设置标签页 -->
    <div class="security-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <!-- 密码策略 -->
        <el-tab-pane label="密码策略" name="password">
          <div class="password-policy-section">
            <div class="section-header">
              <h3>密码安全策略</h3>
              <el-button type="primary" @click="savePasswordPolicy">保存设置</el-button>
            </div>
            
            <el-form :model="passwordPolicy" label-width="150px" class="policy-form">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="最小长度">
                    <el-input-number v-model="passwordPolicy.minLength" :min="6" :max="32" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最大长度">
                    <el-input-number v-model="passwordPolicy.maxLength" :min="8" :max="128" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="密码有效期(天)">
                    <el-input-number v-model="passwordPolicy.validityDays" :min="30" :max="365" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="历史密码限制">
                    <el-input-number v-model="passwordPolicy.historyLimit" :min="3" :max="24" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="复杂度要求">
                <el-checkbox-group v-model="passwordPolicy.complexity">
                  <el-checkbox label="uppercase">包含大写字母</el-checkbox>
                  <el-checkbox label="lowercase">包含小写字母</el-checkbox>
                  <el-checkbox label="numbers">包含数字</el-checkbox>
                  <el-checkbox label="symbols">包含特殊字符</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item label="登录失败限制">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-input-number v-model="passwordPolicy.maxFailAttempts" :min="3" :max="10" />
                    <span style="margin-left: 8px;">次失败后锁定</span>
                  </el-col>
                  <el-col :span="12">
                    <el-input-number v-model="passwordPolicy.lockoutDuration" :min="5" :max="1440" />
                    <span style="margin-left: 8px;">分钟</span>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 访问控制 -->
        <el-tab-pane label="访问控制" name="access">
          <div class="access-control-section">
            <div class="section-header">
              <h3>访问控制设置</h3>
              <el-button type="primary" @click="showAddIpDialog = true">添加IP规则</el-button>
            </div>
            
            <!-- IP白名单 -->
            <div class="ip-whitelist">
              <h4>IP访问控制</h4>
              <el-table :data="ipRules" style="width: 100%">
                <el-table-column prop="ip" label="IP地址/段" width="200" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.type === 'allow' ? 'success' : 'danger'">
                      {{ scope.row.type === 'allow' ? '允许' : '拒绝' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="createTime" label="创建时间" width="150" />
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button size="small" @click="editIpRule(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteIpRule(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <!-- 会话管理 -->
            <div class="session-management">
              <h4>会话管理</h4>
              <el-form :model="sessionConfig" label-width="150px" class="session-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="会话超时(分钟)">
                      <el-input-number v-model="sessionConfig.timeout" :min="5" :max="1440" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="最大并发会话">
                      <el-input-number v-model="sessionConfig.maxConcurrent" :min="1" :max="10" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item label="强制单点登录">
                  <el-switch v-model="sessionConfig.singleSignOn" />
                  <span style="margin-left: 8px; color: rgba(255,255,255,0.6);">启用后同一用户只能在一个地方登录</span>
                </el-form-item>
                
                <el-form-item label="记住登录状态">
                  <el-switch v-model="sessionConfig.rememberMe" />
                  <span style="margin-left: 8px; color: rgba(255,255,255,0.6);">允许用户选择记住登录状态</span>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveSessionConfig">保存会话设置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <!-- 审计日志 -->
        <el-tab-pane label="审计日志" name="audit">
          <div class="audit-log-section">
            <div class="section-header">
              <h3>系统审计日志</h3>
              <div class="header-actions">
                <el-input
                  v-model="auditSearch"
                  placeholder="搜索日志..."
                  prefix-icon="Search"
                  style="width: 300px; margin-right: 12px;"
                />
                <el-select v-model="auditTypeFilter" placeholder="日志类型" style="width: 150px; margin-right: 12px;">
                  <el-option label="全部类型" value="" />
                  <el-option label="登录" value="login" />
                  <el-option label="操作" value="operation" />
                  <el-option label="安全" value="security" />
                  <el-option label="系统" value="system" />
                </el-select>
                <el-button @click="exportAuditLogs">导出日志</el-button>
                <el-button @click="refreshAuditLogs">刷新</el-button>
              </div>
            </div>
            
            <el-table :data="filteredAuditLogs" style="width: 100%">
              <el-table-column prop="timestamp" label="时间" width="150" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="getAuditTypeTag(scope.row.type)">
                    {{ getAuditTypeText(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="user" label="用户" width="120" />
              <el-table-column prop="action" label="操作" width="150" />
              <el-table-column prop="resource" label="资源" width="150" />
              <el-table-column prop="ip" label="IP地址" width="120" />
              <el-table-column prop="result" label="结果" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.result === 'success' ? 'success' : 'danger'">
                    {{ scope.row.result === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="details" label="详情" />
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="auditCurrentPage"
                v-model:page-size="auditPageSize"
                :page-sizes="[20, 50, 100, 200]"
                :total="auditTotalCount"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleAuditSizeChange"
                @current-change="handleAuditCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 安全监控 -->
        <el-tab-pane label="安全监控" name="monitoring">
          <div class="security-monitoring-section">
            <div class="section-header">
              <h3>安全事件监控</h3>
              <el-button type="primary" @click="refreshSecurityEvents">刷新数据</el-button>
            </div>
            
            <!-- 安全事件统计 -->
            <div class="security-stats">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="stat-card">
                    <div class="stat-icon danger">
                      <el-icon><Warning /></el-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-title">今日威胁</div>
                      <div class="stat-value">{{ securityStats.todayThreats }}</div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-card">
                    <div class="stat-icon warning">
                      <el-icon><Lock /></el-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-title">登录失败</div>
                      <div class="stat-value">{{ securityStats.failedLogins }}</div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-card">
                    <div class="stat-icon info">
                      <el-icon><User /></el-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-title">在线用户</div>
                      <div class="stat-value">{{ securityStats.onlineUsers }}</div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stat-card">
                    <div class="stat-icon success">
                      <el-icon><Shield /></el-icon>
                    </div>
                    <div class="stat-content">
                      <div class="stat-title">安全评分</div>
                      <div class="stat-value">{{ securityStats.securityScore }}%</div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
            
            <!-- 安全事件列表 -->
            <div class="security-events">
              <h4>最近安全事件</h4>
              <el-table :data="securityEvents" style="width: 100%">
                <el-table-column prop="timestamp" label="时间" width="150" />
                <el-table-column prop="level" label="级别" width="100">
                  <template #default="scope">
                    <el-tag :type="getSecurityLevelTag(scope.row.level)">
                      {{ getSecurityLevelText(scope.row.level) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="事件类型" width="150" />
                <el-table-column prop="source" label="来源" width="120" />
                <el-table-column prop="target" label="目标" width="120" />
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'resolved' ? 'success' : 'warning'">
                      {{ scope.row.status === 'resolved' ? '已处理' : '待处理' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button size="small" @click="viewSecurityEvent(scope.row)">详情</el-button>
                    <el-button 
                      size="small" 
                      type="success" 
                      @click="resolveSecurityEvent(scope.row)"
                      :disabled="scope.row.status === 'resolved'"
                    >
                      处理
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 添加IP规则对话框 -->
    <el-dialog
      v-model="showAddIpDialog"
      title="添加IP访问规则"
      width="600px"
    >
      <el-form :model="newIpRule" :rules="ipRuleRules" ref="ipRuleFormRef" label-width="120px">
        <el-form-item label="IP地址/段" prop="ip">
          <el-input v-model="newIpRule.ip" placeholder="例如: 192.168.1.1 或 192.168.1.0/24" />
        </el-form-item>
        <el-form-item label="规则类型" prop="type">
          <el-radio-group v-model="newIpRule.type">
            <el-radio label="allow">允许</el-radio>
            <el-radio label="deny">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="newIpRule.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddIpDialog = false">取消</el-button>
          <el-button type="primary" @click="addIpRule">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Lock, Shield, Warning, View, User, Search 
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('password')
const auditSearch = ref('')
const auditTypeFilter = ref('')
const auditCurrentPage = ref(1)
const auditPageSize = ref(20)
const auditTotalCount = ref(0)
const showAddIpDialog = ref(false)
const ipRuleFormRef = ref(null)

// 概览数据
const overviewData = reactive({
  passwordPolicies: 5,
  accessControls: 12,
  securityEvents: 3,
  auditLogs: 1248
})

// 密码策略
const passwordPolicy = reactive({
  minLength: 8,
  maxLength: 32,
  validityDays: 90,
  historyLimit: 5,
  complexity: ['uppercase', 'lowercase', 'numbers'],
  maxFailAttempts: 5,
  lockoutDuration: 30
})

// IP规则
const ipRules = ref([
  {
    id: 1,
    ip: '192.168.1.0/24',
    type: 'allow',
    description: '内网IP段',
    createTime: '2024-01-15 10:30'
  },
  {
    id: 2,
    ip: '10.0.0.0/8',
    type: 'allow',
    description: '办公网络',
    createTime: '2024-01-14 16:20'
  },
  {
    id: 3,
    ip: '192.168.100.50',
    type: 'deny',
    description: '可疑IP地址',
    createTime: '2024-01-13 09:15'
  }
])

// 新IP规则
const newIpRule = reactive({
  ip: '',
  type: 'allow',
  description: ''
})

// IP规则验证规则
const ipRuleRules = {
  ip: [
    { required: true, message: '请输入IP地址或IP段', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ]
}

// 会话配置
const sessionConfig = reactive({
  timeout: 30,
  maxConcurrent: 3,
  singleSignOn: false,
  rememberMe: true
})

// 审计日志
const auditLogs = ref([
  {
    id: 1,
    timestamp: '2024-01-15 14:30:25',
    type: 'login',
    user: '张三',
    action: '用户登录',
    resource: '系统',
    ip: '192.168.1.100',
    result: 'success',
    details: '登录成功'
  },
  {
    id: 2,
    timestamp: '2024-01-15 14:25:10',
    type: 'operation',
    user: '李四',
    action: '修改产品信息',
    resource: '产品管理',
    ip: '192.168.1.101',
    result: 'success',
    details: '修改产品ID为P001的信息'
  },
  {
    id: 3,
    timestamp: '2024-01-15 14:20:45',
    type: 'security',
    user: '未知',
    action: '登录失败',
    resource: '系统',
    ip: '192.168.100.50',
    result: 'failure',
    details: '密码错误，连续失败3次'
  },
  {
    id: 4,
    timestamp: '2024-01-15 14:15:30',
    type: 'system',
    user: '系统',
    action: '数据备份',
    resource: '数据库',
    ip: '127.0.0.1',
    result: 'success',
    details: '定时数据备份完成'
  }
])

// 安全统计
const securityStats = reactive({
  todayThreats: 2,
  failedLogins: 8,
  onlineUsers: 15,
  securityScore: 85
})

// 安全事件
const securityEvents = ref([
  {
    id: 1,
    timestamp: '2024-01-15 14:30',
    level: 'high',
    type: '暴力破解攻击',
    source: '192.168.100.50',
    target: '登录系统',
    description: '检测到来自该IP的连续登录失败尝试',
    status: 'pending'
  },
  {
    id: 2,
    timestamp: '2024-01-15 13:45',
    level: 'medium',
    type: '异常访问',
    source: '203.0.113.10',
    target: '文档管理',
    description: '非工作时间访问敏感文档',
    status: 'resolved'
  },
  {
    id: 3,
    timestamp: '2024-01-15 12:20',
    level: 'low',
    type: '权限提升尝试',
    source: '192.168.1.150',
    target: '用户管理',
    description: '普通用户尝试访问管理员功能',
    status: 'resolved'
  }
])

// 计算属性
const filteredAuditLogs = computed(() => {
  return auditLogs.value.filter(log => {
    const matchesSearch = !auditSearch.value || 
      log.user.includes(auditSearch.value) ||
      log.action.includes(auditSearch.value) ||
      log.details.includes(auditSearch.value)
    
    const matchesType = !auditTypeFilter.value || log.type === auditTypeFilter.value
    
    return matchesSearch && matchesType
  })
})

// 方法
const handleTabChange = (tab) => {
  // 标签页切换逻辑
}

const savePasswordPolicy = () => {
  ElMessage.success('密码策略已保存')
}

const saveSessionConfig = () => {
  ElMessage.success('会话设置已保存')
}

const addIpRule = () => {
  ipRuleFormRef.value.validate((valid) => {
    if (valid) {
      const rule = {
        id: Date.now(),
        ...newIpRule,
        createTime: new Date().toLocaleString()
      }
      ipRules.value.unshift(rule)
      showAddIpDialog.value = false
      Object.assign(newIpRule, { ip: '', type: 'allow', description: '' })
      ElMessage.success('IP规则添加成功')
    }
  })
}

const editIpRule = (rule) => {
  ElMessage.info(`编辑IP规则: ${rule.ip}`)
}

const deleteIpRule = (rule) => {
  ElMessageBox.confirm(
    `确定要删除IP规则"${rule.ip}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = ipRules.value.findIndex(r => r.id === rule.id)
    if (index > -1) {
      ipRules.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const getAuditTypeTag = (type) => {
  const tags = {
    login: 'primary',
    operation: 'success',
    security: 'danger',
    system: 'info'
  }
  return tags[type] || 'info'
}

const getAuditTypeText = (type) => {
  const texts = {
    login: '登录',
    operation: '操作',
    security: '安全',
    system: '系统'
  }
  return texts[type] || type
}

const getSecurityLevelTag = (level) => {
  const tags = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return tags[level] || 'info'
}

const getSecurityLevelText = (level) => {
  const texts = {
    high: '高危',
    medium: '中危',
    low: '低危'
  }
  return texts[level] || level
}

const handleAuditSizeChange = (size) => {
  auditPageSize.value = size
  auditCurrentPage.value = 1
}

const handleAuditCurrentChange = (page) => {
  auditCurrentPage.value = page
}

const exportAuditLogs = () => {
  ElMessage.success('审计日志导出功能开发中...')
}

const refreshAuditLogs = () => {
  ElMessage.success('审计日志已刷新')
}

const refreshSecurityEvents = () => {
  ElMessage.success('安全事件数据已刷新')
}

const viewSecurityEvent = (event) => {
  ElMessage.info(`查看安全事件详情: ${event.type}`)
}

const resolveSecurityEvent = (event) => {
  ElMessageBox.confirm(
    `确定要将安全事件"${event.type}"标记为已处理吗？`,
    '确认处理',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    event.status = 'resolved'
    ElMessage.success('安全事件已标记为已处理')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 生命周期
onMounted(() => {
  auditTotalCount.value = auditLogs.value.length
})
</script>

<style lang="scss" scoped>
.security-settings-container {
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

  .security-overview {
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
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(0, 128, 255, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--hologram-primary);
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
            font-weight: 600;
            color: var(--hologram-primary);
            text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
          }
        }
      }
    }
  }

  .security-tabs {
    position: relative;
    z-index: 1;

    :deep(.el-tabs) {
      .el-tabs__header {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-radius: 12px 12px 0 0;
        margin: 0;
        padding: 0 20px;

        .el-tabs__nav-wrap {
          &::after {
            display: none;
          }
        }

        .el-tabs__item {
          color: rgba(255, 255, 255, 0.7);
          border: none;
          padding: 0 20px;
          height: 50px;
          line-height: 50px;
          transition: all 0.3s ease;

          &:hover {
            color: var(--hologram-primary);
          }

          &.is-active {
            color: var(--hologram-primary);
            background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 128, 255, 0.1));
            border-radius: 8px;
            margin: 8px 4px;
            height: 34px;
            line-height: 34px;
          }
        }
      }

      .el-tabs__content {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 229, 255, 0.3);
        border-top: none;
        border-radius: 0 0 12px 12px;
        padding: 24px;
      }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);

      h3, h4 {
        color: var(--hologram-primary);
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
      }

      h4 {
        font-size: 16px;
        margin: 16px 0;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    // 密码策略样式
    .password-policy-section {
      .policy-form {
        :deep(.el-form-item__label) {
          color: rgba(255, 255, 255, 0.8);
        }

        :deep(.el-input-number) {
          .el-input__inner {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.3);
            color: white;

            &:focus {
              border-color: var(--hologram-primary);
              box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
            }
          }
        }

        :deep(.el-checkbox-group) {
          .el-checkbox {
            .el-checkbox__label {
              color: rgba(255, 255, 255, 0.8);
            }

            .el-checkbox__input.is-checked .el-checkbox__inner {
              background-color: var(--hologram-primary);
              border-color: var(--hologram-primary);
            }
          }
        }
      }
    }

    // 访问控制样式
    .access-control-section {
      .ip-whitelist, .session-management {
        margin-bottom: 32px;

        :deep(.el-table) {
          background: transparent;
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: 8px;
          overflow: hidden;

          .el-table__header {
            background: rgba(0, 229, 255, 0.1);

            th {
              background: transparent;
              border-bottom: 1px solid rgba(0, 229, 255, 0.3);
              color: var(--hologram-primary);
              font-weight: 600;
            }
          }

          .el-table__body {
            tr {
              background: rgba(255, 255, 255, 0.02);

              &:hover {
                background: rgba(0, 229, 255, 0.05);
              }

              td {
                border-bottom: 1px solid rgba(0, 229, 255, 0.1);
                color: rgba(255, 255, 255, 0.9);
              }
            }
          }
        }

        .session-form {
          :deep(.el-form-item__label) {
            color: rgba(255, 255, 255, 0.8);
          }

          :deep(.el-switch) {
            .el-switch__core {
              background: rgba(255, 255, 255, 0.2);

              &.is-checked {
                background: var(--hologram-primary);
              }
            }
          }
        }
      }
    }

    // 审计日志样式
    .audit-log-section {
      .pagination-container {
        display: flex;
        justify-content: center;
        margin-top: 24px;

        :deep(.el-pagination) {
          .el-pager li {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.3);
            color: rgba(255, 255, 255, 0.8);

            &:hover {
              background: rgba(0, 229, 255, 0.2);
              color: white;
            }

            &.is-active {
              background: var(--hologram-primary);
              border-color: var(--hologram-primary);
              color: white;
            }
          }

          .btn-prev, .btn-next {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.3);
            color: rgba(255, 255, 255, 0.8);

            &:hover {
              background: rgba(0, 229, 255, 0.2);
              color: white;
            }
          }
        }
      }
    }

    // 安全监控样式
    .security-monitoring-section {
      .security-stats {
        margin-bottom: 32px;

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(0, 229, 255, 0.2);
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;

            &.danger {
              background: linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 77, 79, 0.1));
              color: #ff4d4f;
            }

            &.warning {
              background: linear-gradient(135deg, rgba(250, 173, 20, 0.2), rgba(250, 173, 20, 0.1));
              color: #faad14;
            }

            &.info {
              background: linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.1));
              color: #1890ff;
            }

            &.success {
              background: linear-gradient(135deg, rgba(82, 196, 26, 0.2), rgba(82, 196, 26, 0.1));
              color: #52c41a;
            }
          }

          .stat-content {
            flex: 1;

            .stat-title {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 8px;
            }

            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: white;
            }
          }
        }
      }

      .security-events {
        h4 {
          color: var(--hologram-primary);
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0;
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
        }
      }
    }
  }

  // 对话框样式
  :deep(.el-dialog) {
    background: rgba(10, 25, 41, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 12px;

    .el-dialog__header {
      background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 128, 255, 0.1));
      border-bottom: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 12px 12px 0 0;

      .el-dialog__title {
        color: var(--hologram-primary);
        font-weight: 600;
      }

      .el-dialog__headerbtn {
        .el-dialog__close {
          color: rgba(255, 255, 255, 0.7);

          &:hover {
            color: var(--hologram-primary);
          }
        }
      }
    }

    .el-dialog__body {
      background: transparent;

      .el-form {
        .el-form-item__label {
          color: rgba(255, 255, 255, 0.8);
        }

        .el-input__inner, .el-textarea__inner {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.3);
          color: white;

          &:focus {
            border-color: var(--hologram-primary);
            box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
          }

          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
        }

        .el-radio-group {
          .el-radio {
            .el-radio__label {
              color: rgba(255, 255, 255, 0.8);
            }

            .el-radio__input.is-checked .el-radio__inner {
              background: var(--hologram-primary);
              border-color: var(--hologram-primary);
            }
          }
        }
      }
    }

    .el-dialog__footer {
      background: rgba(0, 229, 255, 0.05);
      border-top: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 0 0 12px 12px;
    }
  }

  // 按钮样式
  :deep(.el-button) {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;

    &.el-button--primary {
      background: linear-gradient(135deg, var(--hologram-primary), var(--hologram-secondary));
      border: 1px solid var(--hologram-primary);
      color: white;

      &:hover {
        background: linear-gradient(135deg, var(--hologram-secondary), var(--hologram-primary));
        box-shadow: 0 4px 16px rgba(0, 229, 255, 0.3);
        transform: translateY(-1px);
      }
    }

    &.el-button--success {
      background: linear-gradient(135deg, #52c41a, #73d13d);
      border: 1px solid #52c41a;

      &:hover {
        box-shadow: 0 4px 16px rgba(82, 196, 26, 0.3);
        transform: translateY(-1px);
      }
    }

    &.el-button--danger {
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
      border: 1px solid #ff4d4f;

      &:hover {
        box-shadow: 0 4px 16px rgba(255, 77, 79, 0.3);
        transform: translateY(-1px);
      }
    }

    &.el-button--default {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);

      &:hover {
        background: rgba(0, 229, 255, 0.1);
        border-color: var(--hologram-primary);
        color: white;
      }
    }
  }

  // 输入框样式
  :deep(.el-input) {
    .el-input__inner {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 8px;
      color: white;
      transition: all 0.3s ease;

      &:focus {
        border-color: var(--hologram-primary);
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
      }

      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }

    .el-input__prefix, .el-input__suffix {
      .el-input__icon {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  // 选择器样式
  :deep(.el-select) {
    .el-input__inner {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: white;

      &:focus {
        border-color: var(--hologram-primary);
      }
    }
  }

  // 标签样式
  :deep(.el-tag) {
    border-radius: 6px;
    font-weight: 500;

    &.el-tag--primary {
      background: rgba(24, 144, 255, 0.2);
      border-color: #1890ff;
      color: #1890ff;
    }

    &.el-tag--success {
      background: rgba(82, 196, 26, 0.2);
      border-color: #52c41a;
      color: #52c41a;
    }

    &.el-tag--warning {
      background: rgba(250, 173, 20, 0.2);
      border-color: #faad14;
      color: #faad14;
    }

    &.el-tag--danger {
      background: rgba(255, 77, 79, 0.2);
      border-color: #ff4d4f;
      color: #ff4d4f;
    }

    &.el-tag--info {
      background: rgba(0, 229, 255, 0.2);
      border-color: var(--hologram-primary);
      color: var(--hologram-primary);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .security-settings-container {
    padding: 16px;

    .security-overview {
      .overview-cards {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .security-tabs {
      :deep(.el-tabs__content) {
        padding: 16px;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .header-actions {
          width: 100%;
          flex-wrap: wrap;
        }
      }

      .security-stats {
        .el-row {
          .el-col {
            margin-bottom: 16px;
          }
        }
      }
    }
  }
}
