<template>
  <div
    class="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-white/90 px-6 py-12 text-center shadow-[var(--shadow-md)]"
    role="status"
    aria-live="polite"
  >
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
      <Icon name="i-ph-newspaper-clipping-fill" class="h-7 w-7" />
    </div>
    <h3 class="mt-4 text-[1.3rem] font-black tracking-[-0.04em] text-[var(--text-primary)]">
      {{ $t("pages.blogsPage.emptyTitle") }}
    </h3>
    <p class="mx-auto mt-2 max-w-[460px] text-body-secondary">
      {{ $t("pages.blogsPage.emptyDescription") }}
    </p>
    <UButton
      color="primary"
      variant="solid"
      size="lg"
      class="mt-5 rounded-[var(--radius-full)] px-5 py-3 text-[14px] font-bold shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
      @click="$emit('reset')"
    >
      <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
      {{ $t("pages.blogsPage.viewAll") }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  reset: []
}>()
</script>
