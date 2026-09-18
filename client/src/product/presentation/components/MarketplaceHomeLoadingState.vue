<!-- English description: Provides a stable marketplace-shaped loading state for the reversible home variant. -->
<template>
  <div class="marketplace-home-loading" aria-busy="true">
    <section class="marketplace-home-loading__hero">
      <div class="marketplace-home-loading__hero-copy">
        <USkeleton class="marketplace-home-loading__eyebrow" />
        <USkeleton class="marketplace-home-loading__title" />
        <USkeleton class="marketplace-home-loading__body" />
      </div>
      <USkeleton class="marketplace-home-loading__search" />
    </section>

    <section class="marketplace-home-loading__section">
      <USkeleton class="marketplace-home-loading__heading" />
      <div class="marketplace-home-loading__categories">
        <USkeleton
          v-for="index in 8"
          :key="index"
          class="marketplace-home-loading__category"
        />
      </div>
    </section>

    <section class="marketplace-home-loading__section">
      <USkeleton class="marketplace-home-loading__heading" />
      <div class="marketplace-home-loading__products">
        <article
          v-for="index in 8"
          :key="index"
          class="marketplace-home-loading__product"
        >
          <USkeleton class="marketplace-home-loading__product-image" />
          <USkeleton class="marketplace-home-loading__product-title" />
          <USkeleton class="marketplace-home-loading__product-price" />
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.marketplace-home-loading {
  display: grid;
  gap: 28px;
  padding: 20px 0 40px;
}

.marketplace-home-loading__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
  align-items: center;
  gap: 32px;
  min-height: 260px;
  padding: 18px 0 32px;
  border-bottom: 1px solid var(--border-light);
}

.marketplace-home-loading__hero-copy {
  display: grid;
  gap: 14px;
}

.marketplace-home-loading__eyebrow {
  width: 110px;
  height: 12px;
  border-radius: var(--radius-full);
}

.marketplace-home-loading__title {
  width: min(430px, 100%);
  height: 42px;
  border-radius: var(--radius-md);
}

.marketplace-home-loading__body {
  width: min(520px, 100%);
  height: 48px;
  border-radius: var(--radius-md);
}

.marketplace-home-loading__search {
  width: 100%;
  height: 56px;
  border-radius: var(--radius-lg);
}

.marketplace-home-loading__section {
  display: grid;
  gap: 16px;
}

.marketplace-home-loading__heading {
  width: 190px;
  height: 24px;
  border-radius: var(--radius-md);
}

.marketplace-home-loading__categories {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
}

.marketplace-home-loading__category {
  height: 108px;
  border-radius: var(--radius-lg);
}

.marketplace-home-loading__products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.marketplace-home-loading__product {
  display: grid;
  gap: 12px;
}

.marketplace-home-loading__product-image {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
}

.marketplace-home-loading__product-title {
  width: 84%;
  height: 18px;
  border-radius: var(--radius-full);
}

.marketplace-home-loading__product-price {
  width: 48%;
  height: 18px;
  border-radius: var(--radius-full);
}

@media (max-width: 1023px) {
  .marketplace-home-loading__categories {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .marketplace-home-loading__products {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .marketplace-home-loading {
    gap: 24px;
    padding-top: 12px;
  }

  .marketplace-home-loading__hero {
    grid-template-columns: 1fr;
    gap: 24px;
    min-height: 220px;
    padding: 8px 0 28px;
  }

  .marketplace-home-loading__categories {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .marketplace-home-loading__category {
    height: 84px;
  }

  .marketplace-home-loading__products {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>
