<template>
  <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
    <div class="relative min-h-[220px] overflow-hidden px-5 py-6 text-white sm:min-h-[260px] sm:px-7">
      <div class="absolute inset-0" :style="{ background: page.banner }" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.32),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.38))]" />

      <div class="relative flex h-full flex-col justify-between gap-6">
        <div class="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/88">
          <span class="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur">
            {{ $t(categoryLabel) }}
          </span>
          <span class="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur">
            {{ page.responseLabel }}
          </span>
          <span class="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur">
            {{ page.foundedLabel }}
          </span>
        </div>

        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex items-end gap-4">
            <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border border-white/18 bg-white/12 text-[1.55rem] font-black text-white shadow-[0_16px_30px_rgba(15,23,42,0.22)] backdrop-blur sm:h-28 sm:w-28 sm:text-[1.8rem]">
              {{ avatarLabel }}
            </div>

            <div class="min-w-0 pb-1">
              <p class="text-[12px] font-bold uppercase tracking-[0.24em] text-white/70">
                {{ t("pages.pageDetailPage.heroTypeLabel") }}
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-white sm:text-[2.5rem]">
                {{ page.name }}
              </h1>
              <p class="mt-2 max-w-[760px] text-[14px] leading-7 text-white/82">
                {{ page.summary }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/82">
                <span>{{ $t('community.pages.format.followers', { count: followerCountLabel }) }}</span>
                <span class="text-white/30">•</span>
                <span>{{ $t('community.pages.format.likes', { count: likeCountLabel }) }}</span>
                <span class="text-white/30">•</span>
                <span>{{ page.locationLabel }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="inline-flex h-12 items-center justify-center rounded-[16px] bg-white px-5 text-[14px] font-extrabold text-[#1d4ed8] shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
              type="button"
            >
              <Icon name="i-ph-bell-simple-ringing-bold" class="mr-2 h-4 w-4" />
              {{ page.ctaLabel || t("pages.pageDetailPage.followFallback") }}
            </button>

            <button
              class="inline-flex h-12 items-center justify-center rounded-[16px] border border-white/16 bg-white/12 px-5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-white/18"
              type="button"
            >
              <Icon name="i-ph-paper-plane-tilt-bold" class="mr-2 h-4 w-4" />
              {{ t("pages.pageDetailPage.shareButton") }}
            </button>

            <NuxtLink
              v-if="page.canManage"
              :to="pageSettingsPath"
              class="inline-flex h-12 items-center justify-center rounded-[16px] border border-white/16 bg-[#0f172a]/26 px-5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-[#0f172a]/40"
            >
              <Icon name="i-ph-gear-six-bold" class="mr-2 h-4 w-4" />
              {{ t("pages.pageDetailPage.settingsButton") }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  appendCommunityQuery,
  getCommunityInitials,
  getCommunityPageSettingsPath,
} from "../../../types/community"
import type { CommunityPageRecord } from "../../../types/community"

const { t } = useI18n()

const props = defineProps<{
  page: CommunityPageRecord
  categoryLabel: string
  followerCountLabel: string
  likeCountLabel: string
}>()

const route = useRoute()

const avatarLabel = computed(() =>
  getCommunityInitials(props.page.name),
)

const pageSettingsPath = computed(() =>
  appendCommunityQuery(getCommunityPageSettingsPath(props.page.slug), route.query),
)
</script>
