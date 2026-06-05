<!-- English description: Wowonder-aligned my-products page backed by the product API bridge. -->

<template>
  <div class="my-products-page mx-auto w-full max-w-[1520px] px-3 pb-12 pt-4 sm:px-4">
    <section class="my-products-nav">
      <nav class="my-products-tabs" :aria-label="$t('pages.myProductsPage.title')">
        <NuxtLink
          v-for="item in storeTabs"
          :key="item.to"
          :to="item.to"
          class="my-products-tab"
          :class="{ 'my-products-tab--active': item.active }"
        >
          <Icon :name="item.icon" class="my-products-tab__icon" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <UButton
        to="/new-product"
        color="primary"
        icon="i-ph-plus-bold"
        class="my-products-create"
      >
        {{ $t("pages.myProductsPage.create") }}
      </UButton>
    </section>

    <section class="my-products-filters">
      <UInput
        v-model="search"
        type="search"
        icon="i-ph-magnifying-glass"
        size="lg"
        :placeholder="$t('pages.myProductsPage.searchPlaceholder')"
        :ui="{ base: 'h-11 rounded-xl' }"
      />

      <USelect
        v-model="sortBy"
        :items="sortOptions"
        value-key="value"
        label-key="label"
        :placeholder="$t('pages.myProductsPage.sortBy')"
        class="my-products-select"
      />
      <USelect
        v-model="selectedCategory"
        :items="categoryOptions"
        value-key="value"
        label-key="label"
        :placeholder="$t('pages.myProductsPage.allCategories')"
        class="my-products-select"
      />
    </section>

    <section v-if="status === 'pending'" class="my-products-grid">
      <div v-for="index in 8" :key="index" class="my-product-card">
        <USkeleton class="my-product-card__image" />
        <div class="my-product-card__info">
          <USkeleton class="h-5 w-4/5 rounded" />
          <USkeleton class="mt-2 h-5 w-24 rounded" />
        </div>
      </div>
    </section>

    <UAlert
      v-else-if="error"
      class="mt-5"
      color="error"
      variant="soft"
      icon="i-ph-warning-circle-duotone"
      :title="$t('pages.myProductsPage.loadErrorTitle')"
      :description="String(error)"
    />

    <section v-else-if="visibleProducts.length" class="my-products-grid">
      <article
        v-for="product in visibleProducts"
        :id="`product_${product.id}`"
        :key="product.id"
        class="my-product-card"
      >
        <NuxtLink :to="product.href || '/products'" class="my-product-card__link">
          <div class="my-product-card__image">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.title"
              loading="lazy"
            >
            <div v-else class="my-product-card__fallback" :style="{ background: product.background }">
              <Icon :name="product.icon" class="h-9 w-9 text-white" />
            </div>
          </div>

          <div class="my-product-card__info">
            <span :title="product.title" class="my-product-card__title">
              {{ product.title }}
            </span>
            <strong class="my-product-card__price">
              {{ formatProductCurrency(product) }}
            </strong>
          </div>
        </NuxtLink>

        <div class="my-product-card__actions">
          <UButton
            class="my-product-card__action"
            :to="appRoutes.editProduct(product.id)"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-ph-pencil-simple-fill"
            :aria-label="$t('pages.myProductsPage.edit')"
          />
          <UButton
            type="button"
            class="my-product-card__action my-product-card__action--danger"
            color="neutral"
            variant="soft"
            size="sm"
            :disabled="deletingProductId === product.id"
            :loading="deletingProductId === product.id"
            :icon="deletingProductId === product.id ? 'i-ph-spinner-gap' : 'i-ph-trash-fill'"
            :aria-label="$t('pages.myProductsPage.delete')"
            @click="confirmDeleteProduct(product.id)"
          />
        </div>
      </article>
    </section>

    <section v-else class="my-products-empty">
      <Icon name="i-ph-shopping-cart-simple" class="h-7 w-7" />
      <span>{{ $t("pages.myProductsPage.emptyTitle") }}</span>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useMyProductsOverview } from "../../application/composables/useMyProductsOverview"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"

const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.myProductsPage.seoTitle"),
  description: () => t("pages.myProductsPage.seoDescription"),
})

const {
  visibleProducts,
  status,
  error,
  search,
  sortBy,
  selectedCategory,
  categoryOptions,
  sortOptions,
  deletingProductId,
  formatProductCurrency,
  deleteProduct,
} = useMyProductsOverview()

const storeTabs = computed(() => [
  {
    label: t("pages.myProductsPage.myProducts"),
    to: appRoutes.myProducts,
    icon: "i-ph-shopping-bag",
    active: true,
  },
  {
    label: t("pages.myProductsPage.purchased"),
    to: appRoutes.purchased,
    icon: "i-ph-receipt",
    active: false,
  },
  {
    label: t("pages.myProductsPage.orders"),
    to: appRoutes.orders,
    icon: "i-ph-list-checks",
    active: false,
  },
  {
    label: t("pages.myProductsPage.marketplace"),
    to: appRoutes.products,
    icon: "i-ph-planet",
    active: false,
  },
])

const confirmDeleteProduct = (productId: number) => {
  if (import.meta.client && !window.confirm(t("pages.myProductsPage.deleteConfirm"))) {
    return
  }

  deleteProduct(productId)
}
</script>

<style scoped>
.my-products-page {
  --product-brand: var(--color-brand, #0000ff);
  --product-card: var(--surface-card, #ffffff);
  --product-border: var(--border-light, #e2e8f0);
  --product-text: var(--text-primary, #0f172a);
  --product-muted: var(--text-tertiary, #64748b);
}

.my-products-heading,
.my-products-nav,
.my-products-filters,
.my-products-empty {
  border: 1px solid var(--product-border);
  border-radius: 16px;
  background: var(--product-card);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.my-products-heading {
  min-height: 80px;
}

.my-products-heading__inner {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 80px;
  padding: 18px 24px;
}

.my-products-heading__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: #ffffff;
  background: linear-gradient(180deg, #2233ff 0%, var(--product-brand) 100%);
}

.my-products-heading__eyebrow {
  margin: 0;
  color: var(--product-text);
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
}

.my-products-heading__title {
  margin: 7px 0 0;
  color: var(--product-text);
  font-size: 28px;
  font-weight: 900;
  line-height: 1.1;
}

.my-products-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 74px;
  margin-top: 22px;
  padding: 0 12px;
}

.my-products-tabs {
  display: flex;
  align-items: stretch;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  padding-bottom: 7px;
  scrollbar-color: #9eb1cc transparent;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
}

.my-products-tabs::-webkit-scrollbar {
  height: 6px;
}

.my-products-tabs::-webkit-scrollbar-track {
  background: transparent;
}

.my-products-tabs::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #9eb1cc;
}

.my-products-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 74px;
  flex: 0 0 auto;
  gap: 8px;
  padding: 0 13px;
  color: #555555;
  font-size: 18px;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  text-decoration: none;
  white-space: nowrap;
  scroll-snap-align: start;
  transition: color 0.16s ease, background 0.16s ease;
}

.my-products-tab:hover {
  color: var(--product-brand);
  background: rgba(0, 0, 255, 0.04);
}

.my-products-tab__icon {
  width: 19px;
  height: 19px;
  flex: 0 0 auto;
}

.my-products-tab--active {
  color: #555555;
  font-weight: 800;
}

.my-products-tab--active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 4px;
  background: var(--product-brand);
  content: "";
}

.my-products-create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 128px;
  height: 42px;
  padding: 0 18px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(180deg, #2233ff 0%, var(--product-brand) 100%);
  box-shadow: 0 3px 8px rgba(0, 0, 255, 0.28);
  font-size: 17px;
  font-weight: 700;
  text-decoration: none;
}

.my-products-filters {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 220px 240px;
  gap: 12px;
  margin-top: 18px;
  padding: 14px;
}

.my-products-select {
  min-width: 0;
}

.my-products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-top: 26px;
}

.my-product-card {
  position: relative;
  min-width: 0;
}

.my-product-card__link {
  display: block;
  overflow: hidden;
  border: 1px solid var(--product-border);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  text-decoration: none;
}

.my-product-card__link:hover {
  text-decoration: none;
}

.my-product-card__image {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #eef3fb;
}

.my-product-card__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.my-product-card__fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.my-product-card__info {
  padding: 10px 12px 12px;
}

.my-product-card__title {
  display: block;
  overflow: hidden;
  color: var(--product-text);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-product-card__price {
  display: block;
  overflow: hidden;
  margin-top: 7px;
  color: var(--product-brand);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-product-card__actions {
  position: absolute;
  top: 7px;
  right: 7px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.my-product-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  color: var(--product-text);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
  transition: all 0.15s ease;
}

.my-product-card__action:hover {
  color: var(--product-brand);
  transform: translateY(-1px);
}

.my-product-card__action--danger:hover {
  color: #dc2626;
}

.my-product-card__action:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.my-products-empty {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
  color: var(--product-muted);
  font-size: 18px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .my-products-filters {
    grid-template-columns: 1fr;
  }

  .my-products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .my-products-heading__title {
    font-size: 24px;
  }

  .my-products-nav {
    align-items: stretch;
    flex-direction: column;
    overflow: hidden;
    padding: 0 12px 12px;
  }

  .my-products-nav::after {
    position: absolute;
    top: 1px;
    right: 0;
    height: 74px;
    width: 34px;
    pointer-events: none;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), var(--product-card) 78%);
    content: "";
  }

  .my-products-tabs {
    width: 100%;
    padding-right: 36px;
  }

  .my-products-create {
    width: 100%;
  }

  .my-products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}
</style>
