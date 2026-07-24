<!-- English description: Renders the seller order fulfillment checklist. -->
<template>
  <section class="surface-card group space-y-8 border border-[var(--border-light)] p-6 shadow-[var(--shadow-xl)] transition-all duration-500 sm:p-8">
    <div class="flex flex-col gap-4 border-b border-[var(--border-light)] pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-1">
        <p class="pl-1 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)]">
          {{ $t("orders.detail.operating") }}
        </p>
        <h3 class="text-2xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
          {{ $t("orders.detail.checklist") }}
        </h3>
      </div>

      <UBadge
        variant="soft"
        class="rounded-lg font-black text-[10px] uppercase tracking-widest px-3 py-1.5 ring-1 ring-inset"
        :class="statusMeta.badgeClass"
      >
        <template #leading>
          <Icon :name="statusMeta.icon.includes('duotone') ? statusMeta.icon : statusMeta.icon.replace('-fill', '-duotone')" class="h-3.5 w-3.5 mr-1" />
        </template>
        {{ $t(statusMeta.label) }}
      </UBadge>
    </div>

    <div
      v-if="order.status === 'cancelled'"
      class="surface-card p-5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest leading-relaxed text-center"
    >
      <Icon name="i-ph-warning-duotone" class="h-4 w-4 mr-2" />
      {{ $t("orders.detail.cancelledWarning") }}
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <UButton
        variant="soft"
        color="white"
        class="surface-card block p-6 text-left transition-all duration-300 group/stage active:scale-[0.98] ring-1"
        :class="shippingStageClass"
      >
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
          {{ $t("orders.detail.shippedLabel") }}
        </p>
        <p class="mt-2 text-base font-black tracking-tight">
          {{ $t("orders.detail.shippedTitle") }}
        </p>
        <p class="mt-2 text-[11px] font-medium leading-relaxed opacity-80">
          {{ $t("orders.detail.shippedDesc") }}
        </p>
      </UButton>

      <UButton
        variant="soft"
        color="white"
        class="surface-card block p-6 text-left transition-all duration-300 group/stage active:scale-[0.98] ring-1"
        :class="completedStageClass"
      >
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
          {{ $t("orders.detail.completedLabel") }}
        </p>
        <p class="mt-2 text-base font-black tracking-tight">
          {{ $t("orders.detail.completedTitle") }}
        </p>
        <p class="mt-2 text-[11px] font-medium leading-relaxed opacity-80">
          {{ $t("orders.detail.completedDesc") }}
        </p>
      </UButton>
    </div>

    <div class="space-y-4">
      <div
        v-for="task in order.tasks"
        :key="task.key"
        class="surface-card p-5 ring-1 transition-all duration-300 group/task"
        :class="task.done ? 'border-[var(--border-strong)] bg-[var(--bg-surface-active)]' : 'border-[var(--border-light)] bg-[var(--bg-surface)]'"
      >
        <div class="flex items-start gap-4">
          <div
            class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500"
            :class="task.done ? 'bg-[var(--bg-brand)] text-[var(--text-inverse)] shadow-[var(--shadow-brand)] ring-1 ring-[var(--border-strong)]' : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] ring-1 ring-[var(--border-light)] group-hover/task:bg-[var(--bg-surface-hover)]'"
          >
            <Icon :name="task.done ? 'i-ph-check-bold' : 'i-ph-hourglass-duotone'" class="h-5 w-5" />
          </div>

          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-3">
              <p class="text-sm font-black text-[var(--text-primary)] transition-colors group-hover/task:text-[var(--text-primary)]">
                {{ $t(task.label) }}
              </p>
              <UBadge
                variant="soft"
                class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1 ring-1 ring-inset"
                :class="task.done ? 'bg-[var(--bg-surface-active)] text-[var(--text-brand)] ring-[var(--border-strong)]' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] ring-[var(--border-light)]'"
              >
                {{ $t(task.done ? 'orders.detail.taskStatus.done' : 'orders.detail.taskStatus.pending') }}
              </UBadge>
            </div>
            <p class="text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
              {{ $t(task.description) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useOrderPresentation } from "../../application/composables/useOrderPresentation"
import type { SellerOrder } from "../../domain/types/orders.types"

const props = defineProps<{
  order: SellerOrder
}>()

const { statusMeta } = useOrderPresentation(computed(() => props.order))

const shippingStageClass = computed(() => {
  if (props.order.status === "shipping" || props.order.status === "delivered") {
    return "ring-[var(--border-strong)] bg-[var(--bg-surface-active)] text-[var(--text-primary)]"
  }

  return "ring-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:ring-[var(--border-strong)] hover:text-[var(--text-primary)]"
})

const completedStageClass = computed(() => {
  if (props.order.status === "delivered") {
    return "ring-sky-100 bg-sky-50/50 text-sky-700"
  }

  return "ring-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:ring-[var(--border-strong)] hover:text-[var(--text-primary)]"
})
</script>
