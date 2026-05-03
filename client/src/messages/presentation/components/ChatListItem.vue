<!-- Description: Renders a single inbox row for the PHP-parity left conversation list. -->
<template>
  <button
    class="chat-list-item"
    :class="{ 'chat-list-item--active': isActive }"
    type="button"
    @click="$emit('click')"
  >
    <div class="flex min-w-0 items-start gap-3">
      <div class="relative shrink-0">
        <UAvatar
          :src="avatarUrl"
          :alt="name"
          size="md"
          :ui="{ rounded: 'rounded-[16px]' }"
        />
        <span
          class="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white"
          :class="isOnline ? 'bg-emerald-500' : 'bg-slate-300'"
        />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-black text-[var(--text-primary)]">{{ name }}</p>
            <p class="truncate text-xs text-slate-500">{{ status }}</p>
          </div>
          <span class="shrink-0 text-[11px] font-semibold text-slate-400">{{ time }}</span>
        </div>

        <div class="mt-2 flex items-center justify-between gap-3">
          <p class="line-clamp-2 text-sm leading-5 text-slate-600">{{ preview }}</p>
          <span
            v-if="showSelect"
            class="chat-list-item__select"
            :class="{ 'chat-list-item__select--selected': isActive }"
          >
            <Icon v-if="isActive" name="i-ph-check-bold" class="h-3 w-3" />
          </span>
          <span v-else-if="unreadCount > 0" class="chat-list-item__badge">{{ unreadCount }}</span>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  avatarUrl?: string
  isActive?: boolean
  isOnline?: boolean
  preview: string
  showSelect?: boolean
  status: string
  time: string
  unreadCount: number
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.chat-list-item {
  width: 100%;
  border-radius: 18px;
  border: 1px solid transparent;
  background: #ffffff;
  padding: 14px;
  text-align: left;
  transition: all 0.2s ease;
}

.chat-list-item:hover,
.chat-list-item--active {
  border-color: rgba(37, 99, 235, 0.16);
  background: rgba(37, 99, 235, 0.06);
}

.chat-list-item__badge,
.chat-list-item__select {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-list-item__badge {
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #1d4ed8;
  padding: 0 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

.chat-list-item__select {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.16);
  color: #ffffff;
}

.chat-list-item__select--selected {
  border-color: #1d4ed8;
  background: #1d4ed8;
}
</style>
