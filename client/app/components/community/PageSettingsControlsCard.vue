<template>
  <CommunitySettingsSectionCard
    eyebrow="Tương tác & hiển thị"
    title="CTA và các tín hiệu công khai"
    description="Tinh chỉnh hành động chính và quyết định phần thông tin nào sẽ được đẩy ra giao diện fanpage."
    icon="i-ph-cursor-click-bold"
  >
    <template #trailing>
      <div class="inline-flex items-center rounded-full bg-[#f8fbff] px-4 py-2 text-[12px] font-semibold text-[#243b63]">
        {{ selectedCtaLabel }}
      </div>
    </template>

    <div class="space-y-5">
      <div>
        <p class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0000ff]/65">
          Preset CTA
        </p>

        <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="option in communityPageCtaOptions"
            :key="option.value"
            class="rounded-[22px] border px-4 py-4 text-left transition"
            :class="selectedCtaLabel === option.label
              ? 'border-[#0000ff]/22 bg-[#eef0ff] shadow-[0_12px_24px_rgba(0,0,255,0.08)]'
              : 'border-[#dbe3f2] bg-white hover:border-[#c5caff] hover:bg-[#f8fbff]'"
            type="button"
            @click="model.ctaLabel = option.label"
          >
            <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.05)]">
              <Icon :name="option.icon || 'i-ph-circle-fill'" class="h-5 w-5" />
            </div>
            <p class="mt-4 text-[14px] font-black text-[#243b63]">
              {{ option.label }}
            </p>
            <p class="mt-2 text-[12px] leading-5 text-slate-500">
              {{ option.description }}
            </p>
          </button>
        </div>
      </div>

      <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-4">
        <p class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0000ff]/65">
          Logic đang áp dụng
        </p>
        <p class="mt-2 text-[14px] leading-6 text-slate-500">
          CTA hiện tại là <span class="font-bold text-[#243b63]">{{ selectedCtaLabel.toLowerCase() }}</span>.
          Bạn có thể kết hợp với hiển thị website, nút nhắn tin và chỉ số tương tác để page nhìn rõ mục tiêu hơn.
        </p>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <FormsToggleSwitch
          v-model="model.allowMessages"
          label="Bật nút nhắn tin"
          description="Cho phép khách chuyển nhanh sang inbox từ banner và action card."
        />
        <FormsToggleSwitch
          v-model="model.showFollowerCount"
          label="Hiển thị số người theo dõi"
          description="Giữ follower count trên phần giới thiệu và preview page."
        />
        <FormsToggleSwitch
          v-model="model.showLikeCount"
          label="Hiển thị số lượt thích"
          description="Giữ like count như một tín hiệu xã hội ở sidebar và khu vực about."
        />
        <FormsToggleSwitch
          v-model="model.showWebsite"
          label="Hiển thị website công khai"
          description="Ẩn hoặc hiện link landing page/website trong phần thông tin fanpage."
        />
        <FormsToggleSwitch
          v-model="model.recommendRelatedPages"
          label="Gợi ý fanpage liên quan"
          description="Cho phép hệ thống chèn các đề xuất tương tự ở vùng khám phá sau này."
        />
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import { communityPageCtaOptions } from "../../../types/community"
import type { CommunityPageSettingsDraft } from "../../../types/community"

const model = defineModel<CommunityPageSettingsDraft>({ required: true })

const selectedCtaLabel = computed(() =>
  model.value.ctaLabel.trim() || "Chưa chọn CTA",
)
</script>
