<template>
  <section class="rounded-[30px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="max-w-[760px]">
        <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
          Thiết lập cơ bản
        </p>
        <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[1.75rem]">
          Điền thông tin {{ entityLabel }}
        </h2>
        <p class="mt-2 text-[14px] leading-7 text-slate-500">
          Hoàn thiện tên, URL, mô tả và phân loại để {{ entityLabel }} mới của bạn sẵn sàng xuất hiện trên VNSEEA.
        </p>
      </div>

      <div class="inline-flex items-center gap-2 rounded-full bg-[#f6f8ff] px-4 py-2 text-[12px] font-semibold text-slate-600">
        <Icon name="i-ph-check-circle-fill" class="h-4 w-4 text-[#0000ff]" />
        {{ completionCount }}/{{ completionTotal }} mục chính đã sẵn sàng
      </div>
    </div>

    <div class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div class="space-y-6">
        <section class="rounded-[26px] border border-[#e8edf7] bg-[#fbfcff] p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
                Định danh nhóm
              </p>
              <p class="mt-1 text-[15px] font-black text-[#243b63]">
                Tên ngắn gọn và URL dễ nhớ
              </p>
            </div>

            <div class="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-500 shadow-[0_8px_18px_rgba(15,35,110,0.04)]">
              Hiển thị đẹp trên tìm kiếm và chia sẻ
            </div>
          </div>

          <div class="mt-5 space-y-6">
            <label class="block">
              <span class="text-[1.02rem] font-black text-[#3a3a3a] sm:text-[1.16rem]">
                {{ nameLabel }}
              </span>
              <input
                v-model="model.name"
                :placeholder="namePlaceholder"
                class="mt-3 h-[76px] w-full rounded-[24px] border border-[#d1d5db] bg-white px-5 text-[1.05rem] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
                type="text"
              >
              <div class="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                <span class="rounded-full bg-white px-3 py-1.5 shadow-[0_6px_14px_rgba(15,35,110,0.04)]">
                  Dễ nhớ, ngắn và đúng chủ đề
                </span>
                <span
                  v-if="isNameReady"
                  class="rounded-full bg-[#effaf3] px-3 py-1.5 font-semibold text-[#1f7a38]"
                >
                  Tên đã đủ rõ
                </span>
              </div>
            </label>

            <label class="block">
              <span class="text-[1.02rem] font-black text-[#3a3a3a] sm:text-[1.16rem]">
                {{ urlLabel }}
              </span>
              <div class="relative mt-3">
                <div class="absolute inset-y-0 left-0 flex items-center pl-5 text-[1rem] font-medium text-slate-500">
                  {{ urlPrefix }}
                </div>
                <input
                  v-model="model.slug"
                  :placeholder="slugPlaceholder"
                  class="h-[76px] w-full rounded-[24px] border border-[#d1d5db] bg-white pl-[182px] pr-5 text-[1.05rem] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8 sm:pl-[194px]"
                  type="text"
                >
              </div>

              <div class="mt-3 flex flex-col gap-2 rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(15,35,110,0.04)] sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="text-[12px] font-semibold text-slate-500">
                    Gợi ý URL
                  </p>
                  <p class="mt-1 break-all text-[13px] font-medium text-[#243b63]">
                    {{ urlPrefix }}{{ suggestedSlug || "ten-nhom-cua-ban" }}
                  </p>
                </div>

                <button
                  v-if="suggestedSlug && model.slug.trim() !== suggestedSlug"
                  class="inline-flex h-10 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f7f9ff] px-4 text-[12px] font-bold text-[#243b63] transition hover:border-[#c5caff] hover:text-[#0000ff]"
                  type="button"
                  @click="applySuggestedSlug"
                >
                  Dùng gợi ý
                </button>
              </div>
            </label>
          </div>
        </section>

        <section class="rounded-[26px] border border-[#e8edf7] bg-[#fbfcff] p-5">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
            Giới thiệu nhóm
          </p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">
            Mô tả rõ mục tiêu và đối tượng thành viên
          </p>

          <label class="mt-5 block">
            <span class="text-[1.02rem] font-black text-[#3a3a3a] sm:text-[1.16rem]">
              {{ descriptionLabel }}
            </span>
            <textarea
              v-model="model.description"
              :placeholder="descriptionPlaceholder"
              class="mt-3 min-h-[210px] w-full rounded-[24px] border border-[#d1d5db] bg-white px-5 py-4 text-[1.02rem] leading-7 text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
            ></textarea>
          </label>

          <div class="mt-3 flex flex-col gap-2 rounded-[18px] bg-white px-4 py-3 text-[12px] text-slate-500 shadow-[0_8px_18px_rgba(15,35,110,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Gợi ý: nói rõ nhóm dành cho ai, nội dung chính là gì và quy tắc tham gia cơ bản.
            </p>
            <span class="font-semibold text-[#243b63]">
              {{ descriptionLength }} ký tự
            </span>
          </div>
        </section>

        <section class="rounded-[26px] border border-[#e8edf7] bg-[#fbfcff] p-5">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
            Cấu hình hiển thị
          </p>
          <p class="mt-1 text-[15px] font-black text-[#243b63]">
            Chọn phạm vi tiếp cận và nhóm nội dung phù hợp
          </p>

          <div
            v-if="showPrivacy"
            class="mt-5 grid gap-3 sm:grid-cols-3"
          >
            <button
              v-for="option in privacyOptions"
              :key="option.value"
              class="rounded-[22px] border px-4 py-4 text-left transition"
              :class="model.privacy === option.value
                ? 'border-[#0000ff]/25 bg-[#eef0ff] shadow-[0_12px_24px_rgba(0,0,255,0.08)]'
                : 'border-[#dbe3f2] bg-white hover:border-[#c5caff] hover:bg-[#f8fbff]'"
              type="button"
              @click="selectPrivacy(option.value)"
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

          <label class="mt-5 block">
            <span class="text-[1.02rem] font-black text-[#3a3a3a] sm:text-[1.16rem]">
              {{ categoryLabel }}
            </span>
            <div class="relative mt-3">
              <select
                v-model="model.category"
                class="h-[76px] w-full appearance-none rounded-[24px] border border-[#d1d5db] bg-white px-5 pr-14 text-[1rem] font-medium text-slate-700 outline-none transition focus:border-[#0000ff]/35 focus:ring-4 focus:ring-[#0000ff]/8"
              >
                <option
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <Icon name="i-ph-caret-down" class="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            </div>
          </label>

          <div class="mt-3 rounded-[18px] bg-white px-4 py-3 text-[13px] leading-6 text-slate-500 shadow-[0_8px_18px_rgba(15,35,110,0.04)]">
            {{ selectedCategoryDescription }}
          </div>
        </section>

        <section class="rounded-[24px] border border-[#dbe3f2] bg-white px-4 py-4 sm:px-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
                Hành động
              </p>
              <p class="mt-1 text-[14px] leading-6 text-slate-500">
                Khi hoàn tất, bạn vẫn có thể quay lại chỉnh ảnh cover, mô tả và quyền quản trị.
              </p>
            </div>

            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <NuxtLink
                :to="backTo"
                class="inline-flex h-14 min-w-[180px] items-center justify-center rounded-full border border-transparent bg-transparent px-5 text-[1rem] font-semibold text-slate-500 transition hover:text-[#243b63]"
              >
                <Icon name="i-ph-arrow-left" class="mr-2 h-5 w-5" />
                {{ backLabel }}
              </NuxtLink>

              <NuxtLink
                v-if="submitTo"
                :to="submitTo"
                class="inline-flex h-14 min-w-[210px] items-center justify-center rounded-[18px] bg-[#0000ff] px-6 text-[1.02rem] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e6]"
              >
                {{ submitLabel }}
              </NuxtLink>

              <button
                v-else
                class="inline-flex h-14 min-w-[210px] items-center justify-center rounded-[18px] bg-[#0000ff] px-6 text-[1.02rem] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e6]"
                type="button"
              >
                {{ submitLabel }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <CommunityCreationInsightsPanel
        :entity-label="entityLabel"
        :completion-count="completionCount"
        :completion-total="completionTotal"
        :preview-title="previewTitle"
        :preview-url="previewUrl"
        :preview-description="previewDescription"
        :privacy-label="selectedPrivacyLabel"
        :privacy-description="selectedPrivacyDescription"
        :category-label="selectedCategoryLabel"
        :show-privacy="showPrivacy"
        :name-ready="isNameReady"
        :url-ready="isUrlReady"
        :description-ready="isDescriptionReady"
        :privacy-ready="isPrivacyReady"
        :category-ready="isCategoryReady"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  createCommunitySlug,
  communityUrlPrefix,
  getCommunityCompletionCount,
  getCommunityCompletionTotal,
} from "../../../types/community"
import type {
  CommunityDraft,
  CommunityOption,
} from "../../../types/community"

const model = defineModel<CommunityDraft>({ required: true })

const props = withDefaults(defineProps<{
  entityLabel: string
  categoryOptions: CommunityOption[]
  privacyOptions?: CommunityOption[]
  showPrivacy?: boolean
  submitLabel?: string
  submitTo?: string
  backLabel?: string
  backTo?: string
  nameLabel?: string
  namePlaceholder?: string
  urlLabel?: string
  slugPlaceholder?: string
  descriptionLabel?: string
  descriptionPlaceholder?: string
  categoryLabel?: string
  privacyLabel?: string
  urlPrefix?: string
}>(), {
  privacyOptions: () => [],
  showPrivacy: true,
  submitLabel: "Tạo ra",
  backLabel: "Quay lại",
  backTo: "/home",
  nameLabel: "Tên",
  namePlaceholder: "",
  urlLabel: "URL",
  slugPlaceholder: "",
  descriptionLabel: "Mô tả",
  descriptionPlaceholder: "",
  categoryLabel: "Loại",
  privacyLabel: "Loại hiển thị",
  urlPrefix: communityUrlPrefix,
})

const completionCount = computed(() =>
  getCommunityCompletionCount(model.value, { includePrivacy: props.showPrivacy }),
)

const completionTotal = computed(() =>
  getCommunityCompletionTotal(props.showPrivacy),
)

const descriptionLength = computed(() => model.value.description.trim().length)
const suggestedSlug = computed(() => createCommunitySlug(model.value.name))

const selectedPrivacyLabel = computed(() =>
  props.privacyOptions.find(option => option.value === model.value.privacy)?.label ?? "Chưa chọn hiển thị",
)

const selectedPrivacyDescription = computed(() =>
  props.privacyOptions.find(option => option.value === model.value.privacy)?.description
    ?? "Thiết lập này quyết định ai sẽ tìm thấy và xem được nội dung trong nhóm.",
)

const selectedCategoryLabel = computed(() =>
  props.categoryOptions.find(option => option.value === model.value.category)?.label ?? "Chưa chọn loại",
)

const selectedCategoryDescription = computed(() =>
  props.categoryOptions.find(option => option.value === model.value.category)?.description
    ?? "Hãy chọn một category gần nhất với chủ đề chính của nhóm.",
)

const previewTitle = computed(() =>
  model.value.name.trim() || `Tên ${props.entityLabel} sẽ hiển thị ở đây`,
)

const effectiveSlug = computed(() =>
  model.value.slug.trim() || suggestedSlug.value || "duong-dan-cua-ban",
)

const previewUrl = computed(() =>
  `${props.urlPrefix}${effectiveSlug.value}`,
)

const previewDescription = computed(() =>
  model.value.description.trim()
    || `${props.entityLabel.charAt(0).toUpperCase()}${props.entityLabel.slice(1)} mới của bạn sẽ có phần mô tả ngắn để người khác hiểu rõ mục tiêu, chủ đề và cách tham gia.`,
)

const isNameReady = computed(() => model.value.name.trim().length >= 3)
const isUrlReady = computed(() => model.value.slug.trim().length >= 3)
const isDescriptionReady = computed(() => descriptionLength.value >= 24)
const isPrivacyReady = computed(() => !props.showPrivacy || Boolean(model.value.privacy))
const isCategoryReady = computed(() => Boolean(model.value.category))

function applySuggestedSlug() {
  if (suggestedSlug.value) {
    model.value.slug = suggestedSlug.value
  }
}

function selectPrivacy(value: string) {
  model.value.privacy = value as CommunityDraft["privacy"]
}
</script>
