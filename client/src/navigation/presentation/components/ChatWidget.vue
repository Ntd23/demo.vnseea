<!-- English description: Renders the right-sidebar chat widget with real inbox contacts, quick send actions, mini threads, and online presence indicators. -->
<template>
  <div class="chat-widget" :class="{ 'chat-widget--collapsed': collapsed }">
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
          <Icon name="i-ph-user-plus-bold" class="h-4 w-4" />
        </button>
        <button
          class="chat-widget__header-btn"
          type="button"
          :title="$t('navigation.chatWidget.actionOpenMessages')"
          @click="openMessagesTab()"
        >
          <Icon name="i-ph-chat-teardrop-dots-bold" class="h-4 w-4" />
        </button>
        <button
          class="chat-widget__header-btn chat-widget__toggle-btn"
          type="button"
          :title="collapsed ? $t('navigation.chatWidget.expand') : $t('navigation.chatWidget.collapse')"
          @click="collapsed = !collapsed"
        >
          <Icon :name="collapsed ? 'i-ph-caret-down-bold' : 'i-ph-caret-up-bold'" class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <div v-show="!collapsed" class="chat-widget__body">
    <div ref="widgetTabsRef" class="chat-widget__tabs">
      <UButton
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        color="neutral"
        variant="ghost"
        class="chat-widget__tab"
        :class="{ 'chat-widget__tab--active': activeTab === tab.value }"
        :data-chat-widget-tab="tab.value"
        :aria-label="$t(tab.label)"
        :title="$t(tab.label)"
        @click="activeTab = tab.value"
      >
        <Icon :name="activeTab === tab.value ? tab.activeIcon : tab.icon" class="h-4 w-4" />
        <span class="sr-only">{{ $t(tab.label) }}</span>
      </UButton>
    </div>

    <div v-if="activeTab === 'send'" class="chat-widget__content chat-widget__content--send">
      <div ref="sendScrollRef" class="chat-widget__send-scroll">
        <section class="chat-widget__send-card chat-widget__compose-card">
          <h2 class="chat-widget__section-title">{{ $t("navigation.chatWidget.content") }}</h2>
          <div class="chat-widget__recipient-heading">
            <label class="chat-widget__field-label chat-widget__field-label--inline">{{ $t("navigation.chatWidget.sendToLabel") }}</label>
            <span v-if="selectedSendRecipients.length > 0" class="chat-widget__selected-count">
              {{ $t("pages.messagesPage.selectedRecipientsCount", { count: selectedSendRecipients.length }) }}
            </span>
          </div>

          <div class="chat-widget__field">
            <UInput
              v-model="sendTo"
              :placeholder="$t('navigation.chatWidget.recipientPlaceholder')"
              icon="i-ph-magnifying-glass-bold"
              :ui="{
                base: 'rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-muted)] px-3 py-2 text-sm shadow-none',
              }"
            />
          </div>

          <div class="chat-widget__recipient-box" :class="{ 'chat-widget__recipient-box--empty': selectedSendRecipients.length === 0 }">
            <UListbox
              v-if="selectedSendRecipients.length > 0"
              :items="selectedSendRecipientListboxItems"
              value-key="value"
              multiple
              class="chat-widget__recipient-listbox"
              :ui="{
                root: 'w-full min-w-0 max-w-full overflow-hidden',
                content: 'w-full min-w-0 max-h-[108px] overflow-x-hidden overflow-y-auto overscroll-contain',
                item: 'w-full min-w-0 max-w-full overflow-hidden',
              }"
            >
              <template #item="{ item }">
                <div class="chat-widget__selected-recipient-row">
                  <UUser
                    :name="item.label"
                    :description="item.description"
                    :avatar="item.avatar"
                    size="sm"
                    class="min-w-0 w-full"
                    :ui="{
                      wrapper: 'min-w-0',
                      name: 'truncate text-sm font-semibold text-[var(--text-primary)]',
                      description: 'truncate text-xs text-[var(--text-secondary)]',
                    }"
                  />
                  <UButton
                    type="button"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-ph-x-bold"
                    :aria-label="`${$t('pages.messagesPage.remove')}: ${item.label}`"
                    class="chat-widget__remove-recipient"
                    @pointerdown.stop
                    @click.stop="updateSendRecipientSelection(item.value, false)"
                  />
                </div>
              </template>
            </UListbox>
            <span v-else class="chat-widget__recipient-empty">{{ $t("navigation.chatWidget.noRecipientSelected") }}</span>
          </div>

          <div class="chat-widget__field">
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
              :accept="messageAttachmentAccept"
              @change="onFile"
            >
            <button
              type="button"
              class="chat-widget__attach-btn"
              @click="fileInput?.click()"
            >
              <Icon name="i-ph-paperclip-bold" class="h-4 w-4" />
              <span>{{ $t("navigation.chatWidget.chooseFile") }}</span>
            </button>
            <template v-if="attachFile">
              <div v-if="attachFilePreviewUrl" class="chat-widget__image-preview-container">
                <img :src="attachFilePreviewUrl" class="chat-widget__image-preview" alt="Preview" />
                <button
                  class="chat-widget__image-preview-clear"
                  type="button"
                  :title="$t('navigation.chatWidget.clearAttachment')"
                  @click="clearFile"
                >
                  <Icon name="i-ph-x-bold" class="h-3 w-3" />
                </button>
              </div>
              <template v-else>
                <span class="chat-widget__file-name">{{ attachFile.name }}</span>
                <button
                  class="chat-widget__clear-btn"
                  type="button"
                  :title="$t('navigation.chatWidget.clearAttachment')"
                  @click="clearFile"
                >
                  <Icon name="i-ph-x-bold" class="h-3 w-3" />
                </button>
              </template>
            </template>
          </div>

          <UCheckbox
            :model-value="allVisibleSendRecipientsSelected"
            :label="$t('navigation.chatWidget.selectAll')"
            :disabled="sendCandidates.length === 0"
            size="sm"
            class="chat-widget__select-all"
            @update:model-value="updateAllVisibleSendRecipients"
          />

          <UButton
            type="button"
            variant="solid"
            icon="i-ph-paper-plane-right-bold"
            class="chat-widget__send-btn btn-primary"
            :loading="isSendingQuick"
            :disabled="!canSendQuickMessage"
            @click="sendQuickMessage"
          >
            {{ $t("navigation.chatWidget.sendMessage") }}
          </UButton>

          <UProgress
            v-if="isSendingQuick && attachFile"
            size="xs"
            animation="carousel"
            :aria-label="$t('uploadValidation.uploading')"
          />

          <div class="chat-widget__field chat-widget__tag-filter">
            <USelectMenu
              v-model="activeSendTagFilterModel"
              v-model:open="sendTagFilterOpen"
              :items="sendTagFilterItems"
              value-key="value"
              :placeholder="$t('pages.messagesPage.chooseTag')"
              :search-input="{ placeholder: $t('pages.messagesPage.chooseTag') }"
              clear
              class="w-full"
              :ui="{
                base: 'w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-none',
              }"
            />
          </div>
        </section>

        <section class="chat-widget__send-card chat-widget__users-card">
          <h2 class="chat-widget__section-title">{{ $t("pages.messagesPage.users") }}</h2>

          <div v-if="isLoadingInbox" class="space-y-2" aria-hidden="true">
            <div v-for="index in 3" :key="index" class="chat-widget__user-skeleton">
              <USkeleton class="h-9 w-9 shrink-0 rounded-full" />
              <USkeleton class="h-3 w-24" />
              <USkeleton class="ml-auto h-7 w-16 rounded-[var(--radius-sm)]" />
            </div>
          </div>

          <UListbox
            v-else-if="sendCandidates.length > 0"
            :items="sendCandidateListboxItems"
            value-key="value"
            multiple
            class="chat-widget__users-listbox"
            :ui="{
              root: 'w-full min-w-0 max-w-full overflow-hidden',
              content: 'max-h-[286px] overflow-x-hidden overflow-y-auto overscroll-contain',
              item: 'w-full min-w-0 max-w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-muted)] px-3 py-2 data-[state=checked]:border-[var(--border-light)] data-[state=checked]:bg-[var(--bg-surface-active)]',
            }"
            @wheel.stop
            @touchmove.stop
          >
            <template #item="{ item }">
              <div class="chat-widget__candidate-row">
                <UUser
                  :name="item.label"
                  :avatar="{ src: item.avatarUrl, alt: item.label }"
                  :chip="item.online ? { color: 'success', position: 'bottom-right' } : false"
                  size="sm"
                  class="min-w-0 w-full"
                  :ui="{
                    wrapper: 'min-w-0',
                    name: 'truncate text-sm font-semibold text-[var(--text-primary)]',
                  }"
                />
                <div class="chat-widget__candidate-actions">
                  <div
                    class="chat-widget__select-state"
                    @pointerdown.stop
                    @click.stop
                  >
                    <UCheckbox
                      :model-value="isSendRecipientSelected(item.value)"
                      :label="$t('pages.messagesPage.selectRecipient')"
                      size="sm"
                      @update:model-value="updateSendRecipientSelection(item.value, $event)"
                    />
                  </div>
                  <UButton
                    type="button"
                    size="xs"
                    class="chat-widget__open-chat btn-primary"
                    @pointerdown.stop
                    @click.stop="openMiniChat(item.contact)"
                  >
                    {{ $t("pages.messagesPage.openChat") }}
                  </UButton>
                </div>
              </div>
            </template>
          </UListbox>

          <p v-else class="chat-widget__hint">
            {{ $t("navigation.chatWidget.noMatchingRecipients") }}
          </p>
        </section>
      </div>

    </div>

    <div v-else class="chat-widget__content chat-widget__content--directory">
      <div class="chat-widget__directory-scroll">
      <div v-if="isLoadingInbox" class="chat-widget__list chat-widget__list--loading">
        <div v-for="index in 5" :key="index" class="chat-widget__skeleton-row">
          <USkeleton class="h-9 w-9 rounded-full" />
          <USkeleton class="h-3 w-28 rounded-full" />
          <USkeleton v-if="activeTab === 'contacts'" class="ml-auto h-7 w-7 rounded-[var(--radius-sm)]" />
        </div>
      </div>

      <div
        v-else-if="activeTab === 'contacts' && filteredContacts.length === 0"
        class="chat-widget__empty"
      >
        <Icon name="i-ph-chat-circle-dots-bold" class="chat-widget__empty-icon" />
        <p>{{ $t("navigation.chatWidget.emptyContacts") }}</p>
      </div>

      <div
        v-else-if="activeTab === 'groups' && filteredGroups.length === 0"
        class="chat-widget__empty"
      >
        <Icon name="i-ph-users-three-bold" class="chat-widget__empty-icon" />
        <p>{{ $t("navigation.chatWidget.emptyGroups") }}</p>
      </div>
      
      <div v-else class="chat-widget__list chat-widget__directory-list">
        <div
          v-for="contact in activeTab === 'contacts' ? filteredContacts : filteredGroups"
          :key="contact.id"
          class="chat-widget__contact-wrapper"
        >
          <div
            class="chat-widget__contact"
            role="button"
            tabindex="0"
            @pointerenter="prefetchMiniThread(contact)"
            @focus="prefetchMiniThread(contact)"
            @click="openMiniChat(contact)"
            @keydown.enter.prevent="openMiniChat(contact)"
            @keydown.space.prevent="openMiniChat(contact)"
          >
            <div class="chat-widget__contact-avatar-wrap">
              <button
                v-if="contact.type === 'user'"
                type="button"
                class="chat-widget__contact-avatar-btn"
                :aria-label="contact.name"
                @click.stop="openMiniChat(contact)"
              >
                <UAvatar
                  :src="contact.avatarUrl"
                  :alt="contact.name"
                  size="md"
                  class="h-9 w-9 rounded-full"
                />
              </button>
              <UAvatar
                v-else-if="contact.avatarUrl"
                :src="contact.avatarUrl"
                :alt="contact.name"
                size="md"
                class="h-9 w-9 rounded-full"
              />
              <div v-else class="chat-widget__group-icon chat-widget__group-icon--large">
                <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
              </div>
            </div>

            <p class="chat-widget__contact-name">{{ contact.name }}</p>

            <div v-if="contact.type === 'user'" class="chat-widget__contact-actions">
              <div class="chat-widget__contact-tags" :aria-label="$t('pages.messagesPage.label')">
                <span
                  v-for="tag in contact.tags?.slice(0, 2) || []"
                  :key="tag.id"
                  class="chat-widget__contact-tag-color"
                  :title="tag.name"
                  :style="{ backgroundColor: tag.color || 'var(--icon-secondary)' }"
                />
                <span
                  v-if="(contact.tags?.length || 0) > 2"
                  class="chat-widget__contact-tag-more"
                  :title="buildHiddenContactTagsTitle(contact.tags)"
                  :aria-label="buildHiddenContactTagsAriaLabel(contact.tags)"
                >
                  +{{ (contact.tags?.length || 0) - 2 }}
                </span>
                <span
                  v-if="!contact.tags?.length"
                  class="chat-widget__contact-presence-dot"
                  :class="{ 'chat-widget__contact-presence-dot--online': contact.isOnline }"
                  :title="buildPresenceLabel(contact)"
                />
              </div>

              <UButton
                type="button"
                icon="i-ph-tag-fill"
                size="sm"
                color="primary"
                class="chat-widget__contact-tag-btn"
                :aria-label="$t('pages.messagesPage.label')"
                :title="$t('pages.messagesPage.label')"
                @pointerdown.stop
                @click.stop="openContactTags(contact)"
              />
            </div>
          </div>
        </div>

      </div>
      </div>

      <div class="chat-widget__footer">
        <UInput
          v-model="search"
          :placeholder="$t('navigation.chatWidget.searchPlaceholder')"
          icon="i-ph-magnifying-glass-bold"
          class="chat-widget__footer-input"
          :ui="{
            base: 'chat-widget__footer-input-control',
          }"
        />
      </div>

      <MessagesTagModal
        v-model:open="contactTagModalOpen"
        :labels="messageTagLabels"
        :selected-ids="contactTagModalSelectedIds"
        :pending="isUpdatingTags"
        :update-selection="updateContactTagSelection"
        :create-tag="createTagLabel"
        :update-tag="updateTagLabel"
        :delete-tag="deleteTagLabel"
      />
      
      <div
        v-for="(miniSession, miniSessionIndex) in openMiniChatSessions"
        :key="miniSession.contact.id"
        class="chat-widget__mini"
        :class="`chat-widget__mini--${miniSessionIndex + 1}`"
      >
        <div class="chat-widget__mini-header">
          <div class="chat-widget__mini-identity">
            <NuxtLink
              v-if="miniSession.contact.type === 'user'"
              :to="miniSession.contact.profileUrl || '#'"
              class="chat-widget__mini-avatar-link"
              :title="$t('navigation.chatWidget.viewProfile')"
              @click="activeMiniHeaderContactId = null"
            >
              <UChip
                :show="Boolean(miniSession.contact.isOnline)"
                position="bottom-right"
                color="success"
                inset
                :ui="{ base: '!bg-[var(--color-success)]' }"
              >
                <UAvatar
                  :src="miniSession.contact.avatarUrl"
                  :alt="miniSession.contact.name"
                  size="sm"
                  class="rounded-full"
                />
              </UChip>
            </NuxtLink>
            <div v-else class="chat-widget__group-icon chat-widget__group-icon--selected">
              <Icon name="i-ph-users-three-bold" class="h-4 w-4" />
            </div>
            <button
              type="button"
              class="chat-widget__mini-name-btn"
              @click.stop="toggleMiniHeaderMenu(miniSession)"
            >
              <span class="chat-widget__mini-title">{{ miniSession.contact.name }}</span>
              <span class="chat-widget__mini-status">{{ buildPresenceLabel(miniSession.contact) }}</span>
            </button>
          </div>

          <div class="chat-widget__mini-header-actions">
            <button
              v-if="miniSession.contact.type === 'user'"
              class="chat-widget__header-btn"
              type="button"
              :title="$t('pages.messagesPage.callLogAudio')"
              :disabled="isCallActionPending"
              @click="startMiniCall(miniSession, 'audio')"
            >
              <Icon name="i-ph-phone-bold" class="h-3.5 w-3.5" />
            </button>
            <button
              class="chat-widget__header-btn"
              type="button"
              :title="miniSession.contact.type === 'group' ? $t('pages.messagesPage.groupVideoCall') : $t('pages.messagesPage.callLogVideo')"
              :disabled="isCallActionPending"
              @click="startMiniCall(miniSession, 'video')"
            >
              <Icon name="i-ph-video-camera-bold" class="h-3.5 w-3.5" />
            </button>
            <button
              class="chat-widget__header-btn"
              type="button"
              :title="$t('navigation.chatWidget.minimizeChat')"
              @click="minimizeMiniSession(miniSession)"
            >
              <Icon name="i-ph-minus-bold" class="h-3.5 w-3.5" />
            </button>
            <button
              class="chat-widget__header-btn"
              type="button"
              :title="$t('navigation.chatWidget.actionOpenMessages')"
              @click="openFullMessages(miniSession.contact)"
            >
              <Icon name="i-ph-arrows-out-simple-bold" class="h-3.5 w-3.5" />
            </button>
            <button class="chat-widget__header-btn" type="button" @click="closeMiniSession(miniSession)">
              <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div v-if="showMiniHeaderMenuFor(miniSession)" ref="miniHeaderMenuRef" class="chat-widget__mini-menu">
          <div class="chat-widget__mini-menu-section">
            <button
              type="button"
              class="chat-widget__mini-menu-item"
              @click="openFullMessagesFromMiniMenu(miniSession)"
            >
              <UIcon name="i-ph-chat-circle-dots-bold" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.openInMessenger") }}</span>
            </button>
            <button
              v-if="miniSession.contact.profileUrl"
              type="button"
              class="chat-widget__mini-menu-item"
              @click="openMiniProfile(miniSession)"
            >
              <UIcon name="i-ph-user-circle-bold" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.viewProfile") }}</span>
            </button>
          </div>

          <div class="chat-widget__mini-menu-section">
            <button type="button" class="chat-widget__mini-menu-item" @click="openMessagesTabFromMiniMenu('multi')">
              <UIcon name="i-ph-users-three-bold" class="h-5 w-5" />
              <span>{{ $t("navigation.chatWidget.createGroup") }}</span>
            </button>
          </div>
        </div>

        <MessagesPinnedMessagesBar
          :pinned-messages="miniSession.thread.pinnedMessages"
          compact
          @select="scrollToMiniReplyTarget(miniSession.contactId, $event)"
          @unpin="toggleMiniMessagePinAction(miniSession, $event)"
        />

        <div
          :ref="element => setMiniMessagesViewport(miniSession.contactId, element)"
          class="chat-widget__mini-messages"
          @scroll="handleMiniScroll($event, miniSession)"
        >
          <div v-if="miniSession.isLoading" class="space-y-3">
            <USkeleton v-for="index in 3" :key="index" class="h-12 rounded-2xl" />
          </div>

          <div v-else-if="miniSession.messages.length === 0" class="chat-widget__empty chat-widget__empty--mini">
            <Icon name="i-ph-chat-teardrop-text-bold" class="chat-widget__empty-icon" />
            <p>{{ $t("navigation.chatWidget.emptyMessages") }}</p>
          </div>

          <div v-else class="chat-widget__mini-thread">
            <div v-if="miniSession.isLoadingMore" class="flex justify-center py-2">
              <UIcon name="i-ph-circle-notch-bold" class="h-4 w-4 animate-spin text-primary-500" />
            </div>
            <div
              v-for="message in miniSession.messages"
              :key="message.id"
              :data-message-id="message.id"
              class="chat-widget__mini-message"
              :class="{
                'chat-widget__mini-message--mine': message.isMine,
                'chat-widget__mini-message--system': Boolean(message.systemEvent),
                'chat-widget__mini-message--product': Boolean(getMiniProductMeta(message)),
                'chat-widget__mini-message--order': Boolean(message.orderRequest),
                'chat-widget__mini-message--voice': Boolean(message.mediaUrl && (message.mediaType === 'audio' || message.mediaType === 'record')),
                'chat-widget__mini-message--location': Boolean(getMessageLocationMeta(message)),
                'chat-widget__mini-message--highlighted': highlightedMiniMessageKey === `${miniSession.contactId}:${message.id}`,
              }"
            >
              <div
                v-if="message.systemEvent"
                class="chat-widget__mini-pin-event"
              >
                <Icon :name="message.systemEvent.type === 'message_unpinned' ? 'i-ph-push-pin-slash-bold' : 'i-ph-push-pin-fill'" />
                <span>{{ getMiniPinnedEventLabel(message) }}</span>
              </div>

              <ChatBubble
                v-else
                :text="getMiniBubbleText(message)"
                :is-mine="message.isMine"
                :is-last="message.isLast"
                :show-author="miniSession.contact.type === 'group' && message.showAuthor"
                :time="message.time"
                :show-time="message.showTime"
                :avatar="message.avatar || miniSession.contact.avatarUrl"
                :sender-is-online="getMiniMessageSenderOnline(miniSession, message)"
                :author-name="getMiniMessageAuthorName(miniSession, message)"
                :timeline-title="getMiniMessageTimelineTitle(message)"
                :reply-title="!message.isDeleted && getMiniReplyMeta(message) ? getMiniReplyTitle(message) : undefined"
                :reply-quote="!message.isDeleted && !getMiniReplyMeta(message)?.mediaUrl && !isMiniImageFileQuote(getMiniReplyMeta(message)?.quote) ? getMiniReplyMeta(message)?.quote : undefined"
                :reply-media-url="!message.isDeleted ? getMiniReplyMeta(message)?.mediaUrl : undefined"
                :reply-target-message-id="!message.isDeleted ? getMiniReplyMeta(message)?.targetMessageId : undefined"
                :reaction-src="!message.isDeleted ? getMiniMessageReaction(message)?.src : undefined"
                :reaction-alt="!message.isDeleted ? $t(getMiniMessageReaction(message)?.labelKey ?? defaultMiniReaction.labelKey) : undefined"
                :show-tools="!message.isDeleted"
                :reaction-picker-open="activeMiniReactionPickerId === message.id"
                teleport-reaction-picker
                teleport-message-tools
                :reaction-options="miniBubbleReactionOptions"
                :can-delete="message.isMine"
                can-pin
                :is-pinned="Boolean(getMiniPinnedMessage(miniSession, message.id))"
                :can-unpin="getMiniPinnedMessage(miniSession, message.id)?.canUnpin"
                :more-title="$t('navigation.chatWidget.moreMessageActions')"
                :pin-title="$t('navigation.chatWidget.pinMessage')"
                :unpin-title="$t('navigation.chatWidget.unpinMessage')"
                :delete-title="$t('navigation.chatWidget.deleteMessage')"
                :media-url="message.isDeleted ? undefined : message.mediaUrl"
                :media-name="message.isDeleted ? undefined : message.mediaName"
                :media-type="message.isDeleted ? undefined : message.mediaType"
                :product-card="message.isDeleted ? undefined : getMiniProductMeta(message)?.card"
                :order-request="message.isDeleted ? undefined : message.orderRequest"
                :shared-post="message.isDeleted ? undefined : message.sharedPost"
                :story-context="message.isDeleted ? undefined : message.story"
                :location="message.isDeleted ? undefined : getMessageLocationMeta(message)"
                :call-log="message.isDeleted ? undefined : message.callLog"
                class="chat-widget__mini-chat-bubble"
                :class="{ 'chat-widget__mini-chat-bubble--deleted': message.isDeleted }"
                @avatar-click="openMiniMessageAvatarMenu(miniSession, message, $event)"
                @retry-call="openFullMessages(miniSession.contact)"
                @toggle-reaction-picker="toggleMiniReactionPicker(message.id)"
                @select-reaction="setMiniReactionByValue(message.id, $event.value)"
                @reply="replyToMiniMessage(miniSession.contactId, message)"
                @open-reply-target="scrollToMiniReplyTarget(miniSession.contactId, $event)"
                @delete="deleteMiniMessageAction(message)"
                @pin="toggleMiniMessagePinAction(miniSession, message)"
              />
            </div>
          </div>
        </div>

        <div v-if="miniSession.productDraft || hasMiniReplyFor(miniSession.contactId) || miniSession.attachFile || miniRecordDraftFor(miniSession.contactId) || isMiniRecordingFor(miniSession.contactId)" class="chat-widget__mini-draft">
          <div v-if="miniSession.productDraft" class="chat-widget__mini-product-draft">
            <span class="chat-widget__mini-product-image">
              <img
                v-if="miniSession.productDraft.imageUrl"
                :src="miniSession.productDraft.imageUrl"
                :alt="miniSession.productDraft.title"
              >
              <Icon v-else name="i-ph-package-bold" class="h-6 w-6" />
            </span>
            <span class="chat-widget__mini-product-copy">
              <strong>{{ miniSession.productDraft.title }}</strong>
              <span>{{ miniSession.productDraft.price }}</span>
            </span>
            <button
              type="button"
              class="chat-widget__mini-preview-clear"
              :title="$t('pages.productsPage.removeProductFromMessage')"
              @click="clearMiniProductDraft(miniSession.contact.id)"
            >
              <Icon name="i-ph-x-bold" class="h-3 w-3" />
            </button>
          </div>
          <div
            v-if="miniSession.productDraft && miniSession.productSuggestions?.length"
            class="chat-widget__product-suggestions"
          >
            <button
              v-for="suggestion in miniSession.productSuggestions"
              :key="suggestion"
              type="button"
              class="chat-widget__product-suggestion"
              :disabled="miniSession.isSending || miniSubmittingMap[miniSession.contactId]"
              @click="sendProductSuggestion(miniSession, suggestion)"
            >
              <span>{{ suggestion }}</span>
              <Icon name="i-ph-paper-plane-tilt-bold" class="h-3.5 w-3.5 shrink-0" />
            </button>
          </div>
          <div v-if="hasMiniReplyFor(miniSession.contactId)" class="chat-widget__mini-reply-preview">
            <div class="chat-widget__mini-reply-copy">
              <strong>{{ miniReplyTitle }}</strong>
              <NuxtImg
                v-if="miniReplyPreviewMediaUrl"
                :src="miniReplyPreviewMediaUrl"
                :alt="miniReplyPreviewText || miniReplyTitle"
                class="chat-widget__mini-reply-image"
              />
              <span v-if="!miniReplyPreviewMediaUrl">{{ miniReplyPreviewText }}</span>
            </div>
            <button type="button" class="chat-widget__mini-preview-clear" @click="clearMiniReply(miniSession.contactId)">
              <Icon name="i-ph-x-bold" class="h-3 w-3" />
            </button>
          </div>
          <div v-if="miniSession.attachFile" class="chat-widget__mini-file-preview-container">
            <div v-if="miniSession.attachFilePreviewUrl" class="chat-widget__mini-image-preview-wrapper">
              <img :src="miniSession.attachFilePreviewUrl" class="chat-widget__mini-image-preview" alt="Preview" />
              <button type="button" class="chat-widget__mini-image-preview-clear" @click="clearMiniFile(miniSession.contact.id)">
                <Icon name="i-ph-x-bold" class="h-3 w-3" />
              </button>
            </div>
            <div v-else class="chat-widget__mini-file-preview">
              <Icon name="i-ph-paperclip-bold" class="h-3.5 w-3.5" />
              <span>{{ miniSession.attachFile.name }}</span>
              <button type="button" @click="clearMiniFile(miniSession.contact.id)">
                <Icon name="i-ph-x-bold" class="h-3 w-3" />
              </button>
            </div>
          </div>
          <div v-if="miniRecordDraftFor(miniSession.contactId) || isMiniRecordingFor(miniSession.contactId)" class="chat-widget__mini-file-preview">
            <Icon name="i-ph-microphone-bold" class="h-3.5 w-3.5" />
            <span>
              {{ isMiniRecordingFor(miniSession.contactId) ? $t("pages.messagesPage.recordingInProgress") : $t("pages.messagesPage.recordReady") }}
              · {{ formatMiniRecordingDuration(miniSession.contactId) }}
            </span>
            <button type="button" @click="discardMiniRecording(miniSession.contactId)">
              <Icon name="i-ph-x-bold" class="h-3 w-3" />
            </button>
          </div>
          <UProgress
            v-if="miniSession.isSending && (miniSession.sendQueue?.[0]?.file || miniSession.sendQueue?.[0]?.record)"
            size="xs"
            animation="carousel"
            :aria-label="$t('uploadValidation.uploading')"
          />
        </div>

        <div class="chat-widget__mini-input-wrap">
          <div class="chat-widget__mini-input-shell">
            <UInput
              v-model="miniSession.message"
              :placeholder="$t('navigation.chatWidget.miniInputPlaceholder')"
              class="chat-widget__mini-input"
              :ui="{
                base: 'chat-widget__mini-input-control',
              }"
              @keydown.enter.exact.prevent="handleMiniEnterKey($event, miniSession)"
            />
            <button
              type="button"
              class="chat-widget__mini-send-btn"
              :disabled="!canSubmitMiniMessage(miniSession)"
              :title="$t('navigation.chatWidget.sendMessage')"
              @click="submitMiniMessage(miniSession)"
            >
              <UIcon
                :name="miniSession.isSending ? 'i-ph-circle-notch-bold' : 'i-ph-paper-plane-right-bold'"
                class="chat-widget__mini-send-icon"
                :class="{ 'animate-spin': miniSession.isSending }"
              />
            </button>
          </div>
          <input :id="`mini-image-input-${miniSession.contact.id}`" type="file" :accept="messageImageAccept" class="hidden" @change="handleMiniFileChange(miniSession, $event)">
          <input :id="`mini-file-input-${miniSession.contact.id}`" type="file" :accept="messageAttachmentAccept" class="hidden" @change="handleMiniFileChange(miniSession, $event)">
          <button
            type="button"
            class="chat-widget__mini-tool-btn"
            :class="{ 'chat-widget__mini-tool-btn--active': miniLocationContactId === miniSession.contactId }"
            :title="$t('pages.messagesPage.shareLocation')"
            :disabled="isLocating || miniSession.isSending"
            @click="shareMiniLocation(miniSession)"
          >
            <Icon
              :name="miniLocationContactId === miniSession.contactId ? 'i-ph-circle-notch-bold' : 'i-ph-map-pin-line-bold'"
              class="h-4 w-4"
              :class="{ 'animate-spin': miniLocationContactId === miniSession.contactId }"
            />
          </button>
          <button
            type="button"
            class="chat-widget__mini-tool-btn"
            :class="{ 'chat-widget__mini-tool-btn--active': isMiniRecordingFor(miniSession.contactId) }"
            :title="$t(isMiniRecordingFor(miniSession.contactId) ? 'pages.messagesPage.stopRecording' : 'pages.messagesPage.startRecording')"
            :disabled="!isMiniRecordSupported"
            @click="handleMiniRecordButton(miniSession)"
          >
            <Icon :name="isMiniRecordingFor(miniSession.contactId) ? 'i-ph-stop-circle-bold' : 'i-ph-microphone-bold'" class="h-4 w-4" />
          </button>
          <button type="button" class="chat-widget__mini-tool-btn" :title="$t('pages.messagesPage.attachmentLabel')" @click="triggerMiniFileInput('image', miniSession.contact.id)">
            <Icon name="i-ph-image-bold" class="h-4 w-4" />
          </button>
          <button type="button" class="chat-widget__mini-tool-btn" :title="$t('navigation.chatWidget.chooseFile')" @click="triggerMiniFileInput('file', miniSession.contact.id)">
            <Icon name="i-ph-paperclip-bold" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
    

    <button
      v-for="(launcher, launcherIndex) in miniLaunchers"
      :key="launcher.id"
      type="button"
      class="chat-widget__mini-launcher"
      :class="`chat-widget__mini-launcher--${launcherIndex + 1}`"
      :title="launcher.name"
      @click="restoreMiniLauncher(launcher)"
    >
      <UChip
        :show="Boolean(launcher.unreadCount && launcher.unreadCount > 0)"
        position="top-right"
        color="success"
        inset
        :ui="{ base: '!bg-[var(--color-success)]' }"
      >
        <UAvatar
          v-if="launcher.type === 'user'"
          :src="launcher.avatarUrl"
          :alt="launcher.name"
          size="lg"
          class="rounded-full"
        />
        <div v-else class="chat-widget__mini-launcher-group">
          <Icon name="i-ph-users-three-bold" class="h-5 w-5" />
        </div>
      </UChip>
    </button>

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
          v-if="messageAvatarMenuContact"
          ref="messageAvatarMenuRef"
          class="chat-widget__message-avatar-menu"
          :style="messageAvatarMenuStyle"
        >
          <button
            v-if="messageAvatarMenuContact.profileUrl"
            type="button"
            class="chat-widget__message-avatar-menu-item"
            @click="goToMessageAvatarProfile"
          >
            <UIcon name="i-ph-user-circle-bold" class="h-5 w-5" />
            <span>{{ $t("navigation.chatWidget.viewProfile") }}</span>
          </button>
          <button v-if="messageAvatarMenuContact.type === 'user'" type="button" class="chat-widget__message-avatar-menu-item" @click="callMessageAvatarContact('audio')">
            <UIcon name="i-ph-phone-bold" class="h-5 w-5" />
            <span>{{ $t("navigation.chatWidget.audioCall") }}</span>
          </button>
          <button type="button" class="chat-widget__message-avatar-menu-item" @click="callMessageAvatarContact('video')">
            <UIcon name="i-ph-video-camera-bold" class="h-5 w-5" />
            <span>{{ $t("navigation.chatWidget.videoCall") }}</span>
          </button>
        </div>
      </Transition>
    </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import UListbox from "@nuxt/ui/components/Listbox.vue"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { defaultFeedReactionAsset, feedReactionAssetByValue, feedReactionAssets, type FeedReactionAsset } from "../../../feed/application/constants/reaction-assets"
import { useMessageCalls } from "../../../messages/application/composables/useMessageCalls"
import { useCurrentLocationShare } from "../../../messages/application/composables/useCurrentLocationShare"
import { useMessageRecorder } from "../../../messages/application/composables/useMessageRecorder"
import ChatBubble from "../../../messages/presentation/components/ChatBubble.vue"
import MessagesPinnedMessagesBar from "../../../messages/presentation/components/PinnedMessagesBar.vue"
import MessagesTagModal from "../../../messages/presentation/components/MessageTagsModal.vue"
import type { MessageCallType } from "../../../messages/domain/types/calls.types"
import type { MessageContact, MessageItem } from "../../../messages/domain/types/messages.types"
import {
  buildProductMessageText,
  getMessageProductMeta,
  getMessageReplyPreviewText,
} from "../../../messages/application/utils/message-bubble-content"
import { getMessageLocationMeta } from "../../../messages/application/utils/message-location"
import {
  getMessageAttachmentAccept,
  getMessageImageAccept,
} from "../../../shared-kernel/application/utils/uploadValidation"
import { useUploadPolicyStore } from "../../../shared-kernel/application/stores/useUploadPolicyStore"
import { useChatWidgetVM } from "../../application/view-models/useChatWidgetVM"

const collapsed = ref(false)
const uploadPolicyStore = useUploadPolicyStore()
const messageAttachmentAccept = computed(() => getMessageAttachmentAccept(uploadPolicyStore.policy))
const messageImageAccept = computed(() => getMessageImageAccept(uploadPolicyStore.policy))

const tabs = [
  {
    value: "send",
    icon: "i-ph-paper-plane-right-bold",
    activeIcon: "i-ph-paper-plane-tilt-bold",
    label: "navigation.chatWidget.tabSend",
  },
  {
    value: "contacts",
    icon: "i-ph-users-bold",
    activeIcon: "i-ph-users-bold",
    label: "navigation.chatWidget.tabContacts",
  },
  {
    value: "groups",
    icon: "i-ph-users-three-bold",
    activeIcon: "i-ph-users-three-bold",
    label: "navigation.chatWidget.tabGroups",
  },
] as const

const fileInput = ref<HTMLInputElement | null>(null)
const widgetTabsRef = ref<HTMLElement | null>(null)
const sendScrollRef = ref<HTMLElement | null>(null)
let sendPanelResetFrame: number | null = null
const { t } = useI18n()
const toast = useToast()
const miniMessagesViewports = new Map<string, HTMLElement>()
const miniMessagesPinnedToBottom = new Map<string, boolean>()
const highlightedMiniMessageKey = ref("")
let miniHighlightTimer: ReturnType<typeof setTimeout> | undefined
const MINI_MESSAGES_BOTTOM_THRESHOLD = 64
const miniHeaderMenuRef = ref<HTMLElement | null>(null)
const messageAvatarMenuRef = ref<HTMLElement | null>(null)
const activeMiniHeaderContactId = ref<string | null>(null)
const miniReactionOptions = feedReactionAssets
const defaultMiniReaction = defaultFeedReactionAsset

// Avatar context menu
type AvatarMenuContact = (typeof filteredContacts)['value'][number]
const contactTagModalOpen = ref(false)
const contactTagModalContact = ref<MessageContact | null>(null)
const sendTagFilterOpen = ref(false)
const messageAvatarMenuContact = ref<AvatarMenuContact | null>(null)
const messageAvatarMenuStyle = ref<Record<string, string>>({})
const messageAvatarMenuMessageId = ref<number | null>(null)
const activeMiniReactionPickerId = ref<number | null>(null)
const miniMessageReactions = ref<Record<number, FeedReactionAsset | undefined>>({})
const miniReplyTarget = ref<MessageItem | null>(null)
const miniReplyContactId = ref("")
const miniRecordingContactId = ref("")
const MINI_REPLY_PREFIX = "__VNSEEA_MINI_REPLY__:"
const {
  isCallActionPending,
  startCall,
  startGroupCall,
} = useMessageCalls()
const {
  isSupported: isMiniRecordSupported,
  isRecording: isMiniRecording,
  durationMs: miniRecordDurationMs,
  recordDraft: miniRecordDraft,
  startRecording: startMiniRecording,
  stopRecording: stopMiniRecording,
  clearRecording: clearMiniRecording,
} = useMessageRecorder()
const {
  activeTab,
  search,
  activeSendTagFilter,
  setInboxRefreshPaused,
  sendTo,
  sendMessage,
  attachFile,
  attachFilePreviewUrl,
  allVisibleSendRecipientsSelected,
  sendCandidates,
  selectedSendRecipientIds,
  selectedSendRecipients,
  filteredContacts,
  filteredGroups,
  onlineCount,
  miniChatOpen,
  miniChatSessions,
  miniChatAutoOpenVersion,
  activeMiniContact,
  isLoadingInbox,
  isSendingQuick,
  isUpdatingTags,
  canSendQuickMessage,
  buildPresenceLabel,
  messageTagLabels,
  createTagLabel,
  updateTagLabel,
  deleteTagLabel,
  updateContactTags,
  setSelectedSendRecipientIds,
  toggleAllVisibleSendRecipients,
  openMiniChat: openMiniChatVm,
  prefetchMiniThread,
  closeMiniChat: closeMiniChatVm,
  minimizeMiniChat,
  restoreMiniChat,
  sendQuickMessage,
  sendMiniMessage,
  reactToMiniMessage,
  deleteMiniMessage,
  toggleMiniMessagePin,
  onMiniFile,
  clearMiniFile,
  clearMiniProductDraft,
  onFile,
  clearFile,
  openFullMessages,
  openMessagesTab,
  loadOlderMiniMessages,
} = useChatWidgetVM()

const sendTagFilterItems = computed(() => [
  {
    label: t("pages.messagesPage.allTaggedUsers"),
    value: "0",
    icon: "i-ph-users-three-duotone",
  },
  ...messageTagLabels.value.map(tag => ({
    label: tag.name,
    value: String(tag.id),
    icon: "i-ph-tag-duotone",
  })),
])
const activeSendTagFilterModel = computed<string | null>({
  get: () => activeSendTagFilter.value || null,
  set: tagId => { activeSendTagFilter.value = tagId ?? "" },
})

watch(sendTagFilterOpen, (isOpen) => {
  setInboxRefreshPaused(isOpen)
}, { flush: "sync" })
const contactTagModalLiveContact = computed(() => {
  const userId = contactTagModalContact.value?.userId ?? 0

  return filteredContacts.value.find(contact => contact.userId === userId)
    ?? contactTagModalContact.value
})
const contactTagModalSelectedIds = computed(() =>
  contactTagModalLiveContact.value?.tags?.map(tag => tag.id) ?? [],
)
const selectedSendRecipientListboxItems = computed(() => selectedSendRecipients.value.map(recipient => ({
  label: recipient.name,
  description: buildPresenceLabel(recipient),
  value: recipient.userId ?? 0,
  onSelect: (event: Event) => event.preventDefault(),
  avatar: {
    src: recipient.avatarUrl,
    alt: recipient.name,
  },
})))
const sendCandidateListboxItems = computed(() => sendCandidates.value
  .filter(candidate => (candidate.userId ?? 0) > 0)
  .map(candidate => ({
    label: candidate.name,
    value: candidate.userId ?? 0,
    avatarUrl: candidate.avatarUrl,
    online: candidate.isOnline,
    contact: candidate,
    onSelect: (event: Event) => {
      event.preventDefault()
      const userId = candidate.userId ?? 0

      if (userId > 0) {
        updateSendRecipientSelection(userId, !isSendRecipientSelected(userId))
      }
    },
  })))

type MiniChatSessionView = (typeof miniChatSessions)["value"][number]

const openMiniChatSessions = computed(() =>
  miniChatSessions.value.filter(session => !session.minimized),
)
const miniLaunchers = computed(() =>
  miniChatSessions.value
    .filter(session => session.minimized)
    .map(session => session.contact)
    .slice(0, 2),
)
const isMiniRecordingFor = (contactId: string) =>
  miniRecordingContactId.value === contactId && isMiniRecording.value
const miniRecordDraftFor = (contactId: string) =>
  miniRecordingContactId.value === contactId ? miniRecordDraft.value : null
const formatMiniRecordingDuration = (contactId: string) => {
  const totalSeconds = miniRecordingContactId.value === contactId
    ? Math.max(Math.floor(miniRecordDurationMs.value / 1000), 0)
    : 0
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`
}
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
const miniReplyLocationTitle = computed(() => {
  if (!miniReplyTarget.value) {
    return ""
  }

  if (miniReplyTarget.value.isMine) {
    return t("pages.messagesPage.locationOwnTitle")
  }

  return miniReplyAuthor.value
    ? t("pages.messagesPage.locationSenderTitle", { name: miniReplyAuthor.value })
    : t("pages.messagesPage.locationDefaultTitle")
})
const miniReplyPreviewText = computed(() =>
  miniReplyTarget.value
    ? getMessageReplyPreviewText(miniReplyTarget.value, {
        fallbackLabel: t("navigation.chatWidget.replyingToMessage"),
        locationTitle: miniReplyLocationTitle.value,
      })
    : t("navigation.chatWidget.replyingToMessage"),
)
const miniReplyPreviewMediaUrl = computed(() =>
  miniReplyTarget.value
  && miniReplyTarget.value.mediaUrl
  && (miniReplyTarget.value.mediaType === "image" || miniReplyTarget.value.mediaType === "gif")
    ? miniReplyTarget.value.mediaUrl
    : "",
)
const miniBubbleReactionOptions = computed(() =>
  miniReactionOptions.map(reaction => ({
    value: reaction.value,
    src: reaction.src,
    label: t(reaction.labelKey),
  })),
)
const miniSubmittingMap = ref<Record<string, boolean>>({})
const miniLocationContactId = ref("")
const {
  isLocating,
  locationError,
  createCurrentLocationMessage,
  clearLocationError,
} = useCurrentLocationShare()

function canSubmitMiniMessage(session: MiniChatSessionView) {
  if (miniSubmittingMap.value[session.contactId]) {
    return false
  }
  return !isMiniRecordingFor(session.contactId)
    && (
      session.canSend
      || Boolean(miniRecordDraftFor(session.contactId))
      || Boolean(hasMiniReplyFor(session.contactId) && session.message.trim())
    )
}

function isSendRecipientSelected(userId: number) {
  return selectedSendRecipientIds.value.includes(userId)
}

function buildHiddenContactTagsTitle(tags?: Array<{ name: string }>) {
  return tags?.slice(2).map(tag => tag.name).join(", ") || ""
}

function buildHiddenContactTagsAriaLabel(tags?: Array<{ name: string }>) {
  const hiddenTags = tags?.slice(2) || []

  return `${hiddenTags.length} ${t("pages.messagesPage.label")}: ${hiddenTags.map(tag => tag.name).join(", ")}`
}

function updateAllVisibleSendRecipients(checked: boolean | "indeterminate") {
  const shouldSelectAll = checked === true

  if (shouldSelectAll !== allVisibleSendRecipientsSelected.value) {
    toggleAllVisibleSendRecipients()
  }
}

function updateSendRecipientSelection(userId: number, checked: boolean | "indeterminate") {
  const nextRecipientIds = new Set(selectedSendRecipientIds.value)

  if (checked === true) {
    nextRecipientIds.add(userId)
  }
  else {
    nextRecipientIds.delete(userId)
  }

  setSelectedSendRecipientIds([...nextRecipientIds])
}

async function openMiniChat(contact: Parameters<typeof openMiniChatVm>[0]) {
  activeMiniHeaderContactId.value = null
  closeMessageAvatarMenu()
  activeMiniReactionPickerId.value = null
  await openMiniChatVm(contact)
  await nextTick()
  scrollMiniMessagesToBottom(contact.id)
}

function triggerMiniFileInput(type: 'image' | 'file', contactId: string) {
  if (!import.meta.client) return
  const inputId = type === 'image' ? `mini-image-input-${contactId}` : `mini-file-input-${contactId}`
  const inputEl = document.getElementById(inputId) as HTMLInputElement | null
  if (inputEl) {
    inputEl.click()
  }
}

function closeMiniChat() {
  activeMiniHeaderContactId.value = null
  closeMessageAvatarMenu()
  clearMiniReply()
  activeMiniReactionPickerId.value = null
  clearMiniRecordingState()
  closeMiniChatVm()
}

function closeMiniSession(session: MiniChatSessionView) {
  activeMiniHeaderContactId.value = null
  closeMessageAvatarMenu()
  clearMiniReply(session.contactId)
  activeMiniReactionPickerId.value = null
  clearMiniRecordingState(session.contactId)
  miniMessagesViewports.delete(session.contactId)
  miniMessagesPinnedToBottom.delete(session.contactId)
  closeMiniChatVm(session.contactId)
}

function minimizeMiniSession(session: MiniChatSessionView) {
  activeMiniHeaderContactId.value = null
  activeMiniReactionPickerId.value = null
  closeMessageAvatarMenu()
  minimizeMiniChat(session.contactId)
}

async function restoreMiniLauncher(contact: MessageContact) {
  activeMiniHeaderContactId.value = null
  restoreMiniChat(contact.id)
  await nextTick()
  scrollMiniMessagesToBottom(contact.id)
}

function toggleMiniHeaderMenu(session: MiniChatSessionView) {
  activeMiniHeaderContactId.value = activeMiniHeaderContactId.value === session.contact.id
    ? null
    : session.contact.id
  closeMessageAvatarMenu()
}

function showMiniHeaderMenuFor(session: MiniChatSessionView) {
  return activeMiniHeaderContactId.value === session.contact.id
}

function closeMiniHeaderMenu() {
  activeMiniHeaderContactId.value = null
}

function openContactTags(contact: MessageContact) {
  contactTagModalContact.value = contact
  contactTagModalOpen.value = true
}

async function updateContactTagSelection(nextIds: number[]) {
  const contact = contactTagModalLiveContact.value

  if (!contact || isUpdatingTags.value) {
    return
  }

  await updateContactTags(contact, nextIds)
}

function openMiniMessageAvatarMenu(session: MiniChatSessionView, message: MessageItem, event: MouseEvent) {
  const contact = session.contact

  if (!contact || message.isMine) {
    return
  }

  if (messageAvatarMenuContact.value && messageAvatarMenuMessageId.value === message.id) {
    closeMessageAvatarMenu()
    return
  }

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const menuWidth = 270
  const menuHeight = 198
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = rect.left + 12
  let top = rect.top - menuHeight - 10

  if (left + menuWidth > vw - 8) {
    left = vw - menuWidth - 8
  }
  if (top < 8) {
    top = Math.min(vh - menuHeight - 8, rect.bottom + 10)
  }

  messageAvatarMenuStyle.value = {
    position: "fixed",
    left: `${Math.max(8, left)}px`,
    top: `${Math.max(8, top)}px`,
    zIndex: "10000",
  }
  const senderId = Number(message.senderId ?? 0)
  const isGroupMember = contact.type === "group" && senderId > 0
  messageAvatarMenuContact.value = {
    ...contact,
    id: isGroupMember ? `user:${senderId}` : contact.id,
    name: message.authorName || contact.name,
    avatarUrl: message.avatar || contact.avatarUrl,
    type: isGroupMember ? "user" : contact.type,
    tab: isGroupMember ? "user" : contact.tab,
    userId: isGroupMember ? senderId : contact.userId,
    groupId: isGroupMember ? undefined : contact.groupId,
    pageId: isGroupMember ? undefined : contact.pageId,
    recipientId: isGroupMember ? undefined : contact.recipientId,
    profileUrl: message.authorProfileUrl || (isGroupMember ? undefined : contact.profileUrl),
  } as AvatarMenuContact
  messageAvatarMenuMessageId.value = message.id
  activeMiniHeaderContactId.value = null
}

function closeMessageAvatarMenu() {
  messageAvatarMenuContact.value = null
  messageAvatarMenuMessageId.value = null
}

function closeFloatingMenusOnOutsideClick(event: MouseEvent) {
  const target = event.target as Node | null

  if (!target) {
    return
  }

  if (activeMiniHeaderContactId.value && !miniHeaderMenuRef.value?.contains(target)) {
    activeMiniHeaderContactId.value = null
  }

  if (messageAvatarMenuContact.value && !messageAvatarMenuRef.value?.contains(target)) {
    closeMessageAvatarMenu()
  }

  const targetElement = target instanceof Element ? target : null
  if (
    activeMiniReactionPickerId.value !== null
    && !targetElement?.closest(".chat-bubble__message-tool-wrap, .chat-bubble__reaction-picker")
  ) {
    activeMiniReactionPickerId.value = null
  }
}

watch(activeTab, async (tab) => {
  if (tab !== "send") {
    sendTagFilterOpen.value = false
    return
  }

  if (!import.meta.client) return

  await nextTick()
  await nextTick()

  if (sendPanelResetFrame !== null) {
    window.cancelAnimationFrame(sendPanelResetFrame)
  }

  sendPanelResetFrame = window.requestAnimationFrame(() => {
    sendScrollRef.value?.scrollTo({ top: 0, left: 0, behavior: "auto" })
    widgetTabsRef.value
      ?.querySelector<HTMLElement>('[data-chat-widget-tab="send"]')
      ?.focus({ preventScroll: true })
    sendPanelResetFrame = null
  })
})

watch(collapsed, (isCollapsed) => {
  if (isCollapsed) {
    sendTagFilterOpen.value = false
  }
})

onMounted(() => {
  void uploadPolicyStore.hydrate()
  document.addEventListener("click", closeFloatingMenusOnOutsideClick)
})

onBeforeUnmount(() => {
  setInboxRefreshPaused(false)
  document.removeEventListener("click", closeFloatingMenusOnOutsideClick)
  if (sendPanelResetFrame !== null) {
    window.cancelAnimationFrame(sendPanelResetFrame)
  }
  if (miniHighlightTimer) {
    clearTimeout(miniHighlightTimer)
  }
})

async function goToMessageAvatarProfile() {
  const profileUrl = messageAvatarMenuContact.value?.profileUrl
  closeMessageAvatarMenu()

  if (profileUrl) {
    await navigateTo(profileUrl)
  }
}

async function callMessageAvatarContact(type: "audio" | "video") {
  const contact = messageAvatarMenuContact.value
  closeMessageAvatarMenu()

  if (!contact) {
    return
  }

  if (contact.type === "group") {
    await startGroupCall(contact)
    return
  }

  if (contact.type === "user") {
    await startCall(contact, type)
  }
}

async function openMiniProfile(session: MiniChatSessionView) {
  const profileUrl = session.contact.profileUrl
  closeMiniHeaderMenu()

  if (profileUrl) {
    await navigateTo(profileUrl)
  }
}

async function openFullMessagesFromMiniMenu(session: MiniChatSessionView) {
  const contact = session.contact
  closeMiniHeaderMenu()
  await openFullMessages(contact)
}

async function openMessagesTabFromMiniMenu(tab: "user" | "group" | "multi") {
  closeMiniHeaderMenu()
  await openMessagesTab(tab)
}

async function startMiniCall(session: MiniChatSessionView, type: MessageCallType) {
  const contact = session.contact

  if (!contact) {
    return
  }

  if (contact.type === "group") {
    await startGroupCall(contact)
    return
  }

  if (contact.type === "user") {
    await startCall(contact, type)
  }
}

function getMiniMessageSenderOnline(session: MiniChatSessionView, message: { isMine: boolean, senderIsOnline?: boolean }) {
  if (message.isMine) {
    return false
  }

  return message.senderIsOnline ?? session.contact.isOnline ?? false
}

function getMiniMessageAuthorName(session: MiniChatSessionView, message: MessageItem) {
  if (message.authorName?.trim()) {
    return message.authorName.trim()
  }

  return !message.isMine && session.contact.type !== "group"
    ? session.contact.name.trim()
    : ""
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

async function setMiniReactionByValue(messageId: number, reactionValue: string) {
  const reaction = miniReactionOptions.find(item => item.value === reactionValue)

  if (!reaction) {
    return
  }

  await setMiniReaction(messageId, reaction)
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
      clearMiniReply()
    }
  }
  catch {
    miniMessageReactions.value = {
      ...miniMessageReactions.value,
      [message.id]: previousReaction,
    }
  }
}

function getMiniPinnedEventLabel(message: MessageItem) {
  const translationKey = message.systemEvent?.type === "message_unpinned"
    ? "navigation.chatWidget.userUnpinnedMessage"
    : "navigation.chatWidget.userPinnedMessage"
  return t(translationKey, {
    name: message.systemEvent?.actorName || message.authorName || t("navigation.chatWidget.pinnedUserFallback"),
  })
}

function getMiniPinnedMessage(session: MiniChatSessionView, messageId: number) {
  return session.thread.pinnedMessages.find(message => message.id === messageId)
}

async function toggleMiniMessagePinAction(session: MiniChatSessionView, message: MessageItem) {
  activeMiniReactionPickerId.value = null

  try {
    await toggleMiniMessagePin(session.contactId, message)
  }
  catch {
    toast.add({
      title: t("navigation.chatWidget.pinErrorTitle"),
      description: t("navigation.chatWidget.pinErrorDescription"),
      color: "error",
    })
  }
}

function hasMiniReplyFor(contactId: string) {
  return Boolean(miniReplyTarget.value && miniReplyContactId.value === contactId)
}

function clearMiniReply(contactId = miniReplyContactId.value) {
  if (!contactId || miniReplyContactId.value === contactId) {
    miniReplyTarget.value = null
    miniReplyContactId.value = ""
  }
}

function replyToMiniMessage(contactId: string, message: MessageItem) {
  if (message.isDeleted) {
    return
  }

  miniReplyTarget.value = message
  miniReplyContactId.value = contactId
  activeMiniReactionPickerId.value = null
}

function buildMiniReplyText(text: string, contactId: string) {
  if (!hasMiniReplyFor(contactId) || !miniReplyTarget.value) {
    return normalizeMiniMessageText(text)
  }

  const isImageReply = Boolean(
    miniReplyTarget.value.mediaUrl
    && (miniReplyTarget.value.mediaType === "image" || miniReplyTarget.value.mediaType === "gif"),
  )
  const source = normalizeMiniMessageText(
    isImageReply
      ? "Tin nhan"
      : getMessageReplyPreviewText(miniReplyTarget.value, {
          fallbackLabel: t("navigation.chatWidget.replyingToMessage"),
          locationTitle: miniReplyLocationTitle.value,
        }),
  )
  const snippet = source.length > 72 ? `${source.slice(0, 72)}...` : source
  const author = miniReplyAuthor.value || "Tin nhan"
  const payload = encodeURIComponent(JSON.stringify({
    author,
    quote: snippet,
    mediaUrl: isImageReply ? miniReplyTarget.value.mediaUrl : "",
    mediaType: isImageReply ? miniReplyTarget.value.mediaType : "",
    targetMessageId: miniReplyTarget.value.id,
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
        mediaUrl?: string
        mediaType?: MessageItem["mediaType"]
        targetMessageId?: number
      }
      const targetMessageId = Number(payload.targetMessageId)

      return {
        author: normalizeMiniMessageText(payload.author || ""),
        quote: normalizeMiniMessageText(payload.quote || ""),
        mediaUrl: payload.mediaUrl || "",
        mediaType: payload.mediaType || "",
        targetMessageId: Number.isInteger(targetMessageId) && targetMessageId > 0 ? targetMessageId : null,
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
    mediaUrl: "",
    mediaType: "",
    targetMessageId: null,
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

  const productMeta = getMiniProductMeta(message)

  if (productMeta) {
    return productMeta.body
  }

  if (getMessageLocationMeta(message)) {
    return ""
  }

  return normalizeMiniMessageText(message.text)
}

function getMiniProductMeta(message: MessageItem) {
  return getMessageProductMeta(message)
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

function isMiniImageFileQuote(value?: string) {
  return /\.(png|jpe?g|webp|bmp|gif)$/i.test(value || "")
}

function handleMiniEnterKey(event: KeyboardEvent, session: MiniChatSessionView) {
  if (event.isComposing) {
    return
  }
  submitMiniMessage(session)
}

function getLocationErrorMessage() {
  const keyByError = {
    unsupported: "pages.messagesPage.locationUnsupported",
    "insecure-context": "pages.messagesPage.locationInsecureContext",
    "permission-denied": "pages.messagesPage.locationPermissionDenied",
    unavailable: "pages.messagesPage.locationUnavailable",
    timeout: "pages.messagesPage.locationTimeout",
    unknown: "pages.messagesPage.locationUnknownError",
  } as const

  return locationError.value ? t(keyByError[locationError.value]) : ""
}

async function shareMiniLocation(session: MiniChatSessionView) {
  if (isLocating.value || session.isSending) {
    return
  }

  miniLocationContactId.value = session.contactId
  clearLocationError()

  try {
    const messageUrl = await createCurrentLocationMessage(
      t("pages.messagesPage.locationOwnTitle"),
    )

    if (!messageUrl) {
      toast.add({
        title: t("pages.messagesPage.locationErrorTitle"),
        description: getLocationErrorMessage(),
        color: "warning",
      })
      return
    }

    clearMiniReply(session.contactId)
    clearMiniProductDraft(session.contactId)
    await sendMiniMessage({
      contactId: session.contactId,
      textOverride: messageUrl,
    })
  }
  finally {
    miniLocationContactId.value = ""
  }
}

async function submitMiniMessage(session: MiniChatSessionView) {
  const contactId = session.contactId
  if (miniSubmittingMap.value[contactId]) {
    return
  }

  const trimmed = session.message.trim()
  const recordDraft = miniRecordDraftFor(contactId)
  if (!trimmed && !recordDraft && !session.attachFile) {
    return
  }

  miniSubmittingMap.value[contactId] = true

  const text = session.productDraft
    ? buildProductMessageText({
        text: trimmed,
        product: session.productDraft,
      })
    : buildMiniReplyText(trimmed, contactId)
  session.message = ""

  await sendMiniMessage({
    contactId: session.contactId,
    textOverride: text,
    record: recordDraft,
  })
  clearMiniProductDraft(contactId)
  clearMiniReply(contactId)
  clearMiniRecordingState(contactId)

  setTimeout(() => {
    miniSubmittingMap.value[contactId] = false
  }, 300)
}

async function sendProductSuggestion(session: MiniChatSessionView, suggestion: string) {
  const contactId = session.contactId

  if (
    miniSubmittingMap.value[contactId]
    || session.isSending
    || !session.productDraft
    || !suggestion.trim()
  ) {
    return
  }

  miniSubmittingMap.value[contactId] = true
  session.message = ""

  await sendMiniMessage({
    contactId,
    textOverride: buildProductMessageText({
      text: suggestion,
      product: session.productDraft,
    }),
  })

  clearMiniProductDraft(contactId)

  setTimeout(() => {
    miniSubmittingMap.value[contactId] = false
  }, 300)
}

async function sendMiniLike(session: MiniChatSessionView) {
  await sendMiniMessage({ contactId: session.contactId, textOverride: "\u{1F44D}" })
}

function handleMiniFileChange(session: MiniChatSessionView, event: Event) {
  if (miniRecordDraftFor(session.contactId) || isMiniRecordingFor(session.contactId)) {
    clearMiniRecordingState(session.contactId)
  }

  onMiniFile(event, session.contactId)
}

async function handleMiniRecordButton(session: MiniChatSessionView) {
  if (isMiniRecordingFor(session.contactId)) {
    await stopMiniRecording()
    return
  }

  if (isMiniRecording.value) {
    await stopMiniRecording()
  }
  clearMiniRecordingState()
  clearMiniFile(session.contactId)
  miniRecordingContactId.value = session.contactId
  const started = await startMiniRecording()
  if (!started) {
    miniRecordingContactId.value = ""
  }
}

function clearMiniRecordingState(contactId?: string) {
  if (contactId && miniRecordingContactId.value !== contactId) {
    return
  }
  clearMiniRecording()
  miniRecordingContactId.value = ""
}

function discardMiniRecording(contactId: string) {
  clearMiniRecordingState(contactId)
}

function setMiniMessagesViewport(contactId: string, element: unknown) {
  if (element instanceof HTMLElement) {
    miniMessagesViewports.set(contactId, element)
    if (!miniMessagesPinnedToBottom.has(contactId)) {
      miniMessagesPinnedToBottom.set(contactId, true)
    }
    return
  }

  miniMessagesViewports.delete(contactId)
}

async function handleMiniScroll(event: Event, session: MiniChatSessionView) {
  const target = event.target as HTMLElement
  const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight
  miniMessagesPinnedToBottom.set(
    session.contactId,
    distanceFromBottom <= MINI_MESSAGES_BOTTOM_THRESHOLD,
  )

  if (target.scrollTop === 0 && !session.isLoadingMore) {
    const previousScrollHeight = target.scrollHeight
    await loadOlderMiniMessages(session.contactId)
    await nextTick()
    target.scrollTop = target.scrollHeight - previousScrollHeight
    miniMessagesPinnedToBottom.set(session.contactId, false)
  }
}

function scrollMiniMessagesToBottom(contactId?: string) {
  const viewports = contactId
    ? miniMessagesViewports.get(contactId)
      ? [miniMessagesViewports.get(contactId) as HTMLElement]
      : []
    : [...miniMessagesViewports.values()]

  for (const viewport of viewports) {
    viewport.scrollTop = viewport.scrollHeight
  }

  if (contactId) {
    miniMessagesPinnedToBottom.set(contactId, true)
  }
  else {
    for (const sessionContactId of miniMessagesViewports.keys()) {
      miniMessagesPinnedToBottom.set(sessionContactId, true)
    }
  }
}

async function scrollToMiniReplyTarget(contactId: string, messageId: number) {
  const viewport = miniMessagesViewports.get(contactId)

  if (!viewport) {
    return
  }

  let target = viewport.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`)

  for (let attempt = 0; !target && attempt < 8; attempt += 1) {
    const session = miniChatSessions.value.find(item => item.contactId === contactId)
    const previousFirstId = session?.messages[0]?.id
    const previousCount = session?.messages.length ?? 0

    await loadOlderMiniMessages(contactId)
    await nextTick()
    target = viewport.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`)

    const updatedSession = miniChatSessions.value.find(item => item.contactId === contactId)
    if (
      !target
      && updatedSession?.messages[0]?.id === previousFirstId
      && updatedSession?.messages.length === previousCount
    ) {
      break
    }
  }

  if (!target) {
    return
  }

  target.scrollIntoView({ behavior: "smooth", block: "center" })
  highlightedMiniMessageKey.value = `${contactId}:${messageId}`

  if (miniHighlightTimer) {
    clearTimeout(miniHighlightTimer)
  }
  miniHighlightTimer = setTimeout(() => {
    highlightedMiniMessageKey.value = ""
    miniHighlightTimer = undefined
  }, 1800)
}

watch(
  () => ({
    open: miniChatOpen.value,
    sessions: miniChatSessions.value.map((session) => {
      const lastMessage = session.messages[session.messages.length - 1]

      return {
        contactId: session.contactId,
        lastMessageId: lastMessage?.id ?? null,
        lastMessageIsMine: Boolean(lastMessage?.isMine),
      }
    }),
  }),
  async (current, previous) => {
    if (!current.open) {
      return
    }

    await nextTick()

    if (!previous?.open) {
      scrollMiniMessagesToBottom()
      return
    }

    for (const session of current.sessions) {
      const previousSession = previous.sessions.find(item => item.contactId === session.contactId)
      const receivedInitialThread = previousSession?.lastMessageId == null && session.lastMessageId != null
      const receivedNewLastMessage = previousSession?.lastMessageId != null
        && previousSession.lastMessageId !== session.lastMessageId

      if (
        receivedInitialThread
        || (receivedNewLastMessage && (
          session.lastMessageIsMine
          || miniMessagesPinnedToBottom.get(session.contactId) !== false
        ))
      ) {
        scrollMiniMessagesToBottom(session.contactId)
      }
    }
  },
  { flush: "post" },
)

watch(miniChatAutoOpenVersion, (version) => {
  if (version > 0) {
    activeMiniHeaderContactId.value = null
    clearMiniReply()
    activeMiniReactionPickerId.value = null
    clearMiniRecordingState()
    nextTick(() => {
      const openedSession = miniChatSessions.value[0]
      if (openedSession) {
        scrollMiniMessagesToBottom(openedSession.contactId)
      }
    })
  }
})
</script>

<style scoped>
.chat-widget {
  position: relative;
  z-index: 0;
  display: flex;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  width: 100%;
  flex-direction: column;
  overflow: visible;
}

.chat-widget--collapsed {
  height: auto;
  max-height: none;
  flex: 0 0 auto;
}

.chat-widget__body {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: visible;
}

.chat-widget__toggle-btn {
  box-sizing: border-box;
  margin-left: 2px;
  padding: 0;
  border-left: 1px solid var(--border-light);
}

.chat-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.chat-widget__title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.chat-widget__online {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.chat-widget__online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
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
  background: var(--bg-muted);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.chat-widget__header-btn:hover {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
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
  gap: 2px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
  background: var(--bg-surface);
}

.chat-widget__tab {
  flex: 1;
  min-width: 0;
  min-height: 36px;
  justify-content: center;
  gap: 6px;
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.chat-widget__tab--active {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
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
  background: var(--bg-muted);
}

.chat-widget__content--directory {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  background: var(--bg-surface);
}

.chat-widget__directory-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.chat-widget__directory-scroll::-webkit-scrollbar {
  width: 5px;
}

.chat-widget__directory-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--icon-secondary);
}

.chat-widget__send-scroll {
  width: 100%;
  min-height: 0;
  min-width: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-anchor: none;
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
  background: var(--color-secondary-300);
}

.chat-widget__send-card {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  padding: 12px;
  box-shadow: var(--shadow-sm);
}

.chat-widget__send-card + .chat-widget__send-card {
  margin-top: 12px;
}

.chat-widget__compose-card,
.chat-widget__users-card {
  display: grid;
  min-width: 0;
  gap: 10px;
}

.chat-widget__compose-card > *,
.chat-widget__users-card > * {
  min-width: 0;
  max-width: 100%;
}

.chat-widget__section-title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-body);
  font-weight: var(--weight-bold);
  line-height: 1.35;
}

.chat-widget__compose-card .chat-widget__field,
.chat-widget__compose-card .chat-widget__composer-tools,
.chat-widget__compose-card .chat-widget__recipient-box,
.chat-widget__compose-card .chat-widget__recipient-heading {
  margin: 0;
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
  color: var(--text-primary);
}

.chat-widget__field-label--inline {
  margin-bottom: 0;
}

.chat-widget__recipient-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.chat-widget__selected-count {
  display: inline-flex;
  max-width: 100%;
  min-height: 22px;
  flex-shrink: 0;
  align-items: center;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bg-surface);
  padding: 3px 8px;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: var(--weight-bold);
  line-height: 1;
  overflow-wrap: anywhere;
}

.chat-widget__select-all {
  max-width: 100%;
  width: fit-content;
  flex-shrink: 0;
}

.chat-widget__recipient-box {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: 122px;
  min-height: 122px;
  box-sizing: border-box;
  overflow: hidden;
  margin-top: 10px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  padding: 7px;
}

.chat-widget__recipient-box--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  background: var(--bg-muted);
  padding: 10px 12px;
}

.chat-widget__recipient-listbox {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  scrollbar-gutter: stable;
}

.chat-widget__selected-recipient-row {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.chat-widget__remove-recipient {
  flex: 0 0 auto;
}

.chat-widget__recipient-empty {
  color: var(--text-tertiary);
  font-size: 12px;
}

.chat-widget__selected-target {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  border-radius: 14px;
  border: 1px solid var(--border-light);
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
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
  color: var(--text-primary);
}

.chat-widget__selected-target-meta,
.chat-widget__suggestion-meta {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-secondary);
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
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 9px 10px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.chat-widget__suggestion:hover {
  background: var(--bg-muted);
  border-color: var(--border-light);
}

.chat-widget__suggestion--selected {
  border-color: var(--border-light);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

.chat-widget__tag-filter {
  padding-top: 2px;
}

.chat-widget__users-listbox {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.chat-widget__users-listbox :deep([data-slot="content"]) {
  overscroll-behavior-y: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  touch-action: pan-y;
}

.chat-widget__users-listbox :deep([data-slot="content"]::-webkit-scrollbar) {
  width: 5px;
}

.chat-widget__users-listbox :deep([data-slot="content"]::-webkit-scrollbar-thumb) {
  border-radius: 999px;
  background: var(--color-secondary-300);
}

.chat-widget__candidate-row {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 8px;
}

.chat-widget__candidate-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.chat-widget__select-state {
  white-space: nowrap;
}

.chat-widget__open-chat {
  min-width: 66px;
  flex: 0 0 auto;
  justify-content: center;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.chat-widget__user-skeleton {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 10px;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  padding: 10px;
}

.chat-widget__composer-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.chat-widget__compose-card .chat-widget__composer-tools {
  margin-top: 0;
}

.chat-widget__attach-btn {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bg-muted);
  padding: 7px 12px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s ease;
}

.chat-widget__attach-btn:hover {
  border-color: var(--border-light);
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
  color: var(--bg-brand);
}

.chat-widget__file-name {
  min-width: 0;
  flex: 1;
  font-size: 11px;
  color: var(--text-secondary);
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
  background: var(--bg-muted);
  color: var(--text-secondary);
  cursor: pointer;
}

.chat-widget__send-btn {
  width: 100%;
  justify-content: center;
  border-radius: 12px;
  padding-block: 11px;
}

.chat-widget__compose-card .chat-widget__send-btn {
  margin-top: 0;
}

.chat-widget__send-actions {
  flex-shrink: 0;
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
  padding: 10px 12px 12px;
}

.chat-widget__send-actions--inline {
  border-top: 0;
  background: transparent;
  padding: 0 0 12px;
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
  color: var(--text-tertiary);
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

.chat-widget__directory-list {
  gap: 1px;
  padding: 8px 0;
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
  min-height: 48px;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: none;
  background: transparent;
  padding: 6px 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.chat-widget__contact:hover,
.chat-widget__contact:focus-visible {
  background: var(--bg-muted);
  outline: none;
}

.chat-widget__contact-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.chat-widget__contact-name {
  min-width: 0;
  flex: 1;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-widget__contact-actions,
.chat-widget__contact-tags {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 3px;
}

.chat-widget__contact-actions {
  gap: 5px;
}

.chat-widget__contact-tag-color {
  display: inline-flex;
  width: 18px;
  height: 18px;
  border: 1px solid var(--border-light);
  border-radius: 5px;
}

.chat-widget__contact-tag-more {
  display: inline-flex;
  min-width: 20px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 5px;
  background: var(--bg-muted);
  padding: 0 4px;
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: var(--weight-bold);
  line-height: 1;
}

.chat-widget__contact-presence-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--color-secondary-300);
}

.chat-widget__contact-presence-dot--online {
  background: var(--color-success);
}

.chat-widget__contact-tag-btn {
  width: 30px;
  height: 30px;
  min-width: 30px;
  min-height: 30px;
  justify-content: center;
  border-radius: var(--radius-md);
  padding: 0;
}

.chat-widget__group-icon {
  display: flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.chat-widget__group-icon--large {
  width: 36px;
  height: 36px;
  border-radius: 999px;
}

.chat-widget__directory-list .chat-widget__group-icon--large {
  background: color-mix(in srgb, var(--bg-brand) 12%, var(--bg-surface));
  color: var(--icon-brand);
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
  flex-shrink: 0;
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
  padding: 8px 10px 10px;
}

.chat-widget__footer-input {
  width: 100%;
}

:deep(.chat-widget__footer-input-control) {
  width: 100%;
  height: 38px;
  border: 1px solid var(--border-light) !important;
  border-radius: var(--radius-sm) !important;
  background: var(--bg-muted) !important;
  color: var(--text-primary);
  font-size: 14px;
  box-shadow: none !important;
}

:deep(.chat-widget__footer-input-control:focus) {
  border-color: var(--border-light) !important;
  background: var(--bg-surface) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 6%, transparent) !important;
}

:deep(.chat-widget__footer-input-control::placeholder) {
  color: var(--text-tertiary);
}

.chat-widget__mini {
  position: absolute;
  right: calc(100% + 12px);
  bottom: 0;
  z-index: 60;
  display: flex;
  width: min(350px, calc(100vw - 32px));
  max-height: min(560px, calc(100dvh - 112px));
  min-height: 0;
  flex-direction: column;
  overflow: visible;
  border-radius: 18px;
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  box-shadow: var(--shadow-xl);
}

.chat-widget__mini--2 {
  right: calc(100% + 374px);
  z-index: 59;
}

.chat-widget__mini-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-light);
  border-radius: 18px 18px 0 0;
  background: var(--bg-muted);
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
  border: none;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  cursor: pointer;
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
  color: var(--text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-status {
  display: block;
  max-width: 100%;
  margin-top: 2px;
  overflow: hidden;
  font-size: 11px;
  color: var(--text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-menu {
  position: absolute;
  top: 26px;
  right: calc(100% - 50px);
  z-index: 70;
  width: min(390px, calc(100vw - 24px));
  max-height: min(520px, calc(100dvh - 88px));
  overflow: visible;
  border-radius: 14px 0 14px 14px;
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  padding: 9px 16px 11px;
  box-shadow: var(--shadow-xl);
}

.chat-widget__mini-menu::before {
  position: absolute;
  top: 0;
  right: -17px;
  display: block;
  width: 0;
  height: 0;
  border-top: 18px solid var(--bg-surface);
  border-right: 18px solid transparent;
  content: "";
  filter: drop-shadow(var(--shadow-sm));
  pointer-events: none;
}

.chat-widget__mini-menu-section {
  position: relative;
  display: grid;
  gap: 2px;
  padding: 5px 0;
}

.chat-widget__mini-menu-section + .chat-widget__mini-menu-section {
  border-top: 1px solid var(--border-light);
  margin-top: 6px;
  padding-top: 10px;
}

.chat-widget__mini-menu-item {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 15px;
  border: none;
  border-radius: 8px;
  background: transparent;
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 750;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
}

.chat-widget__mini-menu-item > .iconify {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  color: var(--icon-primary);
}

.chat-widget__mini-menu-item:hover {
  background: var(--bg-muted);
  color: var(--bg-brand);
}

.chat-widget__mini-menu-item--muted {
  cursor: default;
  background: var(--bg-muted);
  color: var(--text-primary);
}

.chat-widget__mini-menu-item--muted:hover {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.chat-widget__mini-menu-item--danger {
  color: var(--text-danger);
}

.chat-widget__mini-menu-item--danger:hover {
  background: color-mix(in srgb, var(--color-error) 12%, var(--bg-surface));
  color: var(--text-brand);
}

.chat-widget__mini-messages {
  width: 100%;
  min-height: 0;
  flex: 1;
  max-height: none;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  padding: 14px;
  background: var(--bg-surface);
}

.chat-widget__mini-thread {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.chat-widget__mini-message {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  padding-inline-end: 38px;
}

.chat-widget__mini-message--mine {
  align-items: flex-end;
  padding-inline: 38px 0;
}

.chat-widget__mini-message--system,
.chat-widget__mini-message--mine.chat-widget__mini-message--system {
  align-items: center;
  padding-inline: 0;
}

.chat-widget__mini-pin-event {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 999px;
  background: var(--bg-muted);
  padding: 6px 11px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 650;
  line-height: 1.3;
  text-align: center;
}

.chat-widget__mini-pin-event svg {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  color: var(--color-primary);
}

.chat-widget__mini-message--product {
  padding-inline-end: 20px;
}

.chat-widget__mini-message--mine.chat-widget__mini-message--product {
  padding-inline: 20px 0;
}

.chat-widget__mini-message--location,
.chat-widget__mini-message--mine.chat-widget__mini-message--location {
  padding-inline: 0;
}

.chat-widget__mini-message--order,
.chat-widget__mini-message--mine.chat-widget__mini-message--order {
  padding-inline: 0;
}

.chat-widget__mini-message--voice,
.chat-widget__mini-message--mine.chat-widget__mini-message--voice {
  padding-inline: 0;
}

.chat-widget__mini-chat-bubble--deleted :deep(.chat-bubble) {
  background: var(--bg-muted) !important;
  color: var(--text-secondary) !important;
  font-style: italic;
}

.chat-widget__mini-chat-bubble--deleted :deep(.chat-bubble__text) {
  color: inherit !important;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__wrapper) {
  width: fit-content;
  max-width: min(80%, 310px) !important;
  min-width: 0;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__wrapper--location) {
  width: 300px !important;
  max-width: calc(100% - 44px) !important;
  flex: 0 1 300px;
}

.chat-widget__mini-chat-bubble :deep(.message-location-card) {
  width: 100% !important;
  max-width: 100%;
}

.chat-widget__mini-chat-bubble :deep(.message-location-card__map) {
  height: 126px;
}

.chat-widget__mini-chat-bubble :deep(.message-location-card__footer) {
  min-height: 62px;
  padding: 10px 12px;
}

.chat-widget__mini-chat-bubble :deep(.message-location-card__copy strong) {
  font-size: 14px;
}

.chat-widget__mini-chat-bubble :deep(.message-location-card__copy small) {
  font-size: 11px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__wrapper--product) {
  width: min(272px, 100%);
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__wrapper--order) {
  width: min(280px, calc(100% - 24px)) !important;
  max-width: calc(100% - 24px) !important;
  flex: 0 1 280px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__wrapper--voice) {
  width: min(280px, calc(100% - 24px)) !important;
  max-width: calc(100% - 24px) !important;
  flex: 0 1 280px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble) {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__wrapper--shared-post) {
  width: min(235px, calc(100% - 26px)) !important;
  max-width: min(235px, calc(100% - 26px)) !important;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble--shared-post) {
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
}

.chat-widget__mini-message--highlighted :deep(.chat-bubble__wrapper) {
  animation: mini-reply-target-pulse 1.8s ease-out;
}

@keyframes mini-reply-target-pulse {
  0%, 100% {
    filter: none;
  }
  18%, 55% {
    filter: drop-shadow(0 0 7px color-mix(in srgb, var(--bg-brand) 38%, transparent));
  }
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
  color: var(--text-secondary);
}

.chat-widget__mini-bubble--sent {
  background: var(--bg-brand);
  color: var(--color-on-brand);
  border-bottom-right-radius: 5px;
}

.chat-widget__mini-bubble--received {
  background: var(--bg-muted);
  color: var(--text-primary);
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
  border-radius:0 0 18px 18px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
  padding: 10px 12px 12px;
}

.chat-widget__mini-draft {
  display: grid;
  flex-shrink: 0;
  gap: 6px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
  padding: 8px 12px 0;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__product-card) {
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 8px;
  border-radius: 10px;
  padding: 6px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__product-media) {
  width: 46px;
  height: 46px;
  border-radius: 8px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__product-copy) {
  gap: 3px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__product-copy strong) {
  font-size: 12px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__product-copy span) {
  font-size: 13px;
}

.chat-widget__mini-chat-bubble :deep(.chat-bubble__product-card + .chat-bubble__text) {
  margin-top: 8px;
  padding-inline: 2px;
}

.chat-widget__mini-product-draft {
  display: grid;
  min-width: 0;
  grid-template-columns: 52px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-muted);
  padding: 7px;
}

.chat-widget__mini-product-image {
  display: flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 9px;
  background: var(--bg-surface-active);
  color: var(--icon-brand);
}

.chat-widget__mini-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-widget__mini-product-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.chat-widget__mini-product-copy strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-product-copy span {
  color: var(--color-primary-600, var(--bg-brand));
  font-size: 12px;
  font-weight: 800;
}

.chat-widget__product-suggestions {
  display: grid;
  gap: 6px;
  padding: 2px 0 4px;
}

.chat-widget__product-suggestions-title {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 2px 1px;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.chat-widget__product-suggestions-title .iconify {
  color: var(--icon-brand);
}

.chat-widget__product-suggestion {
  display: flex;
  width: 100%;
  min-height: 34px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-surface);
  padding: 7px 9px;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  text-align: left;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.chat-widget__product-suggestion:hover:not(:disabled),
.chat-widget__product-suggestion:focus-visible:not(:disabled) {
  border-color: var(--border-light);
  background: var(--bg-surface-hover);
  color: var(--bg-brand);
  transform: translateY(-1px);
}

.chat-widget__product-suggestion:disabled {
  cursor: wait;
  opacity: 0.55;
}

.chat-widget__mini-reply-preview,
.chat-widget__mini-file-preview {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  background: var(--bg-muted);
  padding: 9px 10px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.chat-widget__mini-reply-preview {
  min-height: 54px;
  align-items: center;
  justify-content: space-between;
  border-radius: 0;
  background: var(--bg-surface);
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
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__mini-reply-image {
  width: 46px;
  height: 46px;
  margin-top: 2px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  object-fit: cover;
}

.chat-widget__mini-reply-copy span,
.chat-widget__mini-file-preview span {
  min-width: 0;
  overflow: hidden;
  color: var(--text-secondary);
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
  color: var(--text-secondary);
}

.chat-widget__mini-preview-clear:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
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
  background: var(--bg-muted);
  color: var(--text-primary);
  transition: all 0.15s ease;
}

.chat-widget__mini-tool-btn:hover,
.chat-widget__mini-like-btn:hover {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
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
  background: color-mix(in srgb, var(--color-error) 12%, var(--bg-surface));
  color: var(--text-danger);
}

.chat-widget__mini-input {
  min-width: 0;
  flex: 1;
}

.chat-widget__mini-input-shell {
  position: relative;
  min-width: 0;
  flex: 1;
}

:deep(.chat-widget__mini-input-control) {
  width: 100%;
  height: 42px;
  border: 1px solid var(--border-light) !important;
  border-radius: 999px !important;
  background: var(--bg-muted) !important;
  padding: 0 46px 0 16px !important;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  box-shadow: none !important;
  outline: none;
}

:deep(.chat-widget__mini-input-control:focus) {
  border-color: var(--border-light) !important;
  background: var(--bg-surface) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 6%, transparent) !important;
}

:deep(.chat-widget__mini-input-control::placeholder) {
  color: var(--text-tertiary);
  font-weight: 600;
}

.chat-widget__mini-send-btn {
  position: absolute;
  top: 50%;
  right: 4px;
  display: inline-flex;
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px !important;
  background: transparent !important;
  color: var(--ui-primary) !important;
  cursor: pointer;
  box-shadow: none !important;
  transform: translateY(-50%);
}

.chat-widget__mini-send-icon {
  width: 19px;
  height: 19px;
}

.chat-widget__mini-send-btn:disabled {
  color: color-mix(in srgb, var(--ui-primary) 42%, transparent) !important;
  cursor: default;
  opacity: 1;
}

.chat-widget__mini-launcher {
  position: absolute;
  right: 14px;
  bottom: 72px;
  z-index: 60;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-lg);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.chat-widget__mini-launcher:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-xl);
}

.chat-widget__mini-launcher-group {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
  color: var(--bg-brand);
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
  box-shadow: 0 0 0 2.5px color-mix(in srgb, var(--bg-brand) 22%, transparent);
}

:deep(.chat-widget__mini-input-control:focus) {
  border-color: var(--border-light) !important;
  background: var(--bg-surface) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 6%, transparent) !important;
}

:deep(.chat-widget__mini-input-control::placeholder) {
  color: var(--text-tertiary);
  font-weight: 600;
}

.chat-widget__mini-send-btn {
  position: absolute !important;
  top: 50% !important;
  right: 4px !important;
  display: inline-flex;
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px !important;
  background: transparent !important;
  color: var(--ui-primary) !important;
  cursor: pointer;
  box-shadow: none !important;
  transform: translateY(-50%);
}

.chat-widget__mini-send-icon {
  width: 19px;
  height: 19px;
}

.chat-widget__mini-send-btn:disabled {
  color: color-mix(in srgb, var(--ui-primary) 42%, transparent) !important;
  cursor: default;
  opacity: 1;
}

.chat-widget__mini-launcher {
  position: absolute;
  right: 14px;
  bottom: 72px;
  z-index: 60;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-lg);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.chat-widget__mini-launcher--2 {
  bottom: 128px;
}

.chat-widget__mini-launcher:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-xl);
}

.chat-widget__mini-launcher-group {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
  color: var(--bg-brand);
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
  box-shadow: 0 0 0 2.5px color-mix(in srgb, var(--bg-brand) 22%, transparent);
}

.chat-widget__message-avatar-menu {
  width: min(270px, calc(100vw - 24px));
  border: 1px solid var(--border-light);
  border-radius: 13px 13px 13px 0;
  background: var(--bg-surface);
  padding: 8px;
  box-shadow: var(--shadow-xl);
  transform-origin: top left;
}

.chat-widget__message-avatar-menu::after {
  position: absolute;
  left: 0;
  bottom: -12px;
  width: 0;
  height: 0;
  border-top: 13px solid var(--bg-surface);
  border-right: 18px solid transparent;
  content: "";
}

.chat-widget__message-avatar-menu-item {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 750;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.chat-widget__message-avatar-menu-item > .iconify {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  color: var(--text-primary);
}

.chat-widget__message-avatar-menu-item:hover {
  background: var(--bg-muted);
}

.chat-widget__message-avatar-menu-item--danger:hover {
  color: var(--text-danger);
}

.chat-widget__image-preview-container {
  position: relative;
  display: inline-flex;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  overflow: visible;
  padding: 4px;
  background: var(--bg-surface);
  margin-left: 8px;
}

.chat-widget__image-preview {
  max-width: 60px;
  max-height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.chat-widget__image-preview-clear {
  position: absolute;
  top: -8px;
  right: -8px;
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-danger);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}

.chat-widget__image-preview-clear:hover {
  background: color-mix(in srgb, var(--color-error) 10%, var(--bg-surface));
  color: var(--text-danger);
}

.chat-widget__mini-file-preview-container {
  display: flex;
  width: 100%;
}

.chat-widget__mini-image-preview-wrapper {
  position: relative;
  display: inline-flex;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  overflow: visible;
  padding: 4px;
  background: var(--bg-surface);
}

.chat-widget__mini-image-preview {
  max-width: 50px;
  max-height: 50px;
  object-fit: cover;
  border-radius: 6px;
}

.chat-widget__mini-image-preview-clear {
  position: absolute;
  top: -8px;
  right: -8px;
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-danger);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}

.chat-widget__mini-image-preview-clear:hover {
  background: color-mix(in srgb, var(--color-error) 10%, var(--bg-surface));
  color: var(--text-danger);
}

</style>

<style>
/* Keep the collapsed widget docked at the bottom of the right sidebar. */
div:has(> .chat-widget--collapsed) {
  flex: 0 0 auto !important;
  height: auto !important;
  margin-top: auto !important;
}
</style>
