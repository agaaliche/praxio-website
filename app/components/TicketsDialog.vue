<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      @click="emit('close')"
    />
  </Transition>

  <!-- Dialog -->
  <Transition name="dialog">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-ticket text-red-600 text-lg"></i>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('tickets.title') }}</h2>
          </div>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 px-6">
          <nav class="flex space-x-8" aria-label="Tabs">
            <button
              @click="currentTab = 'submit'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition',
                currentTab === 'submit'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i class="fa-solid fa-plus mr-2"></i>
              {{ $t('tickets.submitTab') }}
            </button>
            <button
              @click="currentTab = 'monitor'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2',
                currentTab === 'monitor'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i class="fa-solid fa-list mr-2"></i>
              {{ $t('tickets.monitorTab') }}
              <span
                v-if="userTicketsCount > 0"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
              >
                {{ userTicketsCount }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto">
          <TicketsSubmitTicket
            v-if="currentTab === 'submit'"
            @ticket-submitted="handleTicketSubmitted"
          />
          <TicketsMonitorTickets
            v-else-if="currentTab === 'monitor'"
            :key="refreshKey"
            @tickets-loaded="handleTicketsLoaded"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits<{
  close: []
}>();

const { $i18n } = useNuxtApp();

const currentTab = ref('submit');
const userTicketsCount = ref(0);
const refreshKey = ref(0);

const handleTicketSubmitted = () => {
  // Switch to monitor tab and refresh
  currentTab.value = 'monitor';
  refreshKey.value++;
};

const handleTicketsLoaded = (tickets: any[]) => {
  userTicketsCount.value = tickets.filter((t: any) => t.status !== 'resolved').length;
};

// Close dialog on Escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Prevent body scroll when dialog is open
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
