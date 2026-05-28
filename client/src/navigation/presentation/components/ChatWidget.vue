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
      <div class="chat-widget__send-scroll">
        <div class="chat-widget__send-card">
          <div class="chat-widget__field">
            <label class="chat-widget__field-label">
              <span class="inline-flex items-center gap-1.5">
                <Icon name="i-ph-tag-duotone" class="h-3.5 w-3.5" />
                <span>{{ $t("pages.messagesPage.label") }}</span>
              </span>
            </label>
            <select v-model="activeSendTagFilter" class="chat-widget__select">
              <option value="">{{ $t("pages.messagesPage.chooseTag") }}</option>
              <option value="0">{{ $t("pages.messagesPage.allTaggedUsers") }}</option>
              <option
                v-for="tag in messageTagLabels"
                :key="tag.id"
                :value="String(tag.id)"
              >
                {{ tag.name }}
              </option>
            </select>
          </div>

          <div class="chat-widget__recipient-heading">
            <div class="chat-widget__field-label chat-widget__field-label--inline">
              <Icon name="i-ph-users-three-duotone" class="h-3.5 w-3.5" />
              <span>{{ $t("navigation.chatWidget.sendToLabel") }}</span>
            </div>
            <label class="chat-widget__select-all">
              <input
                type="checkbox"
                :checked="allVisibleSendRecipientsSelected"
                class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                :disabled="sendCandidates.length === 0"
                @change="toggleAllVisibleSendRecipients"
              >
              <span>{{ $t("navigation.chatWidget.selectAll") }}</span>
            </label>
          </div>

          <div class="chat-widget__field">
            <UInput
              v-model="sendTo"
              :placeholder="$t('navigation.chatWidget.recipientPlaceholder')"
              icon="i-ph-magnifying-glass-duotone"
              :ui="{
                base: 'rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)] px-3 py-2 text-sm shadow-none',
              }"
            />
          </div>

          <div class="chat-widget__recipient-box" :class="{ 'chat-widget__recipient-box--empty': selectedSendRecipients.length === 0 }">
            <div v-if="selectedSendRecipients.length > 0" class="chat-widget__recipient-chips">
              <div
                v-for="recipient in selectedSendRecipients"
                :key="recipient.id"
                class="chat-widget__recipient-chip"
              >
                <UAvatar
                  :src="recipient.avatarUrl"
                  :alt="recipient.name"
                  size="xs"
                  class="rounded-full"
                />
                <span>{{ recipient.name }}</span>
                <button
                  class="chat-widget__recipient-remove"
                  type="button"
                  :title="$t('navigation.chatWidget.clearSelectedRecipient')"
                  @click="toggleSendRecipient(recipient)"
                >
                  <Icon name="i-ph-x-bold" class="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
            <span v-else class="chat-widget__recipient-empty">{{ $t("navigation.chatWidget.noRecipientSelected") }}</span>
          </div>

          <div v-if="showSendCandidates" class="chat-widget__suggestions">
            <button
              v-for="candidate in sendCandidates"
              :key="candidate.id"
              type="button"
              class="chat-widget__suggestion"
              :class="{ 'chat-widget__suggestion--selected': selectedSendRecipientIds.includes(candidate.userId ?? 0) }"
              @click="toggleSendRecipient(candidate)"
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
          <p v-else-if="sendCandidates.length === 0" class="chat-widget__hint">
            {{ $t("navigation.chatWidget.noMatchingRecipients") }}
          </p>
        </div>

        <div class="chat-widget__send-card">
          <div class="chat-widget__field">
            <label class="chat-widget__field-label">{{ $t("navigation.chatWidget.content") }}</label>
            <UTextarea
              v-model="sendMessage"
              autoresize
              :rows="4"
              :placeholder="$t('navigation.chatWidget.messagePlaceholder')"
              :ui="{
                base: 'chat-widget__textarea rounded-[14px] border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-3 text-sm shadow-none',
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
            <button
              type="button"
              class="chat-widget__attach-btn"
              @click="fileInput?.click()"
            >
              <Icon name="i-ph-paperclip-duotone" class="h-4 w-4" />
              <span>{{ $t("navigation.chatWidget.chooseFile") }}</span>
            </button>
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
        </div>
      </div>

      <div class="chat-widget__send-actions">
        <UButton
          type="button"
          variant="solid"
          icon="i-ph-paper-plane-right-fill"
          class="chat-widget__send-btn btn-primary"
          :loading="isSendingQuick"
          :disabled="!canSendQuickMessage"
          @click="sendQuickMessage"
        >
          {{ $t("navigation.chatWidget.sendMessage") }}
        </UButton>
      </div>
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
        <div v-if="activeTab !== 'send'" class="chat-widget__footer">
          <UInput
            v-model="search"
            :placeholder="$t('navigation.chatWidget.searchPlaceholder')"
            icon="i-ph-magnifying-glass-duotone"
            class="chat-widget__footer-input"
            :ui="{
              base: 'chat-widget__footer-input-control',
            }"
          />
        </div>

        <div
          v-for="contact in activeTab === 'contacts' ? filteredContacts : filteredGroups"
          :key="contact.id"
          class="chat-widget__contact-wrapper"
        >
          <button
            class="chat-widget__contact"
            type="button"
            @click="openMiniChat(contact)"
          >
            <div class="chat-widget__contact-avatar-wrap">
              <button
                v-if="contact.type === 'user'"
                type="button"
                class="chat-widget__contact-avatar-btn"
                @click.stop="openAvatarMenu(contact, $event)"
              >
                <UAvatar
                  :src="contact.avatarUrl"
                  :alt="contact.name"
                  size="md"
                  class="h-10 w-10 rounded-full"
                />
                <div
                  class="chat-widget__contact-status"
                  :class="{ 'chat-widget__contact-status--online': contact.isOnline }"
                />
              </button>
              <div v-else class="chat-widget__group-icon chat-widget__group-icon--large">
                <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
              </div>
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

        <!-- Avatar context menu (Teleport to body to avoid overflow clipping) -->
        <Teleport to="body">
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-1"
          >
            <div
              v-if="avatarMenuContact"
              class="chat-widget__avatar-menu"
              :style="avatarMenuStyle"
            >
              <div class="chat-widget__avatar-menu-header">
                <UAvatar
                  :src="avatarMenuContact.avatarUrl"
                  :alt="avatarMenuContact.name"
                  size="lg"
                  class="rounded-full"
                />
                <div class="chat-widget__avatar-menu-info">
                  <span class="chat-widget__avatar-menu-name">{{ avatarMenuContact.name }}</span>
                  <span
                    class="chat-widget__avatar-menu-status"
                    :class="{ 'chat-widget__avatar-menu-status--online': avatarMenuContact.isOnline }"
                  >
                    <span class="chat-widget__avatar-menu-dot" />
                    {{ buildPresenceLabel(avatarMenuContact) }}
                  </span>
                </div>
              </div>
              <div class="chat-widget__avatar-menu-divider" />
              <button
                v-if="avatarMenuContact.profileUrl"
                type="button"
                class="chat-widget__avatar-menu-item"
                @click="goToAvatarProfile"
              >
                <span class="chat-widget__avatar-menu-icon">
                  <Icon name="i-ph-user-circle-duotone" class="h-5 w-5" />
                </span>
                <span>{{ $t('navigation.chatWidget.viewProfile') }}</span>
              </button>
              <button
                type="button"
                class="chat-widget__avatar-menu-item"
                @click="chatWithAvatarContact"
              >
                <span class="chat-widget__avatar-menu-icon">
                  <Icon name="i-ph-chat-teardrop-dots-duotone" class="h-5 w-5" />
                </span>
                <span>{{ $t('navigation.chatWidget.actionOpenMessages') }}</span>
              </button>
              <button
                type="button"
                class="chat-widget__avatar-menu-item"
                @click="callAvatarContact('audio')"
              >
                <span class="chat-widget__avatar-menu-icon">
                  <Icon name="i-ph-phone-duotone" class="h-5 w-5" />
                </span>
                <span>{{ $t('navigation.chatWidget.audioCall') }}</span>
              </button>
              <button
                type="button"
                class="chat-widget__avatar-menu-item"
                @click="callAvatarContact('video')"
              >
                <span class="chat-widget__avatar-menu-icon">
                  <Icon name="i-ph-video-camera-duotone" class="h-5 w-5" />
                </span>
                <span>{{ $t('navigation.chatWidget.videoCall') }}</span>
              </button>
              <div class="chat-widget__avatar-menu-divider" />
              <button
                type="button"
                class="chat-widget__avatar-menu-item chat-widget__avatar-menu-item--danger"
                @click="closeAvatarMenu"
              >
                <span class="chat-widget__avatar-menu-icon">
                  <Icon name="i-ph-user-minus-duotone" class="h-5 w-5" />
                </span>
                <span>{{ $t('navigation.chatWidget.blockUser') }}</span>
              </button>
            </div>
          </Transition>
        </Teleport>
      </div>
      
      <div v-if="miniChatOpen && activeMiniContact && !miniChatMinimized" class="chat-widget__mini">
        <div class="chat-widget__mini-header">
          <div class="chat-widget__mini-identity">
            <NuxtLink
              v-if="activeMiniContact.type === 'user'"
              :to="activeMiniContact.profileUrl || '#'"
              class="chat-widget__mini-avatar-link"
              :title="$t('navigation.chatWidget.viewProfile')"
              @click="showMiniHeaderMenu = false"
            >
              <UChip
                :show="Boolean(activeMiniContact.isOnline)"
                position="bottom-right"
                color="success"
                inset
                :ui="{ base: '!bg-emerald-500' }"
              >
                <UAvatar
                  :src="activeMiniContact.avatarUrl"
                  :alt="activeMiniContact.name"
                  size="sm"
                  class="rounded-full"
                />
              </UChip>
            </NuxtLink>
            <div v-else class="chat-widget__group-icon chat-widget__group-icon--selected">
              <Icon name="i-ph-users-three-fill" class="h-4 w-4" />
            </div>
            <button
              type="button"
              class="chat-widget__mini-name-btn"
              @click="toggleMiniHeaderMenu"
            >
              <span class="chat-widget__mini-title">{{ activeMiniContact.name }}</span>
              <span class="chat-widget__mini-status">{{ buildPresenceLabel(activeMiniContact) }}</span>
            </button>
          </div>

          <div class="chat-widget__mini-header-actions">
            <button
              class="chat-widget__header-btn"
              type="button"
              :title="activeMiniContact.type === 'group' ? $t('pages.messagesPage.groupAudioCall') : $t('pages.messagesPage.callLogAudio')"
              :disabled="isCallActionPending"
              @click="startMiniCall('audio')"
            >
              <Icon name="i-ph-phone-duotone" class="h-3.5 w-3.5" />
            </button>
            <button
              class="chat-widget__header-btn"
              type="button"
              :title="activeMiniContact.type === 'group' ? $t('pages.messagesPage.groupVideoCall') : $t('pages.messagesPage.callLogVideo')"
              :disabled="isCallActionPending"
              @click="startMiniCall('video')"
            >
              <Icon name="i-ph-video-camera-duotone" class="h-3.5 w-3.5" />
            </button>
            <button
              class="chat-widget__header-btn"
              type="button"
              :title="$t('navigation.chatWidget.minimizeChat')"
              @click="miniChatMinimized = true"
            >
              <Icon name="i-ph-minus-bold" class="h-3.5 w-3.5" />
            </button>
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

        <div v-if="showMiniHeaderMenu" class="chat-widget__mini-menu">
          <div class="chat-widget__mini-menu-section">
            <div class="chat-widget__mini-menu-item chat-widget__mini-menu-item--muted">
              <Icon name="i-ph-lock-key-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.endToEndEncrypted") }}</span>
            </div>
            <button
              type="button"
              class="chat-widget__mini-menu-item"
              @click="openFullMessagesFromMiniMenu"
            >
              <Icon name="i-ph-chat-circle-dots-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.openInMessenger") }}</span>
            </button>
            <button
              v-if="activeMiniContact.profileUrl"
              type="button"
              class="chat-widget__mini-menu-item"
              @click="openMiniProfile"
            >
              <Icon name="i-ph-user-circle-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.viewProfile") }}</span>
            </button>
          </div>

          <div class="chat-widget__mini-menu-section">
            <button type="button" class="chat-widget__mini-menu-item" @click="startMiniCallFromMenu('audio')">
              <Icon name="i-ph-phone-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.audioCall") }}</span>
            </button>
            <button type="button" class="chat-widget__mini-menu-item" @click="startMiniCallFromMenu('video')">
              <Icon name="i-ph-video-camera-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.videoCall") }}</span>
            </button>
          </div>

          <div class="chat-widget__mini-menu-section">
            <button type="button" class="chat-widget__mini-menu-item" @click="closeMiniHeaderMenu">
              <Icon name="i-ph-palette-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.changeTheme") }}</span>
            </button>
            <button type="button" class="chat-widget__mini-menu-item" @click="closeMiniHeaderMenu">
              <Icon name="i-ph-thumbs-up-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.changeReaction") }}</span>
            </button>
            <button type="button" class="chat-widget__mini-menu-item" @click="closeMiniHeaderMenu">
              <Icon name="i-ph-pencil-simple-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.nickname") }}</span>
            </button>
          </div>

          <div class="chat-widget__mini-menu-section">
            <button type="button" class="chat-widget__mini-menu-item" @click="openMessagesTabFromMiniMenu('multi')">
              <Icon name="i-ph-users-three-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.createGroup") }}</span>
            </button>
            <button type="button" class="chat-widget__mini-menu-item" @click="closeMiniHeaderMenu">
              <Icon name="i-ph-bell-slash-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.muteNotifications") }}</span>
            </button>
            <button type="button" class="chat-widget__mini-menu-item chat-widget__mini-menu-item--danger" @click="closeMiniHeaderMenu">
              <Icon name="i-ph-user-minus-duotone" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.blockUser") }}</span>
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

          <div v-else class="chat-widget__mini-thread">
            <div
              v-for="message in miniMessages"
              :key="message.id"
              class="chat-widget__mini-message"
              :class="{ 'chat-widget__mini-message--mine': message.isMine }"
            >
              <div
                v-if="!message.isDeleted && getMiniReplyMeta(message)"
                class="chat-widget__mini-message-reply"
                :class="{ 'chat-widget__mini-message-reply--mine': message.isMine }"
              >
                <div class="chat-widget__mini-message-reply-title">
                  <Icon name="i-ph-arrow-bend-up-left-fill" class="h-3.5 w-3.5" />
                  <span>{{ getMiniReplyTitle(message) }}</span>
                </div>
                <div class="chat-widget__mini-message-reply-quote">
                  {{ getMiniReplyMeta(message)?.quote }}
                </div>
              </div>
              <div
                class="chat-widget__mini-bubble-frame"
                :class="{ 'chat-widget__mini-bubble-frame--mine': message.isMine }"
                :title="getMiniMessageTimelineTitle(message)"
              >
                <ChatBubble
                  :text="getMiniBubbleText(message)"
                  :is-mine="message.isMine"
                  :is-last="message.isLast"
                  :show-author="activeMiniContact?.type === 'group' && message.showAuthor"
                  :time="message.time"
                  :show-time="message.showTime"
                  :avatar="message.avatar || activeMiniContact?.avatarUrl"
                  :sender-is-online="getMiniMessageSenderOnline(message)"
                  :author-name="message.authorName"
                  :media-url="message.isDeleted ? undefined : message.mediaUrl"
                  :media-name="message.isDeleted ? undefined : message.mediaName"
                  :media-type="message.isDeleted ? undefined : message.mediaType"
                  :call-log="message.isDeleted ? undefined : message.callLog"
                  class="chat-widget__mini-chat-bubble"
                  :class="{ 'chat-widget__mini-chat-bubble--deleted': message.isDeleted }"
                  @retry-call="openFullMessages(activeMiniContact)"
                />
                <span v-if="!message.isDeleted && getMiniMessageReaction(message)" class="chat-widget__mini-reaction">
                  <img
                    :src="getMiniMessageReaction(message)?.src"
                    :alt="$t(getMiniMessageReaction(message)?.labelKey ?? defaultMiniReaction.labelKey)"
                  >
                </span>
                <div v-if="!message.isDeleted" class="chat-widget__mini-message-tools">
                  <button
                    type="button"
                    class="chat-widget__mini-message-tool"
                    :title="$t('navigation.chatWidget.reactToMessage')"
                    @click="toggleMiniReactionPicker(message.id)"
                  >
                    <Icon name="i-ph-smiley-duotone" class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="chat-widget__mini-message-tool"
                    :title="$t('navigation.chatWidget.replyMessage')"
                    @click="replyToMiniMessage(message)"
                  >
                    <Icon name="i-ph-arrow-bend-up-left-bold" class="h-3.5 w-3.5" />
                  </button>
                  <button
                    v-if="message.isMine"
                    type="button"
                    class="chat-widget__mini-message-tool chat-widget__mini-message-tool--danger"
                    :title="$t('navigation.chatWidget.deleteMessage')"
                    @click="deleteMiniMessageAction(message)"
                  >
                    <Icon name="i-ph-trash-duotone" class="h-3.5 w-3.5" />
                  </button>
                </div>
                <div
                  v-if="!message.isDeleted && activeMiniReactionPickerId === message.id"
                  class="chat-widget__mini-reaction-picker"
                  :class="{ 'chat-widget__mini-reaction-picker--mine': message.isMine }"
                >
                  <button
                    v-for="reaction in miniReactionOptions"
                    :key="reaction.value"
                    type="button"
                    class="chat-widget__mini-reaction-option"
                    :title="$t(reaction.labelKey)"
                    @click="setMiniReaction(message.id, reaction)"
                  >
                    <img :src="reaction.src" :alt="$t(reaction.labelKey)">
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="miniReplyTarget || miniAttachFile || activeMiniRecordDraft || isMiniRecording" class="chat-widget__mini-draft">
          <div v-if="miniReplyTarget" class="chat-widget__mini-reply-preview">
            <div class="chat-widget__mini-reply-copy">
              <strong>{{ miniReplyTitle }}</strong>
              <span>{{ miniReplyPreviewText }}</span>
            </div>
            <button type="button" class="chat-widget__mini-preview-clear" @click="miniReplyTarget = null">
              <Icon name="i-ph-x-bold" class="h-3 w-3" />
            </button>
          </div>
          <div v-if="miniAttachFile" class="chat-widget__mini-file-preview">
            <Icon name="i-ph-paperclip-duotone" class="h-3.5 w-3.5" />
            <span>{{ miniAttachFile.name }}</span>
            <button type="button" @click="clearMiniFile">
              <Icon name="i-ph-x-bold" class="h-3 w-3" />
            </button>
          </div>
          <div v-if="activeMiniRecordDraft || isMiniRecording" class="chat-widget__mini-file-preview">
            <Icon name="i-ph-microphone-duotone" class="h-3.5 w-3.5" />
            <span>{{ isMiniRecording ? $t("pages.messagesPage.recordingInProgress") : $t("pages.messagesPage.recordReady") }}</span>
            <button type="button" @click="discardMiniRecording">
              <Icon name="i-ph-x-bold" class="h-3 w-3" />
            </button>
          </div>
        </div>

        <div class="chat-widget__mini-input-wrap">
          <input ref="miniImageInput" type="file" accept="image/*" class="hidden" @change="handleMiniFileChange">
          <input ref="miniFileInput" type="file" class="hidden" @change="handleMiniFileChange">
          <button type="button" class="chat-widget__mini-tool-btn" :title="$t('pages.messagesPage.attachmentLabel')" @click="miniImageInput?.click()">
            <Icon name="i-ph-image-duotone" class="h-4 w-4" />
          </button>
          <button type="button" class="chat-widget__mini-tool-btn" :title="$t('navigation.chatWidget.chooseFile')" @click="miniFileInput?.click()">
            <Icon name="i-ph-paperclip-duotone" class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="chat-widget__mini-tool-btn"
            :class="{ 'chat-widget__mini-tool-btn--active': isMiniRecording }"
            :title="$t('pages.messagesPage.startRecording')"
            :disabled="!isMiniRecordSupported"
            @click="handleMiniRecordButton"
          >
            <Icon :name="isMiniRecording ? 'i-ph-stop-circle-duotone' : 'i-ph-microphone-duotone'" class="h-4 w-4" />
          </button>
          <UInput
            v-model="miniChatMessage"
            :placeholder="$t('navigation.chatWidget.miniInputPlaceholder')"
            class="chat-widget__mini-input"
            :ui="{
              base: 'chat-widget__mini-input-control',
            }"
            @keydown.enter.exact.prevent="submitMiniMessage"
          />
          <UButton
            type="button"
            variant="solid"
            icon="i-ph-paper-plane-right-fill"
            class="chat-widget__mini-send-btn btn-primary"
            :loading="isSendingMini"
            :disabled="!canSubmitMiniMessage"
            @click="submitMiniMessage"
          />
        </div>
      </div>
    </div>
    

    <button
      v-if="miniChatOpen && activeMiniContact && miniChatMinimized"
      type="button"
      class="chat-widget__mini-launcher"
      :title="activeMiniContact.name"
      @click="miniChatMinimized = false"
    >
      <UChip
        :show="miniChatHasNewMessage"
        position="top-right"
        color="success"
        inset
        :ui="{ base: '!bg-emerald-500' }"
      >
        <UAvatar
          v-if="activeMiniContact.type === 'user'"
          :src="activeMiniContact.avatarUrl"
          :alt="activeMiniContact.name"
          size="lg"
          class="rounded-full"
        />
        <div v-else class="chat-widget__mini-launcher-group">
          <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
        </div>
      </UChip>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { defaultFeedReactionAsset, feedReactionAssetByValue, feedReactionAssets, type FeedReactionAsset } from "../../../feed/application/constants/reaction-assets"
import { useMessageCalls } from "../../../messages/application/composables/useMessageCalls"
import { useMessageRecorder } from "../../../messages/application/composables/useMessageRecorder"
import ChatBubble from "../../../messages/presentation/components/ChatBubble.vue"
import type { MessageCallType } from "../../../messages/domain/types/calls.types"
import type { MessageItem } from "../../../messages/domain/types/messages.types"
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
const { t } = useI18n()
const miniImageInput = ref<HTMLInputElement | null>(null)
const miniFileInput = ref<HTMLInputElement | null>(null)
const miniMessagesViewport = ref<HTMLElement | null>(null)
const miniChatMinimized = ref(false)
const showMiniHeaderMenu = ref(false)
const miniReactionOptions = feedReactionAssets
const defaultMiniReaction = defaultFeedReactionAsset

// Avatar context menu
type AvatarMenuContact = (typeof filteredContacts)['value'][number]
const avatarMenuContact = ref<AvatarMenuContact | null>(null)
const avatarMenuStyle = ref<Record<string, string>>({})
const activeMiniReactionPickerId = ref<number | null>(null)
const miniMessageReactions = ref<Record<number, FeedReactionAsset | undefined>>({})
const miniReplyTarget = ref<MessageItem | null>(null)
const MINI_REPLY_PREFIX = "__VNSEEA_MINI_REPLY__:"
const {
  isCallActionPending,
  startCall,
  startGroupCall,
} = useMessageCalls()
const {
  isSupported: isMiniRecordSupported,
  isRecording: isMiniRecording,
  recordDraft: miniRecordDraft,
  startRecording: startMiniRecording,
  stopRecording: stopMiniRecording,
  clearRecording: clearMiniRecording,
} = useMessageRecorder()
const {
  activeTab,
  search,
  activeSendTagFilter,
  sendTo,
  sendMessage,
  attachFile,
  allVisibleSendRecipientsSelected,
  sendCandidates,
  selectedSendRecipientIds,
  selectedSendRecipients,
  filteredContacts,
  filteredGroups,
  onlineCount,
  miniChatOpen,
  miniChatAutoOpenVersion,
  miniChatMessage,
  miniAttachFile,
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
  messageTagLabels,
  toggleAllVisibleSendRecipients,
  toggleSendRecipient,
  openMiniChat: openMiniChatVm,
  closeMiniChat: closeMiniChatVm,
  sendQuickMessage,
  sendMiniMessage,
  reactToMiniMessage,
  deleteMiniMessage,
  onMiniFile,
  clearMiniFile,
  onFile,
  clearFile,
  openFullMessages,
  openMessagesTab,
} = useChatWidgetVM()

const showSendCandidates = computed(() => {
  return sendCandidates.value.length > 0
})

const miniChatHasNewMessage = computed(() =>
  Boolean(activeMiniContact.value?.unreadCount && activeMiniContact.value.unreadCount > 0),
)
const activeMiniRecordDraft = computed(() => miniRecordDraft.value)
const miniReplyAuthor = computed(() => {
  if (!miniReplyTarget.value) {
    return ""
  }

  if (miniReplyTarget.value.isMine) {
    return t("pages.messagesPage.you")
  }

  return miniReplyTarget.value.authorName || activeMiniContact.value?.name || ""
})
const miniReplyTitle = computed(() =>
  miniReplyAuthor.value
    ? t("navigation.chatWidget.replyingTo", { name: miniReplyAuthor.value })
    : t("navigation.chatWidget.replyingToMessage"),
)
const miniReplyPreviewText = computed(() =>
  miniReplyTarget.value
    ? getMiniBubbleText(miniReplyTarget.value) || miniReplyTarget.value.mediaName || t("navigation.chatWidget.replyingToMessage")
    : t("navigation.chatWidget.replyingToMessage"),
)
const canSubmitMiniMessage = computed(() =>
  !isMiniRecording.value
  && (
    canSendMiniMessage.value
    || Boolean(activeMiniRecordDraft.value)
    || Boolean(miniReplyTarget.value && miniChatMessage.value.trim())
  ),
)

async function openMiniChat(contact: Parameters<typeof openMiniChatVm>[0]) {
  miniChatMinimized.value = false
  showMiniHeaderMenu.value = false
  miniReplyTarget.value = null
  activeMiniReactionPickerId.value = null
  clearMiniRecording()
  await openMiniChatVm(contact)
}

function closeMiniChat() {
  miniChatMinimized.value = false
  showMiniHeaderMenu.value = false
  miniReplyTarget.value = null
  activeMiniReactionPickerId.value = null
  clearMiniRecording()
  closeMiniChatVm()
}

function toggleMiniHeaderMenu() {
  showMiniHeaderMenu.value = !showMiniHeaderMenu.value
}

function closeMiniHeaderMenu() {
  showMiniHeaderMenu.value = false
}

function openAvatarMenu(contact: AvatarMenuContact, event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const menuWidth = 224
  const menuHeight = 280
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = rect.right + 10
  let top = rect.top

  if (left + menuWidth > vw - 8) {
    left = rect.left - menuWidth - 10
  }
  if (top + menuHeight > vh - 8) {
    top = Math.max(8, vh - menuHeight - 8)
  }

  avatarMenuStyle.value = {
    position: 'fixed',
    left: `${Math.max(8, left)}px`,
    top: `${Math.max(8, top)}px`,
    zIndex: '9999',
  }
  avatarMenuContact.value = contact
}

function closeAvatarMenu() {
  avatarMenuContact.value = null
}

async function goToAvatarProfile() {
  const profileUrl = avatarMenuContact.value?.profileUrl
  closeAvatarMenu()
  if (profileUrl) {
    await navigateTo(profileUrl)
  }
}

async function chatWithAvatarContact() {
  const contact = avatarMenuContact.value
  closeAvatarMenu()
  if (contact) {
    await openMiniChat(contact)
  }
}

async function callAvatarContact(type: 'audio' | 'video') {
  const contact = avatarMenuContact.value
  closeAvatarMenu()
  if (!contact) return
  if (contact.type === 'group') {
    await startGroupCall(contact, type)
  }
  else if (contact.type === 'user') {
    await startCall(contact, type)
  }
}

async function openMiniProfile() {
  const profileUrl = activeMiniContact.value?.profileUrl
  closeMiniHeaderMenu()

  if (profileUrl) {
    await navigateTo(profileUrl)
  }
}

async function openFullMessagesFromMiniMenu() {
  const contact = activeMiniContact.value
  closeMiniHeaderMenu()
  await openFullMessages(contact)
}

async function openMessagesTabFromMiniMenu(tab: "user" | "group" | "multi") {
  closeMiniHeaderMenu()
  await openMessagesTab(tab)
}

async function startMiniCall(type: MessageCallType) {
  const contact = activeMiniContact.value

  if (!contact) {
    return
  }

  if (contact.type === "group") {
    await startGroupCall(contact, type)
    return
  }

  if (contact.type === "user") {
    await startCall(contact, type)
  }
}

function getMiniMessageSenderOnline(message: { isMine: boolean, senderIsOnline?: boolean }) {
  if (message.isMine) {
    return false
  }

  return message.senderIsOnline ?? activeMiniContact.value?.isOnline ?? false
}

function toggleMiniReactionPicker(messageId: number) {
  activeMiniReactionPickerId.value = activeMiniReactionPickerId.value === messageId
    ? null
    : messageId
}

function getMiniMessageReaction(message: MessageItem) {
  return miniMessageReactions.value[message.id]
    ?? (message.selectedReaction ? feedReactionAssetByValue[message.selectedReaction] : undefined)
}

async function setMiniReaction(messageId: number, reaction: FeedReactionAsset) {
  const previousReaction = miniMessageReactions.value[messageId]
  miniMessageReactions.value = {
    ...miniMessageReactions.value,
    [messageId]: reaction,
  }
  activeMiniReactionPickerId.value = null

  try {
    const result = await reactToMiniMessage(messageId, reaction.value)
    miniMessageReactions.value = {
      ...miniMessageReactions.value,
      [messageId]: feedReactionAssetByValue[result?.reaction ?? reaction.value],
    }
  }
  catch {
    miniMessageReactions.value = {
      ...miniMessageReactions.value,
      [messageId]: previousReaction,
    }
  }
}

async function deleteMiniMessageAction(message: MessageItem) {
  if (!message.isMine || message.isDeleted) {
    return
  }

  const previousReaction = miniMessageReactions.value[message.id]
  activeMiniReactionPickerId.value = null
  miniMessageReactions.value = {
    ...miniMessageReactions.value,
    [message.id]: undefined,
  }

  try {
    await deleteMiniMessage(message.id)
    if (miniReplyTarget.value?.id === message.id) {
      miniReplyTarget.value = null
    }
  }
  catch {
    miniMessageReactions.value = {
      ...miniMessageReactions.value,
      [message.id]: previousReaction,
    }
  }
}

async function startMiniCallFromMenu(type: MessageCallType) {
  closeMiniHeaderMenu()
  await startMiniCall(type)
}

function replyToMiniMessage(message: MessageItem) {
  if (message.isDeleted) {
    return
  }

  miniReplyTarget.value = message
  activeMiniReactionPickerId.value = null
}

function buildMiniReplyText(text: string) {
  if (!miniReplyTarget.value) {
    return normalizeMiniMessageText(text)
  }

  const source = normalizeMiniMessageText(getMiniBubbleText(miniReplyTarget.value) || miniReplyTarget.value.mediaName || "Tin nhan")
  const snippet = source.length > 72 ? `${source.slice(0, 72)}...` : source
  const author = miniReplyAuthor.value || "Tin nhan"
  const payload = encodeURIComponent(JSON.stringify({
    author,
    quote: snippet,
  }))

  return `${MINI_REPLY_PREFIX}${payload}\n${normalizeMiniMessageText(text)}`
}

function getMiniReplyMeta(message: MessageItem) {
  const normalizedText = normalizeMiniMessageText(message.text)
  const [replyLine, ...bodyLines] = normalizedText.split("\n")

  if (replyLine?.startsWith(MINI_REPLY_PREFIX)) {
    try {
      const payload = JSON.parse(decodeURIComponent(replyLine.slice(MINI_REPLY_PREFIX.length))) as {
        author?: string
        quote?: string
      }

      return {
        author: normalizeMiniMessageText(payload.author || ""),
        quote: normalizeMiniMessageText(payload.quote || ""),
        body: normalizeMiniMessageText(bodyLines.join("\n")),
      }
    }
    catch {
      return null
    }
  }

  if (!replyLine?.startsWith("\u21AA ")) {
    return null
  }

  const rawReply = replyLine.slice(2).trim()
  const separatorIndex = rawReply.indexOf(": ")
  const author = separatorIndex > 0 ? rawReply.slice(0, separatorIndex) : ""
  const quote = separatorIndex > 0 ? rawReply.slice(separatorIndex + 2) : rawReply

  return {
    author: normalizeMiniMessageText(author),
    quote: normalizeMiniMessageText(quote),
    body: normalizeMiniMessageText(bodyLines.join("\n")),
  }
}

function getMiniBubbleText(message: MessageItem) {
  if (message.isDeleted) {
    if (message.isMine) {
      return t("navigation.chatWidget.youDeletedMessage")
    }

    return t("navigation.chatWidget.userDeletedMessage", {
      name: message.deletedByName || message.authorName || activeMiniContact.value?.name || "",
    })
  }

  const replyMeta = getMiniReplyMeta(message)

  if (replyMeta) {
    return replyMeta.body
  }

  return normalizeMiniMessageText(message.text)
}

function getMiniMessageTimelineTitle(message: MessageItem) {
  const sentTime = message.time || (message.timestamp ? formatMiniMessageClock(message.timestamp) : "")
  const deletedTime = message.deletedTime || (message.deletedAt ? formatMiniMessageClock(message.deletedAt) : "")
  const lines = []

  if (sentTime) {
    lines.push(t("navigation.chatWidget.messageSentAt", { time: sentTime }))
  }

  if (message.isDeleted && deletedTime) {
    lines.push(t("navigation.chatWidget.messageDeletedAt", { time: deletedTime }))
  }

  return lines.join("\n")
}

function formatMiniMessageClock(seconds: number) {
  return new Date(seconds * 1000).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getMiniReplyTitle(message: MessageItem) {
  const meta = getMiniReplyMeta(message)
  const author = meta?.author || activeMiniContact.value?.name || ""

  if (message.isMine) {
    return author
      ? t("navigation.chatWidget.youRepliedTo", { name: author })
      : t("navigation.chatWidget.youReplied")
  }

  return author
    ? t("navigation.chatWidget.userRepliedTo", { name: author })
    : t("navigation.chatWidget.userReplied")
}

function normalizeMiniMessageText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function submitMiniMessage() {
  const text = buildMiniReplyText(miniChatMessage.value.trim())
  await sendMiniMessage({
    textOverride: text,
    record: activeMiniRecordDraft.value,
  })
  miniReplyTarget.value = null
  clearMiniRecording()
}

async function sendMiniLike() {
  await sendMiniMessage({ textOverride: "\u{1F44D}" })
}

function handleMiniFileChange(event: Event) {
  if (miniRecordDraft.value || isMiniRecording.value) {
    clearMiniRecording()
  }

  onMiniFile(event)
}

async function handleMiniRecordButton() {
  if (isMiniRecording.value) {
    await stopMiniRecording()
    return
  }

  clearMiniFile()
  await startMiniRecording()
}

function discardMiniRecording() {
  clearMiniRecording()
}

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

watch(miniChatAutoOpenVersion, (version) => {
  if (version > 0) {
    miniChatMinimized.value = false
    showMiniHeaderMenu.value = false
  }
})
</script>

<style scoped>
.chat-widget {
  position: relative;
  display: flex;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  width: 100%;
  flex-direction: column;
  overflow: visible;
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

.chat-widget__mini-header-actions {
  flex-shrink: 0;
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

.chat-widget__header-btn:disabled {
  cursor: default;
  opacity: 0.55;
}

.chat-widget__mini-header-actions .chat-widget__header-btn {
  width: 30px;
  height: 30px;
  border-radius: 9px;
}

.chat-widget__tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
  background: #ffffff;
}

.chat-widget__tab {
  flex: 1;
  min-width: 0;
  min-height: 36px;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.chat-widget__tab--active {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.chat-widget__content {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
}

.chat-widget__content--send {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  background: #f8fafc;
}

.chat-widget__send-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 12px;
  scrollbar-width: thin;
}

.chat-widget__send-scroll::-webkit-scrollbar,
.chat-widget__content::-webkit-scrollbar {
  width: 6px;
}

.chat-widget__send-scroll::-webkit-scrollbar-thumb,
.chat-widget__content::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #cbd5e1;
}

.chat-widget__send-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.chat-widget__send-card + .chat-widget__send-card {
  margin-top: 12px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.chat-widget__field-label--inline {
  margin-bottom: 0;
}

.chat-widget__recipient-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.chat-widget__select-all {
  display: inline-flex;
  flex-shrink: 0;
  cursor: pointer;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 11px;
  font-weight: 650;
}

.chat-widget__select-all:has(input:disabled) {
  cursor: default;
  opacity: 0.45;
}

.chat-widget__recipient-box {
  min-height: 44px;
  margin-top: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 7px;
}

.chat-widget__recipient-box--empty {
  display: flex;
  align-items: center;
  border-style: dashed;
  background: #fafbfe;
  padding: 10px 12px;
}

.chat-widget__recipient-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chat-widget__recipient-chip {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(0, 0, 255, 0.08);
  border-radius: 999px;
  background: rgba(0, 0, 255, 0.04);
  padding: 3px 4px 3px 3px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.chat-widget__recipient-chip span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__recipient-remove {
  display: inline-flex;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: #64748b;
  transition: all 0.15s ease;
}

.chat-widget__recipient-remove:hover {
  background: #fee2e2;
  color: #dc2626;
}

.chat-widget__recipient-empty {
  color: #94a3b8;
  font-size: 12px;
}

.chat-widget__select {
  width: 100%;
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fafbfe;
  padding: 0 12px;
  color: #0f172a;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.chat-widget__select:focus {
  border-color: rgba(0, 0, 255, 0.25);
  background: #ffffff;
}

.chat-widget__selected-target {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 255, 0.08);
  background: rgba(0, 0, 255, 0.04);
  padding: 9px 10px;
}

.chat-widget__selected-target-main {
  flex: 1;
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
  max-height: 218px;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  overflow-y: auto;
  padding-right: 2px;
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

.chat-widget__suggestion--selected {
  border-color: rgba(0, 0, 255, 0.18);
  background: rgba(0, 0, 255, 0.05);
}

.chat-widget__composer-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.chat-widget__attach-btn {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 7px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8fafc;
  padding: 7px 12px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s ease;
}

.chat-widget__attach-btn:hover {
  border-color: rgba(0, 0, 255, 0.14);
  background: rgba(0, 0, 255, 0.04);
  color: #0000ff;
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
  border-radius: 12px;
  padding-block: 11px;
}

.chat-widget__send-actions {
  flex-shrink: 0;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 10px 12px 12px;
}

:deep(.chat-widget__textarea) {
  max-height: 132px;
  overflow-y: auto !important;
  resize: none;
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

.chat-widget__group-icon--selected {
  width: 32px;
  height: 32px;
  border-radius: 12px;
}

.chat-widget__group-icon--chip {
  width: 24px;
  height: 24px;
  border-radius: 999px;
}

.chat-widget__footer {
  position: sticky;
  top: 0;
  z-index: 6;
  flex-shrink: 0;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  padding: 10px 12px;
}

.chat-widget__footer-input {
  width: 100%;
}

:deep(.chat-widget__footer-input-control) {
  width: 100%;
  height: 42px;
  border: 1px solid #dbe3f2 !important;
  border-radius: 14px !important;
  background: #f8fafc !important;
  color: #0f172a;
  font-size: 14px;
  box-shadow: none !important;
}

:deep(.chat-widget__footer-input-control:focus) {
  border-color: rgba(0, 0, 255, 0.26) !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.06) !important;
}

:deep(.chat-widget__footer-input-control::placeholder) {
  color: #94a3b8;
}

.chat-widget__mini {
  position: absolute;
  right: calc(100% + 12px);
  bottom: 0;
  z-index: 50;
  display: flex;
  width: min(350px, calc(100vw - 32px));
  max-height: min(560px, calc(100dvh - 112px));
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 255, 0.08);
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
}

.chat-widget__mini-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfe;
}

.chat-widget__mini-identity {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.chat-widget__mini-avatar-link {
  display: inline-flex;
  flex-shrink: 0;
  border-radius: 999px;
}

.chat-widget__mini-name-btn {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.chat-widget__mini-title {
  display: block;
  max-width: 100%;
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-status {
  display: block;
  max-width: 100%;
  margin-top: 2px;
  overflow: hidden;
  font-size: 11px;
  color: #64748b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-menu {
  position: absolute;
  top: 58px;
  left: 14px;
  z-index: 80;
  width: min(310px, calc(100% - 28px));
  max-height: min(430px, calc(100dvh - 190px));
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  padding: 8px 0;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.2);
}

.chat-widget__mini-menu::before {
  position: absolute;
  top: -7px;
  left: 18px;
  width: 14px;
  height: 14px;
  border-top: 1px solid rgba(226, 232, 240, 0.95);
  border-left: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  content: "";
  transform: rotate(45deg);
}

.chat-widget__mini-menu-section {
  position: relative;
  display: grid;
  gap: 1px;
  padding: 6px 10px;
}

.chat-widget__mini-menu-section + .chat-widget__mini-menu-section {
  border-top: 1px solid #e5e7eb;
}

.chat-widget__mini-menu-item {
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  gap: 11px;
  border: none;
  border-radius: 10px;
  background: transparent;
  padding: 8px 10px;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
}

.chat-widget__mini-menu-item:hover {
  background: #f8fafc;
  color: #0000ff;
}

.chat-widget__mini-menu-item--muted {
  cursor: default;
  color: #334155;
}

.chat-widget__mini-menu-item--muted:hover {
  background: transparent;
  color: #334155;
}

.chat-widget__mini-menu-item--danger {
  color: #dc2626;
}

.chat-widget__mini-menu-item--danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.chat-widget__mini-messages {
  min-height: 0;
  flex: 1;
  max-height: none;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 14px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.55) 0%, rgba(255, 255, 255, 1) 100%);
}

.chat-widget__mini-thread {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-widget__mini-message {
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  padding-inline-end: 38px;
}

.chat-widget__mini-message--mine {
  align-items: flex-end;
  padding-inline: 38px 0;
}

.chat-widget__mini-bubble-frame {
  position: relative;
  display: flex;
  width: fit-content;
  max-width: 86%;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
}

.chat-widget__mini-bubble-frame--mine {
  align-items: flex-end;
}

.chat-widget__mini-bubble-frame .chat-widget__mini-chat-bubble {
  width: auto !important;
  max-width: 100%;
}

.chat-widget__mini-message-tools {
  display: inline-flex;
  position: absolute;
  top: 50%;
  right: -106px;
  z-index: 50;
  align-items: center;
  gap: 3px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  padding: 3px;
  opacity: 0;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  transform: translateY(-50%) scale(0.96);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.chat-widget__mini-message--mine .chat-widget__mini-message-tools {
  right: auto;
  left: -106px;
}

.chat-widget__mini-bubble-frame:hover .chat-widget__mini-message-tools,
.chat-widget__mini-bubble-frame:focus-within .chat-widget__mini-message-tools {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

.chat-widget__mini-message-tool {
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  transition: all 0.15s ease;
}

.chat-widget__mini-message-tool:hover {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.chat-widget__mini-message-tool--danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.chat-widget__mini-reaction-picker {
  position: absolute;
  right: -2px;
  bottom: calc(100% - 6px);
  z-index: 70;
  display: flex;
  align-items: center;
  gap: 2px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 999px;
  background: #ffffff;
  padding: 5px 7px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
}

.chat-widget__mini-reaction-picker--mine {
  right: auto;
  left: -2px;
}

.chat-widget__mini-reaction-option {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  transition: background 0.15s ease, transform 0.15s ease;
}

.chat-widget__mini-reaction-option:hover {
  background: #f8fafc;
  transform: translateY(-2px) scale(1.08);
}

.chat-widget__mini-reaction-option img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.chat-widget__mini-message-reply {
  display: flex;
  max-width: 82%;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  margin: 0 0 4px 42px;
  color: #65676b;
}

.chat-widget__mini-message-reply--mine {
  align-items: flex-end;
  margin-right: 8px;
  margin-left: 0;
}

.chat-widget__mini-message-reply-title {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}

.chat-widget__mini-message-reply-title span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-message-reply-quote {
  max-width: min(220px, 72%);
  overflow: hidden;
  border-radius: 14px;
  background: #f1f0f0;
  padding: 8px 12px;
  color: #65676b;
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-message-reply--mine .chat-widget__mini-message-reply-quote {
  max-width: min(220px, 82%);
}

.chat-widget__mini-reaction {
  display: inline-flex;
  position: absolute;
  right: -8px;
  bottom: -12px;
  z-index: 60;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #ffffff;
  padding: 3px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.14);
}

.chat-widget__mini-reaction img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.chat-widget__mini-message--mine .chat-widget__mini-reaction {
  right: auto;
  left: -8px;
}

.chat-widget__mini-chat-bubble--deleted :deep(.chat-bubble) {
  background: #f1f5f9 !important;
  color: #64748b !important;
  font-style: italic;
}

.chat-widget__mini-chat-bubble--deleted :deep(.chat-bubble__text) {
  color: inherit !important;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__wrapper) {
  max-width: 100%;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble) {
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__call-card) {
  width: min(190px, 72vw);
  border-radius: 14px;
  padding: 10px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__call-head) {
  grid-template-columns: 36px 1fr;
  gap: 8px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__call-icon-btn) {
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  min-height: 34px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  line-height: 1 !important;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__call-icon-btn .iconify) {
  width: 18px !important;
  height: 18px !important;
  flex-shrink: 0;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__call-title) {
  font-size: 13px;
  line-height: 1.12;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__call-subtitle) {
  font-size: 12px;
  padding: 3px 0 0;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__call-again) {
  margin-top: 8px;
  min-height: 34px;
  border-radius: 7px !important;
  font-size: 13px !important;
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
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  padding: 10px 12px 12px;
}

.chat-widget__mini-draft {
  display: grid;
  flex-shrink: 0;
  gap: 6px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  padding: 8px 12px 0;
}

.chat-widget__mini-reply-preview,
.chat-widget__mini-file-preview {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  background: #f8fafc;
  padding: 9px 10px;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.chat-widget__mini-reply-preview {
  min-height: 54px;
  align-items: center;
  justify-content: space-between;
  border-radius: 0;
  background: #ffffff;
  padding: 8px 4px;
  text-align: left;
}

.chat-widget__mini-reply-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.chat-widget__mini-reply-copy strong {
  overflow: hidden;
  color: #111827;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-reply-copy span,
.chat-widget__mini-file-preview span {
  min-width: 0;
  overflow: hidden;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-preview-clear {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #64748b;
}

.chat-widget__mini-preview-clear:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.chat-widget__mini-tool-btn,
.chat-widget__mini-like-btn {
  display: inline-flex;
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  align-items: center;
  justify-content: center;
  border-radius: 999px !important;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.15s ease;
}

.chat-widget__mini-tool-btn:hover,
.chat-widget__mini-like-btn:hover {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.chat-widget__mini-like-btn img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.chat-widget__mini-like-btn:disabled {
  cursor: default;
  opacity: 0.55;
}

.chat-widget__mini-tool-btn--active {
  background: #fee2e2;
  color: #dc2626;
}

.chat-widget__mini-input {
  min-width: 0;
  flex: 1;
}

:deep(.chat-widget__mini-input-control) {
  width: 100%;
  height: 42px;
  border: 1px solid #dbe3f2 !important;
  border-radius: 999px !important;
  background: #f8fafc !important;
  padding: 0 16px !important;
  color: #0f172a;
  font-size: 14px;
  font-weight: 500;
  box-shadow: none !important;
  outline: none;
}

:deep(.chat-widget__mini-input-control:focus) {
  border-color: rgba(0, 0, 255, 0.28) !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.06) !important;
}

:deep(.chat-widget__mini-input-control::placeholder) {
  color: #94a3b8;
  font-weight: 600;
}

.chat-widget__mini-send-btn {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  justify-content: center;
  border-radius: 999px !important;
  box-shadow: 0 8px 18px rgba(0, 42, 255, 0.2);
}

.chat-widget__mini-send-btn :deep(.iconify) {
  width: 19px;
  height: 19px;
}

.chat-widget__mini-launcher {
  position: absolute;
  right: 14px;
  bottom: 72px;
  z-index: 55;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.chat-widget__mini-launcher:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.22);
}

.chat-widget__mini-launcher-group {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(0, 0, 255, 0.08);
  color: #0000ff;
}

/* ── Avatar contact button ── */
.chat-widget__contact-wrapper {
  position: relative;
}

.chat-widget__contact-avatar-btn {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  border-radius: 999px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.chat-widget__contact-avatar-btn:hover {
  transform: scale(1.07);
  box-shadow: 0 0 0 2.5px rgba(0, 0, 255, 0.22);
}

/* ── Avatar context menu ── */
.chat-widget__avatar-menu {
  min-width: 224px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  padding: 6px 0;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18), 0 4px 14px rgba(15, 23, 42, 0.08);
  transform-origin: top left;
}

.chat-widget__avatar-menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 12px;
}

.chat-widget__avatar-menu-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.chat-widget__avatar-menu-name {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-widget__avatar-menu-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.chat-widget__avatar-menu-status--online {
  color: #16a34a;
}

.chat-widget__avatar-menu-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  flex-shrink: 0;
}

.chat-widget__avatar-menu-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
}

.chat-widget__avatar-menu-item {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  gap: 11px;
  border: none;
  background: transparent;
  padding: 8px 14px;
  color: #111827;
  font-size: 13.5px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.chat-widget__avatar-menu-item:hover {
  background: #f1f5f9;
  color: #0000ff;
}

.chat-widget__avatar-menu-item--danger {
  color: #dc2626;
}

.chat-widget__avatar-menu-item--danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.chat-widget__avatar-menu-icon {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1f5f9;
  color: inherit;
  transition: background 0.12s ease;
}
  /* height: 42px;
  border: 1px solid #dbe3f2 !important;
  border-radius: 999px !important;
  background: #f8fafc !important;
  padding: 0 16px !important;
  color: #0f172a;
  font-size: 14px;
  font-weight: 500;
  box-shadow: none !important;
  outline: none;
} */

:deep(.chat-widget__mini-input-control:focus) {
  border-color: rgba(0, 0, 255, 0.28) !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.06) !important;
}

:deep(.chat-widget__mini-input-control::placeholder) {
  color: #94a3b8;
  font-weight: 600;
}

.chat-widget__mini-send-btn {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  justify-content: center;
  border-radius: 999px !important;
  box-shadow: 0 8px 18px rgba(0, 42, 255, 0.2);
}

.chat-widget__mini-send-btn :deep(.iconify) {
  width: 19px;
  height: 19px;
}

.chat-widget__mini-launcher {
  position: absolute;
  right: 14px;
  bottom: 72px;
  z-index: 55;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.chat-widget__mini-launcher:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.22);
}

.chat-widget__mini-launcher-group {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(0, 0, 255, 0.08);
  color: #0000ff;
}

/* ── Avatar contact button ── */
.chat-widget__contact-wrapper {
  position: relative;
}

.chat-widget__contact-avatar-btn {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  border-radius: 999px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.chat-widget__contact-avatar-btn:hover {
  transform: scale(1.07);
  box-shadow: 0 0 0 2.5px rgba(0, 0, 255, 0.22);
}

/* ── Avatar context menu ── */
.chat-widget__avatar-menu {
  min-width: 224px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  padding: 6px 0;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18), 0 4px 14px rgba(15, 23, 42, 0.08);
  transform-origin: top left;
}

.chat-widget__avatar-menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 12px;
}

.chat-widget__avatar-menu-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.chat-widget__avatar-menu-name {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-widget__avatar-menu-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.chat-widget__avatar-menu-status--online {
  color: #16a34a;
}

.chat-widget__avatar-menu-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  flex-shrink: 0;
}

.chat-widget__avatar-menu-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
}

.chat-widget__avatar-menu-item {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  gap: 11px;
  border: none;
  background: transparent;
  padding: 8px 14px;
  color: #111827;
  font-size: 13.5px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.chat-widget__avatar-menu-item:hover {
  background: #f1f5f9;
  color: #0000ff;
}

.chat-widget__avatar-menu-item--danger {
  color: #dc2626;
}

.chat-widget__avatar-menu-item--danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.chat-widget__avatar-menu-icon {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1f5f9;
  color: inherit;
  transition: background 0.12s ease;
}

.chat-widget__avatar-menu-item:hover .chat-widget__avatar-menu-icon {
  background: rgba(0, 0, 255, 0.08);
}

.chat-widget__avatar-menu-item--danger:hover .chat-widget__avatar-menu-icon {
  background: #fee2e2;
}
</style>
