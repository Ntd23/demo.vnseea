<!-- English description: Displays a backend offer card with phtml-compatible actions and post links. -->
<template>
  <article class="offer-card">
    <NuxtLink :to="offer.postUrl" class="offer-card__media" :aria-label="offerTitle">
      <NuxtImg
        v-if="offer.imageUrl"
        :src="offer.imageUrl"
        :alt="offerTitle"
        class="offer-card__image"
        loading="lazy"
      />
      <Icon v-else name="i-ph-tag-chevron-duotone" class="offer-card__image-fallback" />
    </NuxtLink>

    <div class="offer-card__body">
      <div class="offer-card__top">
        <div class="min-w-0">
          <p class="offer-card__eyebrow">
            <Icon name="i-ph-calendar-check-duotone" class="h-4 w-4" />
            <span>{{ t("offers.card.endsAt", { date: offer.expireDate }) }}</span>
          </p>
          <NuxtLink :to="offer.postUrl" class="offer-card__title-link">
            <h3 class="offer-card__title">{{ offerTitle }}</h3>
          </NuxtLink>
        </div>
        <UBadge color="primary" variant="soft" class="offer-card__badge">
          {{ offer.offerText || t("offers.discountTypes.free_shipping") }}
        </UBadge>
      </div>

      <p v-if="offer.description" class="offer-card__description">{{ offer.description }}</p>

      <div class="offer-card__footer">
        <NuxtLink v-if="offer.page?.slug" :to="appRoutes.pageDetail(offer.page.slug)" class="offer-card__page">
          <img v-if="offer.page.avatarUrl" :src="offer.page.avatarUrl" :alt="offer.page.name" class="offer-card__page-avatar">
          <span v-else class="offer-card__page-avatar offer-card__page-avatar--empty">{{ offer.page.name.slice(0, 1).toUpperCase() }}</span>
          <span>{{ offer.page.name }}</span>
        </NuxtLink>
        <div v-else-if="offer.page" class="offer-card__page">
          <img v-if="offer.page.avatarUrl" :src="offer.page.avatarUrl" :alt="offer.page.name" class="offer-card__page-avatar">
          <span v-else class="offer-card__page-avatar offer-card__page-avatar--empty">{{ offer.page.name.slice(0, 1).toUpperCase() }}</span>
          <span>{{ offer.page.name }}</span>
        </div>

        <div v-if="offer.canEdit || offer.canDelete" class="offer-card__actions">
          <UButton
            v-if="offer.canEdit"
            type="button"
            color="neutral"
            variant="soft"
            icon="i-ph-pencil-simple-duotone"
            size="sm"
            class="rounded-full"
            @click="$emit('edit', offer)"
          >
            {{ t("offers.actions.edit") }}
          </UButton>
          <UButton
            v-if="offer.canDelete"
            type="button"
            color="error"
            variant="soft"
            icon="i-ph-trash-duotone"
            size="sm"
            class="rounded-full"
            :loading="deleting"
            @click="$emit('delete', offer.id)"
          >
            {{ t("offers.actions.delete") }}
          </UButton>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { Offer } from "../../domain/types/offer.types"

const props = defineProps<{
  offer: Offer
  deleting?: boolean
}>()

defineEmits<{
  edit: [offer: Offer]
  delete: [offerId: number]
}>()

const { t } = useI18n()
const offerTitle = computed(() =>
  [props.offer.offerText, props.offer.discountedItems].filter(Boolean).join(" ") || t("offers.card.fallbackTitle"),
)
</script>

<style scoped>
.offer-card {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
  padding: 14px;
  box-shadow: 0 12px 30px rgba(15, 35, 110, 0.08);
}

.offer-card__media {
  display: flex;
  min-height: 124px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #eef2ff;
}

.offer-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offer-card__image-fallback {
  width: 42px;
  height: 42px;
  color: var(--bg-brand);
}

.offer-card__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

.offer-card__top,
.offer-card__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.offer-card__eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.offer-card__title-link {
  color: inherit;
  text-decoration: none;
}

.offer-card__title {
  margin: 0;
  color: #020617;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
}

.offer-card__badge {
  flex-shrink: 0;
  border-radius: 999px;
}

.offer-card__description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #64748b;
  font-size: 14px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.offer-card__page {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  color: #000000;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.offer-card__page-avatar {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eef2ff;
  color: var(--bg-brand);
  object-fit: cover;
}

.offer-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 640px) {
  .offer-card {
    grid-template-columns: 1fr;
  }

  .offer-card__media {
    aspect-ratio: 16 / 9;
  }

  .offer-card__top,
  .offer-card__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .offer-card__actions {
    justify-content: flex-start;
  }
}
</style>
