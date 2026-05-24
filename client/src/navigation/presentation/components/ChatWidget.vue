<!-- English description: Renders the right-sidebar chat widget with real inbox contacts, quick send actions, mini threads, and online presence indicators. -->
<template>
  <div class="chat-widget">
    <div class="chat-widget__header">
      <div>
        <span class="chat-widget__title">{{ $t("navigation.chatWidget.title") }}</span>
        <div class="chat-widget__online">
          <div class="chat-widget__online-dot" />
          <span>{{ $t("navigation.chatWidget.onlineCount", { count: onlineCount }) }}</span>
        </div>
      </div>

      <div class="chat-widget__header-actions">
        <button
          class="chat-widget__header-btn"
          type="button"
          :title="$t('navigation.chatWidget.actionCreateGroup')"
          @click="openMessagesTab('multi')"
        >
          <Icon name="i-ph-user-plus-duotone" class="h-4 w-4" />
        </button>
        <button
          class="chat-widget__header-btn"
          type="button"
          :title="$t('navigation.chatWidget.actionOpenMessages')"
          @click="openMessagesTab()"
        >
          <Icon name="i-ph-chat-teardrop-dots-duotone" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="chat-widget__tabs">
      <UButton
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        color="neutral"
        variant="ghost"
        class="chat-widget__tab"
        :class="{ 'chat-widget__tab--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <Icon :name="activeTab === tab.value ? tab.activeIcon : tab.icon" class="h-4 w-4" />
        <span>{{ $t(tab.label) }}</span>
      </UButton>
    </div>

    <div v-if="activeTab === 'send'" class="chat-widget__content chat-widget__content--send">
      <div class="chat-widget__field">
        <label class="chat-widget__field-label">{{ $t("navigation.chatWidget.sendToLabel") }}</label>
        <UInput
          v-model="sendTo"
          :placeholder="$t('navigation.chatWidget.recipientPlaceholder')"
          icon="i-ph-magnifying-glass-duotone"
          :ui="{
            base: 'rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)] px-3 py-2 text-sm shadow-none',
          }"
        />
      </div>

      <div v-if="selectedSendTarget" class="chat-widget__selected-target">
        <div class="chat-widget__selected-target-main">
          <span class="chat-widget__selected-target-name">{{ selectedSendTarget.name }}</span>
          <span class="chat-widget__selected-target-meta">{{ buildPresenceLabel(selectedSendTarget) }}</span>
        </div>
        <button
          class="chat-widget__clear-btn"
          type="button"
          :title="$t('navigation.chatWidget.clearSelectedRecipient')"
          @click="clearSendTarget"
        >
          <Icon name="i-ph-x-bold" class="h-3 w-3" />
        </button>
      </div>

      <div v-if="showSendCandidates" class="chat-widget__suggestions">
        <button
          v-for="candidate in sendCandidates"
          :key="candidate.id"
          type="button"
          class="chat-widget__suggestion"
          @click="selectSendTarget(candidate)"
        >
          <UAvatar
            v-if="candidate.type === 'user'"
            :src="candidate.avatarUrl"
            :alt="candidate.name"
            size="xs"
            class="rounded-full"
          />
          <div v-else class="chat-widget__group-icon">
            <Icon name="i-ph-users-three-fill" class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <p class="chat-widget__suggestion-name">{{ candidate.name }}</p>
            <p class="chat-widget__suggestion-meta">{{ buildPresenceLabel(candidate) }}</p>
          </div>
        </button>
      </div>
      <p v-else-if="sendTo.trim() && !selectedSendTarget" class="chat-widget__hint">
        {{ $t("navigation.chatWidget.noMatchingRecipients") }}
      </p>

      <div class="chat-widget__field">
        <UTextarea
          v-model="sendMessage"
          autoresize
          :rows="3"
          :placeholder="$t('navigation.chatWidget.messagePlaceholder')"
          :ui="{
            base: 'rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-3 text-sm shadow-none',
          }"
          @keydown.enter.exact.prevent="sendQuickMessage"
        />
      </div>

      <div class="chat-widget__composer-tools">
        <input
          ref="fileInput"
          class="hidden"
          type="file"
          @change="onFile"
        >
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          icon="i-ph-paperclip-duotone"
          class="rounded-full"
          @click="fileInput?.click()"
        >
          {{ $t("navigation.chatWidget.chooseFile") }}
        </UButton>
        <span v-if="attachFile" class="chat-widget__file-name">{{ attachFile.name }}</span>
        <button
          v-if="attachFile"
          class="chat-widget__clear-btn"
          type="button"
          :title="$t('navigation.chatWidget.clearAttachment')"
          @click="clearFile"
        >
          <Icon name="i-ph-x-bold" class="h-3 w-3" />
        </button>
      </div>

      <UButton
        type="button"
        color="primary"
        variant="solid"
        icon="i-ph-paper-plane-right-fill"
        class="chat-widget__send-btn"
        :loading="isSendingQuick"
        :disabled="!canSendQuickMessage"
        @click="sendQuickMessage"
      >
        {{ $t("navigation.chatWidget.sendMessage") }}
      </UButton>
    </div>

    <div v-else class="chat-widget__content">
      <div v-if="isLoadingInbox" class="chat-widget__list chat-widget__list--loading">
        <div v-for="index in 5" :key="index" class="chat-widget__skeleton-row">
          <USkeleton class="h-10 w-10 rounded-full" />
          <div class="min-w-0 flex-1 space-y-2">
            <USkeleton class="h-3 w-2/3 rounded-full" />
            <USkeleton class="h-3 w-full rounded-full" />
          </div>
        </div>
      </div>

      <div
        v-else-if="activeTab === 'contacts' && filteredContacts.length === 0"
        class="chat-widget__empty"
      >
        <Icon name="i-ph-chat-circle-dots-duotone" class="chat-widget__empty-icon" />
        <p>{{ $t("navigation.chatWidget.emptyContacts") }}</p>
      </div>

      <div
        v-else-if="activeTab === 'groups' && filteredGroups.length === 0"
        class="chat-widget__empty"
      >
        <Icon name="i-ph-users-three-duotone" class="chat-widget__empty-icon" />
        <p>{{ $t("navigation.chatWidget.emptyGroups") }}</p>
      </div>

      <div v-else class="chat-widget__list">
        <button
          v-for="contact in activeTab === 'contacts' ? filteredContacts : filteredGroups"
          :key="contact.id"
          class="chat-widget__contact"
          type="button"
          @click="openMiniChat(contact)"
        >
          <div class="chat-widget__contact-avatar-wrap">
            <UAvatar
              v-if="contact.type === 'user'"
              :src="contact.avatarUrl"
              :alt="contact.name"
              size="md"
              class="h-10 w-10 rounded-full"
            />
            <div v-else class="chat-widget__group-icon chat-widget__group-icon--large">
              <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
            </div>
            <div
              v-if="contact.type === 'user'"
              class="chat-widget__contact-status"
              :class="{ 'chat-widget__contact-status--online': contact.isOnline }"
            />
          </div>

          <div class="chat-widget__contact-info">
            <div class="chat-widget__contact-top">
              <p class="chat-widget__contact-name">{{ contact.name }}</p>
              <span class="chat-widget__contact-time">{{ contact.time }}</span>
            </div>

            <div class="chat-widget__contact-middle">
              <span
                class="chat-widget__contact-presence"
                :class="{ 'chat-widget__contact-presence--online': contact.type === 'user' && contact.isOnline }"
              >
                {{ buildPresenceLabel(contact) }}
              </span>
              <span v-if="contact.unreadCount > 0" class="chat-widget__contact-badge">
                {{ contact.unreadCount > 99 ? "99+" : contact.unreadCount }}
              </span>
            </div>

            <p v-if="buildPreviewLabel(contact)" class="chat-widget__contact-preview">
              {{ buildPreviewLabel(contact) }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <div v-if="activeTab !== 'send'" class="chat-widget__footer">
      <UInput
        v-model="search"
        :placeholder="$t('navigation.chatWidget.searchPlaceholder')"
        icon="i-ph-magnifying-glass-duotone"
        :ui="{
          base: 'rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)] px-3 py-2 text-sm shadow-none',
        }"
      />
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-8 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-8 scale-95"
    >
      <div v-if="miniChatOpen && activeMiniContact" class="chat-widget__mini">
        <div class="chat-widget__mini-header">
          <div class="min-w-0">
            <p class="chat-widget__mini-title">{{ activeMiniContact.name }}</p>
            <p class="chat-widget__mini-status">{{ buildPresenceLabel(activeMiniContact) }}</p>
          </div>

          <div class="chat-widget__mini-header-actions">
            <button
              class="chat-widget__header-btn"
              type="button"
              :title="$t('navigation.chatWidget.actionOpenMessages')"
              @click="openFullMessages(activeMiniContact)"
            >
              <Icon name="i-ph-arrows-out-simple-duotone" class="h-3.5 w-3.5" />
            </button>
            <button class="chat-widget__header-btn" type="button" @click="closeMiniChat">
              <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div ref="miniMessagesViewport" class="chat-widget__mini-messages">
          <div v-if="isLoadingThread" class="space-y-3">
            <USkeleton v-for="index in 3" :key="index" class="h-12 rounded-2xl" />
          </div>

          <div v-else-if="miniMessages.length === 0" class="chat-widget__empty chat-widget__empty--mini">
            <Icon name="i-ph-chat-teardrop-text-duotone" class="chat-widget__empty-icon" />
            <p>{{ $t("navigation.chatWidget.emptyMessages") }}</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="message in miniMessages"
              :key="message.id"
              class="chat-widget__mini-row"
              :class="message.isMine ? 'chat-widget__mini-row--sent' : 'chat-widget__mini-row--received'"
            >
              <div
                class="chat-widget__mini-bubble"
                :class="message.isMine ? 'chat-widget__mini-bubble--sent' : 'chat-widget__mini-bubble--received'"
              >
                <p
                  v-if="activeMiniContact?.type === 'group' && !message.isMine && message.showAuthor && message.authorName"
                  class="chat-widget__mini-author"
                >
                  {{ message.authorName }}
                </p>
                <p v-if="message.text" class="whitespace-pre-wrap">{{ message.text }}</p>

                <NuxtImg
                  v-if="message.mediaUrl && (message.mediaType === 'image' || message.mediaType === 'gif')"
                  :src="message.mediaUrl"
                  :alt="message.mediaName || message.text || 'Message media'"
                  class="chat-widget__mini-media"
                />
                <video
                  v-else-if="message.mediaUrl && message.mediaType === 'video'"
                  :src="message.mediaUrl"
                  class="chat-widget__mini-media"
                  controls
                  playsinline
                />
                <audio
                  v-else-if="message.mediaUrl && (message.mediaType === 'audio' || message.mediaType === 'record')"
                  :src="message.mediaUrl"
                  class="chat-widget__mini-audio"
                  controls
                  preload="none"
                />
                <a
                  v-else-if="message.mediaUrl"
                  :href="message.mediaUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="chat-widget__mini-file"
                >
                  <Icon name="i-ph-paperclip-duotone" class="h-3.5 w-3.5" />
                  <span>{{ message.mediaName || message.mediaUrl }}</span>
                </a>

                <p v-if="message.time" class="chat-widget__mini-time">{{ message.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-widget__mini-input-wrap">
          <UInput
            v-model="miniChatMessage"
            :placeholder="$t('navigation.chatWidget.miniInputPlaceholder')"
            :ui="{
              base: 'rounded-full border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-2 text-sm shadow-none',
            }"
            @keydown.enter.exact.prevent="sendMiniMessage"
          />
          <UButton
            type="button"
            color="primary"
            variant="solid"
            icon="i-ph-paper-plane-right-fill"
            class="h-10 w-10 justify-center rounded-full"
            :loading="isSendingMini"
            :disabled="!canSendMiniMessage"
            @click="sendMiniMessage"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { useChatWidgetVM } from "../../application/composables/useChatWidgetVM"

const tabs = [
  {
    value: "send",
    icon: "i-ph-paper-plane-right-duotone",
    activeIcon: "i-ph-paper-plane-tilt-fill",
    label: "navigation.chatWidget.tabSend",
  },
  {
    value: "contacts",
    icon: "i-ph-address-book-duotone",
    activeIcon: "i-ph-address-book-fill",
    label: "navigation.chatWidget.tabContacts",
  },
  {
    value: "groups",
    icon: "i-ph-users-three-duotone",
    activeIcon: "i-ph-users-three-fill",
    label: "navigation.chatWidget.tabGroups",
  },
] as const

const fileInput = ref<HTMLInputElement | null>(null)
const miniMessagesViewport = ref<HTMLElement | null>(null)
const {
  activeTab,
  search,
  sendTo,
  sendMessage,
  attachFile,
  selectedSendTarget,
  sendCandidates,
  filteredContacts,
  filteredGroups,
  onlineCount,
  miniChatOpen,
  miniChatMessage,
  activeMiniContact,
  miniMessages,
  isLoadingInbox,
  isLoadingThread,
  isSendingQuick,
  isSendingMini,
  canSendQuickMessage,
  canSendMiniMessage,
  buildPresenceLabel,
  buildPreviewLabel,
  selectSendTarget,
  clearSendTarget,
  openMiniChat,
  closeMiniChat,
  sendQuickMessage,
  sendMiniMessage,
  onFile,
  clearFile,
  openFullMessages,
  openMessagesTab,
} = useChatWidgetVM()

const showSendCandidates = computed(() => {
  if (sendCandidates.value.length === 0) {
    return false
  }

  if (!selectedSendTarget.value) {
    return true
  }

  return selectedSendTarget.value.name.trim().toLowerCase() !== sendTo.value.trim().toLowerCase()
})

function scrollMiniMessagesToBottom() {
  if (!miniMessagesViewport.value) {
    return
  }

  miniMessagesViewport.value.scrollTop = miniMessagesViewport.value.scrollHeight
}

watch(
  () => [miniChatOpen.value, miniMessages.value.length] as const,
  async ([open]) => {
    if (!open) {
      return
    }

    await nextTick()
    scrollMiniMessagesToBottom()
  },
  { flush: "post" },
)
</script>

<style scoped>
.chat-widget {
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
}

.chat-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.chat-widget__title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.chat-widget__online {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.chat-widget__online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0ea5e9;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.chat-widget__header-actions,
.chat-widget__mini-header-actions {
  display: flex;
  gap: 4px;
}

.chat-widget__header-btn {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chat-widget__header-btn:hover {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.chat-widget__tabs {
  display: flex;
  gap: 2px;
  padding: 6px 12px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.chat-widget__tab {
  flex: 1;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  color: #64748b;
}

.chat-widget__tab--active {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.chat-widget__content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
}

.chat-widget__content--send {
  padding: 16px;
}

.chat-widget__field + .chat-widget__field,
.chat-widget__field + .chat-widget__composer-tools,
.chat-widget__composer-tools + .chat-widget__send-btn,
.chat-widget__suggestions + .chat-widget__field,
.chat-widget__selected-target + .chat-widget__suggestions,
.chat-widget__field + .chat-widget__hint {
  margin-top: 14px;
}

.chat-widget__field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}

.chat-widget__selected-target {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 255, 0.08);
  background: rgba(0, 0, 255, 0.04);
  padding: 10px 12px;
}

.chat-widget__selected-target-main {
  min-width: 0;
}

.chat-widget__selected-target-name,
.chat-widget__suggestion-name {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.chat-widget__selected-target-meta,
.chat-widget__suggestion-meta {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #64748b;
}

.chat-widget__suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-widget__suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 12px;
  padding: 9px 10px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.chat-widget__suggestion:hover {
  background: #f8fafc;
  border-color: rgba(0, 0, 255, 0.12);
}

.chat-widget__composer-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chat-widget__file-name {
  min-width: 0;
  flex: 1;
  font-size: 11px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__clear-btn {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: none;
  background: #e2e8f0;
  color: #475569;
  cursor: pointer;
}

.chat-widget__send-btn {
  width: 100%;
  justify-content: center;
  border-radius: 14px;
  padding-block: 11px;
}

.chat-widget__hint,
.chat-widget__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 22px 16px;
  font-size: 12px;
  text-align: center;
  color: #94a3b8;
}

.chat-widget__empty--mini {
  min-height: 180px;
}

.chat-widget__empty-icon {
  width: 28px;
  height: 28px;
}

.chat-widget__list {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.chat-widget__list--loading {
  gap: 14px;
  padding: 14px 16px;
}

.chat-widget__skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-widget__contact {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  border: none;
  background: transparent;
  padding: 10px 16px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.chat-widget__contact:hover {
  background: #f8fafc;
}

.chat-widget__contact-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.chat-widget__contact-status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  background: #94a3b8;
}

.chat-widget__contact-status--online {
  background: #22c55e;
}

.chat-widget__contact-info {
  min-width: 0;
  flex: 1;
}

.chat-widget__contact-top,
.chat-widget__contact-middle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.chat-widget__contact-name {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-widget__contact-time {
  flex-shrink: 0;
  font-size: 11px;
  color: #94a3b8;
}

.chat-widget__contact-presence {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
}

.chat-widget__contact-presence--online {
  color: #16a34a;
  font-weight: 700;
}

.chat-widget__contact-badge {
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #0000ff;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
}

.chat-widget__contact-preview {
  margin: 3px 0 0;
  font-size: 11.5px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-widget__group-icon {
  display: flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.chat-widget__group-icon--large {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.chat-widget__footer {
  flex-shrink: 0;
  border-top: 1px solid #f1f5f9;
  padding: 10px 12px;
}

.chat-widget__mini {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 56px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 255, 0.08);
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
}

.chat-widget__mini-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfe;
}

.chat-widget__mini-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.chat-widget__mini-status {
  margin: 2px 0 0;
  font-size: 11px;
  color: #64748b;
}

.chat-widget__mini-messages {
  max-height: 320px;
  overflow-y: auto;
  padding: 14px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.55) 0%, rgba(255, 255, 255, 1) 100%);
}

.chat-widget__mini-row {
  display: flex;
}

.chat-widget__mini-row + .chat-widget__mini-row {
  margin-top: 10px;
}

.chat-widget__mini-row--sent {
  justify-content: flex-end;
}

.chat-widget__mini-row--received {
  justify-content: flex-start;
}

.chat-widget__mini-bubble {
  max-width: 86%;
  border-radius: 16px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
}

.chat-widget__mini-author {
  margin: 0 0 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #64748b;
}

.chat-widget__mini-bubble--sent {
  background: #0000ff;
  color: #ffffff;
  border-bottom-right-radius: 5px;
}

.chat-widget__mini-bubble--received {
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 5px;
}

.chat-widget__mini-media {
  display: block;
  width: 100%;
  max-height: 180px;
  margin-top: 8px;
  border-radius: 12px;
  object-fit: cover;
}

.chat-widget__mini-audio {
  width: 100%;
  min-width: 210px;
  margin-top: 8px;
}

.chat-widget__mini-file {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  text-decoration: none;
  color: inherit;
}

.chat-widget__mini-time {
  margin: 6px 0 0;
  font-size: 10px;
  opacity: 0.7;
}

.chat-widget__mini-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
  padding: 10px 12px;
}
</style>
