<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
          Lọc đơn hàng
        </p>
        <h2 class="mt-1 text-[1.35rem] font-black tracking-[-0.05em] text-[#243b63]">
          {{ visibleCount }} đơn phù hợp
        </h2>
        <p class="mt-1 text-[14px] leading-6 text-slate-500">
          Bộ lọc hiện tại: {{ activeFilterLabel }}. Tìm nhanh theo mã đơn, shop hoặc tên sản phẩm.
        </p>
      </div>

      <div class="w-full lg:max-w-[320px]">
        <FormsSearchInput
          v-model="searchModel"
          placeholder="Tìm mã đơn, shop hoặc sản phẩm"
        />
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="filter in filters"
        :key="filter.key"
        class="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition"
        :class="activeFilterModel === filter.key
          ? 'border-[#0000ff] bg-[#eef0ff] text-[#0000ff]'
          : 'border-[#dbe3f2] bg-white text-slate-500 hover:border-[#c5caff] hover:text-[#243b63]'"
        type="button"
        @click="activeFilterModel = filter.key"
      >
        <span>{{ filter.label }}</span>
        <span
          class="inline-flex min-w-[24px] justify-center rounded-full px-2 py-0.5 text-[11px] font-black"
          :class="activeFilterModel === filter.key ? 'bg-white text-[#0000ff]' : 'bg-[#f7f9ff] text-slate-500'"
        >
          {{ filter.count }}
        </span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuyerOrderFilter, OrdersFilterOption } from "../../../types/orders"

defineProps<{
  filters: OrdersFilterOption[]
  visibleCount: number
  activeFilterLabel: string
}>()

const searchModel = defineModel<string>("search", { required: true })
const activeFilterModel = defineModel<BuyerOrderFilter>("activeFilter", { required: true })
</script>
