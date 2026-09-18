<!-- English description: Renders a compact real-product card for the reversible marketplace home variant. -->
<template>
  <article class="marketplace-home-product-card">
    <NuxtLink :to="product.href" class="marketplace-home-product-card__media">
      <NuxtImg
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.title"
        class="marketplace-home-product-card__image"
        loading="lazy"
      />
      <span
        v-else
        class="marketplace-home-product-card__fallback"
        :style="{ background: product.background }"
      >
        <Icon :name="product.icon" class="h-10 w-10" />
      </span>
      <span
        v-if="conditionLabel"
        class="marketplace-home-product-card__condition"
      >
        {{ conditionLabel }}
      </span>
    </NuxtLink>

    <div class="marketplace-home-product-card__body">
      <p
        v-if="product.categoryLabel"
        class="marketplace-home-product-card__category"
      >
        {{ product.categoryLabel }}
      </p>
      <NuxtLink
        :to="product.href"
        class="marketplace-home-product-card__title"
        :title="product.title"
      >
        {{ product.title }}
      </NuxtLink>
      <p class="marketplace-home-product-card__price">{{ price }}</p>
      <p v-if="points" class="marketplace-home-product-card__points">
        <Icon name="i-ph-coins-fill" class="h-4 w-4" />
        {{ points }}
      </p>
      <div class="marketplace-home-product-card__meta">
        <span class="truncate">{{ product.seller }}</span>
        <span
          v-if="product.location"
          class="marketplace-home-product-card__location"
        >
          <Icon name="i-ph-map-pin" class="h-3.5 w-3.5" />
          <span class="truncate">{{ product.location }}</span>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  formatProductPoints,
  formatProductPrice,
} from "../../application/formatters/product-currency";
import type { ProductListing } from "../../domain/types/product-marketplace.types";

const props = defineProps<{
  product: ProductListing;
}>();

const { locale, t } = useI18n();
const price = computed(() => formatProductPrice(props.product, locale.value));
const points = computed(() =>
  props.product.point > 0
    ? formatProductPoints(props.product, locale.value)
    : "",
);
const conditionLabel = computed(() => {
  if (props.product.condition === "Used") {
    return t("pages.productEditor.conditionUsed");
  }

  if (props.product.condition === "New") {
    return t("pages.productEditor.conditionNew");
  }

  return props.product.condition;
});
</script>

<style scoped>
.marketplace-home-product-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.marketplace-home-product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.marketplace-home-product-card__media {
  position: relative;
  display: block;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--bg-muted);
}

.marketplace-home-product-card__image,
.marketplace-home-product-card__fallback {
  width: 100%;
  height: 100%;
}

.marketplace-home-product-card__image {
  object-fit: cover;
  transition: transform 0.2s ease;
}

.marketplace-home-product-card:hover .marketplace-home-product-card__image {
  transform: scale(1.03);
}

.marketplace-home-product-card__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-media);
}

.marketplace-home-product-card__condition {
  position: absolute;
  top: 10px;
  left: 10px;
  max-width: calc(100% - 20px);
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  padding: 4px 8px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marketplace-home-product-card__body {
  display: grid;
  flex: 1;
  gap: 7px;
  padding: 13px;
}

.marketplace-home-product-card__category {
  overflow: hidden;
  margin: 0;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marketplace-home-product-card__title {
  display: -webkit-box;
  min-height: 40px;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: var(--weight-semibold);
  line-height: 1.45;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.marketplace-home-product-card__title:hover {
  color: var(--text-brand);
}

.marketplace-home-product-card__price {
  overflow: hidden;
  margin: 0;
  color: var(--text-brand);
  font-size: 16px;
  font-weight: var(--weight-bold);
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marketplace-home-product-card__points {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 18px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: var(--weight-semibold);
}

.marketplace-home-product-card__meta {
  display: grid;
  gap: 5px;
  min-width: 0;
  padding-top: 8px;
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.35;
}

.marketplace-home-product-card__location {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.marketplace-home-product-card__location svg {
  flex: 0 0 auto;
  color: var(--icon-secondary);
}
</style>
