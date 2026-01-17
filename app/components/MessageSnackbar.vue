<template>
  <Transition name="snackbar">
    <div
      v-if="isVisible"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 min-w-[320px] max-w-md"
    >
      <div class="bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3">
        <i class="fa-solid fa-bell text-blue-400 mt-0.5"></i>
        <div class="flex-1">
          <p class="text-sm font-medium leading-tight">{{ message.message }}</p>
        </div>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Message {
  id: number
  type: string
  title?: string
  message: string
  source: 'direct' | 'broadcast'
}

const props = defineProps<{
  message: Message
  duration?: number
}>()

const emit = defineEmits<{
  close: []
  read: [id: number]
}>()

const isVisible = ref(true)
let timer: NodeJS.Timeout | null = null

const handleClose = () => {
  isVisible.value = false
  if (props.message.source === 'direct') {
    emit('read', props.message.id)
  }
  emit('close')
}

onMounted(() => {
  // Auto-close after duration (default 5 seconds)
  const duration = props.duration || 5000
  timer = setTimeout(handleClose, duration)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.snackbar-enter-active,
.snackbar-leave-active {
  transition: all 0.3s ease;
}

.snackbar-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.snackbar-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
