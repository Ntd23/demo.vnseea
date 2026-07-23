<!-- English description: Client-only Nuxt UI ContentSearch palette wired to global header search suggestions. -->
<template>
  <LazyUContentSearch
    v-model:search-term="search"
    :groups="contentSearchGroups"
    :loading="suggestionsLoading"
    :placeholder="$t('navigation.headerSearchInput.placeholder')"
    :autofocus="true"
    :color-mode="false"
    size="lg"
    shortcut="ctrl_k"
    :fuse="{ fuseOptions: { includeMatches: true, threshold: 0.35 } }"
    :ui="{
      modal: 'search-content-modal sm:max-w-[680px] h-auto max-h-[min(680px,calc(100dvh-32px))] overflow-hidden rounded-2xl border border-indigo-100 bg-[#f4f6ff] shadow-[0_22px_70px_rgba(30,41,100,0.20)]',
      root: 'search-content-root min-h-0 bg-transparent divide-y divide-indigo-100/80',
      input: 'search-content-input border-0 bg-white/65 px-2 text-[var(--text-primary)] backdrop-blur-xl',
      close: 'search-content-close me-3 rounded-xl text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)]',
      content: 'min-h-0 bg-transparent',
      viewport: 'search-content-viewport max-h-[min(560px,calc(100dvh-150px))] scroll-py-2 overflow-y-auto px-2 py-2',
      group: 'search-content-group px-1 py-2',
      label: 'px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--text-tertiary)]',
      item: 'search-content-item min-h-14 cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[var(--text-primary)] before:rounded-xl data-highlighted:before:bg-[#f2f4ff]',
      itemLeadingIcon: 'size-9 rounded-xl bg-slate-100 p-2 text-[var(--text-secondary)] group-data-highlighted:text-[var(--text-brand)]',
      itemLeadingAvatar: 'size-10 rounded-full ring-1 ring-slate-200',
      itemLeadingAvatarSize: 'sm',
      itemWrapper: 'min-w-0 gap-0.5',
      itemLabel: 'text-[13px] font-bold text-[var(--text-primary)]',
      itemLabelBase: 'text-[var(--text-primary)] [&>mark]:rounded-sm [&>mark]:bg-[#e8eaff] [&>mark]:text-[var(--text-brand)]',
      itemLabelSuffix: 'ms-2 inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]',
      itemDescription: 'truncate text-[12px] font-medium text-[var(--text-secondary)]',
      itemTrailing: 'text-[11px] font-semibold text-[var(--text-tertiary)]',
      empty: 'py-10 text-sm font-medium text-[var(--text-secondary)]',
      footer: 'border-t border-indigo-100 bg-white/45 px-4 py-2.5 text-xs text-[var(--text-secondary)]',
    }"
  />
</template>

<script setup lang="ts">
import { useHeaderSearchSuggestions } from '../../application/composables/useHeaderSearchSuggestions'

type HeaderSearchContentItem = {
  id: string
  label: string
  description?: string
  suffix?: string
  icon?: string
  avatar?: {
    src: string
    alt: string
  }
  chip?: {
    label: string
    color: 'primary'
    variant: 'soft'
  }
  onSelect: () => void
}

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '')
  return typeof value === 'string' ? value : ''
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const search = ref(readQueryValue(route.query.q))
const { open: contentSearchOpen } = useContentSearch()

const {
  items: suggestionItems,
  loading: suggestionsLoading,
  refresh: refreshSuggestions
} = useHeaderSearchSuggestions(search)

function kindLabel(kind: (typeof suggestionItems.value)[number]['kind']) {
  if (kind === 'user') return t('community.search.tabs.users.label')
  if (kind === 'page') return t('community.search.tabs.pages.label')
  if (kind === 'group') return t('community.search.tabs.groups.label')
  return t('navigation.headerSearchInput.hashtagLabel')
}

function kindIcon(kind: (typeof suggestionItems.value)[number]['kind']) {
  if (kind === 'user') return 'i-ph-user-circle-fill'
  if (kind === 'page') return 'i-ph-flag-fill'
  if (kind === 'group') return 'i-ph-users-three-fill'
  return 'i-ph-hash'
}

function toContentSearchItem(item: (typeof suggestionItems.value)[number]): HeaderSearchContentItem {
  return {
    id: item.id,
    label: item.title,
    description: item.subtitle,
    suffix: kindLabel(item.kind),
    icon: item.avatarUrl ? undefined : kindIcon(item.kind),
    avatar: item.avatarUrl ? { src: item.avatarUrl, alt: item.title } : undefined,
    chip: item.badge ? { label: item.badge, color: 'primary', variant: 'soft' } : undefined,
    onSelect: () => selectSuggestion(item.href)
  }
}

const contentSearchGroups = computed(() => {
  return [
    buildGroup('users', t('community.search.tabs.users.label'), 'user'),
    buildGroup('pages', t('community.search.tabs.pages.label'), 'page'),
    buildGroup('groups', t('community.search.tabs.groups.label'), 'group'),
    buildGroup('hashtags', t('navigation.headerSearchInput.hashtagsLabel'), 'hashtag')
  ].filter(Boolean)
})

function buildGroup(
  id: string,
  label: string,
  kind: (typeof suggestionItems.value)[number]['kind']
) {
  const items = suggestionItems.value
    .filter(item => item.kind === kind)
    .map(toContentSearchItem)

  if (items.length === 0) return null

  return {
    id,
    label,
    ignoreFilter: true,
    items
  }
}

watch(
  () => route.query.q,
  (value) => {
    const next = readQueryValue(value)
    if (next !== search.value) search.value = next
  }
)

watchDebounced(
  search,
  (value) => {
    if (route.path === '/search') {
      const keyword = value.trim()
      void router.replace({ path: '/search', query: keyword ? { q: keyword } : {} })
    }
  },
  { debounce: 500, maxWait: 1000 }
)

watch(contentSearchOpen, (open) => {
  if (open && search.value.trim()) void refreshSuggestions()
})

function closeSearch() {
  contentSearchOpen.value = false
}

function selectSuggestion(href: string) {
  closeSearch()
  void router.push(href)
}

</script>

<style>
/* Glass morphism search palette — brand blue tint + blur */
.search-content-modal {
  background:
    radial-gradient(circle at 12% 0%, rgba(255, 255, 255, 0.96) 0, rgba(255, 255, 255, 0) 38%),
    linear-gradient(145deg, #f8faff 0%, #f0f2ff 58%, #f5f3ff 100%) !important;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 22px 70px rgba(30, 41, 100, 0.2) !important;
}

.search-content-input {
  border-bottom: 1px solid rgba(199, 210, 254, 0.7) !important;
  background: rgba(255, 255, 255, 0.62) !important;
  backdrop-filter: blur(18px);
}

.search-content-input input {
  height: 58px !important;
  color: #0f172a !important;
  font-size: 15px !important;
  font-weight: 650 !important;
}

.search-content-input input::placeholder {
  color: #94a3b8 !important;
  font-weight: 500 !important;
}

.search-content-input svg {
  color: #64748b !important;
}

.search-content-group + .search-content-group {
  border-top: 1px solid rgba(224, 231, 255, 0.9);
}

.search-content-item {
  transition: background-color 0.15s ease, color 0.15s ease;
}

.search-content-item[data-highlighted],
.search-content-item:hover {
  background: rgba(255, 255, 255, 0.58) !important;
  color: var(--bg-brand) !important;
  box-shadow: 0 4px 18px rgba(79, 70, 229, 0.07);
}

.search-content-viewport {
  scrollbar-color: #cbd5e1 transparent;
  scrollbar-width: thin;
}

@media (max-width: 639px) {
  .search-content-modal {
    width: calc(100vw - 20px) !important;
    max-height: calc(100dvh - 20px) !important;
    border-radius: 16px !important;
  }

  .search-content-input input {
    height: 54px !important;
    font-size: 14px !important;
  }
}
</style>
