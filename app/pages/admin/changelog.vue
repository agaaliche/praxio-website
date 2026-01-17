<template>
  <div class="min-h-screen bg-gray-50">
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-display font-bold text-gray-900">{{ t('admin.changelog.title') }}</h1>
        <p class="mt-1 text-gray-600">{{ t('admin.changelog.subtitle') }}</p>
      </div>

      <div class="bg-white rounded-lg shadow">
        <!-- Search -->
        <div class="p-6 border-b border-gray-200">
          <div class="relative">
            <input
              v-model="search"
              type="text"
              :placeholder="t('admin.changelog.search')"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <ClientOnly>
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400"></i>
            </ClientOnly>
            <button
              v-if="search"
              @click="search = ''"
              class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <ClientOnly>
                <i class="fa-solid fa-xmark"></i>
              </ClientOnly>
            </button>
          </div>
        </div>

        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
          <div class="col-span-3 flex items-center gap-2 cursor-pointer hover:text-primary-600" @click="toggleSort('date')">
            {{ t('admin.changelog.headers.date') }}
            <ClientOnly>
              <i v-if="sortBy === 'date'" :class="['fa-solid', sortOrder === 'asc' ? 'fa-caret-up' : 'fa-caret-down']"></i>
            </ClientOnly>
          </div>
          <div class="col-span-9 flex items-center gap-2 cursor-pointer hover:text-primary-600" @click="toggleSort('message')">
            {{ t('admin.changelog.headers.description') }}
            <ClientOnly>
              <i v-if="sortBy === 'message'" :class="['fa-solid', sortOrder === 'asc' ? 'fa-caret-up' : 'fa-caret-down']"></i>
            </ClientOnly>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && displayedCommits.length === 0" class="p-6">
          <div class="space-y-3">
            <div v-for="i in 10" :key="i" class="animate-pulse flex gap-4">
              <div class="h-4 bg-gray-200 rounded w-32"></div>
              <div class="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else-if="!loading && filteredCommits.length === 0" class="text-center py-12">
          <ClientOnly>
            <i class="fa-solid fa-code-branch text-6xl text-gray-300 mb-4"></i>
          </ClientOnly>
          <p class="text-xl text-gray-600">{{ t('admin.changelog.noCommits') }}</p>
        </div>

        <!-- Commit List -->
        <div v-else ref="scrollContainer" @scroll="handleScroll" class="max-h-[600px] overflow-y-auto">
          <div
            v-for="(item, index) in displayedCommits"
            :key="`${item.hash}-${index}`"
            class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-primary-50 transition group"
          >
            <!-- Date Column -->
            <div class="col-span-3 flex items-center gap-2 text-sm">
              <span class="text-gray-900">{{ formatDate(item.date) }}</span>
              <span class="text-gray-500">{{ formatTime(item.date) }}</span>
            </div>

            <!-- Message Column -->
            <div class="col-span-9 flex items-center min-w-0">
              <div class="relative group/tooltip flex-1 min-w-0">
                <span class="text-sm font-medium text-gray-900 block truncate cursor-pointer">
                  {{ item.message }}
                </span>
                <!-- Tooltip -->
                <div class="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-max max-w-md">
                  <div class="bg-blue-600 text-white text-sm rounded-lg shadow-lg p-3">
                    <div class="mb-2">{{ item.message }}</div>
                    <div class="flex items-center gap-3 text-xs">
                      <span class="inline-flex items-center gap-1 bg-blue-700 px-2 py-1 rounded">
                        <i class="fa-solid fa-hashtag"></i>
                        {{ item.hash }}
                      </span>
                      <span class="inline-flex items-center gap-1 bg-blue-700 px-2 py-1 rounded">
                        <i class="fa-solid fa-user"></i>
                        {{ item.author }}
                      </span>
                    </div>
                    <div class="absolute left-4 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading More Indicator -->
          <div v-if="loadingMore" class="text-center py-4">
            <SpinnerIcon size="lg" class="text-primary-600 mx-auto" />
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <i class="fa-solid fa-circle-exclamation text-red-600 mt-0.5"></i>
          <div class="flex-1">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
          <button @click="error = ''" class="text-red-600 hover:text-red-700">
            <ClientOnly>
              <i class="fa-solid fa-xmark"></i>
            </ClientOnly>
          </button>
        </div>
      </div>

      <!-- Floating Refresh Button -->
      <button
        @click="loadCommits"
        :disabled="loading"
        class="fixed bottom-8 right-8 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <ClientOnly>
          <i :class="['fa-solid fa-arrows-rotate', loading && 'fa-spin']"></i>
        </ClientOnly>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'siteadmin',
  layout: 'default'
})

const { t, locale } = useI18n()
const { getAuthHeaders } = useAuth()

interface Commit {
  hash: string
  author: string
  date: string
  message: string
}

const commits = ref<Commit[]>([])
const search = ref('')
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const displayCount = ref(50)
const scrollContainer = ref<HTMLElement | null>(null)
const sortBy = ref<'date' | 'message'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

const ITEMS_PER_LOAD = 50

const filteredCommits = computed(() => {
  let filtered = search.value
    ? commits.value.filter(commit => {
        const searchLower = search.value.toLowerCase()
        return commit.message.toLowerCase().includes(searchLower) ||
          commit.hash.toLowerCase().includes(searchLower) ||
          commit.author.toLowerCase().includes(searchLower) ||
          commit.date.toLowerCase().includes(searchLower)
      })
    : [...commits.value]

  // Apply sorting
  filtered.sort((a, b) => {
    let compareA = sortBy.value === 'date' ? String(a.date).slice(0, 10) : a.message.toLowerCase()
    let compareB = sortBy.value === 'date' ? String(b.date).slice(0, 10) : b.message.toLowerCase()

    if (sortBy.value === 'date') {
      return sortOrder.value === 'asc' ? compareA.localeCompare(compareB) : compareB.localeCompare(compareA)
    } else {
      if (compareA < compareB) return sortOrder.value === 'asc' ? -1 : 1
      if (compareA > compareB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    }
  })

  return filtered
})

const displayedCommits = computed(() => {
  return filteredCommits.value.slice(0, displayCount.value)
})

const hasMore = computed(() => {
  return displayCount.value < filteredCommits.value.length
})

const loadCommits = async () => {
  loading.value = true
  error.value = ''
  displayCount.value = ITEMS_PER_LOAD

  try {
    const headers = await getAuthHeaders()
    const response = await $fetch<{ success: boolean, commits: Commit[] }>('/api/admin/git-commits', { headers })

    if (response && response.success) {
      commits.value = response.commits
    } else {
      error.value = $i18n.t('admin.changelog.loadError')
    }
  } catch (err) {
    console.error('Error loading git commits:', err)
    error.value = $i18n.t('admin.changelog.loadError')
  } finally {
    loading.value = false
  }
}

const toggleSort = (column: 'date' | 'message') => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = column === 'date' ? 'desc' : 'asc'
  }
}

const handleScroll = async () => {
  if (!scrollContainer.value || loadingMore.value || !hasMore.value) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

  // Load more when user scrolls to 80% of the container
  if (scrollPercentage > 0.8) {
    loadingMore.value = true

    // Simulate async loading with small delay
    await nextTick()
    setTimeout(() => {
      displayCount.value += ITEMS_PER_LOAD
      loadingMore.value = false
    }, 100)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleTimeString(locale.value, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadCommits()
})
</script>
