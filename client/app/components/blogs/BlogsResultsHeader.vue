<template>
  <div
    class="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white/95 px-4 py-4 shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between"
    role="region"
    aria-labelledby="blogs-results-heading"
    aria-live="polite"
  >
    <div>
      <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-primary)]">
        {{ $t("pages.blogsPage.results") }}
      </UBadge>
      <h2 id="blogs-results-heading" class="mt-1 text-heading text-[var(--text-primary)]">
        {{ heading }}
      </h2>
      <p class="mt-1 text-body-secondary">
        {{ $t("pages.blogsPage.resultMeta", { count, sort: sortLabel }) }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <UButton
        color="neutral"
        variant="outline"
        size="md"
        class="rounded-[18px] px-3 text-[13px] font-semibold"
        type="button"
        @click="$emit('reset')"
      >
        <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
        {{ $t("pages.blogsPage.reset") }}
      </UButton>
    </div>
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
