<template>
  <section class="rounded-[30px] border border-dashed border-[var(--border-strong)] bg-white/90 px-6 py-12 text-center shadow-[var(--shadow-md)]">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
      <Icon name="i-ph-briefcase-fill" class="h-8 w-8" />
    </div>
    <h3 class="mt-4 text-[1.35rem] font-black tracking-[-0.04em] text-[var(--text-primary)]">
      Chưa có việc làm phù hợp
    </h3>
    <p class="mx-auto mt-2 max-w-[480px] text-body-secondary">
      Hãy đổi từ khóa, ngành nghề, địa điểm hoặc loại hình làm việc để xem thêm cơ hội khác.
    </p>
    <button
      class="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] px-5 py-3 text-[14px] font-bold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
      type="button"
      @click="$emit('reset')"
    >
      <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
      Xem tất cả
    </button>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  reset: []
}>()
</script>
