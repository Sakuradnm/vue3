<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let sphere: THREE.Mesh
let sphereInner: THREE.Mesh
let particles: THREE.Points
let particleLines: THREE.LineSegments
let animationId: number
let mouseX = 0
let mouseY = 0
let targetRotationX = 0
let targetRotationY = 0
let scrollProgress = 0

// 初始化 Three.js 场景
const initThree = () => {
  if (!canvasRef.value) return

  // 场景
  scene = new THREE.Scene()

  // 相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  // 渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // 创建主球体（外层线框）
  const sphereGeometry = new THREE.IcosahedronGeometry(2, 4)
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x0066FF,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
    emissive: 0x0066FF,
    emissiveIntensity: 0.15
  })
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  scene.add(sphere)

  // 内层球体（半透明）
  const innerGeometry = new THREE.IcosahedronGeometry(1.8, 3)
  const innerMaterial = new THREE.MeshPhongMaterial({
    color: 0x0080FF,
    transparent: true,
    opacity: 0.08,
    emissive: 0x0066FF,
    emissiveIntensity: 0.1
  })
  sphereInner = new THREE.Mesh(innerGeometry, innerMaterial)
  scene.add(sphereInner)

  // 创建星系粒子系统
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 3000
  const posArray = new Float32Array(particlesCount * 3)
  const colorArray = new Float32Array(particlesCount * 3)
  const scaleArray = new Float32Array(particlesCount)
  const velocityArray = new Float32Array(particlesCount * 3) // 存储速度

  // 颜色渐变：蓝色到紫色
  const color1 = new THREE.Color(0x0066FF) // 蓝色
  const color2 = new THREE.Color(0x8B5CF6) // 紫色

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3

    // 螺旋分布
    const radius = Math.random() * 12 + 2
    const angle = Math.random() * Math.PI * 2
    const height = (Math.random() - 0.5) * 8

    posArray[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 2
    posArray[i3 + 1] = height + Math.sin(angle * 2) * 0.5
    posArray[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2

    // 颜色插值
    const mixedColor = color1.clone().lerp(color2, Math.random())
    colorArray[i3] = mixedColor.r
    colorArray[i3 + 1] = mixedColor.g
    colorArray[i3 + 2] = mixedColor.b

    scaleArray[i] = Math.random()

    // 初始速度
    velocityArray[i3] = (Math.random() - 0.5) * 0.005
    velocityArray[i3 + 1] = (Math.random() - 0.5) * 0.003
    velocityArray[i3 + 2] = (Math.random() - 0.5) * 0.005
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false
  })

  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  // 创建动态连接线（知识网络）
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0066FF,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const lineGeometry = new THREE.BufferGeometry()
  const linePositions = []
  const positions = particlesGeometry.attributes.position.array

  // 智能连线：只连接近距离的粒子
  const connectionDistance = 1.8
  let connections = 0
  const maxConnections = 3000 // 限制最大连线数保证性能

  for (let i = 0; i < particlesCount && connections < maxConnections; i++) {
    for (let j = i + 1; j < particlesCount && connections < maxConnections; j++) {
      const dx = positions[i * 3] - positions[j * 3]
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (distance < connectionDistance) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        )
        connections++
      }
    }
  }

  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  particleLines = new THREE.LineSegments(lineGeometry, lineMaterial)
  scene.add(particleLines)

  // 光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x0066FF, 1)
  pointLight.position.set(5, 5, 5)
  scene.add(pointLight)

  const pointLight2 = new THREE.PointLight(0x0080FF, 0.8)
  pointLight2.position.set(-5, -5, 5)
  scene.add(pointLight2)

  // 动画循环
  let time = 0
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    time += 0.008

    // 平滑跟随鼠标（视差效果）
    targetRotationX += (mouseY * 0.4 - targetRotationX) * 0.04
    targetRotationY += (mouseX * 0.4 - targetRotationY) * 0.04

    // 球体旋转（基础 + 鼠标交互 + 滚动影响）
    const baseRotationSpeed = 0.001
    const scrollInfluence = scrollProgress * 0.003
    sphere.rotation.x += baseRotationSpeed + targetRotationX * 0.008 + scrollInfluence
    sphere.rotation.y += baseRotationSpeed * 2 + targetRotationY * 0.008
    
    sphereInner.rotation.x -= baseRotationSpeed * 0.8
    sphereInner.rotation.y -= baseRotationSpeed * 1.5

    // 根据滚动进度变形和变色
    const scrollScale = 1 + scrollProgress * 0.4
    sphere.scale.setScalar(scrollScale)
    sphereInner.scale.setScalar(scrollScale * 0.9)
    
    // 滚动时改变透明度
    sphere.material.opacity = 0.25 - scrollProgress * 0.1
    sphereInner.material.opacity = 0.08 - scrollProgress * 0.03

    // 粒子流动效果（正弦波运动）
    const particlePositions = particles.geometry.attributes.position.array
    const particleColors = particles.geometry.attributes.color.array
    
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3
      
      // 螺旋流动
      const x = particlePositions[i3]
      const y = particlePositions[i3 + 1]
      const z = particlePositions[i3 + 2]
      
      // 添加波动
      particlePositions[i3] += Math.sin(time + y * 0.3) * 0.003
      particlePositions[i3 + 1] += Math.cos(time + x * 0.3) * 0.002
      particlePositions[i3 + 2] += Math.sin(time + z * 0.3) * 0.003
      
      // 边界检测：超出范围则重置
      if (Math.abs(particlePositions[i3]) > 15) {
        particlePositions[i3] *= -0.9
      }
      if (Math.abs(particlePositions[i3 + 1]) > 10) {
        particlePositions[i3 + 1] *= -0.9
      }
      if (Math.abs(particlePositions[i3 + 2]) > 15) {
        particlePositions[i3 + 2] *= -0.9
      }
      
      // 滚动时颜色渐变
      const colorFactor = scrollProgress * 0.3
      particleColors[i3] = 0x00 / 255 + colorFactor * 0.55 // R
      particleColors[i3 + 1] = 0x66 / 255 - colorFactor * 0.2 // G
      particleColors[i3 + 2] = 0xFF / 255 // B
    }
    
    particles.geometry.attributes.position.needsUpdate = true
    particles.geometry.attributes.color.needsUpdate = true

    // 粒子整体旋转（视差 + 自动）
    particles.rotation.y += 0.0002 + targetRotationY * 0.0015
    particles.rotation.x += targetRotationX * 0.0008
    
    particleLines.rotation.y += 0.0002
    particleLines.rotation.x += 0.00008

    // 相机跟随鼠标移动
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.03
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.03
    camera.position.z = 5 + scrollProgress * 2 // 滚动时相机后退
    camera.lookAt(scene.position)

    renderer.render(scene, camera)
  }
  animate()

  // 鼠标移动事件
  window.addEventListener('mousemove', onMouseMove)
  
  // 滚动事件
  window.addEventListener('scroll', onScroll)
  
  // 窗口大小调整事件
  window.addEventListener('resize', onResize)
}

const onResize = () => {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const onMouseMove = (event: MouseEvent) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1
}

const onScroll = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress = Math.min(window.scrollY / maxScroll, 1)
}

// 初始化滚动动画
const initScrollAnimations = () => {
  // Hero 区域动画
  gsap.from('.hero-title', {
    y: 100,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top center',
      toggleActions: 'play none none reverse'
    }
  })

  gsap.from('.hero-subtitle', {
    y: 60,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top center',
      toggleActions: 'play none none reverse'
    }
  })

  // 特性卡片动画
  gsap.utils.toArray('.feature-card').forEach((card: any, i: number) => {
    gsap.from(card, {
      y: 80,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    })
  })

  // 统计数据动画
  gsap.from('.stat-item', {
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '.stats-section',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    }
  })
}

onMounted(() => {
  initThree()
  setTimeout(initScrollAnimations, 100)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('scroll', onScroll)
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
})
</script>

<template>
  <div class="home-root">
    <!-- Three.js Canvas -->
    <canvas ref="canvasRef" class="bg-canvas"></canvas>

    <!-- 渐变光晕层 -->
    <div class="gradient-overlay"></div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-gradient">知识共享</span>
          <br />
          <span class="title-outline">未来教育</span>
        </h1>
        <p class="hero-subtitle">
          打破知识壁垒 · 构建开放学习生态 · 连接全球学习者
        </p>
        <div class="hero-cta">
          <router-link to="/Course" class="btn-primary">
            <span class="btn-glow"></span>
            探索课程
          </router-link>
          <router-link to="/Forum" class="btn-secondary">
            加入社区
          </router-link>
        </div>
      </div>

      <!-- 滚动提示 -->
      <div class="scroll-indicator">
        <div class="scroll-line"></div>
        <span class="scroll-text">SCROLL</span>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">核心优势</h2>
        <p class="section-desc">重新定义在线学习体验</p>
      </div>

      <div class="features-grid">
        <div class="feature-card glass-card">
          <div class="feature-icon">📚</div>
          <h3 class="feature-title">海量资源</h3>
          <p class="feature-desc">12800+ 优质课程资源，覆盖全学科领域</p>
        </div>

        <div class="feature-card glass-card">
          <div class="feature-icon">🤖</div>
          <h3 class="feature-title">AI 智能推荐</h3>
          <p class="feature-desc">个性化学习路径，精准匹配你的需求</p>
        </div>

        <div class="feature-card glass-card">
          <div class="feature-icon">🌐</div>
          <h3 class="feature-title">开放社区</h3>
          <p class="feature-desc">4200+ 活跃学习者，知识共享无边界</p>
        </div>

        <div class="feature-card glass-card">
          <div class="feature-icon">⚡</div>
          <h3 class="feature-title">实时更新</h3>
          <p class="feature-desc">紧跟技术前沿，内容持续迭代优化</p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-container glass-card">
        <div class="stat-item">
          <div class="stat-number gradient-text">12.8K+</div>
          <div class="stat-label">课程资源</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number gradient-text">4.2K+</div>
          <div class="stat-label">活跃用户</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number gradient-text">320+</div>
          <div class="stat-label">专题课程</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number gradient-text">4.9</div>
          <div class="stat-label">平均评分</div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content glass-card">
        <h2 class="cta-title">准备好开始了吗？</h2>
        <p class="cta-desc">加入我们的知识共享网络，开启学习之旅</p>
        <router-link to="/Users" class="btn-primary lg">
          <span class="btn-glow"></span>
          立即加入
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

/* ─── ROOT ────────────────────────────────────────────── */
.home-root {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f7ff 100%);
  overflow-x: hidden;
  font-family: 'Noto Sans SC', sans-serif;
}

/* ─── CANVAS ──────────────────────────────────────────── */
.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* ─── GRADIENT OVERLAY ────────────────────────────────── */
.gradient-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: 
    radial-gradient(circle at 20% 30%, rgba(0, 102, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 128, 255, 0.06) 0%, transparent 50%);
}

/* ─── HERO SECTION ────────────────────────────────────── */
.hero-section {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 6vw 80px;
}

.hero-content {
  text-align: center;
  max-width: 900px;
}

.hero-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.title-gradient {
  background: linear-gradient(135deg, #0066FF 0%, #0080FF 50%, #409EFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px rgba(0, 102, 255, 0.3));
}

.title-outline {
  color: transparent;
  -webkit-text-stroke: 2px rgba(0, 102, 255, 0.3);
  display: block;
  margin-top: 0.5rem;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #495057;
  font-weight: 300;
  margin-bottom: 3rem;
  letter-spacing: 0.05em;
}

.hero-cta {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ─── BUTTONS ─────────────────────────────────────────── */
.btn-primary {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 2.2rem;
  background: linear-gradient(135deg, #0066FF, #0080FF);
  color: #fff;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 102, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 102, 255, 0.4);
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.btn-primary:hover .btn-glow {
  transform: translateX(100%);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2.2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  color: #0066FF;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  border: 1px solid rgba(0, 102, 255, 0.2);
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(0, 102, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 102, 255, 0.15);
}

.btn-primary.lg {
  padding: 1.2rem 2.8rem;
  font-size: 1.05rem;
}

/* ─── SCROLL INDICATOR ────────────────────────────────── */
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: bounce 2s infinite;
}

.scroll-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, #0066FF, transparent);
  border-radius: 2px;
}

.scroll-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: rgba(0, 102, 255, 0.5);
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}

/* ─── FEATURES SECTION ────────────────────────────────── */
.features-section {
  position: relative;
  z-index: 2;
  padding: 100px 6vw;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.8rem;
  letter-spacing: 0.05em;
}

.section-desc {
  font-size: 1rem;
  color: #6c757d;
  font-weight: 300;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* ─── GLASS CARD ──────────────────────────────────────── */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 
    0 8px 32px rgba(0, 102, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 16px 48px rgba(0, 102, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  border-color: rgba(0, 102, 255, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.2rem;
  display: block;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.8rem;
}

.feature-desc {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.7;
}

/* ─── STATS SECTION ───────────────────────────────────── */
.stats-section {
  position: relative;
  z-index: 2;
  padding: 80px 6vw;
}

.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 3rem 2rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  flex: 1;
  min-width: 150px;
}

.stat-number {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #0066FF, #0080FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, rgba(0, 102, 255, 0.2), transparent);
}

/* ─── CTA SECTION ─────────────────────────────────────── */
.cta-section {
  position: relative;
  z-index: 2;
  padding: 100px 6vw 120px;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  padding: 4rem 3rem;
}

.cta-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.cta-desc {
  font-size: 1.05rem;
  color: #6c757d;
  margin-bottom: 2.5rem;
  line-height: 1.7;
}

/* ─── RESPONSIVE ──────────────────────────────────────── */
@media (max-width: 768px) {
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .stats-container {
    flex-direction: column;
    gap: 2rem;
  }

  .stat-divider {
    width: 60px;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(0, 102, 255, 0.2), transparent);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
