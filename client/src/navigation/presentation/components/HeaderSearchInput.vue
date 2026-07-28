<!-- English description: Inline global search command palette for users, pages, groups, and hashtags. -->
<template>
  <div ref="rootRef" class="w-full">
    <ClientOnly>
      <UCommandPalette
        v-model:search-term="search"
        :groups="commandPaletteGroups"
        :loading="suggestionsLoading"
        :placeholder="$t('navigation.headerSearchInput.placeholder')"
        :autofocus="autofocus"
        size="md"
        preserve-group-order
        :fuse="{ fuseOptions: { includeMatches: true, threshold: 0.35 } }"
        :ui="{
          root: 'header-command-palette relative min-h-0 overflow-visible rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--bg-muted)] divide-y-0',
          input: 'header-command-palette__input',
          content: showResults
            ? 'header-command-palette__content absolute left-0 top-[calc(100%+8px)] z-[150] flex w-[min(680px,calc(100vw-24px))] min-h-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-[var(--shadow-xl)]'
            : 'hidden',
          viewport: 'header-command-palette__viewport max-h-[min(480px,calc(100dvh-140px))] scroll-py-2 overflow-y-auto px-2 py-2',
          group: 'px-1 py-2',
          label: 'px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.05em]',
          item: 'min-h-14 cursor-pointer gap-3 rounded-[var(--radius-md)] px-3 py-2.5 before:rounded-[var(--radius-md)]',
          itemLeadingIcon: 'size-9 rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-2',
          itemLeadingAvatar: 'size-10 rounded-full ring-1 ring-[var(--border-light)]',
          itemLeadingAvatarSize: 'sm',
          itemWrapper: 'min-w-0 gap-0.5',
          itemLabel: 'text-[13px] font-bold',
          itemLabelSuffix: 'ms-2 inline-flex rounded-md bg-[var(--bg-muted)] px-1.5 py-0.5 text-[10px] font-bold',
          itemDescription: 'truncate text-[12px] font-medium',
          empty: 'py-10 text-sm font-medium'
        }"
        @focusin="paletteOpen = true"
        @focusout="handleFocusOut"
      />

      <template #fallback>
        <button type="button" class="header-search-fallback" aria-hidden="true" tabindex="-1">
          <span class="flex min-w-0 items-center gap-2">
            <Icon name="i-ph-magnifying-glass-bold" class="h-4 w-4 shrink-0 text-[var(--text-primary)]" />
            <span class="truncate text-sm font-medium text-[var(--text-tertiary)]">
              {{ $t('navigation.headerSearchInput.placeholder') }}
            </span>
          </span>
          <span class="hidden items-center gap-1 sm:flex">
            <kbd>Ctrl</kbd>
            <kbd>K</kbd>
          </span>
        </button>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useHeaderSearchSuggestions } from "../../application/composables/useHeaderSearchSuggestions"

type HeaderSearchCommandItem = {
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
    color: "primary"
    variant: "soft"
  }
  onSelect: () => void
}

const props = withDefaults(defineProps<{
  autofocus?: boolean
}>(), {
  autofocus: false
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const rootRef = ref<HTMLElement | null>(null)
const paletteOpen = ref(false)
const search = ref(readQueryValue(route.query.q))
const showResults = computed(() => paletteOpen.value && Boolean(search.value.trim()))

const {
  items: suggestionItems,
  loading: suggestionsLoading,
  refresh: refreshSuggestions
} = useHeaderSearchSuggestions(search)

const commandPaletteGroups = computed(() => {
  return [
    buildGroup("users", t("community.search.tabs.users.label"), "user"),
    buildGroup("pages", t("community.search.tabs.pages.label"), "page"),
    buildGroup("groups", t("community.search.tabs.groups.label"), "group"),
    buildGroup("hashtags", t("navigation.headerSearchInput.hashtagsLabel"), "hashtag")
  ].filter(group => group !== null)
})

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function kindLabel(kind: (typeof suggestionItems.value)[number]["kind"]) {
  if (kind === "user") return t("community.search.tabs.users.label")
  if (kind === "page") return t("community.search.tabs.pages.label")
  if (kind === "group") return t("community.search.tabs.groups.label")
  return t("navigation.headerSearchInput.hashtagLabel")
}

function kindIcon(kind: (typeof suggestionItems.value)[number]["kind"]) {
  if (kind === "user") return "i-ph-user-circle-fill"
  if (kind === "page") return "i-ph-flag-fill"
  if (kind === "group") return "i-ph-users-three-fill"
  return "i-ph-hash"
}

function toCommandItem(item: (typeof suggestionItems.value)[number]): HeaderSearchCommandItem {
  return {
    id: item.id,
    label: item.title,
    description: item.subtitle,
    suffix: kindLabel(item.kind),
    icon: item.avatarUrl ? undefined : kindIcon(item.kind),
    avatar: item.avatarUrl ? { src: item.avatarUrl, alt: item.title } : undefined,
    chip: item.badge ? { label: item.badge, color: "primary", variant: "soft" } : undefined,
    onSelect: () => selectSuggestion(item.href)
  }
}

function buildGroup(
  id: string,
  label: string,
  kind: (typeof suggestionItems.value)[number]["kind"]
) {
  const items = suggestionItems.value
    .filter(item => item.kind === kind)
    .map(toCommandItem)

  if (items.length === 0) return null

  return {
    id,
    label,
    ignoreFilter: true,
    items
  }
}

function selectSuggestion(href: string) {
  paletteOpen.value = false
  void router.push(href)
}

function handleShortcut(event: KeyboardEvent) {
  if (
    (event.ctrlKey || event.metaKey)
    && event.key.toLowerCase() === "k"
    && Boolean(rootRef.value?.offsetParent)
  ) {
    event.preventDefault()
    paletteOpen.value = true
    focusSearchInput()
  }
}

function focusSearchInput() {
  void nextTick(() => {
    rootRef.value?.querySelector<HTMLInputElement>("input")?.focus()
  })
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget

  if (nextTarget instanceof Node && rootRef.value?.contains(nextTarget)) {
    return
  }

  window.setTimeout(() => {
    if (!rootRef.value?.contains(document.activeElement)) {
      paletteOpen.value = false
    }
  }, 0)
}

watch(
  () => route.query.q,
  (value) => {
    const next = readQueryValue(value)
    if (next !== search.value) search.value = next
  }
)

watch(paletteOpen, (open) => {
  if (open && search.value.trim()) {
    void refreshSuggestions()
  }
})

onMounted(() => {
  window.addEventListener("keydown", handleShortcut)

  if (props.autofocus) {
    paletteOpen.value = true
    focusSearchInput()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleShortcut)
})
</script>

<style scoped>
/* Kbd inside the SSR fallback. */
.header-search-fallback kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 5px;
  border-radius: 5px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-primary);
  box-shadow: 0 1px 0 var(--border-default);
  user-select: none;
}

/* SSR fallback button */
.header-search-fallback {
  display: flex;
  height: 2.5rem;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0 0.75rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.header-search-fallback:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-strong);
}

:global(.header-command-palette:focus-within) {
  border-color: var(--border-strong);
  background: var(--bg-surface);
}

:global(.header-command-palette__input input) {
  height: 38px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

:global(.header-command-palette__input input::placeholder) {
  color: var(--text-secondary);
  font-weight: 500;
}

:global(.header-command-palette__viewport) {
  scrollbar-color: var(--border-strong) transparent;
  scrollbar-width: thin;
}
</style>
