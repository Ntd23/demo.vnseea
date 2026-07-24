<template>
  <section class="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-md)]">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-brand)]/70">
          {{ t("pages.groupDetailPage.membersEyebrow") }}
        </p>
        <h3 class="mt-2 text-[1.15rem] font-black tracking-[-0.04em] text-[var(--text-primary)]">
          Danh sách ({{ members.length }})
        </h3>
      </div>

      <UButton
        color="neutral"
        variant="outline"
        size="md"
        class="rounded-full"
        :loading="inviteState === 'loading'"
        :disabled="inviteState === 'loading'"
        @click="emit('invite')"
      >
        <Icon name="i-ph-user-circle-plus-bold" class="mr-1.5 h-4 w-4" />
        {{ inviteButtonLabel }}
      </UButton>
    </div>

    <div class="mt-4 space-y-3">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-3 rounded-[18px] bg-[var(--bg-muted)] px-3.5 py-3"
      >
        <div class="relative shrink-0">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary-100)_0%,color-mix(in_srgb,var(--bg-brand)_10%,transparent)_100%)] text-[13px] font-black text-[var(--text-brand)]">
            {{ member.initials }}
          </div>
          <span
            class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white"
            :class="member.online ? 'bg-[var(--color-success)]' : 'bg-[var(--text-tertiary)]'"
          />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-semibold text-[var(--text-primary)]">{{ member.name }}</p>
          <p class="mt-0.5 text-[12px] text-[var(--text-secondary)]">{{ translateText(member.role) }}</p>
          <p class="mt-0.5 truncate text-[11px] text-[var(--text-tertiary)]">{{ translateText(member.meta) }}</p>
        </div>

        <UBadge
          color="neutral"
          :variant="member.online ? 'subtle' : 'outline'"
          class="rounded-full px-3 py-1 text-[11px] font-semibold"
        >
          {{ member.online ? t("pages.groupDetailPage.memberOnline") : t("pages.groupDetailPage.memberOffline") }}
        </UBadge>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupMember } from "../../domain/types/community.types"

const { t } = useI18n()
const translateText = useMaybeTranslatedText()

const props = defineProps<{
  members: CommunityGroupMember[]
  memberCountLabel: string
  inviteState?: "idle" | "loading" | "success" | "error"
}>()

const emit = defineEmits<{
  invite: []
}>()

const inviteButtonLabel = computed(() =>
  props.inviteState === "success"
    ? t("pages.groupDetailPage.invitedButton")
    : t("pages.groupDetailPage.inviteMore"),
)
</script>
