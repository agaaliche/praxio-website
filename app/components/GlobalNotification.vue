<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div
        v-if="notificationStore.show.value"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md"
      >
        <div
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg',
            typeClasses
          ]"
        >
          <i :class="['text-lg', iconClass]"></i>
          <span class="flex-1 text-sm font-medium" v-html="notificationStore.message.value"></span>
          <button
            v-if="notificationStore.closeable.value"
            @click="hideNotification"
            class="ml-2 opacity-70 hover:opacity-100 transition"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { notificationStore, hideNotification } from '~/stores/notification'

const typeClasses = computed(() => {
  switch (notificationStore.type.value) {
    case 'success':
      return 'bg-green-600 text-white'
    case 'error':
      return 'bg-red-600 text-white'
    case 'warning':
      return 'bg-yellow-500 text-white'
    case 'info':
      return 'bg-blue-600 text-white'
    default:
      return 'bg-gray-800 text-white'
  }
})

const iconClass = computed(() => {
  switch (notificationStore.type.value) {
    case 'success':
      return 'fa-solid fa-check-circle'
    case 'error':
      return 'fa-solid fa-exclamation-circle'
    case 'warning':
      return 'fa-solid fa-exclamation-triangle'
    case 'info':
      return 'fa-solid fa-info-circle'
    default:
      return 'fa-solid fa-bell'
  }
})
</script>

<style scoped>
.slide-down-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translate(-50%, -100%);
}

.slide-down-enter-to {
  opacity: 1;
  transform: translate(-50%, 0);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
