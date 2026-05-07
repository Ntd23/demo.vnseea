<!-- Description: Renders one backend-provided feed comment with PHP-parity media attachment support. -->
<template>
  <article class="comment-item">
    <NuxtLink v-if="authorPath" :to="authorPath" class="comment-item__avatar" :aria-label="author">
      <img
        v-if="authorAvatarUrl"
        :src="authorAvatarUrl"
        :alt="author"
        class="comment-item__avatar-img"
      >
      <span v-else-if="initials">{{ initials }}</span>
      <Icon v-else name="i-ph-user-circle-fill" class="h-5 w-5" />
    </NuxtLink>
    <div v-else class="comment-item__avatar" aria-hidden="true">
      <img
        v-if="authorAvatarUrl"
        :src="authorAvatarUrl"
        :alt="author"
        class="comment-item__avatar-img"
      >
      <span v-else-if="initials">{{ initials }}</span>
      <Icon v-else name="i-ph-user-circle-fill" class="h-5 w-5" />
    </div>

    <div class="comment-item__body">
      <div class="comment-item__bubble">
        <div class="comment-item__meta">
          <NuxtLink v-if="authorPath" :to="authorPath" class="comment-item__author">
            {{ author }}
          </NuxtLink>
          <p v-else class="comment-item__author">{{ author }}</p>
          <span v-if="visibleRole" class="comment-item__role">{{ visibleRole }}</span>
        </div>
        <p v-if="text" class="comment-item__text">{{ text }}</p>
        <NuxtImg
          v-if="attachment && attachment.type !== 'audio'"
          :src="attachment.url"
          :alt="attachment.name || text || author"
          class="comment-item__image"
          loading="lazy"
          sizes="240px"
        />
        <audio
          v-else-if="attachment"
          class="comment-item__audio"
          :src="attachment.url"
          controls
        />
      </div>
      <!-- phần footer thay bằng đoạn này -->
<div class="comment-item__footer">
  <span v-if="displayTime">{{ displayTime }}</span>

  <button
    type="button"
    class="comment-item__action"
    :class="{ 'comment-item__action--active': liked }"
    @click="toggleLike"
  >
    <Icon
      :name="liked ? 'i-ph-thumbs-up-fill' : 'i-ph-thumbs-up'"
      class="comment-item__action-icon"
    />
    <span>{{ liked ? 'Đã thích' : 'Thích' }}</span>
  </button>

  <button
    type="button"
    class="comment-item__action"
    @click="showReplyBox = !showReplyBox"
  >
    <Icon name="i-ph-chat-circle" class="comment-item__action-icon" />
    <span>Trả lời</span>
  </button>

  <span v-if="likesCount > 0" class="comment-item__likes">
    <Icon name="i-ph-thumbs-up-fill" class="comment-item__likes-icon" />
    {{ likesCount }}
  </span>
</div>

<div v-if="showReplyBox" class="comment-item__reply-box">
  <textarea
    v-model="replyText"
    class="comment-item__reply-input"
    rows="2"
    placeholder="Viết trả lời..."
  />

  <div class="comment-item__reply-actions">
    <button
      type="button"
      class="comment-item__reply-cancel"
      @click="cancelReply"
    >
      Huỷ
    </button>

    <button
      type="button"
      class="comment-item__reply-submit"
      :disabled="!replyText.trim()"
      @click="submitReply"
    >
      Gửi
    </button>
  </div>
</div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { FeedCommentAttachment } from "../../domain/types/feed.types"

const props = defineProps<{
  author: string
  authorAvatarUrl?: string
  authorPath?: string
  role: string
  text: string
  time?: string
  attachment?: FeedCommentAttachment
}>()

const formatTimestamp = (value: string) => {
  const timestamp = Number(value)

  if (!Number.isFinite(timestamp) || timestamp <= 0 || !/^\d{10,13}$/.test(value)) {
    return value
  }

  const date = new Date(timestamp < 1000000000000 ? timestamp * 1000 : timestamp)
  const dateLabel = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const timeLabel = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return `${timeLabel} ${dateLabel}`
}

const looksLikeAddress = (value: string) =>
  value.includes(",")
  && /\d/.test(value)
  && /(việt nam|viet nam|vietnam|hà nội|ha noi|hồ chí minh|ho chi minh)/i.test(value)

const visibleRole = computed(() => {
  const role = props.role.trim()

  if (!role || role === props.author || looksLikeAddress(role)) {
    return ""
  }

  return role
})

const displayTime = computed(() => {
  const time = props.time?.trim() || ""

  return time ? formatTimestamp(time) : ""
})

const initials = computed(() => {
  const value = props.author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return value
})
const emit = defineEmits<{
  reply: [text: string]
}>()

const liked = ref(false)
const likesCount = ref(0)
const showReplyBox = ref(false)
const replyText = ref("")

const likeStorageKey = computed(() =>
  `comment-like-${props.author}-${props.time || props.text}`
)

onMounted(() => {
  const saved = localStorage.getItem(likeStorageKey.value)

  if (saved === "1") {
    liked.value = true
    likesCount.value = 1
  }
})

function toggleLike() {
  liked.value = !liked.value
  likesCount.value = liked.value ? 1 : 0

  localStorage.setItem(likeStorageKey.value, liked.value ? "1" : "0")
}

function submitReply() {
  const text = replyText.value.trim()

  if (!text) return

  emit("reply", text)

  replyText.value = ""
  showReplyBox.value = false
}

function cancelReply() {
  replyText.value = ""
  showReplyBox.value = false
}





function emitReply() {
  emit("reply")
}
</script>

<style scoped>
.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.comment-item__avatar {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
}

.comment-item__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.comment-item__body {
  min-width: 0;
  flex: 1;
}

.comment-item__bubble {
  display: inline-block;
  max-width: min(100%, 720px);
  border-radius: 18px;
  background: #f0f2f5;
  padding: 9px 12px;
}

.comment-item__meta {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 7px;
}

.comment-item__author {
  margin: 0;
  min-width: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-decoration: none;
}

.comment-item__author:hover {
  text-decoration: underline;
}

.comment-item__role {
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-item__text {
  margin: 3px 0 0;
  color: #1e293b;
  font-size: 13.5px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-item__image {
  display: block;
  width: min(240px, 100%);
  max-height: 260px;
  margin-top: 8px;
  border-radius: 14px;
  object-fit: cover;
}

.comment-item__audio {
  display: block;
  width: min(280px, 100%);
  margin-top: 8px;
}

.comment-item__footer {
  margin: 4px 0 0 12px;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 600;
}
.comment-item__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 4px 0 0 12px;
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 600;
}

.comment-item__action {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: color 0.15s ease;
}

.comment-item__action:hover {
  color: #0000ff;
}

.comment-item__action--active {
  color: #0000ff;
}

.comment-item__likes {
  color: #64748b;
}
.comment-item__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.comment-item__action:hover,
.comment-item__action--active {
  color: #1877f2;
}

.comment-item__action-icon {
  width: 14px;
  height: 14px;
}

.comment-item__likes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
}

.comment-item__likes-icon {
  width: 13px;
  height: 13px;
  color: #1877f2;
}

.comment-item__reply-box {
  margin: 8px 0 0 12px;
  max-width: 520px;
}

.comment-item__reply-input {
  width: 100%;
  resize: vertical;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 9px 12px;
  font-size: 13px;
  outline: none;
}

.comment-item__reply-input:focus {
  border-color: #1877f2;
}

.comment-item__reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.comment-item__reply-cancel,
.comment-item__reply-submit {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.comment-item__reply-cancel {
  background: #f1f5f9;
  color: #475569;
}

.comment-item__reply-submit {
  background: #1877f2;
  color: white;
}

.comment-item__reply-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
