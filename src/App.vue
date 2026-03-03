<template>
  <Menu /> <!-- 新增菜单组件 -->
  <main>
    <router-view></router-view>
  </main>
  <Footer />
</template>


<script setup lang="ts">
import Menu from "@/components/Menu/menu.vue";
import Footer from "@/components/Footer/footer.vue";

</script>
<style scoped>/* 保留全局布局样式 */
body,html {
  scroll-behavior: smooth;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}
main {
  flex: 1;
}
.parallax__layers > * {
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>
