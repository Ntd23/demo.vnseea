<template>
  <section class="surface-card overflow-hidden ring-1 ring-secondary-100 shadow-2xl relative">
    <!-- Hero Banner with Premium Overlays -->
    <div class="relative min-h-[320px] overflow-hidden px-8 py-10 text-white flex flex-col justify-end" :style="{ background: group.banner }">
      <!-- Premium Overlays -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none animate-pulse" />
      
      <div class="relative z-10 space-y-8">
        <!-- Badge row -->
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            v-for="label in [privacyLabel, categoryLabel, group.foundedLabel]"
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
                {{ t("pages.groupDetailPage.heroTypeLabel") }}
              </p>
              <h1 class="text-4xl sm:text-5xl font-black tracking-tighter text-white leading-none">
                {{ group.name }}
              </h1>
              <p class="max-w-[760px] text-sm font-medium leading-relaxed text-white/70 line-clamp-2">
                {{ group.summary }}
              </p>
              
              <div class="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/50">
                <div class="flex items-center gap-2">
                  <Icon name="i-ph-users-duotone" class="h-4 w-4 text-primary-400" />
                  <span class="text-white">{{ $t('community.groups.format.members', { count: memberCountLabel }) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span class="text-white">{{ onlineCountLabel }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="i-ph-map-pin-duotone" class="h-4 w-4 text-primary-400" />
                  <span class="text-white/70">{{ group.locationLabel }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              size="xl"
              variant="soft"
              class="h-12 rounded-2xl bg-white/10 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/20 hover:bg-white/20 backdrop-blur-md px-6 transition-all"
            >
              <template #leading>
                <Icon name="i-ph-user-plus-duotone" class="h-5 w-5" />
              </template>
              {{ group.joinLabel || t("pages.groupDetailPage.joinFallback") }}
            </UButton>

            <UButton
              size="xl"
              class="h-12 rounded-2xl bg-white text-primary-600 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-105 transition-all px-8"
            >
              <template #leading>
                <Icon name="i-ph-user-circle-plus-duotone" class="h-5 w-5" />
              </template>
              {{ group.inviteLabel || t("pages.groupDetailPage.inviteFallback") }}
            </UButton>

            <UButton
              v-if="group.canManage"
              :to="settingsPath"
              size="xl"
              variant="soft"
              class="h-12 rounded-2xl bg-black/40 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/10 hover:bg-black/60 backdrop-blur-md px-6"
            >
              <template #leading>
                <Icon name="i-ph-gear-six-duotone" class="h-5 w-5" />
              </template>
              {{ t("pages.groupDetailPage.settingsButton") }}
            </UButton>
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
