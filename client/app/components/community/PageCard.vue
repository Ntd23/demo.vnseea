  <article class="surface-card group overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ring-1 ring-secondary-100 hover:ring-primary-500/20">
    <!-- Page Banner Layer -->
    <div class="relative h-[200px] overflow-hidden flex flex-col justify-end" :style="{ background: page.banner }">
      <!-- Premium Overlays -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      <div class="relative z-10 p-6 space-y-4">
        <div class="flex items-start justify-between gap-4">
          <UBadge
            variant="soft"
            class="rounded-lg font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30"
          >
            {{ $t(categoryLabel) }}
          </UBadge>
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            <Icon name="i-ph-flag-duotone" class="h-6 w-6" />
          </div>
        </div>

        <NuxtLink
          :to="pageTo"
          class="block text-2xl font-black tracking-tighter text-white transition-all transform group-hover:translate-x-1"
        >
          {{ page.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- Page Content Layer -->
    <div class="p-6 space-y-6 bg-white">
      <!-- Summary -->
      <p class="text-xs font-medium leading-relaxed text-secondary-500 line-clamp-2 min-h-[2.5rem]">
        {{ page.summary }}
      </p>

      <!-- Stats Row -->
      <div class="flex flex-wrap items-center gap-2">
        <UBadge variant="soft" class="rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1.5 bg-primary-50 text-primary-600 ring-1 ring-primary-100">
          <template #leading>
            <Icon name="i-ph-users-three-duotone" class="h-3.5 w-3.5 mr-1.5" />
          </template>
          {{ $t('community.pages.format.followers', { count: followerCountLabel }) }}
        </UBadge>
        <UBadge variant="soft" class="rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1.5 bg-secondary-50 text-secondary-500 ring-1 ring-secondary-100">
          {{ $t('community.pages.format.likes', { count: likeCountLabel }) }}
        </UBadge>
        <div v-for="tag in page.tags.slice(0, 2)" :key="tag" class="text-[9px] font-black text-secondary-400 uppercase tracking-widest px-1">
          #{{ tag }}
        </div>
      </div>

      <!-- Detail Grid -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all group-hover:ring-primary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5 line-clamp-1">
            {{ $t('community.pages.card.brand') || 'Thương hiệu' }}
          </p>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none truncate">
            {{ page.ownerLabel }}
          </p>
        </div>

        <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all group-hover:ring-primary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5 line-clamp-1">
            {{ $t('community.pages.card.interaction') || 'Tương tác' }}
          </p>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none truncate">
            {{ page.responseLabel }}
          </p>
        </div>
      </div>

      <!-- Bottom Meta & Actions -->
      <div class="flex flex-col gap-4 pt-4 border-t border-secondary-50 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black uppercase tracking-widest text-primary-600">/p/{{ page.slug }}</span>
          <span class="h-1 w-1 rounded-full bg-secondary-200" />
          <span class="text-[9px] font-bold uppercase tracking-widest text-secondary-400 truncate max-w-[120px]">{{ page.locationLabel || "Fanpage công khai" }}</span>
        </div>

        <div class="flex gap-2">
          <UButton
            v-if="page.canManage"
            :to="pageSettingsTo"
            variant="soft"
            size="md"
            class="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 bg-secondary-50 text-secondary-600 ring-1 ring-secondary-100 hover:bg-secondary-100 hover:text-secondary-900 transition-all shadow-sm"
          >
            <template #leading>
              <Icon name="i-ph-gear-six-duotone" class="h-4 w-4" />
            </template>
            Sửa
          </UButton>

          <UButton
            :to="pageTo"
            size="md"
            class="h-11 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 px-6"
            :style="{ background: primaryButtonBackground }"
          >
            <template #leading>
              <Icon name="i-ph-arrow-square-out-bold" class="h-4 w-4" />
            </template>
            {{ actionLabel }}
          </UButton>
        </div>
      </div>
    </div>
  </article>
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
  actionLabel: "Xem fanpage",
})

const followerCountLabel = computed(() =>
  formatCommunityFollowerCount(props.page.followers),
)

const likeCountLabel = computed(() =>
  formatCommunityLikeCount(props.page.likes),
)

const categoryLabel = computed(() =>
  getCommunityOptionLabel(
    communityPageCategoryOptions,
    props.page.category,
    "Chưa phân loại",
  ),
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
