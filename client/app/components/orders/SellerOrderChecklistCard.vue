<template>
  <section class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:p-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0000ff]/70">
          {{ $t("orders.detail.operating") }}
        </p>
        <h3 class="mt-1 text-[1.2rem] font-black tracking-[-0.04em] text-[#243b63]">
          {{ $t("orders.detail.checklist") }}
        </h3>
      </div>

      <div
        :class="statusMeta.panelClass"
      >
        {{ $t(statusMeta.label) }}
      </div>
    </div>

    <div
      v-if="order.status === 'cancelled'"
      class="mt-5 rounded-[20px] border border-[#fecdd3] bg-[#fff1f3] px-4 py-3 text-[13px] leading-6 text-[#be123c]"
    >
      {{ $t("orders.detail.cancelledWarning") }}
    </div>

    <div v-else class="mt-5 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        class="rounded-[20px] border px-4 py-4 text-left transition"
        :class="shippingStageClass"
      >
        <p class="text-[11px] font-bold uppercase tracking-[0.18em]">
          {{ $t("orders.detail.shippedLabel") }}
        </p>
        <p class="mt-2 text-[15px] font-black">
          {{ $t("orders.detail.shippedTitle") }}
        </p>
        <p class="mt-2 text-[13px] leading-6 opacity-80">
          {{ $t("orders.detail.shippedDesc") }}
        </p>
      </button>

      <button
        type="button"
        class="rounded-[20px] border px-4 py-4 text-left transition"
        :class="completedStageClass"
      >
        <p class="text-[11px] font-bold uppercase tracking-[0.18em]">
          {{ $t("orders.detail.completedLabel") }}
        </p>
        <p class="mt-2 text-[15px] font-black">
          {{ $t("orders.detail.completedTitle") }}
        </p>
        <p class="mt-2 text-[13px] leading-6 opacity-80">
          {{ $t("orders.detail.completedDesc") }}
        </p>
      </button>
    </div>

    <div class="mt-5 space-y-3">
      <div
        v-for="task in order.tasks"
        :key="task.key"
        class="rounded-[22px] border p-4"
        :class="task.done ? 'border-[#d7e3ff] bg-[#f8fbff]' : 'border-[#eef2f8] bg-[#fbfcff]'"
      >
        <div class="flex items-start gap-3">
          <div
            class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            :class="task.done ? 'bg-[#0000ff] text-white' : 'bg-[#eef2f8] text-slate-400'"
          >
            <Icon :name="task.done ? 'i-ph-check-bold' : 'i-ph-hourglass-medium-bold'" class="h-4.5 w-4.5" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-[14px] font-black text-[#243b63]">
                {{ $t(task.label) }}
              </p>
              <span
                class="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                :class="task.done ? 'bg-[#dbe7ff] text-[#1d4ed8]' : 'bg-[#eef2f8] text-slate-500'"
              >
                {{ $t(task.done ? 'orders.detail.taskStatus.done' : 'orders.detail.taskStatus.pending') }}
              </span>
            </div>
            <p class="mt-2 text-[13px] leading-6 text-slate-500">
              {{ $t(task.description) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useOrderPresentation } from "../../composables/useOrderPresentation"
import type { SellerOrder } from "../../../types/orders"

const props = defineProps<{
  order: SellerOrder
}>()

const { statusMeta } = useOrderPresentation(computed(() => props.order))

const shippingStageClass = computed(() => {
  if (props.order.status === "shipping" || props.order.status === "delivered") {
    return "border-[#cfe0ff] bg-[#eef4ff] text-[#1d4ed8]"
  }

  return "border-[#eef2f8] bg-white text-slate-500 hover:border-[#cfdaf0] hover:text-[#243b63]"
})

const completedStageClass = computed(() => {
  if (props.order.status === "delivered") {
    return "border-[#c7ebd0] bg-[#effaf3] text-[#1f7a38]"
  }

  return "border-[#eef2f8] bg-white text-slate-500 hover:border-[#cfdaf0] hover:text-[#243b63]"
})
</script>
