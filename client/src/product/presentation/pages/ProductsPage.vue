<!-- English description: Wowonder-parity marketplace product listing page backed by PHP product APIs. -->

<template>
  <div class="products-page mx-auto max-w-[1180px] pb-16">
    <section class="products-hero relative overflow-hidden">
      <div class="relative flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <div class="products-hero__badge">
            <Icon name="i-ph-storefront-fill" class="h-6 w-6" />
          </div>
          <div class="min-w-0">
            <h1 class="products-hero__title truncate text-slate-950">
              {{ $t("pages.productsPage.marketTitle") }}
            </h1>
            <p class="products-hero__description mt-1.5 line-clamp-2 max-w-3xl text-[var(--text-secondary)]">
              {{ $t("pages.productsPage.marketDescription") }}
            </p>
          </div>
        </div>

        <NuxtLink to="/my-products" class="products-hero__link">
          <Icon name="i-ph-shopping-bag-open-fill" class="h-5 w-5" />
          <span>{{ $t("pages.productsPage.myProducts") }}</span>
          <Icon name="i-ph-arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </section>

    <section class="products-filter relative mt-3 border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div class="products-filter__top">
        <div class="products-filter__search">
          <UInput v-model="search" class="w-full" icon="i-ph-magnifying-glass" size="lg"
            :placeholder="$t('pages.productsPage.searchPlaceholder')"
            :ui="{ base: 'h-12 rounded-xl border-slate-200 bg-slate-50 text-[14px] font-medium' }" />
        </div>
      </div>

      <div class="products-filter__panel" :class="{ 'products-filter__panel--with-subcategory': hasSubCategories }">
        <USelect v-model="sortBy" class="w-full" :items="sortOptions" value-key="value" label-key="label" size="lg"
          :ui="{ base: 'h-12 rounded-xl border-slate-200 bg-slate-50 text-[13px] font-semibold' }" />

        <USelect v-model="selectedCategory" class="w-full" :items="categoryOptions" value-key="value" label-key="label" size="lg"
          :ui="categorySelectUi" />

        <USelect v-if="hasSubCategories" v-model="selectedSubCategory" class="w-full" :items="subCategoryOptions" value-key="value"
          label-key="label" size="lg"
          :ui="categorySelectUi" />

        <div class="products-filter__distance">
          <div class="flex items-center justify-between gap-3 text-[12px] font-semibold text-[var(--text-secondary)]">
            <span class="inline-flex min-w-0 items-center gap-1.5">
              <Icon name="i-ph-map-pin-duotone" class="h-4 w-4 shrink-0 text-primary-600" />
              <span class="truncate">{{ $t("pages.productsPage.locationDistance") }}</span>
            </span>
            <span class="shrink-0 text-[var(--text-primary)]">{{ distanceRange }} km</span>
          </div>
          <input v-model.number="distanceRange" type="range" min="0" max="300"
            class="products-filter__range mt-2 w-full" @change="applyDistance">
        </div>

        <NuxtLink :to="appRoutes.searchNearby" class="products-filter__nearby">
          <Icon name="i-ph-map-pin-area-fill" class="h-5 w-5 shrink-0" />
          <span>{{ $t("pages.productsPage.nearbyStoresButton") }}</span>
        </NuxtLink>
      </div>
    </section>


    <div v-if="status === 'pending'"
      class="mt-4 grid grid-cols-2 gap-4 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      <div v-for="index in 8" :key="index" class="rounded-2xl border border-slate-200 bg-white p-3">
        <USkeleton class="aspect-square rounded-xl" />
        <USkeleton class="mt-3 h-4 w-4/5 rounded-full" />
        <USkeleton class="mt-2 h-5 w-1/2 rounded-full" />
      </div>
    </div>

    <UAlert v-else-if="error" class="mt-4" color="error" variant="soft" icon="i-ph-warning-circle"
      :title="$t('pages.productsPage.loadErrorTitle')" :description="String(error)" />

    <div v-else-if="visibleProducts.length > 0"
      class="mt-4 grid grid-cols-2 gap-4 min-[520px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      <article v-for="product in visibleProducts" :key="product.id"
        class="market-product-card group overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm">
        <div class="market-product-image relative aspect-square overflow-visible bg-slate-100">
          <NuxtLink :to="product.href" class="block h-full overflow-hidden rounded-t-[10px]">
            <NuxtImg v-if="product.imageUrl" :src="product.imageUrl" :alt="product.title"
              class="h-full w-full object-cover" loading="lazy" />
            <div v-else class="flex h-full w-full items-center justify-center text-white"
              :style="{ background: product.background }">
              <Icon :name="product.icon" class="h-16 w-16 opacity-80" />
            </div>
          </NuxtLink>

          <div v-if="!product.mine"
            class="market-product-overlay pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-t-[10px] px-10">
            <NuxtLink
              class="market-product-more pointer-events-auto inline-flex h-10 items-center justify-center rounded-[4px] px-5 text-[15px] font-semibold"
              :to="product.href" @pointerdown.stop @click.stop>
              {{ $t("pages.productsPage.moreInfo") }}
            </NuxtLink>
          </div>

          <div class="market-product-actions">
            <NuxtLink v-if="product.mine"
              class="market-product-action-btn market-product-action-muted inline-flex items-center justify-center text-[var(--text-primary)] transition"
              :to="product.href" :title="$t('pages.productsPage.moreInfo')" @pointerdown.stop @click.stop>
              <Icon name="i-ph-info-fill" class="h-[29px] w-[29px]" />
            </NuxtLink>
            <button v-if="!product.mine" type="button"
              class="market-product-action-btn market-product-action-muted inline-flex items-center justify-center text-[var(--text-primary)] transition disabled:opacity-60"
              :title="$t('pages.productsPage.messageSeller')" :disabled="!product.canContactSeller"
              @pointerdown.stop @click.stop="openSellerChat(product)">
              <Icon name="i-ph-chat-text-fill" class="h-[29px] w-[29px]" />
            </button>
            <button v-if="!product.mine" type="button"
              class="market-product-action-btn market-product-action-primary inline-flex items-center justify-center text-white transition disabled:opacity-60"
              :title="$t('pages.productsPage.addToCart')"
              :disabled="!product.canAddToCart || cartLoadingProductId === product.id" @pointerdown.stop
              @click.stop="addToCart(product.id)">
              <Icon name="i-ph-shopping-cart-simple-fill" class="h-[29px] w-[29px]" />
            </button>
          </div>
        </div>

        <div class="market-product-body">
          <NuxtLink :to="product.href"
            class="line-clamp-2 min-h-[40px] text-[14px] font-semibold leading-5 text-[var(--text-primary)] hover:text-primary-600"
            :title="product.title">
            {{ product.title }}
          </NuxtLink>
          <div class="market-product-price mt-2 text-[18px] font-bold">
            {{ formatProductCurrency(product) }}
          </div>
          <div class="mt-2 flex items-center justify-between gap-2 text-[12px] font-medium text-[var(--text-secondary)]">
            <span class="truncate">{{ product.seller }}</span>
            <span>{{ product.condition }}</span>
          </div>
          <div v-if="product.location || formatDistance(product.distanceKm)"
            class="mt-2 flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
            <Icon name="i-ph-map-pin" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ product.location }}</span>
            <span v-if="formatDistance(product.distanceKm)" class="shrink-0">· {{ formatDistance(product.distanceKm)
              }}</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="mt-4 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-[var(--text-secondary)]">
      <Icon name="i-ph-shopping-bag-open" class="mx-auto h-10 w-10" />
      <p class="mt-3 text-[15px] font-semibold">
        {{ $t("pages.productsPage.emptyTitle") }}
      </p>
    </div>

    <div v-if="hasMore && status !== 'pending'" class="mt-6 flex justify-center">
      <UButton color="neutral" variant="outline" size="lg" class="rounded-xl px-6 text-[13px] font-semibold"
        icon="i-ph-arrow-down" :loading="isLoadingMore" @click="loadMore">
        {{ $t("pages.productsPage.loadMore") }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useProductMarketplace } from "../../application/composables/useProductMarketplace"

const { t } = useI18n()

const categorySelectUi = {
  base: "min-h-12 h-auto rounded-xl border-slate-200 bg-slate-50 py-2 text-left text-[13px] font-semibold",
  value: "overflow-visible text-clip whitespace-normal break-words text-left leading-5",
  placeholder: "overflow-visible text-clip whitespace-normal break-words text-left leading-5",
  item: "min-h-10",
  itemLabel: "overflow-visible text-clip whitespace-normal break-words leading-5",
}

useSeoMeta({
  title: () => t("pages.productsPage.seoTitle"),
  description: () => t("pages.productsPage.seoDescription"),
})

const {
  search,
  sortBy,
  selectedCategory,
  selectedSubCategory,
  distanceRange,
  sortOptions,
  categoryOptions,
  subCategoryOptions,
  hasSubCategories,
  currentSortLabel,
  resultHeading,
  visibleProducts,
  status,
  error,
  hasMore,
  cartLoadingProductId,
  isLoadingMore,
  formatProductCurrency,
  formatDistance,
  resetFilters,
  applyDistance,
  addToCart,
  loadMore,
  openSellerChat,
} = useProductMarketplace()
</script>

<style scoped>
.products-page {
  --product-brand: var(--color-brand, var(--bg-brand));
  --product-brand-gradient: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--product-brand) 100%);
}

.products-hero {
  border: 1px solid color-mix(in srgb, var(--bg-brand) 6%, transparent);
  border-radius: 18px;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--bg-brand) 8%, transparent), rgba(255, 255, 255, 0) 46%),
    #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  isolation: isolate;
}

.products-hero::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  content: "";
  background: var(--product-brand-gradient);
  pointer-events: none;
}

.products-hero::after {
  position: absolute;
  right: -36px;
  bottom: -112px;
  width: 220px;
  height: 220px;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 6%, transparent);
  border-radius: 50%;
  content: "";
  pointer-events: none;
}

.products-hero__glow {
  position: absolute;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

.products-hero__glow--left {
  bottom: 14px;
  left: 28px;
  width: 68px;
  height: 68px;
}

.products-hero__glow--right {
  top: 18px;
  right: 26%;
  width: 30px;
  height: 30px;
  opacity: 0.8;
}

.products-hero__badge {
  display: inline-flex;
  width: 46px;
  min-width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 10%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--product-brand);
}

.products-hero__title {
  font-size: 34px;
  font-weight: 800;
  line-height: 1.05;
}

.products-hero__description {
  font-size: 18px;
  font-weight: 650;
  line-height: 1.45;
}

.products-hero__link {
  display: inline-flex;
  width: fit-content;
  min-width: max-content;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 12%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--product-brand);
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s ease;
}

.products-hero__link:hover {
  background: var(--product-brand);
  color: #fff;
  transform: translateY(-1px);
}

.products-filter {
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
  z-index: 2;
}

.products-filter__search {
  flex: 1;
  min-width: 0;
}

.products-filter__top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.products-filter__nearby {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 12%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--product-brand);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.products-filter__nearby:hover,
.products-filter__nearby:focus-visible {
  border-color: var(--product-brand);
  background: var(--product-brand);
  color: #ffffff;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 18%, transparent);
}

.products-filter__reset-icon {
  display: inline-flex;
  width: 48px;
  min-width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 12%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--product-brand);
  transition: all 0.15s ease;
}

.products-filter__reset-icon:hover,
.products-filter__reset-icon:focus-visible {
  border-color: var(--product-brand);
  background: var(--product-brand);
  color: #fff;
}

.products-filter__panel {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(140px, 1fr) minmax(240px, 1.6fr) auto;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.products-filter__panel--with-subcategory {
  grid-template-columns: minmax(120px, 0.7fr) minmax(120px, 0.7fr) minmax(120px, 0.7fr) minmax(200px, 1.2fr) auto;
}

.products-filter__distance {
  min-height: 48px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fafbfe 100%);
}

.products-filter__range {
  accent-color: var(--product-brand);
}

@media (max-width: 1023px) {
  .products-filter__panel,
  .products-filter__panel--with-subcategory {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .products-filter__distance {
    grid-column: auto;
  }

  .products-filter__nearby {
    min-height: 48px;
  }
}

@media (max-width: 767px) {
  .products-hero__title {
    font-size: 28px;
  }

  .products-hero__description {
    font-size: 16px;
  }

  .products-hero__link {
    width: 100%;
  }

  .products-filter__panel,
  .products-filter__panel--with-subcategory {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .products-filter__search {
    width: 100%;
  }

  .products-filter__nearby {
    width: 100%;
    min-height: 48px;
  }

  .products-filter__distance {
    grid-column: auto;
  }
}

.market-product-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.market-product-card:hover {
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
  transform: translateY(-2px);
}

.market-product-image {
  isolation: isolate;
  z-index: 1;
}

.market-product-overlay {
  background-color: rgba(0, 0, 0, 0.41);
  opacity: 0;
  z-index: 5;
  transition: opacity 0.3s cubic-bezier(0.33, 0.66, 0.66, 1);
}

.market-product-card:hover .market-product-overlay {
  opacity: 1;
}

.market-product-more {
  position: relative;
  z-index: 6;
  min-width: 132px;
  height: 44px;
  background-color: rgba(255, 255, 255, 0.35);
  border-radius: 8px;
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(4px);
  touch-action: manipulation;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.market-product-price {
  color: var(--product-brand);
}

.market-product-more:hover {
  background-color: #fff;
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.market-product-actions :deep(a),
.market-product-actions :deep(button) {
  margin: 0 2px;
}

.market-product-actions {
  position: absolute;
  right: 12px;
  bottom: -20px;
  left: 12px;
  z-index: 30;
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  pointer-events: none;
}

.market-product-body {
  padding: 36px 12px 12px;
}

.market-product-action-btn {
  position: relative;
  z-index: 31;
  display: inline-flex;
  width: 44px;
  min-width: 44px;
  height: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  line-height: 1;
  pointer-events: auto;
  touch-action: manipulation;
}

.market-product-action-muted {
  background-color: #dfe5ee;
}

.market-product-action-muted:hover {
  background-color: #d3dbe7;
}

.market-product-action-primary {
  background: var(--product-brand-gradient);
}
</style>
