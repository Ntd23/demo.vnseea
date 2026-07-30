<!-- English description: Displays backend-synchronized pinned messages below a conversation header. -->
<template>
  <section v-if="pinnedMessages.length" class="pinned-messages" :class="{ 'pinned-messages--compact': compact }">
    <button
      type="button"
      class="pinned-messages__summary"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="pinned-messages__summary-icon">
        <Icon name="i-ph-push-pin-fill" />
      </span>
      <span class="pinned-messages__summary-copy">
        <span class="pinned-messages__summary-title">
          {{ t("navigation.chatWidget.pinnedMessages") }}
          <small>{{ pinnedMessages.length }}</small>
        </span>
        <span class="pinned-messages__summary-preview">{{ latestPreview }}</span>
      </span>
      <Icon
        :name="expanded ? 'i-ph-caret-up-bold' : 'i-ph-caret-down-bold'"
        class="pinned-messages__caret"
      />
    </button>

    <div v-if="expanded" class="pinned-messages__list">
      <div
        v-for="message in pinnedMessages"
        :key="message.id"
        class="pinned-messages__item"
      >
        <button
          type="button"
          class="pinned-messages__item-main"
          @click="emit('select', message.id)"
        >
          <span class="pinned-messages__item-media">
            <NuxtImg
              v-if="previewFor(message).imageUrl"
              :src="previewFor(message).imageUrl"
              :alt="previewFor(message).title"
              loading="lazy"
            />
            <Icon v-else :name="previewFor(message).icon" />
          </span>

          <span class="pinned-messages__item-copy">
            <span class="pinned-messages__item-kind">{{ previewFor(message).kind }}</span>
            <strong>{{ previewFor(message).title }}</strong>
            <small v-if="previewFor(message).description">{{ previewFor(message).description }}</small>
            <em>{{ t("navigation.chatWidget.pinnedBy", { name: message.pinnedByName }) }}</em>
          </span>
        </button>

        <button
          v-if="message.canUnpin"
          type="button"
          class="pinned-messages__item-unpin"
          :title="t('navigation.chatWidget.unpinMessage')"
          :aria-label="t('navigation.chatWidget.unpinMessage')"
          @click.stop="emit('unpin', message)"
        >
          <Icon name="i-ph-push-pin-slash-bold" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MessagePinnedItem } from "../../domain/types/messages.types"
import {
  getMessageDisplayText,
  getMessageProductMeta,
  normalizeMessageText,
} from "../../application/utils/message-bubble-content"
import { getMessageLocationMeta } from "../../application/utils/message-location"

type PinnedMessagePreview = {
  kind: string
  title: string
  description: string
  imageUrl: string
  icon: string
}

const props = withDefaults(defineProps<{
  pinnedMessages?: MessagePinnedItem[]
  compact?: boolean
}>(), {
  pinnedMessages: () => [],
  compact: false,
})

const emit = defineEmits<{
  select: [messageId: number]
  unpin: [message: MessagePinnedItem]
}>()

const { locale, t } = useI18n()
const expanded = ref(false)

const latestPreview = computed(() => {
  const latest = props.pinnedMessages[0]
  return latest ? previewFor(latest).title : ""
})

function previewFor(message: MessagePinnedItem): PinnedMessagePreview {
  const location = getMessageLocationMeta(message)
  if (location) {
    return {
      kind: t("navigation.chatWidget.pinnedLocation"),
      title: location.title || t("navigation.chatWidget.pinnedLocation"),
      description: location.address,
      imageUrl: location.avatarUrl,
      icon: "i-ph-map-pin-fill",
    }
  }

  const sharedPost = message.sharedPost
  if (sharedPost?.job) {
    return {
      kind: t("navigation.chatWidget.pinnedJob"),
      title: sharedPost.job.title,
      description: [
        sharedPost.job.salaryLabel,
        sharedPost.job.location,
        sharedPost.job.typeLabel,
      ].filter(Boolean).join(" · ") || sharedPost.job.description,
      imageUrl: sharedPost.job.imageUrl || sharedPost.imageUrl || "",
      icon: "i-ph-briefcase-fill",
    }
  }

  if (sharedPost?.product) {
    const productPrice = sharedPost.product.price > 0
      ? `${new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US").format(sharedPost.product.price)} ${sharedPost.product.currencySymbol || sharedPost.product.currency || ""}`.trim()
      : ""
    const productPoint = sharedPost.product.point > 0
      ? t("navigation.chatWidget.pinnedProductPoint", { count: sharedPost.product.point })
      : ""

    return {
      kind: t("navigation.chatWidget.pinnedProduct"),
      title: sharedPost.product.title,
      description: [productPrice, productPoint, sharedPost.product.description].filter(Boolean).join(" · "),
      imageUrl: sharedPost.imageUrl || "",
      icon: "i-ph-storefront-fill",
    }
  }

  if (sharedPost?.blog) {
    return {
      kind: locale.value === "vi" ? "Bài viết blog" : "Blog article",
      title: sharedPost.blog.title,
      description: sharedPost.blog.description,
      imageUrl: sharedPost.blog.imageUrl || sharedPost.imageUrl || "",
      icon: "i-ph-article-medium-fill",
    }
  }

  if (sharedPost) {
    return {
      kind: t("navigation.chatWidget.pinnedPost"),
      title: sharedPost.author || t("navigation.chatWidget.pinnedPost"),
      description: sharedPost.text,
      imageUrl: sharedPost.imageUrl || sharedPost.authorAvatarUrl || "",
      icon: "i-ph-article-fill",
    }
  }

  const product = getMessageProductMeta(message)
  if (product) {
    return {
      kind: t("navigation.chatWidget.pinnedProduct"),
      title: product.card.title,
      description: [product.card.price, product.body].filter(Boolean).join(" · "),
      imageUrl: product.card.imageUrl || "",
      icon: "i-ph-storefront-fill",
    }
  }

  if (message.story) {
    return {
      kind: t("navigation.chatWidget.pinnedStory"),
      title: message.story.title || message.story.author || t("navigation.chatWidget.pinnedStory"),
      description: message.story.caption || getMessageDisplayText(message),
      imageUrl: message.story.posterUrl || message.story.mediaUrl || message.story.avatarUrl || "",
      icon: "i-ph-play-circle-fill",
    }
  }

  if (message.mediaUrl || message.mediaName) {
    const mediaKind = message.mediaType === "video"
      ? t("navigation.chatWidget.pinnedVideo")
      : message.mediaType === "image" || message.mediaType === "gif"
        ? t("navigation.chatWidget.pinnedImage")
        : t("navigation.chatWidget.pinnedFile")
    const mediaIcon = message.mediaType === "video"
      ? "i-ph-video-fill"
      : message.mediaType === "image" || message.mediaType === "gif"
        ? "i-ph-image-fill"
        : message.mediaType === "audio" || message.mediaType === "record"
          ? "i-ph-waveform-fill"
          : "i-ph-file-fill"

    return {
      kind: mediaKind,
      title: normalizeMessageText(message.mediaName || "") || mediaKind,
      description: getMessageDisplayText(message),
      imageUrl: message.mediaType === "image" || message.mediaType === "gif"
        ? message.mediaUrl || ""
        : "",
      icon: mediaIcon,
    }
  }

  const body = getMessageDisplayText(message)
    || normalizeMessageText(message.text)
    || t("navigation.chatWidget.pinnedMessageFallback")

  return {
    kind: t("navigation.chatWidget.pinnedMessageFallback"),
    title: body,
    description: "",
    imageUrl: "",
    icon: "i-ph-chat-circle-text-fill",
  }
}

watch(() => props.pinnedMessages.map(message => message.id).join(","), (next, previous) => {
  if (!next || next !== previous) {
    expanded.value = false
  }
})
</script>

<style scoped>
.pinned-messages {
  position: relative;
  z-index: 20;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-surface);
}

.pinned-messages__summary,
.pinned-messages__item {
  display: flex;
  width: 100%;
  align-items: center;
  border: 0;
  background: transparent;
  text-align: left;
}

.pinned-messages__summary {
  gap: 11px;
  min-height: 58px;
  padding: 9px 20px;
  cursor: pointer;
}

.pinned-messages--compact .pinned-messages__summary {
  min-height: 48px;
  gap: 8px;
  padding: 7px 12px;
}

.pinned-messages__summary-icon {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-primary) 10%, var(--bg-surface));
  color: var(--color-primary);
}

.pinned-messages__summary-icon svg {
  width: 18px;
  height: 18px;
}

.pinned-messages--compact .pinned-messages__summary-icon {
  width: 30px;
  height: 30px;
  flex-basis: 30px;
}

.pinned-messages__summary-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.pinned-messages__summary-title {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 750;
}

.pinned-messages__summary-title small {
  display: inline-flex;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: 10px;
}

.pinned-messages__summary-preview,
.pinned-messages__item-copy strong,
.pinned-messages__item-copy small,
.pinned-messages__item-copy em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pinned-messages__summary-preview {
  color: var(--text-secondary);
  font-size: 11px;
}

.pinned-messages__caret {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  color: var(--text-secondary);
}

.pinned-messages__list {
  max-height: min(320px, 42vh);
  overflow-y: auto;
  border-top: 1px solid var(--border-light);
  background: var(--bg-muted);
  padding: 10px 14px;
}

.pinned-messages__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px;
  gap: 5px;
  margin-bottom: 7px;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--bg-surface);
  padding: 5px;
  box-shadow: var(--shadow-sm);
}

.pinned-messages__item:last-child {
  margin-bottom: 0;
}

.pinned-messages__item:hover {
  border-color: color-mix(in srgb, var(--color-primary) 28%, var(--border-light));
  background: var(--bg-surface-hover);
}

.pinned-messages__item-main {
  display: grid;
  min-width: 0;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 11px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  padding: 4px;
  text-align: left;
  cursor: pointer;
}

.pinned-messages__item-main:focus-visible,
.pinned-messages__item-unpin:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-primary) 45%, transparent);
  outline-offset: 1px;
}

.pinned-messages__item-media {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 11px;
  background: color-mix(in srgb, var(--color-primary) 9%, var(--bg-surface));
  color: var(--color-primary);
}

.pinned-messages__item-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pinned-messages__item-media svg {
  width: 21px;
  height: 21px;
}

.pinned-messages__item-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.pinned-messages__item-kind {
  color: var(--color-primary);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.pinned-messages__item-copy strong {
  color: var(--text-primary);
  font-size: 12.5px;
  line-height: 1.3;
}

.pinned-messages__item-copy small,
.pinned-messages__item-copy em {
  color: var(--text-secondary);
  font-size: 10.5px;
  font-style: normal;
}

.pinned-messages__item-copy em {
  color: var(--text-tertiary);
}

.pinned-messages__item-unpin {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-self: center;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-primary) 9%, var(--bg-surface));
  color: var(--color-primary);
  cursor: pointer;
}

.pinned-messages__item-unpin:hover {
  background: color-mix(in srgb, var(--color-primary) 16%, var(--bg-surface));
}

.pinned-messages__item-unpin svg {
  width: 17px;
  height: 17px;
}

.pinned-messages--compact .pinned-messages__list {
  max-height: 220px;
  padding: 8px;
}

.pinned-messages--compact .pinned-messages__item {
  grid-template-columns: minmax(0, 1fr) 30px;
  gap: 4px;
  border-radius: 11px;
  padding: 7px;
}

.pinned-messages--compact .pinned-messages__item-main {
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 8px;
}

.pinned-messages--compact .pinned-messages__item-media {
  width: 38px;
  height: 38px;
}

.pinned-messages--compact .pinned-messages__item-unpin {
  width: 28px;
  height: 28px;
}
</style>
