<!-- English description: Shows the products published by a community page in a compact two-column, four-items-per-page sidebar card. -->
<template>
  <section class="page-products-card">
    <header class="page-products-card__head">
      <span class="page-products-card__icon">
        <Icon name="i-ph-storefront-fill" />
      </span>
      <h2>{{ t("pages.pageDetailPage.products.title") }}</h2>
    </header>

    <div v-if="pending" class="page-products-card__grid" aria-hidden="true">
      <div v-for="index in pageSize" :key="index" class="page-product page-product--skeleton">
        <USkeleton class="page-product__image" />
        <USkeleton class="h-4 w-full rounded-full" />
        <USkeleton class="h-3 w-4/5 rounded-full" />
        <USkeleton class="h-3 w-3/5 rounded-full" />
      </div>
    </div>

    <div v-else-if="products.length" class="page-products-card__body">
      <div class="page-products-card__grid">
        <NuxtLink
          v-for="product in visibleProducts"
          :key="product.id"
          :to="product.href"
          class="page-product"
        >
          <span class="page-product__media" :style="{ background: product.background }">
            <NuxtImg
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.title"
              class="page-product__image"
              loading="lazy"
              sizes="180px"
            />
            <Icon v-else :name="product.icon || 'i-ph-package-duotone'" class="page-product__fallback" />
          </span>

          <span class="page-product__name">{{ product.title }}</span>
          <span class="page-product__price">{{ formatPrice(product) }}</span>
          <span class="page-product__points">{{ formatPoints(product) }}</span>
        </NuxtLink>
      </div>

      <nav
        v-if="totalPages > 1"
        class="page-products-card__pagination"
        :aria-label="t('pages.pageDetailPage.products.paginationLabel')"
      >
        <button
          type="button"
          :disabled="currentPage === 1"
          :aria-label="t('pages.pageDetailPage.products.previousPage')"
          @click="currentPage -= 1"
        >
          <Icon name="i-ph-caret-left-bold" />
        </button>
        <span>{{ t("pages.pageDetailPage.products.pageStatus", { current: currentPage, total: totalPages }) }}</span>
        <button
          type="button"
          :disabled="currentPage === totalPages"
          :aria-label="t('pages.pageDetailPage.products.nextPage')"
          @click="currentPage += 1"
        >
          <Icon name="i-ph-caret-right-bold" />
        </button>
      </nav>
    </div>

    <p v-else class="page-products-card__empty">
      {{ t("pages.pageDetailPage.products.empty") }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { formatProductPoints, formatProductPrice } from "../../../product/application/formatters/product-currency"
import type { ProductListing } from "../../../product/domain/types/product-marketplace.types"

const props = withDefaults(defineProps<{
  products: ProductListing[]
  pending?: boolean
}>(), {
  pending: false,
})

const { locale, t } = useI18n()
const pageSize = 4
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.products.length / pageSize)))
const visibleProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return props.products.slice(start, start + pageSize)
})

const formatPrice = (product: ProductListing) => formatProductPrice(product, locale.value)
const formatPoints = (product: ProductListing) => formatProductPoints(product, locale.value)

watch(
  () => props.products.map(product => product.id).join(","),
  () => {
    currentPage.value = 1
  },
)
</script>

<style scoped>
.page-products-card {
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.page-products-card__head {
  display: flex;
  min-height: 52px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-light);
  padding: 12px 16px;
}

.page-products-card__icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-brand);
  color: var(--text-inverse);
}

.page-products-card__icon svg,
.page-products-card__icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.page-products-card__head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 900;
}

.page-products-card__body {
  padding: 12px;
}

.page-products-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
}

.page-products-card__body .page-products-card__grid {
  padding: 0;
}

.page-product {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  color: inherit;
  text-decoration: none;
}

.page-product__media,
.page-product__image {
  display: flex;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 9px;
}

.page-product__media {
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
}

.page-product__image {
  object-fit: cover;
  transition: transform 0.2s ease;
}

.page-product:hover .page-product__image {
  transform: scale(1.04);
}

.page-product__fallback {
  width: 34px;
  height: 34px;
  color: var(--text-inverse);
}

.page-product__name {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
}

.page-product__price {
  color: var(--text-danger);
  font-size: 13px;
  font-weight: 900;
  line-height: 1.25;
}

.page-product__points {
  color: var(--text-brand);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.25;
}

.page-product--skeleton {
  gap: 7px;
}

.page-products-card__empty {
  margin: 0;
  padding: 22px 16px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.page-products-card__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid var(--border-light);
  margin-top: 12px;
  padding-top: 12px;
}

.page-products-card__pagination button {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
}

.page-products-card__pagination button:hover:not(:disabled) {
  border-color: var(--border-strong);
  background: var(--bg-muted);
}

.page-products-card__pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.page-products-card__pagination span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
}
</style>
