<template>
  <div class="space-y-4 xl:sticky xl:top-[84px]">
    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-5 text-white">
        <div class="absolute inset-0" :style="{ background: page.banner }" />
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.32),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.36))]" />

        <div class="relative">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">
            {{ $t('community.pageSettings.sidebar.preview') }}
          </p>

          <div class="mt-4 flex items-start gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/18 bg-white/12 text-[1rem] font-black text-white backdrop-blur">
              {{ initials }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-[1.05rem] font-black">{{ page.name }}</p>
              <p class="mt-1 break-all text-[12px] text-white/72">vnseea.vn/p/{{ page.slug }}</p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold">
            <span class="rounded-full bg-white/14 px-3 py-1.5">{{ $t(categoryLabel) }}</span>
            <span class="rounded-full bg-white/14 px-3 py-1.5">{{ selectedCtaLabel }}</span>
          </div>

          <p class="mt-4 text-[13px] leading-6 text-white/82">
            {{ page.summary }}
          </p>
        </div>
      </div>

      <div class="grid gap-px border-t border-white/10 bg-[#edf2fb] sm:grid-cols-3">
        <div class="bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t('community.pageSettings.sidebar.signals') }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ enabledPolicies }}/{{ totalPolicies }}</p>
          <UProgress :model-value="policyProgress" color="primary" class="mt-3" />
        </div>
        <div class="bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t('community.pageSettings.sidebar.followers') }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ followerPreview }}</p>
        </div>
        <div class="bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">{{ $t('community.pageSettings.sidebar.likes') }}</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ likePreview }}</p>
        </div>
      </div>
    </section>

    <CommunityPageAboutCard
      :page="page"
      :category-label="categoryLabel"
      :follower-count-label="followerCountLabel"
      :like-count-label="likeCountLabel"
      :show-follower-count="showFollowerCount"
      :show-like-count="showLikeCount"
      compact
    />

    <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
      <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
        {{ $t('community.pageSettings.sidebar.tips') }}
      </p>

      <div class="mt-4 space-y-3">
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[13px] font-semibold text-[#243b63]">{{ $t('community.pageSettings.sidebar.ctaFocus') }}</p>
          <p class="mt-1 text-[12px] leading-5 text-slate-500">
            {{ selectedCtaLabel }} {{ allowMessages ? $t('community.pageSettings.sidebar.ctaWithMessages') : $t('community.pageSettings.sidebar.ctaWithoutMessages') }}
          </p>
        </div>

        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[13px] font-semibold text-[#243b63]">{{ $t('community.pageSettings.sidebar.discovery') }}</p>
          <p class="mt-1 text-[12px] leading-5 text-slate-500">
            {{ recommendRelatedPages ? $t('community.pageSettings.sidebar.discoveryOn') : $t('community.pageSettings.sidebar.discoveryOff') }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CommunityPageAboutCard from "./PageAboutCard.vue"
import { getCommunityInitials } from "../../../../types/community"
import type { CommunityPageRecord } from "../../../../types/community"

const props = defineProps<{
  page: CommunityPageRecord
  categoryLabel: string
  followerCountLabel: string
  likeCountLabel: string
  selectedCtaLabel: string
  enabledPolicies: number
  totalPolicies: number
  showFollowerCount: boolean
  showLikeCount: boolean
  allowMessages: boolean
  recommendRelatedPages: boolean
}>()

const { t } = useI18n()

const initials = computed(() =>
  getCommunityInitials(props.page.name),
)

const followerPreview = computed(() =>
  props.showFollowerCount ? props.followerCountLabel : t("community.pageSettings.sidebar.hidden"),
)

const likePreview = computed(() =>
  props.showLikeCount ? props.likeCountLabel : t("community.pageSettings.sidebar.hidden"),
)

const policyProgress = computed(() => {
  if (!props.totalPolicies) {
    return 0
  }

  return (props.enabledPolicies / props.totalPolicies) * 100
})
</script>
