<!-- English description: Renders the orders overview sidebar with summary navigation. -->
<template>
  <div class="space-y-6">
    <section class="surface-card space-y-6 border border-[var(--border-light)] p-6 shadow-[var(--shadow-xl)] sm:p-8">
      <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
        {{ $t("orders.sidebar.overview") }}
      </p>

      <div class="grid gap-4">
        <div
          v-for="card in cards"
          :key="card.label"
          class="group/stat rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg"
          :class="toneClassMap[card.tone]"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                {{ $t(card.label) }}
              </p>
              <p class="text-3xl font-black leading-none tracking-tight">
                {{ card.value }}
              </p>
            </div>

            <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-transform group-hover/stat:scale-110 group-hover/stat:rotate-3">
              <Icon :name="card.icon.includes('duotone') ? card.icon : card.icon.replace('-fill', '-duotone')" class="h-6 w-6" />
            </div>
          </div>

          <p class="mt-4 text-xs font-semibold leading-relaxed opacity-70">
            {{ $t(card.description) }}
          </p>
        </div>
      </div>
    </section>

    <section class="surface-card space-y-6 border border-[var(--border-light)] p-6 shadow-[var(--shadow-xl)] sm:p-8">
      <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
        {{ $t("orders.sidebar.trackRecent") }}
      </p>

      <template v-if="nextOrder">
        <div class="surface-card group/recent space-y-5 border border-[var(--border-light)] bg-[var(--bg-muted)] p-5 transition-colors duration-500 hover:bg-[var(--bg-surface-hover)]">
          <div class="flex flex-wrap items-center gap-3 border-b border-[var(--border-light)] pb-4">
            <p class="text-sm font-black text-[var(--text-primary)]">
              {{ nextOrder.orderNumber }}
            </p>
            <UBadge
              variant="soft"
              class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1 ring-1 ring-inset"
              :class="nextStatusMeta.badgeClass"
            >
              <template #leading>
                <Icon :name="nextStatusMeta.icon.includes('duotone') ? nextStatusMeta.icon : nextStatusMeta.icon.replace('-fill', '-duotone')" class="h-3 w-3 mr-1" />
              </template>
              {{ $t(nextStatusMeta.label) }}
            </UBadge>
          </div>

          <div class="space-y-1">
            <p class="text-sm font-black text-[var(--text-primary)] transition-colors group-hover/recent:text-[var(--text-primary)]">
              {{ nextOrder.seller }}
            </p>
            <p class="text-xs font-medium italic leading-relaxed text-[var(--text-secondary)]">
              {{ $t(nextOrder.deliveryWindow) }}
            </p>
          </div>

          <UButton
            :to="appRoutes.orderDetail(nextOrder.id)"
            size="xl"
            block
            variant="solid"
            color="primary"
            class="h-12 rounded-2xl text-xs font-black uppercase tracking-widest shadow-[var(--shadow-brand)]"
          >
            {{ $t("orders.sidebar.viewStatus") }}
          </UButton>
        </div>
      </template>

      <div v-else class="surface-card border-2 border-dashed border-[var(--border-light)] bg-[var(--bg-muted)] p-8 text-center">
        <p class="text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)]">
          {{ $t("orders.sidebar.noRecent") }}
        </p>
      </div>
    </section>

    <section class="surface-card relative space-y-6 overflow-hidden border border-[var(--border-light)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-xl)] sm:p-8">
      <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Icon name="i-ph-shopping-cart-duotone" class="h-32 w-32 -mr-12 -mt-12" />
      </div>

      <p class="relative z-10 pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
        {{ $t("orders.sidebar.currentFilter") }}
      </p>
      
      <div class="relative z-10 space-y-5">
        <div class="surface-card space-y-2 border border-[var(--border-light)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)]">
          <p class="text-sm font-black text-[var(--text-primary)]">
            {{ $t(activeFilterLabel) }}
          </p>
          <p class="text-[11px] font-medium leading-relaxed text-[var(--text-secondary)]">
            {{ $t("orders.sidebar.filterHint", { count: visibleCount }) }}
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-start gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
            <Icon name="i-ph-info-duotone" class="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-primary)]" />
            <p class="text-[11px] font-medium leading-relaxed text-[var(--text-secondary)]">
              {{ $t("orders.sidebar.flowHintReal") }}
            </p>
          </div>
          <div class="flex items-start gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
            <Icon name="i-ph-lightbulb-duotone" class="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-primary)]" />
            <p class="text-[11px] font-medium leading-relaxed text-[var(--text-secondary)]">
              {{ $t("orders.sidebar.flowHintMarketplace") }}
            </p>
          </div>
        </div>

        <UButton
          :to="appRoutes.products"
          block
          size="xl"
          icon="i-ph-bag-duotone"
          class="mt-2 h-12 rounded-2xl bg-[var(--bg-media)] text-xs font-black uppercase tracking-widest text-[var(--text-media)] shadow-[var(--shadow-xl)] transition-all hover:opacity-90 active:scale-95"
        >
          {{ $t("orders.sidebar.continueShopping") }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { buyerOrderStatusMeta } from "../../domain/types/orders.types"
import type { BuyerOrder, OrdersOverviewCard } from "../../domain/types/orders.types"

const props = defineProps<{
  cards: OrdersOverviewCard[]
  nextOrder: BuyerOrder | null
  activeFilterLabel: string
  visibleCount: number
}>()

const toneClassMap = {
  amber: "border-[color-mix(in_srgb,var(--color-warning)_28%,var(--border-light))] bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--bg-surface))] text-[var(--color-warning)]",
  blue: "border-[var(--border-strong)] bg-[var(--bg-surface-active)] text-[var(--text-brand)]",
  green: "border-[color-mix(in_srgb,var(--color-success)_28%,var(--border-light))] bg-[color-mix(in_srgb,var(--color-success)_10%,var(--bg-surface))] text-[var(--text-success)]",
  rose: "border-[color-mix(in_srgb,var(--color-error)_28%,var(--border-light))] bg-[color-mix(in_srgb,var(--color-error)_10%,var(--bg-surface))] text-[var(--text-danger)]",
} as const

const nextStatusMeta = computed(() =>
  props.nextOrder ? buyerOrderStatusMeta[props.nextOrder.status] : null,
)
</script>
