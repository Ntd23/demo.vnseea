<template>
  <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
    <div class="relative min-h-[220px] overflow-hidden px-5 py-6 text-white sm:min-h-[260px] sm:px-7">
      <div class="absolute inset-0" :style="{ background: group.banner }" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.32),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.36))]" />

      <div class="relative flex h-full flex-col justify-between gap-6">
        <div class="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/88">
          <span class="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur">
            {{ privacyLabel }}
          </span>
          <span class="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur">
            {{ categoryLabel }}
          </span>
          <span class="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur">
            {{ group.foundedLabel }}
          </span>
        </div>

        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex items-end gap-4">
            <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border border-white/18 bg-white/12 text-[1.55rem] font-black text-white shadow-[0_16px_30px_rgba(15,23,42,0.22)] backdrop-blur sm:h-28 sm:w-28 sm:text-[1.8rem]">
              {{ avatarLabel }}
            </div>

            <div class="min-w-0 pb-1">
              <p class="text-[12px] font-bold uppercase tracking-[0.24em] text-white/70">
                {{ t("pages.groupDetailPage.heroTypeLabel") }}
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-white sm:text-[2.5rem]">
                {{ group.name }}
              </h1>
              <p class="mt-2 max-w-[760px] text-[14px] leading-7 text-white/82">
                {{ group.summary }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/82">
                <span>{{ memberCountLabel }}</span>
                <span class="text-white/30">•</span>
                <span>{{ onlineCountLabel }}</span>
                <span class="text-white/30">•</span>
                <span>{{ group.locationLabel }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="inline-flex h-12 items-center justify-center rounded-[16px] border border-white/16 bg-white/12 px-5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-white/18"
              type="button"
            >
              <Icon name="i-ph-user-plus-bold" class="mr-2 h-4 w-4" />
              {{ group.joinLabel || t("pages.groupDetailPage.joinFallback") }}
            </button>

            <button
              class="inline-flex h-12 items-center justify-center rounded-[16px] bg-white px-5 text-[14px] font-extrabold text-[#1d4ed8] shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
              type="button"
            >
              <Icon name="i-ph-user-circle-plus-bold" class="mr-2 h-4 w-4" />
              {{ group.inviteLabel || t("pages.groupDetailPage.inviteFallback") }}
            </button>

            <NuxtLink
              v-if="group.canManage"
              :to="settingsPath"
              class="inline-flex h-12 items-center justify-center rounded-[16px] border border-white/16 bg-[#0f172a]/26 px-5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-[#0f172a]/40"
            >
              <Icon name="i-ph-gear-six-bold" class="mr-2 h-4 w-4" />
              {{ t("pages.groupDetailPage.settingsButton") }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  getCommunityInitials,
  getCommunityGroupSettingsPath,
} from "../../../types/community"
import type { CommunityGroupRecord } from "../../../types/community"

const { t } = useI18n()

const props = defineProps<{
  group: CommunityGroupRecord
  memberCountLabel: string
  onlineCountLabel: string
  privacyLabel: string
  categoryLabel: string
}>()

const avatarLabel = computed(() =>
  getCommunityInitials(props.group.name),
)

const settingsPath = computed(() =>
  getCommunityGroupSettingsPath(props.group.slug),
)
</script>
