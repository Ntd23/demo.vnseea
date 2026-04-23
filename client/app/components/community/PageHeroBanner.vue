<template>
  <section class="surface-card overflow-hidden ring-1 ring-secondary-100 shadow-2xl relative">
    <!-- Hero Banner with Premium Overlays -->
    <div class="relative min-h-[340px] overflow-hidden px-8 py-10 text-white flex flex-col justify-end" :style="{ background: page.banner }">
      <!-- Premium Overlays -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-transform duration-700 group-hover:scale-105" />
      <div class="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[90px] -mr-36 -mt-36 pointer-events-none animate-pulse" />
      
      <div class="relative z-10 space-y-8">
        <!-- Badge row -->
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            v-for="label in [categoryLabel, page.responseLabel, page.foundedLabel]"
            :key="label"
            variant="soft"
            class="rounded-lg font-black text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30"
          >
            {{ $t(label) }}
          </UBadge>
        </div>

        <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            <!-- Initials Avatar -->
            <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-white/10 text-3xl font-black text-white shadow-2xl ring-2 ring-white/20 backdrop-blur-xl group cursor-pointer transition-transform duration-500 hover:scale-110">
              {{ avatarLabel }}
            </div>

            <div class="min-w-0 pb-1 space-y-3">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400">
                {{ t("pages.pageDetailPage.heroTypeLabel") }}
              </p>
              <h1 class="text-4xl sm:text-5xl font-black tracking-tighter text-white leading-none">
                {{ page.name }}
              </h1>
              <p class="max-w-2xl text-sm font-medium leading-relaxed text-white/70 line-clamp-2">
                {{ page.summary }}
              </p>
              
              <div class="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/50">
                <div class="flex items-center gap-2">
                  <Icon name="i-ph-users-three-duotone" class="h-4 w-4 text-primary-400" />
                  <span class="text-white">{{ $t('community.pages.format.followers', { count: followerCountLabel }) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-ph-heart-duotone" class="h-4 w-4 text-primary-400" />
                  <span class="text-white">{{ $t('community.pages.format.likes', { count: likeCountLabel }) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-ph-map-pin-duotone" class="h-4 w-4 text-primary-400" />
                  <span class="text-white/70">{{ page.locationLabel }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              size="xl"
              class="h-12 rounded-2xl bg-white text-primary-600 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-105 transition-all px-8 border-none"
              @click="$emit('follow')"
            >
              <template #leading>
                <Icon name="i-ph-bell-simple-ringing-duotone" class="h-5 w-5" />
              </template>
              {{ page.ctaLabel || t("pages.pageDetailPage.followFallback") }}
            </UButton>

            <UButton
              size="xl"
              variant="soft"
              class="h-12 rounded-2xl bg-white/10 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/20 hover:bg-white/20 backdrop-blur-md px-6 transition-all border-none"
              @click="$emit('share')"
            >
              <template #leading>
                <Icon name="i-ph-paper-plane-tilt-duotone" class="h-5 w-5" />
              </template>
              {{ t("pages.pageDetailPage.shareButton") }}
            </UButton>

            <UButton
              v-if="page.canManage"
              :to="pageSettingsPath"
              size="xl"
              variant="soft"
              class="h-12 rounded-2xl bg-black/40 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/10 hover:bg-black/60 backdrop-blur-md px-6 border-none"
            >
              <template #leading>
                <Icon name="i-ph-gear-six-duotone" class="h-5 w-5" />
              </template>
              {{ t("pages.pageDetailPage.settingsButton") }}
            </UButton>
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
