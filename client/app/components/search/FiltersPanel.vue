<template>
  <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_18px_40px_rgba(15,35,110,0.08)]">
    <div class="relative overflow-hidden px-5 pb-6 pt-6 sm:px-7">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(0,0,255,0.08),transparent_30%)]" />

      <div class="relative">
        <div class="flex flex-col gap-5">
          <div class="max-w-3xl">
            <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/65">
              Search Hub
            </p>
            <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.3rem]">
              Khám phá người, trang, nhóm và bài đăng
            </h1>
            <p class="mt-2 text-[14px] leading-7 text-slate-500">
              Tìm kiếm theo từ khóa, lọc theo loại kết quả và chuyển nhanh giữa những tập dữ liệu đang có sẵn trong mock social graph của VNSEEA.
            </p>
          </div>

          <label class="block space-y-3">
            <span class="text-[13px] font-bold uppercase tracking-[0.14em] text-[#243b63]/65">
              Từ khóa
            </span>

            <div class="relative">
              <Icon
                name="i-ph-magnifying-glass-bold"
                class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8090d8]"
              />

              <input
                v-model="keywordModel"
                class="h-14 w-full rounded-[20px] border border-[#dbe3f2] bg-[#f8faff] pl-12 pr-4 text-[15px] font-medium text-slate-900 outline-none transition placeholder:text-[#90a0d5] focus:border-[#0000ff] focus:bg-white focus:ring-4 focus:ring-[#dfe3ff]"
                placeholder="Tìm kiếm người, trang, nhóm, bài đăng hoặc #hashtags"
                type="search"
                @keydown.enter.prevent="$emit('submit')"
              >
            </div>
          </label>

          <div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-end">
            <div class="grid gap-3 md:grid-cols-2">
              <FormsSelectBox
                v-model="typeModel"
                label="Loại kết quả"
                :options="typeOptions"
              />
              <FormsSelectBox
                v-model="sortModel"
                label="Sắp xếp"
                :options="sortOptions"
              />
            </div>

            <button
              class="inline-flex h-[52px] w-full items-center justify-center self-end rounded-[20px] bg-[linear-gradient(135deg,#6d7dff_0%,#9c79ff_100%)] px-6 text-[15px] font-black text-white shadow-[0_16px_30px_rgba(109,125,255,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(109,125,255,0.34)]"
              type="button"
              @click="$emit('submit')"
            >
              <Icon name="i-ph-magnifying-glass-bold" class="mr-2 h-4.5 w-4.5" />
              Tìm kiếm
            </button>
          </div>

          <div class="space-y-3 border-t border-[#eef2fb] pt-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#243b63]/55">
                Gợi ý nhanh
              </span>

              <button
                v-for="item in quickKeywords"
                :key="item"
                class="inline-flex h-9 items-center rounded-full border border-[#dbe3f2] bg-[#fbfcff] px-3 text-[12px] font-semibold text-[#4b5f82] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
                type="button"
                @click="$emit('quick-search', item)"
              >
                {{ item }}
              </button>
            </div>

            <div class="grid gap-2 lg:grid-cols-5">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                class="flex min-h-[88px] flex-col items-start rounded-[22px] border px-4 py-4 text-left transition"
                :class="typeModel === tab.value
                  ? 'border-[#0000ff]/25 bg-[linear-gradient(180deg,rgba(238,243,255,0.95)_0%,rgba(255,255,255,0.98)_100%)] shadow-[0_12px_28px_rgba(0,0,255,0.08)]'
                  : 'border-[#edf2fb] bg-[#fcfdff] hover:border-[#d8e4ff] hover:bg-white'"
                type="button"
                @click="typeModel = tab.value"
              >
                <div class="flex w-full items-center justify-between gap-3">
                  <div
                    class="flex h-11 w-11 items-center justify-center rounded-[16px]"
                    :class="typeModel === tab.value ? 'bg-[#0000ff] text-white' : 'bg-[#eef3ff] text-[#0000ff]'"
                  >
                    <Icon :name="tab.icon" class="h-5 w-5" />
                  </div>
                  <span class="text-[1.05rem] font-black tracking-[-0.04em] text-[#243b63]">
                    {{ tab.count }}
                  </span>
                </div>

                <p class="mt-3 text-[14px] font-black tracking-[-0.02em] text-[#243b63]">
                  {{ tab.label }}
                </p>
                <p class="mt-1 text-[12px] leading-5 text-slate-500">
                  {{ tab.description }}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  SearchOption,
  SearchResultType,
  SearchSortKey,
  SearchTabItem,
} from "~/composables/useMockSearchData"

type SearchPanelTab = SearchTabItem & {
  count: number
}

defineEmits<{
  submit: []
  "quick-search": [keyword: string]
}>()

defineProps<{
  typeOptions: SearchOption<SearchResultType>[]
  sortOptions: SearchOption<SearchSortKey>[]
  tabs: SearchPanelTab[]
  quickKeywords: string[]
}>()

const keywordModel = defineModel<string>("keyword", { default: "" })
const typeModel = defineModel<SearchResultType>("type", { default: "all" })
const sortModel = defineModel<SearchSortKey>("sort", { default: "relevance" })
</script>
