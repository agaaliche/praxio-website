<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <form @submit.prevent="submitTicket" class="space-y-6">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('tickets.titleLabel') }} *
          </label>
          <input
            id="title"
            v-model="ticket.title"
            type="text"
            required
            maxlength="255"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            :placeholder="$t('tickets.titlePlaceholder')"
          />
          <p class="text-sm text-gray-500 mt-1">{{ ticket.title.length }}/255</p>
        </div>

        <!-- Type and Priority Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Type -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tickets.typeLabel') }} *
            </label>
            <select
              id="type"
              v-model="ticket.type"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="bug">{{ $t('tickets.typeBug') }}</option>
              <option value="feature">{{ $t('tickets.typeFeature') }}</option>
            </select>
          </div>

          <!-- Priority -->
          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tickets.priorityLabel') }} *
            </label>
            <select
              id="priority"
              v-model="ticket.priority"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="nice-to-have">
                <span :class="getPriorityColor('nice-to-have')">{{ $t('tickets.priorityNicetohave') }}</span>
              </option>
              <option value="low">{{ $t('tickets.priorityLow') }}</option>
              <option value="medium">{{ $t('tickets.priorityMedium') }}</option>
              <option value="high">{{ $t('tickets.priorityHigh') }}</option>
              <option value="critical">{{ $t('tickets.priorityCritical') }}</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('tickets.descriptionLabel') }} *
          </label>
          <textarea
            id="description"
            v-model="ticket.description"
            required
            maxlength="2000"
            rows="6"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            :placeholder="$t('tickets.descriptionPlaceholder')"
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">
            {{ ticket.description.length }}/2000 - {{ $t('tickets.descriptionHint') }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!isFormValid || submitting"
          class="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <SpinnerIcon v-if="submitting" />
          <ClientOnly v-else>
            <i class="fa-solid fa-paper-plane"></i>
          </ClientOnly>
          {{ submitting ? $t('tickets.submitting') : $t('tickets.submitButton') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  ticketSubmitted: []
}>();

const { $i18n } = useNuxtApp();
const user = useSupabaseUser();

const ticket = reactive({
  title: '',
  type: 'bug',
  priority: 'medium',
  description: ''
});

const submitting = ref(false);

const isFormValid = computed(() => {
  return (
    ticket.title.trim().length > 0 &&
    ticket.description.trim().length > 0 &&
    ticket.type &&
    ticket.priority
  );
});

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    'nice-to-have': 'text-gray-500',
    'low': 'text-blue-500',
    'medium': 'text-orange-500',
    'high': 'text-deep-orange-500',
    'critical': 'text-red-600'
  };
  return colors[priority] || 'text-gray-500';
};

const submitTicket = async () => {
  if (!isFormValid.value || !user.value) return;

  submitting.value = true;
  try {
    const { data, error } = await useFetch('/api/tickets', {
      method: 'POST',
      body: {
        title: ticket.title,
        type: ticket.type,
        priority: ticket.priority,
        description: ticket.description
      }
    });

    if (error.value) {
      throw new Error(error.value.message || 'Failed to submit ticket');
    }

    // Reset form
    ticket.title = '';
    ticket.type = 'bug';
    ticket.priority = 'medium';
    ticket.description = '';

    // Show success notification
    useNuxtApp().$toast?.success($i18n.t('tickets.submitSuccess'));

    emit('ticketSubmitted');
  } catch (error: any) {
    console.error('❌ Error submitting ticket:', error);
    useNuxtApp().$toast?.error(
      error.message || $i18n.t('tickets.submitError')
    );
  } finally {
    submitting.value = false;
  }
};
</script>
