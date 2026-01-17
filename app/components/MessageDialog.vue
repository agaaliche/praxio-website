<template>
  <Transition name="dialog">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="handleBackdropClick"
    >
      <div
        class="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-start justify-between p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-bell text-blue-500 text-xl"></i>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ message.title || 'Notification' }}
            </h3>
          </div>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {{ message.message }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            @click="handleClose"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Got it
          </button>
        </div>
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
}>()

const emit = defineEmits<{
  close: []
  read: [id: number]
}>()

const isVisible = ref(true)

const handleClose = () => {
  isVisible.value = false
  if (props.message.source === 'direct') {
    emit('read', props.message.id)
  }
  emit('close')
}

const handleBackdropClick = () => {
  // Optional: close on backdrop click
  // handleClose()
}
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div,
.dialog-leave-to > div {
  transform: scale(0.95) translateY(-20px);
}
</style>
