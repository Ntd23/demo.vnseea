<!-- Description: Renders the reels overlay with real author navigation instead of a mock follow action. -->
<template>
  <div class="reel-overlay">
    <div class="reel-overlay__grid">
      <!-- Left: author + info -->
      <div class="reel-overlay__left">
        <div class="reel-author">
          <div class="reel-author__avatar">
            <img
              :src="reel.avatar"
              :alt="reel.author"
              class="reel-author__avatar-img"
            />
          </div>

          <div class="reel-author__info">
            <div class="reel-author__name-row">
              <p class="reel-author__name">{{ reel.author }}</p>
              <NuxtLink :to="reel.authorPath" class="reel-author__follow">
                {{ $t("pages.explorePage.viewProfile") }}
              </NuxtLink>
            </div>
            <p class="reel-author__subtitle">{{ reel.subtitle }}</p>
          </div>
        </div>

        <h2 class="reel-title">{{ reel.title }}</h2>
        <p class="reel-desc">{{ reel.description }}</p>

        <div class="reel-music">
          <Icon name="i-ph-music-notes-fill" class="reel-music__icon" />
          <span class="reel-music__text">{{ reel.music }}</span>
        </div>

        <div class="reel-tags">
          <span v-for="tag in reel.tags" :key="tag" class="reel-tag">{{
            tag
          }}</span>
        </div>
      </div>

      <!-- Right: action buttons -->
      <div class="reel-overlay__actions">
        <button
          v-for="item in actionItems"
          :key="item.label"
          class="reel-action"
          type="button"
          :aria-label="item.label"
        >
          <span class="reel-action__circle">
            <Icon :name="item.icon" class="reel-action__icon" />
          </span>
          <span class="reel-action__value">{{ item.value }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  reel: {
    id: number;
    title: string;
    author: string;
    subtitle: string;
    description: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    avatar: string;
    music: string;
    tags: string[];
    authorPath: string;
  };
}>();

const { t, locale } = useI18n();

const compactFormatter = computed(
  () =>
    new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }),
);

const formatCompact = (value: number) => compactFormatter.value.format(value);

const actionItems = computed(() => [
  {
    label: t("pages.reelsPage.like"),
    value: formatCompact(props.reel.likes),
    icon: "i-ph-heart-fill",
  },
  {
    label: t("pages.reelsPage.comment"),
    value: formatCompact(props.reel.comments),
    icon: "i-ph-chat-circle-text-fill",
  },
  {
    label: t("pages.reelsPage.share"),
    value: formatCompact(props.reel.shares),
    icon: "i-ph-share-network-fill",
  },
  {
    label: t("pages.reelsPage.save"),
    value: t("pages.reelsPage.save"),
    icon: "i-ph-bookmark-simple-fill",
  },
]);
</script>

<style scoped>
.reel-overlay {
  pointer-events: none;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
}

.reel-overlay__grid {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 56px;
  align-items: flex-end;
  gap: 8px;
  padding: 0 12px calc(1rem + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 640px) {
  .reel-overlay__grid {
    grid-template-columns: minmax(0, 1fr) 76px;
    gap: 12px;
    padding: 0 20px 24px;
  }
}

/* Author */
.reel-overlay__left {
  pointer-events: auto;
  min-width: 0;
  padding-bottom: 4px;
}

.reel-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reel-author__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid var(--bg-brand);
  overflow: hidden;
}

.reel-author__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-author__info {
  min-width: 0;
}

.reel-author__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.reel-author__name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-media);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reel-author__follow {
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid var(--border-media);
  background: color-mix(in srgb, var(--text-media) 14%, transparent);
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-media);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.15s ease;
}

.reel-author__follow:hover {
  background: var(--text-media);
  color: var(--bg-media);
}

.reel-author__subtitle {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-media-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Title & desc */
.reel-title {
  margin-top: 12px;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.08;
  color: var(--text-media);
  text-shadow: 0 2px 16px color-mix(in srgb, var(--bg-media) 55%, transparent);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: min(100%, 360px);
}

@media (min-width: 640px) {
  .reel-title {
    font-size: 1.65rem;
    margin-top: 16px;
  }
}

.reel-desc {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-media-muted);
  text-shadow: 0 2px 14px color-mix(in srgb, var(--bg-media) 55%, transparent);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: min(100%, 340px);
}

@media (min-width: 640px) {
  .reel-desc {
    font-size: 13px;
    line-height: 1.55;
    margin-top: 8px;
  }
}

/* Music row */
.reel-music {
  margin-top: 10px;
  display: flex;
  max-width: min(100%, 340px);
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid var(--border-media);
  background: color-mix(in srgb, var(--bg-media) 28%, transparent);
  padding: 6px 12px;
  backdrop-filter: blur(8px);
}

.reel-music__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--bg-brand);
}

.reel-music__text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-media-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Tags */
.reel-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reel-tag {
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-media) 12%, transparent);
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-media);
  backdrop-filter: blur(8px);
}

/* Action buttons */
.reel-overlay__actions {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
}

@media (min-width: 640px) {
  .reel-overlay__actions {
    gap: 12px;
  }
}

.reel-action {
  display: flex;
  width: 48px;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
}

@media (min-width: 640px) {
  .reel-action {
    width: 64px;
    gap: 6px;
  }
}

.reel-action__circle {
  display: flex;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--border-media);
  background: color-mix(in srgb, var(--bg-media) 36%, transparent);
  color: var(--text-media);
  box-shadow: 0 8px 26px color-mix(in srgb, var(--bg-media) 25%, transparent);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

@media (min-width: 640px) {
  .reel-action__circle {
    height: 48px;
    width: 48px;
  }
}

.reel-action:hover .reel-action__circle {
  transform: translateY(-2px);
  background: var(--text-media);
  color: var(--bg-media);
}

.reel-action__icon {
  width: 18px;
  height: 18px;
}

@media (min-width: 640px) {
  .reel-action__icon {
    width: 22px;
    height: 22px;
  }
}

.reel-action__value {
  max-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
  color: var(--text-media);
  text-shadow: 0 2px 10px color-mix(in srgb, var(--bg-media) 65%, transparent);
}

@media (min-width: 640px) {
  .reel-action__value {
    max-width: 64px;
    font-size: 11px;
  }
}
</style>
