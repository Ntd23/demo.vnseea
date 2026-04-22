  <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

    <div class="relative z-10 flex items-start justify-between gap-4 mb-8">
      <div class="space-y-1.5">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ compact ? t("pages.pageDetailPage.aboutCompactEyebrow") : t("pages.pageDetailPage.aboutEyebrow") }}
        </p>
        <h3 class="text-2xl font-black tracking-tight text-secondary-900">
          {{ compact ? t("pages.pageDetailPage.aboutCompactTitle") : page.name }}
        </h3>
      </div>

      <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm transition-transform duration-500 hover:scale-110">
        <Icon :name="compact ? 'i-ph-info-duotone' : 'i-ph-megaphone-simple-duotone'" class="h-7 w-7" />
      </div>
    </div>

    <p class="relative z-10 text-xs font-medium leading-relaxed text-secondary-600 mb-6 px-1">
      {{ page.summary }}
    </p>

    <!-- Detail Grid -->
    <div class="relative z-10 grid gap-4 sm:grid-cols-2 mb-8">
      <div class="rounded-2xl bg-secondary-50/50 p-5 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100/50 group/item">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2">{{ t("pages.pageDetailPage.categoryTitle") }}</p>
        <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none truncate">{{ categoryLabel }}</p>
        <p class="mt-2.5 text-[10px] font-medium leading-relaxed text-secondary-400 group-hover/item:text-secondary-500 truncate">{{ page.ownerLabel }}</p>
      </div>
      <div class="rounded-2xl bg-secondary-50/50 p-5 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100/50 group/item">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2">{{ t("pages.pageDetailPage.interactionTitle") }}</p>
        <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none truncate">{{ page.responseLabel }}</p>
        <p class="mt-2.5 text-[10px] font-medium leading-relaxed text-secondary-400 group-hover/item:text-secondary-500 truncate">
          {{
            [
              showFollowerCount ? followerCountLabel : "",
              showLikeCount ? likeCountLabel : "",
            ].filter(Boolean).join(" · ") || t("pages.pageDetailPage.hiddenMetrics")
          }}
        </p>
      </div>
    </div>

    <!-- Info Rows -->
    <div class="relative z-10 space-y-4 pt-2 pb-6 border-b border-secondary-50 px-1">
      <div v-if="page.locationLabel" class="flex items-center gap-3 group">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-50 text-primary-600 ring-1 ring-secondary-100/50">
          <Icon name="i-ph-map-pin-duotone" class="h-4 w-4" />
        </span>
        <span class="text-[11px] font-bold uppercase tracking-widest text-secondary-500 group-hover:text-secondary-900 transition-colors">{{ page.locationLabel }}</span>
      </div>
      <div v-if="page.website" class="flex items-center gap-3 group">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-50 text-primary-600 ring-1 ring-secondary-100/50">
          <Icon name="i-ph-link-simple-duotone" class="h-4 w-4" />
        </span>
        <span class="text-[11px] font-bold uppercase tracking-widest text-secondary-500 group-hover:text-secondary-900 transition-colors">{{ page.website }}</span>
      </div>
      <div v-if="page.foundedLabel" class="flex items-center gap-3 group">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-50 text-primary-600 ring-1 ring-secondary-100/50">
          <Icon name="i-ph-calendar-blank-duotone" class="h-4 w-4" />
        </span>
        <span class="text-[11px] font-bold uppercase tracking-widest text-secondary-500 group-hover:text-secondary-900 transition-colors truncate">{{ page.foundedLabel }}</span>
      </div>
    </div>

    <!-- Topics Content -->
    <div v-if="!compact" class="relative z-10 mt-6 space-y-4">
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 px-1">
        {{ t("pages.pageDetailPage.mainTopicsTitle") }}
      </p>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tag in page.tags"
          :key="tag"
          variant="soft"
          class="rounded-lg font-black text-[10px] uppercase tracking-widest px-3 py-1.5 bg-primary-50 text-primary-600 ring-1 ring-primary-100/50 hover:bg-primary-600 hover:text-white transition-all cursor-default"
        >
          #{{ tag }}
        </UBadge>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityPageRecord } from "../../../types/community"

const { t } = useI18n()

withDefaults(defineProps<{
  page: CommunityPageRecord
  categoryLabel: string
  followerCountLabel: string
  likeCountLabel: string
  compact?: boolean
  showFollowerCount?: boolean
  showLikeCount?: boolean
}>(), {
  compact: false,
  showFollowerCount: true,
  showLikeCount: true,
})
</script>
