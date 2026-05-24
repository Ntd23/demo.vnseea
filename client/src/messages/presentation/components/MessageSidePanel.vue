<!-- Description: Renders the messages side panel with real group member management and no placeholder conversation cards. -->
<template>
  <div class="scrollbar-hide flex h-full flex-col overflow-y-auto bg-white p-5">
    <template v-if="contact">
      <div class="border-b border-[#e2e8f0] pb-5 text-center">
        <div
          v-if="contact.type === 'group' && !headerAvatarUrl"
          class="mx-auto flex h-24 w-24 items-center justify-center rounded-[24px] bg-primary-50 text-primary-600"
        >
          <Icon name="i-ph-users-three-fill" class="h-10 w-10" />
        </div>
        <UAvatar
          v-else
          :src="headerAvatarUrl"
          size="3xl"
          class="mx-auto rounded-[24px]"
        />
        <h3 class="mt-4 text-lg font-black text-[var(--text-primary)]">
          {{ headerName }}
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          {{ contactStatus }}
        </p>

        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <UButton
            v-if="contact.profileUrl"
            :to="contact.profileUrl"
            variant="soft"
            color="neutral"
            class="rounded-full px-4 font-semibold"
          >
            <template #leading>
              <Icon name="i-ph-user-duotone" class="h-4 w-4" />
            </template>
            {{ $t("pages.messagesPage.profile") }}
          </UButton>
          <UButton
            variant="soft"
            color="error"
            class="rounded-full px-4 font-semibold"
            :loading="deletingConversation"
            @click="$emit('delete-conversation')"
          >
            <template #leading>
              <Icon name="i-ph-trash-duotone" class="h-4 w-4" />
            </template>
            {{ $t("pages.messagesPage.deleteConversation") }}
          </UButton>
        </div>
      </div>

      <div v-if="isGroupContact" class="space-y-5 py-5">
        <section>
          <div class="flex items-center justify-between gap-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ membersTitle }}</p>
            <span class="text-xs font-semibold text-slate-400">{{ memberCountLabel }}</span>
          </div>

          <div class="mt-3 rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-4">
            <div v-if="groupDetailsPending && groupMembers.length === 0" class="space-y-3">
              <div v-for="index in 3" :key="index" class="flex items-center gap-3">
                <USkeleton class="h-10 w-10 rounded-full" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-32 rounded-full" />
                  <USkeleton class="h-3 w-20 rounded-full" />
                </div>
                <USkeleton class="h-9 w-16 rounded-full" />
              </div>
            </div>

            <div v-else-if="groupMembers.length > 0" class="space-y-2">
              <div
                v-for="member in groupMembers"
                :key="member.userId"
                class="flex items-center gap-3 rounded-[16px] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
              >
                <UAvatar :src="member.avatarUrl" size="md" class="rounded-full" />

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="truncate text-sm font-semibold text-[var(--text-primary)]">{{ member.name }}</span>
                    <UBadge
                      v-if="member.isOwner"
                      color="primary"
                      variant="soft"
                      class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    >
                      {{ $t("pages.messagesPage.groupOwnerBadge") }}
                    </UBadge>
                    <UBadge
                      v-else-if="member.isSelf"
                      color="neutral"
                      variant="soft"
                      class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    >
                      {{ $t("pages.messagesPage.groupYouBadge") }}
                    </UBadge>
                  </div>
                  <p v-if="member.username" class="truncate text-xs text-slate-500">
                    @{{ member.username }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <UButton
                    v-if="member.profileUrl"
                    :to="member.profileUrl"
                    color="neutral"
                    variant="ghost"
                    icon="i-ph-arrow-up-right-bold"
                    class="h-9 w-9 justify-center rounded-full"
                  />
                  <UButton
                    v-if="canRemoveMember(member)"
                    color="error"
                    variant="soft"
                    class="rounded-full px-3 font-semibold"
                    :loading="updatingGroupMembers"
                    @click="$emit('remove-group-member', member.userId)"
                  >
                    {{ $t("pages.messagesPage.groupKickMember") }}
                  </UButton>
                </div>
              </div>
            </div>

            <p v-else class="text-sm text-slate-500">
              {{ $t("pages.messagesPage.groupMembersEmpty") }}
            </p>
          </div>
        </section>

        <section v-if="groupCanManage">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ $t("pages.messagesPage.groupManageTitle") }}</p>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ $t("pages.messagesPage.groupManageDescription") }}
          </p>

          <UInput
            :model-value="groupCandidateQuery"
            :placeholder="$t('pages.messagesPage.groupInviteSearchPlaceholder')"
            icon="i-ph-magnifying-glass-duotone"
            size="lg"
            class="mt-4"
            @update:model-value="updateGroupCandidateQuery"
          />

          <div class="mt-3 rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-4">
            <div v-if="groupCandidatesPending" class="space-y-3">
              <div v-for="index in 3" :key="index" class="flex items-center gap-3">
                <USkeleton class="h-10 w-10 rounded-full" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-28 rounded-full" />
                  <USkeleton class="h-3 w-24 rounded-full" />
                </div>
                <USkeleton class="h-9 w-14 rounded-full" />
              </div>
            </div>

            <div v-else-if="groupCandidateList.length > 0" class="space-y-2">
              <div
                v-for="candidate in groupCandidateList"
                :key="candidate.userId"
                class="flex items-center gap-3 rounded-[16px] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
              >
                <UAvatar :src="candidate.avatarUrl" size="md" class="rounded-full" />

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-[var(--text-primary)]">{{ candidate.name }}</p>
                  <p v-if="candidate.username" class="truncate text-xs text-slate-500">
                    @{{ candidate.username }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <UButton
                    v-if="candidate.profileUrl"
                    :to="candidate.profileUrl"
                    color="neutral"
                    variant="ghost"
                    icon="i-ph-arrow-up-right-bold"
                    class="h-9 w-9 justify-center rounded-full"
                  />
                  <UButton
                    color="primary"
                    variant="soft"
                    class="rounded-full px-3 font-semibold"
                    :loading="updatingGroupMembers"
                    @click="$emit('add-group-member', candidate.userId)"
                  >
                    {{ $t("pages.messagesPage.groupAddMember") }}
                  </UButton>
                </div>
              </div>
            </div>

            <p v-else class="text-sm text-slate-500">
              {{ $t("pages.messagesPage.groupCandidatesEmpty") }}
            </p>
          </div>
        </section>

        <section v-else-if="groupDetailsPending && groupMembers.length === 0">
          <p class="text-sm text-slate-500">
            {{ $t("pages.messagesPage.loadingGroupMembers") }}
          </p>
        </section>
      </div>

      <div v-else-if="contact.tags?.length" class="space-y-5 py-5">
        <section>
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ $t("pages.messagesPage.label") }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <UBadge
              v-for="tag in contact.tags"
              :key="tag.id"
              color="primary"
              variant="soft"
              class="rounded-full px-3 py-1 font-semibold"
            >
              {{ tag.name }}
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
import type {
  MessageContact,
  MessageGroupCandidate,
  MessageGroupDetails,
  MessageGroupMember,
} from "../../domain/types/messages.types"

const props = defineProps<{
  contact?: MessageContact | null
  groupCandidateQuery?: string
  groupCandidates?: MessageGroupCandidate[]
  groupCandidatesPending?: boolean
  groupDetails?: MessageGroupDetails | null
  groupDetailsPending?: boolean
  updatingGroupMembers?: boolean
  deletingConversation?: boolean
  emptyDescription: string
  emptyTitle: string
}>()

const { t } = useI18n()
const emit = defineEmits<{
  "delete-conversation": []
  "update:group-candidate-query": [value: string]
  "add-group-member": [userId: number]
  "remove-group-member": [userId: number]
}>()

const isGroupContact = computed(() => props.contact?.type === "group")
const groupMembers = computed(() => props.groupDetails?.members ?? [])
const groupCandidateList = computed(() => props.groupCandidates ?? [])
const groupCanManage = computed(() => Boolean(props.groupDetails?.canManage))

const headerAvatarUrl = computed(() =>
  props.groupDetails?.avatarUrl || props.contact?.avatarUrl || "",
)

const headerName = computed(() =>
  props.groupDetails?.name || props.contact?.name || "",
)

const contactStatus = computed(() => {
  const contact = props.contact

  if (!contact) {
    return ""
  }

  if (contact.type === "group") {
    if (props.groupDetailsPending && groupMembers.value.length === 0) {
      return t("pages.messagesPage.loadingGroupMembers")
    }

    const count = props.groupDetails?.memberCount ?? contact.memberCount ?? 0
    return t("pages.messagesPage.groupMembersStatus", { count })
  }

  if (contact.isOnline) {
    return t("pages.messagesPage.activeNow")
  }

  return contact.status || t("pages.messagesPage.activeRecently")
})

const membersTitle = computed(() => t("pages.messagesPage.members"))
const memberCountLabel = computed(() =>
  t("pages.messagesPage.groupMembersStatus", {
    count: props.groupDetails?.memberCount ?? props.contact?.memberCount ?? 0,
  }),
)

function updateGroupCandidateQuery(value: string | number) {
  const normalized = typeof value === "string" ? value : String(value ?? "")
  emit("update:group-candidate-query", normalized)
}

function canRemoveMember(member: MessageGroupMember) {
  return groupCanManage.value && !member.isOwner && !member.isSelf
}
</script>
