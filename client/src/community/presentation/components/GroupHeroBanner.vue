<template>
  <section class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-lg">
    <!-- Header/Cover Area -->
    <div class="relative h-48 sm:h-64 overflow-hidden">
      <div class="absolute inset-0" :style="bannerStyle" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      
      <!-- Top Badges (Minimal) -->
      <div class="absolute top-6 left-6 flex gap-2">
        <span class="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/20">
          {{ privacyLabel }}
        </span>
        <span class="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/20">
          {{ categoryLabel }}
        </span>
      </div>
    </div>

    <!-- Info Area -->
    <div class="px-6 pb-8 sm:px-10">
      <div class="relative -mt-16 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
        <!-- Avatar + Title Group -->
        <div class="flex flex-col gap-6 sm:flex-row sm:items-end">
          <!-- Big Avatar/Icon -->
          <div class="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-slate-900 bg-slate-800 shadow-xl sm:h-40 sm:w-40">
            <img v-if="group.avatar" :src="group.avatar" class="h-full w-full object-cover" />
            <Icon v-else name="i-ph-users-three-fill" class="h-16 w-16 text-slate-400 sm:h-20 sm:w-20" />
          </div>

          <div class="min-w-0 pb-1">
            <h1 class="text-3xl font-black tracking-tight text-white sm:text-5xl">
              {{ groupName }}
            </h1>
            <p class="mt-2 max-w-xl text-[15px] font-medium text-slate-400">
              {{ groupSummary }}
            </p>
            <div class="mt-4 flex items-center gap-4 text-[13px] font-bold text-slate-300">
              <span class="flex items-center gap-1.5">
                <Icon name="i-ph-users-fill" class="h-4 w-4 text-primary-500" />
                {{ memberCountLabel }}
              </span>
              <span class="h-1 w-1 rounded-full bg-slate-600" />
              <span class="flex items-center gap-1.5 text-green-400">
                <span class="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                {{ onlineCountLabel }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons (Clean) -->
        <div class="flex flex-wrap items-center gap-3">
          <UButton
            color="primary"
            variant="solid"
            size="xl"
            :loading="inviteState === 'loading'"
            :disabled="inviteState === 'loading'"
            class="rounded-xl px-8 font-bold shadow-lg"
            @click="emit('invite')"
          >
            {{ inviteButtonLabel }}
          </UButton>

          <UButton
            color="white"
            variant="solid"
            size="xl"
            :loading="joinState === 'loading'"
            :disabled="joinState === 'loading' || joined"
            class="rounded-xl px-6 font-bold"
            @click="emit('join')"
          >
            <Icon :name="joined ? 'i-ph-check-circle-bold' : 'i-ph-user-plus-bold'" class="mr-2 h-5 w-5" />
            {{ joinButtonLabel }}
          </UButton>

          <UButton
            v-if="group.canManage"
            :to="settingsPath"
            color="neutral"
            variant="ghost"
            size="xl"
            class="h-12 w-12 rounded-xl bg-slate-800 text-white hover:bg-slate-700"
          >
            <Icon name="i-ph-gear-six-bold" class="h-6 w-6" />
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  getCommunityInitials,
  getCommunityGroupSettingsPath,
} from "../../domain/services/community-helpers.service"
import type { CommunityGroupRecord } from "../../domain/types/community.types"

const { t } = useI18n()
const translateText = useMaybeTranslatedText()

const props = defineProps<{
  group: CommunityGroupRecord
  memberCountLabel: string
  onlineCountLabel: string
  privacyLabel: string
  categoryLabel: string
  joinState?: "idle" | "loading" | "success" | "error"
  inviteState?: "idle" | "loading" | "success" | "error"
  joined?: boolean
}>()

const emit = defineEmits<{
  join: []
  invite: []
}>()

const bannerStyle = computed(() => {
  if (props.group.banner && props.group.banner.startsWith("http")) {
    return {
      backgroundImage: `url(${props.group.banner})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  }

  return {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  }
})

const avatarLabel = computed(() =>
  getCommunityInitials(translateText(props.group.name)),
)

const settingsPath = computed(() =>
  getCommunityGroupSettingsPath(props.group.slug),
)

const groupName = computed(() =>
  translateText(props.group.name),
)

const groupSummary = computed(() =>
  translateText(props.group.summary),
)

const joinButtonLabel = computed(() => {
  if (props.joined) return t("pages.groupDetailPage.joinedButton")
  return translateText(props.group.joinLabel, t("pages.groupDetailPage.joinFallback"))
})

const inviteButtonLabel = computed(() => {
  if (props.inviteState === "success") return t("pages.groupDetailPage.invitedButton")
  return translateText(props.group.inviteLabel, t("pages.groupDetailPage.inviteFallback"))
})
</script>
