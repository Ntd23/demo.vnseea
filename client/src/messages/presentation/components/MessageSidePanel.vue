<!-- Description: Renders the right info pane that mirrors the PHP message detail sidebar without fallback contact text. -->
<template>
  <div class="scrollbar-hide flex h-full flex-col overflow-y-auto rounded-[24px] border border-[#e2e8f0] bg-white p-5">
    <template v-if="contact">
      <div class="border-b border-[#e2e8f0] pb-5 text-center">
        <UAvatar
          :src="contact.avatarUrl"
          size="3xl"
          class="mx-auto"
          :ui="{ rounded: 'rounded-[24px]' }"
        />
        <h3 class="mt-4 text-lg font-black text-[var(--text-primary)]">
          {{ contact.name }}
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          {{ contactStatus }}
        </p>

        <div class="mt-4 flex justify-center gap-2">
          <UButton
            v-for="action in quickActions"
            :key="action.id"
            variant="soft"
            color="neutral"
            class="rounded-full px-4 font-semibold"
          >
            <template #leading>
              <Icon :name="action.icon" class="h-4 w-4" />
            </template>
            {{ action.label }}
          </UButton>
        </div>
      </div>

      <div class="space-y-5 py-5">
        <section>
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ infoTitle }}</p>
          <div class="mt-3 space-y-2">
            <div
              v-for="item in infoSections"
              :key="item.title"
              class="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-primary-600 shadow-sm">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-black text-[var(--text-primary)]">{{ item.title }}</p>
                  <p class="text-xs text-slate-500">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="contact.members?.length">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ membersTitle }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <UBadge
              v-for="member in contact.members"
              :key="member"
              color="primary"
              variant="soft"
              class="rounded-full px-3 py-1 font-semibold"
            >
              {{ member }}
            </UBadge>
          </div>
        </section>
      </div>
    </template>

    <div v-else class="flex flex-1 items-center justify-center">
      <div class="max-w-[260px] text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary-50 text-primary-600">
          <Icon name="i-ph-chat-circle-dots-duotone" class="h-8 w-8" />
        </div>
        <h3 class="mt-5 text-base font-black text-[var(--text-primary)]">
          {{ emptyTitle }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          {{ emptyDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageContact } from "../../domain/types/messages.types"

const props = defineProps<{
  contact?: MessageContact | null
  emptyDescription: string
  emptyTitle: string
}>()

const { t } = useI18n()

const quickActions = computed(() => [
  { icon: "i-ph-user-duotone", id: "profile", label: t("pages.messagesPage.profile") },
  { icon: "i-ph-bell-slash-duotone", id: "mute", label: t("pages.messagesPage.muteNotifications") },
  { icon: "i-ph-magnifying-glass-duotone", id: "search", label: t("pages.messagesPage.search") },
])

const contactStatus = computed(() => {
  const contact = props.contact

  if (!contact) {
    return ""
  }

  if (contact.type === "group" && contact.memberCount) {
    return t("pages.messagesPage.groupMembersStatus", {
      count: contact.memberCount,
    })
  }

  return contact.status || t("pages.messagesPage.activeRecently")
})

const infoTitle = computed(() => t("pages.messagesPage.conversationDetails"))
const membersTitle = computed(() => t("pages.messagesPage.members"))

const infoSections = computed(() => [
  {
    icon: "i-ph-info-duotone",
    title: t("pages.messagesPage.chatInfo"),
    description: t("pages.messagesPage.detailsChatInfoDescription"),
  },
  {
    icon: "i-ph-images-duotone",
    title: t("pages.messagesPage.mediaFilesLinks"),
    description: t("pages.messagesPage.detailsMediaDescription"),
  },
  {
    icon: "i-ph-shield-check-duotone",
    title: t("pages.messagesPage.privacySupport"),
    description: t("pages.messagesPage.detailsPrivacyDescription"),
  },
])
</script>
