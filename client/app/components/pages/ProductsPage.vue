<template>
  <div class="space-y-5 pb-10">
    <section class="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#c9343a_0%,#d95d93_42%,#b44848_100%)] px-5 pb-16 pt-6 text-white shadow-[0_16px_40px_rgba(180,72,72,0.22)] sm:px-7 sm:pt-8 lg:px-8">
      <div class="pointer-events-none absolute inset-x-[-8%] top-[22%] h-[220px] rounded-[50%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_65%)]" />
      <div class="pointer-events-none absolute right-[-6%] top-[-12%] h-[240px] w-[240px] rounded-full bg-white/10 blur-2xl" />
      <div class="pointer-events-none absolute bottom-[-24%] left-[-6%] h-[220px] w-[220px] rounded-full bg-[#f59e0b]/20 blur-3xl" />

      <div class="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-[720px]">
          <p class="text-[12px] font-extrabold uppercase tracking-[0.32em] text-white/70">
            P-10 · Marketplace
          </p>
          <h1 class="mt-3 text-display text-[2.2rem] leading-[0.92] text-white sm:text-[2.8rem]">
            Thị trường
          </h1>
          <p class="mt-3 max-w-[560px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
            Mua và bán sản phẩm dễ dàng tại VNSEEA. Khám phá gian hàng gần bạn,
            lọc theo nhu cầu và theo dõi những món đang được quan tâm nhất.
          </p>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <NuxtLink
              to="/new-product"
              class="inline-flex h-12 items-center justify-center rounded-full bg-[#243b63] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(36,59,99,0.24)] transition hover:-translate-y-0.5"
            >
              <Icon name="i-ph-plus-circle-fill" class="mr-2 h-4 w-4" />
              Đăng tin mới
            </NuxtLink>

            <NuxtLink
              to="/my-products"
              class="inline-flex h-12 items-center justify-center rounded-full bg-[#fde7b2] px-5 text-[14px] font-extrabold text-[#c85c3f] shadow-[0_10px_26px_rgba(253,231,178,0.24)] transition hover:-translate-y-0.5"
            >
              <Icon name="i-ph-package-fill" class="mr-2 h-4 w-4" />
              Sản phẩm của tôi
            </NuxtLink>

            <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-medium text-white/90">
              <Icon name="i-ph-map-pin-fill" class="h-4 w-4 text-[#fde7b2]" />
              {{ nearbyCount }} gian hàng trong bán kính 5km
            </div>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-1">
          <div
            v-for="item in heroStats"
            :key="item.label"
            class="rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-[6px]"
          >
            <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
              {{ item.label }}
            </p>
            <p class="mt-2 text-[1.7rem] font-black leading-none text-white">
              {{ item.value }}
            </p>
            <p class="mt-1 text-[13px] text-white/72">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="relative z-10 -mt-10 rounded-[28px] border border-white/70 bg-white/95 p-3 shadow-[0_16px_36px_rgba(15,35,110,0.09)] backdrop-blur sm:p-4">
      <label class="relative block">
        <Icon
          name="i-ph-magnifying-glass"
          class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="search"
          class="h-14 w-full rounded-[20px] border border-[#dbe3f2] bg-[#f7f7f8] pl-12 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c5caff] focus:bg-white focus:ring-4 focus:ring-[#edf1ff]"
          placeholder="Tìm kiếm sản phẩm"
          type="search"
        >
      </label>

      <div class="mt-3 grid gap-3 xl:grid-cols-[1fr_1fr_1.15fr_auto]">
        <label class="block">
          <span class="sr-only">Sắp xếp theo</span>
          <select
            v-model="sortBy"
            class="h-12 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] font-semibold text-slate-700 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#edf1ff]"
          >
            <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="sr-only">Thể loại</span>
          <select
            v-model="selectedCategory"
            class="h-12 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] font-semibold text-slate-700 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#edf1ff]"
          >
            <option
              v-for="option in categoryOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="sr-only">Khoảng cách vị trí</span>
          <select
            v-model="selectedDistance"
            class="h-12 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] font-semibold text-slate-700 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#edf1ff]"
          >
            <option
              v-for="option in distanceOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <button
          class="inline-flex h-12 items-center justify-center rounded-[18px] px-5 text-[15px] font-extrabold transition duration-150"
          :class="nearbyOnly
            ? 'bg-[#243b63] text-white shadow-[0_10px_24px_rgba(36,59,99,0.18)]'
            : 'bg-[#b44848] text-white shadow-[0_10px_24px_rgba(180,72,72,0.16)] hover:-translate-y-0.5'"
          type="button"
          @click="nearbyOnly = !nearbyOnly"
        >
          {{ nearbyOnly ? "Đang lọc cửa hàng lân cận" : "Cửa hàng lân cận" }}
        </button>
      </div>
    </section>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="chip in quickCategoryChips"
        :key="chip.value"
        class="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition duration-150"
        :class="selectedCategory === chip.value
          ? 'border-[#0000ff] bg-[#eef0ff] text-[#0000ff]'
          : 'border-[#dbe3f2] bg-white text-slate-500 hover:border-[#c5caff] hover:text-[#0000ff]'"
        type="button"
        @click="selectedCategory = chip.value"
      >
        <Icon :name="chip.icon" class="h-3.5 w-3.5" />
        {{ chip.label }}
      </button>
    </div>

    <div class="flex flex-col gap-3 rounded-[24px] border border-[#dbe3f2] bg-white/90 px-4 py-4 shadow-[0_6px_22px_rgba(15,35,110,0.05)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
          Kết quả
        </p>
        <h2 class="mt-1 text-[1.25rem] font-black tracking-[-0.05em] text-[#243b63]">
          {{ resultHeading }}
        </h2>
        <p class="mt-1 text-[14px] text-slate-500">
          {{ visibleProducts.length }} sản phẩm phù hợp • Sắp xếp theo
          {{ currentSortLabel }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <div class="inline-flex items-center gap-2 rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-600">
          <Icon name="i-ph-funnel-fill" class="h-4 w-4 text-[#0000ff]" />
          {{ activeFiltersLabel }}
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-[#dbe3f2] bg-white px-3 py-2 text-[12px] font-semibold text-slate-500 transition hover:border-[#c5caff] hover:text-[#0000ff]"
          type="button"
          @click="resetFilters"
        >
          <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
          Đặt lại bộ lọc
        </button>
      </div>
    </div>

    <div
      v-if="visibleProducts.length > 0"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4"
    >
      <article
        v-for="product in visibleProducts"
        :key="product.id"
        class="group overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(15,35,110,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,35,110,0.12)]"
      >
        <div class="relative h-[240px] overflow-hidden">
          <div class="absolute inset-0" :style="{ background: product.background }" />
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_30%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.15)_100%)]" />

          <Icon
            :name="product.icon"
            class="absolute right-5 top-6 h-24 w-24 text-white/18 transition duration-200 group-hover:scale-110"
          />

          <div class="absolute left-3 top-3 flex flex-wrap gap-2">
            <span class="rounded-[10px] bg-[#101828]/80 px-2.5 py-1 text-[11px] font-bold text-white">
              {{ product.categoryLabel }}
            </span>
            <span class="rounded-[10px] bg-white/16 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-[4px]">
              {{ product.condition }}
            </span>
          </div>

          <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <div class="rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-[4px]">
              {{ product.location }}
            </div>
            <div class="rounded-full bg-white/18 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-[4px]">
              {{ formatDistance(product.distanceKm) }}
            </div>
          </div>
        </div>

        <div class="relative p-4">
          <div class="absolute -top-6 right-4 flex items-center gap-2">
            <button
              class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f7ff] text-slate-500 shadow-[0_8px_18px_rgba(15,35,110,0.12)] transition hover:bg-white hover:text-[#243b63]"
              type="button"
              aria-label="Nhắn người bán"
            >
              <Icon name="i-ph-chat-circle-text-fill" class="h-5 w-5" />
            </button>
            <button
              class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0000ff] text-white shadow-[0_10px_22px_rgba(0,0,255,0.24)] transition hover:scale-[1.03]"
              type="button"
              aria-label="Thêm vào giỏ"
            >
              <Icon name="i-ph-shopping-cart-simple-fill" class="h-5 w-5" />
            </button>
          </div>

          <div class="pr-24">
            <p class="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {{ product.seller }}
            </p>
            <h3 class="mt-2 text-[1.28rem] font-black leading-[1.1] tracking-[-0.05em] text-[#243b63]">
              {{ product.title }}
            </h3>
          </div>

          <p class="mt-3 min-h-[42px] text-[13px] leading-6 text-slate-500">
            {{ product.description }}
          </p>

          <div class="mt-4 flex items-end justify-between gap-3">
            <div>
              <p class="text-[12px] font-semibold text-slate-400">
                Giá bán
              </p>
              <p class="text-[1.2rem] font-black text-[#16a34a]">
                {{ formatCurrency(product.price) }}
              </p>
            </div>

            <div class="text-right">
              <div class="inline-flex items-center gap-1 rounded-full bg-[#effaf3] px-2.5 py-1 text-[11px] font-bold text-[#16a34a]">
                <Icon name="i-ph-star-fill" class="h-3.5 w-3.5" />
                {{ product.rating.toFixed(1) }}
              </div>
              <p class="mt-2 text-[12px] font-medium text-slate-400">
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
        Chưa có sản phẩm phù hợp
      </h3>
      <p class="mt-2 text-[14px] leading-6 text-slate-500">
        Hãy thử đổi từ khóa tìm kiếm hoặc nới rộng bộ lọc khoảng cách.
      </p>
      <button
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0000ff] px-5 py-3 text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(0,0,255,0.18)] transition hover:-translate-y-0.5"
        type="button"
        @click="resetFilters"
      >
        <Icon name="i-ph-arrow-counter-clockwise" class="h-4 w-4" />
        Đặt lại để xem tất cả
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

useSeoMeta({
  title: "Thị trường | VNSEEA",
  description: "Khám phá sản phẩm, gian hàng gần bạn và quản lý tin đăng trong khu vực marketplace của VNSEEA.",
})

const search = ref("")
const sortBy = ref<SortValue>("featured")
const selectedCategory = ref<ProductCategory>("all")
const selectedDistance = ref<DistanceValue>("all")
const nearbyOnly = ref(false)

const sortOptions = [
  { label: "Sắp xếp theo", value: "featured" },
  { label: "Mới nhất", value: "latest" },
  { label: "Giá tăng dần", value: "price-asc" },
  { label: "Giá giảm dần", value: "price-desc" },
  { label: "Gần nhất", value: "nearest" },
  { label: "Đánh giá cao", value: "rating" },
] satisfies { label: string; value: SortValue }[]

const categoryOptions = [
  { label: "Thể loại", value: "all" },
  { label: "Ô tô & Xe cộ", value: "vehicles" },
  { label: "Nhà cửa", value: "home" },
  { label: "Làm đẹp", value: "beauty" },
  { label: "Sách & Tài liệu", value: "books" },
  { label: "Thiết bị số", value: "tech" },
  { label: "Đặc sản", value: "food" },
] satisfies { label: string; value: ProductCategory }[]

const distanceOptions = [
  { label: "Khoảng cách vị trí", value: "all" },
  { label: "Trong 5 km", value: "5" },
  { label: "Trong 10 km", value: "10" },
  { label: "Trong 25 km", value: "25" },
] satisfies { label: string; value: DistanceValue }[]

const quickCategoryChips = [
  { label: "Tất cả", value: "all", icon: "i-ph-squares-four" },
  { label: "Ô tô & Xe cộ", value: "vehicles", icon: "i-ph-car-profile" },
  { label: "Nhà cửa", value: "home", icon: "i-ph-armchair" },
  { label: "Làm đẹp", value: "beauty", icon: "i-ph-drop" },
  { label: "Sách", value: "books", icon: "i-ph-book-open-text" },
  { label: "Thiết bị số", value: "tech", icon: "i-ph-device-mobile-camera" },
] satisfies { label: string; value: ProductCategory; icon: string }[]

const products = [
  {
    id: 1,
    title: "Xe đạp gấp đô thị",
    seller: "Bạn",
    price: 4200000,
    location: "Cầu Giấy, Hà Nội",
    distanceKm: 1.8,
    category: "vehicles",
    categoryLabel: "Ô tô & Xe cộ",
    condition: "Như mới",
    description: "Khung nhôm gọn nhẹ, phanh đĩa và đầy đủ phụ kiện cho việc đi lại hằng ngày.",
    background: "linear-gradient(135deg,#172554 0%,#1d4ed8 48%,#7dd3fc 100%)",
    icon: "i-ph-bicycle",
    postedHoursAgo: 2,
    postedLabel: "2 giờ trước",
    rating: 4.9,
    mine: true,
  },
  {
    id: 2,
    title: "Bàn trà gỗ sồi",
    seller: "Hoàng An",
    price: 1850000,
    location: "Nam Từ Liêm, Hà Nội",
    distanceKm: 4.2,
    category: "home",
    categoryLabel: "Nhà cửa",
    condition: "Đang giảm",
    description: "Mặt bàn chống xước, kiểu dáng tối giản phù hợp phòng khách hoặc studio nhỏ.",
    background: "linear-gradient(135deg,#78350f 0%,#b45309 38%,#f59e0b 100%)",
    icon: "i-ph-armchair",
    postedHoursAgo: 6,
    postedLabel: "6 giờ trước",
    rating: 4.8,
  },
  {
    id: 3,
    title: "Combo dưỡng tóc Yaskey",
    seller: "Hải Dương",
    price: 520000,
    location: "Hai Bà Trưng, Hà Nội",
    distanceKm: 3.1,
    category: "beauty",
    categoryLabel: "Làm đẹp",
    condition: "Bán chạy",
    description: "Bộ chăm sóc tóc gồm serum, mask và xịt dưỡng phục hồi sau tạo kiểu.",
    background: "linear-gradient(135deg,#0f766e 0%,#14b8a6 45%,#99f6e4 100%)",
    icon: "i-ph-drop-fill",
    postedHoursAgo: 4,
    postedLabel: "4 giờ trước",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Sách kinh tế tư duy",
    seller: "Minh Châu",
    price: 145000,
    location: "Hoàn Kiếm, Hà Nội",
    distanceKm: 8.4,
    category: "books",
    categoryLabel: "Sách & Tài liệu",
    condition: "Mới đăng",
    description: "Bản in đẹp, còn mới 95%, phù hợp cho người thích đọc nhanh và ghi chú nhiều.",
    background: "linear-gradient(135deg,#14532d 0%,#16a34a 38%,#bbf7d0 100%)",
    icon: "i-ph-book-open-text-fill",
    postedHoursAgo: 1,
    postedLabel: "1 giờ trước",
    rating: 4.7,
  },
  {
    id: 5,
    title: "Loa bluetooth mini",
    seller: "Tú Anh",
    price: 890000,
    location: "Thanh Xuân, Hà Nội",
    distanceKm: 5.6,
    category: "tech",
    categoryLabel: "Thiết bị số",
    condition: "Free ship",
    description: "Âm bass chắc, pin 12 giờ, chống nước nhẹ và sạc USB-C thuận tiện.",
    background: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
    icon: "i-ph-speaker-high-fill",
    postedHoursAgo: 12,
    postedLabel: "12 giờ trước",
    rating: 4.6,
  },
  {
    id: 6,
    title: "Hạt điều rang muối",
    seller: "Nông trại Bơ",
    price: 210000,
    location: "Đống Đa, Hà Nội",
    distanceKm: 2.7,
    category: "food",
    categoryLabel: "Đặc sản",
    condition: "Mới rang",
    description: "Hạt đều, giòn và ít muối. Gói 500g phù hợp làm quà tặng hoặc dùng tại văn phòng.",
    background: "linear-gradient(135deg,#7c2d12 0%,#ea580c 40%,#fdba74 100%)",
    icon: "i-ph-bowl-food-fill",
    postedHoursAgo: 8,
    postedLabel: "8 giờ trước",
    rating: 4.8,
  },
  {
    id: 7,
    title: "Đèn bàn vintage",
    seller: "Bạn",
    price: 760000,
    location: "Tây Hồ, Hà Nội",
    distanceKm: 9.8,
    category: "home",
    categoryLabel: "Nhà cửa",
    condition: "Có sẵn",
    description: "Ánh sáng ấm, chân đồng xước nhẹ theo thời gian, hợp không gian làm việc tại nhà.",
    background: "linear-gradient(135deg,#3f3cbb 0%,#5b86e5 48%,#c2e9fb 100%)",
    icon: "i-ph-lamp-fill",
    postedHoursAgo: 18,
    postedLabel: "18 giờ trước",
    rating: 4.5,
    mine: true,
  },
  {
    id: 8,
    title: "Máy ảnh mirrorless cũ",
    seller: "Studio Mộc",
    price: 12800000,
    location: "Long Biên, Hà Nội",
    distanceKm: 14.2,
    category: "tech",
    categoryLabel: "Thiết bị số",
    condition: "Uy tín",
    description: "Body gọn, chụp chân dung đẹp, tặng kèm pin phụ và túi chống sốc.",
    background: "linear-gradient(135deg,#1f2937 0%,#475569 36%,#dbeafe 100%)",
    icon: "i-ph-camera-fill",
    postedHoursAgo: 24,
    postedLabel: "Hôm qua",
    rating: 4.9,
  },
] satisfies ProductItem[]

const heroStats = computed(() => [
  {
    label: "Gian hàng hoạt động",
    value: "128",
    description: "Các người bán đang cập nhật sản phẩm mới mỗi ngày.",
  },
  {
    label: "Tin nổi bật",
    value: String(products.filter(item => item.postedHoursAgo <= 8).length),
    description: "Sản phẩm mới đăng và có tương tác tốt trong hôm nay.",
  },
  {
    label: "Của bạn",
    value: String(products.filter(item => item.mine).length),
    description: "Tin đăng cá nhân bạn có thể xem lại và tiếp tục chỉnh sửa.",
  },
])

const nearbyCount = computed(() => products.filter(item => item.distanceKm <= 5).length)

const currentSortLabel = computed(
  () => sortOptions.find(option => option.value === sortBy.value)?.label ?? "Sắp xếp theo",
)

const activeFiltersLabel = computed(() => {
  const labels: string[] = []

  if (selectedCategory.value !== "all") {
    labels.push(
      categoryOptions.find(option => option.value === selectedCategory.value)?.label ?? "",
    )
  }

  if (selectedDistance.value !== "all") {
    labels.push(
      distanceOptions.find(option => option.value === selectedDistance.value)?.label ?? "",
    )
  }

  if (nearbyOnly.value) labels.push("Lân cận")

  return labels.length > 0 ? labels.join(" • ") : "Tất cả sản phẩm"
})

const resultHeading = computed(() => "Danh sách sản phẩm đang được quan tâm")

const visibleProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  const filtered = products.filter((product) => {
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
  `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km`

const resetFilters = () => {
  search.value = ""
  sortBy.value = "featured"
  selectedCategory.value = "all"
  selectedDistance.value = "all"
  nearbyOnly.value = false
}
</script>
