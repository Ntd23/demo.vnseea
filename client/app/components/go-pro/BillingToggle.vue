<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-label-secondary text-[var(--text-tertiary)]">Billing</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">Chu kỳ thanh toán</h2>
        <p class="mt-1 text-body-secondary">Chọn monthly hoặc yearly để xem giá tương ứng.</p>
      </div>
      <div class="inline-grid w-full grid-cols-2 rounded-[var(--radius-full)] bg-[var(--bg-surface-hover)] p-1 sm:w-auto">
        <button
          class="h-11 rounded-[var(--radius-full)] px-5 text-[13px] font-extrabold transition"
          :class="modelValue === 'monthly' ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'text-[var(--text-secondary)]'"
          type="button"
          @click="$emit('update:modelValue', 'monthly')"
        >
          Monthly
        </button>
        <button
          class="h-11 rounded-[var(--radius-full)] px-5 text-[13px] font-extrabold transition"
          :class="modelValue === 'yearly' ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'text-[var(--text-secondary)]'"
          type="button"
          @click="$emit('update:modelValue', 'yearly')"
        >
          Yearly - tiết kiệm
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BillingCycle } from "~/composables/useMockGoProData"

defineProps<{ modelValue: BillingCycle }>()
defineEmits<{ "update:modelValue": [value: BillingCycle] }>()
</script>
