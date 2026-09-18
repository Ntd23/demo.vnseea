<!-- English description: Presents a reversible, real-data marketplace home page without replacing the original social feed. -->
<template>
  <div class="marketplace-home">
    <section
      class="marketplace-home__hero"
      aria-labelledby="marketplace-home-title"
    >
      <div class="marketplace-home__hero-copy">
        <p class="marketplace-home__eyebrow">
          <Icon name="i-ph-storefront-duotone" class="h-4 w-4" />
          {{ t("pages.marketplaceHome.eyebrow") }}
        </p>
        <h1 id="marketplace-home-title" class="marketplace-home__title">
          {{ t("pages.marketplaceHome.title") }}
        </h1>
        <p class="marketplace-home__description">
          {{ t("pages.marketplaceHome.description") }}
        </p>
        <div class="marketplace-home__hero-actions">
          <UButton
            :to="appRoutes.products"
            size="lg"
            icon="i-ph-shopping-bag-open-fill"
          >
            {{ t("pages.marketplaceHome.browseProducts") }}
          </UButton>
          <UButton
            :to="appRoutes.newProduct"
            size="lg"
            color="neutral"
            variant="outline"
            icon="i-ph-plus-circle"
          >
            {{ t("pages.marketplaceHome.publishProduct") }}
          </UButton>
        </div>
      </div>
    </section>

    <section
      v-if="categories.length > 0 || isLoading"
      class="marketplace-home__section"
      aria-labelledby="marketplace-home-categories"
    >
      <div class="marketplace-home__section-heading">
        <div>
          <p class="marketplace-home__section-eyebrow">
            {{ t("pages.marketplaceHome.categoriesEyebrow") }}
          </p>
          <h2
            id="marketplace-home-categories"
            class="marketplace-home__section-title"
          >
            {{ t("pages.marketplaceHome.categoriesTitle") }}
          </h2>
        </div>
        <NuxtLink
          :to="appRoutes.products"
          class="marketplace-home__section-link"
        >
          {{ t("pages.marketplaceHome.viewAll") }}
          <Icon name="i-ph-arrow-right-bold" class="h-4 w-4" />
        </NuxtLink>
      </div>

      <div
        v-if="isLoading"
        class="marketplace-home__category-grid"
        aria-busy="true"
      >
        <USkeleton
          v-for="index in 8"
          :key="index"
          class="marketplace-home__category-skeleton"
        />
      </div>
      <nav
        v-else
        class="marketplace-home__category-grid"
        :aria-label="t('pages.marketplaceHome.categoriesTitle')"
      >
        <NuxtLink
          v-for="category in categories"
          :key="category.value"
          :to="getCategoryHref(category.value)"
          class="marketplace-home__category"
        >
          <span class="marketplace-home__category-icon">
            <Icon :name="category.icon" class="h-6 w-6" />
          </span>
          <span class="marketplace-home__category-label">{{
            category.label
          }}</span>
        </NuxtLink>
      </nav>
    </section>

    <section
      class="marketplace-home__section"
      aria-labelledby="marketplace-home-products"
    >
      <div class="marketplace-home__section-heading">
        <div>
          <p class="marketplace-home__section-eyebrow">
            {{ t("pages.marketplaceHome.productsEyebrow") }}
          </p>
          <h2
            id="marketplace-home-products"
            class="marketplace-home__section-title"
          >
            {{ t("pages.marketplaceHome.productsTitle") }}
          </h2>
        </div>
        <NuxtLink
          :to="appRoutes.products"
          class="marketplace-home__section-link"
        >
          {{ t("pages.marketplaceHome.viewAll") }}
          <Icon name="i-ph-arrow-right-bold" class="h-4 w-4" />
        </NuxtLink>
      </div>

      <div
        v-if="isLoading"
        class="marketplace-home__product-grid"
        aria-busy="true"
      >
        <article
          v-for="index in 8"
          :key="index"
          class="marketplace-home__product-skeleton"
        >
          <USkeleton class="marketplace-home__product-skeleton-image" />
          <USkeleton class="marketplace-home__product-skeleton-title" />
          <USkeleton class="marketplace-home__product-skeleton-price" />
        </article>
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        icon="i-ph-warning-circle"
        :title="t('pages.productsPage.loadErrorTitle')"
        :description="String(error)"
      >
        <template #actions>
          <UButton color="error" variant="soft" size="sm" @click="refresh()">
            {{ t("pages.marketplaceHome.retry") }}
          </UButton>
        </template>
      </UAlert>

      <div
        v-else-if="products.length > 0"
        class="marketplace-home__product-grid"
      >
        <MarketplaceHomeProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-else class="marketplace-home__empty">
        <Icon name="i-ph-package-duotone" class="h-10 w-10" />
        <h3>{{ t("pages.marketplaceHome.emptyTitle") }}</h3>
        <p>{{ t("pages.marketplaceHome.emptyDescription") }}</p>
        <UButton
          :to="appRoutes.newProduct"
          color="neutral"
          variant="outline"
          icon="i-ph-plus-circle"
        >
          {{ t("pages.marketplaceHome.publishProduct") }}
        </UButton>
      </div>
    </section>

    <section
      class="marketplace-home__guidance"
      aria-labelledby="marketplace-home-guidance"
    >
      <div>
        <p class="marketplace-home__section-eyebrow">
          {{ t("pages.marketplaceHome.guidanceEyebrow") }}
        </p>
        <h2
          id="marketplace-home-guidance"
          class="marketplace-home__section-title"
        >
          {{ t("pages.marketplaceHome.guidanceTitle") }}
        </h2>
      </div>
      <div class="marketplace-home__guidance-items">
        <div class="marketplace-home__guidance-item">
          <Icon name="i-ph-list-checks-duotone" class="h-6 w-6" />
          <div>
            <h3>{{ t("pages.marketplaceHome.listingInfoTitle") }}</h3>
          </div>
        </div>
        <div class="marketplace-home__guidance-item">
          <Icon name="i-ph-chat-centered-text-duotone" class="h-6 w-6" />
          <div>
            <h3>{{ t("pages.marketplaceHome.contactInfoTitle") }}</h3>
          </div>
        </div>
        <div class="marketplace-home__guidance-item">
          <Icon name="i-ph-file-text-duotone" class="h-6 w-6" />
          <div>
            <h3>{{ t("pages.marketplaceHome.policyInfoTitle") }}</h3>
          </div>
        </div>
      </div>
      <div class="marketplace-home__guidance-links">
        <NuxtLink :to="appRoutes.termsOfUse">{{
          t("pages.marketplaceHome.termsLink")
        }}</NuxtLink>
        <NuxtLink :to="appRoutes.privacyPolicy">{{
          t("pages.marketplaceHome.privacyLink")
        }}</NuxtLink>
        <NuxtLink :to="appRoutes.contactUs">{{
          t("pages.marketplaceHome.contactLink")
        }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import NavigationHeaderSearchInput from "../../../navigation/presentation/components/HeaderSearchInput.vue";
import { useMarketplaceHomePageVM } from "../../application/view-models/useMarketplaceHomePageVM";
import MarketplaceHomeProductCard from "../components/MarketplaceHomeProductCard.vue";

const { t } = useI18n();
const {
  appRoutes,
  categories,
  products,
  isLoading,
  error,
  refresh,
  getCategoryHref,
} = useMarketplaceHomePageVM();
</script>

<style scoped>
.marketplace-home {
  display: grid;
  gap: 32px;
  padding: 20px 0 44px;
}

.marketplace-home__hero {
  display: grid;
  align-items: center;
  min-height: 300px;
  padding: 26px 0 38px;
  border-bottom: 1px solid var(--border-light);
}

.marketplace-home__hero-copy {
  display: grid;
  gap: 16px;
  max-width: 610px;
}

.marketplace-home__eyebrow,
.marketplace-home__section-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--text-brand);
  font-size: var(--text-label);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.marketplace-home__title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-secondary);
  font-size: 42px;
  font-weight: var(--weight-bold);
  line-height: 1.12;
}

.marketplace-home__description,
.marketplace-home__empty p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.marketplace-home__description {
  max-width: 580px;
  font-size: 16px;
}

.marketplace-home__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.marketplace-home__section {
  display: grid;
  gap: 18px;
}

.marketplace-home__search-bar {
  width: 100%;
  max-width: 680px;
  margin-bottom: 4px;
}

.marketplace-home__section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.marketplace-home__section-heading > div {
  display: grid;
  gap: 5px;
}

.marketplace-home__section-title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-secondary);
  font-size: 22px;
  font-weight: var(--weight-bold);
  line-height: 1.25;
}

.marketplace-home__section-link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  color: var(--text-brand);
  font-size: 13px;
  font-weight: var(--weight-bold);
  text-decoration: none;
}

.marketplace-home__section-link:hover {
  color: var(--text-link);
}

.marketplace-home__category-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
}

.marketplace-home__category,
.marketplace-home__category-skeleton {
  min-width: 0;
  min-height: 112px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
}

.marketplace-home__category {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 14px 10px;
  color: var(--text-primary);
  text-align: center;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.marketplace-home__category:hover {
  border-color: var(--border-strong);
  background: var(--bg-surface-active);
  color: var(--text-brand);
  transform: translateY(-1px);
}

.marketplace-home__category-icon {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  color: var(--icon-brand);
}

.marketplace-home__category-label {
  display: -webkit-box;
  overflow: hidden;
  font-size: 13px;
  font-weight: var(--weight-semibold);
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.marketplace-home__product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.marketplace-home__product-skeleton {
  display: grid;
  gap: 11px;
}

.marketplace-home__product-skeleton-image {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
}

.marketplace-home__product-skeleton-title {
  width: 84%;
  height: 18px;
  border-radius: var(--radius-full);
}

.marketplace-home__product-skeleton-price {
  width: 52%;
  height: 18px;
  border-radius: var(--radius-full);
}

.marketplace-home__empty {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 48px 20px;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-xl);
  background: var(--bg-muted);
  text-align: center;
}

.marketplace-home__empty svg {
  color: var(--icon-secondary);
}

.marketplace-home__empty h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: var(--weight-bold);
}

.marketplace-home__empty p {
  max-width: 480px;
}

.marketplace-home__guidance {
  display: grid;
  grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.7fr);
  gap: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.marketplace-home__guidance > div:first-child {
  display: grid;
  align-content: start;
  gap: 5px;
}

.marketplace-home__guidance-items {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.marketplace-home__guidance-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 10px;
}

.marketplace-home__guidance-item > svg {
  margin-top: 2px;
  color: var(--icon-brand);
}

.marketplace-home__guidance-item h3 {
  margin: 0 0 5px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: var(--weight-bold);
  line-height: 1.35;
}

.marketplace-home__guidance-links {
  display: flex;
  grid-column: 2;
  flex-wrap: wrap;
  gap: 14px;
}

.marketplace-home__guidance-links a {
  color: var(--text-link);
  font-size: 13px;
  font-weight: var(--weight-semibold);
  text-decoration: none;
}

.marketplace-home__guidance-links a:hover {
  text-decoration: underline;
}

@media (max-width: 1023px) {
  .marketplace-home__category-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .marketplace-home__product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .marketplace-home__guidance {
    grid-template-columns: 1fr;
  }

  .marketplace-home__guidance-links {
    grid-column: auto;
  }
}

@media (max-width: 767px) {
  .marketplace-home {
    gap: 26px;
    padding-top: 12px;
  }

  .marketplace-home__hero {
    gap: 26px;
    min-height: 0;
    padding: 8px 0 28px;
  }

  .marketplace-home__title {
    font-size: 30px;
  }

  .marketplace-home__description {
    font-size: 14px;
  }

  .marketplace-home__hero-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .marketplace-home__hero-actions :deep(a),
  .marketplace-home__hero-actions :deep(button) {
    width: 100%;
    justify-content: center;
  }

  .marketplace-home__section-heading {
    align-items: start;
  }

  .marketplace-home__section-title {
    font-size: 20px;
  }

  .marketplace-home__category-grid {
    gap: 8px;
  }

  .marketplace-home__category,
  .marketplace-home__category-skeleton {
    min-height: 94px;
  }

  .marketplace-home__category {
    gap: 7px;
    padding: 10px 6px;
  }

  .marketplace-home__category-icon {
    width: 36px;
    height: 36px;
  }

  .marketplace-home__category-label {
    font-size: 12px;
  }

  .marketplace-home__product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .marketplace-home__guidance-items {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
