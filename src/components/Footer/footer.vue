<template>
  <footer class="site-footer">
    <div class="sf-line"></div>
    <div class="sf-row">
      <div class="sf-brand">
        <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
          <polygon points="16,2 30,10 30,22 16,30 2,22 2,10"
                   stroke="#0066FF" stroke-width="1.5" fill="rgba(0,102,255,0.06)"/>
          <circle cx="16" cy="16" r="3" fill="#0066FF"/>
        </svg>
        <span class="sf-name">COURSHARE<em>.io</em></span>
      </div>
      <span class="sf-copy">© 2025 COURSHARE.io — OPEN KNOWLEDGE, FOREVER</span>
      <div class="sf-links">
        <router-link to="/privacy">隐私政策</router-link>
        <router-link to="/terms">使用条款</router-link>
        <router-link to="/help">联系我们</router-link>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 无需额外逻辑，纯展示组件
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

.site-footer{
  position: relative; z-index: 2;
  padding: 2rem 6vw;
  border-top: 1px solid rgba(0,102,255,0.15);
  background: #ffffff;
}
.sf-line{
  height: 1px;
  background: linear-gradient(90deg, transparent, #0066FF, transparent);
  margin-bottom: 1.5rem; opacity: 0.3;
}
.sf-row{
  display: flex; align-items: center;
  justify-content: space-between;
}
.sf-brand{
  display: flex; align-items: center; gap: 0.6rem;
  font-family: 'Orbitron', sans-serif; font-size: 0.72rem;
  font-weight: 700; letter-spacing: 0.16em; color: #1a1a1a;
}
.sf-brand em{ font-style: normal; color: #0066FF; }
.sf-copy{
  font-family: 'JetBrains Mono', monospace; font-size: 0.52rem;
  letter-spacing: 0.1em; color: rgba(0,102,255,0.35);
}
.sf-links{ display: flex; gap: 1.5rem; }
.sf-links a{
  font-family: 'JetBrains Mono', monospace; font-size: 0.56rem;
  letter-spacing: 0.1em; color: rgba(0,102,255,0.5);
  text-decoration: none; transition: color 0.25s;
}
.sf-links a:hover{ color: #0066FF; }

@media(max-width:860px){
  .sf-row{
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>