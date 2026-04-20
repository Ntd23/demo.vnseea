<template>
  <aside class="space-y-4">
    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.directoryPage.sidebarCategoriesEyebrow") }}</p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.directoryPage.sidebarCategoriesTitle") }}</h2>
      <div class="mt-4 space-y-2">
        <button
          v-for="category in categories"
          :key="category.value"
          class="flex w-full items-center justify-between gap-3 rounded-[20px] p-3 text-left transition"
          :class="selectedCategory === category.value ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('selectCategory', category.value)"
        >
          <span class="flex min-w-0 items-center gap-3">
            <Icon :name="category.icon" class="h-5 w-5 shrink-0" />
            <span class="min-w-0">
              <span class="block truncate text-[13px] font-extrabold">{{ category.label }}</span>
              <span class="block truncate text-[11px] font-semibold opacity-70">{{ category.description }}</span>
            </span>
          </span>
          <span class="text-[12px] font-black">{{ counts[category.value] ?? 0 }}</span>
        </button>
      </div>
    </section>

    <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.directoryPage.sidebarFeaturedEyebrow") }}</p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.directoryPage.sidebarFeaturedTitle") }}</h2>
      <div class="mt-4 space-y-2">
        <NuxtLink
          v-for="item in featured"
          :key="item.id"
          :to="item.href"
          class="block rounded-[20px] bg-[var(--bg-surface-hover)] p-3 transition hover:bg-[var(--color-primary-50)]"
        >
          <p class="text-[13px] font-extrabold text-[var(--text-primary)]">{{ item.title }}</p>
          <p class="mt-1 line-clamp-2 text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">{{ item.description }}</p>
        </NuxtLink>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { DirectoryCategory, DirectoryCategoryKey, DirectoryItem } from "~/composables/useMockDirectoryData"

const { t } = useI18n()

defineProps<{
  categories: ReadonlyArray<DirectoryCategory>
  selectedCategory: DirectoryCategoryKey
  counts: Record<string, number>
  featured: ReadonlyArray<DirectoryItem>
}>()

defineEmits<{ selectCategory: [value: DirectoryCategoryKey] }>()
</script>
