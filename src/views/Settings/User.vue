<template>
  <div class="user-settings">
    <div class="page-header">
      <h1 class="page-title">用户设置</h1>
      <p class="page-description">个人账户设置与偏好配置</p>
    </div>

    <div class="settings-grid">
      <!-- 个人信息 -->
      <div class="holographic-card profile-card">
        <div class="card-header">
          <h3>个人信息</h3>
        </div>
        <div class="profile-content">
          <div class="avatar-section">
            <div class="avatar-container">
              <img :src="userProfile.avatar" alt="头像" class="avatar" />
              <div class="avatar-overlay">
                <i class="el-icon-camera"></i>
              </div>
            </div>
            <el-button type="text" @click="changeAvatar">更换头像</el-button>
          </div>
          <el-form :model="userProfile" label-width="100px" class="holographic-form">
            <el-form-item label="用户名">
              <el-input v-model="userProfile.username" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="userProfile.fullName" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userProfile.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userProfile.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="部门">
              <el-select v-model="userProfile.department" placeholder="请选择部门">
                <el-option label="研发部" value="development" />
                <el-option label="设计部" value="design" />
                <el-option label="生产部" value="production" />
                <el-option label="质量部" value="quality" />
                <el-option label="销售部" value="sales" />
              </el-select>
            </el-form-item>
            <el-form-item label="职位">
              <el-input v-model="userProfile.position" placeholder="请输入职位" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="holographic-card security-card">
        <div class="card-header">
          <h3>安全设置</h3>
        </div>
        <div class="security-content">
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">登录密码</div>
              <div class="security-desc">定期更换密码可以提高账户安全性</div>
            </div>
            <el-button type="primary" @click="changePassword">修改密码</el-button>
          </div>
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">两步验证</div>
              <div class="security-desc">启用两步验证可以更好地保护您的账户</div>
            </div>
            <el-switch v-model="securitySettings.twoFactorEnabled" @change="toggleTwoFactor" />
          </div>
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">登录通知</div>
              <div class="security-desc">新设备登录时发送邮件通知</div>
            </div>
            <el-switch v-model="securitySettings.loginNotification" />
          </div>
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">会话管理</div>
              <div class="security-desc">查看和管理您的活跃会话</div>
            </div>
            <el-button @click="viewSessions">查看会话</el-button>
          </div>
        </div>
      </div>

      <!-- 偏好设置 -->
      <div class="holographic-card preferences-card">
        <div class="card-header">
          <h3>偏好设置</h3>
        </div>
        <el-form :model="preferences" label-width="120px" class="holographic-form">
          <el-form-item label="界面主题">
            <el-select v-model="preferences.theme" placeholder="请选择主题">
              <el-option label="全息蓝" value="holographic-blue" />
              <el-option label="深空黑" value="dark" />
              <el-option label="科技银" value="tech-silver" />
            </el-select>
          </el-form-item>
          <el-form-item label="语言">
            <el-select v-model="preferences.language" placeholder="请选择语言">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
              <el-option label="日本語" value="ja-JP" />
            </el-select>
          </el-form-item>
          <el-form-item label="时区">
            <el-select v-model="preferences.timezone" placeholder="请选择时区">
              <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
              <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
              <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期格式">
            <el-select v-model="preferences.dateFormat" placeholder="请选择日期格式">
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
              <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
              <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
            </el-select>
          </el-form-item>
          <el-form-item label="每页显示">
            <el-select v-model="preferences.pageSize" placeholder="请选择每页显示数量">
              <el-option label="10条" :value="10" />
              <el-option label="20条" :value="20" />
              <el-option label="50条" :value="50" />
              <el-option label="100条" :value="100" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 通知设置 -->
      <div class="holographic-card notification-card">
        <div class="card-header">
          <h3>通知设置</h3>
        </div>
        <div class="notification-content">
          <div class="notification-section">
            <h4>邮件通知</h4>
            <div class="notification-items">
              <div class="notification-item" v-for="item in emailNotifications" :key="item.key">
                <div class="notification-info">
                  <div class="notification-title">{{ item.title }}</div>
                  <div class="notification-desc">{{ item.description }}</div>
                </div>
                <el-switch v-model="item.enabled" />
              </div>
            </div>
          </div>
          <div class="notification-section">
            <h4>系统通知</h4>
            <div class="notification-items">
              <div class="notification-item" v-for="item in systemNotifications" :key="item.key">
                <div class="notification-info">
                  <div class="notification-title">{{ item.title }}</div>
                  <div class="notification-desc">{{ item.description }}</div>
                </div>
                <el-switch v-model="item.enabled" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作记录 -->
      <div class="holographic-card activity-card">
        <div class="card-header">
          <h3>最近活动</h3>
          <el-button type="text" @click="refreshActivity">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
        </div>
        <div class="activity-list">
          <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
            <div class="activity-icon">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-desc">{{ activity.description }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="holographic-card actions-card">
        <div class="card-header">
          <h3>账户操作</h3>
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
          <el-button type="warning" @click="exportData">
            <i class="el-icon-download"></i>
            导出数据
          </el-button>
          <el-button type="danger" @click="deleteAccount">
            <i class="el-icon-delete"></i>
            注销账户
          </el-button>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="当前密码">
          <el-input v-model="passwordForm.currentPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPasswordChange" :loading="changingPassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const saving = ref(false)
const changingPassword = ref(false)
const passwordDialogVisible = ref(false)

const userProfile = ref({
  username: 'admin',
  fullName: '系统管理员',
  email: 'admin@company.com',
  phone: '13800138000',
  department: 'development',
  position: '高级工程师',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

const securitySettings = ref({
  twoFactorEnabled: false,
  loginNotification: true
})

const preferences = ref({
  theme: 'holographic-blue',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  pageSize: 20
})

const emailNotifications = ref([
  {
    key: 'taskAssigned',
    title: '任务分配',
    description: '当有新任务分配给您时发送邮件',
    enabled: true
  },
  {
    key: 'projectUpdate',
    title: '项目更新',
    description: '项目状态发生变化时发送邮件',
    enabled: true
  },
  {
    key: 'systemMaintenance',
    title: '系统维护',
    description: '系统维护通知',
    enabled: false
  }
])

const systemNotifications = ref([
  {
    key: 'browserNotification',
    title: '浏览器通知',
    description: '在浏览器中显示通知',
    enabled: true
  },
  {
    key: 'soundAlert',
    title: '声音提醒',
    description: '播放提示音',
    enabled: false
  }
])

const recentActivities = ref([
  {
    id: 1,
    type: 'login',
    title: '登录系统',
    description: '从 192.168.1.100 登录',
    time: '2024-01-15 09:30:00'
  },
  {
    id: 2,
    type: 'update',
    title: '更新产品信息',
    description: '修改了产品 "智能控制器 V2.0" 的规格',
    time: '2024-01-15 08:45:00'
  },
  {
    id: 3,
    type: 'create',
    title: '创建新项目',
    description: '创建了项目 "新一代传感器开发"',
    time: '2024-01-14 16:20:00'
  }
])

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 方法
const getActivityIcon = (type) => {
  const iconMap = {
    login: 'el-icon-user',
    update: 'el-icon-edit',
    create: 'el-icon-plus',
    delete: 'el-icon-delete'
  }
  return iconMap[type] || 'el-icon-info'
}

const changeAvatar = () => {
  ElMessage.info('头像更换功能开发中...')
}

const changePassword = () => {
  passwordDialogVisible.value = true
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const confirmPasswordChange = async () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    ElMessage.error('请填写完整的密码信息')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  
  changingPassword.value = true
  
  try {
    // 模拟修改密码
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
  } catch (error) {
    ElMessage.error('密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

const toggleTwoFactor = (enabled) => {
  if (enabled) {
    ElMessage.success('两步验证已启用')
  } else {
    ElMessage.info('两步验证已关闭')
  }
}

const viewSessions = () => {
  ElMessage.info('会话管理功能开发中...')
}

const refreshActivity = () => {
  ElMessage.success('活动记录已刷新')
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
    ElMessage.success('设置已重置')
  }).catch(() => {
    // 取消重置
  })
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const deleteAccount = () => {
  ElMessageBox.confirm('确定要注销账户吗？此操作不可恢复！', '确认注销', {
    type: 'error'
  }).then(() => {
    ElMessage.success('账户注销申请已提交')
  }).catch(() => {
    // 取消注销
  })
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.user-settings {
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

    .profile-card {
      .profile-content {
        display: flex;
        gap: 24px;
        
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          
          .avatar-container {
            position: relative;
            cursor: pointer;
            
            .avatar {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              border: 2px solid #00e5ff;
              box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
            }
            
            .avatar-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s ease;
              
              &:hover {
                opacity: 1;
              }
              
              i {
                color: #ffffff;
                font-size: 20px;
              }
            }
          }
        }
        
        .holographic-form {
          flex: 1;
        }
      }
    }

    .security-card {
      .security-content {
        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(0, 229, 255, 0.1);
          
          &:last-child {
            border-bottom: none;
          }
          
          .security-info {
            .security-title {
              color: #ffffff;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .security-desc {
              color: rgba(255, 255, 255, 0.7);
              font-size: 14px;
            }
          }
        }
      }
    }

    .notification-card {
      .notification-content {
        .notification-section {
          margin-bottom: 24px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          h4 {
            color: #00e5ff;
            margin: 0 0 16px 0;
            font-size: 16px;
          }
          
          .notification-items {
            .notification-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid rgba(0, 229, 255, 0.1);
              
              &:last-child {
                border-bottom: none;
              }
              
              .notification-info {
                .notification-title {
                  color: #ffffff;
                  font-weight: 500;
                  margin-bottom: 4px;
                }
                
                .notification-desc {
                  color: rgba(255, 255, 255, 0.7);
                  font-size: 14px;
                }
              }
            }
          }
        }
      }
    }

    .activity-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .activity-list {
        .activity-item {
          display: flex;
          align-items: flex-start;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 229, 255, 0.1);
          
          &:last-child {
            border-bottom: none;
          }
          
          .activity-icon {
            width: 32px;
            height: 32px;
            background: rgba(0, 229, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            
            i {
              color: #00e5ff;
              font-size: 16px;
            }
          }
          
          .activity-content {
            flex: 1;
            
            .activity-title {
              color: #ffffff;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .activity-desc {
              color: rgba(255, 255, 255, 0.7);
              font-size: 14px;
              margin-bottom: 4px;
            }
            
            .activity-time {
              color: rgba(255, 255, 255, 0.5);
              font-size: 12px;
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
  }
}
</style>
