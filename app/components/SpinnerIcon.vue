<template>
  <span :class="['inline-block rounded-full animate-spin border-current', sizeClass]" :style="spinnerStyle"></span>
</template>

<script setup lang="ts">
const props = defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-3 h-3 border-2'
    case 'sm': return 'w-4 h-4 border-2'
    case 'lg': return 'w-6 h-6 border-[3px]'
    default: return 'w-4 h-4 border-2'
  }
})

const spinnerStyle = {
  borderColor: 'currentColor',
  borderTopColor: 'transparent'
}
</script>
