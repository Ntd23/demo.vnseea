<!-- English description: Global header search input with responsive command palette suggestions. -->
<template>
  <div
    ref="containerRef"
    class="relative w-full"
    @focusout="handleFocusOut"
  >
    <form class="group relative w-full" @submit.prevent="submitSearch">
      <UInput
        v-model="search"
        :autofocus="props.autofocus"
        size="xl"
        :placeholder="$t('navigation.headerSearchInput.placeholder')"
        type="search"
        icon="i-ph-magnifying-glass-duotone"
        :ui="{
          wrapper: 'relative',
          base: 'h-12 w-full rounded-xl border-none bg-secondary-50/50 pl-12 pr-12 font-medium text-slate-700 ring-1 ring-secondary-100 transition-all duration-150 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:shadow-lg focus:shadow-primary-500/10',
          icon: {
            leading: {
              wrapper: 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4',
              pointer: 'pointer-events-none',
              base: 'h-5.5 w-5.5 text-slate-400 transition-colors group-focus-within:text-[#0000ff]',
            },
          },
        }"
        @focus="handleFocus"
      >
        <template #trailing>
          <div class="hidden items-center gap-1 rounded-lg bg-white px-2 py-1 opacity-60 shadow-sm ring-1 ring-secondary-100 transition-opacity group-focus-within:opacity-100 sm:flex">
            <kbd class="font-sans text-[10px] font-semibold text-slate-500">K</kbd>
          </div>
        </template>
      </UInput>
    </form>

    <div
      v-if="suggestionsOpen"
      class="header-search-suggestions surface-card"
      @pointerdown.prevent
    >
      <UCommandPalette
        :input="false"
        :loading="suggestionsLoading"
        :groups="commandGroups"
        :fuse="{ resultLimit: 12, matchAllWhenSearchEmpty: false }"
        :ui="{
          root: 'border-0 bg-transparent shadow-none min-h-0',
          viewport: 'max-h-none divide-y-0 p-0',
          empty: 'py-4 text-sm text-[var(--text-secondary)]',
          label: 'px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]',
          item: 'rounded-xl p-0',
          itemWrapper: 'min-w-0',
          itemLabel: 'sr-only',
          itemDescription: 'sr-only',
          itemTrailing: 'hidden'
        }"
      >
        <template #item="{ item }">
          <div class="header-search-item">
            <div class="header-search-item__avatar">
              <NuxtImg
                v-if="item.avatarUrl"
                :src="item.avatarUrl"
                :alt="item.label"
                class="header-search-item__avatar-image"
                width="40"
                height="40"
                loading="lazy"
              />

              <Icon
                v-else
                :name="item.icon || 'i-ph-magnifying-glass-duotone'"
                class="h-5 w-5 text-white"
              />
            </div>

            <div class="header-search-item__content">
              <div class="header-search-item__title-row">
                <span class="header-search-item__title">
                  {{ item.label }}
                </span>

                <UBadge
                  v-if="item.badge"
                  :label="item.badge"
                  size="xs"
                  color="primary"
                  variant="soft"
                  class="header-search-item__badge"
                />
              </div>

              <p class="header-search-item__subtitle">
                {{ item.description }}
              </p>
            </div>

            <span class="header-search-item__kind">
              {{ item.suffix }}
            </span>
          </div>
        </template>

        <template #empty>
          <div class="header-search-suggestions__state">
            <Icon
              :name="suggestionsLoading ? 'i-lucide-loader-2' : 'i-ph-magnifying-glass-duotone'"
              class="h-4 w-4"
              :class="suggestionsLoading ? 'animate-spin text-primary-500' : 'text-slate-400'"
            />

            <span>
              {{ suggestionsLoading ? $t('community.search.loadingResults') : $t('community.search.emptyTitle') }}
            </span>
          </div>
        </template>
      </UCommandPalette>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { useHeaderSearchSuggestions } from '../../application/composables/useHeaderSearchSuggestions'

const props = withDefaults(defineProps<{
  autofocus?: boolean
}>(), {
  autofocus: false
})

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '')
  return typeof value === 'string' ? value : ''
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const containerRef = ref<HTMLElement | null>(null)
const search = ref(readQueryValue(route.query.q))

let hideTimeout: ReturnType<typeof window.setTimeout> | null = null

const {
  items: suggestionItems,
  loading: suggestionsLoading,
  open: suggestionsOpen,
  show: showSuggestions
} = useHeaderSearchSuggestions(search)

function createCommandItem(
  item: (typeof suggestionItems.value)[number],
  options: {
    label: string
    icon?: string
  }
) {
  return {
    id: item.id,
    label: item.title,
    description: item.subtitle,
    badge: item.badge,
    avatarUrl: item.avatarUrl,
    icon: item.avatarUrl ? undefined : options.icon,
    suffix: options.label,
    onSelect: () => selectSuggestion(item.href)
  }
}

const commandGroups = computed(() => {
  const users = suggestionItems.value
    .filter(item => item.kind === 'user')
    .map(item => createCommandItem(item, {
      label: t('community.search.tabs.users.label'),
      icon: 'i-ph-user-circle-fill'
    }))

  const pages = suggestionItems.value
    .filter(item => item.kind === 'page')
    .map(item => createCommandItem(item, {
      label: t('community.search.tabs.pages.label'),
      icon: 'i-ph-flag-fill'
    }))

  const groups = suggestionItems.value
    .filter(item => item.kind === 'group')
    .map(item => createCommandItem(item, {
      label: t('community.search.tabs.groups.label'),
      icon: 'i-ph-users-three-fill'
    }))

  const hashtags = suggestionItems.value
    .filter(item => item.kind === 'hashtag')
    .map(item => createCommandItem(item, {
      label: 'Hashtag',
      icon: 'i-ph-hash'
    }))

  return [
    {
      id: 'users',
      label: t('community.search.tabs.users.label'),
      ignoreFilter: true,
      items: users
    },
    {
      id: 'pages',
      label: t('community.search.tabs.pages.label'),
      ignoreFilter: true,
      items: pages
    },
    {
      id: 'groups',
      label: t('community.search.tabs.groups.label'),
      ignoreFilter: true,
      items: groups
    },
    {
      id: 'hashtags',
      label: 'Hashtags',
      ignoreFilter: true,
      items: hashtags
    }
  ].filter(group => group.items.length > 0)
})

watch(
  () => route.query.q,
  (value) => {
    const nextValue = readQueryValue(value)

    if (nextValue !== search.value) {
      search.value = nextValue
    }
  }
)

watchDebounced(
  search,
  (newValue) => {
    if (route.path === '/search') {
      const keyword = newValue.trim()
      const nextQuery = keyword ? { q: keyword } : {}

      void router.replace({
        path: '/search',
        query: nextQuery
      })
    }
  },
  {
    debounce: 500,
    maxWait: 1000
  }
)

function selectSuggestion(href: string) {
  clearHideTimeout()
  suggestionsOpen.value = false

  void router.push(href)
}

function clearHideTimeout() {
  if (hideTimeout) {
    window.clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

function handleFocus() {
  clearHideTimeout()
  showSuggestions()
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget instanceof Node
    ? event.relatedTarget
    : null

  if (nextTarget && containerRef.value?.contains(nextTarget)) {
    return
  }

  clearHideTimeout()

  hideTimeout = window.setTimeout(() => {
    suggestionsOpen.value = false
  }, 120)
}

function submitSearch() {
  clearHideTimeout()
  suggestionsOpen.value = false

  const keyword = search.value.trim()
  const nextQuery = keyword ? { q: keyword } : {}

  void router.push({
    path: '/search',
    query: nextQuery
  })
}
</script>

<style scoped>
.header-search-suggestions {
  position: fixed;
  top: 64px;
  left: 12px;
  right: 12px;
  z-index: 60;
  display: flex;
  max-height: calc(100dvh - 84px);
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px;
  border-radius: 18px;
}

@media (min-width: 640px) {
  .header-search-suggestions {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    right: 0;
    max-height: min(70vh, 420px);
  }
}

.header-search-item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.header-search-item:hover {
  background: var(--bg-surface-hover);
}

@media (min-width: 640px) {
  .header-search-item {
    grid-template-columns: 40px minmax(0, 1fr) auto;
  }
}

.header-search-item__avatar {
  display: flex;
  width: 40px;
  height: 40px;
  min-width: 40px;
  max-width: 40px;
  min-height: 40px;
  max-height: 40px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, #94a3b8 0%, #0000ff 100%);
  box-shadow: var(--shadow-sm);
}

.header-search-item__avatar-image {
  width: 40px;
  height: 40px;
  display: block;
  object-fit: cover;
}

.header-search-item__content {
  min-width: 0;
}

.header-search-item__title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.header-search-item__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-search-item__badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding-inline: 8px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.header-search-item__subtitle {
  margin-top: 2px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--text-secondary);
}

.header-search-item__kind {
  display: none;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (min-width: 640px) {
  .header-search-item__kind {
    display: inline-flex;
  }
}

.header-search-suggestions__state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>