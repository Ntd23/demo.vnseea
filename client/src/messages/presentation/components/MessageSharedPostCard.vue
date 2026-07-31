<!-- Description: Renders a normalized shared-post attachment received from either web or native message links. -->
<template>
  <NuxtLink
    :to="cardHref"
    class="message-shared-post"
    :class="{
      'message-shared-post--product': post.product,
      'message-shared-post--job': post.job,
      'message-shared-post--live': post.live,
      'message-shared-post--blog': post.blog,
    }"
    @click.stop
  >
    <span class="message-shared-post__media">
      <NuxtImg
        v-if="post.imageUrl && !imageFailed"
        :src="post.imageUrl"
        :alt="post.blog?.title || post.job?.title || post.author || unavailableLabel"
        loading="lazy"
        class="message-shared-post__image"
        @error="imageFailed = true"
      />
      <Icon
        v-else
        :name="post.live ? 'i-ph-broadcast-duotone' : post.job ? 'i-ph-briefcase-duotone' : post.blog ? 'i-ph-article-medium-duotone' : 'i-ph-article-duotone'"
        class="message-shared-post__fallback-icon"
      />
      <span
        v-if="post.live"
        class="message-shared-post__live-badge"
        :class="{ 'message-shared-post__live-badge--ended': post.live.state === 'offline' }"
      >
        <Icon :name="post.live.state === 'offline' ? 'i-ph-video-camera-slash-fill' : 'i-ph-broadcast-fill'" />
        {{ liveStateLabel }}
      </span>
      <span v-if="post.live" class="message-shared-post__live-viewers">
        <Icon name="i-ph-eye-fill" />
        {{ $t("pages.messagesPage.sharedLiveViewers", { count: post.live.viewerCount }) }}
      </span>
    </span>

    <span class="message-shared-post__body">
      <span v-if="post.available && post.live" class="message-shared-post__live">
        <span class="message-shared-post__kind">
          <Icon name="i-ph-broadcast-bold" />
          {{ $t("pages.messagesPage.sharedLiveLabel") }}
        </span>
        <strong class="message-shared-post__live-title">
          {{ post.live.title || $t("pages.messagesPage.sharedLiveFallback") }}
        </strong>
      </span>

      <span v-if="post.available && post.job" class="message-shared-post__job">
        <span class="message-shared-post__kind">
          <Icon name="i-ph-briefcase-bold" />
          {{ $t("pages.messagesPage.sharedJobLabel") }}
        </span>
        <strong class="message-shared-post__job-title">
          {{ post.job.title }}
        </strong>
        <span
          v-if="post.job.location || post.job.typeLabel || post.job.categoryLabel"
          class="message-shared-post__job-meta"
        >
          <span v-if="post.job.location">
            <Icon name="i-ph-map-pin-fill" />
            {{ post.job.location }}
          </span>
          <span v-if="post.job.typeLabel">
            <Icon name="i-ph-briefcase-fill" />
            {{ post.job.typeLabel }}
          </span>
          <span v-if="post.job.categoryLabel">
            <Icon name="i-ph-tag-fill" />
            {{ post.job.categoryLabel }}
          </span>
        </span>
        <strong v-if="post.job.salaryLabel" class="message-shared-post__salary">
          {{ post.job.salaryLabel }}
        </strong>
        <span v-if="post.job.description" class="message-shared-post__description">
          {{ post.job.description }}
        </span>
      </span>

      <span v-if="post.available && post.product" class="message-shared-post__product">
        <span class="message-shared-post__kind">
          <Icon name="i-ph-storefront-bold" />
          {{ productLabel }}
        </span>
        <strong class="message-shared-post__product-title">
          {{ post.product.title }}
        </strong>
        <strong class="message-shared-post__price">
          {{ productPrice }}
        </strong>
        <strong class="message-shared-post__points">
          {{ productPoints }}
        </strong>
        <span v-if="post.product.description" class="message-shared-post__description">
          {{ post.product.description }}
        </span>
      </span>

      <span v-if="post.available && post.blog" class="message-shared-post__blog">
        <span class="message-shared-post__kind">
          <Icon name="i-ph-article-medium-bold" />
          {{ blogLabel }}
        </span>
        <strong class="message-shared-post__blog-title">
          {{ post.blog.title }}
        </strong>
        <span v-if="post.blog.description" class="message-shared-post__description">
          {{ post.blog.description }}
        </span>
      </span>

      <span class="message-shared-post__author-row">
        <img
          v-if="post.authorAvatarUrl && post.available"
          :src="post.authorAvatarUrl"
          :alt="post.author"
          class="message-shared-post__avatar"
        >
        <span v-else class="message-shared-post__avatar-fallback">
          <Icon name="i-ph-user-bold" />
        </span>
        <strong>{{ post.available ? post.author : unavailableLabel }}</strong>
      </span>
      <span v-if="post.available && !post.product && !post.job && !post.live && !post.blog && post.text" class="message-shared-post__text">
        {{ post.text }}
      </span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { formatProductPoints, formatProductPrice } from "../../../product/application/formatters/product-currency"
import type { MessageSharedPostCard } from "../../domain/types/messages.types"

const props = defineProps<{
  post: MessageSharedPostCard
}>()

const { locale } = useI18n()
const imageFailed = ref(false)
const cardHref = computed(() => props.post.job?.href || props.post.product?.href || props.post.blog?.href || props.post.href)
const productLabel = computed(() => locale.value === "vi" ? "Sản phẩm" : "Product")
const blogLabel = computed(() => locale.value === "vi" ? "Bài viết blog" : "Blog article")
const liveStateLabel = computed(() =>
  props.post.live?.state === "offline"
    ? (locale.value === "vi" ? "Đã kết thúc" : "Ended")
    : "LIVE",
)
const productPrice = computed(() => props.post.product
  ? formatProductPrice(props.post.product, locale.value)
  : "",
)
const productPoints = computed(() => props.post.product
  ? formatProductPoints(props.post.product, locale.value)
  : "",
)
const unavailableLabel = computed(() =>
  locale.value === "vi" ? "Bài viết không khả dụng" : "Post unavailable",
)

watch(() => props.post.imageUrl, () => {
  imageFailed.value = false
})
</script>

<style scoped>
.message-shared-post {
  display: flex;
  width: min(250px, 68vw);
  max-width: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 18px;
  background: var(--bg-surface);
  color: var(--text-primary);
  text-decoration: none;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--text-primary) 9%, transparent);
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.message-shared-post:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 35%, var(--border-light));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.message-shared-post__media {
  position: relative;
  display: flex;
  width: 100%;
  aspect-ratio: 4 / 3;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-muted);
}

.message-shared-post__live-badge,
.message-shared-post__live-viewers {
  position: absolute;
  top: 9px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  backdrop-filter: blur(8px);
}

.message-shared-post__live-badge {
  left: 9px;
  padding: 6px 8px;
  background: #e11d48;
}

.message-shared-post__live-badge--ended {
  background: rgba(15, 23, 42, 0.78);
}

.message-shared-post__live-viewers {
  right: 9px;
  padding: 6px 8px;
  background: rgba(15, 23, 42, 0.72);
}

.message-shared-post__live-badge :deep(svg),
.message-shared-post__live-viewers :deep(svg) {
  width: 12px;
  height: 12px;
}

.message-shared-post__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-shared-post__fallback-icon {
  width: 34px;
  height: 34px;
  color: var(--text-tertiary);
}

.message-shared-post__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px 12px;
}

.message-shared-post__author-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.message-shared-post--job .message-shared-post__author-row,
.message-shared-post--product .message-shared-post__author-row,
.message-shared-post--blog .message-shared-post__author-row,
.message-shared-post--live .message-shared-post__author-row {
  margin-top: 2px;
  padding-top: 9px;
  border-top: 1px solid var(--border-light);
}

.message-shared-post__job,
.message-shared-post__product,
.message-shared-post__blog,
.message-shared-post__live {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
}

.message-shared-post__author-row strong {
  min-width: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-shared-post__kind {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 5px;
  color: var(--bg-brand);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.message-shared-post__kind :deep(svg) {
  width: 14px;
  height: 14px;
}

.message-shared-post__job-title,
.message-shared-post__product-title,
.message-shared-post__blog-title,
.message-shared-post__live-title {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 750;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.message-shared-post__job-meta {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: var(--text-secondary);
  font-size: 11.5px;
  font-weight: 650;
}

.message-shared-post__job-meta span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
}

.message-shared-post__job-meta :deep(svg) {
  width: 13px;
  height: 13px;
  flex: 0 0 13px;
  color: var(--text-brand);
}

.message-shared-post__salary,
.message-shared-post__price {
  color: var(--bg-brand);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
}

.message-shared-post__points {
  color: #2684ff;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.2;
}

.message-shared-post__description {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.message-shared-post__avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 999px;
  object-fit: cover;
}

.message-shared-post__avatar-fallback {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-tertiary);
}

.message-shared-post__text {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12.5px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 480px) {
  .message-shared-post {
    width: min(235px, 68vw);
  }

  .message-shared-post__body {
    padding: 9px 11px 10px;
  }
}
</style>
