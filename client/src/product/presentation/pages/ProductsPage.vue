<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-24 sm:px-5 lg:px-6">
    <!-- Hero Marketplace -->
    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-stretch">
        <div class="flex min-w-0 flex-col justify-between gap-8 rounded-[24px] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5 ring-1 ring-[#dbe3f2] sm:p-7">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex h-8 items-center rounded-full bg-white px-3 text-[12px] font-extrabold text-primary-700 ring-1 ring-primary-100">
                {{ $t("pages.productsPage.eyebrow") }}
              </span>
              <span class="inline-flex h-8 items-center rounded-full bg-primary-600 px-3 text-[12px] font-extrabold text-white">
                {{ $t("pages.productsPage.nearbyStores", { count: nearbyCount }) }}
              </span>
            </div>

            <div class="space-y-3">
              <h1 class="max-w-[760px] text-[34px] font-black leading-tight text-[var(--text-primary)] sm:text-[48px]">
                {{ $t("pages.productsPage.title") }}
              </h1>
              <p class="max-w-xl text-[15px] font-medium leading-7 text-slate-600">
                {{ $t("pages.productsPage.description") }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
            <NuxtLink
              to="/new-product"
              class="inline-flex h-12 items-center justify-center rounded-[16px] bg-primary-600 px-5 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(37,99,235,0.2)] transition hover:bg-primary-700 active:scale-95"
            >
              <Icon name="i-ph-plus-circle-duotone" class="mr-2 h-5 w-5 shrink-0" />
              {{ $t("pages.productsPage.newListing") }}
            </NuxtLink>

            <NuxtLink
              to="/my-products"
              class="inline-flex h-12 items-center justify-center rounded-[16px] border border-secondary-200 bg-white px-5 text-[14px] font-black text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
            >
              <Icon name="i-ph-package-duotone" class="mr-2 h-5 w-5 shrink-0" />
              {{ $t("pages.productsPage.myProducts") }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-3">
          <div class="rounded-[24px] border border-[#dbe3f2] bg-[#0f172a] p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-extrabold uppercase text-white/52">
                  {{ heroMainStat.label }}
                </p>
                <p class="mt-2 text-[34px] font-black leading-none">
                  {{ heroMainStat.value }}
                </p>
                <p class="mt-3 max-w-[320px] text-[13px] font-semibold leading-6 text-white/68">
                  {{ heroMainStat.description }}
                </p>
              </div>

              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#0f172a]">
                <Icon name="i-ph-storefront-fill" class="h-7 w-7" />
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article
              v-for="item in heroSecondaryStats"
              :key="item.label"
              class="rounded-[20px] border border-[#dbe3f2] bg-white p-4"
            >
              <p class="text-[10px] font-extrabold uppercase text-slate-500">
                {{ item.label }}
              </p>
              <p class="mt-2 text-[26px] font-black leading-none text-[var(--text-primary)]">
                {{ item.value }}
              </p>
              <p class="mt-2 text-[12px] font-semibold leading-5 text-slate-500">
                {{ item.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Global Search & Discovery Bar -->
    <section class="relative z-20 mx-auto w-full">
      <div class="rounded-[3rem] border border-secondary-200/50 bg-white/90 p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-3xl lg:p-6 transition-all hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.15)] ring-1 ring-secondary-100">
        <div class="flex flex-col gap-6 lg:flex-row">
          <UInput
            v-model="search"
            size="xl"
            icon="i-ph-magnifying-glass-duotone"
            class="flex-1"
            :ui="{ 
              rounded: 'rounded-[2.5rem]', 
              base: 'h-18 lg:h-20 text-xl font-bold bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-primary-500 hover:ring-primary-200 transition-all pl-16 px-10',
              icon: { leading: { wrapper: 'left-6', base: 'h-7 w-7 text-[var(--text-primary)]' } }
            }"
            :placeholder="$t('pages.productsPage.searchPlaceholder')"
          />
          
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-nowrap lg:items-center">
            <USelectMenu
              v-model="sortBy"
              :options="sortOptions"
              value-attribute="value"
              option-attribute="label"
              size="xl"
              class="lg:min-w-[200px]"
              :ui="{ rounded: 'rounded-2xl', trigger: 'h-18 lg:h-20 font-black text-[11px] uppercase tracking-widest bg-secondary-50/50 ring-1 ring-secondary-100 hover:ring-primary-200 transition-all px-8' }"
            >
              <template #leading>
                <Icon name="i-ph-sort-ascending-duotone" class="h-6 w-6 text-[var(--text-primary)]" />
              </template>
            </USelectMenu>

            <USelectMenu
              v-model="selectedCategory"
              :options="categoryOptions"
              value-attribute="value"
              option-attribute="label"
              size="xl"
              class="lg:min-w-[200px]"
              :ui="{ rounded: 'rounded-2xl', trigger: 'h-18 lg:h-20 font-black text-[11px] uppercase tracking-widest bg-secondary-50/50 ring-1 ring-secondary-100 hover:ring-primary-200 transition-all px-8' }"
            >
              <template #leading>
                <Icon name="i-ph-tag-duotone" class="h-6 w-6 text-[var(--text-primary)]" />
              </template>
            </USelectMenu>

            <USelectMenu
              v-model="selectedDistance"
              :options="distanceOptions"
              value-attribute="value"
              option-attribute="label"
              size="xl"
              class="lg:min-w-[180px]"
              :ui="{ rounded: 'rounded-2xl', trigger: 'h-18 lg:h-20 font-black text-[11px] uppercase tracking-widest bg-secondary-50/50 ring-1 ring-secondary-100 hover:ring-primary-200 transition-all px-8' }"
            >
              <template #leading>
                <Icon name="i-ph-navigation-arrow-duotone" class="h-6 w-6 text-[var(--text-primary)]" />
              </template>
            </USelectMenu>

            <UButton
              size="xl"
              class="rounded-2xl h-18 lg:h-20 px-10 font-black uppercase tracking-widest justify-center active:scale-95 transition-all shadow-xl"
              :color="nearbyOnly ? 'primary' : 'secondary'"
              :variant="nearbyOnly ? 'solid' : 'soft'"
              icon="i-ph-gps-fixed-duotone"
              @click="nearbyOnly = !nearbyOnly"
              :ui="{ icon: { base: 'h-6 w-6' } }"
            >
              {{ nearbyOnly ? $t("pages.productsPage.nearbyOn") : $t("pages.productsPage.nearbyOff") }}
            </UButton>
          </div>
        </div>

        <!-- Quick Category Chips -->
        <div class="mt-8 flex flex-wrap gap-3 px-2">
          <UButton
            v-for="chip in quickCategoryChips"
            :key="chip.value"
            variant="ghost"
            size="lg"
            class="rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all px-6 border-none h-12"
            :class="selectedCategory === chip.value
              ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200 shadow-lg shadow-primary-500/10'
              : 'text-[var(--text-primary)] hover:bg-secondary-50 hover:text-secondary-900 ring-1 ring-transparent hover:ring-secondary-100'"
            @click="selectedCategory = chip.value"
          >
            <template #leading>
              <Icon :name="chip.icon + '-duotone'" class="h-5 w-5" />
            </template>
            {{ chip.label }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Results Header -->
    <div class="surface-card p-8 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between ring-1 ring-secondary-100 shadow-xl bg-white relative overflow-hidden group/results">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none opacity-0 group-hover/results:opacity-100 transition-opacity duration-1000" />
      
      <div class="relative z-10 space-y-3">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] pl-1">
          {{ $t("pages.productsPage.results") }}
        </p>
        <h2 class="text-3xl font-black tracking-tight text-[var(--text-primary)] leading-none">
          {{ resultHeading }}
        </h2>
        <div class="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] pl-1">
          <span class="flex items-center gap-2">
            <Icon name="i-ph-package-duotone" class="h-4 w-4 text-[var(--text-primary)]" />
            {{ visibleProducts.length }} {{ $t("pages.productsPage.matchingProducts", { count: visibleProducts.length, sort: '' }).split(' ')[1] }}
          </span>
          <span class="w-1.5 h-1.5 rounded-full bg-secondary-200" />
          <span class="text-[var(--text-primary)]">{{ currentSortLabel }}</span>
        </div>
      </div>

      <div class="relative z-10 flex flex-wrap items-center gap-4">
        <UBadge
          variant="soft"
          size="lg"
          class="rounded-2xl px-6 font-black uppercase tracking-widest h-12 bg-primary-50 text-[var(--text-primary)] ring-1 ring-primary-100"
        >
          <template #leading>
            <Icon name="i-ph-funnel-duotone" class="h-5 w-5 mr-3" />
          </template>
          {{ activeFiltersLabel }}
        </UBadge>
        <UButton
          color="gray"
          variant="ghost"
          size="lg"
          class="rounded-2xl h-12 px-6 font-black text-[11px] uppercase tracking-widest hover:bg-secondary-50 transition-all active:scale-95"
          @click="resetFilters"
        >
          <template #leading>
            <Icon name="i-ph-arrow-counter-clockwise-duotone" class="h-5 w-5" />
          </template>
          {{ $t("pages.productsPage.resetFilters") }}
        </UButton>
      </div>
    </div>

    <div
      v-if="visibleProducts.length > 0"
      class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="product in visibleProducts"
        :key="product.id"
        class="surface-card group flex h-full cursor-pointer flex-col overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-secondary-100 transition-all duration-500 hover:-translate-y-2 hover:ring-primary-500/50 hover:shadow-[0_40px_80px_-28px_rgba(0,0,0,0.16)]"
      >
        <!-- Product Media Layer -->
        <div class="relative h-[300px] overflow-hidden sm:h-[340px] xl:h-[380px]">
          <!-- Background with Premium Decorations -->
          <div class="absolute inset-0 transition-transform duration-1000 group-hover:scale-110" :style="{ background: product.background }" />
          <div class="absolute inset-0 bg-gradient-to-t from-secondary-950/80 via-transparent to-transparent opacity-60" />
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />

          <!-- Large Duotone Icon Deco -->
          <div class="absolute right-[-10%] top-8 h-48 w-48 text-white/5 transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 group-hover:text-white/10 pointer-events-none">
            <Icon :name="product.icon + '-duotone'" class="h-full w-full" />
          </div>

          <!-- Categories/Status Badges -->
          <div class="absolute left-6 top-6 z-10 flex max-w-[calc(100%-3rem)] flex-wrap gap-3">
            <div class="rounded-xl bg-secondary-950/60 text-white font-black text-[9px] uppercase tracking-widest backdrop-blur-xl px-4 py-2 border border-white/10 shadow-xl">
              {{ product.categoryLabel }}
            </div>
            <div class="rounded-xl bg-white/10 text-white font-black text-[9px] uppercase tracking-widest backdrop-blur-xl px-4 py-2 border border-white/20 shadow-xl group-hover:bg-primary-500/30 transition-colors">
              {{ product.condition }}
            </div>
          </div>

          <!-- Location, Distance, Price -->
          <div class="absolute inset-x-5 bottom-5 z-10 space-y-3 sm:inset-x-6 sm:bottom-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div class="min-w-0 space-y-3 sm:max-w-[55%]">
                <div class="inline-flex max-w-full items-center gap-2.5 rounded-[1.1rem] border border-white/5 bg-black/40 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-xl">
                  <Icon name="i-ph-map-pin-duotone" class="h-4 w-4 shrink-0 text-sky-400" />
                  <span class="truncate">{{ product.location }}</span>
                </div>
                <div class="inline-flex rounded-[1.1rem] border border-white/20 bg-white/20 px-4 py-3 text-[10px] font-black text-white shadow-xl backdrop-blur-xl">
                  {{ formatDistance(product.distanceKm) }}
                </div>
              </div>

              <div class="w-full rounded-[1.7rem] bg-white px-5 py-4 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl sm:w-auto sm:min-w-[250px] sm:rounded-[1.9rem] sm:px-6">
                <p class="mb-2 text-[10px] font-black uppercase tracking-widest leading-none text-[var(--text-primary)]">{{ $t("pages.productsPage.priceLabel") }}</p>
                <p class="truncate text-[1.7rem] font-black leading-none text-sky-600 sm:text-[2rem]">{{ formatCurrency(product.price) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Details Layer -->
        <div class="flex flex-1 flex-col p-7 sm:p-8 xl:p-9">
          <div class="min-w-0 space-y-3">
            <div class="space-y-2">
              <p class="pl-0.5 text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] transition-colors group-hover:text-secondary-900">
                {{ product.seller }}
              </p>
              <h3 class="line-clamp-2 min-h-[4.2rem] text-[1.85rem] font-black leading-[1.02] tracking-tight text-secondary-950 transition-colors group-hover:text-primary-950 sm:min-h-[4.8rem] sm:text-[2.1rem] xl:text-[2.3rem]">
                {{ product.title }}
              </h3>
            </div>
          </div>

          <p class="mt-4 min-h-[4.8rem] text-[15px] font-medium italic leading-7 text-[var(--text-primary)] line-clamp-3 sm:mt-5 sm:min-h-[5.4rem] sm:text-base sm:leading-8">
            "{{ product.description }}"
          </p>

          <div class="mt-7 grid gap-3 sm:grid-cols-2">
            <UButton
              color="white"
              variant="solid"
              size="lg"
              class="h-13 justify-center rounded-2xl border border-secondary-100 bg-white px-5 text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] shadow-sm transition-all active:scale-[0.98] hover:bg-primary-50 hover:text-secondary-900 sm:h-14"
              icon="i-ph-chat-circle-text-duotone"
              :aria-label="$t('pages.productsPage.messageSeller')"
              :ui="{ icon: { base: 'h-5 w-5' } }"
            >
              {{ $t('pages.productsPage.messageSeller') }}
            </UButton>
            <UButton
              size="lg"
              class="h-13 justify-center rounded-2xl border-none bg-primary-600 px-5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98] hover:bg-primary-700 sm:h-14"
              icon="i-ph-shopping-cart-simple-duotone"
              :aria-label="$t('pages.productsPage.addToCart')"
              :ui="{ icon: { base: 'h-5 w-5' } }"
            >
              {{ $t('pages.productsPage.addToCart') }}
            </UButton>
          </div>

          <div class="mt-auto flex items-center justify-between gap-4 border-t border-secondary-50 pt-6 transition-colors group-hover:border-primary-100">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2 rounded-2xl bg-sky-50 px-5 py-3 text-[12px] font-black text-sky-700 ring-1 ring-sky-100 shadow-sm">
                <Icon name="i-ph-star-duotone" class="h-4 w-4" />
                {{ product.rating.toFixed(1) }}
              </div>
              <p class="text-[11px] font-black uppercase tracking-widest text-secondary-300">
                {{ product.postedLabel }}
              </p>
            </div>

            <Icon name="i-ph-arrow-right-duotone" class="h-6 w-6 text-secondary-200 transition-all group-hover:translate-x-2 group-hover:text-secondary-900" />
          </div>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="surface-card py-24 text-center ring-1 ring-secondary-100 bg-white shadow-2xl rounded-[3rem] space-y-8 relative overflow-hidden group/empty"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none" />
      
      <div class="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary-50 text-[var(--text-primary)] shadow-2xl shadow-primary-500/10 transition-transform duration-700 group-hover/empty:scale-110 group-hover/empty:rotate-12">
        <Icon name="i-ph-storefront-duotone" class="h-12 w-12" />
      </div>

      <div class="relative space-y-3 max-w-lg mx-auto px-6">
        <h3 class="text-3xl font-black tracking-tight text-[var(--text-primary)] leading-none">
          {{ $t("pages.productsPage.emptyTitle") }}
        </h3>
        <p class="text-base font-medium leading-relaxed text-[var(--text-primary)] italic">
          "{{ $t("pages.productsPage.emptyDescription") }}"
        </p>
      </div>

      <div class="relative">
        <UButton
          size="xl"
          class="h-16 rounded-2xl bg-secondary-900 text-white font-black text-[11px] uppercase tracking-widest px-10 shadow-2xl transition-all hover:bg-secondary-950 active:scale-95 border-none"
          @click="resetFilters"
        >
          <template #leading>
            <Icon name="i-ph-arrow-counter-clockwise-duotone" class="h-6 w-6" />
          </template>
          {{ $t("pages.productsPage.resetAll") }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductMarketplace } from "../../application/composables/useProductMarketplace"

const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.productsPage.seoTitle"),
  description: () => t("pages.productsPage.seoDescription"),
})

const {
  search,
  sortBy,
  selectedCategory,
  selectedDistance,
  nearbyOnly,
  sortOptions,
  categoryOptions,
  distanceOptions,
  quickCategoryChips,
  heroMainStat,
  heroSecondaryStats,
  nearbyCount,
  currentSortLabel,
  activeFiltersLabel,
  resultHeading,
  visibleProducts,
  formatCurrency,
  formatDistance,
  resetFilters,
} = useProductMarketplace()
</script>
