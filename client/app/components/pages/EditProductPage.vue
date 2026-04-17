<template>
  <div class="space-y-5 pb-10">
    <section class="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#243b63_0%,#1d4ed8_42%,#38bdf8_110%)] px-5 pb-10 pt-6 text-white shadow-[0_16px_40px_rgba(29,78,216,0.22)] sm:px-7 sm:pt-8 lg:px-8">
      <div class="pointer-events-none absolute inset-x-[-10%] top-[26%] h-[220px] rounded-[50%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_65%)]" />
      <div class="pointer-events-none absolute right-[-6%] top-[-14%] h-[260px] w-[260px] rounded-full bg-white/10 blur-2xl" />
      <div class="pointer-events-none absolute bottom-[-22%] left-[-8%] h-[220px] w-[220px] rounded-full bg-[#0f172a]/30 blur-3xl" />

      <div class="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-[760px]">
          <p class="text-[12px] font-extrabold uppercase tracking-[0.32em] text-white/70">
            P-12 · Chỉnh sửa sản phẩm
          </p>
          <h1 class="mt-3 text-display text-[2.2rem] leading-[0.92] text-white sm:text-[2.85rem]">
            Sửa sản phẩm #{{ productId }}
          </h1>
          <p class="mt-3 max-w-[580px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
            Giao diện chỉnh sửa dùng cùng visual system với trang tạo sản phẩm,
            nhưng được pre-fill dữ liệu cũ và hỗ trợ xóa ảnh hiện tại trước khi lưu.
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink
              to="/my-products"
              class="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-[14px] font-bold text-white transition hover:bg-white/15"
            >
              <Icon name="i-ph-arrow-left" class="mr-2 h-4 w-4" />
              Quay lại sản phẩm của tôi
            </NuxtLink>

            <button
              class="inline-flex h-12 items-center justify-center rounded-full bg-[#dbeafe] px-5 text-[14px] font-extrabold text-[#1d4ed8] shadow-[0_10px_26px_rgba(219,234,254,0.24)] transition hover:-translate-y-0.5"
              type="button"
              @click="restoreOriginal"
            >
              Khôi phục dữ liệu gốc
            </button>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 xl:w-[430px] xl:grid-cols-1">
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

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.06fr)_360px]">
      <section class="space-y-5">
        <div class="rounded-[28px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
                Biên tập
              </p>
              <h2 class="mt-1 text-[1.35rem] font-black tracking-[-0.05em] text-[#243b63]">
                Cập nhật thông tin sản phẩm
              </h2>
              <p class="mt-1 text-[14px] leading-6 text-slate-500">
                Dữ liệu đang được nạp sẵn theo mã sản phẩm để bạn chỉnh nhanh rồi lưu thay đổi.
              </p>
            </div>

            <div class="inline-flex items-center gap-2 rounded-full bg-[#f7f9ff] px-3 py-2 text-[12px] font-semibold text-slate-600">
              <Icon name="i-ph-seal-check-fill" class="h-4 w-4 text-[#0000ff]" />
              {{ completionText }}
            </div>
          </div>
        </div>

        <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
          <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_360px]">
            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[#2f3542]">Tên</span>
              <input
                v-model="title"
                type="text"
                class="h-[5.5rem] w-full rounded-[22px] border border-slate-200 bg-white px-5 text-[1.1rem] text-slate-900 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
              >
            </label>

            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[#2f3542]">Giá bán</span>
              <input
                v-model="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="h-[5.5rem] w-full rounded-[22px] border border-slate-200 bg-white px-5 text-[1.1rem] text-slate-900 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
              >
            </label>
          </div>

          <label class="mt-8 block space-y-3">
            <span class="text-[1.02rem] font-black text-[#2f3542]">Mô tả</span>
            <textarea
              v-model="description"
              rows="5"
              placeholder="Vui lòng mô tả sản phẩm của bạn."
              class="min-h-[210px] w-full resize-y rounded-[22px] border border-slate-200 bg-white px-5 py-5 text-[1rem] leading-8 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
            />
          </label>

          <div class="mt-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_360px]">
            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[#2f3542]">Loại</span>
              <select
                v-model="category"
                class="h-[5.5rem] w-full rounded-[22px] border border-slate-200 bg-white px-5 text-[1.1rem] font-medium text-slate-900 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
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

            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[#2f3542]">Loại hình</span>
              <select
                v-model="condition"
                class="h-[5.5rem] w-full rounded-[22px] border border-slate-200 bg-white px-5 text-[1.1rem] font-medium text-slate-900 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
              >
                <option
                  v-for="option in conditionOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="mt-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_360px]">
            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[#2f3542]">Địa điểm</span>
              <span class="relative block">
                <Icon
                  name="i-ph-magnifying-glass-bold"
                  class="pointer-events-none absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-500"
                />
                <input
                  v-model="location"
                  type="text"
                  placeholder="Địa điểm"
                  class="h-[5.5rem] w-full rounded-[22px] border border-slate-900 bg-white pl-16 pr-5 text-[1.1rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
                >
              </span>
            </label>

            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[#2f3542]">Tiền tệ</span>
              <select
                v-model="currency"
                class="h-[5.5rem] w-full rounded-[22px] border border-slate-200 bg-white px-5 text-[1.1rem] font-medium text-slate-900 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
              >
                <option
                  v-for="option in currencyOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
            <label class="block space-y-3">
              <span class="text-[1.02rem] font-black text-[#2f3542]">Tổng số đơn vị mặt hàng</span>
              <input
                v-model="stock"
                type="number"
                min="0"
                step="1"
                class="h-[5.5rem] w-full rounded-[22px] border border-slate-200 bg-white px-5 text-[1.1rem] text-slate-900 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
              >
            </label>

            <div class="flex items-end justify-start lg:justify-end">
              <div class="rounded-full bg-[#f7f9ff] px-4 py-3 text-[13px] font-semibold text-slate-500">
                {{ mediaSummary }}
              </div>
            </div>
          </div>

          <div class="mt-8 space-y-3">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-[1.02rem] font-black text-[#2f3542]">Ảnh hiện tại</p>
              <div class="rounded-full bg-[#fff7ed] px-3 py-1.5 text-[12px] font-semibold text-[#c2410c]">
                {{ removedImages.length }} ảnh sẽ bị xóa
              </div>
            </div>

            <div class="flex min-h-[104px] flex-wrap gap-3 rounded-[24px] border border-[#dbe3f2] bg-[#f8fbff] p-4">
              <template v-if="currentImages.length > 0">
                <div
                  v-for="image in currentImages"
                  :key="image.id"
                  class="relative flex h-20 w-20 items-center justify-center rounded-[20px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#eef3ff_100%)] text-[#243b63]"
                >
                  <button
                    class="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#be123c] text-white shadow-[0_8px_18px_rgba(190,18,60,0.28)] transition hover:scale-105"
                    type="button"
                    @click="removeCurrentImage(image.id)"
                  >
                    <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
                  </button>
                  <Icon name="i-ph-image-square-fill" class="h-7 w-7" />
                </div>
              </template>

              <div
                v-else
                class="flex min-h-[72px] flex-1 items-center justify-center rounded-[20px] border border-dashed border-[#cbd5e1] bg-white px-4 text-center text-[13px] font-medium text-slate-400"
              >
                Không còn ảnh cũ nào được giữ lại.
              </div>
            </div>
          </div>

          <div class="mt-8 space-y-3">
            <p class="text-[1.02rem] font-black text-[#2f3542]">Ảnh mới</p>
            <div class="flex flex-wrap items-end gap-4">
              <button
                type="button"
                class="group flex h-[160px] w-[160px] items-center justify-center rounded-[22px] border border-[#e5e7eb] bg-[#f4f6fb] transition hover:border-[#0000ff]/30 hover:bg-[#eef2ff]"
                @click="addNewImage"
              >
                <div class="text-center">
                  <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-slate-400 shadow-sm transition group-hover:text-[#0000ff]">
                    <Icon name="i-ph-camera-fill" class="h-8 w-8" />
                  </div>
                  <p class="mt-3 text-[13px] font-semibold text-slate-500">
                    {{ imageButtonLabel }}
                  </p>
                </div>
              </button>

              <div class="flex min-w-[220px] flex-1 flex-wrap gap-2">
                <div
                  v-for="item in newImageTiles"
                  :key="item.name"
                  class="relative flex h-20 w-20 items-center justify-center rounded-[20px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#f8fbff_0%,#eef3ff_100%)] text-[#243b63]"
                >
                  <button
                    class="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-white shadow-[0_8px_18px_rgba(51,65,85,0.2)] transition hover:scale-105"
                    type="button"
                    @click="removeNewImage(item.name)"
                  >
                    <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
                  </button>
                  <Icon name="i-ph-image-square-fill" class="h-7 w-7" />
                </div>
              </div>
            </div>
            <p class="text-[13px] leading-6 text-slate-500">
              Mock UI: ảnh cũ có thể bỏ khỏi tin đăng, còn ảnh mới đang mô phỏng bằng tile để kiểm tra flow chỉnh sửa.
            </p>
          </div>
        </section>

        <FormsSubmitBar
          hint="Mock state: giao diện sửa sản phẩm đã có pre-fill dữ liệu cũ và xóa ảnh cũ, chưa submit thật tới edit-product.php."
          cta="Lưu thay đổi"
        />
      </section>

      <aside class="space-y-5">
        <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
          <div class="relative h-[250px] overflow-hidden">
            <div class="absolute inset-0" :style="{ background: previewBackground }" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_30%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.18)_100%)]" />
            <Icon :name="previewIcon" class="absolute right-5 top-5 h-24 w-24 text-white/18" />

            <div class="absolute left-4 top-4 flex gap-2">
              <span class="rounded-[10px] bg-[#101828]/80 px-2.5 py-1 text-[11px] font-bold text-white">
                {{ previewCategoryLabel }}
              </span>
              <span class="rounded-[10px] bg-white/16 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-[4px]">
                {{ previewConditionLabel }}
              </span>
            </div>

            <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div class="rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-[4px]">
                {{ location || "Khu vực hiển thị" }}
              </div>
              <div class="rounded-full bg-white/18 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-[4px]">
                {{ totalImageCount }} ảnh
              </div>
            </div>
          </div>

          <div class="relative p-4">
            <div class="absolute -top-6 right-4 flex items-center gap-2">
              <div class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f7ff] text-slate-500 shadow-[0_8px_18px_rgba(15,35,110,0.12)]">
                <Icon name="i-ph-pencil-simple-fill" class="h-5 w-5" />
              </div>
              <div class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0000ff] text-white shadow-[0_10px_22px_rgba(0,0,255,0.24)]">
                <Icon name="i-ph-floppy-disk-back-fill" class="h-5 w-5" />
              </div>
            </div>

            <p class="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {{ previewCurrencyLabel }}
            </p>
            <h3 class="mt-2 pr-24 text-[1.28rem] font-black leading-[1.1] tracking-[-0.05em] text-[#243b63]">
              {{ title || "Tên sản phẩm sẽ hiển thị ở đây" }}
            </h3>

            <p class="mt-3 min-h-[72px] text-[13px] leading-6 text-slate-500">
              {{ previewDescription }}
            </p>

            <div class="mt-4 flex items-end justify-between gap-3">
              <div>
                <p class="text-[12px] font-semibold text-slate-400">Giá bán</p>
                <p class="text-[1.2rem] font-black text-[#16a34a]">
                  {{ previewPrice }}
                </p>
              </div>

              <div class="text-right">
                <div class="inline-flex items-center gap-1 rounded-full bg-[#effaf3] px-2.5 py-1 text-[11px] font-bold text-[#16a34a]">
                  <Icon name="i-ph-check-circle-fill" class="h-3.5 w-3.5" />
                  Cập nhật
                </div>
                <p class="mt-2 text-[12px] font-medium text-slate-400">
                  {{ stockLabel }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
          <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
            Checklist
          </p>
          <div class="mt-4 space-y-3">
            <div
              v-for="item in checklistItems"
              :key="item.label"
              class="flex items-start gap-3 rounded-[18px] border px-3.5 py-3"
              :class="item.done ? 'border-[#b8f0c9] bg-[#f2fcf5]' : 'border-[#dbe3f2] bg-[#f8fbff]'"
            >
              <div
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                :class="item.done ? 'bg-[#16a34a] text-white' : 'border border-[#dbe3f2] bg-white text-slate-300'"
              >
                <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-dot-outline'" class="h-3.5 w-3.5" />
              </div>
              <div>
                <p class="text-[13px] font-semibold text-[#243b63]">{{ item.label }}</p>
                <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
          <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
            Gợi ý chỉnh sửa
          </p>
          <div class="mt-4 space-y-3">
            <div
              v-for="tip in editingTips"
              :key="tip.title"
              class="rounded-[18px] border border-[#dbe3f2] bg-[#f8fbff] p-4"
            >
              <div class="flex items-center gap-2">
                <Icon :name="tip.icon" class="h-4 w-4 text-[#0000ff]" />
                <p class="text-[13px] font-semibold text-[#243b63]">{{ tip.title }}</p>
              </div>
              <p class="mt-2 text-[12px] leading-6 text-slate-500">
                {{ tip.description }}
              </p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
type CategoryValue = "home" | "tech" | "beauty" | "books" | "vehicles" | "food"
type ConditionValue = "new" | "like-new" | "used"
type CurrencyValue = "USD" | "VND" | "EUR"

type MockProduct = {
  title: string
  price: string
  description: string
  category: CategoryValue
  condition: ConditionValue
  location: string
  currency: CurrencyValue
  stock: string
  oldImages: { id: string }[]
  updatedAt: string
}

const props = defineProps<{
  productId: string
}>()

const categoryOptions = [
  { label: "Nhà cửa", value: "home" },
  { label: "Thiết bị số", value: "tech" },
  { label: "Làm đẹp", value: "beauty" },
  { label: "Sách & Tài liệu", value: "books" },
  { label: "Ô tô & Xe cộ", value: "vehicles" },
  { label: "Đặc sản", value: "food" },
] satisfies { label: string; value: CategoryValue }[]

const conditionOptions = [
  { label: "Mới", value: "new" },
  { label: "Như mới", value: "like-new" },
  { label: "Đã qua sử dụng", value: "used" },
] satisfies { label: string; value: ConditionValue }[]

const currencyOptions = [
  { label: "USD ($)", value: "USD" },
  { label: "VND (₫)", value: "VND" },
  { label: "EUR (€)", value: "EUR" },
] satisfies { label: string; value: CurrencyValue }[]

const categoryMeta: Record<CategoryValue, { label: string; icon: string; background: string }> = {
  home: {
    label: "Nhà cửa",
    icon: "i-ph-armchair-fill",
    background: "linear-gradient(135deg,#78350f 0%,#b45309 38%,#f59e0b 100%)",
  },
  tech: {
    label: "Thiết bị số",
    icon: "i-ph-device-mobile-camera-fill",
    background: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
  },
  beauty: {
    label: "Làm đẹp",
    icon: "i-ph-drop-fill",
    background: "linear-gradient(135deg,#0f766e 0%,#14b8a6 45%,#99f6e4 100%)",
  },
  books: {
    label: "Sách & Tài liệu",
    icon: "i-ph-book-open-text-fill",
    background: "linear-gradient(135deg,#14532d 0%,#16a34a 38%,#bbf7d0 100%)",
  },
  vehicles: {
    label: "Ô tô & Xe cộ",
    icon: "i-ph-car-profile-fill",
    background: "linear-gradient(135deg,#172554 0%,#1d4ed8 48%,#7dd3fc 100%)",
  },
  food: {
    label: "Đặc sản",
    icon: "i-ph-bowl-food-fill",
    background: "linear-gradient(135deg,#7c2d12 0%,#ea580c 40%,#fdba74 100%)",
  },
}

const conditionMap: Record<ConditionValue, string> = {
  new: "Mới",
  "like-new": "Như mới",
  used: "Đã qua sử dụng",
}

const currencyMeta: Record<CurrencyValue, { label: string; locale: string }> = {
  USD: { label: "USD ($)", locale: "en-US" },
  VND: { label: "VND (₫)", locale: "vi-VN" },
  EUR: { label: "EUR (€)", locale: "de-DE" },
}

const mockProducts: Record<string, MockProduct> = {
  "101": {
    title: "Honda Vision 2024",
    price: "1250",
    description: "Xe đi ít, giấy tờ đầy đủ, máy êm và ngoại hình còn mới. Phù hợp đi lại hằng ngày hoặc mua cho sinh viên.",
    category: "vehicles",
    condition: "like-new",
    location: "Đà Nẵng",
    currency: "USD",
    stock: "2",
    oldImages: [{ id: "old-1" }, { id: "old-2" }, { id: "old-3" }],
    updatedAt: "Cập nhật 2 giờ trước",
  },
  "202": {
    title: "Bộ nồi chiên không dầu 6L",
    price: "185",
    description: "Bộ nồi chiên còn đẹp, hoạt động ổn định, đầy đủ khay và phụ kiện. Phù hợp gia đình nhỏ và căn hộ.",
    category: "home",
    condition: "used",
    location: "TP. Hồ Chí Minh",
    currency: "USD",
    stock: "5",
    oldImages: [{ id: "old-1" }, { id: "old-2" }],
    updatedAt: "Cập nhật hôm qua",
  },
}

const fallbackProduct: MockProduct = {
  title: "Sản phẩm demo đang chỉnh sửa",
  price: "89",
  description: "Đây là dữ liệu mẫu để kiểm tra flow sửa sản phẩm trong marketplace.",
  category: "tech",
  condition: "new",
  location: "Hà Nội",
  currency: "USD",
  stock: "3",
  oldImages: [{ id: "old-1" }, { id: "old-2" }],
  updatedAt: "Cập nhật gần đây",
}

const title = ref("")
const price = ref("")
const description = ref("")
const category = ref<CategoryValue>("vehicles")
const condition = ref<ConditionValue>("new")
const location = ref("")
const currency = ref<CurrencyValue>("USD")
const stock = ref("")
const currentImages = ref<{ id: string }[]>([])
const removedImages = ref<string[]>([])
const newImages = ref<{ name: string }[]>([])

const activeProduct = computed(() => mockProducts[props.productId] ?? fallbackProduct)

const applyProduct = (product: MockProduct) => {
  title.value = product.title
  price.value = product.price
  description.value = product.description
  category.value = product.category
  condition.value = product.condition
  location.value = product.location
  currency.value = product.currency
  stock.value = product.stock
  currentImages.value = product.oldImages.map(image => ({ ...image }))
  removedImages.value = []
  newImages.value = []
}

watch(
  () => props.productId,
  () => {
    applyProduct(activeProduct.value)
  },
  { immediate: true },
)

const completionCount = computed(() =>
  [
    title.value.trim(),
    price.value.trim(),
    description.value.trim(),
    category.value,
    condition.value,
    location.value.trim(),
    stock.value.trim(),
    totalImageCount.value > 0,
  ].filter(Boolean).length,
)

const completionText = computed(() => `${completionCount.value}/8 trường chính đã hoàn thiện`)

const totalImageCount = computed(() => currentImages.value.length + newImages.value.length)

const mediaSummary = computed(() => {
  if (totalImageCount.value === 0) return "Không còn ảnh"
  return totalImageCount.value === 1 ? "1 ảnh đang giữ" : `${totalImageCount.value} ảnh đang giữ`
})

const newImageTiles = computed(() => newImages.value)

const imageButtonLabel = computed(() =>
  newImages.value.length >= 6 ? "Đã đủ 6 ảnh mới" : "Thêm ảnh mới",
)

const heroStats = computed(() => [
  {
    label: "Mức hoàn thiện",
    value: `${completionCount.value}/8`,
    description: "Theo dõi nhanh các trường chính trước khi lưu cập nhật.",
  },
  {
    label: "Ảnh còn lại",
    value: String(currentImages.value.length),
    description: "Ảnh cũ vẫn giữ trên tin sau khi loại bỏ các ảnh không cần.",
  },
  {
    label: "Trạng thái",
    value: activeProduct.value.updatedAt,
    description: "Mốc dữ liệu mock được nạp sẵn cho trang chỉnh sửa này.",
  },
])

const previewBackground = computed(() => categoryMeta[category.value].background)
const previewIcon = computed(() => categoryMeta[category.value].icon)
const previewCategoryLabel = computed(() => categoryMeta[category.value].label)
const previewConditionLabel = computed(() => conditionMap[condition.value])
const previewCurrencyLabel = computed(() => currencyMeta[currency.value].label)
const previewDescription = computed(() =>
  description.value.trim() || "Mô tả cập nhật sẽ hiển thị ở đây để bạn kiểm tra trước khi lưu.",
)

const previewPrice = computed(() => {
  const parsed = Number(price.value)
  if (!Number.isFinite(parsed) || parsed <= 0) return "Chưa thiết lập"

  return new Intl.NumberFormat(currencyMeta[currency.value].locale, {
    style: "currency",
    currency: currency.value,
    maximumFractionDigits: currency.value === "VND" ? 0 : 2,
  }).format(parsed)
})

const stockLabel = computed(() => {
  const parsed = Number(stock.value)
  if (!Number.isFinite(parsed) || parsed <= 0) return "Chưa có số lượng"
  return `${parsed} đơn vị`
})

const checklistItems = computed(() => [
  {
    label: "Pre-fill dữ liệu cũ",
    description: "Tên, giá bán, mô tả và phân loại đã được nạp sẵn theo mã sản phẩm.",
    done: true,
  },
  {
    label: "Cập nhật nội dung chính",
    description: "Điền đủ tên sản phẩm, giá bán và mô tả để card hiển thị chuẩn.",
    done: title.value.trim().length > 0 && Number(price.value) > 0 && description.value.trim().length >= 20,
  },
  {
    label: "Xử lý ảnh cũ",
    description: "Bạn có thể bỏ bớt ảnh hiện tại trước khi lưu thay đổi.",
    done: removedImages.value.length >= 0,
  },
  {
    label: "Sẵn sàng lưu",
    description: "Ít nhất một ảnh còn lại hoặc có ảnh mới và đủ dữ liệu cốt lõi.",
    done: totalImageCount.value > 0 && completionCount.value >= 7,
  },
])

const editingTips = [
  {
    title: "Không đổi quá nhiều cùng lúc",
    description: "Nếu chỉ cập nhật giá hoặc tồn kho, hãy giữ nguyên các trường còn lại để tránh sai lệch tin đăng.",
    icon: "i-ph-pencil-line-fill",
  },
  {
    title: "Loại bỏ ảnh đã lỗi thời",
    description: "Ảnh cũ không còn đúng tình trạng sản phẩm nên được bỏ khỏi tin trước khi cập nhật.",
    icon: "i-ph-trash-fill",
  },
  {
    title: "Kiểm tra lại preview",
    description: "Khung xem trước bên phải giúp bạn chắc rằng nội dung sau khi sửa vẫn đọc tốt trên card marketplace.",
    icon: "i-ph-eye-fill",
  },
] as const

const addNewImage = () => {
  if (newImages.value.length >= 6) return
  newImages.value.push({ name: `new-image-${newImages.value.length + 1}` })
}

const removeCurrentImage = (imageId: string) => {
  currentImages.value = currentImages.value.filter(image => image.id !== imageId)
  if (!removedImages.value.includes(imageId)) {
    removedImages.value.push(imageId)
  }
}

const removeNewImage = (imageName: string) => {
  newImages.value = newImages.value.filter(image => image.name !== imageName)
}

const restoreOriginal = () => {
  applyProduct(activeProduct.value)
}
</script>
