<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createPost, type CreatePostData, getForumCategories, getForumMainCategories, createForumCategory, deleteForumCategory, type ForumCategory, type ForumMainCategory } from '@/api/forum'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '@/utils/session'

const router = useRouter()

// 表单状态
const form = reactive({
  title: '',
  category: '',
  preview: '',
  content: '',
  tags: ''
})

// 文件上传状态
const uploadedFiles = ref<Array<{
  name: string
  type: 'image' | 'video' | 'document'
  url: string
  size: number
}>>([])

// 分类列表（从后端加载）
const categories = ref<ForumCategory[]>([])
const mainCategoriesList = ref<ForumMainCategory[]>([])

// 计算属性：主分类列表（从 forum_main_categories 表加载，并去重）
const mainCategories = computed(() => {
  // 去重：根据 name 字段去重，保留第一个出现的
  const uniqueCategories = []
  const seenNames = new Set()
  
  for (const cat of mainCategoriesList.value) {
    if (!seenNames.has(cat.name)) {
      seenNames.add(cat.name)
      uniqueCategories.push(cat)
    }
  }
  
  // 按 sort_order 排序
  uniqueCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  
  return uniqueCategories
})

// 当前选中的主分类
const selectedMainCategory = ref<number | null>(null)

// 计算属性：根据选中的主分类筛选副分类
const subCategories = computed(() => {
  if (!selectedMainCategory.value) return []
  
  const filtered = categories.value.filter(cat => cat.mainCategoryId === selectedMainCategory.value)
  
  // 按 sort_order 排序
  return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
})

// 显示添加分类输入框
const showAddCategory = ref(false)
const newCategoryName = ref('')

// 模糊搜索相关
const showSearchDropdown = ref(false)
const searchResults = ref<ForumCategory[]>([])

// 当前用户信息
const currentUser = ref<any>(null)

// 鼠标位置（用于光标效果）
const mouseX = ref(0)
const mouseY = ref(0)

// 过滤 HTML 标签，防止 XSS 攻击
const sanitizeHTML = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 过滤标题和预览：只允许中文、英文、数字和基本标点符号（不含空白符，包含破折号——）
const sanitizeTextInput = (text: string): string => {
  // 允许的字符：中文、英文、数字、基本标点（，。！？；：""''（）【】《》、·…——）
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9，。！？；：""''（）【】《》、·…——]/g, '')
}

// 过滤标签：只允许中文、英文、数字（不允许任何符号）
const sanitizeTagInput = (text: string): string => {
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
}

// 标签列表（最多5个）
const tagInputs = ref<string[]>([''])
const MAX_TAGS = 5

// 富文本编辑器相关
const editorRef = ref<HTMLDivElement | null>(null)
const isBold = ref(false)
const savedRange = ref<Range | null>(null) // 保存光标位置

// 保存当前光标位置
function saveSelection() {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    savedRange.value = selection.getRangeAt(0).cloneRange()
  }
}

// 恢复光标位置
function restoreSelection() {
  if (savedRange.value && editorRef.value) {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(savedRange.value)
    }
  }
}

// 添加标签输入框
function addTagInput() {
  if (tagInputs.value.length < MAX_TAGS) {
    tagInputs.value.push('')
  }
}

// 删除标签输入框
function removeTagInput(index: number) {
  if (tagInputs.value.length > 1) {
    tagInputs.value.splice(index, 1)
  } else {
    tagInputs.value[0] = ''
  }
}

// 更新标签列表到 form.tags
function updateTagsFromInputs() {
  form.tags = tagInputs.value.filter(t => t.trim()).join(' ')
}

// 富文本编辑器功能

// 切换粗体（点击切换加粗状态，影响后续输入）
function toggleBold() {
  if (!editorRef.value) return
  
  // 切换加粗状态
  const newBoldState = !isBold.value
  
  if (newBoldState) {
    // 开启加粗
    document.execCommand('bold', false)
    isBold.value = true
  } else {
    // 取消加粗：再次执行 bold 命令取消
    document.execCommand('bold', false)
    isBold.value = false
  }
  
  // 清除选区，恢复到默认状态
  setTimeout(() => {
    window.getSelection()?.removeAllRanges()
    isBold.value = false
  }, 100)
  
  updateContentFromEditor()
}

// 插入图片到正文
function insertImageToContent(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return
  
  // 恢复光标位置
  restoreSelection()
  
  // 确保编辑器有焦点
  if (editorRef.value) {
    editorRef.value.focus()
  }
  
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imgHtml = `<p><img src="${e.target?.result}" style="max-width:100%;height:auto;margin:10px 0;border-radius:8px;display:block;" /></p>`
        document.execCommand('insertHTML', false, imgHtml)
        updateContentFromEditor()
      }
      reader.readAsDataURL(file)
    }
  })
  
  target.value = ''
}

// 插入视频到正文
function insertVideoToContent(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return
  
  // 恢复光标位置
  restoreSelection()
  
  // 确保编辑器有焦点
  if (editorRef.value) {
    editorRef.value.focus()
  }
  
  Array.from(files).forEach(file => {
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      const videoHtml = `<p><video controls style="max-width:100%;height:auto;margin:10px 0;border-radius:8px;display:block;"><source src="${url}" type="video/mp4">您的浏览器不支持视频播放</video></p>`
      document.execCommand('insertHTML', false, videoHtml)
      updateContentFromEditor()
    }
  })
  
  target.value = ''
}

// 处理编辑器输入
function handleEditorInput() {
  updateContentFromEditor()
}

// 处理键盘事件
function handleEditorKeydown(event: KeyboardEvent) {
  // Ctrl+B 切换粗体
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault()
    toggleBold()
  }
}

// 点击编辑器时保存光标位置
function handleEditorClick() {
  saveSelection()
}

// 从编辑器更新 form.content
function updateContentFromEditor() {
  if (editorRef.value) {
    form.content = editorRef.value.innerHTML
  }
}
const totalFileSize = computed(() => {
  return uploadedFiles.value.reduce((sum, file) => sum + file.size, 0)
})

// 初始化用户信息和加载分类
onMounted(async () => {
  const userInfo = getUserInfo()
  if (!userInfo) {
    ElMessage.warning('请先登录')
    router.push('/Users')
    return
  }
  
  currentUser.value = userInfo
  
  // 监听鼠标移动
  window.addEventListener('mousemove', handleMouseMove)
  
  // 加载分类列表
  await loadCategories()
  
  // 初始化富文本编辑器
  if (editorRef.value) {
    editorRef.value.focus()
  }
  
  // 初始化 fade-up 动画
  setTimeout(() => {
    document.querySelectorAll('.fade-up').forEach(el => {
      el.classList.add('visible')
    })
  }, 100)
})

// 加载分类列表
async function loadCategories() {
  try {
    // 并行加载主分类和副分类
    const [mainCatsRes, subCatsRes] = await Promise.all([
      getForumMainCategories(),
      getForumCategories()
    ])
    
    mainCategoriesList.value = mainCatsRes
    categories.value = subCatsRes
    
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 选择主分类
function selectMainCategory(mainCatId: number) {
  selectedMainCategory.value = mainCatId
  // 重置副分类选择
  form.category = ''
}

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

// 监听输入，进行模糊搜索
function handleCategoryInput() {
  if (!newCategoryName.value.trim()) {
    searchResults.value = []
    showSearchDropdown.value = false
    return
  }
  
  const keyword = newCategoryName.value.trim().toLowerCase()
  // 模糊搜索：查找 name 包含关键字的分类
  searchResults.value = categories.value.filter(cat => 
    cat.name.toLowerCase().includes(keyword)
  )
  
  showSearchDropdown.value = searchResults.value.length > 0
}

// 选择搜索结果中的分类
function selectCategory(category: ForumCategory) {
  form.category = category.categoryId
  newCategoryName.value = ''
  showSearchDropdown.value = false
  showAddCategory.value = false
  ElMessage.success(`已选择分类：${category.name}`)
}

// 添加新分类（仅当没有匹配结果时）
async function addCategory() {
  if (!newCategoryName.value.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  
  const label = newCategoryName.value.trim()
  
  // 检查是否已存在完全匹配的分类
  const existingCategory = categories.value.find(c => c.name === label)
  if (existingCategory) {
    // 如果已存在，直接选中
    form.category = existingCategory.categoryId
    newCategoryName.value = ''
    showAddCategory.value = false
    showSearchDropdown.value = false
    ElMessage.success(`已选择分类：${label}`)
    return
  }
  
  try {
    // 生成 categoryId（使用 label 作为唯一标识）
    const categoryId = label
    
    // 随机生成颜色
    const colors = ['#00c8ff', '#a78bfa', '#ff6b35', '#ffd93d', '#00ffb4', '#ff4757', '#2ed573', '#1e90ff']
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    await createForumCategory({
      categoryId,
      name: label,
      color,
      mainCategoryId: selectedMainCategory.value || null // 关联到当前选中的主分类
    })
    
    // 重新加载分类列表
    await loadCategories()
    
    // 选中新添加的分类
    form.category = categoryId
    
    // 重置并隐藏输入框
    newCategoryName.value = ''
    showAddCategory.value = false
    showSearchDropdown.value = false
    
    ElMessage.success('分类添加成功')
  } catch (error) {
    ElMessage.error('分类添加失败')
  }
}

// 删除自定义分类
async function removeCategory(categoryId: string) {
  const category = categories.value.find(c => c.categoryId === categoryId)
  if (!category) return
  
  try {
    await deleteForumCategory(category.id)
    
    // 重新加载分类列表
    await loadCategories()
    
    // 如果删除的是当前选中的分类，重置为默认值
    if (form.category === categoryId) {
      form.category = ''
    }
    
    ElMessage.success('分类已删除')
  } catch (error) {
    ElMessage.error('分类删除失败')
  }
}

function handleMouseMove(e: MouseEvent) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// 处理图片上传
function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return
  
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedFiles.value.push({
          name: file.name,
          type: 'image',
          url: e.target?.result as string,
          size: file.size
        })
      }
      reader.readAsDataURL(file)
    }
  })
  
  // 清空input，允许重复选择同一文件
  target.value = ''
}

// 处理视频上传
function handleVideoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return
  
  Array.from(files).forEach(file => {
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      uploadedFiles.value.push({
        name: file.name,
        type: 'video',
        url: url,
        size: file.size
      })
    }
  })
  
  target.value = ''
}

// 处理文档上传
function handleDocumentUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.7z', '.xls', '.xlsx']
  
  Array.from(files).forEach(file => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension || '')) {
      uploadedFiles.value.push({
        name: file.name,
        type: 'document',
        url: URL.createObjectURL(file),
        size: file.size
      })
    } else {
      ElMessage.warning(`不支持的文件类型: ${file.name}`)
    }
  })
  
  target.value = ''
}

// 删除已上传文件
function removeFile(index: number) {
  uploadedFiles.value.splice(index, 1)
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 获取文件图标（根据文件扩展名）
function getFileIcon(type: string, fileName?: string): string {
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return '📕'
      case 'doc':
      case 'docx': return '📘'
      case 'xls':
      case 'xlsx': return '📗'
      case 'txt': return '📄'
      case 'zip':
      case 'rar':
      case '7z': return '📦'
      default: return '📄'
    }
  }
  return '📄'
}

// 提交帖子
async function submitPost() {
  // 验证必填字段
  if (!form.title.trim()) {
    ElMessage.warning('请输入帖子标题')
    return
  }
  // 验证标题长度
  if (form.title.trim().length > 30) {
    ElMessage.warning('标题不能超过30个字')
    return
  }
  
  // 验证预览摘要长度
  if (form.preview.trim().length > 50) {
    ElMessage.warning('预览摘要不能超过50个字')
    return
  }
  
  // 检测危险的 HTML 标签（只针对标题和预览，正文允许富文本格式）
  const htmlTagRegex = /<[a-zA-Z][^>]*>|&[a-zA-Z]+;/
  if (htmlTagRegex.test(form.title) || htmlTagRegex.test(form.preview)) {
    ElMessage.warning('存在不符合的符号，请勿输入 HTML 格式内容')
    return
  }
  
  // 过滤并验证输入内容
  const sanitizedTitle = sanitizeTextInput(form.title.trim())
  const sanitizedPreview = sanitizeTextInput(form.preview.trim())
  
  if (!sanitizedTitle) {
    ElMessage.warning('标题只能包含中文、英文、数字和基本标点符号')
    return
  }
  
  if (!sanitizedPreview) {
    ElMessage.warning('预览摘要只能包含中文、英文、数字和基本标点符号')
    return
  }
  
  if (!form.category) {
    ElMessage.warning('请选择帖子分类')
    return
  }
  if (!form.preview.trim()) {
    ElMessage.warning('请输入预览摘要')
    return
  }
  
  // 验证正文内容（获取编辑器的纯文本内容）
  const editorText = editorRef.value ? editorRef.value.innerText.trim() : form.content.replace(/<[^>]*>/g, '').trim()
  if (!editorText) {
    ElMessage.warning('请输入正文内容')
    return
  }
  if (!currentUser.value) {
    ElMessage.warning('请先登录')
    return
  }

  // 构建完整内容（直接存储用户输入的正文内容，并过滤 HTML）
  // 注意：富文本编辑器已经包含 HTML 标签，需要特殊处理
  let fullContent = form.content.trim()
  
  // 如果内容为空，使用编辑器的内容
  if (!fullContent && editorRef.value) {
    fullContent = editorRef.value.innerHTML.trim()
  }
  
  // 移除空的 style 属性和 class 属性（清理格式）
  fullContent = fullContent.replace(/ style=""/g, '').replace(/ class=""/g, '')
  
  // 过滤危险的 HTML 标签，但保留基本的格式标签
  const safeContent = fullContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')  // 移除 script 标签
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')  // 移除 iframe 标签
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')  // 移除 object 标签
    .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '')    // 移除 embed 标签
    .replace(/on\w+="[^"]*"/gi, '')                     // 移除事件处理器

  // 处理标签（过滤后的标签可能没有分隔符，需要按原有逻辑处理）
  const tagsArray = form.tags.trim()
    .split(/[,，\s]+/)
    .filter(t => t.length > 0)
    .map(t => sanitizeTagInput(t)) // 再次确保标签合法
    .filter(t => t.length > 0)
    .slice(0, 5)

  const selectedCat = categories.value.find(c => c.categoryId === form.category)

  const postData: CreatePostData = {
    userId: currentUser.value.id,
    category: selectedCat?.categoryId || form.category,
    categoryLabel: selectedCat?.name || '其他',
    title: sanitizeHTML(sanitizedTitle),
    preview: sanitizeHTML(sanitizedPreview),
    content: fullContent, // 使用富文本内容
    attachments: uploadedFiles.value.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.url
    })), // 保存附件信息
    tags: tagsArray
  }

  try {
    await createPost(postData)
    ElMessage.success('发帖成功！即将跳转到论坛列表页...')
    
    // 延迟跳转到论坛列表页
    setTimeout(() => {
      router.push('/Forum')
    }, 1500)
  } catch (error) {
    ElMessage.error('发帖失败，请重试')
  }
}

// 保存草稿
function saveDraft() {
  try {
    // 确保获取最新的编辑器内容
    if (editorRef.value) {
      form.content = editorRef.value.innerHTML
    }
    
    const draft = {
      title: form.title,
      category: form.category,
      preview: form.preview,
      content: form.content,
      tags: tagInputs.value.filter(t => t.trim()), // 保存标签数组
      fileCount: uploadedFiles.value.length,
      savedAt: new Date().toISOString()
    }
    
    localStorage.setItem('forumPostDraft', JSON.stringify(draft))
    ElMessage.success('草稿已保存')
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      ElMessage.error('存储空间不足，请清理浏览器缓存或删除旧草稿')
    } else {
      ElMessage.error('保存草稿失败')
    }
  }
}

// 加载草稿
function loadDraft() {
  const draftStr = localStorage.getItem('forumPostDraft')
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr)
      
      // 恢复表单数据
      form.title = draft.title || ''
      form.category = draft.category || ''
      form.preview = draft.preview || ''
      form.content = draft.content || ''
      
      // 恢复标签列表
      if (draft.tags && Array.isArray(draft.tags)) {
        tagInputs.value = draft.tags.length > 0 ? draft.tags : ['']
      } else {
        tagInputs.value = ['']
      }
      updateTagsFromInputs()
      
      // 恢复富文本编辑器内容
      if (editorRef.value && draft.content) {
        editorRef.value.innerHTML = draft.content
      }
      
      // 注意：不再恢复文件列表，因为文件内容太大
      if (draft.fileCount > 0) {
        ElMessage.info(`草稿中包含 ${draft.fileCount} 个附件，请重新上传`)
      }
      
      ElMessage.success('草稿已加载')
    } catch (e) {
      ElMessage.error('加载草稿失败，草稿可能已损坏')
    }
  } else {
    ElMessage.info('没有找到草稿')
  }
}

// 返回
function goBack() {
  router.back()
}
</script>

<template>
  <div class="forum-upload-root">
    <canvas class="bg-canvas"></canvas>
    <div class="noise-layer"></div>
    <div class="cursor-glow" :style="`left:${mouseX}px;top:${mouseY}px`"></div>

    <!-- 导航栏 -->
    <nav class="top-nav">
      <div class="nav-left">
        <div class="nav-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10"
                     stroke="#00ffb4" stroke-width="1.5" fill="rgba(0,255,180,0.06)"/>
            <circle cx="16" cy="16" r="3" fill="#00ffb4"/>
          </svg>
          <span class="logo-text">COURSENET<em>.io</em></span>
        </div>
        <button class="back-btn" @click="goBack">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          返回
        </button>
      </div>
      <div class="nav-right">
        <button class="draft-btn" @click="saveDraft">
          <span class="cb-sweep"></span>
          保存草稿
        </button>
        <button class="publish-btn" @click="submitPost">
          <span class="cb-sweep"></span>
          发布帖子
        </button>
      </div>
    </nav>

    <!-- 主体内容 -->
    <div class="upload-main">
      <div class="upload-inner">
        <!-- 左侧表单 -->
        <div class="form-left">
          <!-- 基本信息块 -->
          <div class="content-block fade-up">
            <div class="block-header">
              <div class="bh-tag">[ BASIC INFO ]</div>
              <h3 class="bh-title">基本信息</h3>
            </div>
            
            <div class="form-group">
              <label class="form-label">标题 <span class="required">*</span></label>
              <input 
                v-model="form.title" 
                @input="form.title = sanitizeTextInput(form.title)"
                class="form-input" 
                placeholder="输入帖子标题（最多30字）..." 
                maxlength="30"
              />
              <div class="char-count">{{ form.title.length }}/30</div>
            </div>

            <div class="form-group">
              <label class="form-label">预览摘要 <span class="required">*</span></label>
              <textarea 
                v-model="form.preview" 
                @input="form.preview = sanitizeTextInput(form.preview)"
                class="form-textarea" 
                placeholder="输入帖子预览内容（最多50字）..."
                rows="3"
                maxlength="50"
              ></textarea>
              <div class="char-count">{{ form.preview.length }}/50</div>
            </div>

            <div class="form-group">
              <label class="form-label">分类</label>
                          
              <!-- 主分类选择 -->
              <div class="category-section">
                <div class="category-tags">
                  <div 
                    v-for="cat in mainCategories" 
                    :key="cat.id"
                    class="category-tag main-cat-tag"
                    :class="{ active: selectedMainCategory === cat.id }"
                    :style="`--cc:${cat.color}`"
                    @click="selectMainCategory(cat.id)"
                  >
                    <span class="tag-label">{{ cat.name }}</span>
                  </div>
                </div>
              </div>
                          
              <!-- 副分类选择（仅当选中主分类且该主分类有副分类时显示） -->
              <div v-if="selectedMainCategory && subCategories.length > 0" class="category-section">
                <div class="category-label-small">副分类</div>
                <div class="category-tags">
                  <div 
                    v-for="cat in subCategories" 
                    :key="cat.id"
                    class="category-tag sub-cat-tag"
                    :class="{ active: form.category === cat.categoryId }"
                    :style="`--cc:${cat.color}`"
                    @click="form.category = cat.categoryId"
                  >
                    <span class="tag-label">{{ cat.name }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 添加分类按钮（仅当选中主分类后显示） -->
              <button 
                v-if="selectedMainCategory"
                class="add-category-simple-btn"
                @click="showAddCategory = !showAddCategory"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {{ showAddCategory ? '取消' : (subCategories.length > 0 ? '添加副分类' : '添加分类') }}
              </button>

              <!-- 添加分类表单（带模糊搜索） -->
              <div v-if="showAddCategory" class="add-category-simple-form">
                <div class="search-input-wrapper">
                  <input 
                    v-model="newCategoryName" 
                    class="form-input"
                    placeholder="输入分类名称搜索或创建..."
                    maxlength="20"
                    @input="handleCategoryInput"
                    @keyup.enter="addCategory"
                    @blur="() => setTimeout(() => { showSearchDropdown = false }, 200)"
                  />
                  
                  <!-- 搜索结果下拉框 -->
                  <div v-if="showSearchDropdown && searchResults.length > 0" class="search-dropdown">
                    <div 
                      v-for="cat in searchResults" 
                      :key="cat.id"
                      class="search-item"
                      @mousedown="selectCategory(cat)"
                    >
                      <span class="search-item-label">{{ cat.name }}</span>
                      <span class="search-item-hint">点击选择</span>
                    </div>
                  </div>
                </div>
                
                <button class="btn-add-confirm" @click="addCategory">
                  {{ searchResults.length > 0 ? '创建新分类' : '确认添加' }}
                </button>
              </div>

            </div>
            
            <div class="form-group">
              <label class="form-label">标签</label>
              <div class="tags-input-container">
                <!-- 标签输入框列表 -->
                <div class="tags-input-row">
                  <div 
                    v-for="(tag, index) in tagInputs" 
                    :key="index" 
                    class="tag-input-wrapper"
                  >
                    <input 
                      v-model="tagInputs[index]" 
                      @input="tagInputs[index] = sanitizeTagInput(tagInputs[index]); updateTagsFromInputs()"
                      class="tag-input" 
                      :placeholder="index === 0 ? '输入标签...' : ''"
                      maxlength="10"
                    />
                    <!-- 删除按钮（只有当有多个标签时显示） -->
                    <button 
                      v-if="tagInputs.length > 1" 
                      class="tag-remove-btn"
                      @click="removeTagInput(index)"
                      type="button"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- 添加标签按钮（最多5个时隐藏） -->
                  <button 
                    v-if="tagInputs.length < MAX_TAGS"
                    class="add-tag-btn"
                    @click="addTagInput"
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    添加标签
                  </button>
                </div>
              </div>
              <div class="tag-hint">示例: Vue3 TypeScript 前端（最多5个标签，只能输入中文/英文/数字）</div>
            </div>
          </div>

          <!-- 内容块 -->
          <div class="content-block fade-up">
            <div class="block-header">
              <div class="bh-tag">[ CONTENT ]</div>
              <h3 class="bh-title">正文内容</h3>
            </div>

            <div class="form-group">
              <label class="form-label">正文 <span class="required">*</span></label>
              
              <!-- 富文本编辑器工具栏 -->
              <div class="rich-editor-toolbar">
                <!-- 字体粗细 -->
                <div class="toolbar-group">
                  <button @click="toggleBold" :class="{ active: isBold }" class="toolbar-btn" title="加粗">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/>
                      <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/>
                    </svg>
                  </button>
                </div>

                <!-- 分隔线 -->
                <div class="toolbar-divider"></div>

                <!-- 插入图片 -->
                <div class="toolbar-group">
                  <label class="toolbar-btn" title="插入图片">
                    <input 
                      type="file" 
                      accept="image/*" 
                      @change="insertImageToContent" 
                      style="display:none"
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </label>
                </div>

                <!-- 插入视频 -->
                <div class="toolbar-group">
                  <label class="toolbar-btn" title="插入视频">
                    <input 
                      type="file" 
                      accept="video/*" 
                      @change="insertVideoToContent" 
                      style="display:none"
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </label>
                </div>
              </div>

              <!-- 富文本编辑区域 -->
              <div 
                ref="editorRef"
                class="rich-editor"
                contenteditable="true"
                @input="handleEditorInput"
                @keydown="handleEditorKeydown"
                @click="handleEditorClick"
                @mouseup="saveSelection"
                @keyup="saveSelection"
                placeholder="分享你的知识、问题或资源..."
              ></div>
            </div>


          </div>

          <!-- 附件上传块 -->
          <div class="content-block fade-up">
            <div class="block-header">
              <div class="bh-tag">[ ATTACHMENTS ]</div>
              <h3 class="bh-title">附件上传</h3>
            </div>

            <div class="upload-area">
              <div class="upload-buttons">
                <label class="upload-trigger document">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.7z,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip,application/x-rar-compressed,application/x-7z-compressed,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                    @change="handleDocumentUpload" 
                    style="display:none" 
                    multiple
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  上传附件
                </label>
              </div>

              <!-- 已上传附件列表 -->
              <div v-if="uploadedFiles.length > 0" class="file-list">
                <div class="file-list-header">
                  <span>已上传附件 ({{ uploadedFiles.length }})</span>
                  <span class="total-size">总计: {{ formatFileSize(totalFileSize) }}</span>
                </div>
                <div class="file-items">
                  <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
                    <div class="file-info">
                      <span class="file-icon">{{ getFileIcon(file.type, file.name) }}</span>
                      <div class="file-details">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      </div>
                    </div>
                    <div class="file-actions">
                      <a :href="file.url" :download="file.name" class="file-download-btn" title="下载">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </a>
                      <button class="file-remove" @click="removeFile(index)" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧预览卡 -->
        <aside class="sidebar-right">
          <!-- 发布预览卡 -->
          <div class="sidebar-card preview-card fade-up">
            <div class="sc-tag">[ PREVIEW ]</div>
            <h3 class="sc-title">发布预览</h3>

            <div class="preview-content">
              <div class="preview-title">{{ form.title || '未填写标题' }}</div>
              
              <div v-if="form.subtitle" class="preview-subtitle">
                {{ form.subtitle }}
              </div>

              <div class="preview-category">
                {{ categories.find(c => c.categoryId === form.category)?.name || (form.category || '未选择分类') }}
              </div>
              
              <div v-if="form.preface" class="preview-preface">
                {{ form.preface.substring(0, 80) }}{{ form.preface.length > 80 ? '...' : '' }}
              </div>

              <div class="preview-stats">
                <div class="stat-item">
                  <span class="stat-val">{{ uploadedFiles.filter(f => f.type === 'image').length }}</span>
                  <span class="stat-label">图片</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-val">{{ uploadedFiles.filter(f => f.type === 'video').length }}</span>
                  <span class="stat-label">视频</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-val">{{ uploadedFiles.filter(f => f.type === 'document').length }}</span>
                  <span class="stat-label">文档</span>
                </div>
              </div>
            </div>

            <button class="publish-btn large" @click="submitPost">
              <span class="cb-sweep"></span>
              发布帖子
            </button>
            <button class="draft-btn" @click="saveDraft">保存草稿</button>
            <button class="load-draft-btn" @click="loadDraft">加载草稿</button>
          </div>

          <!-- 提示卡 -->
          <div class="sidebar-card fade-up">
            <div class="sc-tag">[ TIPS ]</div>
            <h3 class="sc-title">发帖提示</h3>
            <ul class="tip-list">
              <li>标题建议 5–30 字，清晰描述主题</li>
              <li>前言部分简要说明背景，吸引读者</li>
              <li>正文可以分段，使用换行提高可读性</li>
              <li>参考资料增加帖子的可信度</li>
              <li>标签最多5个，帮助他人发现你的帖子</li>
              <li>支持上传多张图片、视频和文档</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

/* ─── RESET ───────────────────────────────────────────── */
*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

.forum-upload-root {
  background: #ffffff;
  color: #1a1a1a;
  font-family: 'Noto Sans SC', sans-serif;
  min-height: 100vh;
  position: relative;
}

/* ─── BG ─────────────────────────────────────────────── */
.bg-canvas {
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 0;
}
.noise-layer {
  position: fixed; inset: 0; z-index: 1;
  pointer-events: none; opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px;
}
.cursor-glow {
  position: fixed; z-index: 1;
  width: 500px; height: 500px;
  transform: translate(-50%,-50%);
  background: radial-gradient(circle, rgba(0, 102, 255, 0.04) 0%, transparent 55%);
  pointer-events: none;
  transition: left 0.07s, top 0.07s;
}

/* ─── FADE UP ─────────────────────────────────────────── */
.fade-up {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.7s cubic-bezier(0.25,1,0.5,1), transform 0.7s cubic-bezier(0.25,1,0.5,1);
}
.fade-up.visible { opacity:1; transform:translateY(0); }

/* ─── NAV ─────────────────────────────────────────────── */
.top-nav {
  position: fixed; top:0; left:0; right:0; z-index: 200;
  height: 62px;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(22px) saturate(1.5);
  border-bottom: 1px solid rgba(0, 102, 255, 0.1);
}
.nav-left { display: flex; align-items: center; gap: 1.2rem; }
.nav-logo {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.18em; color: #1a1a1a; flex-shrink: 0;
}
.nav-logo svg { width: 24px; height: 24px; }
.nav-logo em { font-style:normal; color: #0066FF; }

.back-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px;
  background: rgba(0, 102, 255, 0.05);
  border: 1px solid rgba(0, 102, 255, 0.15);
  color: #1a1a1a;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem;
  cursor: pointer; transition: all 0.25s;
}
.back-btn:hover {
  background: rgba(0, 102, 255, 0.1);
  border-color: rgba(0, 102, 255, 0.3);
}

.nav-right { display: flex; align-items: center; gap: 1rem; }
.draft-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 22px; border-radius: 9px;
  border: 1px solid rgba(0, 102, 255, 0.3);
  background: rgba(0, 102, 255, 0.05);
  color: #0066FF;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; position: relative; overflow: hidden;
  transition: all 0.25s;
}
.draft-btn:hover { 
  background: rgba(0, 102, 255, 0.1);
  border-color: rgba(0, 102, 255, 0.5);
}
.publish-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 22px; border-radius: 9px;
  border: none; cursor: pointer;
  background: linear-gradient(135deg, #0066FF, #00D4FF);
  color: #fff;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem; font-weight: 600;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,102,255,0.3);
  transition: all 0.25s;
}
.publish-btn:hover { 
  box-shadow: 0 8px 30px rgba(0,102,255,0.5);
  transform: translateY(-1px);
}
.cb-sweep {
  position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transition: left 0.5s cubic-bezier(0.25,1,0.5,1);
}
.publish-btn:hover .cb-sweep,
.draft-btn:hover .cb-sweep { left: 150%; }

/* ─── 主体布局 ─── */
.upload-main {
  position: relative; z-index: 2;
  padding: 84px 48px 64px; max-width: 1400px; margin: 0 auto;
}
.upload-inner {
  display: grid; grid-template-columns: 1fr 340px;
  gap: 32px; align-items: start;
}
.form-left { display: flex; flex-direction: column; gap: 24px; }

/* ─── 内容块 ─── */
.content-block {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 32px;
  position: relative;
  overflow: hidden;
}
.block-header {
  margin-bottom: 24px;
}
.bh-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: #0066FF;
  margin-bottom: 8px;
}
.bh-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* ─── 表单样式 ─── */
.form-group {
  margin-bottom: 20px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group.half {
  margin-bottom: 0;
}
.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.required {
  color: #ff4444;
}
.form-input {
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.95rem;
  color: #1a1a1a;
  transition: all 0.25s;
}
.form-input:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0,102,255,0.1);
}
.form-input[readonly] {
  background: #f5f5f5;
  cursor: not-allowed;
}
.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.95rem;
  color: #1a1a1a;
  resize: vertical;
  line-height: 1.6;
  transition: all 0.25s;
}
.form-textarea:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0,102,255,0.1);
}
.form-textarea.large {
  min-height: 280px;
}
.tag-hint {
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}

/* ─── 分类选择 ─── */
.category-select {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.cat-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
  font-size: 0.9rem;
}
.cat-option:hover {
  border-color: var(--cc);
  background: rgba(0,0,0,0.02);
}
.cat-option.active {
  border-color: var(--cc);
  background: rgba(0,0,0,0.03);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}
.cat-icon {
  font-size: 1.2rem;
}
.cat-label {
  font-weight: 500;
  color: #1a1a1a;
}

/* ─── 分类标签样式（简化版） ─── */
.category-section {
  margin-bottom: 16px;
}

.category-label-small {
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.category-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.category-tag:hover {
  border-color: var(--cc, #0066FF);
  background: rgba(0,102,255,0.03);
}
.category-tag.active {
  border-color: var(--cc, #0066FF);
  background: rgba(0,102,255,0.08);
  color: var(--cc, #0066FF);
  font-weight: 600;
}

/* 主分类标签样式 */
.main-cat-tag {
  font-weight: 600;
}
.main-cat-tag.active {
  box-shadow: 0 2px 8px rgba(0,102,255,0.15);
}

/* 副分类标签样式 */
.sub-cat-tag {
  font-size: 0.85rem;
  padding: 6px 12px;
}
.sub-cat-tag.active {
  box-shadow: 0 2px 6px rgba(0,102,255,0.12);
}
.tag-label {
  user-select: none;
}

/* 添加分类按钮（简化版） */
.add-category-simple-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: 1.5px dashed #ccc;
  border-radius: 20px;
  color: #999;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.add-category-simple-btn:hover {
  border-color: #0066FF;
  color: #0066FF;
  background: rgba(0,102,255,0.03);
}

/* 添加分类表单（简化版） */
.add-category-simple-form {
  margin-top: 12px;
  animation: slideDown 0.3s ease;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 搜索输入框容器 */
.search-input-wrapper {
  position: relative;
  margin-bottom: 10px;
}

/* 搜索结果下拉框 */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 4px;
}

.search-item {
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f5f5f5;
}
.search-item:last-child {
  border-bottom: none;
}
.search-item:hover {
  background: rgba(0,102,255,0.05);
}
.search-item-label {
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 500;
}
.search-item-hint {
  font-size: 0.75rem;
  color: #999;
}

.btn-add-confirm {
  width: 100%;
  padding: 10px 20px;
  background: #0066FF;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-add-confirm:hover {
  background: #0052cc;
}

.category-hint {
  margin-top: 8px;
  font-size: 0.75rem;
  color: #999;
}

/* 未选择主分类时的提示样式 */
.category-hint.select-main-first {
  color: #ff6b35;
  font-weight: 500;
  padding: 8px 12px;
  background: rgba(255, 107, 53, 0.05);
  border-radius: 6px;
  border-left: 3px solid #ff6b35;
  animation: pulseHint 2s ease-in-out infinite;
}

@keyframes pulseHint {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* ─── 上传区域 ─── */
.upload-area {
  background: #fff;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.25s;
}
.upload-area:hover {
  border-color: #0066FF;
  background: rgba(0,102,255,0.02);
}
.upload-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.upload-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.25s;
  border: 1px solid;
}
.upload-trigger.image {
  background: rgba(0,200,255,0.05);
  border-color: rgba(0,200,255,0.3);
  color: #0066FF;
}
.upload-trigger.image:hover {
  background: rgba(0,200,255,0.1);
  border-color: rgba(0,200,255,0.5);
}
.upload-trigger.video {
  background: rgba(167,139,250,0.05);
  border-color: rgba(167,139,250,0.3);
  color: #a78bfa;
}
.upload-trigger.video:hover {
  background: rgba(167,139,250,0.1);
  border-color: rgba(167,139,250,0.5);
}
.upload-trigger.document {
  background: rgba(255,107,53,0.05);
  border-color: rgba(255,107,53,0.3);
  color: #ff6b35;
}
.upload-trigger.document:hover {
  background: rgba(255,107,53,0.1);
  border-color: rgba(255,107,53,0.5);
}

/* ─── 文件列表 ─── */
.file-list {
  margin-top: 16px;
}
.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
}
.total-size {
  font-weight: 400;
  color: #999;
}
.file-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  transition: all 0.2s;
}
.file-item:hover {
  background: #eeeeee;
}
.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.file-icon {
  font-size: 1.5rem;
}
.file-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.file-name {
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 500;
}
.file-size {
  font-size: 0.75rem;
  color: #999;
}
.file-remove {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(255,68,68,0.1);
  color: #ff4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.file-remove:hover {
  background: rgba(255,68,68,0.2);
}

/* ─── 文件操作按钮 ─── */
.file-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.file-download-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(0,102,255,0.1);
  color: #0066FF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  text-decoration: none;
}
.file-download-btn:hover {
  background: rgba(0,102,255,0.2);
  color: #0052cc;
}

/* ─── 侧边栏 ─── */
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 84px;
}
.sidebar-card {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 24px;
}
.sc-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: #0066FF;
  margin-bottom: 8px;
}
.sc-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

/* ─── 预览卡片 ─── */
.preview-content {
  margin-bottom: 20px;
}
.preview-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  line-height: 1.4;
}
.preview-subtitle {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}
.preview-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #666;
}
.preview-category {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(0,102,255,0.05);
  border: 1px solid rgba(0,102,255,0.2);
  border-radius: 20px;
  font-size: 0.8rem;
  color: #0066FF;
  margin-bottom: 12px;
}
.preview-preface {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-left: 3px solid #0066FF;
  border-radius: 4px;
}
.preview-stats {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.stat-val {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0066FF;
}
.stat-label {
  font-size: 0.7rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-divider {
  width: 1px;
  background: #e0e0e0;
}

.publish-btn.large {
  width: 100%;
  justify-content: center;
  margin-bottom: 10px;
  padding: 12px;
}
.draft-btn,
.load-draft-btn {
  width: 100%;
  justify-content: center;
  margin-bottom: 8px;
  padding: 10px;
}
.load-draft-btn {
  background: rgba(167,139,250,0.05);
  border: 1px solid rgba(167,139,250,0.3);
  color: #a78bfa;
}
.load-draft-btn:hover {
  background: rgba(167,139,250,0.1);
  border-color: rgba(167,139,250,0.5);
}

/* ─── 富文本编辑器 ─── */
.rich-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}
.toolbar-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
  color: #1a1a1a;
}
.toolbar-btn.active {
  background: rgba(0,102,255,0.1);
  border-color: #0066FF;
  color: #0066FF;
}

/* 文字按钮（小/中/大） */
.toolbar-btn-text {
  width: auto;
  padding: 0 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 4px;
}

.rich-editor {
  min-height: 300px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  font-size: 16px;
  line-height: 1.8;
  color: #1a1a1a;
  outline: none;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.rich-editor:empty:before {
  content: attr(placeholder);
  color: #bbb;
  pointer-events: none;
}
.rich-editor:focus {
  border-color: #0066FF;
}
.rich-editor img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
}
.rich-editor video {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
}

/* ─── 标签输入容器 ─── */
.tags-input-container {
  width: 100%;
}

.tags-input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.tag-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tag-input {
  width: 120px;
  height: 36px;
  padding: 0 32px 0 12px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #1a1a1a;
  outline: none;
  transition: all 0.2s;
}
.tag-input::placeholder {
  color: #bbb;
}
.tag-input:focus {
  border-color: #0066FF;
  background: rgba(0,102,255,0.02);
}

.tag-remove-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  padding: 0;
}
.tag-remove-btn:hover {
  background: rgba(255,71,87,0.1);
  color: #ff4757;
}

.add-tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: 1.5px dashed #ccc;
  border-radius: 20px;
  color: #999;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  height: 36px;
}
.add-tag-btn:hover {
  border-color: #0066FF;
  color: #0066FF;
  background: rgba(0,102,255,0.03);
}

/* ─── 提示列表 ─── */
.tip-list {
  list-style: none;
  padding: 0;
}
.tip-list li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.6;
}
.tip-list li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #0066FF;
  font-weight: bold;
}

/* ─── 响应式 ─── */
@media (max-width: 1024px) {
  .upload-inner {
    grid-template-columns: 1fr;
  }
  .sidebar-right {
    position: static;
  }
}

@media (max-width: 768px) {
  .upload-main {
    padding: 84px 20px 40px;
  }
  .content-block {
    padding: 24px;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .category-select {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>