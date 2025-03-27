<script setup lang="ts">
</script>
<template>
  <footer class="footer">
    <div class="social-top">
      <a href="https://x.com/cssdesignawards">
        <img src="/logo/twitter.png" alt="Twitter"></a>
      <a href="https://www.facebook.com/CSSDesignAwards/">
        <img src="/logo/facebook.png" alt="Facebook"></a>
      <a href="https://www.youtubu.com/cssdesignaward/">
        <img src="/logo/youtubu.png" alt="Youtubu"></a>
      <a href="https://www.instagram.com/cssdesignaward/">
        <img src="/logo/instagram.png" alt="instagram"></a>
    </div>
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <svg-icon name="home" :width="24" height="24" />
          <h2>专业品质，用心服务</h2>
        </div>

        <div class="footer-links">
          <div class="footer-col">
            <h3>服 务 内 容:</h3>
              <p><a href="#">保修服务</a></p>
              <p><a href="#">道路救援</a></p>
              <p><a href="#">零配件服务</a></p>
              <p><a href="#">增值服务</a></p>
          </div>

          <div class="footer-col">
            <h3>服 务 网 点:</h3>
              <p><a href="#">服务中心查询</a></p>
              <p><a href="#">网点分布</a></p>
              <p><a href="#">服务标准</a></p>
              <p><a href="#">预约服务</a></p>
          </div>

          <div class="footer-col">
            <h3>联 系 我 们:</h3>
            客服热线：<p>400-888-8888</p>
            救援热线：<p>400-888-9999</p>
            服务时间：<p>8:00-20:00</p>
            邮箱：<P>bbg7165@gmail.com</P>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2025 汽车售后服务中心. 保留所有权利.</p>
        <div class="social-links">
          <a href="#" class="social-link">网站地图</a>
          <router-link to="/agreement" class="social-link">使用条款</router-link>
          <router-link to="/policy" class="social-link">隐私政策</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* 页脚样式 */
.footer {
  background-color: #010a0e;
  color: white;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 4个社交图标 */
.social-top {
  background-color: transparent;
  display: flex;
  justify-content: center;
  gap: 10rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.social-top img {
  height: 32px;
  transition: opacity 0.3s;
}
.social-top img:hover {
  opacity: 0.8;
}

/* 页脚内容 */
.footer-content {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin: 45px;
}
.footer-logo {
  margin-top: 50px;
  flex: 1;
  min-width: 100px;
  white-space:nowrap;
}

/* 底部链接 */
.footer-links {
  flex: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.footer-col {
  flex: 1;
  min-width: 160px;
  text-align: left;
}
.footer-col a {
  margin: 5px;
  color: #bbb;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-col a:hover {
  color: #fff;
}

.footer-bottom {
  padding-top: 20px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  color: #bbb;
  text-decoration: none;
  transition: color 0.3s;
}

.social-link:hover {
  color: #fff;
}









/* 底部文字布局 */
.footer-bottom {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}


h3 {
  color: #ffffff;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

p {
  color: #cccccc;
  line-height: 1.8;
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .social-top {
    gap: 3rem;
    flex-wrap: wrap;
  }

  .footer-content {
    flex-direction: column;
    gap: 30px;
  }

  .footer-links {
    flex-direction: column;
    gap: 30px;
  }
  .footer-col {
    margin-left: 20px;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
