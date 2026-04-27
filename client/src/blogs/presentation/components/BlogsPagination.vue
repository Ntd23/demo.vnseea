<template>
  <nav
    class="flex flex-col gap-3 rounded-[20px] border border-[var(--border-default)] bg-white px-4 py-3.5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
    :aria-label="$t('pages.blogsPage.paginationAria')"
  >
    <p class="px-1 text-[12.5px] font-semibold text-[var(--text-tertiary)]" role="status" aria-live="polite">
      {{ $t("pages.blogsPage.pageStatus", { current: currentPage, total: totalPages }) }}
    </p>

    <div class="flex flex-wrap gap-1.5">
      <button
        class="pagination-btn flex h-9 min-w-[40px] items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--color-secondary-50)] px-3 text-[13px] font-bold text-[var(--text-secondary)] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 hover:not-disabled:border-[var(--border-strong)] hover:not-disabled:bg-white hover:not-disabled:text-[var(--text-primary)]"
        :disabled="currentPage === 1"
        type="button"
        @click="$emit('update:currentPage', currentPage - 1)"
      >
        <Icon name="i-ph-caret-left-bold" class="h-3.5 w-3.5" />
      </button>

      <button
        v-for="page in pages"
        :key="page"
        class="pagination-btn flex h-9 min-w-[36px] items-center justify-center rounded-[12px] border px-2.5 text-[13px] font-bold transition-all duration-150"
        :class="currentPage === page
          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
          : 'border-[var(--border-default)] bg-[var(--color-secondary-50)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-white hover:text-[var(--text-primary)]'"
        type="button"
        :aria-current="currentPage === page ? 'page' : undefined"
        @click="$emit('update:currentPage', page)"
      >
        {{ page }}
      </button>

      <button
        class="pagination-btn flex h-9 min-w-[40px] items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--color-secondary-50)] px-3 text-[13px] font-bold text-[var(--text-secondary)] transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 hover:not-disabled:border-[var(--border-strong)] hover:not-disabled:bg-white hover:not-disabled:text-[var(--text-primary)]"
        :disabled="currentPage === totalPages"
        type="button"
        @click="$emit('update:currentPage', currentPage + 1)"
      >
        <Icon name="i-ph-caret-right-bold" class="h-3.5 w-3.5" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  pages: number[]
}>()

defineEmits<{
  "update:currentPage": [value: number]
}>()
</script>

<style scoped>
.pagination-btn:not(:disabled):hover {
  transform: translateY(-1px);
}
.pagination-btn:active {
  transform: scale(0.95);
}
</style>
