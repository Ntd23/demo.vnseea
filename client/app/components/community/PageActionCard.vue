<template>
  <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

    <div class="relative z-10 space-y-2 mb-6">
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
        {{ t("pages.pageDetailPage.actionEyebrow") }}
      </p>
      <h3 class="text-xl font-black tracking-tighter text-secondary-900 leading-none">
        {{ t("pages.pageDetailPage.actionTitle") }}
      </h3>
      <p class="text-xs font-medium leading-relaxed text-secondary-500 max-w-[280px]">
        {{ t("pages.pageDetailPage.actionDescription", { response: page.responseLabel }) }}
      </p>
    </div>

    <div class="relative z-10 grid gap-3 sm:grid-cols-2 mb-6">
      <UButton
        size="xl"
        class="h-12 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 px-6"
      >
        <template #leading>
          <Icon name="i-ph-bell-simple-ringing-duotone" class="h-5 w-5" />
        </template>
        {{ page.ctaLabel || t("pages.pageDetailPage.followFallback") }}
      </UButton>

      <UButton
        variant="soft"
        size="xl"
        class="h-12 rounded-2xl bg-secondary-50 text-secondary-600 ring-1 ring-secondary-100 hover:bg-secondary-100 hover:text-secondary-900 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
      >
        <template #leading>
          <Icon name="i-ph-chat-circle-dots-duotone" class="h-5 w-5" />
        </template>
        {{ t("pages.pageDetailPage.messageButton") }}
      </UButton>
    </div>

    <div class="relative z-10 grid gap-3 sm:grid-cols-2 mb-6">
      <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:ring-primary-100/50">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ t("pages.pageDetailPage.followStat") }}</p>
        <p class="text-2xl font-black text-secondary-900 tracking-tighter leading-none">{{ followerCountLabel }}</p>
      </div>
      <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:ring-primary-100/50">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ t("pages.pageDetailPage.likeStat") }}</p>
        <p class="text-2xl font-black text-secondary-900 tracking-tighter leading-none">{{ likeCountLabel }}</p>
      </div>
    </div>

    <div v-if="page.canManage" class="relative z-10 rounded-2xl bg-primary-50/50 p-5 ring-1 ring-primary-100/50 space-y-4">
      <div class="space-y-1.5">
        <p class="text-[10px] font-black text-primary-700 uppercase tracking-widest px-1">{{ t("pages.pageDetailPage.manageTitle") }}</p>
        <p class="text-[11px] font-medium leading-relaxed text-primary-600/80 px-1">
          {{ t("pages.pageDetailPage.manageDescription") }}
        </p>
      </div>
      <UButton
        :to="pageSettingsPath"
        variant="soft"
        size="md"
        class="w-full h-10 rounded-xl bg-white/60 text-primary-700 font-black text-[10px] uppercase tracking-widest ring-1 ring-primary-100/50 hover:bg-white hover:text-primary-600 transition-all shadow-sm"
      >
        <template #leading>
          <Icon name="i-ph-gear-six-duotone" class="h-4 w-4" />
        </template>
        {{ t("pages.pageDetailPage.settingsButton") }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  appendCommunityQuery,
  getCommunityPageSettingsPath,
} from "../../../types/community"
import type { CommunityPageRecord } from "../../../types/community"

const { t } = useI18n()

const props = defineProps<{
  page: CommunityPageRecord
  followerCountLabel: string
  likeCountLabel: string
}>()

const route = useRoute()

const pageSettingsPath = computed(() =>
  appendCommunityQuery(getCommunityPageSettingsPath(props.page.slug), route.query),
)
</script>
