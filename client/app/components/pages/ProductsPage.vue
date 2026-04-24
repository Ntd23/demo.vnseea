<template>
  <div class="mx-auto max-w-[1520px] space-y-12 pb-24 px-4 sm:px-6">
    <!-- Hero Marketplace -->
    <section class="surface-card group overflow-hidden ring-1 ring-secondary-200/50 shadow-2xl bg-gradient-to-br from-secondary-950 via-primary-900 to-secondary-900 text-white relative">
      <!-- Premium Decorations -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_40%)]" />
      <div class="pointer-events-none absolute right-[-10%] top-[-30%] h-[500px] w-[500px] rounded-full bg-primary-500/10 blur-[120px] transition-transform duration-1000 group-hover:scale-110" />

      <div class="relative z-10 flex flex-col gap-12 px-8 py-16 sm:px-12 lg:px-16 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-[780px] space-y-8">
          <div class="space-y-4">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-300/80 pl-1">
              {{ $t("pages.productsPage.eyebrow") }}
            </p>
            <h1 class="text-5xl sm:text-7xl font-black leading-none tracking-tight text-white transition-colors group-hover:text-primary-100">
              {{ $t("pages.productsPage.title") }}
            </h1>
            <p class="text-base font-medium leading-relaxed text-white/70 sm:text-lg pl-1 max-w-2xl italic">
              "{{ $t("pages.productsPage.description") }}"
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-4 pt-4">
            <UButton
              to="/new-product"
              size="xl"
              class="h-14 rounded-2xl bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary-500/40 transition-all hover:bg-primary-700 active:scale-95 px-10 border-none"
            >
              <template #leading>
                <Icon name="i-ph-plus-circle-duotone" class="h-6 w-6" />
              </template>
              {{ $t("pages.productsPage.newListing") }}
            </UButton>

            <UButton
              to="/my-products"
              variant="soft"
              size="xl"
              class="h-14 rounded-2xl bg-white/10 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/20 hover:bg-white/20 backdrop-blur-xl transition-all active:scale-95 px-8"
            >
              <template #leading>
                <Icon name="i-ph-package-duotone" class="h-5 w-5" />
              </template>
              {{ $t("pages.productsPage.myProducts") }}
            </UButton>

            <div class="hidden sm:inline-flex h-14 items-center gap-3 rounded-2xl bg-white/5 px-6 text-[11px] font-black uppercase tracking-widest text-primary-200 border border-white/5 backdrop-blur-md">
              <Icon name="i-ph-map-pin-duotone" class="h-5 w-5 text-amber-400" />
              {{ $t("pages.productsPage.nearbyStores", { count: nearbyCount }) }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:w-[380px]">
          <div
            v-for="item in heroStats"
            :key="item.label"
            class="group/stat rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/10"
          >
            <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover/stat:text-primary-300 transition-colors">
              {{ item.label }}
            </p>
            <p class="mt-4 text-3xl font-black text-white leading-none tracking-tight">
              {{ item.value }}
            </p>
            <p class="mt-2 text-[10px] font-bold text-white/40 group-hover/stat:text-white/60 line-clamp-1">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Global Search & Discovery Bar -->
    <section class="relative z-20 -mt-16 mx-auto w-full px-4 sm:px-12">
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
              icon: { leading: { wrapper: 'left-6', base: 'h-7 w-7 text-primary-500' } }
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
                <Icon name="i-ph-sort-ascending-duotone" class="h-6 w-6 text-primary-500" />
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
                <Icon name="i-ph-tag-duotone" class="h-6 w-6 text-primary-500" />
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
                <Icon name="i-ph-navigation-arrow-duotone" class="h-6 w-6 text-primary-500" />
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
              : 'text-secondary-400 hover:bg-secondary-50 hover:text-secondary-900 ring-1 ring-transparent hover:ring-secondary-100'"
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
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("pages.productsPage.results") }}
        </p>
        <h2 class="text-3xl font-black tracking-tight text-secondary-900 leading-none">
          {{ resultHeading }}
        </h2>
        <div class="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-secondary-400 pl-1">
          <span class="flex items-center gap-2">
            <Icon name="i-ph-package-duotone" class="h-4 w-4 text-primary-500" />
            {{ visibleProducts.length }} {{ $t("pages.productsPage.matchingProducts", { count: visibleProducts.length, sort: '' }).split(' ')[1] }}
          </span>
          <span class="w-1.5 h-1.5 rounded-full bg-secondary-200" />
          <span class="text-primary-600">{{ currentSortLabel }}</span>
        </div>
      </div>

      <div class="relative z-10 flex flex-wrap items-center gap-4">
        <UBadge
          variant="soft"
          size="lg"
          class="rounded-2xl px-6 font-black uppercase tracking-widest h-12 bg-primary-50 text-primary-600 ring-1 ring-primary-100"
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
                <p class="mb-2 text-[10px] font-black uppercase tracking-widest leading-none text-secondary-400">{{ $t("pages.productsPage.priceLabel") }}</p>
                <p class="truncate text-[1.7rem] font-black leading-none text-sky-600 sm:text-[2rem]">{{ formatCurrency(product.price) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Details Layer -->
        <div class="flex flex-1 flex-col p-7 sm:p-8 xl:p-9">
          <div class="min-w-0 space-y-3">
            <div class="space-y-2">
              <p class="pl-0.5 text-[9px] font-black uppercase tracking-[0.4em] text-secondary-400 transition-colors group-hover:text-primary-500">
                {{ product.seller }}
              </p>
              <h3 class="line-clamp-2 min-h-[4.2rem] text-[1.85rem] font-black leading-[1.02] tracking-tight text-secondary-950 transition-colors group-hover:text-primary-950 sm:min-h-[4.8rem] sm:text-[2.1rem] xl:text-[2.3rem]">
                {{ product.title }}
              </h3>
            </div>
          </div>

          <p class="mt-4 min-h-[4.8rem] text-[15px] font-medium italic leading-7 text-secondary-500 line-clamp-3 sm:mt-5 sm:min-h-[5.4rem] sm:text-base sm:leading-8">
            "{{ product.description }}"
          </p>

          <div class="mt-7 grid gap-3 sm:grid-cols-2">
            <UButton
              color="white"
              variant="solid"
              size="lg"
              class="h-13 justify-center rounded-2xl border border-secondary-100 bg-white px-5 text-[11px] font-black uppercase tracking-widest text-secondary-900 shadow-sm transition-all active:scale-[0.98] hover:bg-primary-50 hover:text-primary-600 sm:h-14"
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

            <Icon name="i-ph-arrow-right-duotone" class="h-6 w-6 text-secondary-200 transition-all group-hover:translate-x-2 group-hover:text-primary-500" />
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
      
      <div class="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary-50 text-primary-600 shadow-2xl shadow-primary-500/10 transition-transform duration-700 group-hover/empty:scale-110 group-hover/empty:rotate-12">
        <Icon name="i-ph-storefront-duotone" class="h-12 w-12" />
      </div>

      <div class="relative space-y-3 max-w-lg mx-auto px-6">
        <h3 class="text-3xl font-black tracking-tight text-secondary-900 leading-none">
          {{ $t("pages.productsPage.emptyTitle") }}
        </h3>
        <p class="text-base font-medium leading-relaxed text-secondary-500 italic">
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
type ProductCategory = "all" | "vehicles" | "home" | "beauty" | "books" | "tech" | "food"
type SortValue = "featured" | "latest" | "price-asc" | "price-desc" | "nearest" | "rating"
type DistanceValue = "all" | "5" | "10" | "25"

type ProductItem = {
  id: number
  title: string
  seller: string
  price: number
  location: string
  distanceKm: number
  category: Exclude<ProductCategory, "all">
  categoryLabel: string
  condition: string
  description: string
  background: string
  icon: string
  postedHoursAgo: number
  postedLabel: string
  rating: number
  mine?: boolean
}

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t("pages.productsPage.seoTitle"),
  description: () => t("pages.productsPage.seoDescription"),
})

const search = ref("")
const sortBy = ref<SortValue>("featured")
const selectedCategory = ref<ProductCategory>("all")
const selectedDistance = ref<DistanceValue>("all")
const nearbyOnly = ref(false)

const sortOptions = computed(() => [
  { label: t("pages.productsPage.sortFeatured"), value: "featured" },
  { label: t("pages.productsPage.sortLatest"), value: "latest" },
  { label: t("pages.productsPage.sortPriceAsc"), value: "price-asc" },
  { label: t("pages.productsPage.sortPriceDesc"), value: "price-desc" },
  { label: t("pages.productsPage.sortNearest"), value: "nearest" },
  { label: t("pages.productsPage.sortRating"), value: "rating" },
] satisfies { label: string; value: SortValue }[])

const categoryOptions = computed(() => [
  { label: t("pages.productsPage.category"), value: "all" },
  { label: t("pages.productsPage.categoryVehicles"), value: "vehicles" },
  { label: t("pages.productsPage.categoryHome"), value: "home" },
  { label: t("pages.productsPage.categoryBeauty"), value: "beauty" },
  { label: t("pages.productsPage.categoryBooks"), value: "books" },
  { label: t("pages.productsPage.categoryTech"), value: "tech" },
  { label: t("pages.productsPage.categoryFood"), value: "food" },
] satisfies { label: string; value: ProductCategory }[])

const distanceOptions = computed(() => [
  { label: t("pages.productsPage.distanceAll"), value: "all" },
  { label: t("pages.productsPage.distance5"), value: "5" },
  { label: t("pages.productsPage.distance10"), value: "10" },
  { label: t("pages.productsPage.distance25"), value: "25" },
] satisfies { label: string; value: DistanceValue }[])

const quickCategoryChips = computed(() => [
  { label: t("pages.productsPage.categoryAll"), value: "all", icon: "i-ph-squares-four" },
  { label: t("pages.productsPage.categoryVehicles"), value: "vehicles", icon: "i-ph-car-profile" },
  { label: t("pages.productsPage.categoryHome"), value: "home", icon: "i-ph-armchair" },
  { label: t("pages.productsPage.categoryBeauty"), value: "beauty", icon: "i-ph-drop" },
  { label: t("pages.productsPage.categoryBooksShort"), value: "books", icon: "i-ph-book-open-text" },
  { label: t("pages.productsPage.categoryTech"), value: "tech", icon: "i-ph-device-mobile-camera" },
] satisfies { label: string; value: ProductCategory; icon: string }[])

const products = computed(() => [
  {
    id: 1,
    title: t("pages.productsPage.product1Title"),
    seller: t("pages.productsPage.sellerYou"),
    price: 4200000,
    location: "Cầu Giấy, Hà Nội",
    distanceKm: 1.8,
    category: "vehicles",
    categoryLabel: t("pages.productsPage.categoryVehicles"),
    condition: t("pages.productsPage.conditionLikeNew"),
    description: t("pages.productsPage.product1Description"),
    background: "linear-gradient(135deg,#172554 0%,#1d4ed8 48%,#7dd3fc 100%)",
    icon: "i-ph-bicycle",
    postedHoursAgo: 2,
    postedLabel: t("pages.productsPage.postedHoursAgo", { count: 2 }),
    rating: 4.9,
    mine: true,
  },
  {
    id: 2,
    title: t("pages.productsPage.product2Title"),
    seller: "Hoàng An",
    price: 1850000,
    location: "Nam Từ Liêm, Hà Nội",
    distanceKm: 4.2,
    category: "home",
    categoryLabel: t("pages.productsPage.categoryHome"),
    condition: t("pages.productsPage.conditionDiscount"),
    description: t("pages.productsPage.product2Description"),
    background: "linear-gradient(135deg,#78350f 0%,#b45309 38%,#f59e0b 100%)",
    icon: "i-ph-armchair",
    postedHoursAgo: 6,
    postedLabel: t("pages.productsPage.postedHoursAgo", { count: 6 }),
    rating: 4.8,
  },
  {
    id: 3,
    title: t("pages.productsPage.product3Title"),
    seller: "Hải Dương",
    price: 520000,
    location: "Hai Bà Trưng, Hà Nội",
    distanceKm: 3.1,
    category: "beauty",
    categoryLabel: t("pages.productsPage.categoryBeauty"),
    condition: t("pages.productsPage.conditionBestSeller"),
    description: t("pages.productsPage.product3Description"),
    background: "linear-gradient(135deg,#0369a1 0%,#38bdf8 45%,#bae6fd 100%)",
    icon: "i-ph-drop-fill",
    postedHoursAgo: 4,
    postedLabel: t("pages.productsPage.postedHoursAgo", { count: 4 }),
    rating: 4.9,
  },
  {
    id: 4,
    title: t("pages.productsPage.product4Title"),
    seller: "Minh Châu",
    price: 145000,
    location: "Hoàn Kiếm, Hà Nội",
    distanceKm: 8.4,
    category: "books",
    categoryLabel: t("pages.productsPage.categoryBooks"),
    condition: t("pages.productsPage.conditionNewPost"),
    description: t("pages.productsPage.product4Description"),
    background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 38%,#bfdbfe 100%)",
    icon: "i-ph-book-open-text-fill",
    postedHoursAgo: 1,
    postedLabel: t("pages.productsPage.postedOneHourAgo"),
    rating: 4.7,
  },
  {
    id: 5,
    title: t("pages.productsPage.product5Title"),
    seller: "Tú Anh",
    price: 890000,
    location: "Thanh Xuân, Hà Nội",
    distanceKm: 5.6,
    category: "tech",
    categoryLabel: t("pages.productsPage.categoryTech"),
    condition: t("pages.productsPage.conditionFreeShip"),
    description: t("pages.productsPage.product5Description"),
    background: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
    icon: "i-ph-speaker-high-fill",
    postedHoursAgo: 12,
    postedLabel: t("pages.productsPage.postedHoursAgo", { count: 12 }),
    rating: 4.6,
  },
  {
    id: 6,
    title: t("pages.productsPage.product6Title"),
    seller: "Nông trại Bơ",
    price: 210000,
    location: "Đống Đa, Hà Nội",
    distanceKm: 2.7,
    category: "food",
    categoryLabel: t("pages.productsPage.categoryFood"),
    condition: t("pages.productsPage.conditionFreshRoast"),
    description: t("pages.productsPage.product6Description"),
    background: "linear-gradient(135deg,#7c2d12 0%,#ea580c 40%,#fdba74 100%)",
    icon: "i-ph-bowl-food-fill",
    postedHoursAgo: 8,
    postedLabel: t("pages.productsPage.postedHoursAgo", { count: 8 }),
    rating: 4.8,
  },
  {
    id: 7,
    title: t("pages.productsPage.product7Title"),
    seller: t("pages.productsPage.sellerYou"),
    price: 760000,
    location: "Tây Hồ, Hà Nội",
    distanceKm: 9.8,
    category: "home",
    categoryLabel: t("pages.productsPage.categoryHome"),
    condition: t("pages.productsPage.conditionAvailable"),
    description: t("pages.productsPage.product7Description"),
    background: "linear-gradient(135deg,#3f3cbb 0%,#5b86e5 48%,#c2e9fb 100%)",
    icon: "i-ph-lamp-fill",
    postedHoursAgo: 18,
    postedLabel: t("pages.productsPage.postedHoursAgo", { count: 18 }),
    rating: 4.5,
    mine: true,
  },
  {
    id: 8,
    title: t("pages.productsPage.product8Title"),
    seller: "Studio Mộc",
    price: 12800000,
    location: "Long Biên, Hà Nội",
    distanceKm: 14.2,
    category: "tech",
    categoryLabel: t("pages.productsPage.categoryTech"),
    condition: t("pages.productsPage.conditionTrusted"),
    description: t("pages.productsPage.product8Description"),
    background: "linear-gradient(135deg,#1f2937 0%,#475569 36%,#dbeafe 100%)",
    icon: "i-ph-camera-fill",
    postedHoursAgo: 24,
    postedLabel: t("pages.productsPage.postedYesterday"),
    rating: 4.9,
  },
] satisfies ProductItem[])

const heroStats = computed(() => [
  {
    label: t("pages.productsPage.statActiveStores"),
    value: "128",
    description: t("pages.productsPage.statActiveStoresDescription"),
  },
  {
    label: t("pages.productsPage.statFeatured"),
    value: String(products.value.filter(item => item.postedHoursAgo <= 8).length),
    description: t("pages.productsPage.statFeaturedDescription"),
  },
  {
    label: t("pages.productsPage.statMine"),
    value: String(products.value.filter(item => item.mine).length),
    description: t("pages.productsPage.statMineDescription"),
  },
])

const nearbyCount = computed(() => products.value.filter(item => item.distanceKm <= 5).length)

const currentSortLabel = computed(
  () => sortOptions.value.find(option => option.value === sortBy.value)?.label ?? t("pages.productsPage.sortFeatured"),
)

const activeFiltersLabel = computed(() => {
  const labels: string[] = []

  if (selectedCategory.value !== "all") {
    labels.push(
      categoryOptions.value.find(option => option.value === selectedCategory.value)?.label ?? "",
    )
  }

  if (selectedDistance.value !== "all") {
    labels.push(
      distanceOptions.value.find(option => option.value === selectedDistance.value)?.label ?? "",
    )
  }

  if (nearbyOnly.value) labels.push(t("pages.productsPage.nearbyFilter"))

  return labels.length > 0 ? labels.join(" • ") : t("pages.productsPage.allProducts")
})

const resultHeading = computed(() => t("pages.productsPage.resultHeading"))

const visibleProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  const filtered = products.value.filter((product) => {
    const matchesKeyword = keyword.length === 0 || [
      product.title,
      product.description,
      product.seller,
      product.location,
      product.categoryLabel,
    ].some(field => field.toLowerCase().includes(keyword))

    const matchesCategory =
      selectedCategory.value === "all" || product.category === selectedCategory.value

    const matchesDistance =
      selectedDistance.value === "all" || product.distanceKm <= Number(selectedDistance.value)

    const matchesNearby = !nearbyOnly.value || product.distanceKm <= 5

    return matchesKeyword && matchesCategory && matchesDistance && matchesNearby
  })

  return filtered.slice().sort((left, right) => {
    switch (sortBy.value) {
      case "latest":
        return left.postedHoursAgo - right.postedHoursAgo
      case "price-asc":
        return left.price - right.price
      case "price-desc":
        return right.price - left.price
      case "nearest":
        return left.distanceKm - right.distanceKm
      case "rating":
        return right.rating - left.rating
      case "featured":
      default:
        return (
          Number(Boolean(right.mine)) - Number(Boolean(left.mine))
          || right.rating - left.rating
          || left.postedHoursAgo - right.postedHoursAgo
        )
    }
  })
})

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const formatDistance = (value: number) =>
  t("pages.productsPage.distanceKm", {
    value: value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 1 }),
  })

const resetFilters = () => {
  search.value = ""
  sortBy.value = "featured"
  selectedCategory.value = "all"
  selectedDistance.value = "all"
  nearbyOnly.value = false
}
</script>
