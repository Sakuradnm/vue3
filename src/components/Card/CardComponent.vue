<template>
<div class="card-wrap"
     @mousemove="handleMouseMove"
     @mouseenter="handleMouseEnter"
     @mouseleave="handleMouseLeave"
     ref="cardElement">
<div class="card" :style="cardStyle">
  <div class="card-bg" :style="[cardBgTransform, { backgroundImage: `url(${dataImage})` }]"></div>
  <div class="card-info">
    <h1><slot name="header"></slot></h1>
    <p><slot name="content"></slot></p>
  </div>
  <div class="card-glow"></div>
</div>
</div>
</template>



<script setup>import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  dataImage: {
    type: String,
    required: true
  }
})
/* 配置参数 */
const CONFIG = {
  rotationRange: 3,    // 最大旋转角度
  translateRange: 5,   // 最大位移量
  perspective: 2000,    // 透视强度
  intensity: 0.5,       // 整体效果强度
  smoothness: 6       // 动画平滑度
}

const cardElement = ref(null)
const width = ref(0)
const height = ref(0)
const mouseX = ref(0)
const mouseY = ref(0)
const currentX = ref(0)
const currentY = ref(0)
const mouseLeaveDelay = ref(null)

onMounted(() => {
  width.value = cardElement.value?.offsetWidth || 0
  height.value = cardElement.value?.offsetHeight || 0
})

// 初始化时设置为中心位置
currentX.value = width.value / 2
currentY.value = height.value / 2

// 计算标准化鼠标位置（-1到1区间）
const normalizedPos = computed(() => {
  return {
    x: (currentX.value / width.value) * 2 - 1,
    y: (currentY.value / height.value) * 2 - 1
  }
})

// 卡片3D变换
const cardStyle = computed(() => {
  // 当未激活时保持平面状态
  const isActive = !(currentX.value === 0 && currentY.value === 0)

  const rotateX = isActive ? normalizedPos.value.y * CONFIG.rotationRange * -1 : 0
  const rotateY = isActive ? normalizedPos.value.x * CONFIG.rotationRange : 0
  const translateX = isActive ? normalizedPos.value.x * CONFIG.translateRange : 0
  const translateY = isActive ? normalizedPos.value.y * CONFIG.translateRange : 0

  return {
    transform: `perspective(${CONFIG.perspective}px)
      translate3d(${translateX}px, ${translateY}px, 0)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)`,
    transition: `transform ${CONFIG.smoothness}s cubic-bezier(0.03, 0.98, 0.52, 0.99)`
  }
})

/* 背景视差效果 */
const cardBgTransform = computed(() => {
  const isActive = !(currentX.value === 0 && currentY.value === 0)

  const translateX = isActive ? normalizedPos.value.x * CONFIG.translateRange * -2 : 0
  const translateY = isActive ? normalizedPos.value.y * CONFIG.translateRange * -2 : 0

  return {
    transform: `translateX(${translateX}px)
      translateY(${translateY}px)
      scale(${isActive ? 1.05 : 1})`,
    transition: `transform ${CONFIG.smoothness * 1.2}s cubic-bezier(0.03, 0.98, 0.52, 0.99)`
  }
})

// 平滑的鼠标跟踪
const handleMouseMove = (e) => {
  if (!cardElement.value) return
  const rect = cardElement.value.getBoundingClientRect()
  const targetX = e.clientX - rect.left
  const targetY = e.clientY - rect.top

  currentX.value += (targetX - currentX.value) * CONFIG.intensity
  currentY.value += (targetY - currentY.value) * CONFIG.intensity
}
const handleMouseEnter = () => {
  clearTimeout(mouseLeaveDelay.value)
}

  const handleMouseLeave = () => {
    mouseLeaveDelay.value = setTimeout(() => {
      // 直接重置到中心位置
      currentX.value = width.value / 2
      currentY.value = height.value / 2
    }, 1550)
  }
</script>



<style scoped lang="scss">
$hoverEasing: cubic-bezier(0.23, 1, 0.32, 1);
$returnEasing: cubic-bezier(0.445, 0.05, 0.55, 0.95);

.container {
  padding: 40px 80px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
/* 卡片容器样式 */
.card-wrap {
  margin: 10px;
  width: 65%;
  height: 600px;
  border-radius: 8px;
  cursor: pointer;
  perspective-origin: center;
  backface-visibility: hidden;
  box-shadow: 0 2px 10px rgba(161, 225, 255, 0.05);

  &:hover {
    .card-info {
      transform: translateY(0) translateZ(30px) !important;
      transition: transform 0.1s cubic-bezier(0.23, 1, 0.32, 1),
      opacity 0.3s ease !important;

      p { opacity: 1; }
    }
    .card-info, .card-info p {
      transition: 0.6s $hoverEasing;
    }
    .card-info:after {
      transition: 5s $hoverEasing;
      opacity: 1;
      transform: translateY(0);
    }
    .card-bg {
      transition: 0.6s $hoverEasing, opacity 5s $hoverEasing;
      opacity: 0.8;
    }
    .card {
      transition: 0.6s $hoverEasing, box-shadow 2s $hoverEasing;
      box-shadow: 0 0 40px 5px rgba(white, 0.15),
      0 0 0 1px rgba(white, 1),
      0 30px 60px 0 rgba(black, 0.66),
      0 0 0 5px inset #333,
      0 0 0 6px inset white;
    }
    .card::after {
      opacity: 0;
    }
  }
}
/* 卡片样式 */
.card {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  background-color: transparent !important;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 15px 30px 0 rgba(77, 131, 154, 0.5) !important;

  &::after {
    display: none;
  }
}

.card-bg {
  opacity: 1 !important;
  filter: none !important;
  position: absolute;
  top: -20px;
  left: -20px;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  transition: 1s $returnEasing,
  opacity 5s 1s $returnEasing;
  pointer-events: none;
  transform: translateZ(-10px) scale(1.1);
}

/* 卡片信息样式 */
.card-info {
  padding: 20px;
  position: absolute;
  bottom: 0;
  color: #fff;
  transform: translateY(55%);
  transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
  p {
    opacity: 0;
    text-align: left;
    margin-bottom: 0.5em;
    text-shadow: 0 2px 3px rgba(black, 1);
    transition: 0.6s 1.6s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  * {
    position: relative;
    z-index: 1;
  }
  h1 {
    position: relative;
    text-align: left;
    right: 0;
    font-size: 20px;
    margin-bottom: 0;
    line-height: 1.2;
    text-shadow: rgba(black, 0.5) 0 10px 10px;
  }
  &:after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to bottom, transparent 0%, rgba(#000, 0.1) 100%);
    background-blend-mode: overlay;
    opacity: 0;
    transform: translateY(100%);
    transition: 5s 1s $returnEasing;
  }
}

</style>
