<template>
  <CommunitySettingsSectionCard
    eyebrow="Thông tin công khai"
    title="Hồ sơ fanpage"
    description="Cập nhật tên, URL, mô tả và những tín hiệu nhận diện chính để fanpage nhìn rõ ràng hơn khi khách ghé thăm."
    icon="i-ph-identification-card-bold"
  >
    <template #trailing>
      <NuxtLink
        :to="pagePath"
        class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[12px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
      >
        <Icon name="i-ph-arrow-square-out-bold" class="mr-1.5 h-4 w-4" />
        Xem fanpage
      </NuxtLink>
    </template>

    <div class="space-y-5">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]">
        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">Tên trang</span>
          <input
            v-model="model.name"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            placeholder="Nhập tên fanpage"
            type="text"
          >
        </label>

        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">Page URL</span>
          <div class="relative mt-3">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 text-[13px] font-semibold text-slate-500">
              {{ urlPrefix }}
            </div>
            <input
              v-model="model.slug"
              class="h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white pl-[130px] pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
              placeholder="ten-fanpage"
              type="text"
            >
          </div>

          <div class="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
            <span class="rounded-full bg-[#f8fbff] px-3 py-1.5 font-medium text-[#243b63]">
              Gợi ý: {{ suggestedSlug || "ten-fanpage" }}
            </span>
            <button
              v-if="suggestedSlug && model.slug.trim() !== suggestedSlug"
              class="rounded-full border border-[#dbe3f2] bg-white px-3 py-1.5 font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              type="button"
              @click="model.slug = suggestedSlug"
            >
              Dùng slug gợi ý
            </button>
          </div>
        </label>
      </div>

      <label class="block">
        <span class="text-[15px] font-black text-[#243b63]">Giới thiệu ngắn</span>
        <textarea
          v-model="model.summary"
          class="mt-3 min-h-[160px] w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 py-3 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
          placeholder="Tóm tắt thương hiệu, dịch vụ hoặc loại nội dung mà fanpage này đang chia sẻ."
        />
      </label>

      <div class="grid gap-5 lg:grid-cols-2">
        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">Loại trang</span>
          <div class="relative mt-3">
            <select
              v-model="model.category"
              class="h-14 w-full appearance-none rounded-[18px] border border-[#dbe3f2] bg-white px-4 pr-12 text-[15px] text-slate-900 outline-none transition focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            >
              <option
                v-for="option in communityPageCategoryOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <Icon name="i-ph-caret-down" class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </label>

        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">Khu vực hiển thị</span>
          <input
            v-model="model.locationLabel"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            placeholder="Ví dụ: Đà Nẵng · Giao hàng toàn quốc"
            type="text"
          >
        </label>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">Website hoặc landing page</span>
          <input
            v-model="model.website"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            placeholder="vnseea.vn/p/ten-fanpage"
            type="text"
          >
        </label>

        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">Nhãn thương hiệu</span>
          <input
            v-model="model.ownerLabel"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            placeholder="Ví dụ: Fanpage thương hiệu nội dung"
            type="text"
          >
        </label>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">Cam kết phản hồi</span>
          <input
            v-model="model.responseLabel"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            placeholder="Ví dụ: Phản hồi trong ngày làm việc"
            type="text"
          >
        </label>

        <label class="block">
          <span class="text-[15px] font-black text-[#243b63]">CTA chính</span>
          <input
            v-model="model.ctaLabel"
            class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            placeholder="Ví dụ: Nhắn tin"
            type="text"
          >
        </label>
      </div>

      <label class="block">
        <span class="text-[15px] font-black text-[#243b63]">Chủ đề chính</span>
        <input
          v-model="model.tags"
          class="mt-3 h-14 w-full rounded-[18px] border border-[#dbe3f2] bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
          placeholder="noi-that, thi-cong, go-tu-nhien"
          type="text"
        >
      </label>

      <div class="grid gap-3 sm:grid-cols-4">
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Mô tả</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ model.summary.trim().length }} ký tự</p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Chủ đề</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ tagCount }} thẻ</p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">CTA</p>
          <p class="mt-1 truncate text-[15px] font-black text-[#243b63]">{{ model.ctaLabel.trim() || "Chưa chọn" }}</p>
        </div>
        <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">Link công khai</p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">{{ model.website.trim() ? "Đã có" : "Chưa có" }}</p>
        </div>
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import {
  communityPageCategoryOptions,
  communityPageUrlPrefix,
  createCommunitySlug,
} from "../../../types/community"
import type { CommunityPageSettingsDraft } from "../../../types/community"

const model = defineModel<CommunityPageSettingsDraft>({ required: true })

defineProps<{
  pagePath: string
}>()

const urlPrefix = communityPageUrlPrefix.replace("https://", "")

const suggestedSlug = computed(() =>
  createCommunitySlug(model.value.name),
)

const tagCount = computed(() =>
  model.value.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean)
    .length,
)
</script>
