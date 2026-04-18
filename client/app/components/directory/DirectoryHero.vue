<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-lg)] sm:p-7">
    <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[760px]">
        <p class="text-label-secondary text-[var(--color-primary-600)]">P-44 · Directory</p>
        <h1 class="mt-2 text-display text-[2.15rem] leading-tight text-[var(--text-primary)] sm:text-[3rem]">
          Danh mục VNSEEA
        </h1>
        <p class="mt-3 text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">
          Một nơi để đi nhanh tới users, pages, groups, market, events, jobs, blogs, funding, live, watch, games và forum.
        </p>
      </div>
      <div class="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
        <div v-for="item in stats" :key="item.label" class="rounded-[22px] bg-[var(--bg-surface-hover)] p-4">
          <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{{ item.label }}</p>
          <p class="mt-2 text-[1.55rem] font-black leading-none text-[var(--text-primary)]">{{ item.value }}</p>
          <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
}>()
</script>
