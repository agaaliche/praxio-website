<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <SpinnerIcon size="lg" class="text-gray-400 mx-auto" />
      <p class="mt-4 text-gray-500">{{ $t('tickets.loading') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="tickets.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
      <i class="fa-solid fa-inbox text-6xl text-gray-300"></i>
      <p class="text-xl font-medium text-gray-600 mt-4">{{ $t('tickets.noTickets') }}</p>
      <p class="text-sm text-gray-500">{{ $t('tickets.noTicketsMessage') }}</p>
    </div>

    <!-- Tickets List -->
    <div v-else class="space-y-4">
      <div
        v-for="ticket in tickets"
        :key="ticket.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Header -->
        <div class="p-4 flex items-center justify-between border-b border-gray-100">
          <div class="flex items-center flex-1 min-w-0">
            <i 
              :class="[
                'fa-solid mr-3 text-lg',
                ticket.type === 'bug' ? 'fa-bug text-red-500' : 'fa-lightbulb text-blue-500'
              ]"
            ></i>
            <span class="font-medium text-gray-900 truncate">{{ ticket.title }}</span>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <span
              :class="[
                'px-3 py-1 text-xs font-medium rounded-full',
                getStatusClasses(ticket.status)
              ]"
            >
              {{ $t(`tickets.status${capitalizeFirst(ticket.status)}`) }}
            </span>
            <button
              @click="refreshTicket(ticket.id)"
              :disabled="refreshing === ticket.id"
              class="text-gray-400 hover:text-red-600 transition p-2"
            >
              <i :class="['fa-solid fa-arrows-rotate', refreshing === ticket.id && 'fa-spin']"></i>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <!-- Priority and Date -->
          <div class="flex items-center gap-2 mb-3 text-sm">
            <span
              :class="[
                'px-2 py-1 rounded border',
                getPriorityClasses(ticket.priority)
              ]"
            >
              <i :class="getPriorityIcon(ticket.priority)" class="text-xs mr-1"></i>
              {{ $t(`tickets.priority${capitalizeFirst(ticket.priority.replace('-', ''))}`) }}
            </span>
            <span class="text-gray-500">
              <i class="fa-regular fa-clock text-xs mr-1"></i>
              {{ formatDate(ticket.createdAt) }}
            </span>
            <span v-if="ticket.resolvedAt" class="text-green-600">
              <i class="fa-solid fa-check text-xs mr-1"></i>
              {{ $t('tickets.resolvedAt') }} {{ formatDate(ticket.resolvedAt) }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-700 whitespace-pre-wrap mb-4">{{ ticket.description }}</p>

          <!-- Fix Feedback for resolved tickets -->
          <div v-if="ticket.status === 'resolved'" class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-700">{{ $t('tickets.fixFeedback') }}</span>
              <select
                v-model="ticket.fixFeedback"
                @change="submitFeedback(ticket)"
                :disabled="submittingFeedback === ticket.id"
                class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option :value="null">{{ $t('tickets.selectFeedback') }}</option>
                <option value="worked">{{ $t('tickets.fixWorked') }}</option>
                <option value="not_worked">{{ $t('tickets.fixNotWorked') }}</option>
              </select>
            </div>
          </div>

          <!-- Notes Section -->
          <div v-if="ticket.notes || ticket.status !== 'submitted'" class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <i class="fa-solid fa-comments text-gray-500 mr-2"></i>
                <span class="text-sm font-medium text-gray-700">{{ $t('tickets.notes') }}</span>
              </div>
              <button
                @click="openAddNoteDialog(ticket)"
                class="text-sm text-red-600 hover:text-red-700 flex items-center"
              >
                <i class="fa-solid fa-plus mr-1"></i>
                {{ $t('tickets.addNote') }}
              </button>
            </div>

            <!-- Notes List -->
            <div v-if="getNotes(ticket).length > 0" class="space-y-2">
              <div
                v-for="(note, idx) in getNotes(ticket)"
                :key="idx"
                :class="[
                  'p-3 rounded-lg',
                  note.isAdmin ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span
                    :class="[
                      'text-xs font-medium px-2 py-0.5 rounded',
                      note.isAdmin ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                    ]"
                  >
                    {{ note.isAdmin ? $t('tickets.support') : $t('tickets.you') }}
                  </span>
                  <span class="text-xs text-gray-500">{{ formatDate(note.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ note.note }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">{{ $t('tickets.noNotes') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Note Dialog -->
    <Teleport to="body">
      <div
        v-if="addNoteDialog"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="addNoteDialog = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              <i class="fa-solid fa-comment-plus mr-2"></i>
              {{ $t('tickets.addNoteTitle') }}
            </h3>
          </div>
          <div class="p-4">
            <textarea
              v-model="newNoteText"
              rows="4"
              :placeholder="$t('tickets.notePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            ></textarea>
          </div>
          <div class="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              @click="addNoteDialog = false"
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {{ $t('tickets.cancel') }}
            </button>
            <button
              @click="submitNote"
              :disabled="!newNoteText.trim() || submittingNote"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <SpinnerIcon v-if="submittingNote" />
              {{ $t('tickets.send') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  ticketsLoaded: [tickets: any[]]
}>();

const { $i18n } = useNuxtApp();
const { user } = useAuth();

const loading = ref(true);
const tickets = ref<any[]>([]);
const refreshing = ref<number | null>(null);
const submittingFeedback = ref<number | null>(null);
const addNoteDialog = ref(false);
const selectedTicketForNote = ref<any>(null);
const newNoteText = ref('');
const submittingNote = ref(false);

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getStatusClasses = (status: string) => {
  const classes: Record<string, string> = {
    submitted: 'bg-gray-100 text-gray-700',
    received: 'bg-blue-100 text-blue-700',
    pending: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
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

const getPriorityIcon = (priority: string) => {
  const icons: Record<string, string> = {
    'nice-to-have': 'fa-solid fa-circle',
    'low': 'fa-solid fa-circle',
    'medium': 'fa-solid fa-circle',
    'high': 'fa-solid fa-circle-exclamation',
    'critical': 'fa-solid fa-triangle-exclamation'
  };
  return icons[priority] || 'fa-solid fa-circle';
};

const formatDate = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString($i18n.locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getNotes = (ticket: any) => {
  if (!ticket.notes) return [];
  try {
    const notes = JSON.parse(ticket.notes);
    return notes.map((note: any) => ({
      ...note,
      isAdmin: note.userId === 'wbIWGJDt0JUBF09LUphT1rlDWGS2'
    }));
  } catch (e) {
    return [];
  }
};

const loadTickets = async () => {
  loading.value = true;
  try {
    const { getIdToken } = useAuth();
    const token = await getIdToken();
    const { data, error } = await useFetch('/api/tickets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (error.value) throw new Error(error.value.message);
    tickets.value = data.value || [];
    emit('ticketsLoaded', tickets.value);
  } catch (error: any) {
    console.error('Error loading tickets:', error);
    useNuxtApp().$toast?.error('Failed to load tickets');
  } finally {
    loading.value = false;
  }
};

const refreshTicket = async (ticketId: number) => {
  refreshing.value = ticketId;
  try {
    const { getIdToken } = useAuth();
    const token = await getIdToken();
    const { data, error } = await useFetch(`/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (error.value) throw new Error(error.value.message);
    const index = tickets.value.findIndex(t => t.id === ticketId);
    if (index !== -1 && data.value) {
      tickets.value[index] = data.value;
    }
  } catch (error: any) {
    console.error('Error refreshing ticket:', error);
  } finally {
    refreshing.value = null;
  }
};

const submitFeedback = async (ticket: any) => {
  submittingFeedback.value = ticket.id;
  try {
    const { getIdToken } = useAuth();
    const token = await getIdToken();
    const { error } = await useFetch(`/api/tickets/${ticket.id}/feedback`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { fixFeedback: ticket.fixFeedback }
    });
    if (error.value) throw new Error(error.value.message);
    useNuxtApp().$toast?.success($i18n.t('tickets.updateSuccess'));
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    useNuxtApp().$toast?.error($i18n.t('tickets.updateError'));
  } finally {
    submittingFeedback.value = null;
  }
};

const openAddNoteDialog = (ticket: any) => {
  selectedTicketForNote.value = ticket;
  newNoteText.value = '';
  addNoteDialog.value = true;
};

const submitNote = async () => {
  if (!newNoteText.value.trim() || !selectedTicketForNote.value) return;

  submittingNote.value = true;
  try {
    const { getIdToken } = useAuth();
    const token = await getIdToken();
    const { error } = await useFetch(`/api/tickets/${selectedTicketForNote.value.id}/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { note: newNoteText.value }
    });
    if (error.value) throw new Error(error.value.message);
    
    await refreshTicket(selectedTicketForNote.value.id);
    addNoteDialog.value = false;
    useNuxtApp().$toast?.success('Note added successfully');
  } catch (error: any) {
    console.error('Error adding note:', error);
    useNuxtApp().$toast?.error('Failed to add note');
  } finally {
    submittingNote.value = false;
  }
};

onMounted(() => {
  loadTickets();
});
</script>
