<template>
  <div class="file-container">
    <!-- 头像 -->
    <div class="avatar-container" :class="{ 'editable': editable }" @click="openSelector">
      <img :src="displayUrl" alt="avatar" class="avatar" v-if="displayUrl">
      <!-- 遮罩层 - 仅在可编辑时显示 -->
      <div class="mask" v-if="editable">
        <p class="icon">+</p>
      </div>
    </div>
    <input 
      type="file"
      accept="image/png,image/jpeg"
      @change="handleFile"
      class="input"
      ref="avatarInput"
      >
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  editable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const avatarInput = ref(null);
const localImgUrl = ref('');

// 优先显示本地预览，否则显示数据库URL
const displayUrl = computed(() => localImgUrl.value || props.modelValue);

// 监听 editable 变化，当变为 false 时清除本地缓存
watch(() => props.editable, (newVal) => {
  if (!newVal) {
    // 退出编辑模式时，清除本地缓存，恢复为数据库中的头像
    localImgUrl.value = '';
  }
});

// 打开文件选择器
function openSelector() {
  if (!props.editable) return;
  avatarInput.value.click();
}

// 验证文件合法性
function validateFile(file) {
  const validTypes = ['image/jpeg', 'image/png'];
  const maxSize = 5 * 1024 * 1024;
  if (!validTypes.includes(file.type)) {
    ElMessage.error('请选择正确的图片格式');
    return false;
  }
  if (file.size > maxSize) {
    ElMessage.error('请上传小于等于5M的图片');
    return false;
  }
  return true;
}

// 选择文件（仅本地预览，不上传）
function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!validateFile(file)) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const base64Url = e.target.result;
    localImgUrl.value = base64Url;
    emit('update:modelValue', base64Url);
    emit('change', base64Url);
  };
}
</script>

<style scoped>
/* 输入框none隐藏 */
.input {
  display: none;
}
/* 头像容器 */
.avatar-container {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 20px auto;
  border-radius: 50%;
  border: 1px solid #ccc;
  background-color: #ffffff;
  overflow: hidden;
}
/* 可编辑状态 */
.avatar-container.editable {
  cursor: pointer;
}
/* 悬浮时显示遮罩层（仅可编辑状态） */
.avatar-container.editable:hover .mask {
  opacity: 0.6;
}
/* 遮罩层 */
.mask {
  position: absolute;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: black;
  opacity: 0;
  transition: opacity 0.5s;
}
/* +号图标 */
.icon {
  color: white;
  font-size: 80px;
}
/* 头像 */
.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
</style>