<template>
  <div v-if="show" class="h-full opacity-50 flex flex-col items-center justify-center p-4">
    <i 
      class="fa-solid fa-box-open text-[125px] mb-2"
      :style="{ color: iconColor }"
    ></i>
    <div :class="['text-gray-500', textClass]">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  context: {
    type: String,
    default: 'default',
    validator: (value: string) => ['patients', 'results', 'appointments', 'data', 'default'].includes(value)
  },
  textClass: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: 'rgba(0,0,0,0.20)'
  }
})

const messages: Record<string, string> = {
  patients: 'No patients',
  results: 'No results',
  appointments: 'No appointments',
  data: 'No data',
  default: 'No data'
}

const message = computed(() => messages[props.context] || messages.default)
</script>
