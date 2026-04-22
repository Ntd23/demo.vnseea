<template>
  <div class="space-y-5 pb-10">
    <!-- Hero Marketplace -->
    <section class="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 px-6 pb-20 pt-8 text-white shadow-2xl sm:px-10 sm:pt-10 lg:px-12">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
      <div class="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div class="relative z-10 flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-[800px] space-y-6">
          <div class="space-y-4">
            <UBadge color="white" variant="soft" class="rounded-full bg-white/10 px-4 py-1.5 font-black uppercase tracking-widest text-primary-200 border border-white/10 backdrop-blur-md">
              {{ $t("pages.productsPage.eyebrow") }}
            </UBadge>
            <h1 class="text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight text-white">
              {{ $t("pages.productsPage.title") }}
            </h1>
            <p class="max-w-[600px] text-base font-medium leading-relaxed text-white/80 sm:text-lg">
              {{ $t("pages.productsPage.description") }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <UButton
              to="/new-product"
              color="white"
              size="xl"
              class="rounded-full px-8 font-black shadow-xl shadow-black/10 active:scale-95 transition-transform"
              icon="i-ph-plus-circle-fill"
            >
              {{ $t("pages.productsPage.newListing") }}
            </UButton>

            <UButton
              to="/my-products"
              color="white"
              variant="soft"
              size="xl"
              class="rounded-full px-8 font-black bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md active:scale-95 transition-transform"
              icon="i-ph-package-fill"
            >
              {{ $t("pages.productsPage.myProducts") }}
            </UButton>

            <div class="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-bold text-white/90 backdrop-blur-md">
              <Icon name="i-ph-map-pin-fill" class="h-5 w-5 text-amber-300" />
              {{ $t("pages.productsPage.nearbyStores", { count: nearbyCount }) }}
            </div>
          </div>
        </div>

        <!-- Hero Stats -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:w-[450px] xl:grid-cols-1">
          <div
            v-for="item in heroStats"
            :key="item.label"
            class="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:bg-white/10"
          >
            <p class="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white/70 transition-colors">
              {{ item.label }}
            </p>
            <div class="mt-2 flex items-baseline gap-2">
              <p class="text-3xl font-black text-white leading-none tracking-tight">
                {{ item.value }}
              </p>
              <p class="text-xs font-bold text-white/60">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Global Search & Discovery Bar -->
    <section class="relative z-20 -mt-10 mx-4 sm:mx-10 rounded-[2.5rem] border border-white/60 bg-white/90 p-3 shadow-2xl backdrop-blur-2xl sm:p-5">
      <div class="flex flex-col gap-4 lg:flex-row">
        <UInput
          v-model="search"
          size="xl"
          icon="i-ph-magnifying-glass"
          class="flex-1"
          :ui="{ rounded: 'rounded-[2rem]', base: 'h-16 text-lg font-bold' }"
          :placeholder="$t('pages.productsPage.searchPlaceholder')"
        />
        
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:w-auto">
          <USelectMenu
            v-model="sortBy"
            :options="sortOptions"
            value-attribute="value"
            option-attribute="label"
            size="xl"
            class="min-w-[180px]"
            :ui="{ rounded: 'rounded-2xl', trigger: 'h-16 font-bold px-6' }"
          >
            <template #leading>
              <Icon name="i-ph-sort-ascending-duotone" class="h-5 w-5 text-primary-500" />
            </template>
          </USelectMenu>

          <USelectMenu
            v-model="selectedCategory"
            :options="categoryOptions"
            value-attribute="value"
            option-attribute="label"
            size="xl"
            class="min-w-[180px]"
            :ui="{ rounded: 'rounded-2xl', trigger: 'h-16 font-bold px-6' }"
          >
            <template #leading>
              <Icon name="i-ph-tag-duotone" class="h-5 w-5 text-primary-500" />
            </template>
          </USelectMenu>

          <USelectMenu
            v-model="selectedDistance"
            :options="distanceOptions"
            value-attribute="value"
            option-attribute="label"
            size="xl"
            class="min-w-[160px]"
            :ui="{ rounded: 'rounded-2xl', trigger: 'h-16 font-bold px-6' }"
          >
            <template #leading>
              <Icon name="i-ph-navigation-arrow-duotone" class="h-5 w-5 text-primary-500" />
            </template>
          </USelectMenu>

          <UButton
            size="xl"
            class="rounded-2xl h-16 px-8 font-black justify-center active:scale-95 transition-transform"
            :color="nearbyOnly ? 'primary' : 'secondary'"
            :variant="nearbyOnly ? 'solid' : 'soft'"
            icon="i-ph-gps-fixed-duotone"
            @click="nearbyOnly = !nearbyOnly"
          >
            {{ nearbyOnly ? $t("pages.productsPage.nearbyOn") : $t("pages.productsPage.nearbyOff") }}
          </UButton>
        </div>
      </div>

      <!-- Quick Category Chips -->
      <div class="mt-4 flex flex-wrap gap-2.5 px-2">
        <UButton
          v-for="chip in quickCategoryChips"
          :key="chip.value"
          variant="ghost"
          size="md"
          class="rounded-full font-bold transition-all px-5 border border-transparent"
          :class="selectedCategory === chip.value
            ? 'bg-primary-50 text-primary-600 border-primary-200'
            : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900'"
          :icon="chip.icon"
          @click="selectedCategory = chip.value"
        >
          {{ chip.label }}
        </UButton>
      </div>
    </section>

    <!-- Results Header -->
    <div class="surface-card p-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500/80">
          {{ $t("pages.productsPage.results") }}
        </p>
        <h2 class="text-2xl font-black tracking-tight text-secondary-900">
          {{ resultHeading }}
        </h2>
        <div class="flex items-center gap-2 text-xs font-bold text-secondary-500">
          <span>{{ visibleProducts.length }} {{ $t("pages.productsPage.matchingProducts", { count: visibleProducts.length, sort: '' }).split(' ')[1] }}</span>
          <span class="w-1 h-1 rounded-full bg-secondary-300" />
          <span class="text-primary-600">{{ currentSortLabel }}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UBadge color="primary" variant="soft" size="md" class="rounded-full px-4 font-black">
          <template #leading>
            <Icon name="i-ph-funnel-duotone" class="h-4 w-4 mr-1" />
          </template>
          {{ activeFiltersLabel }}
        </UBadge>
        <UButton
          color="gray"
          variant="ghost"
          size="sm"
          class="font-bold -mr-2"
          icon="i-ph-arrow-counter-clockwise-bold"
          @click="resetFilters"
        >
          {{ $t("pages.productsPage.resetFilters") }}
        </UButton>
      </div>
    </div>

    <div
      v-if="visibleProducts.length > 0"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      <article
        v-for="product in visibleProducts"
        :key="product.id"
        class="surface-card group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ring-1 ring-secondary-100 hover:ring-primary-400/50"
      >
        <!-- Product Media Layer -->
        <div class="relative h-[260px] overflow-hidden">
          <div class="absolute inset-0 transition-transform duration-500 group-hover:scale-110" :style="{ background: product.background }" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_40%)]" />

          <Icon
            :name="product.icon"
            class="absolute right-6 top-8 h-28 w-28 text-white/10 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6"
          />

          <!-- Categories/Status Badges -->
          <div class="absolute left-4 top-4 flex flex-wrap gap-2">
            <UBadge color="white" variant="solid" class="rounded-lg bg-black/60 text-white font-black text-[10px] backdrop-blur-md px-2.5 py-1">
              {{ product.categoryLabel }}
            </UBadge>
            <UBadge color="white" variant="soft" class="rounded-lg bg-white/10 text-white font-bold text-[10px] backdrop-blur-md px-2.5 py-1 border border-white/20">
              {{ product.condition }}
            </UBadge>
          </div>

          <!-- Location/Distance Layer -->
          <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div class="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-xl border border-white/10">
              <Icon name="i-ph-map-pin-bold" class="h-3 w-3" />
              {{ product.location }}
            </div>
            <div class="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur-xl border border-white/20">
              {{ formatDistance(product.distanceKm) }}
            </div>
          </div>
        </div>

        <!-- Product Details Layer -->
        <div class="relative p-5 space-y-4">
          <!-- Floating Action Buttons -->
          <div class="absolute -top-7 right-6 flex items-center gap-2.5">
            <UButton
              color="white"
              variant="solid"
              size="md"
              class="rounded-2xl shadow-xl hover:bg-primary-50 hover:text-primary-600 transition-colors"
              icon="i-ph-chat-circle-text-duotone"
              :aria-label="$t('pages.productsPage.messageSeller')"
            />
            <UButton
              color="primary"
              variant="solid"
              size="md"
              class="rounded-2xl shadow-xl shadow-primary-500/30 active:scale-90 transition-transform"
              icon="i-ph-shopping-cart-simple-duotone"
              :aria-label="$t('pages.productsPage.addToCart')"
            />
          </div>

          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400 group-hover:text-primary-500 transition-colors">
              {{ product.seller }}
            </p>
            <h3 class="mt-1 text-xl font-black leading-tight tracking-tight text-secondary-950 group-hover:text-primary-950 transition-colors">
              {{ product.title }}
            </h3>
          </div>

          <p class="text-xs font-medium leading-relaxed text-secondary-500 line-clamp-2 min-h-[3rem]">
            {{ product.description }}
          </p>

          <div class="flex items-end justify-between gap-4 pt-2">
            <div class="space-y-0.5">
              <p class="text-[10px] font-bold uppercase tracking-widest text-secondary-400 leading-none">
                {{ $t("pages.productsPage.priceLabel") }}
              </p>
              <p class="text-2xl font-black text-emerald-600 tracking-tight leading-none pt-1">
                {{ formatCurrency(product.price) }}
              </p>
            </div>

            <div class="flex flex-col items-end gap-2 text-right">
              <div class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700 border border-emerald-100/50">
                <Icon name="i-ph-star-fill" class="h-3.5 w-3.5" />
                {{ product.rating.toFixed(1) }}
              </div>
              <p class="text-[10px] font-bold text-secondary-400 uppercase tracking-tighter">
                {{ product.postedLabel }}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div
      v-else
      class="rounded-[28px] border border-dashed border-[#c7d1ff] bg-white/90 px-6 py-12 text-center shadow-[0_8px_24px_rgba(15,35,110,0.05)]"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef0ff] text-[#0000ff]">
        <Icon name="i-ph-storefront-fill" class="h-7 w-7" />
      </div>
      <h3 class="mt-4 text-[1.35rem] font-black tracking-[-0.04em] text-[#243b63]">
        {{ $t("pages.productsPage.emptyTitle") }}
      </h3>
      <p class="mt-2 text-[14px] leading-6 text-slate-500">
        {{ $t("pages.productsPage.emptyDescription") }}
      </p>
      <button
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0000ff] px-5 py-3 text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(0,0,255,0.18)] transition hover:-translate-y-0.5"
        type="button"
        @click="resetFilters"
      >
        <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
        {{ $t("pages.productsPage.resetAll") }}
      </button>
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
    background: "linear-gradient(135deg,#0f766e 0%,#14b8a6 45%,#99f6e4 100%)",
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
    background: "linear-gradient(135deg,#14532d 0%,#16a34a 38%,#bbf7d0 100%)",
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
