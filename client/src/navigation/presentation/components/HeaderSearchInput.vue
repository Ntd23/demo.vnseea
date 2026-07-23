<!-- English description: Global header search trigger using Nuxt UI ContentSearch for users, pages, groups, and hashtags. -->
<template>
  <div class="w-full">
    <ClientOnly>
      <button
        type="button"
        class="header-search-fallback header-search-trigger"
        :aria-label="$t('navigation.headerSearchInput.placeholder')"
        @click="openSearch"
      >
        <span class="flex min-w-0 items-center gap-2">
          <Icon name="i-ph-magnifying-glass-bold" class="h-4 w-4 shrink-0 text-[var(--text-primary)]" />
          <span class="truncate text-sm font-medium text-[var(--text-primary)]">
            {{ $t('navigation.headerSearchInput.placeholder') }}
          </span>
        </span>
        <span class="hidden items-center gap-1 sm:flex">
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </span>
      </button>

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
withDefaults(defineProps<{
  autofocus?: boolean
}>(), {
  autofocus: false
})

const { open } = useContentSearch()

const openSearch = () => {
  open.value = true
}
</script>

<style scoped>
/* Trigger button */
.header-search-trigger {
  width: 100%;
}

/* Kbd inside trigger & fallback */
.header-search-trigger :deep(kbd),
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
</style>
