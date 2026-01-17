<template>
  <div class="min-h-screen bg-gray-50">
    <div>
      <!-- Admin Tickets Page -->
      <div class="mb-6">
        <h1 class="text-2xl font-display font-bold text-gray-900">{{ $t('tickets.adminPanelTitle') }}</h1>
        <p class="mt-1 text-gray-600">Manage and respond to user support tickets</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <ClientOnly>
            <i class="fa-solid fa-ticket text-gray-500 text-3xl mb-2"></i>
          </ClientOnly>
          <div class="text-3xl font-bold text-gray-900">{{ stats.total || 0 }}</div>
          <div class="text-sm text-gray-500">{{ $t('tickets.totalTickets') }}</div>
        </div>
        <div class="bg-blue-50 rounded-lg shadow p-6 text-center">
          <ClientOnly>
            <i class="fa-solid fa-inbox text-blue-500 text-3xl mb-2"></i>
          </ClientOnly>
          <div class="text-3xl font-bold text-blue-900">{{ stats.submitted || 0 }}</div>
          <div class="text-sm text-blue-700">{{ $t('tickets.newSubmissions') }}</div>
        </div>
        <div class="bg-orange-50 rounded-lg shadow p-6 text-center">
          <ClientOnly>
            <i class="fa-solid fa-hourglass-half text-orange-500 text-3xl mb-2"></i>
          </ClientOnly>
          <div class="text-3xl font-bold text-orange-900">{{ stats.pending || 0 }}</div>
          <div class="text-sm text-orange-700">{{ $t('tickets.inProgress') }}</div>
        </div>
        <div class="bg-green-50 rounded-lg shadow p-6 text-center">
          <ClientOnly>
            <i class="fa-solid fa-check-circle text-green-500 text-3xl mb-2"></i>
          </ClientOnly>
          <div class="text-3xl font-bold text-green-900">{{ stats.resolved || 0 }}</div>
          <div class="text-sm text-green-700">{{ $t('tickets.resolvedTickets') }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('tickets.filterStatus') }}
            </label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option :value="null">{{ $t('tickets.filterAll') }}</option>
              <option value="submitted">{{ $t('tickets.statusSubmitted') }}</option>
              <option value="received">{{ $t('tickets.statusReceived') }}</option>
              <option value="pending">{{ $t('tickets.statusPending') }}</option>
              <option value="resolved">{{ $t('tickets.statusResolved') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('tickets.filterType') }}
            </label>
            <select
              v-model="filters.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option :value="null">{{ $t('tickets.filterAll') }}</option>
              <option value="bug">{{ $t('tickets.typeBug') }}</option>
              <option value="feature">{{ $t('tickets.typeFeature') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('tickets.filterPriority') }}
            </label>
            <select
              v-model="filters.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option :value="null">{{ $t('tickets.filterAll') }}</option>
              <option value="nice-to-have">{{ $t('tickets.priorityNicetohave') }}</option>
              <option value="low">{{ $t('tickets.priorityLow') }}</option>
              <option value="medium">{{ $t('tickets.priorityMedium') }}</option>
              <option value="high">{{ $t('tickets.priorityHigh') }}</option>
              <option value="critical">{{ $t('tickets.priorityCritical') }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <SpinnerIcon size="lg" class="text-gray-400 mx-auto" />
          <p class="mt-4 text-gray-500">{{ $t('tickets.loading') }}</p>
        </div>

        <div v-else-if="filteredTickets.length === 0" class="text-center py-12">
          <ClientOnly>
            <i class="fa-solid fa-inbox text-6xl text-gray-300"></i>
          </ClientOnly>
          <p class="text-xl text-gray-600 mt-4">{{ $t('tickets.noTicketsFound') }}</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('tickets.user') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('tickets.titleLabel') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('tickets.type') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('tickets.priority') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('tickets.status') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('tickets.created') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('tickets.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="ticket in filteredTickets" :key="ticket.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ ticket.userName }}</div>
                  <div class="text-sm text-gray-500">{{ ticket.userEmail }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ ticket.title }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      ticket.type === 'bug' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    ]"
                  >
                    <ClientOnly>
                      <i :class="['fa-solid text-xs mr-1', ticket.type === 'bug' ? 'fa-bug' : 'fa-lightbulb']"></i>
                    </ClientOnly>
                    {{ ticket.type === 'bug' ? $t('tickets.typeBug') : $t('tickets.typeFeature') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded border',
                      getPriorityClasses(ticket.priority)
                    ]"
                  >
                    {{ $t(`tickets.priority${capitalizeFirst(ticket.priority.replace('-', ''))}`) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    v-model="ticket.status"
                    @change="updateStatus(ticket)"
                    class="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                  >
                    <option value="submitted">{{ $t('tickets.statusSubmitted') }}</option>
                    <option value="received">{{ $t('tickets.statusReceived') }}</option>
                    <option value="pending">{{ $t('tickets.statusPending') }}</option>
                    <option value="resolved">{{ $t('tickets.statusResolved') }}</option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(ticket.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="viewDetails(ticket)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <ClientOnly>
                      <i class="fa-solid fa-eye"></i>
                    </ClientOnly>
                  </button>
                  <button
                    @click="deleteTicket(ticket.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <ClientOnly>
                      <i class="fa-solid fa-trash"></i>
                    </ClientOnly>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Ticket Details Modal -->
    <Teleport to="body">
      <div 
        v-if="selectedTicket" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="selectedTicket = null"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('tickets.ticketDetails') }}</h3>
            <button @click="selectedTicket = null" class="p-2 text-gray-500 hover:text-gray-700 rounded-lg">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div class="p-6 space-y-4">
            <!-- User Info -->
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-user text-red-600"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ selectedTicket.userName }}</div>
                <div class="text-sm text-gray-500">{{ selectedTicket.userEmail }}</div>
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('tickets.titleLabel') }}</label>
              <div class="text-gray-900 font-medium">{{ selectedTicket.title }}</div>
            </div>

            <!-- Type & Priority -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('tickets.type') }}</label>
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full',
                    selectedTicket.type === 'bug' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  ]"
                >
                  <i :class="['fa-solid text-xs mr-2', selectedTicket.type === 'bug' ? 'fa-bug' : 'fa-lightbulb']"></i>
                  {{ selectedTicket.type === 'bug' ? $t('tickets.typeBug') : $t('tickets.typeFeature') }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('tickets.priority') }}</label>
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 text-sm font-medium rounded border',
                    getPriorityClasses(selectedTicket.priority)
                  ]"
                >
                  {{ $t(`tickets.priority${capitalizeFirst(selectedTicket.priority.replace('-', ''))}`) }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('tickets.descriptionLabel') }}</label>
              <div class="p-4 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap">{{ selectedTicket.description }}</div>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('tickets.status') }}</label>
              <select
                v-model="selectedTicket.status"
                @change="updateStatus(selectedTicket)"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="submitted">{{ $t('tickets.statusSubmitted') }}</option>
                <option value="received">{{ $t('tickets.statusReceived') }}</option>
                <option value="pending">{{ $t('tickets.statusPending') }}</option>
                <option value="resolved">{{ $t('tickets.statusResolved') }}</option>
              </select>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('tickets.adminNotes') }}</label>
              <textarea
                v-model="adminNote"
                rows="3"
                :placeholder="$t('tickets.adminNotesPlaceholder')"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              ></textarea>
              <button
                @click="saveNote"
                :disabled="savingNote || !adminNote.trim()"
                class="mt-2 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <SpinnerIcon v-if="savingNote" />
                {{ $t('tickets.saveNote') }}
              </button>
            </div>

            <!-- Existing Notes -->
            <div v-if="selectedTicket.notes">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('tickets.existingNotes') }}</label>
              <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-gray-700 whitespace-pre-wrap">{{ selectedTicket.notes }}</div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
              <div>
                <span class="font-medium">{{ $t('tickets.created') }}:</span>
                {{ formatDate(selectedTicket.createdAt) }}
              </div>
              <div>
                <span class="font-medium">{{ $t('tickets.updated') }}:</span>
                {{ formatDate(selectedTicket.updatedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'siteadmin']
});

const { $i18n } = useNuxtApp();
const { getIdToken } = useAuth();

const loading = ref(true);
const tickets = ref<any[]>([]);
const selectedTicket = ref<any>(null);
const adminNote = ref('');
const savingNote = ref(false);
const stats = ref({
  total: 0,
  submitted: 0,
  received: 0,
  pending: 0,
  resolved: 0
});

const filters = reactive({
  status: null,
  type: null,
  priority: null
});

const filteredTickets = computed(() => {
  let result = tickets.value;
  
  if (filters.status) {
    result = result.filter(t => t.status === filters.status);
  }
  if (filters.type) {
    result = result.filter(t => t.type === filters.type);
  }
  if (filters.priority) {
    result = result.filter(t => t.priority === filters.priority);
  }
  
  return result;
});

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getPriorityClasses = (priority: string) => {
  const classes: Record<string, string> = {
    'nice-to-have': 'border-gray-300 text-gray-600',
    'low': 'border-blue-300 text-blue-600',
    'medium': 'border-orange-300 text-orange-600',
    'high': 'border-red-400 text-red-600',
    'critical': 'border-red-600 text-red-700 font-semibold'
  };
  return classes[priority] || 'border-gray-300 text-gray-600';
};

const formatDate = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString($i18n.locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    const token = await getIdToken();
    const [ticketsRes, statsRes] = await Promise.all([
      $fetch('/api/tickets/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      $fetch('/api/tickets/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    tickets.value = ticketsRes || [];
    stats.value = statsRes || {
      total: 0,
      submitted: 0,
      received: 0,
      pending: 0,
      resolved: 0
    };
  } catch (error: any) {
    console.error('Error loading tickets:', error);
    useNuxtApp().$toast?.error($i18n.t('tickets.failedToLoad'));
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (ticket: any) => {
  try {
    const token = await getIdToken();
    await $fetch(`/api/tickets/${ticket.id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { status: ticket.status }
    });
    useNuxtApp().$toast?.success($i18n.t('tickets.updateSuccess'));
    await loadData(); // Reload to update stats
  } catch (error: any) {
    console.error('Error updating status:', error);
    useNuxtApp().$toast?.error($i18n.t('tickets.updateError'));
  }
};

const deleteTicket = async (ticketId: number) => {
  if (!confirm($i18n.t('tickets.confirmDelete'))) return;

  try {
    const token = await getIdToken();
    await $fetch(`/api/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    useNuxtApp().$toast?.success($i18n.t('tickets.deleteSuccess'));
    await loadData();
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    useNuxtApp().$toast?.error($i18n.t('tickets.deleteError'));
  }
};

const viewDetails = (ticket: any) => {
  selectedTicket.value = { ...ticket };
  adminNote.value = '';
};

const saveNote = async () => {
  if (!selectedTicket.value || !adminNote.value.trim()) return;
  
  savingNote.value = true;
  try {
    const token = await getIdToken();
    
    await $fetch(`/api/tickets/${selectedTicket.value.id}/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { note: adminNote.value.trim() }
    });
    
    adminNote.value = '';
    useNuxtApp().$toast?.success($i18n.t('tickets.noteSaved'));
    await loadData();
    // Refresh selected ticket data
    const updated = tickets.value.find(t => t.id === selectedTicket.value.id);
    if (updated) {
      selectedTicket.value = { ...updated };
    }
  } catch (error: any) {
    console.error('Error saving note:', error);
    useNuxtApp().$toast?.error($i18n.t('tickets.noteError'));
  } finally {
    savingNote.value = false;
  }
};

onMounted(() => {
  loadData();
});

useHead({
  title: () => $i18n.t('tickets.adminPanelTitle')
});
</script>
