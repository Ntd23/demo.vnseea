<!-- Description: Renders the page settings sidebar preview from normalized backend-backed page data. -->
<template>
  <!-- <div class="page-settings-sidebar space-y-4 xl:sticky xl:top-[84px]">
    <section class="overflow-hidden rounded-[18px] border border-[#e2e8f0] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
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
            <span class="rounded-full bg-white/14 px-3 py-1.5">{{ categoryLabel }}</span>
            <span class="rounded-full bg-white/14 px-3 py-1.5">{{ selectedCtaLabel }}</span>
          </div>

          <p class="mt-4 text-[13px] leading-6 text-white/82">
            {{ page.summary }}
          </p>
        </div>
      </div>

      <div class="grid gap-px border-t border-[#e2e8f0] bg-[#e2e8f0] sm:grid-cols-3">
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
  </div> -->
</template>

<script setup lang="ts">
import { getCommunityInitials } from "../../domain/services/community-helpers.service"
import type { CommunityPageRecord } from "../../domain/types/community.types"

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

<style scoped>
.page-settings-sidebar :deep(progress),
.page-settings-sidebar :deep([role="progressbar"]) {
  background-color: #dbeafe;
}
</style>
