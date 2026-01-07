<template>
  <div class="document-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="el-icon-folder-opened"></i>
            文档管理
          </h1>
          <p class="page-subtitle">Document Management</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" class="hologram-button" @click="showUploadDialog = true">
            <i class="el-icon-upload"></i>
            上传文档
          </el-button>
          <el-button class="hologram-button" @click="showCreateFolderDialog = true">
            <i class="el-icon-folder-add"></i>
            新建文件夹
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.key">
          <div class="stat-icon" :class="stat.iconClass">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-trend" :class="stat.trendClass">
            <i :class="stat.trendIcon"></i>
            <span>{{ stat.trend }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item @click="navigateToPath('/')">
            <i class="el-icon-house"></i>
            根目录
          </el-breadcrumb-item>
          <el-breadcrumb-item 
            v-for="(item, index) in breadcrumbItems" 
            :key="index"
            @click="navigateToPath(item.path)">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <div class="toolbar-right">
        <!-- 视图切换 -->
        <el-radio-group v-model="viewMode" class="view-toggle">
          <el-radio-button label="grid">
            <i class="el-icon-menu"></i>
            网格
          </el-radio-button>
          <el-radio-button label="list">
            <i class="el-icon-s-order"></i>
            列表
          </el-radio-button>
        </el-radio-group>
        
        <!-- 搜索 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文档..."
          prefix-icon="el-icon-search"
          class="search-input"
          @keyup.enter="handleSearch">
        </el-input>
        
        <!-- 筛选 -->
        <el-select v-model="filterType" placeholder="文件类型" clearable class="filter-select">
          <el-option label="全部类型" value=""></el-option>
          <el-option label="文档" value="document"></el-option>
          <el-option label="图片" value="image"></el-option>
          <el-option label="视频" value="video"></el-option>
          <el-option label="CAD文件" value="cad"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
      </div>
    </div>

    <!-- 文档列表 - 网格视图 -->
    <div v-if="viewMode === 'grid'" class="document-grid">
      <div class="grid-container">
        <!-- 文件夹 -->
        <div 
          v-for="folder in folders" 
          :key="folder.id"
          class="document-item folder-item"
          @dblclick="enterFolder(folder)"
          @contextmenu.prevent="showContextMenu($event, folder, 'folder')">
          <div class="item-icon">
            <i class="el-icon-folder"></i>
          </div>
          <div class="item-info">
            <div class="item-name" :title="folder.name">{{ folder.name }}</div>
            <div class="item-meta">{{ folder.itemCount }} 项</div>
          </div>
          <div class="item-actions">
            <el-dropdown @command="handleFolderCommand" trigger="click">
              <el-button size="mini" circle>
                <i class="el-icon-more"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="`rename_${folder.id}`">
                    <i class="el-icon-edit"></i> 重命名
                  </el-dropdown-item>
                  <el-dropdown-item :command="`delete_${folder.id}`" divided>
                    <i class="el-icon-delete"></i> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <!-- 文件 -->
        <div 
          v-for="file in files" 
          :key="file.id"
          class="document-item file-item"
          @dblclick="previewFile(file)"
          @contextmenu.prevent="showContextMenu($event, file, 'file')">
          <div class="item-icon" :class="getFileTypeClass(file.type)">
            <i :class="getFileIcon(file.type)"></i>
          </div>
          <div class="item-info">
            <div class="item-name" :title="file.name">{{ file.name }}</div>
            <div class="item-meta">
              <span>{{ formatFileSize(file.size) }}</span>
              <span>{{ formatDate(file.updateTime) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <el-dropdown @command="handleFileCommand" trigger="click">
              <el-button size="mini" circle>
                <i class="el-icon-more"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="`preview_${file.id}`">
                    <i class="el-icon-view"></i> 预览
                  </el-dropdown-item>
                  <el-dropdown-item :command="`download_${file.id}`">
                    <i class="el-icon-download"></i> 下载
                  </el-dropdown-item>
                  <el-dropdown-item :command="`share_${file.id}`">
                    <i class="el-icon-share"></i> 分享
                  </el-dropdown-item>
                  <el-dropdown-item :command="`rename_${file.id}`" divided>
                    <i class="el-icon-edit"></i> 重命名
                  </el-dropdown-item>
                  <el-dropdown-item :command="`delete_${file.id}`">
                    <i class="el-icon-delete"></i> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 文档列表 - 列表视图 -->
    <div v-else class="document-list">
      <el-table
        :data="allItems"
        class="hologram-table"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-dblclick="handleRowDoubleClick">
        
        <el-table-column type="selection" width="55"></el-table-column>
        
        <el-table-column label="名称" min-width="300">
          <template #default="{ row }">
            <div class="file-name-cell">
              <i :class="row.type === 'folder' ? 'el-icon-folder' : getFileIcon(row.fileType)" 
                 :style="{ color: row.type === 'folder' ? '#ffa726' : getFileIconColor(row.fileType) }"></i>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="mini" :type="row.type === 'folder' ? 'warning' : 'primary'">
              {{ row.type === 'folder' ? '文件夹' : getFileTypeLabel(row.fileType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            <span v-if="row.type === 'file'">{{ formatFileSize(row.size) }}</span>
            <span v-else>{{ row.itemCount }} 项</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="updateTime" label="修改时间" width="150">
          <template #default="{ row }">
            <span>{{ formatDate(row.updateTime) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="owner" label="所有者" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.ownerAvatar">
                {{ row.owner.charAt(0) }}
              </el-avatar>
              <span>{{ row.owner }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="mini" @click.stop="previewFile(row)" v-if="row.type === 'file'">
                <i class="el-icon-view"></i>
                预览
              </el-button>
              <el-button size="mini" @click.stop="enterFolder(row)" v-else>
                <i class="el-icon-folder-opened"></i>
                打开
              </el-button>
              <el-button size="mini" type="primary" @click.stop="downloadFile(row)" v-if="row.type === 'file'">
                <i class="el-icon-download"></i>
                下载
              </el-button>
              <el-dropdown @command="handleCommand" trigger="click">
                <el-button size="mini">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="`share_${row.id}`" v-if="row.type === 'file'">
                      <i class="el-icon-share"></i> 分享
                    </el-dropdown-item>
                    <el-dropdown-item :command="`rename_${row.id}`">
                      <i class="el-icon-edit"></i> 重命名
                    </el-dropdown-item>
                    <el-dropdown-item :command="`delete_${row.id}`" divided>
                      <i class="el-icon-delete"></i> 删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 上传文档对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传文档"
      width="600px"
      class="hologram-dialog">
      
      <el-upload
        class="upload-area"
        drag
        action="#"
        multiple
        :auto-upload="false"
        :file-list="uploadFiles"
        :on-change="handleFileChange"
        :before-upload="beforeUpload">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持多种文件格式：PDF、DOC、XLS、PPT、CAD、图片等，单个文件不超过100MB
          </div>
        </template>
      </el-upload>
      
      <div class="upload-options" v-if="uploadFiles.length > 0">
        <el-form :model="uploadForm" label-width="80px">
          <el-form-item label="上传到">
            <el-cascader
              v-model="uploadForm.targetPath"
              :options="folderTree"
              :props="{ checkStrictly: true, label: 'name', value: 'path' }"
              placeholder="选择目标文件夹"
              clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="uploadForm.description"
              type="textarea"
              :rows="2"
              placeholder="可选：添加文档描述">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button type="primary" @click="handleUpload" :loading="uploading" :disabled="uploadFiles.length === 0">
            开始上传
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新建文件夹对话框 -->
    <el-dialog
      v-model="showCreateFolderDialog"
      title="新建文件夹"
      width="400px"
      class="hologram-dialog">
      
      <el-form :model="folderForm" :rules="folderRules" ref="folderFormRef" label-width="80px">
        <el-form-item label="文件夹名" prop="name">
          <el-input v-model="folderForm.name" placeholder="请输入文件夹名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="folderForm.description"
            type="textarea"
            :rows="3"
            placeholder="可选：添加文件夹描述">
          </el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateFolderDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateFolder" :loading="creating">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      :title="previewFileData?.name"
      width="80%"
      class="hologram-dialog preview-dialog">
      
      <div class="preview-content" v-if="previewFileData">
        <!-- 图片预览 -->
        <div v-if="isImageFile(previewFileData.type)" class="image-preview">
          <img :src="previewFileData.url" :alt="previewFileData.name" />
        </div>
        
        <!-- PDF预览 -->
        <div v-else-if="previewFileData.type === 'pdf'" class="pdf-preview">
          <iframe :src="previewFileData.url" width="100%" height="600px"></iframe>
        </div>
        
        <!-- 文本预览 -->
        <div v-else-if="isTextFile(previewFileData.type)" class="text-preview">
          <pre>{{ previewFileData.content }}</pre>
        </div>
        
        <!-- 不支持预览 -->
        <div v-else class="no-preview">
          <i class="el-icon-document"></i>
          <p>此文件类型不支持预览</p>
          <el-button type="primary" @click="downloadFile(previewFileData)">
            <i class="el-icon-download"></i>
            下载文件
          </el-button>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPreviewDialog = false">关闭</el-button>
          <el-button type="primary" @click="downloadFile(previewFileData)">
            <i class="el-icon-download"></i>
            下载
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'DocumentManagement',
  setup() {
    // 响应式数据
    const loading = ref(false)
    const uploading = ref(false)
    const creating = ref(false)
    const viewMode = ref('grid')
    const searchKeyword = ref('')
    const filterType = ref('')
    const currentPath = ref('/')
    
    // 对话框状态
    const showUploadDialog = ref(false)
    const showCreateFolderDialog = ref(false)
    const showPreviewDialog = ref(false)
    const previewFileData = ref(null)
    
    // 表单引用
    const folderFormRef = ref(null)
    
    // 统计数据
    const stats = ref([
      {
        key: 'total',
        label: '总文档数',
        value: '2,456',
        icon: 'el-icon-document',
        iconClass: 'primary',
        trend: '+156',
        trendIcon: 'el-icon-top',
        trendClass: 'up'
      },
      {
        key: 'folders',
        label: '文件夹',
        value: '89',
        icon: 'el-icon-folder',
        iconClass: 'warning',
        trend: '+12',
        trendIcon: 'el-icon-top',
        trendClass: 'up'
      },
      {
        key: 'storage',
        label: '存储空间',
        value: '15.6GB',
        icon: 'el-icon-pie-chart',
        iconClass: 'success',
        trend: '+2.3GB',
        trendIcon: 'el-icon-top',
        trendClass: 'up'
      },
      {
        key: 'shared',
        label: '共享文档',
        value: '234',
        icon: 'el-icon-share',
        iconClass: 'info',
        trend: '+18',
        trendIcon: 'el-icon-top',
        trendClass: 'up'
      }
    ])
    
    // 文件夹数据
    const folders = ref([
      {
        id: 1,
        name: '产品设计文档',
        itemCount: 45,
        updateTime: '2024-01-15',
        owner: '张设计师',
        ownerAvatar: ''
      },
      {
        id: 2,
        name: '技术规范',
        itemCount: 23,
        updateTime: '2024-01-14',
        owner: '李工程师',
        ownerAvatar: ''
      },
      {
        id: 3,
        name: 'CAD图纸',
        itemCount: 67,
        updateTime: '2024-01-13',
        owner: '王制图员',
        ownerAvatar: ''
      }
    ])
    
    // 文件数据
    const files = ref([
      {
        id: 101,
        name: '产品需求规格书.pdf',
        type: 'file',
        fileType: 'pdf',
        size: 2048576,
        updateTime: '2024-01-15',
        owner: '张产品经理',
        ownerAvatar: '',
        url: '/documents/product-spec.pdf'
      },
      {
        id: 102,
        name: '系统架构图.png',
        type: 'file',
        fileType: 'image',
        size: 1024000,
        updateTime: '2024-01-14',
        owner: '李架构师',
        ownerAvatar: '',
        url: '/documents/architecture.png'
      },
      {
        id: 103,
        name: '用户手册.docx',
        type: 'file',
        fileType: 'document',
        size: 512000,
        updateTime: '2024-01-13',
        owner: '王技术写手',
        ownerAvatar: '',
        url: '/documents/user-manual.docx'
      }
    ])
    
    // 上传相关
    const uploadFiles = ref([])
    const uploadForm = reactive({
      targetPath: [],
      description: ''
    })
    
    // 新建文件夹表单
    const folderForm = reactive({
      name: '',
      description: ''
    })
    
    const folderRules = {
      name: [
        { required: true, message: '请输入文件夹名称', trigger: 'blur' },
        { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
      ]
    }
    
    // 文件夹树结构
    const folderTree = ref([
      {
        name: '根目录',
        path: '/',
        children: [
          {
            name: '产品设计文档',
            path: '/product-design'
          },
          {
            name: '技术规范',
            path: '/technical-specs'
          },
          {
            name: 'CAD图纸',
            path: '/cad-drawings'
          }
        ]
      }
    ])
    
    // 计算属性
    const breadcrumbItems = computed(() => {
      if (currentPath.value === '/') return []
      
      const parts = currentPath.value.split('/').filter(Boolean)
      return parts.map((part, index) => ({
        name: part,
        path: '/' + parts.slice(0, index + 1).join('/')
      }))
    })
    
    const allItems = computed(() => {
      const folderItems = folders.value.map(folder => ({
        ...folder,
        type: 'folder'
      }))
      
      const fileItems = files.value.map(file => ({
        ...file,
        type: 'file'
      }))
      
      return [...folderItems, ...fileItems]
    })
    
    // 方法
    const handleSearch = () => {
      console.log('搜索:', searchKeyword.value)
      // 实现搜索逻辑
    }
    
    const navigateToPath = (path) => {
      currentPath.value = path
      // 加载对应路径的文件和文件夹
    }
    
    const enterFolder = (folder) => {
      console.log('进入文件夹:', folder)
      // 实现进入文件夹逻辑
    }
    
    const previewFile = (file) => {
      previewFileData.value = file
      showPreviewDialog.value = true
    }
    
    const downloadFile = (file) => {
      console.log('下载文件:', file)
      ElMessage.success('开始下载文件')
      // 实现文件下载逻辑
    }
    
    const handleSelectionChange = (selection) => {
      console.log('选择项目:', selection)
    }
    
    const handleRowDoubleClick = (row) => {
      if (row.type === 'folder') {
        enterFolder(row)
      } else {
        previewFile(row)
      }
    }
    
    const handleFileChange = (file, fileList) => {
      uploadFiles.value = fileList
    }
    
    const beforeUpload = (file) => {
      const isValidSize = file.size / 1024 / 1024 < 100
      if (!isValidSize) {
        ElMessage.error('文件大小不能超过 100MB!')
        return false
      }
      return true
    }
    
    const handleUpload = () => {
      if (uploadFiles.value.length === 0) {
        ElMessage.warning('请选择要上传的文件')
        return
      }
      
      uploading.value = true
      
      // 模拟上传
      setTimeout(() => {
        uploading.value = false
        showUploadDialog.value = false
        ElMessage.success('文件上传成功')
        
        // 重置上传表单
        uploadFiles.value = []
        uploadForm.targetPath = []
        uploadForm.description = ''
      }, 2000)
    }
    
    const handleCreateFolder = () => {
      folderFormRef.value.validate((valid) => {
        if (valid) {
          creating.value = true
          
          // 模拟创建文件夹
          setTimeout(() => {
            creating.value = false
            showCreateFolderDialog.value = false
            ElMessage.success('文件夹创建成功')
            
            // 重置表单
            folderForm.name = ''
            folderForm.description = ''
          }, 1000)
        }
      })
    }
    
    const handleFolderCommand = (command) => {
      const [action, id] = command.split('_')
      console.log('文件夹操作:', action, id)
      
      switch (action) {
        case 'rename':
          renameItem(id, 'folder')
          break
        case 'delete':
          deleteItem(id, 'folder')
          break
      }
    }
    
    const handleFileCommand = (command) => {
      const [action, id] = command.split('_')
      console.log('文件操作:', action, id)
      
      switch (action) {
        case 'preview':
          previewFile(files.value.find(f => f.id == id))
          break
        case 'download':
          downloadFile(files.value.find(f => f.id == id))
          break
        case 'share':
          shareFile(id)
          break
        case 'rename':
          renameItem(id, 'file')
          break
        case 'delete':
          deleteItem(id, 'file')
          break
      }
    }
    
    const handleCommand = (command) => {
      const [action, id] = command.split('_')
      const item = allItems.value.find(item => item.id == id)
      
      switch (action) {
        case 'share':
          shareFile(id)
          break
        case 'rename':
          renameItem(id, item.type)
          break
        case 'delete':
          deleteItem(id, item.type)
          break
      }
    }
    
    const shareFile = (id) => {
      ElMessage.success('分享链接已复制到剪贴板')
    }
    
    const renameItem = (id, type) => {
      ElMessageBox.prompt('请输入新名称', '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        ElMessage.success(`${type === 'folder' ? '文件夹' : '文件'}重命名成功`)
      })
    }
    
    const deleteItem = (id, type) => {
      ElMessageBox.confirm(
        `确认删除此${type === 'folder' ? '文件夹' : '文件'}？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success('删除成功')
      })
    }
    
    const showContextMenu = (event, item, type) => {
      // 实现右键菜单
      console.log('右键菜单:', event, item, type)
    }
    
    // 工具方法
    const getFileIcon = (fileType) => {
      const icons = {
        pdf: 'el-icon-document',
        document: 'el-icon-document',
        image: 'el-icon-picture',
        video: 'el-icon-video-camera',
        cad: 'el-icon-set-up',
        other: 'el-icon-document'
      }
      return icons[fileType] || icons.other
    }
    
    const getFileIconColor = (fileType) => {
      const colors = {
        pdf: '#ff5722',
        document: '#2196f3',
        image: '#4caf50',
        video: '#9c27b0',
        cad: '#ff9800',
        other: '#607d8b'
      }
      return colors[fileType] || colors.other
    }
    
    const getFileTypeClass = (fileType) => {
      return `file-type-${fileType}`
    }
    
    const getFileTypeLabel = (fileType) => {
      const labels = {
        pdf: 'PDF',
        document: '文档',
        image: '图片',
        video: '视频',
        cad: 'CAD',
        other: '其他'
      }
      return labels[fileType] || labels.other
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }
    
    const isImageFile = (fileType) => {
      return fileType === 'image'
    }
    
    const isTextFile = (fileType) => {
      return ['txt', 'md', 'json', 'xml', 'csv'].includes(fileType)
    }
    
    // 生命周期
    onMounted(() => {
      // 初始化数据
      handleSearch()
    })
    
    return {
      loading,
      uploading,
      creating,
      viewMode,
      searchKeyword,
      filterType,
      currentPath,
      showUploadDialog,
      showCreateFolderDialog,
      showPreviewDialog,
      previewFile,
      previewFileData,
      folderFormRef,
      stats,
      folders,
      files,
      uploadFiles,
      uploadForm,
      folderForm,
      folderRules,
      folderTree,
      breadcrumbItems,
      allItems,
      handleSearch,
      navigateToPath,
      enterFolder,
      downloadFile,
      handleSelectionChange,
      handleRowDoubleClick,
      handleFileChange,
      beforeUpload,
      handleUpload,
      handleCreateFolder,
      handleFolderCommand,
      handleFileCommand,
      handleCommand,
      shareFile,
      renameItem,
      deleteItem,
      showContextMenu,
      getFileIcon,
      getFileIconColor,
      getFileTypeClass,
      getFileTypeLabel,
      formatFileSize,
      formatDate,
      isImageFile,
      isTextFile
    }
  }
}
</script>

<style lang="scss" scoped>
.document-management {
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title-section {
      .page-title {
        font-size: 28px;
        font-weight: 600;
        color: var(--hologram-primary);
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;
        
        i {
          font-size: 32px;
        }
      }
      
      .page-subtitle {
        color: var(--hologram-text-secondary);
        margin: 0;
        font-size: 14px;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.stats-overview {
  margin-bottom: 24px;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .stat-card {
    background: var(--hologram-card-bg);
    border: 1px solid var(--hologram-border);
    border-radius: var(--hologram-border-radius);
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 229, 255, 0.2);
      border-color: var(--hologram-primary);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.1), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      
      &.primary {
        background: linear-gradient(135deg, var(--hologram-primary), var(--hologram-secondary));
        color: white;
      }
      
      &.success {
        background: linear-gradient(135deg, #00e676, #00c853);
        color: white;
      }
      
      &.warning {
        background: linear-gradient(135deg, #ffab00, #ff8f00);
        color: white;
      }
      
      &.info {
        background: linear-gradient(135deg, #29b6f6, #0288d1);
        color: white;
      }
    }
    
    .stat-content {
      flex: 1;
      
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--hologram-text-primary);
        line-height: 1;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 14px;
        color: var(--hologram-text-secondary);
      }
    }
    
    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      
      &.up {
        color: #00e676;
      }
      
      &.down {
        color: #ff5252;
      }
    }
  }
}

.toolbar {
  background: var(--hologram-card-bg);
  border: 1px solid var(--hologram-border);
  border-radius: var(--hologram-border-radius);
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  
  .toolbar-left {
    .breadcrumb {
      :deep(.el-breadcrumb__item) {
        .el-breadcrumb__inner {
          color: var(--hologram-text-secondary);
          cursor: pointer;
          
          &:hover {
            color: var(--hologram-primary);
          }
        }
        
        &:last-child .el-breadcrumb__inner {
          color: var(--hologram-text-primary);
          cursor: default;
        }
      }
    }
  }
  
  .toolbar-right {
    display: flex;
    gap: 16px;
    align-items: center;
    
    .view-toggle {
      :deep(.el-radio-button__inner) {
        border-color: var(--hologram-border);
        background: transparent;
        color: var(--hologram-text-secondary);
        
        &:hover {
          color: var(--hologram-primary);
        }
      }
      
      :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
        background: var(--hologram-primary);
        border-color: var(--hologram-primary);
        color: white;
      }
    }
    
    .search-input {
      width: 250px;
    }
    
    .filter-select {
      width: 120px;
    }
  }
}

.document-grid {
  background: var(--hologram-card-bg);
  border: 1px solid var(--hologram-border);
  border-radius: var(--hologram-border-radius);
  padding: 24px;
  backdrop-filter: blur(10px);
  
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .document-item {
    background: var(--hologram-bg);
    border: 1px solid var(--hologram-border);
    border-radius: var(--hologram-border-radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 229, 255, 0.2);
      border-color: var(--hologram-primary);
      
      .item-actions {
        opacity: 1;
      }
    }
    
    .item-icon {
      font-size: 48px;
      margin-bottom: 12px;
      
      &.folder-item i {
        color: #ffa726;
      }
      
      &.file-type-pdf i {
        color: #ff5722;
      }
      
      &.file-type-document i {
        color: #2196f3;
      }
      
      &.file-type-image i {
        color: #4caf50;
      }
      
      &.file-type-video i {
        color: #9c27b0;
      }
      
      &.file-type-cad i {
        color: #ff9800;
      }
    }
    
    .item-info {
      flex: 1;
      width: 100%;
      
      .item-name {
        font-weight: 600;
        color: var(--hologram-text-primary);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .item-meta {
        font-size: 12px;
        color: var(--hologram-text-secondary);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
    }
    
    .item-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }
}

.document-list {
  background: var(--hologram-card-bg);
  border: 1px solid var(--hologram-border);
  border-radius: var(--hologram-border-radius);
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  .file-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    i {
      font-size: 18px;
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    span {
      font-size: 12px;
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 8px;
  }
}

.upload-area {
  margin-bottom: 20px;
  
  :deep(.el-upload-dragger) {
    background: var(--hologram-bg);
    border: 2px dashed var(--hologram-border);
    border-radius: var(--hologram-border-radius);
    
    &:hover {
      border-color: var(--hologram-primary);
    }
  }
}

.upload-options {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--hologram-border);
}

.preview-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
  
  .preview-content {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .image-preview img {
      max-width: 100%;
      max-height: 600px;
      object-fit: contain;
    }
    
    .pdf-preview iframe {
      border: none;
      border-radius: var(--hologram-border-radius);
    }
    
    .text-preview pre {
      background: var(--hologram-bg);
      padding: 20px;
      border-radius: var(--hologram-border-radius);
      color: var(--hologram-text-primary);
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 600px;
      overflow-y: auto;
    }
    
    .no-preview {
      text-align: center;
      color: var(--hologram-text-secondary);
      
      i {
        font-size: 64px;
        margin-bottom: 16px;
        color: var(--hologram-border);
      }
      
      p {
        margin-bottom: 20px;
        font-size: 16px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .document-management {
    padding: 16px;
  }
  
  .page-header .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 16px;
    
    .toolbar-left,
    .toolbar-right {
      width: 100%;
    }
    
    .toolbar-right {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .search-input,
  .filter-select {
    width: 100% !important;
  }
}
</style>
