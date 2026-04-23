<template>
  <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

    <div class="relative z-10 flex items-start justify-between gap-4 mb-8">
      <div class="space-y-1.5">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ compact ? t("pages.groupDetailPage.aboutCompactEyebrow") : t("pages.groupDetailPage.aboutEyebrow") }}
        </p>
        <h3 class="text-2xl font-black text-secondary-900 tracking-tight">
          {{ compact ? t("pages.groupDetailPage.aboutCompactTitle") : group.name }}
        </h3>
      </div>

      <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm transition-transform duration-500 hover:scale-110">
        <Icon :name="compact ? 'i-ph-info-duotone' : 'i-ph-identification-card-duotone'" class="h-7 w-7" />
      </div>
    </div>

    <p class="relative z-10 text-xs font-medium leading-relaxed text-secondary-600 mb-6 px-1">
      {{ $t(group.summary) }}
    </p>

    <!-- Detail Grid -->
    <div class="relative z-10 grid gap-4 sm:grid-cols-2 mb-8">
      <div class="rounded-2xl bg-secondary-50/50 p-5 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100/50 group/item">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2">{{ t("pages.groupDetailPage.privacyTitle") }}</p>
        <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none">{{ privacyLabel }}</p>
        <p class="mt-2.5 text-[10px] font-medium leading-relaxed text-secondary-400 group-hover/item:text-secondary-500">{{ privacyDescription }}</p>
      </div>
      <div class="rounded-2xl bg-secondary-50/50 p-5 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100/50 group/item">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2">{{ t("pages.groupDetailPage.categoryTitle") }}</p>
        <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none">{{ categoryLabel }}</p>
        <p class="mt-2.5 text-[10px] font-medium leading-relaxed text-secondary-400 truncate group-hover/item:text-secondary-500">{{ group.locationLabel }}</p>
      </div>
    </div>

    <!-- Meta Rows -->
    <div class="relative z-10 space-y-3 pb-6 border-b border-secondary-50 px-1">
      <div v-for="item in [
        { icon: 'i-ph-calendar-blank-duotone', text: $t(group.foundedLabel) },
        { icon: 'i-ph-link-simple-duotone', text: group.website },
        { icon: 'i-ph-users-three-duotone', text: $t('community.groups.format.members', { count: memberCountLabel }) }
      ]" :key="item.icon" class="flex items-center gap-3">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-50 text-primary-600 ring-1 ring-secondary-100/50">
          <Icon :name="item.icon" class="h-4 w-4" />
        </span>
        <span class="text-[11px] font-bold uppercase tracking-widest text-secondary-500">{{ item.text }}</span>
      </div>
    </div>

    <!-- Guidelines -->
    <div v-if="!compact && group.guidelines?.length" class="relative z-10 mt-6 space-y-4">
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 px-1">
        {{ t("pages.groupDetailPage.guidelinesTitle") }}
      </p>
      <div class="space-y-3">
        <div
          v-for="(rule, index) in group.guidelines"
          :key="index"
          class="group rounded-2xl bg-secondary-50/30 p-4 ring-1 ring-secondary-100/30 transition-all hover:bg-white hover:ring-primary-100 hover:shadow-lg"
        >
          <div class="flex gap-3">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-black text-primary-600 shadow-sm ring-1 ring-secondary-100">
              0{{ index + 1 }}
            </span>
            <p class="text-xs font-medium leading-relaxed text-secondary-600 transition-colors group-hover:text-secondary-900">
              {{ $t(rule) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupRecord } from "../../../types/community"

const { t } = useI18n()

withDefaults(defineProps<{
  group: CommunityGroupRecord
  privacyLabel: string
  privacyDescription: string
  categoryLabel: string
  memberCountLabel: string
  compact?: boolean
}>(), {
  compact: false,
})
</script>
