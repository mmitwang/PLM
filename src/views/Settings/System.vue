<template>
  <div class="system-settings">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-description">PLM系统配置与管理</p>
    </div>

    <div class="settings-grid">
      <!-- 基础配置 -->
      <div class="holographic-card config-card">
        <div class="card-header">
          <h3>基础配置</h3>
        </div>
        <el-form :model="systemConfig" label-width="120px" class="holographic-form">
          <el-form-item label="系统名称">
            <el-input v-model="systemConfig.systemName" placeholder="请输入系统名称" />
          </el-form-item>
          <el-form-item label="系统版本">
            <el-input v-model="systemConfig.version" placeholder="请输入系统版本" />
          </el-form-item>
          <el-form-item label="公司名称">
            <el-input v-model="systemConfig.companyName" placeholder="请输入公司名称" />
          </el-form-item>
          <el-form-item label="系统描述">
            <el-input
              v-model="systemConfig.description"
              type="textarea"
              :rows="3"
              placeholder="请输入系统描述"
            />
          </el-form-item>
          <el-form-item label="时区设置">
            <el-select v-model="systemConfig.timezone" placeholder="请选择时区">
              <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
              <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
              <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
              <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
            </el-select>
          </el-form-item>
          <el-form-item label="语言设置">
            <el-select v-model="systemConfig.language" placeholder="请选择语言">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
              <el-option label="日本語" value="ja-JP" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 安全配置 -->
      <div class="holographic-card security-card">
        <div class="card-header">
          <h3>安全配置</h3>
        </div>
        <el-form :model="securityConfig" label-width="140px" class="holographic-form">
          <el-form-item label="密码最小长度">
            <el-input-number
              v-model="securityConfig.minPasswordLength"
              :min="6"
              :max="20"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="密码复杂度">
            <el-checkbox-group v-model="securityConfig.passwordComplexity">
              <el-checkbox label="uppercase">包含大写字母</el-checkbox>
              <el-checkbox label="lowercase">包含小写字母</el-checkbox>
              <el-checkbox label="numbers">包含数字</el-checkbox>
              <el-checkbox label="symbols">包含特殊字符</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="会话超时时间">
            <el-input-number
              v-model="securityConfig.sessionTimeout"
              :min="5"
              :max="480"
              controls-position="right"
            />
            <span class="form-text">分钟</span>
          </el-form-item>
          <el-form-item label="登录失败锁定">
            <el-switch v-model="securityConfig.loginLockEnabled" />
          </el-form-item>
          <el-form-item label="最大失败次数" v-if="securityConfig.loginLockEnabled">
            <el-input-number
              v-model="securityConfig.maxLoginAttempts"
              :min="3"
              :max="10"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="锁定时间" v-if="securityConfig.loginLockEnabled">
            <el-input-number
              v-model="securityConfig.lockDuration"
              :min="5"
              :max="60"
              controls-position="right"
            />
            <span class="form-text">分钟</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据库配置 -->
      <div class="holographic-card database-card">
        <div class="card-header">
          <h3>数据库配置</h3>
          <div class="connection-status" :class="dbStatus">
            <i :class="getStatusIcon(dbStatus)"></i>
            {{ getStatusText(dbStatus) }}
          </div>
        </div>
        <el-form :model="databaseConfig" label-width="120px" class="holographic-form">
          <el-form-item label="数据库类型">
            <el-select v-model="databaseConfig.type" placeholder="请选择数据库类型">
              <el-option label="MySQL" value="mysql" />
              <el-option label="PostgreSQL" value="postgresql" />
              <el-option label="Oracle" value="oracle" />
              <el-option label="SQL Server" value="sqlserver" />
            </el-select>
          </el-form-item>
          <el-form-item label="服务器地址">
            <el-input v-model="databaseConfig.host" placeholder="请输入服务器地址" />
          </el-form-item>
          <el-form-item label="端口">
            <el-input-number
              v-model="databaseConfig.port"
              :min="1"
              :max="65535"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="数据库名">
            <el-input v-model="databaseConfig.database" placeholder="请输入数据库名" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="databaseConfig.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="databaseConfig.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="testConnection" :loading="testing">
              测试连接
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 邮件配置 -->
      <div class="holographic-card email-card">
        <div class="card-header">
          <h3>邮件配置</h3>
        </div>
        <el-form :model="emailConfig" label-width="120px" class="holographic-form">
          <el-form-item label="SMTP服务器">
            <el-input v-model="emailConfig.smtpHost" placeholder="请输入SMTP服务器地址" />
          </el-form-item>
          <el-form-item label="端口">
            <el-input-number
              v-model="emailConfig.smtpPort"
              :min="1"
              :max="65535"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="加密方式">
            <el-select v-model="emailConfig.encryption" placeholder="请选择加密方式">
              <el-option label="无加密" value="none" />
              <el-option label="SSL" value="ssl" />
              <el-option label="TLS" value="tls" />
            </el-select>
          </el-form-item>
          <el-form-item label="发件人邮箱">
            <el-input v-model="emailConfig.fromEmail" placeholder="请输入发件人邮箱" />
          </el-form-item>
          <el-form-item label="发件人名称">
            <el-input v-model="emailConfig.fromName" placeholder="请输入发件人名称" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="emailConfig.username" placeholder="请输入邮箱用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="emailConfig.password"
              type="password"
              placeholder="请输入邮箱密码"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="testEmail" :loading="testingEmail">
              发送测试邮件
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 系统监控 -->
      <div class="holographic-card monitor-card">
        <div class="card-header">
          <h3>系统监控</h3>
          <el-button type="text" @click="refreshMonitor">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
        </div>
        <div class="monitor-grid">
          <div class="monitor-item">
            <div class="monitor-label">CPU使用率</div>
            <div class="monitor-value">{{ systemMonitor.cpuUsage }}%</div>
            <div class="monitor-bar">
              <div class="bar-fill" :style="{ width: systemMonitor.cpuUsage + '%' }"></div>
            </div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">内存使用率</div>
            <div class="monitor-value">{{ systemMonitor.memoryUsage }}%</div>
            <div class="monitor-bar">
              <div class="bar-fill" :style="{ width: systemMonitor.memoryUsage + '%' }"></div>
            </div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">磁盘使用率</div>
            <div class="monitor-value">{{ systemMonitor.diskUsage }}%</div>
            <div class="monitor-bar">
              <div class="bar-fill" :style="{ width: systemMonitor.diskUsage + '%' }"></div>
            </div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">在线用户</div>
            <div class="monitor-value">{{ systemMonitor.onlineUsers }}</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">系统运行时间</div>
            <div class="monitor-value">{{ systemMonitor.uptime }}</div>
          </div>
          <div class="monitor-item">
            <div class="monitor-label">数据库连接</div>
            <div class="monitor-value">{{ systemMonitor.dbConnections }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="holographic-card actions-card">
        <div class="card-header">
          <h3>系统操作</h3>
        </div>
        <div class="actions-grid">
          <el-button type="primary" @click="saveSettings" :loading="saving">
            <i class="el-icon-check"></i>
            保存设置
          </el-button>
          <el-button @click="resetSettings">
            <i class="el-icon-refresh-left"></i>
            重置设置
          </el-button>
          <el-button type="warning" @click="clearCache">
            <i class="el-icon-delete"></i>
            清除缓存
          </el-button>
          <el-button type="danger" @click="restartSystem">
            <i class="el-icon-refresh"></i>
            重启系统
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const saving = ref(false)
const testing = ref(false)
const testingEmail = ref(false)
const dbStatus = ref('connected')

const systemConfig = ref({
  systemName: 'PLM产品生命周期管理系统',
  version: '1.0.0',
  companyName: '智能制造科技有限公司',
  description: '专业的产品生命周期管理解决方案',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN'
})

const securityConfig = ref({
  minPasswordLength: 8,
  passwordComplexity: ['lowercase', 'numbers'],
  sessionTimeout: 30,
  loginLockEnabled: true,
  maxLoginAttempts: 5,
  lockDuration: 15
})

const databaseConfig = ref({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'plm_system',
  username: 'root',
  password: ''
})

const emailConfig = ref({
  smtpHost: 'smtp.qq.com',
  smtpPort: 587,
  encryption: 'tls',
  fromEmail: 'system@company.com',
  fromName: 'PLM系统',
  username: '',
  password: ''
})

const systemMonitor = ref({
  cpuUsage: 45,
  memoryUsage: 68,
  diskUsage: 32,
  onlineUsers: 12,
  uptime: '7天 12小时 35分钟',
  dbConnections: 8
})

// 方法
const getStatusIcon = (status) => {
  const iconMap = {
    connected: 'el-icon-success',
    disconnected: 'el-icon-error',
    connecting: 'el-icon-loading'
  }
  return iconMap[status] || 'el-icon-warning'
}

const getStatusText = (status) => {
  const textMap = {
    connected: '已连接',
    disconnected: '连接失败',
    connecting: '连接中'
  }
  return textMap[status] || '未知状态'
}

const testConnection = async () => {
  testing.value = true
  dbStatus.value = 'connecting'
  
  try {
    // 模拟测试连接
    await new Promise(resolve => setTimeout(resolve, 2000))
    dbStatus.value = 'connected'
    ElMessage.success('数据库连接测试成功')
  } catch (error) {
    dbStatus.value = 'disconnected'
    ElMessage.error('数据库连接测试失败')
  } finally {
    testing.value = false
  }
}

const testEmail = async () => {
  testingEmail.value = true
  
  try {
    // 模拟发送测试邮件
    await new Promise(resolve => setTimeout(resolve, 3000))
    ElMessage.success('测试邮件发送成功')
  } catch (error) {
    ElMessage.error('测试邮件发送失败')
  } finally {
    testingEmail.value = false
  }
}

const refreshMonitor = () => {
  // 模拟刷新监控数据
  systemMonitor.value = {
    cpuUsage: Math.floor(Math.random() * 100),
    memoryUsage: Math.floor(Math.random() * 100),
    diskUsage: Math.floor(Math.random() * 100),
    onlineUsers: Math.floor(Math.random() * 50),
    uptime: '7天 12小时 35分钟',
    dbConnections: Math.floor(Math.random() * 20)
  }
  ElMessage.success('监控数据已刷新')
}

const saveSettings = async () => {
  saving.value = true
  
  try {
    // 模拟保存设置
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('设置保存失败')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  ElMessageBox.confirm('确定要重置所有设置吗？', '确认重置', {
    type: 'warning'
  }).then(() => {
    // 重置设置逻辑
    ElMessage.success('设置已重置')
  }).catch(() => {
    // 取消重置
  })
}

const clearCache = () => {
  ElMessageBox.confirm('确定要清除系统缓存吗？', '确认清除', {
    type: 'warning'
  }).then(() => {
    // 清除缓存逻辑
    ElMessage.success('缓存已清除')
  }).catch(() => {
    // 取消清除
  })
}

const restartSystem = () => {
  ElMessageBox.confirm('确定要重启系统吗？重启后所有用户将被断开连接。', '确认重启', {
    type: 'error'
  }).then(() => {
    // 重启系统逻辑
    ElMessage.success('系统重启中...')
  }).catch(() => {
    // 取消重启
  })
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.system-settings {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);

  .page-header {
    margin-bottom: 24px;
    
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 8px 0;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }
    
    .page-description {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;

    .config-card,
    .security-card {
      grid-column: span 1;
    }

    .database-card,
    .email-card {
      grid-column: span 1;
    }

    .monitor-card {
      grid-column: 1 / -1;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .monitor-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        
        .monitor-item {
          text-align: center;
          
          .monitor-label {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .monitor-value {
            color: #00e5ff;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
          }
          
          .monitor-bar {
            height: 4px;
            background: rgba(0, 229, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
            
            .bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #00e5ff, #0080ff);
              transition: width 0.3s ease;
            }
          }
        }
      }
    }

    .actions-card {
      grid-column: 1 / -1;
      
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      
      &.connected {
        color: #52c41a;
      }
      
      &.disconnected {
        color: #ff4d4f;
      }
      
      &.connecting {
        color: #1890ff;
      }
    }

    .form-text {
      margin-left: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
    }
  }
}
</style>
