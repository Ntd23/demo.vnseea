<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
    <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.forumPage.sectionsEyebrow") }}</p>
    <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.forumPage.sectionsTitle") }}</h2>
    <div class="mt-4 space-y-2">
      <button
        v-for="section in sections"
        :key="section.value"
        class="flex w-full items-center justify-between gap-3 rounded-[20px] bg-[var(--bg-surface-hover)] p-3 text-left transition hover:bg-[var(--color-primary-50)]"
        type="button"
        @click="$emit('selectSection', section.value)"
      >
        <span class="flex min-w-0 items-center gap-3">
          <Icon :name="section.icon" class="h-5 w-5 shrink-0 text-[var(--color-primary-600)]" />
          <span class="min-w-0">
            <span class="block truncate text-[13px] font-extrabold text-[var(--text-primary)]">{{ section.label }}</span>
            <span class="block truncate text-[11px] font-semibold text-[var(--text-secondary)]">{{ section.description }}</span>
          </span>
        </span>
        <span class="text-[12px] font-black text-[var(--color-primary-600)]">{{ counts[section.value] ?? 0 }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ForumSection, ForumSectionKey } from "~/composables/useMockForumData"

const { t } = useI18n()

defineProps<{
  sections: ReadonlyArray<ForumSection>
  counts: Record<string, number>
}>()

defineEmits<{ selectSection: [value: ForumSectionKey] }>()
</script>
