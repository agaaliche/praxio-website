<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow">
        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
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
        <div class="p-6">
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

const { $i18n } = useNuxtApp();
const user = useSupabaseUser();

const SUPERUSER_ID = 'wbIWGJDt0JUBF09LUphT1rlDWGS2';

const currentTab = ref('submit');
const userTicketsCount = ref(0);
const adminTicketsCount = ref(0);
const refreshKey = ref(0);

const isSuperuser = computed(() => {
  return user.value?.id === SUPERUSER_ID;
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
