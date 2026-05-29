<!-- English description: Header notification dropdown that renders backend-backed notification items. -->

<template>
  <section class="notification-dropdown">
    <div class="notification-dropdown__status">
      <span class="notification-dropdown__status-copy">
        <span
          class="notification-dropdown__dot"
          :class="store.connected ? 'notification-dropdown__dot--online' : 'notification-dropdown__dot--polling'"
        />
        <span>
          {{ store.connected ? $t("notifications.center.realtime") : $t("notifications.center.polling") }}
        </span>
      </span>
      <button
        type="button"
        class="notification-dropdown__sound"
        @click="store.toggleSound()"
      >
        <Icon :name="store.soundEnabled ? 'i-ph-speaker-high-duotone' : 'i-ph-speaker-x-duotone'" class="h-4 w-4" />
        <span>
          {{ store.soundEnabled ? $t("notifications.center.soundOn") : $t("notifications.center.soundOff") }}
        </span>
      </button>
    </div>

    <div v-if="store.loading && store.items.length === 0" class="notification-dropdown__empty">
      {{ $t("notifications.center.loading") }}
    </div>

    <div v-else-if="store.items.length === 0" class="notification-dropdown__empty">
      <Icon name="i-ph-bell-slash-duotone" class="notification-dropdown__empty-icon" />
      <span>{{ $t("notifications.center.empty") }}</span>
    </div>

    <div v-else class="notification-dropdown__list">
      <article
        v-for="item in store.items"
        :key="item.id"
        class="notification-dropdown__item"
        :class="{ 'notification-dropdown__item--unread': item.isUnread }"
      >
        <button
          type="button"
          class="notification-dropdown__link"
          @click="openNotification(item)"
        >
          <NuxtImg
            v-if="item.avatarUrl"
            :src="item.avatarUrl"
            :alt="item.title"
            class="notification-dropdown__avatar"
            width="40"
            height="40"
          />
          <span v-else class="notification-dropdown__avatar notification-dropdown__avatar--icon">
            <Icon :name="item.icon" class="h-5 w-5" />
          </span>
          <span class="notification-dropdown__content">
            <strong>{{ item.title }}</strong>
            <span>{{ item.body }}</span>
            <small>{{ item.timeText }}</small>
          </span>
        </button>
        <button
          type="button"
          class="notification-dropdown__delete"
          :aria-label="$t('notifications.center.delete')"
          @click="store.deleteNotification(item.id)"
        >
          <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
        </button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { NotificationItem } from "../../domain/types/notification.types"
import { useNotificationCenterStore } from "../../application/stores/useNotificationCenterStore"

const emit = defineEmits<{
  navigate: []
}>()

const store = useNotificationCenterStore()

function normalizeNotificationTarget(rawUrl: string) {
  const targetUrl = rawUrl || "/notifications"
  const malformedPostMatch = targetUrl.match(/^\/post\/([^/?#&]+)&(.+)$/i)

  if (malformedPostMatch?.[1] && malformedPostMatch[2]) {
    return `/post/${encodeURIComponent(malformedPostMatch[1])}?${malformedPostMatch[2]}`
  }

  return targetUrl
}

async function openNotification(item: NotificationItem) {
  await store.markOneRead(item.id)
  emit("navigate")
  const targetUrl = normalizeNotificationTarget(item.url)
  await navigateTo(targetUrl, { external: /^https?:\/\//i.test(targetUrl) })
}
</script>

<style scoped>
.notification-dropdown {
  width: min(360px, calc(100vw - 24px));
  max-height: min(560px, calc(100vh - 96px));
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  box-shadow: var(--shadow-xl);
}

.notification-dropdown__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px var(--space-4);
  color: var(--text-secondary);
  font-size: var(--text-caption);
  border-bottom: 1px solid var(--border-light);
}

.notification-dropdown__status-copy,
.notification-dropdown__sound {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.notification-dropdown__sound {
  border: 0;
  border-radius: var(--radius-full);
  background: var(--bg-surface-active);
  color: var(--text-brand);
  cursor: pointer;
  font-size: var(--text-caption);
  font-weight: var(--weight-bold);
  padding: 6px 10px;
}

.notification-dropdown__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.notification-dropdown__dot--online {
  background: #16a34a;
}

.notification-dropdown__dot--polling {
  background: var(--color-warning);
}

.notification-dropdown__list {
  max-height: 420px;
  overflow-y: auto;
  padding: var(--space-2);
}

.notification-dropdown__item {
  position: relative;
  display: flex;
  border-radius: var(--radius-lg);
  transition: background var(--duration-fast) var(--ease-default);
}

.notification-dropdown__item:hover,
.notification-dropdown__item--unread {
  background: var(--bg-surface-active);
}

.notification-dropdown__link {
  display: flex;
  min-width: 0;
  flex: 1;
  gap: var(--space-3);
  padding: var(--space-3) 38px var(--space-3) var(--space-3);
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-decoration: none;
  text-align: left;
}

.notification-dropdown__avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.notification-dropdown__avatar--icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface-active);
  color: var(--icon-brand);
}

.notification-dropdown__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  color: var(--text-secondary);
  font-size: var(--text-body);
  line-height: var(--leading-normal);
}

.notification-dropdown__content strong {
  color: var(--text-primary);
  font-weight: var(--weight-bold);
}

.notification-dropdown__content small {
  color: var(--text-tertiary);
  font-size: var(--text-caption);
}

.notification-dropdown__delete {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--icon-secondary);
  cursor: pointer;
}

.notification-dropdown__delete:hover {
  background: var(--bg-muted);
  color: var(--icon-primary);
}

.notification-dropdown__empty {
  display: grid;
  min-height: 180px;
  place-items: center;
  gap: var(--space-2);
  padding: var(--space-6);
  color: var(--text-secondary);
  text-align: center;
}

.notification-dropdown__empty-icon {
  width: 34px;
  height: 34px;
  color: var(--icon-secondary);
}
</style>
