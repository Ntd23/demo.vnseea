<!-- English description: Floating result card for a nearby user or page. -->

<template>
  <article
    class="nearby-result-card"
    :class="{ 'nearby-result-card--active': active }"
    role="button"
    tabindex="0"
    @click="$emit('select', item)"
    @keydown.enter="$emit('select', item)"
  >
    <div class="nearby-result-card__avatar">
      <img v-if="item.avatarUrl" :src="item.avatarUrl" :alt="item.title">
      <span v-else>{{ initials }}</span>
    </div>

    <div class="nearby-result-card__content">
      <div class="nearby-result-card__meta-row">
        <span class="nearby-result-card__distance">{{ distanceLabel }}</span>
        <span class="nearby-result-card__type">
          {{ item.type === "page" ? "Trang" : "Người dùng" }}
        </span>
      </div>
      <h2 class="nearby-result-card__title">{{ item.title }}</h2>
      <p class="nearby-result-card__subtitle">{{ item.subtitle }}</p>
      <p class="nearby-result-card__location">
        <Icon name="i-ph-map-pin-fill" />
        <span>{{ item.locationLabel || coordinateLabel }}</span>
      </p>

      <div class="nearby-result-card__actions">
        <NuxtLink class="nearby-result-card__action" :to="item.href">
          {{ item.type === "page" ? "Mở trang" : "Xem hồ sơ" }}
        </NuxtLink>
        <button
          class="nearby-result-card__action nearby-result-card__action--primary"
          type="button"
          @click.stop="$emit('directions', item)"
        >
          Chỉ đường
        </button>
        <button class="nearby-result-card__action" type="button" @click.stop="copyLink">
          Chia sẻ
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { NearbySearchItem } from "../../domain/types/search-nearby.types"

const props = defineProps<{
  item: NearbySearchItem
  active?: boolean
}>()

defineEmits<{
  select: [item: NearbySearchItem]
  directions: [item: NearbySearchItem]
}>()

const initials = computed(() =>
  props.item.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "?",
)

const distanceLabel = computed(() => {
  const meters = props.item.distanceMeters

  if (meters === null) return "-- km"
  if (meters < 1000) return `${meters} m`

  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`
})

const coordinateLabel = computed(() => {
  if (props.item.lat === null || props.item.lng === null) return ""

  return `${props.item.lat}, ${props.item.lng}`
})

async function copyLink() {
  if (!import.meta.client || !navigator.clipboard) {
    return
  }

  const url = new URL(props.item.href, window.location.origin).toString()
  await navigator.clipboard.writeText(url).catch(() => {})
}
</script>

<style scoped>
.nearby-result-card {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 22px;
  min-width: min(100%, 560px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--bg-surface) 93%, transparent);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  padding: 20px;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.nearby-result-card:hover,
.nearby-result-card--active {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-xl);
  transform: translateY(-1px);
}

.nearby-result-card__avatar {
  display: flex;
  height: 76px;
  width: 76px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--color-primary-100) 0%, var(--color-primary-200) 100%);
  color: var(--text-link);
  font-size: 20px;
  font-weight: var(--weight-extrabold);
}

.nearby-result-card__avatar img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.nearby-result-card__content {
  min-width: 0;
}

.nearby-result-card__meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.nearby-result-card__distance,
.nearby-result-card__type {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: var(--text-caption);
  font-weight: var(--weight-extrabold);
  padding: 6px 12px;
}

.nearby-result-card__distance {
  background: var(--bg-surface-active);
  color: var(--text-link);
}

.nearby-result-card__type {
  background: var(--bg-muted);
  color: var(--color-secondary-600);
}

.nearby-result-card__title {
  margin-top: 14px;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: var(--weight-extrabold);
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-result-card__subtitle,
.nearby-result-card__location {
  margin-top: 8px;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: var(--text-body);
  font-weight: var(--weight-bold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-result-card__location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.nearby-result-card__location svg {
  flex: 0 0 auto;
}

.nearby-result-card__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.nearby-result-card__action {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-secondary-50);
  color: var(--color-secondary-800);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--weight-extrabold);
  text-decoration: none;
  transition: all 0.15s ease;
}

.nearby-result-card__action:hover {
  background: var(--color-primary-50);
  color: var(--text-link);
}

.nearby-result-card__action--primary {
  border-color: var(--bg-brand);
  background: var(--bg-brand);
  box-shadow: var(--shadow-brand);
  color: var(--text-inverse);
}

.nearby-result-card__action--primary:hover {
  background: var(--bg-brand-hover);
  color: var(--text-inverse);
}

@media (max-width: 640px) {
  .nearby-result-card {
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 14px;
    border-radius: 20px;
    padding: 14px;
  }

  .nearby-result-card__avatar {
    height: 54px;
    width: 54px;
    font-size: 16px;
  }

  .nearby-result-card__title {
    font-size: 18px;
  }

  .nearby-result-card__actions {
    grid-column: 1 / -1;
    gap: 8px;
  }

  .nearby-result-card__action {
    min-height: 40px;
    border-radius: 12px;
    font-size: 12px;
  }
}
</style>
