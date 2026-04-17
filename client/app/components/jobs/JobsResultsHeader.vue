<template>
  <div class="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white/95 px-4 py-4 shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        Kết quả
      </p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">
        {{ heading }}
      </h2>
      <p class="mt-1 text-body-secondary">
        {{ count }} việc làm phù hợp · {{ sortLabel }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary-500)] px-3 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
        type="button"
        @click="$emit('openPost')"
      >
        <Icon name="i-ph-plus-circle-fill" class="h-4 w-4" />
        Đăng job
      </button>
      <button
        class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-[var(--border-default)] bg-white px-3 text-[13px] font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
        type="button"
        @click="$emit('reset')"
      >
        <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
        Đặt lại
      </button>
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
  openPost: []
  reset: []
}>()
</script>
