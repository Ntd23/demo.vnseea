<template>
  <section class="relative overflow-hidden rounded-[30px] border border-[#dbe3f2] bg-white p-5 shadow-[0_18px_40px_rgba(15,35,110,0.08)] sm:p-6">
    <div class="pointer-events-none absolute bottom-[-88px] left-[-42px] h-[250px] w-[250px] rounded-full border-[18px] border-[#cbeed1]/40" />
    <div class="pointer-events-none absolute bottom-[-126px] left-[112px] h-[220px] w-[220px] rounded-full bg-[#e4f5e7]/75" />

    <div class="relative z-10">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2f9bff] text-white shadow-[0_12px_26px_rgba(47,155,255,0.24)]">
            <Icon name="i-ph-shopping-cart-simple-fill" class="h-7 w-7" />
          </div>

          <div>
            <h2 class="text-[2rem] font-black tracking-[-0.05em] text-[#2f3542]">
              {{ $t("checkout.summary.title") }}
            </h2>
            <p class="text-[15px] text-slate-500">
              {{ itemLabel }}
            </p>
          </div>
        </div>

        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 self-start text-[15px] font-medium text-slate-500 transition hover:text-[#243b63]"
        >
          <Icon name="i-ph-arrow-left" class="h-4 w-4" />
          {{ $t("checkout.summary.backToStore") }}
        </NuxtLink>
      </div>

      <div v-if="items.length" class="mt-8 space-y-7">
        <div class="flex flex-wrap gap-6">
          <article
            v-for="item in items"
            :key="item.id"
            class="w-full max-w-[320px]"
          >
            <div class="relative h-[290px] overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-[#eef1f7] shadow-[0_12px_28px_rgba(15,35,110,0.08)]">
              <div
                class="absolute inset-0"
                :style="{ background: item.imageStyle || defaultCardBackground }"
              />
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.2)_100%)]" />

              <div class="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-[5px]">
                {{ $t("checkout.summary.marketplace") }}
              </div>

              <button
                class="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/58 text-white backdrop-blur-[6px] transition hover:bg-black/70"
                type="button"
                @click="emit('removeItem', item.id)"
              >
                <Icon name="i-ph-x-bold" class="h-5 w-5" />
              </button>

              <div class="absolute bottom-3 right-3 rounded-full bg-[#111827]/85 px-4 py-2 text-[13px] font-black text-white shadow-[0_12px_24px_rgba(17,24,39,0.2)]">
                {{ formatVnd(item.price) }}
              </div>
            </div>

            <div class="mt-4 space-y-3">
              <h3 class="text-[1.1rem] font-black tracking-[-0.03em] text-[#2f3542]">
                {{ item.name }}
              </h3>

              <div class="flex items-center gap-3 text-[1rem] font-black text-[#2f3542]">
                <span>{{ $t("checkout.summary.qty") }}</span>

                <button
                  class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef0f3] text-[#2f3542] transition hover:bg-[#e5e7eb]"
                  type="button"
                  @click="emit('decreaseQuantity', item.id)"
                >
                  <Icon name="i-ph-minus-bold" class="h-4 w-4" />
                </button>

                <span class="min-w-[18px] text-center text-[1.15rem]">
                  {{ item.quantity }}
                </span>

                <button
                  class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef0f3] text-[#2f3542] transition hover:bg-[#e5e7eb]"
                  type="button"
                  @click="emit('increaseQuantity', item.id)"
                >
                  <Icon name="i-ph-plus-bold" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        </div>

        <div class="h-px bg-[#e3e8f3]" />

        <div
          v-if="walletShortage > 0"
          class="rounded-[20px] border border-[#fecaca] bg-[#fff1f1] px-4 py-4 text-[#ef4444]"
        >
          <div class="flex items-start gap-3">
            <Icon name="i-ph-warning-circle-fill" class="mt-0.5 h-5 w-5 shrink-0" />
            <p class="text-[14px] font-semibold leading-6">
              {{ $t("checkout.summary.insufficientBalance") }}
            </p>
          </div>
        </div>

        <section class="relative overflow-hidden rounded-[26px] border border-[#dbe3f2] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf7_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div class="pointer-events-none absolute bottom-[-70px] left-[-40px] h-[180px] w-[180px] rounded-full border-[14px] border-[#bfe8c8]/45" />
          <div class="pointer-events-none absolute bottom-[-82px] left-[85px] h-[145px] w-[145px] rounded-full bg-[#e7f6e9]/85" />

          <div class="relative z-10 space-y-5">
            <div class="grid gap-3 text-[13px] text-slate-500 sm:grid-cols-2">
              <div class="rounded-[18px] bg-white/80 px-4 py-3 shadow-[0_8px_18px_rgba(15,35,110,0.04)]">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("checkout.summary.subtotal") }}
                </p>
                <p class="mt-1 text-[18px] font-black text-[#243b63]">
                  {{ formatVnd(subtotal) }}
                </p>
              </div>

              <div class="rounded-[18px] bg-white/80 px-4 py-3 shadow-[0_8px_18px_rgba(15,35,110,0.04)]">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {{ $t("checkout.summary.shippingFee") }}
                </p>
                <p class="mt-1 text-[18px] font-black text-[#243b63]">
                  {{ shippingFee > 0 ? formatVnd(shippingFee) : $t("checkout.summary.free") }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  {{ $t("checkout.summary.totalPayment") }}
                </p>
                <p class="mt-2 text-[2.8rem] font-black tracking-[-0.06em] text-[#2f3542]">
                  {{ formatVnd(total) }}
                </p>
                <p class="mt-2 max-w-[420px] text-[13px] leading-6 text-slate-500">
                  {{ paymentHint }}
                </p>
              </div>

              <button
                class="inline-flex h-14 items-center justify-center rounded-[18px] px-6 text-[15px] font-extrabold shadow-[0_14px_28px_rgba(143,212,154,0.24)] transition hover:-translate-y-0.5"
                :class="walletShortage > 0
                  ? 'bg-[#fde7b2] text-[#9a5b00] shadow-[0_14px_28px_rgba(245,158,11,0.18)]'
                  : 'bg-[#9ad89f] text-[#1f4d26]'"
                type="button"
              >
                {{ ctaLabel }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div
        v-else
        class="mt-8 rounded-[28px] border border-dashed border-[#dbe3f2] bg-[#f8fbff] px-5 py-12 text-center"
      >
        <div class="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-white text-[#0000ff] shadow-[0_12px_24px_rgba(0,0,255,0.08)]">
          <Icon name="i-ph-shopping-cart-simple" class="h-8 w-8" />
        </div>
        <h3 class="mt-5 text-[1.35rem] font-black tracking-[-0.04em] text-[#243b63]">
          {{ $t("checkout.summary.emptyCart") }}
        </h3>
        <p class="mt-2 text-[14px] leading-7 text-slate-500">
          {{ $t("checkout.summary.emptyCartHint") }}
        </p>
        <NuxtLink
          to="/products"
          class="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,0,255,0.2)] transition hover:-translate-y-0.5"
        >
          {{ $t("checkout.summary.backToMarketplace") }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CheckoutLineItem } from "~/types/checkout"

const props = withDefaults(defineProps<{
  items: CheckoutLineItem[]
  walletBalance: number
  shippingFee?: number
}>(), {
  shippingFee: 0,
})

const emit = defineEmits<{
  increaseQuantity: [itemId: string]
  decreaseQuantity: [itemId: string]
  removeItem: [itemId: string]
}>()

const { t } = useI18n()

const defaultCardBackground = [
  "radial-gradient(circle at 78% 12%, rgba(255,214,182,0.5), transparent 18%)",
  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.26), transparent 22%)",
  "linear-gradient(150deg, #243b63 0%, #f1959b 42%, #f8c184 100%)",
].join(", ")

const subtotal = computed(() =>
  props.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
)

const total = computed(() => subtotal.value + props.shippingFee)

const itemLabel = computed(() => {
  const count = props.items.length
  return t(count === 1 ? "checkout.summary.items" : "checkout.summary.itemsPlural", { count })
})

const walletShortage = computed(() => Math.max(total.value - props.walletBalance, 0))

const ctaLabel = computed(() => {
  if (walletShortage.value > 0) {
    return t("checkout.summary.addFunds")
  }

  return t("checkout.summary.buy")
})

const paymentHint = computed(() => {
  if (walletShortage.value > 0) {
    return t("checkout.summary.walletBalance", {
      balance: formatVnd(props.walletBalance),
      amount: formatVnd(walletShortage.value),
    })
  }

  return t("checkout.summary.walletHint", {
    balance: formatVnd(props.walletBalance),
  })
})

function formatVnd(value: number) {
  return `VND${value.toLocaleString("en-US")}`
}
</script>
