<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import Story from '../../components/History/story.vue';


const parallaxLayers = ref<HTMLElement | null>(null);
const layers = [
  {
    layer: "1",
    yPercent: 10,  // 基础层速度
    scrub: 1.2      // 基础滚动速度
  },
  {
    layer: "2",
    yPercent: 1,
    scrub: 1.1
  },
  {
    layer: "3",
    yPercent: -2,  // 向下移动更慢
    scrub: 2,       // 更慢的滚动速度
    ease: "slow(0.7, 0.7, false)" // 更平缓的缓动
  },
  {
    layer: "4",
    yPercent: -15,
    scrub: 0.9
  }
];

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.8,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  //RAF优化
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // 单独控制标题动画
  gsap.to(".parallax__title", {
    yPercent: 35,  // 降低移动幅度
    scrollTrigger: {
      trigger: layers[0].layer === "1" ? parallaxLayers.value : null, // 绑定layer1
      start: "top bottom",
      scrub: layers[0].scrub + 0.3 // 比layer1更慢
    }
  });

  // 视差层动画
  if (parallaxLayers.value) {
    const layers = [
      { layer: "1", yPercent: 10 }, // 减少纵向位移
      { layer: "2", yPercent: -5 },
      { layer: "3", yPercent: -2 },
      { layer: "4", yPercent: -20 }
    ];

    layers.forEach(({ layer, yPercent }) => {
      gsap.to(parallaxLayers.value!.querySelectorAll(`[data-parallax-layer="${layer}"]`), {
        yPercent,
        ease: "power2.out",
        modifiers: {
          y: gsap.utils.unitize(y => parseFloat(y) * 0.5) // 减少Y轴运动幅度
        },
        scrollTrigger: {
          trigger: parallaxLayers.value,
          start: "top top",  // 从顶部开始触发
          end: "bottom top",
          scrub: 1,       // 改为true实现更平滑回弹
          onUpdate: self => {
            // 根据滚动方向调整缓动曲线
            self.ease = self.direction === 1 ? "power2.out" : "power2.in";
          }
        }
      });
    });

  }})
</script>

<template>
  <div class="parallax">
    <section class="parallax__header">
      <div class="parallax__visuals">
        <div class="parallax__black-line-overflow"></div>
        <div ref="parallaxLayers" class="parallax__layers" data-parallax-layers>
          <img data-parallax-layer="1" alt="data-parallax-layer 1" src="../../assets/images/parallax-layer3.webp" style="height: 190vh" class="parallax__layer-img">
          <img data-parallax-layer="2" alt="data-parallax-layer 2" src="../../assets/images/parallax-layer2.webp" class="parallax__layer-img">
          <div data-parallax-layer="3"  class="parallax__layer-title"><h2 class="parallax__title">About Us</h2></div>
          <img data-parallax-layer="4" alt="data-parallax-layer 3" src="../../assets/images/parallax-layer1.webp" class="parallax__layer-img">
        </div>
        <div class="parallax__fade"></div>
      </div>
    </section>
    <section class="parallax__content">
      <Transition name="fade" mode="out-in">
        <slot>
          <div class="content-wrapper">
            <Story />
          </div>
        </slot>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
.parallax {
  width: 100%;
  position: relative;
  overflow: hidden;
  height: auto;
}
.parallax__layers {
  position: relative;
  min-height: 50vh;
  overflow: visible;

}
.parallax__visuals {
  position: relative;
  height: auto;
}
.parallax__title {
  color: rgb(255, 255, 255);
  text-shadow:  0 0 10px hsla(198, 87%, 3%, 0.58),2px 5px 2px hsl(201, 94%, 73%), 10px 5px 2px hsl(198, 87%, 3%);
  font-style: italic;
  pointer-events: auto;
  text-align: center;
  mix-blend-mode: multiply;
  filter: brightness(1.3);
  font-family: PP Neue Corp Wide, sans-serif;
  font-size: 12vw;
  line-height: 1;
  left: 0;
  right: 0;
  position: absolute;
  margin: 20% auto;
  letter-spacing: 6px;
}
@font-face {
  font-family: 'PP Neue Corp Wide';
  src: url('https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717e399d30a606fed425914_PPNeueCorp-WideUltrabold.woff2') format('woff2');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}

.parallax__layer-img {
  pointer-events: none;
  object-fit: cover;
  width: 100%;
  position: absolute;
  top: -25%;
  left: 0;
  height: auto;
  filter: brightness(1.1) contrast(1.3); /* 亮度降低（可调整这个值） */
  transform: translateZ(calc(attr(data-parallax-layer) * 1px));
  z-index: calc(attr(data-parallax-layer integer));
}

.parallax__content {
  position: relative;
  z-index: 3;
  background: #000000;
  padding: var(4rem, 2rem) var(2rem, 1rem);
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  display: flex;
}

.parallax__header {
  z-index: 2;
  padding: 4rem 2rem;
  justify-content: center;
  align-items: center;
  min-height: 100svh;
  display: flex;
  position: relative;
}

.parallax__visuals {
  object-fit: cover;
  width: 100%;
  max-width: none;
  height: 120%;
  position: absolute;
  top: 0;
  left: 0;
}

.parallax__fade {
  --color-dark-rgb: 0, 0, 0;
  background: linear-gradient(to top,
  rgba(var(--color-dark-rgb), 1) 0%,
  rgba(var(--color-dark-rgb), 0.738) 19%,
  rgba(var(--color-dark-rgb), 0.541) 34%,
  rgba(var(--color-dark-rgb), 0.382) 47%,
  rgba(var(--color-dark-rgb), 0.278) 56.5%,
  rgba(var(--color-dark-rgb), 0.194) 65%,
  rgba(var(--color-dark-rgb), 0.126) 73%,
  rgba(var(--color-dark-rgb), 0.075) 80.2%,
  rgba(var(--color-dark-rgb), 0.042) 86.1%,
  rgba(var(--color-dark-rgb), 0.021) 91%,
  rgba(var(--color-dark-rgb), 0.008) 95.2%,
  rgba(var(--color-dark-rgb), 0.002) 98.2%,
  transparent 100%);
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
