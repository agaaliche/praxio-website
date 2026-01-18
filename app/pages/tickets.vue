<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <i class="fa-solid fa-spinner fa-spin text-4xl text-gray-400"></i>
    </div>

    <!-- Not authenticated -->
    <div v-else-if="!isAuthenticated" class="flex flex-col items-center justify-center py-20">
      <i class="fa-solid fa-lock text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-600">Please sign in to access tickets</p>
    </div>

    <!-- Authenticated - show tickets -->
    <template v-else>
      <!-- Tab Navigation -->
      <div class="bg-white border-b border-gray-200">
        <div class="px-6">
          <div class="flex space-x-8">
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
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <TicketsSubmitTicket
        v-if="currentTab === 'submit'"
        @ticket-submitted="handleTicketSubmitted"
      />
      <TicketsMonitorTickets
        v-else-if="currentTab === 'monitor'"
        :key="refreshKey"
        @tickets-loaded="handleTicketsLoaded"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
});

const route = useRoute();
const { $i18n } = useNuxtApp();
const { user, isAuthenticated, isLoading } = useAuth();

const SUPERUSER_ID = 'wbIWGJDt0JUBF09LUphT1rlDWGS2';

const currentTab = ref('submit');
const userTicketsCount = ref(0);
const adminTicketsCount = ref(0);
const refreshKey = ref(0);

const isSuperuser = computed(() => {
  return user.value?.uid === SUPERUSER_ID;
});

const handleTicketSubmitted = () => {
  // Switch to monitor tab and refresh
  currentTab.value = 'monitor';
  refreshKey.value++;
};

const handleTicketsLoaded = (tickets: any[]) => {
  userTicketsCount.value = tickets.filter((t: any) => t.status !== 'resolved').length;
};

// Load admin ticket count if superuser
const loadAdminTicketCount = async () => {
  if (!isSuperuser.value) return;
  
  try {
    const { data } = await useFetch('/api/tickets/stats');
    if (data.value) {
      adminTicketsCount.value = (data.value as any).submitted || 0;
    }
  } catch (error) {
    console.error('Error loading admin ticket count:', error);
  }
};

onMounted(() => {
  loadAdminTicketCount();
});

useHead({
  title: () => $i18n.t('tickets.title')
});
</script>
