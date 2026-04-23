<template>
  <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

    <div class="relative z-10 space-y-4">
      <div class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 px-1">
          {{ t("pages.groupDetailPage.adminEyebrow") }}
        </p>
        <div class="h-1 w-12 bg-primary-600 rounded-full ml-1" />
      </div>

      <p class="text-xs font-medium leading-relaxed text-secondary-500 px-1">
        {{ t("pages.groupDetailPage.adminDescription") }}
      </p>

      <div class="pt-2">
        <UButton
          :to="settingsPath"
          size="xl"
          class="h-12 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 px-8"
        >
          <template #leading>
            <Icon name="i-ph-gear-six-duotone" class="h-5 w-5" />
          </template>
          {{ t("pages.groupDetailPage.adminButton") }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getCommunityGroupSettingsPath } from "../../../types/community"

const { t } = useI18n()

const props = defineProps<{
  slug: string
}>()

const settingsPath = computed(() =>
  getCommunityGroupSettingsPath(props.slug),
)
</script>
