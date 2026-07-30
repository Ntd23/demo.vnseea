<!-- English description: Renders one-to-one conversation details, notification controls, message search, and shared media, files, and links. -->
<template>
  <div class="user-detail-panel flex h-full w-full flex-col overflow-y-auto bg-[var(--bg-base)]">
    <template v-if="contact">
      <div class="sticky top-0 z-10 flex min-h-[60px] items-center border-b border-[var(--border-light)] bg-[var(--bg-surface)] px-5 py-3">
        <h2 class="text-base font-bold text-[var(--text-primary)]">
          {{ $t("pages.messagesPage.info") }}
        </h2>
      </div>

      <div class="flex flex-1 flex-col gap-3 p-3">
        <section class="flex flex-col items-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] px-4 py-6 text-center shadow-[var(--shadow-sm)]">
          <div class="relative inline-block">
            <UAvatar
              :src="contact.avatarUrl"
              size="3xl"
              class="h-20 w-20 rounded-full border-2 border-[var(--border-light)] shadow-[var(--shadow-sm)] ring-2 ring-[var(--border-light)]"
            />
            <span
              v-if="contact.isOnline"
              class="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--bg-surface)]"
              :title="$t('pages.messagesPage.activeNow')"
            />
          </div>

          <h3 class="mt-3 line-clamp-1 text-lg font-extrabold text-[var(--text-primary)]">
            {{ contact.name }}
          </h3>
          <p class="mt-0.5 text-xs font-semibold text-[var(--text-secondary)]">
            {{ contactStatus }}
          </p>

          <div class="mt-5 grid w-full grid-cols-4 gap-2">
            <NuxtLink
              v-if="contact.profileUrl"
              :to="contact.profileUrl"
              class="group flex min-w-0 flex-col items-center gap-1.5 text-decoration-none"
            >
              <span class="user-detail-panel__quick-icon bg-[var(--bg-surface-active)] text-[var(--text-brand)] group-hover:bg-[var(--bg-brand)] group-hover:text-[var(--text-inverse)]">
                <Icon name="i-ph-user-bold" />
              </span>
              <span class="user-detail-panel__quick-label">{{ $t("pages.messagesPage.viewProfile") }}</span>
            </NuxtLink>

            <button
              type="button"
              class="group flex min-w-0 cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="notificationsPending || !contact.chatId"
              @click="$emit('toggle-notifications')"
            >
              <span
                class="user-detail-panel__quick-icon"
                :class="notificationsMuted
                  ? 'bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-[var(--text-danger)]'
                  : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'"
              >
                <Icon
                  :name="notificationsPending
                    ? 'i-ph-spinner-gap-bold'
                    : notificationsMuted
                      ? 'i-ph-bell-slash-fill'
                      : 'i-ph-bell-bold'"
                  :class="{ 'animate-spin': notificationsPending }"
                />
              </span>
              <span class="user-detail-panel__quick-label">
                {{ notificationsMuted ? $t("pages.messagesPage.unmuteNotifications") : $t("pages.messagesPage.muteNotifications") }}
              </span>
            </button>

            <button
              type="button"
              class="group flex min-w-0 cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent"
              @click="focusSearch"
            >
              <span class="user-detail-panel__quick-icon bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                <Icon name="i-ph-magnifying-glass-bold" />
              </span>
              <span class="user-detail-panel__quick-label">{{ $t("pages.messagesPage.searchConversation") }}</span>
            </button>

            <button
              type="button"
              class="group flex min-w-0 cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="deletingConversation"
              @click="$emit('delete-conversation')"
            >
              <span class="user-detail-panel__quick-icon bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] text-[var(--text-danger)]">
                <Icon
                  :name="deletingConversation ? 'i-ph-spinner-gap-bold' : 'i-ph-trash-bold'"
                  :class="{ 'animate-spin': deletingConversation }"
                />
              </span>
              <span class="user-detail-panel__quick-label">{{ $t("pages.messagesPage.deleteConversation") }}</span>
            </button>
          </div>
        </section>

        <section
          ref="searchSectionRef"
          class="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)]"
        >
          <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            {{ $t("pages.messagesPage.searchConversation") }}
          </h3>
          <UInput
            :model-value="searchQuery"
            icon="i-ph-magnifying-glass-bold"
            :placeholder="$t('pages.messagesPage.searchConversationPlaceholder')"
            class="w-full"
            @update:model-value="$emit('update:search-query', String($event || ''))"
          />

          <div v-if="searchPending" class="mt-3 space-y-2" aria-hidden="true">
            <USkeleton v-for="index in 3" :key="index" class="h-14 rounded-xl" />
          </div>
          <p v-else-if="searchFailed" class="mt-3 text-xs text-[var(--text-danger)]">
            {{ $t("pages.messagesPage.searchConversationError") }}
          </p>
          <div v-else-if="searchQuery.trim().length >= 2" class="mt-3 max-h-64 space-y-1 overflow-y-auto">
            <button
              v-for="message in searchResults"
              :key="message.id"
              type="button"
              class="flex w-full items-start gap-2 rounded-xl border-0 bg-transparent px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-surface-hover)]"
              @click="$emit('select-message', message.id)"
            >
              <Icon name="i-ph-chat-circle-text-bold" class="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-brand)]" />
              <span class="min-w-0 flex-1">
                <strong class="block truncate text-xs text-[var(--text-primary)]">
                  {{ message.isMine ? $t("pages.messagesPage.you") : contact.name }}
                </strong>
                <span class="line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                  {{ message.text || message.mediaName || $t("pages.messagesPage.attachmentLabel") }}
                </span>
              </span>
              <span class="shrink-0 text-[10px] text-[var(--text-tertiary)]">{{ message.time }}</span>
            </button>
            <p v-if="searchResults.length === 0" class="py-3 text-center text-xs text-[var(--text-secondary)]">
              {{ $t("pages.messagesPage.searchConversationEmpty") }}
            </p>
          </div>
        </section>

        <section class="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)]">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              {{ $t("pages.messagesPage.sharedContent") }}
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-ph-arrow-clockwise-bold"
              :loading="sharedContentPending"
              :aria-label="$t('pages.messagesPage.reloadSharedContent')"
              @click="$emit('reload-shared-content')"
            />
          </div>

          <div class="grid grid-cols-3 rounded-xl bg-[var(--bg-muted)] p-1">
            <button
              v-for="tab in sharedTabs"
              :key="tab.value"
              type="button"
              class="rounded-lg border-0 px-2 py-2 text-xs font-bold transition-colors"
              :class="activeSharedTab === tab.value
                ? 'bg-[var(--bg-surface-active)] text-[var(--text-brand)]'
                : 'bg-transparent text-[var(--text-secondary)]'"
              @click="activeSharedTab = tab.value"
            >
              {{ $t(tab.label) }}
            </button>
          </div>

          <div v-if="sharedContentPending" class="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
            <USkeleton v-for="index in 6" :key="index" class="aspect-square rounded-xl" />
          </div>
          <div v-else-if="sharedContentFailed" class="py-6 text-center">
            <Icon name="i-ph-warning-circle-bold" class="mx-auto h-6 w-6 text-[var(--text-danger)]" />
            <p class="mt-2 text-xs text-[var(--text-secondary)]">{{ $t("pages.messagesPage.sharedContentError") }}</p>
          </div>

          <div v-else-if="activeSharedTab === 'media'" class="mt-3">
            <div v-if="sharedContent.media.length" class="grid grid-cols-3 gap-2">
              <button
                v-for="item in sharedContent.media"
                :key="`${item.kind}:${item.id}`"
                type="button"
                class="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)]"
                @click="openMedia(item)"
              >
                <img
                  v-if="item.kind === 'image'"
                  :src="item.url"
                  :alt="item.title"
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                >
                <video
                  v-else
                  :src="item.url"
                  class="h-full w-full object-cover"
                  muted
                  preload="metadata"
                />
                <span v-if="item.kind === 'video'" class="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Icon name="i-ph-play-circle-fill" class="h-8 w-8 text-white drop-shadow" />
                </span>
              </button>
            </div>
            <SharedContentEmpty v-else :label="$t('pages.messagesPage.sharedMediaEmpty')" />
          </div>

          <div v-else-if="activeSharedTab === 'files'" class="mt-3 space-y-1">
            <a
              v-for="item in sharedContent.files"
              :key="item.id"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-decoration-none transition-colors hover:bg-[var(--bg-surface-hover)]"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-muted)] text-[var(--text-brand)]">
                <Icon name="i-ph-file-text-bold" class="h-5 w-5" />
              </span>
              <span class="min-w-0 flex-1">
                <strong class="block truncate text-xs text-[var(--text-primary)]">{{ item.title }}</strong>
                <span class="text-[10px] text-[var(--text-tertiary)]">{{ item.senderName }} · {{ item.time }}</span>
              </span>
              <Icon name="i-ph-arrow-square-out-bold" class="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
            </a>
            <SharedContentEmpty v-if="!sharedContent.files.length" :label="$t('pages.messagesPage.sharedFilesEmpty')" />
          </div>

          <div v-else class="mt-3 space-y-1">
            <a
              v-for="item in sharedContent.links"
              :key="item.id"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-decoration-none transition-colors hover:bg-[var(--bg-surface-hover)]"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-muted)] text-[var(--text-brand)]">
                <Icon name="i-ph-link-bold" class="h-5 w-5" />
              </span>
              <span class="min-w-0 flex-1">
                <strong class="block truncate text-xs text-[var(--text-primary)]">{{ item.title }}</strong>
                <span class="block truncate text-[10px] text-[var(--text-tertiary)]">{{ item.url }}</span>
              </span>
              <Icon name="i-ph-arrow-square-out-bold" class="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
            </a>
            <SharedContentEmpty v-if="!sharedContent.links.length" :label="$t('pages.messagesPage.sharedLinksEmpty')" />
          </div>
        </section>

        <section class="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-2 shadow-[var(--shadow-sm)]">
          <NuxtLink
            v-if="contact.profileUrl"
            :to="contact.profileUrl"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] text-decoration-none transition-colors hover:bg-[var(--bg-surface-hover)]"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-muted)] text-[var(--text-secondary)]">
              <Icon name="i-ph-user-bold" class="h-5 w-5" />
            </div>
            <span class="min-w-0 flex-1">{{ $t("pages.messagesPage.viewProfile") }}</span>
            <Icon name="i-ph-arrow-square-out-bold" class="h-4 w-4 text-[var(--text-tertiary)]" />
          </NuxtLink>
        </section>
      </div>
    </template>

    <div v-else class="flex flex-1 items-center justify-center px-6 py-8">
      <div class="max-w-[260px] text-center">
        <Icon name="i-ph-user-circle-bold" class="mx-auto h-12 w-12 text-[var(--text-brand)]" />
        <h3 class="mt-5 text-base font-semibold text-[var(--text-primary)]">{{ emptyTitle }}</h3>
        <p class="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{{ emptyDescription }}</p>
      </div>
    </div>

    <MessageMediaViewer
      v-if="activeMedia"
      :open="Boolean(activeMedia)"
      :src="activeMedia.url"
      :type="activeMedia.kind"
      :alt="activeMedia.title"
      @close="activeMedia = null"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  MessageContact,
  MessageItem,
  MessageSharedContent,
  MessageSharedContentItem,
} from "../../domain/types/messages.types"
import MessageMediaViewer from "./MessageMediaViewer.vue"
import SharedContentEmpty from "./SharedContentEmpty.vue"

const props = withDefaults(defineProps<{
  contact?: MessageContact | null
  deletingConversation?: boolean
  emptyDescription: string
  emptyTitle: string
  notificationsMuted?: boolean
  notificationsPending?: boolean
  searchQuery?: string
  searchResults?: MessageItem[]
  searchPending?: boolean
  searchFailed?: boolean
  sharedContent: MessageSharedContent
  sharedContentPending?: boolean
  sharedContentFailed?: boolean
}>(), {
  notificationsMuted: false,
  notificationsPending: false,
  searchQuery: "",
  searchResults: () => [],
  searchPending: false,
  searchFailed: false,
  sharedContentPending: false,
  sharedContentFailed: false,
})

defineEmits<{
  "delete-conversation": []
  "toggle-notifications": []
  "update:search-query": [value: string]
  "select-message": [messageId: number]
  "reload-shared-content": []
}>()

const { t } = useI18n()
const searchSectionRef = ref<HTMLElement | null>(null)
const activeSharedTab = ref<"media" | "files" | "links">("media")
const activeMedia = ref<(MessageSharedContentItem & { kind: "image" | "video" }) | null>(null)
const sharedTabs = [
  { value: "media" as const, label: "pages.messagesPage.sharedMedia" },
  { value: "files" as const, label: "pages.messagesPage.sharedFiles" },
  { value: "links" as const, label: "pages.messagesPage.sharedLinks" },
]

const contactStatus = computed(() => {
  if (!props.contact) return ""
  if (props.contact.isOnline) return t("pages.messagesPage.activeNow")
  return props.contact.status || t("pages.messagesPage.activeRecently")
})

function focusSearch() {
  searchSectionRef.value?.scrollIntoView({ behavior: "smooth", block: "start" })
  nextTick(() => searchSectionRef.value?.querySelector<HTMLInputElement>("input")?.focus())
}

function openMedia(item: MessageSharedContentItem) {
  if (item.kind !== "image" && item.kind !== "video") return
  activeMedia.value = item
}
</script>

<style scoped>
.user-detail-panel__quick-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  box-shadow: var(--shadow-sm);
  transition: all 150ms ease;
}

.user-detail-panel__quick-icon :deep(svg) {
  width: 19px;
  height: 19px;
}

.user-detail-panel__quick-label {
  width: 100%;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
}
</style>
