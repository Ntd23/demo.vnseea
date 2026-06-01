<!-- English description: Client-only Nuxt UI ContentSearch palette wired to global header search suggestions. -->
<template>
  <LazyUContentSearch
    v-model:search-term="search"
    :groups="contentSearchGroups"
    :loading="suggestionsLoading"
    :placeholder="$t('navigation.headerSearchInput.placeholder')"
    :autofocus="true"
    :color-mode="false"
    shortcut="ctrl_k"
    :fuse="{ fuseOptions: { includeMatches: true, threshold: 0.35 } }"
    :ui="{
      class:'rounded-[var(--radius-xl)]',
      modal: 'sm:max-w-xl overflow-hidden rounded-[var(--radius-xl)] search-glass-modal shadow-[0_20px_60px_rgba(0,0,255,0.25),0_4px_16px_rgba(0,0,0,0.12)]',
      input: [
        'border-0 search-glass-input bg-transparent',
        'text-white placeholder:text-white/55',
        'rounded-none focus:ring-0 h-12 px-4 text-sm font-medium',
      ],
      group: 'p-1.5',
      groupLabel: 'px-2 py-1 text-[10px] font-bold uppercase tracking-[0.07em] text-white/45',
      item: {
        base: 'rounded-[var(--radius-md)] px-2 py-1.5 gap-2.5 transition-all duration-150 cursor-pointer',
        active: 'bg-white/15 text-white',
        inactive: 'text-white/80',
      },
      itemLabel: 'text-sm font-semibold text-white',
      itemDescription: 'text-xs text-white truncate',
      itemTrailing: 'text-[10px] font-bold uppercase tracking-[0.07em] text-white/45',
      itemIcon: 'h-4 w-4 text-white',
      itemAvatar: 'rounded-[6px]',
      itemAvatarSize: 'xs',
      empty: 'py-6 text-sm text-white/60',
      footer: 'search-glass-footer bg-transparent px-3 py-2 text-white/55',
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
  return 'Hashtag'
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

const searchActionGroup = computed(() => {
  const keyword = search.value.trim()
  if (!keyword) return null

  return {
    id: 'search-action',
    label: t('navigation.headerSearchInput.placeholder'),
    ignoreFilter: true,
    items: [{
      id: `search:${keyword}`,
      label: keyword,
      suffix: '/search',
      icon: 'i-ph-magnifying-glass-duotone',
      onSelect: () => submitSearch(keyword)
    }]
  }
})

const contentSearchGroups = computed(() => {
  return [
    searchActionGroup.value,
    buildGroup('users', t('community.search.tabs.users.label'), 'user'),
    buildGroup('pages', t('community.search.tabs.pages.label'), 'page'),
    buildGroup('groups', t('community.search.tabs.groups.label'), 'group'),
    buildGroup('hashtags', 'Hashtags', 'hashtag')
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

function submitSearch(value = search.value) {
  closeSearch()
  const keyword = value.trim()
  void router.push({ path: '/search', query: keyword ? { q: keyword } : {} })
}
</script>

<style>
/* Glass morphism search palette — brand blue tint + blur */
.search-glass-modal {
  background: linear-gradient(
    270deg,
    #0000ff 0%,
    #0000ffc4 100%
  ) !important;
  backdrop-filter: blur(28px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
  /* outline bypasses global .border { border-width: 0 } override */
  outline: 1.5px solid rgba(255, 255, 255, 0.25) !important;
  outline-offset: 0;
  box-shadow:
    0 0 0 0.5px rgba(255, 255, 255, 0.12) inset,
    0 20px 60px rgba(0, 0, 255, 0.28),
    0 4px 16px rgba(0, 0, 0, 0.12) !important;
    border: 1px solid white;
    border-radius: 20px;
}

/* Force all child texts inside the modal to white tones */
.search-glass-modal,
.search-glass-modal * {
  color: #ffffff !important;
}

/* Text hierarchy: Group labels / section headers */
.search-glass-modal [class*="groupLabel"],
.search-glass-modal [class*="group-label"],
.search-glass-modal [role="group"] > div:first-child,
.search-glass-modal [role="group"] > span:first-child,
.search-glass-modal [role="presentation"] {
  color: rgba(255, 255, 255, 0.55) !important;
  font-weight: 700 !important;
}

/* Text hierarchy: Descriptions, Suffixes, and Trailing metadata */
.search-glass-modal [class*="itemDescription"],
.search-glass-modal [class*="itemTrailing"],
.search-glass-modal [class*="item-description"],
.search-glass-modal [class*="item-trailing"],
.search-glass-modal [class*="empty"],
.search-glass-modal [class*="footer"] {
  color: rgba(255, 255, 255, 0.60) !important;
}

/* Placeholder inside input */
.search-glass-modal input::placeholder {
  color: rgba(255, 255, 255, 0.55) !important;
}

/* Icons and Close/Search Buttons */
.search-glass-modal button,
.search-glass-modal svg,
.search-glass-modal [class*="icon"],
.search-glass-modal [class*="button"] {
  color: rgba(255, 255, 255, 0.80) !important;
}

/* Active item highlight */
.search-glass-modal [class*="item"][class*="active"],
.search-glass-modal [class*="item"]:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

/* Separator below the input */
.search-glass-input {
  border-bottom-width: 1.5px !important;
  border-bottom-style: solid !important;
  border-bottom-color: rgba(255, 255, 255, 0.18) !important;
}

/* Separator above the footer */
.search-glass-footer {
  border-top-width: 1.5px !important;
  border-top-style: solid !important;
  border-top-color: rgba(255, 255, 255, 0.12) !important;
}
</style>
