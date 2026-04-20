<template>
  <aside class="space-y-4">
    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">{{ $t("pages.fundingPage.sidebarOverview") }}</p>
      <div class="mt-4 grid gap-3">
        <div v-for="item in stats" :key="item.label" class="rounded-[18px] bg-[var(--color-secondary-100)] px-3 py-3">
          <p class="text-[12px] font-bold text-[var(--text-tertiary)]">{{ item.label }}</p>
          <p class="mt-1 text-[1.2rem] font-black text-[var(--text-primary)]">{{ item.value }}</p>
        </div>
      </div>
    </section>
    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">{{ $t("pages.fundingPage.sidebarCategories") }}</p>
      <div class="mt-4 space-y-2">
        <button v-for="category in categories" :key="category.value" class="flex w-full items-center justify-between rounded-[18px] bg-[var(--bg-surface-hover)] px-3 py-3 text-left transition hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]" type="button" @click="$emit('selectCategory', category.value)">
          <span class="inline-flex items-center gap-2 text-[13px] font-bold">
            <Icon :name="category.icon" class="h-4 w-4 text-[var(--color-primary-600)]" />
            {{ category.label }}
          </span>
          <span class="text-[12px] font-black text-[var(--text-tertiary)]">{{ category.count }}</span>
        </button>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number }>
  categories: ReadonlyArray<{ label: string; value: string; icon: string; count: number }>
}>()
defineEmits<{ selectCategory: [value: string] }>()
</script>
