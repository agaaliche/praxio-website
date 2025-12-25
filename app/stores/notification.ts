import { ref } from 'vue'

// Shared notification state
const show = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'warning' | 'info'>('success')
const timeout = ref(3000)
const closeable = ref(true)

let timeoutId: ReturnType<typeof setTimeout> | null = null

// Show notification function
export function showNotification(
  msg: string,
  notificationType: 'success' | 'error' | 'warning' | 'info' = 'success',
  duration = 3000,
  isCloseable = true
) {
  // Clear any existing timeout
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  message.value = msg
  type.value = notificationType
  timeout.value = duration
  closeable.value = isCloseable
  show.value = true

  // Auto-hide after duration
  if (duration > 0) {
    timeoutId = setTimeout(() => {
      show.value = false
    }, duration)
  }
}

// Hide notification function
export function hideNotification() {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  show.value = false
}

// Export reactive state
export const notificationStore = {
  show,
  message,
  type,
  timeout,
  closeable
}
