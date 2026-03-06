<template>
  <footer class="footer">
    <!-- 社区标签：用圆角标签展示主要社区入口，符合课程资源共享的社交属性 -->

    <div class="container">
      <!-- 主要内容区域：平台标识 + 三列导航/联系信息 -->
      <div class="footer-main">
        <!-- 平台简介区：用 emoji 和标题强调资源共享理念 -->
        <div class="brand">
          <div class="logo">
            <span class="logo-icon">📚</span>
            <h2 class="logo-title">CourseShare</h2>
          </div>
          <p class="brand-slogan">汇聚优质课程 · 共享学习资源</p>
          <p class="brand-description">
            一个开放、协作的课程资源共享社区，帮助学习者更高效地获取知识。
          </p>
        </div>

        <!-- 链接区块：分为课程分类、资源中心、联系我们三大块 -->
        <div class="link-blocks">
          <!-- 课程分类 -->
          <div class="block">
            <h3>课程分类</h3>
            <ul>
              <li><a href="#">前端开发</a></li>
              <li><a href="#">后端开发</a></li>
              <li><a href="#">移动开发</a></li>
              <li><a href="#">人工智能</a></li>
              <li><a href="#">产品/设计</a></li>
            </ul>
          </div>

          <!-- 资源中心 -->
          <div class="block">
            <h3>资源中心</h3>
            <ul>
              <li><a href="#">学习路线</a></li>
              <li><a href="#">项目实战</a></li>
              <li><a href="#">题库/笔记</a></li>
              <li><a href="#">开源资料</a></li>
              <li><a href="#">推荐书单</a></li>
            </ul>
          </div>

          <!-- 联系我们 -->
          <div class="block contact-block">
            <h3>联系我们</h3>
            <ul>
              <li><span>📧 邮箱：</span><a href="mailto:course@share.com">course@share.com</a></li>
              <li><span>💬 QQ群：</span><span>123456789</span></li>
              <li><span>📢 公众号：</span><span>课程共享平台</span></li>
              <li><span>⏰ 在线时间：</span><span>9:00 - 22:00</span></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 底部版权与法律链接 -->
      <div class="footer-bottom">
        <p class="copyright">© 2025 课程资源共享平台. 保留所有权利。</p>
        <div class="legal-links">
          <router-link to="/sitemap">网站地图</router-link>
          <router-link to="/terms">使用条款</router-link>
          <router-link to="/privacy">隐私政策</router-link>
          <router-link to="/help">帮助中心</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 无需额外逻辑，纯展示组件
</script>

<style scoped>
/* ========== 基础重置 & 字体 ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.footer {
  background-color: #0b0f17; /* 深色背景，突出科技感/专业感 */
  color: #e0e4f0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

/* ========== 主容器 ========== */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 2rem 1.5rem;
}

/* ========== 主要内容区域（品牌 + 三列链接） ========== */
.footer-main {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem 4rem;
  margin-bottom: 3rem;
}

/* 品牌区域 */
.brand {
  flex: 1 1 260px;
  min-width: 240px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 2.4rem;
  line-height: 1;
}

.logo-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
  white-space: nowrap;
}

.brand-slogan {
  font-size: 1.2rem;
  font-weight: 500;
  color: #a5b4fc; /* 淡紫色点缀，增加层次 */
  margin-bottom: 0.75rem;
}

.brand-description {
  color: #a0a8c0;
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 300px;
}

/* 链接区块容器 */
.link-blocks {
  flex: 3;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem 3rem;
  justify-content: space-between;
}

/* 单个链接块 */
.block {
  flex: 1 1 160px;
  min-width: 150px;
}

.block h3 {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  letter-spacing: 0.5px;
  border-left: 4px solid #a5b4fc;
  padding-left: 0.75rem;
}

.block ul {
  list-style: none;
}

.block li {
  margin-bottom: 0.7rem;
  font-size: 0.95rem;
}

.block a {
  color: #b0b8d0;
  text-decoration: none;
  transition: color 0.2s, padding-left 0.2s;
  display: inline-block;
}

.block a:hover {
  color: #fff;
  padding-left: 5px;
}

/* 联系块特殊处理：有些行不是链接，需要保持颜色 */
.contact-block li {
  display: flex;
  flex-wrap: wrap;
  color: #b0b8d0;
}

.contact-block li span:first-child {
  width: 70px;          /* 使标签对齐更美观 */
  color: #a0a8c0;
  flex-shrink: 0;
}

.contact-block li span:last-child {
  color: #e0e4f0;
  word-break: break-word;
  flex: 1;
}

.contact-block a {
  color: #b0b8d0;
  text-decoration: none;
  border-bottom: 1px dotted transparent;
  transition: color 0.2s, border-color 0.2s;
}

.contact-block a:hover {
  color: #fff;
  border-bottom-color: #a5b4fc;
}

/* ========== 底部版权区域 ========== */
.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1.2rem 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.copyright {
  color: #8e96b0;
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2rem;
}

.legal-links a {
  color: #b0b8d0;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 0.9rem;
}

.legal-links a:hover {
  color: #fff;
}

/* ========== 响应式优化 ========== */
@media (max-width: 900px) {
  .footer-main {
    gap: 2.5rem;
  }

  .brand {
    flex-basis: 100%;
  }

  .brand-description {
    max-width: none;
  }
}

@media (max-width: 600px) {
  .community-tags {
    gap: 0.8rem;
  }

  .tag {
    padding: 0.4rem 1.2rem;
    font-size: 0.9rem;
  }

  .container {
    padding: 2rem 1.2rem 1rem;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .legal-links {
    justify-content: center;
  }

  .block h3 {
    font-size: 1.1rem;
  }
}
</style>