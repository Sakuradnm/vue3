<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getForumPosts, createPost, type CreatePostData, getForumCategories, getForumMainCategories, type ForumCategory, type ForumMainCategory } from '@/api/forum';
import type { ForumPostItem } from '@/api/forum';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserInfo } from '@/utils/session';
import * as THREE from 'three';

const router = useRouter();

// ─ State ────────────────────────────────────────────────
const activeCategory = ref('all'); // 当前选中的分类（用于筛选帖子）
const activeMainCategory = ref(''); // 当前选中的主分类（用于切换副分类显示）
const expandedMainCategories = ref(new Set()); // 已展开的主分类ID集合
const searchQuery = ref('');
const sortBy = ref('new'); // 默认按最新排序
const sortDirection = ref<'asc' | 'desc'>('desc'); // 排序方向：desc=降序, asc=升序
const bookmarked = reactive(new Set());
const hoveredPost = ref(-1);
const mouseX = ref(0);
const mouseY = ref(0);
let particleRafId = null;
let observers = [];
let threeScene: THREE.Scene | null = null;
let threeCamera: THREE.PerspectiveCamera | null = null;
let threeRenderer: THREE.WebGLRenderer | null = null;
let threeAnimationId: number | null = null;

// ── Data ────────────────────────────────────────────────
const categories = ref<ForumCategory[]>([]);
const mainCategoriesList = ref<ForumMainCategory[]>([]);

// 计算属性：主分类列表（从 forum_main_categories 表加载，并去重）
const mainCategories = computed(() => {
  // 去重：根据 name 字段去重，保留第一个出现的
  const uniqueCategories = [];
  const seenNames = new Set();
  
  for (const cat of mainCategoriesList.value) {
    if (!seenNames.has(cat.name)) {
      seenNames.add(cat.name);
      uniqueCategories.push({
        id: cat.id,
        categoryId: String(cat.id),
        name: cat.name,
        color: '#0066FF',
        sortOrder: cat.sortOrder,
        icon: cat.icon || ''
      });
    }
  }
  
  // 按 sortOrder 排序
  uniqueCategories.sort((a, b) => a.sortOrder - b.sortOrder);
  
  return uniqueCategories;
});

// 获取指定主分类下的副分类
function getSubCategoriesForMain(mainCategoryId: string) {
  const mainCatId = parseInt(mainCategoryId);
  return categories.value.filter(cat => cat.mainCategoryId === mainCatId);
}

const allPosts = ref<ForumPostItem[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const pageSize = 10;
const currentPage = ref(1); // 当前页码

const hotTopics = computed(() => {
  // 根据 views 排序，取前10个作为热门话题
  const sorted = [...allPosts.value].sort((a, b) => b.views - a.views);
  return sorted.slice(0, 10).map((post, index) => ({
    rank: index + 1,
    id: post.id,
    title: post.title,
    views: post.views,
    color: ['#ff6b35', '#ffd93d', '#a78bfa', '#00c8ff', '#00ffb4', '#ff6b9d', '#c084fc', '#fbbf24', '#34d399', '#60a5fa'][index % 10]
  }));
});



// 计算热门帖子ID集合（前10个）
const hotPostIds = computed(() => {
  const sorted = [...allPosts.value].sort((a, b) => b.views - a.views);
  return new Set(sorted.slice(0, 10).map(post => post.id));
});

// ── Computed ─────────────────────────────────────────────
// 先对所有数据进行过滤和排序
const sortedAndFilteredPosts = computed(() => {
  let list = allPosts.value;

  // 分类过滤：使用 category 进行匹配
  if (activeCategory.value !== 'all') {
    list = list.filter(p => p.category === activeCategory.value);
  }

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p => {
      const titleMatch = p.title.toLowerCase().includes(q);
      const previewMatch = p.preview.toLowerCase().includes(q);
      const tagsArray = Array.isArray(p.tags) ? p.tags : [];
      const tagsMatch = tagsArray.some((t: string) => t.toLowerCase().includes(q));
      return titleMatch || previewMatch || tagsMatch;
    });
  }

  // 排序逻辑
  list = [...list].sort((a, b) => {
    if (sortBy.value === 'new') {
      // 最新：按创建时间排序（不需要箭头，固定降序）
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA; // 降序：新->旧（不受方向控制）
    }

    // 热度和浏览支持双向排序
    let result = 0;
    if (sortBy.value === 'hot') {
      // 热度：按点赞量排序
      result = a.likes - b.likes;
    } else if (sortBy.value === 'views') {
      // 浏览：按观看次数排序
      result = a.views - b.views;
    }

    // 根据方向调整排序
    return sortDirection.value === 'desc' ? -result : result;
  });

  return list;
});

// 分页显示：从排序后的数据中取当前页
const displayedPosts = computed(() => {
  return sortedAndFilteredPosts.value.slice(0, currentPage.value * pageSize);
});

const filteredPosts = computed(() => {
  return displayedPosts.value;
});

const activeCatData = computed(() =>
    categories.value.find(c => c.categoryId === activeCategory.value) || categories.value[0]
);

// ── Actions ───────────────────────────────────────────────
let searchTimer: number | null = null;
const forumHeroRef = ref<HTMLElement | null>(null);
const threeContainerRef = ref<HTMLElement | null>(null);
const sidebarTopOffset = ref(62); // 侧边栏动态top值

function debounceSearch() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1; // 重置页码
    fetchPosts();
  }, 500);
}

async function fetchPosts() {
  loading.value = true;
  currentPage.value = 1; // 重置页码
  try {
    const params: any = {};
    if (activeCategory.value !== 'all') {
      // 直接使用 activeCategory 作为筛选条件（对应数据库的 category 字段）
      params.category = activeCategory.value;
    }
    if (searchQuery.value.trim()) {
      params.keyword = searchQuery.value.trim();
    }
    // 添加排序参数
    params.sortBy = sortBy.value;

    const response = await getForumPosts(params);
    
    allPosts.value = response;
    updateHasMore();
    updateCategoryCounts();

  } catch (error) {
    // 静默处理错误，不输出到控制台
  } finally {
    loading.value = false;
  }
}

function updateHasMore() {
  const totalFiltered = sortedAndFilteredPosts.value.length;
  hasMore.value = currentPage.value * pageSize < totalFiltered;
}

function loadMore() {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  setTimeout(() => {
    currentPage.value++;
    updateHasMore();
    loadingMore.value = false;
  }, 300);
}

function updateCategoryCounts() {
  const counts: Record<string, number> = {};
  allPosts.value.forEach(post => {
    counts[post.category] = (counts[post.category] || 0) + 1;
  });
  categories.value.forEach(cat => {
    if (cat.categoryId === 'all') {
      // "全部"不显示数量
    } else {
      cat.count = counts[cat.categoryId] || 0;
    }
  });
}


function toggleBookmark(id) {
  if (bookmarked.has(id)) bookmarked.delete(id);
  else bookmarked.add(id);
}

function goToDetail(postId: number) {
  router.push(`/forum/${postId}`);
}

function goToUpload() {
  const userInfo = getUserInfo();
  if (!userInfo) {
    ElMessageBox.confirm(
      '需要登录后才能访问，是否前往登录？',
      '提示',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      }
    ).then(() => {
      router.push('/Users');
    }).catch(() => {
      // 用户取消，不做任何操作
    });
    return;
  }
  router.push('/Forum/Upload');
}

// 选择主分类（展开/收起）
function toggleMainCategory(categoryId: string) {
  if (expandedMainCategories.value.has(categoryId)) {
    // 如果已展开，则收起
    expandedMainCategories.value.delete(categoryId);
  } else {
    // 如果未展开，则展开
    expandedMainCategories.value.add(categoryId);
  }
  // 同时设置为活动主分类
  activeMainCategory.value = categoryId;
}

// 选择副分类
function selectSubCategory(categoryId: string) {
  activeCategory.value = categoryId;
}

// 重置筛选（显示全部数据）
function resetFilter() {
  activeCategory.value = 'all';
  activeMainCategory.value = '';
  expandedMainCategories.value.clear();
  searchQuery.value = '';
  sortBy.value = 'new';
  sortDirection.value = 'desc';
  currentPage.value = 1;
  fetchPosts();
}

function fmtNum(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
}

// 获取分类颜色（用于帖子标签）
function getCategoryColor(categoryId: string): string {
  const category = categories.value.find(c => c.categoryId === categoryId);
  return category?.color || '#0066FF';
}

function highlightText(text: string, query: string) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="highlight">$1</mark>');
}

// 切换排序方向
function toggleSortDirection(sortType: string) {
  // 最新排序不需要箭头，固定降序
  if (sortType === 'new') {
    sortBy.value = 'new';
    sortDirection.value = 'desc';
    return;
  }

  // 如果点击的是当前排序类型，切换方向
  if (sortBy.value === sortType) {
    sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc';
  } else {
    // 切换到新的排序类型，默认降序
    sortBy.value = sortType;
    sortDirection.value = 'desc';
  }
}

// ── 侧边栏滚动跟随逻辑 ───────────────────────────────────
function updateSidebarTopOffset() {
  if (!forumHeroRef.value) {
    sidebarTopOffset.value = 62;
    return;
  }
  const heroRect = forumHeroRef.value.getBoundingClientRect();
  const heroBottom = heroRect.bottom;
  // 当 forum-hero 底部未滚出导航栏范围时，侧边栏跟随 hero 底部对齐
  // 当 hero 底部 ≤ 导航栏高度(62px)时，侧边栏固定在导航栏底部
  if (heroBottom <= 62) {
    sidebarTopOffset.value = 62;
  } else {
    sidebarTopOffset.value = heroBottom;
  }
}

// ─ Three.js 3D 场景初始化 - 知识分享主题 ───────────────────────────────
function initThreeScene() {
  if (!threeContainerRef.value) return;
  
  const container = threeContainerRef.value;
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // 创建场景
  threeScene = new THREE.Scene();
  
  // 创建相机
  threeCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  threeCamera.position.set(0, 1, 9);
  threeCamera.lookAt(0, 0, 0);
  
  // 创建渲染器
  threeRenderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true 
  });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(threeRenderer.domElement);
  
  // ══ 知识分享主题效果 ══
  
  // 1. 创建书本几何体
  function createBook(width, height, depth) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    // 调整顶点以模拟打开的书本
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      // 书页弯曲效果
      if (x > 0) {
        positions[i + 2] = z + Math.abs(x) * 0.3;
      } else {
        positions[i + 2] = z - Math.abs(x) * 0.3;
      }
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }
  
  // 2. 创建多本 floating books
  const books = [];
  const bookColors = [0x0066FF, 0x00ffb4, 0xffd93d, 0xa78bfa, 0x00c8ff];
  const bookCount = 15;
  
  for (let i = 0; i < bookCount; i++) {
    const bookWidth = 0.6 + Math.random() * 0.4;
    const bookHeight = 0.8 + Math.random() * 0.3;
    const bookDepth = 0.15 + Math.random() * 0.1;
    
    const bookGeometry = createBook(bookWidth, bookHeight, bookDepth);
    const bookMaterial = new THREE.MeshPhongMaterial({
      color: bookColors[i % bookColors.length],
      emissive: bookColors[i % bookColors.length],
      emissiveIntensity: 0.2,
      shininess: 80,
      transparent: true,
      opacity: 0.85
    });
    
    const book = new THREE.Mesh(bookGeometry, bookMaterial);
    
    // 随机位置
    book.position.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 6 - 2
    );
    
    // 随机旋转
    book.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    // 存储动画参数
    book.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.008
      },
      floatSpeed: 0.5 + Math.random() * 0.5,
      floatAmplitude: 0.5 + Math.random() * 0.8,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: book.position.y
    };
    
    threeScene.add(book);
    books.push(book);
  }
  
  // 3. 创建知识节点（球体）
  const knowledgeNodes = [];
  const nodeCount = 30;
  
  for (let i = 0; i < nodeCount; i++) {
    const nodeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const nodeMaterial = new THREE.MeshPhongMaterial({
      color: i % 2 === 0 ? 0x0066FF : 0x00ffb4,
      emissive: i % 2 === 0 ? 0x003366 : 0x006655,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.9
    });
    
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 9,
      (Math.random() - 0.5) * 8 - 2
    );
    
    node.userData = {
      pulseSpeed: 1 + Math.random() * 2,
      pulsePhase: Math.random() * Math.PI * 2,
      connectionDistance: 3
    };
    
    threeScene.add(node);
    knowledgeNodes.push(node);
  }
  
  // 4. 创建连接线（知识网络）
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0066FF,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  });
  
  const lines = [];
  
  // 5. 创建数据流粒子（知识传递）
  const dataStreams = [];
  const streamCount = 40;
  
  for (let i = 0; i < streamCount; i++) {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(15 * 3); // 15个点组成轨迹
    
    const startX = (Math.random() - 0.5) * 16;
    const startY = (Math.random() - 0.5) * 9;
    const startZ = (Math.random() - 0.5) * 8 - 2;
    
    for (let j = 0; j < 15; j++) {
      positions[j * 3] = startX + (Math.random() - 0.5) * 0.2;
      positions[j * 3 + 1] = startY + (Math.random() - 0.5) * 0.2;
      positions[j * 3 + 2] = startZ + (Math.random() - 0.5) * 0.2;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      color: Math.random() > 0.5 ? 0x00ffb4 : 0xffd93d,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    
    const stream = new THREE.Points(particleGeometry, particleMaterial);
    stream.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.015
      ),
      life: Math.random() * 100,
      maxLife: 150 + Math.random() * 50
    };
    
    threeScene.add(stream);
    dataStreams.push(stream);
  }
  
  // 6. 创建引号符号装饰（知识引用）
  const quoteMarks = [];
  const quotePositions = [
    { x: -6, y: 3, z: -3 },
    { x: 6, y: -2, z: -2 },
    { x: -4, y: -3, z: -1 },
    { x: 5, y: 3, z: -4 }
  ];
  
  quotePositions.forEach((pos, index) => {
    // 使用简单的几何体组合成引号形状
    const group = new THREE.Group();
    
    const bar1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.6, 0.1),
      new THREE.MeshBasicMaterial({
        color: 0x0066FF,
        transparent: true,
        opacity: 0.3
      })
    );
    bar1.position.x = -0.15;
    
    const bar2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.6, 0.1),
      new THREE.MeshBasicMaterial({
        color: 0x0066FF,
        transparent: true,
        opacity: 0.3
      })
    );
    bar2.position.x = 0.15;
    
    group.add(bar1, bar2);
    group.position.set(pos.x, pos.y, pos.z);
    group.rotation.z = Math.PI / 6;
    
    group.userData = {
      rotationSpeed: 0.2 + index * 0.1,
      floatSpeed: 0.8 + index * 0.2,
      floatPhase: index * Math.PI / 2
    };
    
    threeScene.add(group);
    quoteMarks.push(group);
  });
  
  // 7. 添加光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  threeScene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(5, 10, 7);
  threeScene.add(directionalLight);
  
  const pointLight1 = new THREE.PointLight(0x0066FF, 0.6, 20);
  pointLight1.position.set(-6, 4, 5);
  threeScene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0x00ffb4, 0.5, 20);
  pointLight2.position.set(6, -3, 4);
  threeScene.add(pointLight2);
  
  // 动画循环
  function animate() {
    threeAnimationId = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // 更新书本
    books.forEach(book => {
      const data = book.userData;
      
      // 缓慢旋转
      book.rotation.x += data.rotationSpeed.x;
      book.rotation.y += data.rotationSpeed.y;
      book.rotation.z += data.rotationSpeed.z;
      
      // 上下浮动
      book.position.y = data.baseY + Math.sin(time * data.floatSpeed + data.floatOffset) * data.floatAmplitude;
    });
    
    // 更新知识节点
    knowledgeNodes.forEach((node, i) => {
      const data = node.userData;
      
      // 脉冲效果
      const scale = 1 + Math.sin(time * data.pulseSpeed + data.pulsePhase) * 0.3;
      node.scale.set(scale, scale, scale);
      node.material.emissiveIntensity = 0.3 + Math.sin(time * data.pulseSpeed + data.pulsePhase) * 0.2;
      
      // 缓慢移动
      node.position.x += Math.sin(time * 0.3 + i) * 0.003;
      node.position.y += Math.cos(time * 0.25 + i) * 0.003;
    });
    
    // 动态创建和更新连接线
    // 清除旧线
    lines.forEach(line => threeScene.remove(line));
    lines.length = 0;
    
    // 创建新线（距离近的节点之间）
    for (let i = 0; i < knowledgeNodes.length; i++) {
      for (let j = i + 1; j < knowledgeNodes.length; j++) {
        const nodeA = knowledgeNodes[i];
        const nodeB = knowledgeNodes[j];
        const distance = nodeA.position.distanceTo(nodeB.position);
        
        if (distance < 3.5) {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            nodeA.position,
            nodeB.position
          ]);
          
          const lineMat = lineMaterial.clone();
          lineMat.opacity = 0.15 * (1 - distance / 3.5);
          
          const line = new THREE.Line(lineGeometry, lineMat);
          threeScene.add(line);
          lines.push(line);
        }
      }
    }
    
    // 更新数据流
    dataStreams.forEach(stream => {
      const positions = stream.geometry.attributes.position.array;
      const vel = stream.userData.velocity;
      
      // 移动所有点
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += vel.x;
        positions[i * 3 + 1] += vel.y;
        positions[i * 3 + 2] += vel.z;
        
        // 边界检测
        if (Math.abs(positions[i * 3]) > 9 || Math.abs(positions[i * 3 + 1]) > 5) {
          positions[i * 3] = (Math.random() - 0.5) * 16;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
        }
      }
      
      stream.geometry.attributes.position.needsUpdate = true;
      stream.userData.life++;
      
      // 生命周期管理
      const lifeRatio = stream.userData.life / stream.userData.maxLife;
      stream.material.opacity = 0.7 * (1 - lifeRatio);
      
      if (stream.userData.life >= stream.userData.maxLife) {
        stream.userData.life = 0;
        stream.material.opacity = 0.7;
      }
    });
    
    // 更新引号装饰
    quoteMarks.forEach((quote, i) => {
      const data = quote.userData;
      quote.rotation.z = Math.PI / 6 + Math.sin(time * data.rotationSpeed) * 0.1;
      quote.position.y += Math.sin(time * data.floatSpeed + data.floatPhase) * 0.005;
    });
    
    // 光源移动
    pointLight1.position.x = Math.sin(time * 0.3) * 7;
    pointLight1.position.y = 4 + Math.cos(time * 0.25) * 2;
    
    pointLight2.position.x = Math.cos(time * 0.35) * 6;
    pointLight2.position.z = 4 + Math.sin(time * 0.28) * 2;
    
    // 相机缓慢移动
    threeCamera.position.x = Math.sin(time * 0.08) * 1.2;
    threeCamera.position.y = 1 + Math.cos(time * 0.06) * 0.6;
    threeCamera.lookAt(0, 0, 0);
    
    threeRenderer.render(threeScene, threeCamera);
  }
  
  animate();
  
  // 响应窗口大小变化
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  if (!threeContainerRef.value || !threeCamera || !threeRenderer) return;
  
  const width = threeContainerRef.value.clientWidth;
  const height = threeContainerRef.value.clientHeight;
  
  threeCamera.aspect = width / height;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(width, height);
}

function cleanupThreeScene() {
  if (threeAnimationId) {
    cancelAnimationFrame(threeAnimationId);
    threeAnimationId = null;
  }
  
  if (threeRenderer) {
    threeRenderer.dispose();
    if (threeContainerRef.value && threeRenderer.domElement) {
      threeContainerRef.value.removeChild(threeRenderer.domElement);
    }
    threeRenderer = null;
  }
  
  if (threeScene) {
    threeScene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    threeScene = null;
  }
  
  threeCamera = null;
  window.removeEventListener('resize', onWindowResize);
}

// ── Particles ─────────────────────────────────────────────
function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  const count = Math.floor((W * H) / 12000);
  const pts = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
    r: Math.random() * 1.1 + 0.3,
    alpha: Math.random() * 0.35 + 0.08,
    color: ['0,255,180', '0,200,255', '80,255,200'][Math.floor(Math.random() * 3)],
  }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,255,180,${0.04 * (1 - d / 110)})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    }
    particleRafId = requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });
}

function initObservers(root) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  root.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  observers.push(obs);
}

function onMouseMove(e) {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
}

function handleScroll() {
  // 滚动加载更多
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  if (scrollHeight - scrollTop - clientHeight < 200) {
    loadMore();
  }
  // 更新侧边栏位置
  updateSidebarTopOffset();
}

// 发帖功能
async function submitPost() {
  // 验证表单
  if (!composeForm.title.trim()) {
    ElMessage.warning('请输入帖子标题');
    return;
  }
  if (!composeForm.content.trim()) {
    ElMessage.warning('请输入帖子内容');
    return;
  }

  // 获取当前用户信息
  const userInfo = getUserInfo();
  if (!userInfo) {
    ElMessage.warning('请先登录后再发布帖子');
    showCompose.value = false;
    return;
  }
  const selectedCat = categories.find(c => c.id === composeForm.category);

  // 生成预览（取内容前100字符）
  const preview = composeForm.content.substring(0, 100) + (composeForm.content.length > 100 ? '...' : '');

  // 处理标签
  const tagsArray = composeForm.tags.trim()
      .split(/[,，\s]+/)
      .filter(t => t.length > 0)
      .slice(0, 5); // 最多5个标签

  const postData: CreatePostData = {
    userId: userInfo.id,
    category: composeForm.category,
    categoryLabel: selectedCat?.name || '其他',
    title: composeForm.title.trim(),
    preview: preview,
    content: composeForm.content.trim(),
    tags: tagsArray
  };

  try {
    const newPost = await createPost(postData);
    ElMessage.success('发帖成功！');

    // 重置表单
    composeForm.title = '';
    composeForm.category = 'frontend';
    composeForm.content = '';
    composeForm.tags = '';
    showCompose.value = false;

    // 重新加载帖子列表
    await fetchPosts();

    // 切换到最新排序，确保能看到新帖子
    sortBy.value = 'new';
    sortDirection.value = 'desc';
  } catch (error) {
    ElMessage.error('发帖失败，请重试');
  }
}

onMounted(() => {
  const root = document.querySelector('.forum-root');
  const canvas = root?.querySelector('.bg-canvas');
  if (canvas) initParticles(canvas);
  if (root) initObservers(root);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', updateSidebarTopOffset);
  updateSidebarTopOffset();
  
  // 初始化 Three.js 3D 场景
  initThreeScene();
  
  // 加载分类列表
  loadCategories();
  
  // 初始加载帖子
  fetchPosts();
});

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
    // 静默处理错误
  }
}

watch([activeCategory, activeMainCategory, sortBy, sortDirection], () => {
  currentPage.value = 1; // 重置页码
  fetchPosts();
});

onUnmounted(() => {
  if (particleRafId) cancelAnimationFrame(particleRafId);
  observers.forEach(o => o.disconnect());
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', updateSidebarTopOffset);
  
  // 清理 Three.js 场景
  cleanupThreeScene();
});
</script>

<template>
  <div class="forum-root">
    <canvas class="bg-canvas"></canvas>
    <div class="noise-layer"></div>
    <div class="cursor-glow" :style="`left:${mouseX}px;top:${mouseY}px`"></div>

    <!-- ══ NAV ════════════════════════════════════════════ -->
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
        <div class="nav-sep"></div>
        <div class="nav-breadcrumb">
          <a href="#">首页</a>
          <span>›</span>
          <span class="bc-current">知识论坛</span>
        </div>
      </div>
      <div class="nav-search">
        <div class="search-wrap">
          <svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" @input="debounceSearch" placeholder="搜索帖子、标签、作者…" class="search-input"/>
          <span v-if="searchQuery" class="s-clear" @click="searchQuery = ''">✕</span>
        </div>
      </div>
      <div class="nav-right">
        <button class="compose-btn" @click="goToUpload">
          <span class="cb-sweep"></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          发布帖子
        </button>
      </div>
    </nav>

    <!-- ══ FORUM HERO ═════════════════════════════════════ -->
    <header class="forum-hero fade-up" ref="forumHeroRef">
      <div class="fh-bg-grid"></div>
      <div class="fh-inner">
        <div class="fh-tag">[ KNOWLEDGE FORUM ]</div>
        <h1 class="fh-title">
          <span class="fht-a">知识</span>
          <span class="fht-b">共振</span>
          <span class="fht-c">· SIGNAL EXCHANGE</span>
        </h1>
        <p class="fh-sub">提问、分享、讨论——让每一个问题都找到答案，让每一份知识都产生回响</p>
        <div class="fh-live-stats">
          <div v-for="s in [
            { val: '128', label: '活跃帖子', icon: '◈' },
            { val: '4.2k', label: '本月回复', icon: '◉' },
            { val: '892', label: '活跃用户', icon: '◆' },
          ]" :key="s.label" class="fh-stat">
            <span class="fhs-icon">{{ s.icon }}</span>
            <span class="fhs-val">{{ s.val }}</span>
            <span class="fhs-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
          
      <!-- 右侧 Three.js 3D 装饰 -->
      <div class="fh-deco-right" ref="threeContainerRef"></div>
          
      <div class="fh-rings">
        <div class="fhr fhr-1"></div>
        <div class="fhr fhr-2"></div>
      </div>
    </header>

    <!-- ══ MAIN LAYOUT ════════════════════════════════════ -->
    <div class="forum-layout">

      <!-- ── SIDEBAR LEFT ─────────────────────────────── -->
      <aside class="sidebar-left fade-up">
        <div class="sl-section">
          <div class="sl-title">[ 全部分类 ]</div>
          <div class="cat-list">
            <!-- 全部按钮（重置筛选） -->
            <button class="cat-item main-cat-item"
                    :class="{ active: activeCategory === 'all' }"
                    style="--cc:#0066FF"
                    @click="resetFilter">
              <span class="ci-icon">◈</span>
              <span class="ci-label">全部</span>
              <div class="ci-bar"></div>
            </button>
            
            <!-- 遍历每个主分类 -->
            <template v-for="mainCat in mainCategories" :key="mainCat.id">
              <!-- 主分类按钮 -->
              <button class="cat-item main-cat-item"
                      :class="{ active: activeMainCategory === mainCat.categoryId, expanded: expandedMainCategories.has(mainCat.categoryId) }"
                      :style="`--cc:${mainCat.color}`"
                      @click="toggleMainCategory(mainCat.categoryId)">
                <span class="ci-icon">{{ expandedMainCategories.has(mainCat.categoryId) ? '▼' : '▶' }}</span>
                <span class="ci-label">{{ mainCat.name }}</span>
                <div class="ci-bar"></div>
              </button>
              
              <!-- 副分类列表（仅当该主分类展开时显示） -->
              <div v-if="expandedMainCategories.has(mainCat.categoryId) && getSubCategoriesForMain(mainCat.categoryId).length > 0"
                   class="sub-categories-wrapper">
                <button v-for="subCat in getSubCategoriesForMain(mainCat.categoryId)" :key="subCat.id"
                        class="cat-item sub-cat-item"
                        :class="{ active: activeCategory === subCat.categoryId }"
                        :style="`--cc:${subCat.color}`"
                        @click="selectSubCategory(subCat.categoryId)">
                  <span class="ci-label">{{ subCat.name }}</span>
                  <div class="ci-bar"></div>
                </button>
              </div>
            </template>
          </div>
        </div>
      </aside>

      <!-- ── MAIN CONTENT ──────────────────────────────── -->
      <main class="main-content">

        <!-- Toolbar -->
        <div class="toolbar fade-up">
          <div class="tb-left">
            <!-- 发帖按钮 -->
            <button class="tb-compose-btn" @click="goToUpload">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              发帖
            </button>

            <div class="search-input-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                  v-model="searchQuery"
                  @input="debounceSearch"
                  type="text"
                  class="tb-search-input"
                  placeholder="输入关键词搜索..."
              />
              <span v-if="searchQuery" class="search-clear" @click="searchQuery=''; debounceSearch()">✕</span>
            </div>
            <span v-if="activeCategory !== 'all'" class="tb-active-cat"
                  :style="`color:${activeCatData.color};border-color:${activeCatData.color}33;background:${activeCatData.color}0d`">
              {{ activeCatData.icon }} {{ activeCatData.name }}
              <span @click="activeCategory='all'" style="cursor:pointer;margin-left:0.4rem;opacity:0.6">✕</span>
            </span>
          </div>
          <div class="tb-right">
            <div class="sort-group">
              <!-- 最新（无箭头，固定降序） -->
              <button class="sort-btn" :class="{ active: sortBy === 'new' }"
                      @click="toggleSortDirection('new')">
                最新
              </button>

              <!-- 热度（带箭头） -->
              <button class="sort-btn" :class="{ active: sortBy === 'hot' }"
                      @click="toggleSortDirection('hot')">
                热度
                <svg v-if="sortBy === 'hot'" class="sort-arrow" viewBox="0 0 24 24" fill="currentColor">
                  <path v-if="sortDirection === 'desc'" d="M7 10l5 5 5-5z"/>
                  <path v-else d="M7 14l5-5 5 5z"/>
                </svg>
              </button>

              <!-- 浏览（带箭头） -->
              <button class="sort-btn" :class="{ active: sortBy === 'views' }"
                      @click="toggleSortDirection('views')">
                浏览
                <svg v-if="sortBy === 'views'" class="sort-arrow" viewBox="0 0 24 24" fill="currentColor">
                  <path v-if="sortDirection === 'desc'" d="M7 10l5 5 5-5z"/>
                  <path v-else d="M7 14l5-5 5 5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Post list -->
        <div v-if="loading" class="loading-state fade-up visible">
          <div class="loading-spinner">◈</div>
          <p>加载中...</p>
        </div>

        <transition-group v-else name="post-list" tag="div" class="posts-list">
          <article v-for="(post, i) in filteredPosts" :key="post.id"
                   class="post-card fade-up visible"
                   :style="`animation-delay:${i * 0.06}s`"
                   @click="goToDetail(post.id)"
                   @mouseenter="hoveredPost = post.id"
                   @mouseleave="hoveredPost = -1">

            <div class="pc-layout">
              <!-- Left: stats -->
              <div class="pc-vote">
                <div class="vote-display">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3z"/>
                    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                  </svg>
                  <span>{{ fmtNum(post.likes) }}</span>
                </div>
                <div class="vote-sep"></div>
                <div class="pc-comments-n">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  {{ post.comments }}
                </div>
              </div>

              <!-- Right: content -->
              <div class="pc-body">
                <div class="pc-meta">
                  <span class="pc-cat" :style="`
                    --cat-color: ${getCategoryColor(post.category)};
                    color: var(--cat-color);
                    border-color: var(--cat-color)33;
                    background: var(--cat-color)0d
                  `">
                    {{ post.categoryLabel }}
                  </span>
                  <span v-if="hotPostIds.has(post.id)" class="pc-hot">🔥 HOT</span>
                  <span v-if="post.solved" class="pc-solved">✓ SOLVED</span>
                </div>

                <h2 class="pc-title" v-html="highlightText(post.title, searchQuery)"></h2>
                <p class="pc-preview" v-html="highlightText(post.preview, searchQuery)"></p>

                <div class="pc-tags">
                  <span v-for="tag in (Array.isArray(post.tags) ? post.tags : [])" :key="tag" class="pc-tag"># {{ tag }}</span>
                </div>

                <div class="pc-footer">
                  <div class="pcf-author">
                    <div class="pcf-avatar">
                      <img v-if="post.avatar" :src="post.avatar" :alt="post.author" />
                      <span v-else>{{ post.author?.charAt(0)?.toUpperCase() }}</span>
                    </div>
                    <div class="pcf-info">
                      <span class="pcf-name">{{ post.author }}</span>
                      <span class="pcf-time">{{ post.timeAgo }}</span>
                    </div>
                  </div>
                  <div class="pcf-actions">
                    <span class="pcf-views">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {{ fmtNum(post.views) }}
                    </span>
                    <button class="pcf-bookmark"
                            :class="{ active: bookmarked.has(post.id) }"
                            @click.stop="toggleBookmark(post.id)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>
                    <button class="pcf-share" @click.stop>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hover progress bar -->
            <div class="pc-progress"
                 :style="`width:${hoveredPost === post.id ? '100%' : '0'}; background: linear-gradient(90deg, ${getCategoryColor(post.category)}, ${getCategoryColor(post.category)}cc); box-shadow: 0 0 8px ${getCategoryColor(post.category)}66`">
            </div>

            <!-- Corner deco -->
            <div class="pc-corner tl"></div>
            <div class="pc-corner br"></div>
          </article>
        </transition-group>

        <!-- Empty state -->
        <div v-if="filteredPosts.length === 0" class="empty-state fade-up visible">
          <div class="es-icon">◈</div>
          <p class="es-title">未找到匹配内容</p>
          <p class="es-sub">尝试不同的关键词或分类</p>
        </div>

        <!-- Loading more indicator -->
        <div v-if="loadingMore" class="load-more fade-up visible">
          <div class="loading-spinner">◈</div>
          <p>加载中...</p>
        </div>

        <!-- No more data -->
        <div v-if="!hasMore && filteredPosts.length > 0" class="load-more fade-up visible">
          <p style="color: rgba(150,210,180,0.35); font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;">暂无更多内容</p>
        </div>
      </main>

      <!-- ── SIDEBAR RIGHT ─────────────────────────────── -->
      <aside class="sidebar-right fade-up">
        <div class="sr-section">
          <div class="sr-title">[ TODAY'S ACTIVITY ]</div>
          <div class="activity-chart">
            <div v-for="(h, i) in [3,7,5,9,6,12,8,14,10,7,11,9,6,4,8,11,7,5,9,13,10,8,6,4]"
                 :key="i" class="ac-bar"
                 :style="`height:${h * 4}px;animation-delay:${i*0.04}s`">
            </div>
          </div>
          <div class="ac-labels">
            <span>00:00</span><span>12:00</span><span>24:00</span>
          </div>
        </div>

        <div class="sr-section">
          <div class="sr-title">[ TAG CLOUD ]</div>
          <div class="tag-cloud">
            <span v-for="t in [
              {name:'Vue3', w:700},
              {name:'算法', w:800},
              {name:'TypeScript', w:600},
              {name:'React', w:650},
              {name:'Node.js', w:550},
              {name:'设计模式', w:500},
              {name:'面试', w:900},
              {name:'CSS', w:600},
              {name:'Python', w:580},
              {name:'架构', w:620},
            ]" :key="t.name"
                  class="tc-tag"
                  :style="`font-size:${0.5 + (t.w/900)*0.35}rem;opacity:${0.4 + (t.w/900)*0.5}`">
              {{ t.name }}
            </span>
          </div>
        </div>


        <div class="sr-section">
          <div class="sr-title">[ HOT TOPICS ]</div>
          <div class="hot-list">
            <div v-for="t in hotTopics" :key="t.rank" class="hot-item" @click="goToDetail(t.id)" style="cursor: pointer;">
              <span class="hi-rank" :style="`color:${t.color}`">{{ String(t.rank).padStart(2,'0') }}</span>
              <div class="hi-content">
                <span class="hi-title">{{ t.title }}</span>
                <span class="hi-replies">{{ fmtNum(t.views) }} 浏览</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

/* ─── RESET ───────────────────────────────────────────── */
*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

.forum-root {
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
.nav-sep {
  width: 1px; height: 22px;
  background: rgba(0,102,255,0.1);
}
.nav-breadcrumb {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.58rem;
  letter-spacing: 0.1em; color: rgba(150,210,180,0.35);
}
.nav-breadcrumb a { color: rgba(150,210,180,0.35); text-decoration: none; transition: color 0.2s; }
.nav-breadcrumb a:hover { color: #00ffb4; }
.bc-current { color: #00ffb4; }

.nav-search { flex: 1; max-width: 380px; margin: 0 2rem; }
.search-wrap {
  position: relative;
  display: flex; align-items: center;
}
.s-icon {
  position: absolute; left: 0.85rem;
  width: 14px; height: 14px; color: rgba(150,210,180,0.35);
}
.search-input {
  width: 100%; height: 36px;
  background: rgba(0, 102, 255, 0.05);
  border: 1px solid rgba(0, 102, 255, 0.15);
  color: #1a1a1a;
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  letter-spacing: 0.08em;
  padding: 0 2.4rem 0 2.4rem;
  outline: none;
  transition: border-color 0.25s, background 0.25s;
  clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
}
.search-input::placeholder { color: rgba(26, 26, 26, 0.5); }
.search-input:focus {
  border-color: rgba(0, 102, 255, 0.4);
  background: rgba(0, 102, 255, 0.08);
}
.s-clear {
  position: absolute; right: 0.8rem;
  font-size: 0.6rem; color: rgba(150,210,180,0.35);
  cursor: pointer; transition: color 0.2s;
}
.s-clear:hover { color: #00ffb4; }

.nav-right { display: flex; align-items: center; gap: 1.2rem; }

.compose-btn {
  display: flex; align-items: center; gap: 0.55rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  letter-spacing: 0.12em; color: #000;
  background: #00ffb4; border: none; cursor: pointer;
  padding: 0.55rem 1.2rem;
  position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
  transition: background 0.3s, box-shadow 0.3s;
}
.compose-btn:hover {
  background: #fff;
  box-shadow: 0 0 30px rgba(0,255,180,0.45);
}
.compose-btn svg { width: 14px; height: 14px; }
.cb-sweep {
  position: absolute; top:0; left:-100%; width:60%; height:100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s cubic-bezier(0.25,1,0.5,1);
}
.compose-btn:hover .cb-sweep { left: 150%; }

/* ─── COMPOSE MODAL ──────────────────────────────────── */
.compose-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.compose-modal {
  width: 580px; max-width: 95vw;
  background: #ffffff;
  border: 1px solid rgba(0,102,255,0.2);
  position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));
}
.cm-header {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.4rem 1.8rem;
  border-bottom: 1px solid rgba(0,102,255,0.1);
}
.cm-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 0.55rem;
  letter-spacing: 0.2em; color: #0066FF; opacity: 0.7;
}
.cm-title {
  font-family: 'Orbitron', sans-serif; font-size: 0.85rem;
  font-weight: 700; letter-spacing: 0.14em; color: #1a1a1a;
  flex: 1;
}
.cm-close {
  background: none; border: none; color: rgba(26,26,26,0.4);
  font-size: 0.75rem; cursor: pointer;
  transition: color 0.2s;
}
.cm-close:hover { color: #0066FF; }

.cm-body { padding: 1.8rem; display: flex; flex-direction: column; gap: 1rem; }
.cm-field {
  width: 100%; height: 40px;
  background: rgba(0,102,255,0.03);
  border: 1px solid rgba(0,102,255,0.1);
  color: #1a1a1a; font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem; letter-spacing: 0.08em;
  padding: 0 1rem; outline: none;
  transition: border-color 0.25s;
}
.cm-field::placeholder { color: rgba(26,26,26,0.4); }
.cm-field:focus { border-color: rgba(0,102,255,0.3); }
.cm-textarea {
  width: 100%; resize: vertical;
  background: rgba(0,102,255,0.03);
  border: 1px solid rgba(0,102,255,0.1);
  color: #1a1a1a; font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.8rem; line-height: 1.7;
  padding: 0.85rem 1rem; outline: none;
  transition: border-color 0.25s;
}
.cm-textarea::placeholder { color: rgba(26,26,26,0.4); }
.cm-textarea:focus { border-color: rgba(0,102,255,0.3); }

.cm-cats { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.cm-cat-btn {
  font-family: 'JetBrains Mono', monospace; font-size: 0.56rem;
  letter-spacing: 0.1em;
  color: var(--cc, #0066FF);
  background: rgba(0,102,255,0.03);
  border: 1px solid rgba(0,102,255,0.1);
  padding: 0.3rem 0.75rem; cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.cm-cat-btn:hover {
  background: rgba(0,102,255,0.08);
  border-color: var(--cc, #0066FF);
}
.cm-cat-active {
  background: rgba(0,102,255,0.1) !important;
  border-color: var(--cc, #0066FF) !important;
  box-shadow: 0 0 10px rgba(0,102,255,0.15);
}

.cm-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1.2rem 1.8rem;
  border-top: 1px solid rgba(0,102,255,0.1);
}
.cm-cancel {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  letter-spacing: 0.1em; color: rgba(26,26,26,0.5);
  background: none; border: 1px solid rgba(0,102,255,0.1);
  padding: 0.55rem 1.2rem; cursor: pointer;
  transition: color 0.25s, border-color 0.25s;
}
.cm-cancel:hover { color: #1a1a1a; border-color: rgba(0,102,255,0.3); }
.cm-submit {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  letter-spacing: 0.12em; color: #000;
  background: #00ffb4; border: none; cursor: pointer;
  padding: 0.55rem 1.5rem;
  position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px));
  transition: background 0.3s, box-shadow 0.3s;
}
.cm-submit:hover { background: #fff; box-shadow: 0 0 20px rgba(0,255,180,0.4); }
.cm-deco {
  position: absolute; right: -40px; bottom: -40px;
  width: 120px; height: 120px;
  border: 1px solid rgba(0,255,180,0.06);
  border-radius: 50%;
}
.modal-fade-enter-active,.modal-fade-leave-active { transition: opacity 0.3s; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity: 0; }

/* ─── FORUM HERO ─────────────────────────────────────── */
.forum-hero {
  position: relative; z-index: 2;
  padding: 90px 10rem 3rem;
  border-bottom: 1px solid rgba(0,255,180,0.08);
  overflow: hidden;
}
.fh-bg-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(0,255,180,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,180,0.025) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(ellipse 90% 100% at 50% 0%, black 30%, transparent 100%);
}
.fh-inner { position: relative; z-index: 2; }
.fh-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 0.56rem;
  letter-spacing: 0.28em; color: #00ffb4; opacity: 0.65;
  margin-bottom: 0.8rem;
}
.fh-title {
  display: flex; align-items: baseline; gap: 0.8rem;
  margin-bottom: 0.8rem; flex-wrap: wrap;
}
.fht-a {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900; letter-spacing: 0.06em;
  color: transparent; -webkit-text-stroke: 1.5px rgba(0,255,180,0.3);
}
.fht-b {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900; letter-spacing: 0.04em;
  background: linear-gradient(95deg, #00ffb4 0%, #00c8ff 60%, #fff 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 40px rgba(0,255,180,0.4));
}
.fht-c {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  letter-spacing: 0.22em; color: rgba(150,210,180,0.35);
  align-self: flex-end; padding-bottom: 0.5rem;
}
.fh-sub {
  font-size: 0.86rem; color: rgba(150,210,180,0.55);
  font-weight: 300; margin-bottom: 2rem;
}
.fh-live-stats {
  display: flex; gap: 2.5rem; align-items: center;
}
.fh-stat {
  display: flex; align-items: center; gap: 0.6rem;
}
.fhs-icon { color: #00ffb4; font-size: 0.75rem; opacity: 0.7; }
.fhs-val {
  font-family: 'Orbitron', sans-serif; font-size: 1.1rem;
  font-weight: 700; color: #00ffb4;
  filter: drop-shadow(0 0 8px rgba(0,255,180,0.4));
}
.fhs-label {
  font-family: 'JetBrains Mono', monospace; font-size: 0.54rem;
  letter-spacing: 0.12em; color: rgba(150,210,180,0.35);
}

.fh-rings {
  position: absolute; right: 4vw; top: 50%;
  transform: translateY(-50%);
  pointer-events: none; z-index: 1;
}
.fhr {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(0,255,180,0.04);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
}
.fhr-1 { width: 300px; height: 300px; animation: spin1 20s linear infinite; }
.fhr-2 { width: 450px; height: 450px; animation: spin1 32s linear infinite reverse; }
@keyframes spin1 {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to   { transform: translate(-50%,-50%) rotate(360deg); }
}

/* 右侧 Three.js 3D 装饰区域 */
.fh-deco-right {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 960px;
  height: 500px;
  pointer-events: none;
  z-index: 2;
  background: radial-gradient(ellipse at center, rgba(0, 102, 255, 0.02) 0%, transparent 70%);
  overflow: hidden;
}

.fh-deco-right::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 30% 40%, rgba(0, 102, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(0, 255, 180, 0.02) 0%, transparent 50%);
  animation: knowledgeGlow 10s ease-in-out infinite;
}

@keyframes knowledgeGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* ─── LAYOUT ─────────────────────────────────────────── */
.forum-layout {
  position: relative; z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 220px 0 230px; /* 调整左右padding以匹配新的侧边栏宽度 */
}

/* ─── SIDEBAR SHARED ─────────────────────────────────── */
.sidebar-left, .sidebar-right {
  position: fixed;           /* 完全固定，不随页面滚动 */
  top: v-bind(sidebarTopOffset + 'px');  /* 动态top值 */
  bottom: 0;                 /* 延伸到页面底部 */
  padding: 1rem 1rem;
  overflow-y: hidden;        /* 禁用内部滚动 */
  overflow-x: hidden;
  z-index: 100;
  background: #f8f9fa;       /* 与页面背景色一致，防止透视 */
  transition: top 0.05s linear; /* 快速跟随，避免视觉延迟 */

  /* 隐藏滚动条（保留功能） */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sidebar-left::-webkit-scrollbar,
.sidebar-right::-webkit-scrollbar {
  display: none;
}

.sidebar-left  {
  left: calc(50% - 700px); /* 居中布局左侧：50% - 最大宽度的一半 */
  width: 230px;            /* 从210px扩大到230px */
  border-right: 1px solid #e9ecef;
}
.sidebar-right {
  right: calc(50% - 700px); /* 居中布局右侧：50% - 最大宽度的一半 */
  width: 220px;             /* 从200px扩大到220px */
  border-left: 1px solid #e9ecef;
}

/* Categories */
.cat-list { display: flex; flex-direction: column; gap: 2px; }
.cat-item {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem;
  color: #495057;
  background: none; border: none; cursor: pointer;
  padding: 0.6rem 0.75rem;
  position: relative; overflow: hidden;
  transition: color 0.25s, background 0.25s;
  text-align: left; width: 100%;
  --cc: #0066FF;
}
.cat-item::before {
  content: ''; position: absolute; inset: 0;
  background: rgba(0,102,255,0.05);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.25,1,0.5,1);
}
.cat-item:hover { color: #0066FF; }
.cat-item:hover::before { transform: scaleX(1); }
.cat-item.active {
  color: var(--cc);
  background: rgba(0,102,255,0.04);
}
.cat-item.active::before { transform: scaleX(1); background: rgba(0,102,255,0.04); }
.ci-icon { 
  font-size: 0.6rem; 
  color: var(--cc); 
  opacity: 0.7; 
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
.cat-item.expanded .ci-icon {
  transform: rotate(0deg);
}
.ci-label { flex: 1; }
.ci-bar {
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 2px; background: var(--cc);
  box-shadow: 0 0 6px var(--cc);
  opacity: 0; transition: opacity 0.25s;
}
.cat-item.active .ci-bar { opacity: 1; }

/* 主分类特殊样式 */
.main-cat-item {
  font-weight: 500;
  background: rgba(0,102,255,0.02);
  border-left: 2px solid transparent;
}
.main-cat-item:hover {
  background: rgba(0,102,255,0.05);
  border-left-color: var(--cc);
}
.main-cat-item.active {
  background: rgba(0,102,255,0.06);
  border-left-color: var(--cc);
}

/* 副分类包装器 */
.sub-categories-wrapper {
  margin-left: 1.2rem;
  border-left: 1px solid rgba(0,102,255,0.1);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
}

/* 副分类项 */
.sub-cat-item {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  color: #6c757d;
}
.sub-cat-item:hover {
  color: var(--cc);
  background: rgba(0,102,255,0.03);
}
.sub-cat-item.active {
  color: var(--cc);
  background: rgba(0,102,255,0.05);
}
.cat-item.active .ci-bar { opacity: 1; }

/* 副分类项样式 */
.sub-cat-item {
  padding-left: 1.5rem;
  font-size: 0.8rem;
}
.sub-cat-item::before {
  background: rgba(0,102,255,0.03);
}

/* Hot topics */
.hot-list { display: flex; flex-direction: column; gap: 0.65rem; }
.hot-item { display: flex; align-items: flex-start; gap: 0.65rem; }
.hi-rank {
  font-family: 'Orbitron', sans-serif; font-size: 0.7rem;
  font-weight: 700; flex-shrink: 0; line-height: 1.4;
}
.hi-content { flex: 1; }
.hi-title {
  font-size: 0.82rem; color: #495057;
  line-height: 1.45; display: block;
  transition: color 0.2s; cursor: default;
}
.hot-item:hover .hi-title { color: #0066FF; }
.hi-replies {
  font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  color: #6c757d; letter-spacing: 0.06em;
}

/* ─── MAIN ────────────────────────────────────────────── */
.main-content {
  padding: 1.8rem;
  min-height: 100vh;
}

/* Toolbar */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}
.tb-left { display: flex; align-items: center; gap: 0.75rem; }

/* Toolbar 发帖按钮 */
.tb-compose-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  background: rgba(0,102,255,0.08);
  border: 1px solid rgba(0,102,255,0.2);
  border-radius: 8px;
  color: #0066FF;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.25s;
}
.tb-compose-btn svg {
  width: 16px;
  height: 16px;
}
.tb-compose-btn:hover {
  background: rgba(0,102,255,0.15);
  border-color: rgba(0,102,255,0.35);
  box-shadow: 0 0 15px rgba(0,102,255,0.15);
  transform: translateY(-1px);
}
.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 280px;
}
.search-icon {
  position: absolute;
  left: 10px;
  width: 16px;
  height: 16px;
  color: #adb5bd;
  pointer-events: none;
}
.tb-search-input {
  width: 100%;
  padding: 0.45rem 2.2rem 0.45rem 2.2rem;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #1a1a1a;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  outline: none;
  transition: all 0.25s;
}
.tb-search-input::placeholder {
  color: #adb5bd;
}
.tb-search-input:focus {
  border-color: #0066FF;
  background: #ffffff;
  box-shadow: 0 0 12px rgba(0,102,255,0.08);
}
.search-clear {
  position: absolute;
  right: 8px;
  cursor: pointer;
  color: #adb5bd;
  font-size: 0.8rem;
  transition: color 0.2s;
}
.search-clear:hover {
  color: #0066FF;
}
.tb-count {
  font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
  letter-spacing: 0.1em; color: #6c757d;
}
.tb-count em { font-style:normal; color: #0066FF; }
.tb-active-cat {
  font-family: 'JetBrains Mono', monospace; font-size: 0.66rem;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.65rem; border: 1px solid;
}
.sort-group { display: flex; gap: 2px; }
.sort-btn {
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
  letter-spacing: 0.12em; color: #6c757d;
  background: none; border: 1px solid #e9ecef;
  padding: 0.38rem 0.85rem; cursor: pointer;
  transition: color 0.25s, background 0.25s, border-color 0.25s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.sort-btn:hover { color: #1a1a1a; border-color: #0066FF; }
.sort-btn.active {
  color: #0066FF; background: rgba(0,102,255,0.06);
  border-color: rgba(0,102,255,0.25);
}

/* 排序箭头 */
.sort-arrow {
  width: 12px;
  height: 12px;
  fill: currentColor;
  transition: transform 0.2s;
}

/* Posts list */
.posts-list { display: flex; flex-direction: column; gap: 12px; }

/* Post card */
.post-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  position: relative; overflow: hidden;
  cursor: pointer;
  transition: background 0.3s, transform 0.25s cubic-bezier(0.25,1,0.5,1), border-color 0.3s, box-shadow 0.3s;
  margin-bottom: 0;
  border-radius: 12px;
}
.post-card:hover {
  background: #f8f9fa;
  border-color: #0066FF;
  transform: translateX(3px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.pc-layout {
  display: flex; gap: 0;
}

/* Vote column - display only */
.pc-vote {
  flex-shrink: 0; width: 64px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.5rem;
  padding: 1.4rem 0.5rem;
  border-right: 1px solid #e9ecef;
}
.vote-display {
  display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  color: #6c757d;
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
}
.vote-display svg { width: 18px; height: 18px; }

.vote-sep {
  width: 24px; height: 1px;
  background: #e9ecef;
}
.pc-comments-n {
  display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
  color: #6c757d;
}
.pc-comments-n svg { width: 14px; height: 14px; }

/* Card body */
.pc-body { flex: 1; padding: 1.2rem 1.4rem; min-width: 0; }

.pc-meta {
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.6rem; flex-wrap: wrap;
}
.pc-cat {
  font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  letter-spacing: 0.12em; padding: 0.15rem 0.5rem;
  border: 1px solid;
  color: var(--cat-color, #0066FF);
  border-color: var(--cat-color, #0066FF)33;
  background: var(--cat-color, #0066FF)0d;
  transition: all 0.25s;
}
.pc-hot {
  font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  letter-spacing: 0.1em; color: #ff6b35;
}
.pc-solved {
  font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  letter-spacing: 0.1em; color: #00ffb4;
}

.pc-title {
  font-size: 0.95rem; font-weight: 600; color: #1a1a1a;
  line-height: 1.4; margin-bottom: 0.55rem;
  transition: color 0.25s;
}
.post-card:hover .pc-title { color: #0066FF; }

.pc-preview {
  font-size: 0.88rem; line-height: 1.75;
  color: #6c757d; font-weight: 300;
  margin-bottom: 0.75rem;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

.pc-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; }
.pc-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  letter-spacing: 0.08em; color: #0066FF;
  background: rgba(0,102,255,0.06);
  border: 1px solid rgba(0,102,255,0.15);
  padding: 0.15rem 0.5rem;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.post-card:hover .pc-tag { color: #0066FF; border-color: rgba(0,102,255,0.25); background: rgba(0,102,255,0.1); }

.pc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #e9ecef;
}
.pcf-author { display: flex; align-items: center; gap: 0.6rem; }
.pcf-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  border: 1px solid rgba(0,255,180,0.2); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.pcf-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pcf-avatar span { font-family: 'Orbitron', sans-serif; font-size: 0.55rem; font-weight: 700; color: #0066FF; }
.pcf-info { display: flex; flex-direction: column; gap: 0.05rem; }
.pcf-name { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #1a1a1a; }
.pcf-time { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #6c757d; }

.pcf-actions { display: flex; align-items: center; gap: 0.5rem; }
.pcf-views {
  display: flex; align-items: center; gap: 0.3rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6c757d;
}
.pcf-views svg { width: 12px; height: 12px; }
.pcf-bookmark, .pcf-share {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: none; border: 1px solid #e9ecef;
  color: #6c757d; cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}
.pcf-bookmark svg, .pcf-share svg { width: 12px; height: 12px; }
.pcf-bookmark:hover, .pcf-share:hover {
  color: #0066FF; border-color: rgba(0,102,255,0.25);
  background: rgba(0,102,255,0.05);
}
.pcf-bookmark.active { color: #0066FF; border-color: rgba(0,102,255,0.3); background: rgba(0,102,255,0.08); }

/* Progress bar on hover */
.pc-progress {
  position: absolute; bottom: 0; left: 0;
  height: 2px;
  transition: width 0.4s cubic-bezier(0.25,1,0.5,1);
}

/* Corner decoration */
.pc-corner {
  position: absolute;
  width: 10px; height: 10px;
  border-color: rgba(0,102,255,0.15); border-style: solid;
  transition: border-color 0.3s, width 0.3s, height 0.3s;
}
.pc-corner.tl { top:0; left:0; border-width: 1px 0 0 1px; }
.pc-corner.br { bottom:0; right:0; border-width: 0 1px 1px 0; }
.post-card:hover .pc-corner {
  border-color: rgba(0,102,255,0.35);
  width: 14px; height: 14px;
}

/* Post list transition */
.post-list-enter-active { transition: all 0.4s cubic-bezier(0.25,1,0.5,1); }
.post-list-leave-active { transition: all 0.3s cubic-bezier(0.25,1,0.5,1); }
.post-list-enter-from { opacity:0; transform:translateY(12px); }
.post-list-leave-to   { opacity:0; transform:translateX(-12px); }

/* Empty state */
.empty-state {
  text-align: center; padding: 5rem 2rem;
}
.es-icon {
  font-size: 3rem; color: rgba(0,255,180,0.1);
  margin-bottom: 1rem;
  animation: esFloat 3s ease-in-out infinite;
}
@keyframes esFloat {
  0%,100%{ transform:translateY(0); }
  50%{ transform:translateY(-10px); }
}
.es-title {
  font-family: 'Orbitron', sans-serif; font-size: 1rem;
  letter-spacing: 0.14em; color: rgba(0,255,180,0.25);
  margin-bottom: 0.5rem;
}
.es-sub {
  font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
  letter-spacing: 0.1em; color: rgba(150,210,180,0.35);
}

/* Load more */
.load-more {
  display: flex; justify-content: center;
  padding: 1rem 0;
}
.lm-btn {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
  letter-spacing: 0.14em; color: rgba(150,210,180,0.35);
  background: none; border: 1px solid rgba(0,255,180,0.08);
  padding: 0.85rem 2rem; cursor: pointer;
  position: relative; overflow: hidden;
  clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
  transition: color 0.3s, border-color 0.3s, background 0.3s;
}
.lm-btn svg { width: 14px; height: 14px; }
.lm-btn:hover {
  color: #00ffb4; border-color: rgba(0,255,180,0.3);
  background: rgba(0,255,180,0.04);
}
.lm-sweep {
  position: absolute; top:0; left:-110%; width:60%; height:100%;
  background: linear-gradient(90deg, transparent, rgba(0,255,180,0.08), transparent);
  transition: left 0.6s cubic-bezier(0.25,1,0.5,1);
}
.lm-btn:hover .lm-sweep { left: 150%; }

/* ─── SIDEBAR RIGHT ──────────────────────────────────── */
/* System status */
.sys-status { display: flex; flex-direction: column; gap: 0.6rem; }
.sys-item {
  display: flex; align-items: center; gap: 0.6rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
}
.ssi-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.ssi-dot.online {
  background: #00ffb4; box-shadow: 0 0 8px #00ffb4;
  animation: blink 2s infinite;
}
.ssi-label { flex: 1; color: rgba(160,220,190,0.55); }
.ssi-latency { color: #00ffb4; font-size: 0.6rem; }

/* Activity chart */
.activity-chart {
  display: flex; align-items: flex-end;
  gap: 2px; height: 60px; margin-bottom: 0.4rem;
}
.ac-bar {
  flex: 1; min-width: 3px;
  background: linear-gradient(to top, #00ffb4, #00c8ff);
  opacity: 0.35; border-radius: 1px;
  animation: barIn 0.5s ease-out both;
  transition: opacity 0.2s;
}
.ac-bar:hover { opacity: 0.8; }
@keyframes barIn { from{transform:scaleY(0);transform-origin:bottom;} to{transform:scaleY(1);} }

.ac-labels {
  display: flex; justify-content: space-between;
  font-family: 'JetBrains Mono', monospace; font-size: 0.56rem;
  color: rgba(150,210,180,0.35); letter-spacing: 0.06em;
}

/* Tag cloud */
.tag-cloud {
  display: flex; flex-wrap: wrap; gap: 0.4rem;
}
.tc-tag {
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em;
  color: rgba(0,255,180,0.7); cursor: default;
  transition: color 0.2s, text-shadow 0.2s;
}
.tc-tag:hover { color: #00ffb4; text-shadow: 0 0 12px #00ffb4; }



/* ─── RESPONSIVE ─────────────────────────────────────── */
@media(max-width:1200px){
  .forum-layout {
    max-width: calc(100% - 210px);
    margin-left: 210px;
    padding: 0;
  }
  .sidebar-left { left: 0; }
  .sidebar-right { display: none; }
}
@media(max-width:860px){
  .forum-layout {
    max-width: 100%;
    margin: 0;
    padding: 0;
  }
  .sidebar-left  { display: none; }
  .top-nav{ flex-wrap: wrap; height: auto; padding: 0.75rem 1rem; gap: 0.75rem; }
  .nav-search{ max-width: 100%; order: 3; width: 100%; margin: 0; }
  .fh-rings{ display: none; }
  .fh-deco-right { display: none; }
}
@media(max-width:600px){
  .pc-vote{ width: 52px; }
  .fh-title{ flex-direction: column; gap: 0; }
  .fh-live-stats{ gap: 1.5rem; }
}
</style>

<!-- 全局样式：搜索高亮样式 - 无背景，仅加粗+亮绿色 -->
<style>
.forum-root mark.highlight {
  background: transparent !important;
  color: #00ffb4 !important;
  font-weight: bold !important;
}
</style>