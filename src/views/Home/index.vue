<template>
  <div class="home">
    <!-- 全屏视频背景1 -->
    <section class="hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/home1.mp4" type="video/mp4">
      </video>
      <div class="hero-content">
        <h1 style="font-size: 5rem;margin-bottom: 3rem;font-weight: 700;">Take your breath away</h1>
        <p style="max-width: 50em">With one of the most advanced All-Wheel Drive and Vehicle Dynamic Control systems ever used in a road car, you get the feel and response of rear-wheel drive with the confidence of All-Wheel Drive. </p>
        <router-link to="/Reserve">
          <button class="cta-button">Explore the GT-R</button>
        </router-link>
      </div>
    </section>
    <!-- 品牌科技展示 -->
    <section class="tech-showcase">
      <div class="tech-content-wrapper">
        <div class="tech-media-frame left-frame">
          <img src="/home/1.png" alt="科技展示" class="tech-image">
        </div>
        <div class="tech-text-frame right-frame">
          <p>In the hands of masters</p>
          <h1>True mastery:  from Takumi to expert driver</h1>
          <div class="tech-description">
            <p>Each GT-R gets to wear a true badge of honor, hand-assembled by one of the world’s six master Takumi craftsmen, who affix their name on a plaque. AS Class drivers — the top development drivers at Nissan — help create a vehicle that shines on both road and track, including an Autobahn expert, a “marketability” expert, and “Ringmeisters,” who test the GT-R at the legendary Nürburgring.
            </p>
          </div>
        </div>
      </div>
    </section>
    <!-- 全屏视频背景2 -->
    <section class="hero">
      <video autoplay loop muted playsinline class="hero-video">
        <source src="/videos/home2.mp4" type="video/mp4">
      </video>
      <div class="hero-content">
        <h1 style="font-size: 5rem;margin-bottom: 3rem;font-weight: 700;">Unlimited passion</h1>
        <p style="max-width: 50em">The Nissan GT-R is one legend, but it’s made of many stories. The original Skyline™ started it all, while the GT-R NISMO® was born to compete. The GT-R T-spec® celebrates the specially curated editions of the GT-R over the years, while the GT-R T-spec Takumi Edition honors the artisans who put their hearts and souls into every model. (Limited Availability)
        </p>
      </div>
    </section>
    <!-- 品牌科技展示 -->
    <section class="tech-showcase">
      <div class="tech-content-wrapper">
        <div class="tech-media-frame left-frame">
          <img src="/home/2.png" alt="科技展示" class="tech-image">
        </div>
        <div class="tech-text-frame right-frame">
          <p>Interior features</p>
          <h1>An interior made for driving</h1>
          <div class="tech-description">
            <p>With leather appointments surrounding you in premium luxury, supportive sport seats, and the available Nappa leather-wrapped dashboard, the inside of a GT-R is as exciting as the outside.
            </p>
          </div>
        </div>
      </div>
    </section>
    <!-- 环保成就 -->
    <section class="eco-achievements">
      <h1 style="font-size: 50px">We saved the best for last</h1>
      <div class="achievements-data">
        <div class="achievement">
          <span class="number">$121,090</span>
          <span class="label">Starting At</span>
        </div>
        <div class="achievement">
          <span class="label">There is only one GT-R. An unmatched blend of power and soul. A legendary history combined with technology that still defines state-of-the-art. To honor the past and the passionate engineers and skilled craftsman behind it, two unique special editions have been added to the GT-R lineup. And now, it’s time for your legend to begin. (Limited Availability)
          </span>
        </div>
      </div>
    </section>
  </div>
</template>



<script>
export default {
  name: 'Home',
  data () {
    return {
      filters: {
        type: '',
        price: '',
        energy: ''
      }
    }
  },
}
</script>

<style lang="scss">
.hero {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.hero-video {
  margin-top: 72px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

}

.hero-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  background-image: linear-gradient(to top, rgb(1, 10, 14), transparent, rgb(1, 10, 14));
  text-shadow:  0 0 2px hsl(198, 87%, 3%),0 0 2px hsl(0, 0%, 100%), 0 0 2px hsl(50, 100%, 51%);
}

/* 预约试驾按钮 */
.cta-button {
  margin-top: 2rem;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.cta-button:hover {
  transform: scale(1.05);
}



/* 板块 */
.tech-showcase {
  padding: 5rem 0;
  color: white;
  position: relative;
  text-align: center;
  text-shadow:  0 0 2px hsl(198, 87%, 3%),0 0 2px hsl(0, 0%, 100%), 0 0 2px hsl(48, 100%, 50%);
  background-color: rgba(1, 10, 14);
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  min-height: 600px;
}
.tech-showcase h1 {
  font-size: 3rem;
  margin-bottom: 5rem;
  font-weight: 700;
}
.tech-content-wrapper {
  display: flex;
  justify-content: space-between;
  width: 85%;
  max-width: 1200px;
  position: relative;
}

.tech-media-frame,
.tech-text-frame {
  flex: 0 0 48%;
  position: relative;
}

.left-frame {
  margin-top: -40px; // 左侧偏高效果
  height: 500px;
  box-shadow: 0 10px 30px rgba(100, 104, 111, 0.54);

  .tech-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 15px;
  }
}

.right-frame {
  margin-top: 80px; // 右侧偏低效果
  background: rgba(0, 30, 50, 0.8);
  padding: 2.5rem;
  border-radius: 15px;
  min-height: 400px;
  backdrop-filter: blur(5px);
  box-shadow: 0 10px 30px rgba(100, 104, 111, 0.54);

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }

  .tech-description {
    line-height: 1.8;
    font-size: 1.1rem;
    opacity: 0.9;
  }
}



/* 板块 */
.eco-achievements {
  padding: 5rem 0;
  color: #ffffff;
  text-align: center;
  background-image: linear-gradient(to top, rgb(0, 0, 0), rgb(1, 10, 14));
  text-shadow:  0 0 2px hsl(198, 87%, 3%),0 0 2px hsl(0, 0%, 100%), 0 0 2px hsl(198, 87%, 3%);
}

.achievements-data {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-top: 3rem;
}

.achievement {
  display: flex;
  flex-direction: column;
}

.number {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow:  0 0 2px hsl(198, 87%, 3%),0 0 2px hsl(0, 0%, 100%), 0 0 2px hsl(198, 87%, 3%);
  margin-top: 1em;
}

.label {
  margin-top: 0.5rem;
  font-size: 1.2rem;
  max-width: 500px;
}






@media (max-width: 768px) {
  .tech-showcase .tech-content-wrapper {
    flex-direction: column;
    width: 90%;

    .tech-media-frame,
    .tech-text-frame {
      flex: none;
      width: 100%;
    }

    .left-frame {
      margin-top: 0;
      height: 300px;
    }

    .right-frame {
      margin-top: -60px;
      z-index: 1;
    }
  }
}
</style>
