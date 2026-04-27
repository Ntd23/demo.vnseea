<template>
  <div
    class="flex flex-col gap-3 rounded-[22px] border border-[var(--border-default)] bg-white px-4 py-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
    role="region"
    aria-labelledby="blogs-results-heading"
    aria-live="polite"
  >
    <div>
      <div class="flex items-center gap-2">
        <span class="inline-flex h-5 w-5 items-center justify-center rounded-[7px] bg-[var(--color-primary-50)]">
          <Icon name="i-ph-article-fill" class="h-3 w-3 text-[var(--color-primary-600)]" />
        </span>
        <span class="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
          {{ $t("pages.blogsPage.results") }}
        </span>
      </div>
      <h2 id="blogs-results-heading" class="mt-1 text-[17px] font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">
        {{ heading }}
      </h2>
      <p class="mt-0.5 text-[12.5px] text-[var(--text-secondary)]">
        {{ $t("pages.blogsPage.resultMeta", { count, sort: sortLabel }) }}
      </p>
    </div>

    <button
      class="inline-flex items-center gap-2 rounded-[14px] border border-[var(--border-default)] bg-[var(--color-secondary-50)] px-3.5 py-2 text-[12.5px] font-bold text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--border-strong)] hover:bg-white hover:text-[var(--text-primary)]"
      type="button"
      @click="$emit('reset')"
    >
      <Icon name="i-ph-arrow-counter-clockwise" class="h-3.5 w-3.5" />
      {{ $t("pages.blogsPage.reset") }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  heading: string
  count: number
  sortLabel: string
}>()

defineEmits<{
  reset: []
}>()
</script>
