<!-- Description: Displays a single community page card while hiding optional backend fields when they are not available. -->
<template>
  <article class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,35,110,0.12)]">
    <div class="relative overflow-hidden px-5 pb-5 pt-6 text-white" :style="{ background: page.banner }">
      <div class="pointer-events-none absolute inset-0 opacity-30" :style="{ background: 'radial-gradient(circle_at_top_right, rgba(255,255,255,0.45), transparent 42%)' }" />

      <div class="relative flex items-start justify-between gap-3">
        <div class="min-w-0">
          <UBadge color="neutral" variant="soft" class="rounded-full bg-white/16 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/95 backdrop-blur">
            {{ categoryLabel }}
          </UBadge>

          <NuxtLink
            :to="pageTo"
            class="mt-4 block text-[1.35rem] font-black tracking-[-0.04em] text-white transition hover:text-white/85"
          >
            {{ pageName }}
          </NuxtLink>

          <p class="mt-2 max-w-[28rem] text-[13px] leading-6 text-white/82">
            {{ pageSummary }}
          </p>
        </div>

        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/16 text-white backdrop-blur">
          <Icon name="i-ph-flag-fill" class="h-6 w-6" />
        </div>
      </div>
    </div>

    <div class="space-y-5 px-5 py-5">
      <div class="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
        <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[#243b63]">
          <Icon name="i-ph-users-three" class="mr-1.5 h-4 w-4 text-[#0000ff]" />
          {{ $t("community.pages.format.followers", { count: followerCountLabel }) }}
        </UBadge>
        <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-slate-500">
          {{ $t("community.pages.format.likes", { count: likeCountLabel }) }}
        </UBadge>
        <UBadge
          v-for="tag in localizedTags.slice(0, 2)"
          :key="tag"
          color="neutral"
          variant="outline"
          class="rounded-full px-3 py-1.5 text-slate-500"
        >
          #{{ tag }}
        </UBadge>
      </div>

      <div v-if="ownerLabel || responseLabel" class="grid gap-3 md:grid-cols-2">
        <div v-if="ownerLabel" class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            {{ $t("community.pagesDirectory.brandLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ ownerLabel }}
          </p>
        </div>

        <div v-if="responseLabel" class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
            {{ $t("community.pagesDirectory.interactionLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
            {{ responseLabel }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-[12px] text-slate-500">
          <span class="font-semibold text-[#243b63]">/p/{{ page.slug }}</span>
          <template v-if="locationLabel">
            <span class="mx-2 text-slate-300">•</span>
            <span>{{ locationLabel }}</span>
          </template>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <UButton
            v-if="page.canManage"
            :to="pageSettingsTo"
            color="neutral"
            variant="outline"
            size="md"
            class="rounded-full"
          >
            <Icon name="i-ph-gear-six-bold" class="mr-1.5 h-4 w-4" />
            {{ $t("community.pagesDirectory.settingsAction") }}
          </UButton>

          <UButton
            :to="pageTo"
            color="primary"
            variant="solid"
            size="md"
            class="rounded-full px-5 text-[13px] font-bold text-white shadow-[0_10px_20px_rgba(0,0,255,0.18)]"
            :style="{ background: primaryButtonBackground }"
          >
            {{ resolvedActionLabel }}
          </UButton>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  formatCommunityFollowerCount,
  formatCommunityLikeCount,
  getCommunityOptionLabel,
  getCommunityPagePath,
  getCommunityPageSettingsPath,
} from "../../domain/services/community-helpers.service"
import { communityPageCategoryOptions } from "../../domain/constants/community-options"
import type { CommunityPageRecord } from "../../domain/types/community.types"

const props = withDefaults(defineProps<{
  page: CommunityPageRecord
  actionLabel?: string
}>(), {
  actionLabel: "",
})

const { t } = useI18n()

const pageName = computed(() => t(props.page.name))
const pageSummary = computed(() => t(props.page.summary))
const ownerLabel = computed(() => props.page.ownerLabel ? t(props.page.ownerLabel) : "")
const responseLabel = computed(() => props.page.responseLabel ? t(props.page.responseLabel) : "")
const locationLabel = computed(() =>
  props.page.locationLabel ? t(props.page.locationLabel) : "",
)

const localizedTags = computed(() =>
  props.page.tags.map(tag => t(tag)),
)

const followerCountLabel = computed(() =>
  formatCommunityFollowerCount(props.page.followers),
)

const likeCountLabel = computed(() =>
  formatCommunityLikeCount(props.page.likes),
)

const categoryLabel = computed(() => {
  const label = getCommunityOptionLabel(
    communityPageCategoryOptions,
    props.page.category,
    "community.groups.card.noCategory",
  )

  return t(label)
})

const resolvedActionLabel = computed(() =>
  props.actionLabel || t("community.pagesDirectory.actionMine"),
)

const primaryButtonBackground = computed(() =>
  `linear-gradient(135deg, ${props.page.accent} 0%, #0000ff 100%)`,
)

const pageTo = computed(() =>
  getCommunityPagePath(props.page.slug),
)

const pageSettingsTo = computed(() =>
  getCommunityPageSettingsPath(props.page.slug),
)
</script>
