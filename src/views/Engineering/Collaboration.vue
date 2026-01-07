<template>
  <div class="engineering-collaboration">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">协同设计</h1>
      <p class="page-subtitle">多团队协作设计平台，实时同步设计进度和文档</p>
    </div>

    <!-- 协同概览 -->
    <div class="collaboration-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ collaborationStats.activeUsers }}</h3>
              <p>在线用户</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ collaborationStats.activeProjects }}</h3>
              <p>活跃项目</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ collaborationStats.sharedDocuments }}</h3>
              <p>共享文档</p>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="card-content">
              <h3>{{ collaborationStats.messages }}</h3>
              <p>今日消息</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 协同工具栏 -->
    <div class="collaboration-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="createProject">
          <el-icon><Plus /></el-icon>
          创建项目
        </el-button>
        <el-button @click="joinProject">
          <el-icon><Connection /></el-icon>
          加入项目
        </el-button>
        <el-button @click="showInviteDialog = true">
          <el-icon><Share /></el-icon>
          邀请成员
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-select v-model="filterStatus" placeholder="项目状态" style="width: 120px">
          <el-option label="全部" value=""></el-option>
          <el-option label="进行中" value="active"></el-option>
          <el-option label="已完成" value="completed"></el-option>
          <el-option label="暂停" value="paused"></el-option>
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索项目..."
          style="width: 200px; margin-left: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 协同项目列表 -->
    <div class="collaboration-projects">
      <el-row :gutter="20">
        <el-col :span="8" v-for="project in filteredProjects" :key="project.id">
          <div class="project-card" @click="openProject(project)">
            <div class="project-header">
              <h3>{{ project.name }}</h3>
              <el-tag :type="getStatusTagType(project.status)">
                {{ getStatusText(project.status) }}
              </el-tag>
            </div>
            <div class="project-content">
              <p>{{ project.description }}</p>
              <div class="project-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ project.createdAt }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ project.members.length }} 成员</span>
                </div>
              </div>
            </div>
            <div class="project-members">
              <el-avatar-group :max="4">
                <el-avatar
                  v-for="member in project.members"
                  :key="member.id"
                  :src="member.avatar"
                  :title="member.name"
                  size="small"
                >
                  {{ member.name.charAt(0) }}
                </el-avatar>
              </el-avatar-group>
            </div>
            <div class="project-progress">
              <el-progress :percentage="project.progress" :stroke-width="6" :show-text="false"></el-progress>
              <span class="progress-text">{{ project.progress }}%</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 实时协作区域 -->
    <div class="realtime-collaboration">
      <el-row :gutter="20">
        <el-col :span="16">
          <div class="collaboration-workspace">
            <div class="workspace-header">
              <h3>协作工作区</h3>
              <div class="workspace-tools">
                <el-button size="small" @click="shareScreen">
                  <el-icon><Monitor /></el-icon>
                  屏幕共享
                </el-button>
                <el-button size="small" @click="startVideoCall">
                  <el-icon><VideoCamera /></el-icon>
                  视频通话
                </el-button>
                <el-button size="small" @click="openWhiteboard">
                  <el-icon><Edit /></el-icon>
                  白板
                </el-button>
              </div>
            </div>
            <div class="workspace-content">
              <div class="canvas-area">
                <div class="canvas-placeholder">
                  <el-icon><Picture /></el-icon>
                  <p>选择项目开始协作设计</p>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="collaboration-sidebar">
            <!-- 在线成员 -->
            <div class="sidebar-section">
              <h4>在线成员 ({{ onlineMembers.length }})</h4>
              <div class="member-list">
                <div
                  v-for="member in onlineMembers"
                  :key="member.id"
                  class="member-item"
                >
                  <el-avatar :src="member.avatar" size="small">
                    {{ member.name.charAt(0) }}
                  </el-avatar>
                  <span class="member-name">{{ member.name }}</span>
                  <el-tag size="small" :type="member.role === 'owner' ? 'danger' : 'primary'">
                    {{ member.role === 'owner' ? '负责人' : '成员' }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 实时聊天 -->
            <div class="sidebar-section">
              <h4>团队聊天</h4>
              <div class="chat-container">
                <div class="chat-messages" ref="chatMessages">
                  <div
                    v-for="message in chatMessages"
                    :key="message.id"
                    class="chat-message"
                    :class="{ 'own-message': message.userId === currentUserId }"
                  >
                    <div class="message-header">
                      <span class="message-author">{{ message.author }}</span>
                      <span class="message-time">{{ message.time }}</span>
                    </div>
                    <div class="message-content">{{ message.content }}</div>
                  </div>
                </div>
                <div class="chat-input">
                  <el-input
                    v-model="newMessage"
                    placeholder="输入消息..."
                    @keyup.enter="sendMessage"
                  >
                    <template #append>
                      <el-button @click="sendMessage">
                        <el-icon><Promotion /></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </div>
            </div>

            <!-- 最近活动 -->
            <div class="sidebar-section">
              <h4>最近活动</h4>
              <div class="activity-list">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <el-icon><Bell /></el-icon>
                  </div>
                  <div class="activity-content">
                    <p>{{ activity.description }}</p>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 邀请成员对话框 -->
    <el-dialog
      v-model="showInviteDialog"
      title="邀请团队成员"
      width="600px"
    >
      <el-form :model="inviteForm" label-width="100px">
        <el-form-item label="邀请方式">
          <el-radio-group v-model="inviteForm.method">
            <el-radio label="email">邮箱邀请</el-radio>
            <el-radio label="link">分享链接</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="邮箱地址" v-if="inviteForm.method === 'email'">
          <el-input
            v-model="inviteForm.emails"
            type="textarea"
            :rows="3"
            placeholder="请输入邮箱地址，多个邮箱用逗号分隔"
          ></el-input>
        </el-form-item>
        <el-form-item label="邀请链接" v-if="inviteForm.method === 'link'">
          <el-input
            v-model="inviteLink"
            readonly
          >
            <template #append>
              <el-button @click="copyInviteLink">复制</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="权限设置">
          <el-select v-model="inviteForm.role" placeholder="选择权限">
            <el-option label="查看者" value="viewer"></el-option>
            <el-option label="编辑者" value="editor"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邀请消息">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            :rows="3"
            placeholder="可选：添加邀请消息"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showInviteDialog = false">取消</el-button>
          <el-button type="primary" @click="sendInvite">发送邀请</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  FolderOpened,
  Document,
  ChatDotRound,
  Plus,
  Connection,
  Share,
  Search,
  Calendar,
  User,
  Monitor,
  VideoCamera,
  Edit,
  Picture,
  Bell,
  Promotion
} from '@element-plus/icons-vue'

// 响应式数据
const searchKeyword = ref('')
const filterStatus = ref('')
const showInviteDialog = ref(false)
const newMessage = ref('')
const currentUserId = ref(1)
const chatMessages = ref(null)

// 协同统计数据
const collaborationStats = reactive({
  activeUsers: 24,
  activeProjects: 8,
  sharedDocuments: 156,
  messages: 89
})

// 邀请表单
const inviteForm = reactive({
  method: 'email',
  emails: '',
  role: 'editor',
  message: ''
})

const inviteLink = ref('https://plm.company.com/invite/abc123def456')

// 协同项目数据
const projects = ref([
  {
    id: 1,
    name: '智能家居控制器设计',
    description: '新一代智能家居控制器的协同设计项目，包含硬件设计、软件开发和用户界面设计。',
    status: 'active',
    progress: 75,
    createdAt: '2024-01-15',
    members: [
      { id: 1, name: '张设计师', avatar: '', role: 'owner' },
      { id: 2, name: '李工程师', avatar: '', role: 'member' },
      { id: 3, name: '王产品经理', avatar: '', role: 'member' },
      { id: 4, name: '陈测试员', avatar: '', role: 'member' }
    ]
  },
  {
    id: 2,
    name: '电动汽车充电桩',
    description: '电动汽车充电桩的结构设计和电路设计协同项目。',
    status: 'active',
    progress: 45,
    createdAt: '2024-01-20',
    members: [
      { id: 5, name: '刘工程师', avatar: '', role: 'owner' },
      { id: 6, name: '赵设计师', avatar: '', role: 'member' },
      { id: 7, name: '孙技术员', avatar: '', role: 'member' }
    ]
  },
  {
    id: 3,
    name: '工业机器人手臂',
    description: '六轴工业机器人手臂的机械设计和控制系统开发。',
    status: 'completed',
    progress: 100,
    createdAt: '2024-01-05',
    members: [
      { id: 8, name: '周工程师', avatar: '', role: 'owner' },
      { id: 9, name: '吴设计师', avatar: '', role: 'member' },
      { id: 10, name: '郑程序员', avatar: '', role: 'member' },
      { id: 11, name: '王测试员', avatar: '', role: 'member' }
    ]
  }
])

// 在线成员
const onlineMembers = ref([
  { id: 1, name: '张设计师', avatar: '', role: 'owner', status: 'online' },
  { id: 2, name: '李工程师', avatar: '', role: 'member', status: 'online' },
  { id: 3, name: '王产品经理', avatar: '', role: 'member', status: 'online' },
  { id: 5, name: '刘工程师', avatar: '', role: 'member', status: 'online' }
])

// 聊天消息
const chatMessages_data = ref([
  {
    id: 1,
    userId: 2,
    author: '李工程师',
    content: '大家好，我刚刚上传了最新的电路设计图，请大家查看。',
    time: '09:15'
  },
  {
    id: 2,
    userId: 1,
    author: '张设计师',
    content: '收到，我现在就去查看，稍后给出反馈。',
    time: '09:16'
  },
  {
    id: 3,
    userId: 3,
    author: '王产品经理',
    content: '设计图看起来不错，但是需要考虑成本控制的问题。',
    time: '09:20'
  },
  {
    id: 4,
    userId: 1,
    author: '我',
    content: '好的，我会在下午的会议中讨论这个问题。',
    time: '09:22'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    description: '李工程师上传了新的设计文档',
    time: '5分钟前'
  },
  {
    id: 2,
    description: '张设计师修改了项目进度',
    time: '15分钟前'
  },
  {
    id: 3,
    description: '王产品经理添加了新的评论',
    time: '30分钟前'
  },
  {
    id: 4,
    description: '陈测试员完成了功能测试',
    time: '1小时前'
  }
])

// 计算属性
const filteredProjects = computed(() => {
  let result = projects.value
  
  if (filterStatus.value) {
    result = result.filter(project => project.status === filterStatus.value)
  }
  
  if (searchKeyword.value) {
    result = result.filter(project => 
      project.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  return result
})

// 方法
const getStatusTagType = (status) => {
  const typeMap = {
    'active': 'primary',
    'completed': 'success',
    'paused': 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'active': '进行中',
    'completed': '已完成',
    'paused': '暂停'
  }
  return textMap[status] || '未知'
}

const createProject = () => {
  ElMessage.info('创建项目功能开发中...')
}

const joinProject = () => {
  ElMessage.info('加入项目功能开发中...')
}

const openProject = (project) => {
  ElMessage.success(`打开项目：${project.name}`)
}

const shareScreen = () => {
  ElMessage.info('屏幕共享功能开发中...')
}

const startVideoCall = () => {
  ElMessage.info('视频通话功能开发中...')
}

const openWhiteboard = () => {
  ElMessage.info('白板功能开发中...')
}

const sendMessage = () => {
  if (newMessage.value.trim()) {
    const message = {
      id: Date.now(),
      userId: currentUserId.value,
      author: '我',
      content: newMessage.value,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    chatMessages_data.value.push(message)
    newMessage.value = ''
    
    // 滚动到底部
    nextTick(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    })
  }
}

const copyInviteLink = () => {
  navigator.clipboard.writeText(inviteLink.value).then(() => {
    ElMessage.success('邀请链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const sendInvite = () => {
  if (inviteForm.method === 'email' && !inviteForm.emails.trim()) {
    ElMessage.warning('请输入邀请邮箱')
    return
  }
  
  ElMessage.success('邀请已发送')
  showInviteDialog.value = false
  
  // 重置表单
  Object.assign(inviteForm, {
    method: 'email',
    emails: '',
    role: 'editor',
    message: ''
  })
}

// 生命周期钩子
onMounted(() => {
  // 模拟实时数据更新
  setInterval(() => {
    // 随机更新在线用户数
    collaborationStats.activeUsers = Math.floor(Math.random() * 10) + 20
  }, 30000)
})
</script>

<style lang="scss" scoped>
.engineering-collaboration {
  padding: 20px;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
  min-height: 100vh;
  color: #ffffff;

  .page-header {
    margin-bottom: 30px;
    text-align: center;
    
    .page-title {
      font-size: 32px;
      font-weight: 600;
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

  .collaboration-overview {
    margin-bottom: 30px;
    
    .overview-card {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 229, 255, 0.3);
        border-color: #00e5ff;
      }
      
      .card-icon {
        font-size: 32px;
        color: #00e5ff;
        margin-bottom: 15px;
      }
      
      .card-content {
        h3 {
          font-size: 28px;
          font-weight: 600;
          color: #00e5ff;
          margin: 0 0 5px 0;
        }
        
        p {
          font-size: 14px;
          color: #b0bec5;
          margin: 0;
        }
      }
    }
  }

  .collaboration-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(0, 229, 255, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    
    .toolbar-left {
      display: flex;
      gap: 10px;
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
    }
  }

  .collaboration-projects {
    margin-bottom: 30px;
    
    .project-card {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 229, 255, 0.3);
        border-color: #00e5ff;
      }
      
      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        h3 {
          color: #00e5ff;
          margin: 0;
          font-size: 18px;
        }
      }
      
      .project-content {
        margin-bottom: 15px;
        
        p {
          color: #b0bec5;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        
        .project-meta {
          display: flex;
          gap: 20px;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #78909c;
            font-size: 12px;
          }
        }
      }
      
      .project-members {
        margin-bottom: 15px;
      }
      
      .project-progress {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .progress-text {
          color: #00e5ff;
          font-weight: 600;
          min-width: 40px;
        }
      }
    }
  }

  .realtime-collaboration {
    .collaboration-workspace {
      background: rgba(0, 229, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 12px;
      padding: 20px;
      backdrop-filter: blur(10px);
      
      .workspace-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        h3 {
          color: #00e5ff;
          margin: 0;
        }
        
        .workspace-tools {
          display: flex;
          gap: 10px;
        }
      }
      
      .workspace-content {
        .canvas-area {
          height: 400px;
          background: rgba(0, 0, 0, 0.2);
          border: 2px dashed rgba(0, 229, 255, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .canvas-placeholder {
            text-align: center;
            color: #78909c;
            
            .el-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
          }
        }
      }
    }
    
    .collaboration-sidebar {
      .sidebar-section {
        background: rgba(0, 229, 255, 0.05);
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        backdrop-filter: blur(10px);
        
        h4 {
          color: #00e5ff;
          margin: 0 0 15px 0;
          font-size: 16px;
        }
        
        .member-list {
          .member-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(0, 229, 255, 0.1);
            
            &:last-child {
              border-bottom: none;
            }
            
            .member-name {
              flex: 1;
              color: #ffffff;
            }
          }
        }
        
        .chat-container {
          .chat-messages {
            height: 200px;
            overflow-y: auto;
            margin-bottom: 10px;
            padding-right: 5px;
            
            &::-webkit-scrollbar {
              width: 4px;
            }
            
            &::-webkit-scrollbar-track {
              background: rgba(0, 229, 255, 0.1);
              border-radius: 2px;
            }
            
            &::-webkit-scrollbar-thumb {
              background: rgba(0, 229, 255, 0.5);
              border-radius: 2px;
            }
            
            .chat-message {
              margin-bottom: 15px;
              
              &.own-message {
                .message-content {
                  background: rgba(0, 229, 255, 0.2);
                  margin-left: 20px;
                }
              }
              
              .message-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                
                .message-author {
                  color: #00e5ff;
                  font-size: 12px;
                  font-weight: 600;
                }
                
                .message-time {
                  color: #78909c;
                  font-size: 12px;
                }
              }
              
              .message-content {
                background: rgba(255, 255, 255, 0.1);
                padding: 8px 12px;
                border-radius: 8px;
                color: #ffffff;
                font-size: 14px;
                line-height: 1.4;
              }
            }
          }
        }
        
        .activity-list {
          .activity-item {
            display: flex;
            gap: 10px;
            padding: 10px 0;
            border-bottom: 1px solid rgba(0, 229, 255, 0.1);
            
            &:last-child {
              border-bottom: none;
            }
            
            .activity-icon {
              color: #00e5ff;
              font-size: 16px;
              margin-top: 2px;
            }
            
            .activity-content {
              flex: 1;
              
              p {
                color: #ffffff;
                font-size: 14px;
                margin: 0 0 5px 0;
                line-height: 1.4;
              }
              
              .activity-time {
                color: #78909c;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }

  // Element Plus 组件样式覆盖
  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #00e5ff, #0080ff);
    border-color: #00e5ff;
    
    &:hover {
      background: linear-gradient(135deg, #00b8cc, #0066cc);
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
    }
  }

  :deep(.el-input__wrapper) {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    
    &:hover {
      border-color: #00e5ff;
    }
    
    &.is-focus {
      border-color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }
    
    .el-input__inner {
      color: #ffffff;
      
      &::placeholder {
        color: #78909c;
      }
    }
  }

  :deep(.el-select) {
    .el-input__wrapper {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
    }
  }

  :deep(.el-textarea__inner) {
    background: rgba(0, 229, 255, 0.1);
    border: 1px solid rgba(0, 229, 255, 0.3);
    color: #ffffff;
    
    &::placeholder {
      color: #78909c;
    }
    
    &:hover {
      border-color: #00e5ff;
    }
    
    &:focus {
      border-color: #00e5ff;
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
    }
  }

  :deep(.el-dialog) {
    background: linear-gradient(135deg, #0a1929 0%, #1a2332 100%);
    border: 1px solid rgba(0, 229, 255, 0.3);
    
    .el-dialog__header {
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      
      .el-dialog__title {
        color: #00e5ff;
      }
    }
    
    .el-dialog__body {
      color: #ffffff;
    }
  }

  :deep(.el-progress-bar__outer) {
    background: rgba(0, 229, 255, 0.2);
    
    .el-progress-bar__inner {
      background: linear-gradient(90deg, #00e5ff, #0080ff);
    }
  }

  :deep(.el-tag) {
    background: rgba(0, 229, 255, 0.2);
    border-color: rgba(0, 229, 255, 0.5);
    color: #00e5ff;
  }

  :deep(.el-avatar) {
    background: rgba(0, 229, 255, 0.3);
    color: #00e5ff;
    border: 1px solid rgba(0, 229, 255, 0.5);
  }

  :deep(.el-radio) {
    .el-radio__input {
      .el-radio__inner {
        border-color: rgba(0, 229, 255, 0.5);
        
        &:hover {
          border-color: #00e5ff;
        }
      }
      
      &.is-checked {
        .el-radio__inner {
          background: #00e5ff;
          border-color: #00e5ff;
        }
      }
    }
    
    .el-radio__label {
      color: #ffffff;
    }
  }
}
</style>
