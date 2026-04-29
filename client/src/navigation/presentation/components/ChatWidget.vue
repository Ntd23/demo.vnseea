<template>
  <div class="chat-widget">
    <!-- Header -->
    <div class="chat-widget__header">
      <div>
        <span class="chat-widget__title">{{ $t("navigation.chatWidget.title") }}</span>
        <div class="chat-widget__online">
          <div class="chat-widget__online-dot" />
          <span>{{ $t("navigation.chatWidget.onlineCount", { count: onlineCount }) }}</span>
        </div>
      </div>
      <div class="chat-widget__header-actions">
        <button class="chat-widget__header-btn" type="button" :title="$t('navigation.chatWidget.actionCreateGroup')">
          <Icon name="i-ph-user-plus-duotone" class="h-4 w-4" />
        </button>
        <button class="chat-widget__header-btn" type="button" :title="$t('navigation.chatWidget.actionSettings')">
          <Icon name="i-ph-gear-duotone" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="chat-widget__tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.value"
        class="chat-widget__tab"
        :class="{ 'chat-widget__tab--active': tabIndex === index }"
        type="button"
        @click="tabIndex = index"
      >
        <Icon :name="tabIndex === index ? tab.icon.replace('-duotone', '-fill') : tab.icon" class="h-4 w-4" />
        <span>{{ $t(tab.label) }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="chat-widget__content">
      <!-- Send Message Tab -->
      <div v-if="activeTab === 'send'" class="chat-widget__send">
        <div class="chat-widget__field">
          <label class="chat-widget__field-label">{{ $t("navigation.chatWidget.sendToLabel") }}</label>
          <input
            v-model="sendTo"
            class="chat-widget__input"
            :placeholder="$t('navigation.chatWidget.recipientPlaceholder')"
            type="text"
          >
        </div>

        <div class="chat-widget__field">
          <textarea
            v-model="sendMessage"
            class="chat-widget__textarea"
            rows="3"
            :placeholder="$t('navigation.chatWidget.messagePlaceholder')"
          />
        </div>

        <div class="chat-widget__field">
          <label class="chat-widget__field-label">{{ $t("navigation.chatWidget.attachLabel") }}</label>
          <label class="chat-widget__file-picker">
            <Icon name="i-ph-paperclip-bold" class="h-4 w-4" />
            <span>{{ $t("navigation.chatWidget.chooseFile") }}</span>
            <input class="hidden" type="file" @change="onFile">
          </label>
          <span v-if="attachFile" class="chat-widget__file-name">{{ attachFile.name }}</span>
        </div>

        <button class="chat-widget__send-btn" type="button">
          <Icon name="i-ph-paper-plane-right-fill" class="h-4 w-4" />
          {{ $t("navigation.chatWidget.sendMessage") }}
        </button>
      </div>

      <!-- Contacts Tab -->
      <div v-else-if="activeTab === 'contacts'" class="chat-widget__list">
        <button
          v-for="contact in extendedContacts"
          :key="contact.id"
          class="chat-widget__contact"
          type="button"
          @click="openMiniChat(contact)"
        >
          <div class="chat-widget__contact-avatar-wrap">
            <img v-if="contact.avatarUrl" :src="contact.avatarUrl" class="chat-widget__contact-img">
            <div v-else class="chat-widget__contact-initials" :style="{ background: avatarColor(contact.id) }">{{ contact.avatar }}</div>
            <div class="chat-widget__contact-status" :class="{ 'chat-widget__contact-status--online': contact.online }" />
          </div>
          <div class="chat-widget__contact-info">
            <div class="chat-widget__contact-name-row">
              <span class="chat-widget__contact-name">{{ contact.name }}</span>
              <span v-if="contact.online" class="chat-widget__contact-live">Live</span>
            </div>
            <p class="chat-widget__contact-status-text">{{ contact.status || $t("navigation.chatWidget.readyToChat") }}</p>
          </div>
        </button>
      </div>

      <!-- Groups Tab -->
      <div v-else-if="activeTab === 'groups'" class="chat-widget__list">
        <button
          v-for="group in groups"
          :key="group.id"
          class="chat-widget__contact"
          type="button"
          @click="openMiniGroup(group)"
        >
          <div class="chat-widget__group-icon">
            <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
          </div>
          <div class="chat-widget__contact-info">
            <span class="chat-widget__contact-name">{{ group.name }}</span>
            <p class="chat-widget__contact-status-text">{{ $t("navigation.chatWidget.groupMembers", { count: group.members }) }} members</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Search Footer -->
    <div class="chat-widget__footer">
      <div class="chat-widget__search-wrap">
        <Icon name="i-ph-magnifying-glass" class="chat-widget__search-icon" />
        <input
          v-model="search"
          class="chat-widget__search-input"
          :placeholder="$t('navigation.chatWidget.searchPlaceholder')"
          type="text"
        >
      </div>
    </div>

    <!-- Mini Chat Overlay -->
    <Transition 
      enter-active-class="transition duration-300 ease-out" 
      enter-from-class="opacity-0 translate-y-8 scale-95" 
      enter-to-class="opacity-100 translate-y-0 scale-100" 
      leave-active-class="transition duration-200 ease-in" 
      leave-from-class="opacity-100 translate-y-0 scale-100" 
      leave-to-class="opacity-0 translate-y-8 scale-95"
    >
      <div v-if="miniChat.open" class="chat-widget__mini">
        <div class="chat-widget__mini-header">
          <div>
            <p class="chat-widget__mini-title">{{ miniChat.title }}</p>
            <div class="chat-widget__online" style="margin-top: 2px;">
              <div class="chat-widget__online-dot" />
              <span style="font-size: 10px; color: #0ea5e9;">{{ $t("navigation.chatWidget.miniChatActive") }}</span>
            </div>
          </div>
          <button class="chat-widget__header-btn" type="button" @click="miniChat.open = false">
            <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
          </button>
        </div>

        <div class="chat-widget__mini-messages">
          <div class="chat-widget__mini-row chat-widget__mini-row--sent">
            <div class="chat-widget__mini-bubble chat-widget__mini-bubble--sent">{{ miniSample }}</div>
          </div>
          <div class="chat-widget__mini-row chat-widget__mini-row--received">
            <div class="chat-widget__mini-bubble chat-widget__mini-bubble--received">{{ miniReply }}</div>
          </div>
        </div>

        <div class="chat-widget__mini-input-wrap">
          <input 
            v-model="miniChat.message" 
            class="chat-widget__mini-input" 
            :placeholder="$t('navigation.chatWidget.miniInputPlaceholder')" 
            type="text"
            @keyup.enter="miniChat.message = ''"
          >
          <button class="chat-widget__mini-send" type="button">
            <Icon name="i-ph-paper-plane-right-fill" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMockSocialData } from "../../../feed/application/composables/useMockSocialData"

const { t } = useI18n()

const { contacts } = useMockSocialData()

const tabIndex = ref(0)
const tabs = [
  { value: 'send', icon: 'i-ph-paper-plane-right-duotone', label: 'navigation.chatWidget.tabSend' },
  { value: 'contacts', icon: 'i-ph-address-book-duotone', label: 'navigation.chatWidget.tabContacts' },
  { value: 'groups', icon: 'i-ph-users-three-duotone', label: 'navigation.chatWidget.tabGroups' },
]

const activeTab = computed(() => tabs[tabIndex.value].value)

const search = ref('')
const sendTo = ref('')
const sendMessage = ref('')
const attachFile = ref<File | null>(null)
const onlineCount = computed(() => contacts.filter(c => c.online).length)

const groups = [
  { id: 1, name: 'Core Design Team', members: 12 },
  { id: 2, name: 'VNSEEA Marketplace', members: 8 },
  { id: 3, name: 'Community Support', members: 45 },
]

const extendedContacts = computed(() => contacts.map((c, i) => {
  let img = ''
  if (c.name === 'Xu Nguyễn') img = 'https://i.pravatar.cc/150?u=1'
  if (i === 1) img = 'https://i.pravatar.cc/150?u=2'
  if (i === 2) img = 'https://i.pravatar.cc/150?u=3'
  if (i === 4) img = 'https://i.pravatar.cc/150?u=4'
  if (i === 5) img = 'https://i.pravatar.cc/150?u=5'
  return { ...c, avatarUrl: img, status: c.online ? t('navigation.chatWidget.onlineStatus') : t('navigation.chatWidget.offlineToday') }
}))

const palette = ['#4f46e5', '#3b82f6', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
function avatarColor(id: number) { return palette[(id - 1) % palette.length] }

const miniChat = reactive<{ open: boolean; title: string; message: string; kind: 'direct' | 'group' }>({
  open: false,
  title: '',
  message: '',
  kind: 'direct',
})

const miniSample = computed(() =>
  miniChat.kind === 'group' ? t('navigation.chatWidget.miniGroupSample') : t('navigation.chatWidget.miniChatSample'),
)

const miniReply = computed(() =>
  miniChat.kind === 'group' ? t('navigation.chatWidget.miniGroupReply') : t('navigation.chatWidget.miniChatReply'),
)

const openMiniChat = (contact: any) => {
  miniChat.title = contact.name
  miniChat.kind = 'direct'
  miniChat.open = true
}
const openMiniGroup = (group: any) => {
  miniChat.title = group.name
  miniChat.kind = 'group'
  miniChat.open = true
}

const onFile = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) attachFile.value = f
}
</script>

<style scoped>
.chat-widget {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Header */
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

.chat-widget__header-actions {
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

/* Tabs */
.chat-widget__tabs {
  display: flex;
  gap: 2px;
  padding: 6px 12px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.chat-widget__tab {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  justify-content: center;
  padding: 7px 6px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chat-widget__tab:hover {
  background: #f8fafc;
  color: #475569;
}

.chat-widget__tab--active {
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
  font-weight: 700;
}

/* Content */
.chat-widget__content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}

.chat-widget__content::-webkit-scrollbar {
  display: none;
}

/* Send tab */
.chat-widget__send {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}

.chat-widget__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-widget__field-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.chat-widget__input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fafbfe;
  font-size: 13px;
  color: #334155;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.chat-widget__input:focus {
  border-color: rgba(0, 0, 255, 0.25);
}

.chat-widget__textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fafbfe;
  font-size: 13px;
  color: #334155;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.chat-widget__textarea:focus {
  border-color: rgba(0, 0, 255, 0.25);
}

.chat-widget__file-picker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  background: #fafbfe;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chat-widget__file-picker:hover {
  color: #0000ff;
}

.chat-widget__file-name {
  font-size: 11px;
  color: #64748b;
  font-style: italic;
}

.chat-widget__send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 255, 0.2);
  transition: all 0.15s ease;
}

.chat-widget__send-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 255, 0.28);
  transform: translateY(-1px);
}

.chat-widget__send-btn:active {
  transform: scale(0.98);
}

/* Contact list */
.chat-widget__list {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.chat-widget__contact {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;
  width: 100%;
}

.chat-widget__contact:hover {
  background: #f8fafc;
}

.chat-widget__contact-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.chat-widget__contact-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-widget__contact-initials {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
}

.chat-widget__contact-status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background: #cbd5e1;
}

.chat-widget__contact-status--online {
  background: #0ea5e9;
  box-shadow: 0 0 6px rgba(14, 165, 233, 0.4);
}

.chat-widget__contact-info {
  min-width: 0;
  flex: 1;
}

.chat-widget__contact-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-widget__contact-name {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__contact-live {
  display: inline-flex;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 255, 0.08);
  font-size: 9px;
  font-weight: 700;
  color: #0000ff;
}

.chat-widget__contact-status-text {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-widget__group-icon {
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

/* Search footer */
.chat-widget__footer {
  flex-shrink: 0;
  border-top: 1px solid #f1f5f9;
  padding: 10px 12px;
}

.chat-widget__search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.chat-widget__search-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  flex-shrink: 0;
}

.chat-widget__search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #334155;
  outline: none;
  font-family: inherit;
}

/* Mini Chat */
.chat-widget__mini {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 56px;
  z-index: 20;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.chat-widget__mini-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfe;
}

.chat-widget__mini-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.chat-widget__mini-messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  max-height: 200px;
  overflow-y: auto;
}

.chat-widget__mini-row {
  display: flex;
}

.chat-widget__mini-row--sent {
  justify-content: flex-end;
}

.chat-widget__mini-row--received {
  justify-content: flex-start;
}

.chat-widget__mini-bubble {
  max-width: 85%;
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.5;
}

.chat-widget__mini-bubble--sent {
  background: #0000ff;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.chat-widget__mini-bubble--received {
  background: #f1f5f9;
  color: #334155;
  border-bottom-left-radius: 4px;
}

.chat-widget__mini-input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid #f1f5f9;
}

.chat-widget__mini-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #fafbfe;
  font-size: 12.5px;
  color: #334155;
  outline: none;
  font-family: inherit;
}

.chat-widget__mini-input:focus {
  border-color: rgba(0, 0, 255, 0.25);
}

.chat-widget__mini-send {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: #0000ff;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 255, 0.25);
  transition: all 0.15s ease;
}

.chat-widget__mini-send:hover {
  transform: scale(1.05);
}
</style>
