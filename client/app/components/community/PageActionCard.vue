<template>
  <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
    <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
      {{ t("pages.pageDetailPage.actionEyebrow") }}
    </p>
    <h3 class="mt-2 text-[1.15rem] font-black tracking-[-0.04em] text-[#243b63]">
      {{ t("pages.pageDetailPage.actionTitle") }}
    </h3>
    <p class="mt-2 text-[13px] leading-6 text-slate-500">
      {{ t("pages.pageDetailPage.actionDescription", { response: page.responseLabel }) }}
    </p>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <button
        class="inline-flex h-11 items-center justify-center rounded-[16px] bg-[#0000ff] px-4 text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        type="button"
      >
        <Icon name="i-ph-bell-simple-ringing-bold" class="mr-2 h-4 w-4" />
        {{ page.ctaLabel || t("pages.pageDetailPage.followFallback") }}
      </button>

      <button
        class="inline-flex h-11 items-center justify-center rounded-[16px] border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        type="button"
      >
        <Icon name="i-ph-chat-circle-dots-bold" class="mr-2 h-4 w-4" />
        {{ t("pages.pageDetailPage.messageButton") }}
      </button>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ t("pages.pageDetailPage.followStat") }}</p>
        <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ followerCountLabel }}</p>
      </div>
      <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ t("pages.pageDetailPage.likeStat") }}</p>
        <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ likeCountLabel }}</p>
      </div>
    </div>

    <div v-if="page.canManage" class="mt-4 rounded-[18px] border border-[#dbe3f2] bg-white px-4 py-3">
      <p class="text-[12px] font-semibold text-[#243b63]">{{ t("pages.pageDetailPage.manageTitle") }}</p>
      <p class="mt-1 text-[12px] leading-5 text-slate-500">
        {{ t("pages.pageDetailPage.manageDescription") }}
      </p>
      <NuxtLink
        class="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[12px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        :to="pageSettingsPath"
      >
        <Icon name="i-ph-gear-six-bold" class="mr-1.5 h-4 w-4" />
        {{ t("pages.pageDetailPage.settingsButton") }}
      </NuxtLink>
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
