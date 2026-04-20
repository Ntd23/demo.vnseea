<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
    <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_360px]">
      <label class="block space-y-3">
        <span class="text-[1.02rem] font-black text-[#2f3542]">{{ $t("pages.productEditor.titleLabel") }}</span>
        <input
          v-model="title"
          type="text"
          class="h-[5.5rem] w-full rounded-[22px] border border-slate-200 bg-white px-5 text-[1.1rem] text-slate-900 outline-none transition focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
        >
      </label>

      <label class="block space-y-3">
        <span class="text-[1.02rem] font-black text-[#2f3542]">{{ $t("pages.productEditor.priceLabel") }}</span>
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
      <span class="text-[1.02rem] font-black text-[#2f3542]">{{ descriptionLabel || $t("pages.productEditor.descriptionLabel") }}</span>
      <textarea
        v-model="description"
        rows="5"
        :placeholder="$t('pages.productEditor.descriptionPlaceholder')"
        class="min-h-[210px] w-full resize-y rounded-[22px] border border-slate-200 bg-white px-5 py-5 text-[1rem] leading-8 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
      />
    </label>

    <div class="mt-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_360px]">
      <label class="block space-y-3">
        <span class="text-[1.02rem] font-black text-[#2f3542]">{{ $t("pages.productEditor.categoryLabel") }}</span>
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
        <span class="text-[1.02rem] font-black text-[#2f3542]">{{ $t("pages.productEditor.conditionLabel") }}</span>
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
        <span class="text-[1.02rem] font-black text-[#2f3542]">{{ $t("pages.productEditor.locationLabel") }}</span>
        <span class="relative block">
          <Icon
            name="i-ph-magnifying-glass-bold"
            class="pointer-events-none absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-500"
          />
          <input
            v-model="location"
            type="text"
            :placeholder="$t('pages.productEditor.locationPlaceholder')"
            class="h-[5.5rem] w-full rounded-[22px] border border-slate-900 bg-white pl-16 pr-5 text-[1.1rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0000ff] focus:ring-4 focus:ring-[#0000ff]/10"
          >
        </span>
      </label>

      <label class="block space-y-3">
        <span class="text-[1.02rem] font-black text-[#2f3542]">{{ $t("pages.productEditor.currencyLabel") }}</span>
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
        <span class="text-[1.02rem] font-black text-[#2f3542]">{{ $t("pages.productEditor.stockLabel") }}</span>
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

    <div class="mt-8">
      <slot name="media" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  CategoryValue,
  ConditionValue,
  CurrencyValue,
  ProductOption,
} from "~/types/product-editor"

withDefaults(defineProps<{
  categoryOptions: ProductOption<CategoryValue>[]
  conditionOptions: ProductOption<ConditionValue>[]
  currencyOptions: ProductOption<CurrencyValue>[]
  mediaSummary: string
  descriptionLabel?: string
}>(), {
  descriptionLabel: undefined,
})

const title = defineModel<string>("title", { required: true })
const price = defineModel<string>("price", { required: true })
const description = defineModel<string>("description", { required: true })
const category = defineModel<CategoryValue>("category", { required: true })
const condition = defineModel<ConditionValue>("condition", { required: true })
const location = defineModel<string>("location", { required: true })
const currency = defineModel<CurrencyValue>("currency", { required: true })
const stock = defineModel<string>("stock", { required: true })
</script>
