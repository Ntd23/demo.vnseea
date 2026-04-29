<template>
  <div class="media-grid" :class="items.length > 1 ? 'media-grid--multi' : ''">
    <button
      v-for="(item, index) in items"
      :key="`${item.src}-${index}`"
      class="media-grid__item"
      type="button"
      :aria-label="t('feed.postMediaGrid.openLabel', { index: index + 1 })"
      @click="emit('open', index)"
    >
      <img
        v-if="item.type === 'image'"
        :src="item.src"
        :alt="item.alt || t('feed.postMediaGrid.label', { index: index + 1 })"
        class="media-grid__img"
        loading="lazy"
      >
      <video
        v-else
        :aria-label="item.alt || t('feed.postMediaGrid.label', { index: index + 1 })"
        class="media-grid__img"
        muted
        playsinline
        preload="metadata"
      >
        <source :src="item.src" :type="item.mime || 'video/mp4'">
      </video>

      <!-- Subtle bottom gradient only -->
      <div class="media-grid__overlay" />

      <!-- Small type badge in corner -->
      <div class="media-grid__type-badge">
        <Icon :name="item.type === 'image' ? 'i-ph-image-bold' : 'i-ph-play-circle-bold'" class="h-3.5 w-3.5" />
        {{ item.type === "image" ? t("feed.postMediaGrid.imageType") : t("feed.postMediaGrid.videoType") }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  items: Array<{
    type: "image" | "video"
    src: string
    alt?: string
    mime?: string
  }>
}>()

const emit = defineEmits<{ open: [index: number] }>()
</script>

<style scoped>
.media-grid {
  display: grid;
  gap: 6px;
}

.media-grid--multi {
  grid-template-columns: repeat(2, 1fr);
}

.media-grid__item {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #f1f5f9;
  text-align: left;
  border: none;
  cursor: pointer;
}

.media-grid__img {
  width: 100%;
  height: 100%;
  min-height: 200px;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}

.media-grid__item:hover .media-grid__img {
  transform: scale(1.02);
}

/* Subtle bottom gradient — much lighter than before */
.media-grid__overlay {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2) 0%, transparent 40%);
}

/* Small corner type badge */
.media-grid__type-badge {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
}
</style>
