<!-- Description: Renders the group hero banner and hides optional backend fields when they are empty. -->
<template>
  <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
    <div class="relative min-h-[220px] overflow-hidden px-5 py-6 text-white sm:min-h-[260px] sm:px-7">
      <div class="absolute inset-0" :style="{ background: group.banner }" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.32),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.36))]" />

      <div class="relative flex h-full flex-col justify-between gap-6">
        <div class="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/88">
          <UBadge color="neutral" variant="soft" class="rounded-full bg-white/12 px-3 py-1.5 font-bold uppercase tracking-[0.16em] text-white/95 backdrop-blur">
            {{ privacyLabel }}
          </UBadge>
          <UBadge color="neutral" variant="soft" class="rounded-full bg-white/12 px-3 py-1.5 font-bold uppercase tracking-[0.16em] text-white/95 backdrop-blur">
            {{ categoryLabel }}
          </UBadge>
          <UBadge v-if="foundedLabel" color="neutral" variant="soft" class="rounded-full bg-white/12 px-3 py-1.5 font-bold uppercase tracking-[0.16em] text-white/95 backdrop-blur">
            {{ foundedLabel }}
          </UBadge>
        </div>

        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex items-end gap-4">
            <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border border-white/18 bg-white/12 text-[1.55rem] font-black text-white shadow-[0_16px_30px_rgba(15,23,42,0.22)] backdrop-blur sm:h-28 sm:w-28 sm:text-[1.8rem]">
              {{ avatarLabel }}
            </div>

            <div class="min-w-0 pb-1">
              <p class="text-[12px] font-bold uppercase tracking-[0.24em] text-white/70">
                {{ t("pages.groupDetailPage.heroTypeLabel") }}
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-white sm:text-[2.5rem]">
                {{ groupName }}
              </h1>
              <p class="mt-2 max-w-[760px] text-[14px] leading-7 text-white/82">
                {{ groupSummary }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/82">
                <span>{{ memberCountLabel }}</span>
                <span class="text-white/30">•</span>
                <span>{{ onlineCountLabel }}</span>
                <template v-if="locationLabel">
                  <span class="text-white/30">•</span>
                  <span>{{ locationLabel }}</span>
                </template>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <UButton
              color="neutral"
              variant="soft"
              size="xl"
              :loading="joinState === 'loading'"
              :disabled="joinState === 'loading' || joined"
              class="rounded-[16px] border border-white/16 bg-white/12 px-5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-white/18 disabled:bg-white/12"
              @click="emit('join')"
            >
              <Icon name="i-ph-user-plus-bold" class="mr-2 h-4 w-4" />
              {{ joinButtonLabel }}
            </UButton>

            <UButton
              color="neutral"
              variant="solid"
              size="xl"
              :loading="inviteState === 'loading'"
              :disabled="inviteState === 'loading'"
              class="rounded-[16px] bg-white px-5 text-[14px] font-extrabold text-[#1d4ed8] shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
              @click="emit('invite')"
            >
              <Icon name="i-ph-user-circle-plus-bold" class="mr-2 h-4 w-4" />
              {{ inviteButtonLabel }}
            </UButton>

            <UButton
              v-if="group.canManage"
              :to="settingsPath"
              color="neutral"
              variant="soft"
              size="xl"
              class="rounded-[16px] border border-white/16 bg-[#0f172a]/26 px-5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-[#0f172a]/40"
            >
              <Icon name="i-ph-gear-six-bold" class="mr-2 h-4 w-4" />
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

const foundedLabel = computed(() =>
  translateText(props.group.foundedLabel),
)

const locationLabel = computed(() =>
  translateText(props.group.locationLabel),
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
