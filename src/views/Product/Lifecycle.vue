<template>
  <div class="lifecycle-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">产品生命周期管理</h1>
      <p class="page-subtitle">全面管控产品从概念到退市的完整生命周期</p>
    </div>

    <!-- 生命周期概览 -->
    <div class="lifecycle-overview">
      <div class="overview-cards">
        <div class="overview-card" v-for="stage in lifecycleStages" :key="stage.id">
          <div class="card-icon" :class="stage.status">
            <i :class="stage.icon"></i>
          </div>
          <div class="card-content">
            <h3>{{ stage.name }}</h3>
            <p class="stage-count">{{ stage.count }} 个产品</p>
            <p class="stage-progress">{{ stage.progress }}% 完成</p>
          </div>
          <div class="card-status" :class="stage.status">
            {{ stage.statusText }}
          </div>
        </div>
      </div>
    </div>

    <!-- 生命周期流程图 -->
    <div class="lifecycle-flow">
      <div class="section-header">
        <h2>生命周期流程</h2>
        <div class="header-actions">
          <el-button type="primary" @click="showFlowDetail = !showFlowDetail">
            {{ showFlowDetail ? '隐藏详情' : '显示详情' }}
          </el-button>
        </div>
      </div>
      <div class="flow-chart" ref="flowChart"></div>
    </div>

    <!-- 产品阶段管理 -->
    <div class="stage-management">
      <div class="section-header">
        <h2>阶段管理</h2>
        <div class="header-actions">
          <el-button type="primary" @click="showStageDialog = true">
            <i class="el-icon-plus"></i>
            新建阶段
          </el-button>
        </div>
      </div>
      
      <div class="stage-timeline">
        <div class="timeline-item" v-for="(stage, index) in detailedStages" :key="stage.id">
          <div class="timeline-dot" :class="stage.status"></div>
          <div class="timeline-content">
            <div class="stage-card">
              <div class="stage-header">
                <h3>{{ stage.name }}</h3>
                <div class="stage-actions">
                  <el-button size="small" @click="editStage(stage)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteStage(stage.id)">删除</el-button>
                </div>
              </div>
              <div class="stage-info">
                <div class="info-item">
                  <span class="label">开始时间:</span>
                  <span class="value">{{ stage.startDate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">预计结束:</span>
                  <span class="value">{{ stage.endDate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">负责人:</span>
                  <span class="value">{{ stage.owner }}</span>
                </div>
                <div class="info-item">
                  <span class="label">状态:</span>
                  <span class="value" :class="stage.status">{{ stage.statusText }}</span>
                </div>
              </div>
              <div class="stage-progress">
                <el-progress :percentage="stage.progress" :status="getProgressStatus(stage.status)"></el-progress>
              </div>
              <div class="stage-tasks" v-if="showFlowDetail">
                <h4>关键任务</h4>
                <div class="task-list">
                  <div class="task-item" v-for="task in stage.tasks" :key="task.id">
                    <i class="task-icon" :class="task.completed ? 'el-icon-check' : 'el-icon-time'"></i>
                    <span class="task-name" :class="{ completed: task.completed }">{{ task.name }}</span>
                    <span class="task-assignee">{{ task.assignee }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生命周期分析 -->
    <div class="lifecycle-analytics">
      <div class="section-header">
        <h2>生命周期分析</h2>
      </div>
      <div class="analytics-grid">
        <div class="analytics-card">
          <h3>阶段耗时分析</h3>
          <div class="chart-container" ref="durationChart"></div>
        </div>
        <div class="analytics-card">
          <h3>成本分布</h3>
          <div class="chart-container" ref="costChart"></div>
        </div>
        <div class="analytics-card">
          <h3>风险评估</h3>
          <div class="risk-matrix">
            <div class="risk-item" v-for="risk in riskAssessment" :key="risk.id">
              <div class="risk-level" :class="risk.level">{{ risk.level }}</div>
              <div class="risk-content">
                <h4>{{ risk.title }}</h4>
                <p>{{ risk.description }}</p>
                <span class="risk-impact">影响度: {{ risk.impact }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 阶段编辑对话框 -->
    <el-dialog
      v-model="showStageDialog"
      :title="editingStage ? '编辑阶段' : '新建阶段'"
      width="600px"
    >
      <el-form :model="stageForm" :rules="stageRules" ref="stageFormRef" label-width="100px">
        <el-form-item label="阶段名称" prop="name">
          <el-input v-model="stageForm.name" placeholder="请输入阶段名称"></el-input>
        </el-form-item>
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="stageForm.startDate"
            type="date"
            placeholder="选择开始时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker
            v-model="stageForm.endDate"
            type="date"
            placeholder="选择结束时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-select v-model="stageForm.owner" placeholder="选择负责人" style="width: 100%">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="stageForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入阶段描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showStageDialog = false">取消</el-button>
          <el-button type="primary" @click="saveStage">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 响应式数据
const showFlowDetail = ref(false)
const showStageDialog = ref(false)
const editingStage = ref(null)
const flowChart = ref(null)
const durationChart = ref(null)
const costChart = ref(null)
const stageFormRef = ref(null)

// 生命周期阶段数据
const lifecycleStages = ref([
  {
    id: 1,
    name: '概念设计',
    count: 12,
    progress: 85,
    status: 'active',
    statusText: '进行中',
    icon: 'el-icon-edit-outline'
  },
  {
    id: 2,
    name: '详细设计',
    count: 8,
    progress: 60,
    status: 'active',
    statusText: '进行中',
    icon: 'el-icon-document'
  },
  {
    id: 3,
    name: '原型制作',
    count: 5,
    progress: 30,
    status: 'pending',
    statusText: '待开始',
    icon: 'el-icon-cpu'
  },
  {
    id: 4,
    name: '测试验证',
    count: 3,
    progress: 0,
    status: 'pending',
    statusText: '待开始',
    icon: 'el-icon-data-analysis'
  },
  {
    id: 5,
    name: '批量生产',
    count: 15,
    progress: 95,
    status: 'completed',
    statusText: '已完成',
    icon: 'el-icon-goods'
  },
  {
    id: 6,
    name: '市场投放',
    count: 10,
    progress: 75,
    status: 'active',
    statusText: '进行中',
    icon: 'el-icon-sell'
  }
])

// 详细阶段数据
const detailedStages = ref([
  {
    id: 1,
    name: '需求分析',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    owner: '张三',
    status: 'completed',
    statusText: '已完成',
    progress: 100,
    tasks: [
      { id: 1, name: '市场调研', assignee: '李四', completed: true },
      { id: 2, name: '需求收集', assignee: '王五', completed: true },
      { id: 3, name: '需求分析', assignee: '张三', completed: true }
    ]
  },
  {
    id: 2,
    name: '概念设计',
    startDate: '2024-02-16',
    endDate: '2024-03-30',
    owner: '李四',
    status: 'active',
    statusText: '进行中',
    progress: 75,
    tasks: [
      { id: 4, name: '概念方案', assignee: '李四', completed: true },
      { id: 5, name: '可行性分析', assignee: '王五', completed: true },
      { id: 6, name: '方案评审', assignee: '张三', completed: false }
    ]
  },
  {
    id: 3,
    name: '详细设计',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    owner: '王五',
    status: 'pending',
    statusText: '待开始',
    progress: 0,
    tasks: [
      { id: 7, name: '结构设计', assignee: '王五', completed: false },
      { id: 8, name: '电路设计', assignee: '赵六', completed: false },
      { id: 9, name: '软件设计', assignee: '孙七', completed: false }
    ]
  }
])

// 风险评估数据
const riskAssessment = ref([
  {
    id: 1,
    title: '技术风险',
    description: '新技术应用可能存在不确定性',
    level: 'high',
    impact: '高'
  },
  {
    id: 2,
    title: '成本风险',
    description: '原材料价格波动影响成本控制',
    level: 'medium',
    impact: '中'
  },
  {
    id: 3,
    title: '时间风险',
    description: '项目进度可能受外部因素影响',
    level: 'low',
    impact: '低'
  }
])

// 用户列表
const users = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' },
  { id: 5, name: '孙七' }
])

// 表单数据
const stageForm = reactive({
  name: '',
  startDate: '',
  endDate: '',
  owner: '',
  description: ''
})

// 表单验证规则
const stageRules = {
  name: [
    { required: true, message: '请输入阶段名称', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  owner: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ]
}

// 方法
const getProgressStatus = (status) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'active':
      return ''
    case 'pending':
      return 'warning'
    default:
      return ''
  }
}

const editStage = (stage) => {
  editingStage.value = stage
  Object.assign(stageForm, {
    name: stage.name,
    startDate: stage.startDate,
    endDate: stage.endDate,
    owner: stage.owner,
    description: stage.description || ''
  })
  showStageDialog.value = true
}

const deleteStage = async (stageId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个阶段吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = detailedStages.value.findIndex(stage => stage.id === stageId)
    if (index > -1) {
      detailedStages.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const saveStage = async () => {
  if (!stageFormRef.value) return
  
  try {
    await stageFormRef.value.validate()
    
    if (editingStage.value) {
      // 编辑现有阶段
      Object.assign(editingStage.value, stageForm)
      ElMessage.success('阶段更新成功')
    } else {
      // 新建阶段
      const newStage = {
        id: Date.now(),
        ...stageForm,
        status: 'pending',
        statusText: '待开始',
        progress: 0,
        tasks: []
      }
      detailedStages.value.push(newStage)
      ElMessage.success('阶段创建成功')
    }
    
    showStageDialog.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const resetForm = () => {
  editingStage.value = null
  Object.assign(stageForm, {
    name: '',
    startDate: '',
    endDate: '',
    owner: '',
    description: ''
  })
  if (stageFormRef.value) {
    stageFormRef.value.resetFields()
  }
}

// 初始化流程图
const initFlowChart = () => {
  if (!flowChart.value) return
  
  const chart = echarts.init(flowChart.value)
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
      type: 'graph',
      layout: 'force',
      symbolSize: 60,
      roam: true,
      label: {
        show: true,
        color: '#00e5ff',
        fontSize: 12
      },
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [4, 10],
      data: [
        { name: '需求分析', x: 100, y: 100, itemStyle: { color: '#00e5ff' } },
        { name: '概念设计', x: 300, y: 100, itemStyle: { color: '#0080ff' } },
        { name: '详细设计', x: 500, y: 100, itemStyle: { color: '#0060df' } },
        { name: '原型制作', x: 700, y: 100, itemStyle: { color: '#0040bf' } },
        { name: '测试验证', x: 900, y: 100, itemStyle: { color: '#00209f' } },
        { name: '批量生产', x: 1100, y: 100, itemStyle: { color: '#00007f' } }
      ],
      links: [
        { source: '需求分析', target: '概念设计' },
        { source: '概念设计', target: '详细设计' },
        { source: '详细设计', target: '原型制作' },
        { source: '原型制作', target: '测试验证' },
        { source: '测试验证', target: '批量生产' }
      ],
      lineStyle: {
        opacity: 0.9,
        width: 2,
        curveness: 0,
        color: '#00e5ff'
      }
    }]
  }
  
  chart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 初始化耗时分析图表
const initDurationChart = () => {
  if (!durationChart.value) return
  
  const chart = echarts.init(durationChart.value)
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
      data: ['需求分析', '概念设计', '详细设计', '原型制作', '测试验证', '批量生产'],
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
      name: '天数',
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
      data: [30, 45, 90, 60, 30, 120],
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

// 初始化成本分布图表
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
      name: '成本分布',
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 1048, name: '研发成本' },
        { value: 735, name: '材料成本' },
        { value: 580, name: '人力成本' },
        { value: 484, name: '设备成本' },
        { value: 300, name: '其他成本' }
      ],
      itemStyle: {
        color: function(params) {
          const colors = ['#00e5ff', '#0080ff', '#0060df', '#0040bf', '#00209f']
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

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initFlowChart()
    initDurationChart()
    initCostChart()
  })
})
</script>

<style lang="scss" scoped>
.lifecycle-container {
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

  .lifecycle-overview {
    margin-bottom: 40px;

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

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
            font-size: 18px;
            color: #00e5ff;
          }

          .stage-count {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #b0bec5;
          }

          .stage-progress {
            margin: 0;
            font-size: 14px;
            color: #ffffff;
          }
        }

        .card-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;

          &.active {
            background: rgba(0, 229, 255, 0.2);
            color: #00e5ff;
          }

          &.completed {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
          }

          &.pending {
            background: rgba(255, 152, 0, 0.2);
            color: #ff9800;
          }
        }
      }
    }
  }

  .lifecycle-flow,
  .stage-management,
  .lifecycle-analytics {
    margin-bottom: 40px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 {
        margin: 0;
        font-size: 24px;
        color: #00e5ff;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
      }

      .header-actions {
        .el-button {
          background: linear-gradient(135deg, #00e5ff, #0080ff);
          border: none;
          color: #ffffff;

          &:hover {
            background: linear-gradient(135deg, #0080ff, #00e5ff);
          }
        }
      }
    }

    .flow-chart {
      height: 300px;
      background: rgba(0, 229, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 12px;
    }
  }

  .stage-timeline {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 30px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, #00e5ff, #0080ff);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 30px;

      .timeline-dot {
        position: absolute;
        left: 20px;
        top: 20px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        z-index: 2;

        &.completed {
          background: #4caf50;
          box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        }

        &.active {
          background: #00e5ff;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
        }

        &.pending {
          background: #ff9800;
          box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
        }
      }

      .timeline-content {
        margin-left: 60px;

        .stage-card {
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: 12px;
          padding: 20px;

          .stage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;

            h3 {
              margin: 0;
              font-size: 20px;
              color: #00e5ff;
            }

            .stage-actions {
              .el-button {
                margin-left: 8px;
              }
            }
          }

          .stage-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;

            .info-item {
              .label {
                color: #b0bec5;
                margin-right: 8px;
              }

              .value {
                color: #ffffff;

                &.completed {
                  color: #4caf50;
                }

                &.active {
                  color: #00e5ff;
                }

                &.pending {
                  color: #ff9800;
                }
              }
            }
          }

          .stage-progress {
            margin-bottom: 15px;
          }

          .stage-tasks {
            h4 {
              margin: 0 0 10px 0;
              color: #00e5ff;
              font-size: 16px;
            }

            .task-list {
              .task-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 0;
                border-bottom: 1px solid rgba(0, 229, 255, 0.1);

                &:last-child {
                  border-bottom: none;
                }

                .task-icon {
                  color: #00e5ff;
                }

                .task-name {
                  flex: 1;
                  color: #ffffff;

                  &.completed {
                    text-decoration: line-through;
                    color: #4caf50;
                  }
                }

                .task-assignee {
                  color: #b0bec5;
                  font-size: 12px;
                }
              }
            }
          }
        }
      }
    }
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;

    .analytics-card {
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

      .risk-matrix {
        .risk-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(0, 229, 255, 0.1);

          &:last-child {
            border-bottom: none;
          }

          .risk-level {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            min-width: 60px;
            text-align: center;

            &.high {
              background: rgba(244, 67, 54, 0.2);
              color: #f44336;
            }

            &.medium {
              background: rgba(255, 152, 0, 0.2);
              color: #ff9800;
            }

            &.low {
              background: rgba(76, 175, 80, 0.2);
              color: #4caf50;
            }
          }

          .risk-content {
            flex: 1;

            h4 {
              margin: 0 0 5px 0;
              color: #ffffff;
              font-size: 16px;
            }

            p {
              margin: 0 0 5px 0;
              color: #b0bec5;
              font-size: 14px;
            }

            .risk-impact {
              color: #00e5ff;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}

// Element Plus 样式覆盖
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

    .el-input__inner,
    .el-textarea__inner,
    .el-select .el-input__inner {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: #ffffff;

      &:focus {
        border-color: #00e5ff;
      }
    }

    .el-date-editor.el-input {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);

      .el-input__inner {
        background: transparent;
        border: none;
      }
    }
  }
}

:deep(.el-progress-bar__outer) {
  background: rgba(0, 229, 255, 0.2);
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(135deg, #00e5ff, #0080ff);
}
</style>
