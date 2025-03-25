<template>
  <svg
      :style="svgStyle"
      aria-hidden="true"
      class="svg-icon"
      v-bind="$attrs"
  >
    <use :href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  prefix?: string
  name: string // 必填属性
  color?: string
  width?: string | number
  height?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '#icon-',
  color: '',
  width: '1em',
  height: '1em'
})

// 生成symbolId（考虑可能的命名空间）
const symbolId = computed(() => `${props.prefix}${props.name}`)

// 处理尺寸带单位（支持数字自动加px）
const formatSize = (size?: string | number) => {
  if (!size) return ''
  return typeof size === 'number' ? `${size}px` : size
}

// 组合样式对象
const svgStyle = computed(() => ({
  width: formatSize(props.width),
  height: formatSize(props.height),
  fill: props.color ? 'currentColor' : '', // 使用currentColor继承父级颜色
  color: props.color // 单独设置color以支持继承
}))
</script>

<style scoped>
.svg-icon {
  vertical-align: -0.15em; /* 图标垂直对齐方式 */
  overflow: hidden;
  outline: none;
}
</style>
