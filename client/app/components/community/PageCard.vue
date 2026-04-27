<template>
  <article class="group relative overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_12px_30px_rgba(15,35,110,0.05)] transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(15,35,110,0.1)]">
    <!-- Action Banner -->
    <div class="relative h-[200px] overflow-hidden" :style="{ background: page.banner }">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
      
      <!-- Top Badges -->
      <div class="absolute left-5 top-5 flex items-center gap-2">
        <UBadge color="white" variant="solid" class="rounded-xl bg-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/20 shadow-xl">
          {{ categoryLabel }}
        </UBadge>
        <div v-if="page.isPromoted" class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
          <Icon name="i-ph-lightning-fill" class="h-4 w-4" />
        </div>
      </div>

      <!-- Action Button Overlay -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0f172a] shadow-2xl">
          <Icon name="i-ph-eye-bold" class="h-7 w-7" />
        </div>
      </div>

      <div class="absolute bottom-5 left-5 right-5">
        <NuxtLink
          :to="pageTo"
          class="block text-[22px] font-black tracking-tight text-white leading-none hover:text-primary-300 transition-colors"
        >
          {{ pageName }}
        </NuxtLink>
        <p class="mt-2 line-clamp-1 text-[13px] font-medium text-white/70">
          {{ pageSummary }}
        </p>
      </div>
    </div>

    <!-- Content Area -->
    <div class="space-y-6 p-6">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 ring-1 ring-slate-100">
          <Icon name="i-ph-users-three-fill" class="h-4 w-4 text-primary-600" />
          <span class="text-[12px] font-black text-[#0f172a]">{{ followerCountLabel }}</span>
        </div>
        <div class="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 ring-1 ring-slate-100">
          <Icon name="i-ph-heart-fill" class="h-4 w-4 text-rose-500" />
          <span class="text-[12px] font-black text-[#0f172a]">{{ likeCountLabel }}</span>
        </div>
        <div class="h-4 w-px bg-slate-200" />
        <div class="flex gap-2">
          <span
            v-for="tag in localizedTags.slice(0, 2)"
            :key="tag"
            class="text-[11px] font-black uppercase tracking-wider text-slate-400"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ $t("community.pagesDirectory.brandLabel") }}
          </p>
          <p class="mt-1 truncate text-[13px] font-black text-[#0f172a]">
            {{ ownerLabel }}
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ $t("community.pagesDirectory.interactionLabel") }}
          </p>
          <p class="mt-1 truncate text-[13px] font-black text-[#0f172a]">
            {{ responseLabel }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
            <UAvatar :text="page.slug[0]" size="xs" />
          </div>
          <div class="flex flex-col">
            <span class="text-[11px] font-black text-[#0f172a]">/p/{{ page.slug }}</span>
            <span class="text-[10px] font-bold text-slate-400">{{ locationLabel }}</span>
          </div>
        </div>

        <div class="flex gap-2">
          <UButton
            v-if="page.canManage"
            :to="pageSettingsTo"
            variant="ghost"
            color="gray"
            size="sm"
            class="rounded-xl h-10 w-10 p-0 flex items-center justify-center"
            icon="i-ph-gear-six-bold"
          />
          <UButton
            :to="pageTo"
            size="lg"
            class="h-10 rounded-xl px-6 font-black text-[13px] uppercase tracking-wider text-white shadow-lg shadow-primary-600/20"
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
  communityPageCategoryOptions,
  formatCommunityFollowerCount,
  formatCommunityLikeCount,
  getCommunityOptionLabel,
  getCommunityPagePath,
  getCommunityPageSettingsPath,
} from "../../../types/community"
import type { CommunityPageRecord } from "../../../types/community"

const props = withDefaults(defineProps<{
  page: CommunityPageRecord
  actionLabel?: string
}>(), {
  actionLabel: "",
})

const { t } = useI18n()

const pageName = computed(() => t(props.page.name))
const pageSummary = computed(() => t(props.page.summary))
const ownerLabel = computed(() => t(props.page.ownerLabel))
const responseLabel = computed(() => t(props.page.responseLabel))
const locationLabel = computed(() =>
  props.page.locationLabel ? t(props.page.locationLabel) : t("community.pagesDirectory.publicFallback"),
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
