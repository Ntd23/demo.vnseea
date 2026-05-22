<!-- Description: Renders a single inbox row for the PHP-parity left conversation list. -->
<template>
  <div
    class="chat-list-item cursor-pointer"
    :class="{ 'chat-list-item--active': isActive }"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="flex min-w-0 items-start gap-4">
      <!-- Avatar Section (55x55px based on WoWonder web) -->
      <div class="chat-list-item__avatar-container">
        <UAvatar
          :src="avatarUrl"
          :alt="name"
          class="chat-list-item__avatar-img"
          :ui="{ rounded: 'rounded-full' }"
        />
        <span
          class="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white"
          :class="isOnline ? 'bg-emerald-500' : 'bg-slate-300'"
        />
      </div>

      <!-- Info Section -->
      <div class="min-w-0 flex-1">
        <div class="flex min-w-0 items-baseline justify-between gap-2">
          <div class="min-w-0">
            <p class="chat-list-item__name truncate">{{ name }}</p>
            <p class="chat-list-item__status mt-1 truncate">{{ status }}</p>
            <div v-if="tags.length > 0" class="chat-list-item__tags" aria-label="User tags">
              <span
                v-for="tag in tags"
                :key="tag.id"
                class="chat-list-item__tag"
                :title="tag.name"
                :style="{ backgroundColor: tag.color }"
              />
            </div>
            <button
              v-if="showTagAction"
              type="button"
              class="chat-list-item__tag-action"
              title="Gắn nhãn"
              @click.stop="$emit('manage-tags')"
            >
              <Icon name="i-ph-tag-duotone" class="h-3.5 w-3.5" />
            </button>
          </div>
          <span class="chat-list-item__time shrink-0">{{ time }}</span>
        </div>

        <div class="mt-2.5 flex min-w-0 items-center justify-between gap-3">
          <p
            class="chat-list-item__preview line-clamp-1 flex-1"
            :class="{ 'chat-list-item__preview--unread': unreadCount > 0 }"
          >
            {{ preview }}
          </p>

          <!-- Checkbox 'Chọn' and 'Mở chat' button under multi-send tab -->
          <div v-if="showSelect" class="flex items-center gap-2.5 shrink-0" @click.stop>
            <label class="chat-list-item__select-label" @click="emit('click')">
              <span
                class="chat-list-item__select"
                :class="{ 'chat-list-item__select--selected': isActive }"
              >
                <Icon v-if="isActive" name="i-ph-check-bold" class="h-3.5 w-3.5" />
              </span>
              <span class="chat-list-item__select-text">Chọn</span>
            </label>
            <button
              type="button"
              class="chat-list-item__open-chat-btn"
              @click="$emit('open-chat')"
            >
              Mở chat
            </button>
          </div>
          <span v-else-if="unreadCount > 0" class="chat-list-item__badge">{{ unreadCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageUserTag } from "../../domain/types/messages.types"

withDefaults(defineProps<{
  name: string
  avatarUrl?: string
  isActive?: boolean
  isOnline?: boolean
  preview: string
  showSelect?: boolean
  showTagAction?: boolean
  status: string
  tags?: MessageUserTag[]
  time: string
  unreadCount: number
}>(), {
  tags: () => [],
})

const emit = defineEmits<{
  click: []
  "manage-tags": []
  "open-chat": []
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.chat-list-item {
  width: 100%;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #ffffff;
  padding: 12px;
  text-align: left;
  transition: all 0.2s ease;
  font-family: 'Roboto', sans-serif !important;
}

.chat-list-item:hover,
.chat-list-item--active {
  border-color: transparent;
  background: #F7F7F7;
}

.chat-list-item__avatar-container {
  position: relative;
  width: 55px;
  height: 55px;
  flex-shrink: 0;
}

.chat-list-item__avatar-img {
  width: 55px !important;
  height: 55px !important;
  box-shadow: inherit;
  border: inherit;
  object-fit: cover;
}

.chat-list-item__name {
  font-size: 16px;
  font-weight: 500;
  color: #414145;
  line-height: 1.2;
}

.chat-list-item__status {
  font-size: 12px;
  color: #8e8e93;
}

.chat-list-item__tags {
  display: flex;
  gap: 4px;
  margin-top: 5px;
  min-height: 12px;
}

.chat-list-item__tag {
  width: 12px;
  height: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 3px;
  flex: 0 0 auto;
}

.chat-list-item__tag-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 22px;
  margin-top: 5px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #64748b;
}

.chat-list-item__tag-action:hover {
  border-color: #002aff;
  color: #002aff;
}

.chat-list-item__time {
  font-size: 13px;
  color: #2A2A2F;
  font-weight: 500;
}

.chat-list-item__preview {
  font-size: 14px;
  color: #636366;
  font-weight: 400;
  line-height: 1.3;
}

.chat-list-item__preview--unread {
  font-weight: 500;
  color: #333338;
}

.chat-list-item__badge,
.chat-list-item__select {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-list-item__badge {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--bg-brand, #1d4ed8);
  padding: 0 5px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
}

.chat-list-item__select-label {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  cursor: pointer !important;
  user-select: none !important;
}

.chat-list-item__select-text {
  font-family: 'Roboto', sans-serif !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #475569 !important;
}

.chat-list-item__open-chat-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  padding: 4px 10px !important;
  font-family: 'Roboto', sans-serif !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  color: #475569 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.chat-list-item__open-chat-btn:hover {
  background-color: #e2e8f0 !important;
  color: #1e293b !important;
  border-color: #94a3b8 !important;
}

.chat-list-item__select {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 18px !important;
  height: 18px !important;
  border-radius: 4px !important;
  border: 1px solid rgba(15, 23, 42, 0.24) !important;
  color: #ffffff !important;
  transition: all 0.2s ease !important;
  background-color: #ffffff !important;
}

.chat-list-item__select--selected {
  border-color: #002aff !important;
  background-color: #002aff !important;
}
</style>

