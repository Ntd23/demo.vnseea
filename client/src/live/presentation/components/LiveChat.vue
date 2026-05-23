<!-- English description: Displays the host studio activity feed for live comments and join/leave events on the /live route. -->
<template>
  <div class="chat">
    <!-- Header -->
    <div class="chat__head">
      <div>
        <p class="chat__eyebrow">Hoạt động</p>
        <h3 class="chat__title">Bình luận trực tiếp</h3>
      </div>
      <div class="chat__state-badge" :class="`chat__state-badge--${liveState}`">
        <span class="chat__state-dot" />
        {{ stateLabel }}
      </div>
    </div>

    <!-- Feed -->
    <div ref="feedEl" class="chat__feed scrollbar-hide">
      <template v-if="items.length > 0">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="chat__item animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <UAvatar
            :src="item.avatarUrl"
            :text="item.name?.charAt(0) || '?'"
            size="sm"
            class="shrink-0 mt-0.5"
            :ui="{ rounded: 'rounded-xl', background: 'bg-blue-100', text: 'text-blue-700 font-bold' }"
          />
          <div class="min-w-0">
            <p class="chat__item-name">{{ item.name }}</p>
            <p class="chat__item-text">{{ item.text }}</p>
          </div>
        </div>
      </template>

      <div v-else class="chat__empty">
        <div class="chat__empty-icon">
          <Icon name="i-ph-chat-circle-dots-duotone" class="h-8 w-8 text-slate-300" />
        </div>
        <p class="chat__empty-title">Chưa có bình luận</p>
        <p class="chat__empty-desc">
          {{ liveState === 'live' ? 'Bình luận sẽ hiển thị ngay khi có người xem.' : 'Bắt đầu livestream để nhận bình luận.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LiveStudioComment, LiveStudioState } from "../../domain/types/live.types"

const props = defineProps<{
  items: ReadonlyArray<LiveStudioComment>
  liveState: LiveStudioState
}>()

const feedEl = ref<HTMLElement | null>(null)

const stateLabel = computed(() => {
  if (props.liveState === "live") return "Đang phát"
  if (props.liveState === "stale") return "Mất heartbeat"
  return "Ngoại tuyến"
})

watch(
  () => props.items.length,
  () => {
    nextTick(() => {
      if (feedEl.value) {
        feedEl.value.scrollTop = feedEl.value.scrollHeight
      }
    })
  },
)
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
}

/* Head */
.chat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.chat__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.chat__title {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.chat__state-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  border: 1px solid;
  flex-shrink: 0;
}

.chat__state-badge--live {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.chat__state-badge--stale {
  background: #fffbeb;
  border-color: #fcd34d;
  color: #b45309;
}

.chat__state-badge--offline {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}

.chat__state-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

/* Feed */
.chat__feed {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: background 0.15s;
}

.chat__item:hover {
  background: #f1f5f9;
}

.chat__item-name {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.chat__item-text {
  font-size: 14px;
  color: #0f172a;
  margin: 3px 0 0;
  line-height: 1.5;
  word-break: break-word;
}

/* Empty */
.chat__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 10px;
  text-align: center;
  padding: 32px 24px;
  min-height: 300px;
}

.chat__empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat__empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.chat__empty-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
  max-width: 220px;
  margin: 0;
}
</style>
