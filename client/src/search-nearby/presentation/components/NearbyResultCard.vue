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
    <div class="nearby-result-card__content">
      <div class="nearby-result-card__header">
        <div class="nearby-result-card__avatar">
          <img v-if="item.avatarUrl" :src="item.avatarUrl" :alt="item.title">
          <span v-else>{{ initials }}</span>
        </div>

        <div class="nearby-result-card__identity">
          <h2 class="nearby-result-card__title">{{ item.title }}</h2>
          <p class="nearby-result-card__subtitle">{{ item.subtitle }}</p>
        </div>

        <div class="nearby-result-card__facts">
          <span class="nearby-result-card__distance">{{ distanceLabel }}</span>
          <span v-if="coordinateLabel" class="nearby-result-card__coordinates">
            <Icon name="i-ph-crosshair-simple-fill" />
            <span>{{ coordinateLabel }}</span>
          </span>
        </div>
      </div>
      <p class="nearby-result-card__location">
        <Icon name="i-ph-map-pin-fill" />
        <span>{{ item.locationLabel || coordinateLabel }}</span>
      </p>

      <div class="nearby-result-card__actions">
        <button
          class="nearby-result-card__action"
          type="button"
          @click.stop="$emit('focusOrigin')"
        >
          {{ t("pages.searchNearby.myLocation") }}
        </button>
        <button
          class="nearby-result-card__action nearby-result-card__action--primary"
          type="button"
          @click.stop="$emit('directions', item)"
        >
          {{ t("pages.searchNearby.directions") }}
        </button>
        <button class="nearby-result-card__action" type="button" @click.stop="shareResult">
          {{ t("pages.searchNearby.share") }}
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
  focusOrigin: []
  directions: [item: NearbySearchItem]
}>()

const { t } = useI18n()

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

  return `${props.item.lat},${props.item.lng}`
})

async function shareResult() {
  if (!import.meta.client) {
    return
  }

  const detailUrl = props.item.type === "place"
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.item.locationLabel || props.item.title)}`
    : new URL(props.item.href, window.location.origin).toString()
  const payload = {
    title: props.item.title,
    text: props.item.locationLabel || props.item.subtitle || props.item.title,
    url: detailUrl,
  }

  if (navigator.share) {
    await navigator.share(payload).catch(() => {})
    return
  }

  await navigator.clipboard?.writeText(detailUrl).catch(() => {})
}
</script>

<style scoped>
.nearby-result-card {
  display: block;
  width: 100%;
  border: 2px solid color-mix(in srgb, var(--bg-brand) 22%, var(--border-default));
  border-radius: 20px;
  background: color-mix(in srgb, var(--bg-surface) 96%, transparent);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  padding: 16px;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.nearby-result-card:hover,
.nearby-result-card--active {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-xl);
  transform: translateY(-1px);
}

.nearby-result-card__header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.nearby-result-card__avatar {
  display: flex;
  height: 52px;
  width: 52px;
  flex: 0 0 52px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--color-primary-100) 0%, var(--color-primary-200) 100%);
  color: var(--text-link);
  font-size: 16px;
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

.nearby-result-card__identity {
  min-width: 0;
  flex: 1 1 auto;
}

.nearby-result-card__facts {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.nearby-result-card__distance,
.nearby-result-card__coordinates {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  background: var(--bg-surface-active);
  color: var(--text-link);
  font-size: var(--text-caption);
  font-weight: var(--weight-extrabold);
  padding: 6px 12px;
}

.nearby-result-card__coordinates {
  max-width: 220px;
  color: var(--text-secondary);
}

.nearby-result-card__coordinates span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-result-card__title {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: var(--weight-extrabold);
  line-height: 1.2;
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

.nearby-result-card__subtitle {
  margin-top: 3px;
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
  margin-top: 18px;
}

.nearby-result-card__action {
  display: inline-flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: var(--color-secondary-50);
  color: var(--color-secondary-800);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--weight-extrabold);
  line-height: 1.15;
  text-decoration: none;
  text-align: center;
  touch-action: manipulation;
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
    border-width: 1px;
    border-radius: 16px;
    padding: 12px;
  }

  .nearby-result-card__header {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
  }

  .nearby-result-card__avatar {
    height: 44px;
    width: 44px;
    flex-basis: 44px;
    font-size: 14px;
  }

  .nearby-result-card__identity {
    min-width: 0;
  }

  .nearby-result-card__facts {
    grid-column: 1 / -1;
    justify-content: flex-start;
    gap: 6px;
  }

  .nearby-result-card__title {
    font-size: 16px;
  }

  .nearby-result-card__subtitle,
  .nearby-result-card__location {
    font-size: 12px;
  }

  .nearby-result-card__location {
    align-items: flex-start;
    white-space: normal;
  }

  .nearby-result-card__location span {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .nearby-result-card__distance,
  .nearby-result-card__coordinates {
    max-width: 100%;
    padding: 5px 9px;
    font-size: 11px;
  }

  .nearby-result-card__actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    margin-top: 12px;
  }

  .nearby-result-card__action {
    min-height: 38px;
    border-radius: 10px;
    padding: 0 6px;
    font-size: 11px;
  }
}

@media (max-width: 380px) {
  .nearby-result-card__actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
  }

  .nearby-result-card__action {
    min-height: 36px;
    padding: 0 4px;
    font-size: 10px;
  }
}
</style>
