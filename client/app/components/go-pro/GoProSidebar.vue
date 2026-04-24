<template>
  <aside class="space-y-4">
    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-label-secondary text-[var(--text-primary)]">
            {{ t("pages.goProPage.currentPlanLabel") }}
          </p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">
            {{ subscription.plan }}
          </h2>
        </div>

        <UButton
          v-if="hasActiveSelection"
          type="button"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full"
          @click="emit('reset')"
        >
          {{ t("pages.goProPage.resetSelection") }}
        </UButton>
      </div>

      <UAlert
        class="mt-4 rounded-[22px]"
        :color="hasActiveSelection ? 'primary' : 'neutral'"
        variant="subtle"
        icon="i-ph-lightning-fill"
        :title="t('pages.goProPage.selectionStatusTitle')"
        :description="statusLabel"
      />

      <div class="mt-4 grid gap-3">
        <div
          v-for="item in stats"
          :key="item.label"
          class="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 py-3"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ item.label }}
          </p>
          <p class="mt-1 text-[1.35rem] font-black text-[var(--text-primary)]">
            {{ item.value }}
          </p>
        </div>
      </div>
    </UCard>

    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
      <p class="text-label-secondary text-[var(--text-primary)]">
        {{ t("pages.goProPage.recentPaymentsLabel") }}
      </p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">
        {{ t("pages.goProPage.mockHistoryTitle") }}
      </h2>

      <div v-if="payments.length > 0" class="mt-4 space-y-2">
        <div
          v-for="item in payments.slice(0, 4)"
          :key="item.id"
          class="rounded-[20px] bg-[var(--bg-surface-hover)] p-3"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-[13px] font-extrabold text-[var(--text-primary)]">
              {{ item.plan }}
            </p>
            <p class="text-[12px] font-black text-[var(--text-primary)]">
              {{ item.amount }}
            </p>
          </div>
          <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">
            {{ item.method }} · {{ item.time }}
          </p>
        </div>
      </div>

      <FoundationEmptyState
        v-else
        compact
        align="start"
        class="mt-4 border-none shadow-none"
        icon="i-ph-receipt-fill"
        :title="t('pages.goProPage.emptyPaymentsTitle')"
        :description="t('pages.goProPage.emptyPaymentsDescription')"
      />
    </UCard>

    <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
      <p class="text-label-secondary text-[var(--text-primary)]">
        {{ t("pages.goProPage.perksEyebrow") }}
      </p>
      <h2 class="mt-1 text-heading text-[var(--text-primary)]">
        {{ selectedPlan?.name ?? t("pages.goProPage.perksTitle") }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        {{ selectedPlan?.description ?? t("pages.goProPage.perksDescription") }}
      </p>

      <div class="mt-4 space-y-2">
        <div
          v-for="item in perkItems"
          :key="item"
          class="flex gap-3 rounded-[18px] bg-[var(--bg-surface-hover)] px-3 py-3"
        >
          <Icon name="i-ph-check-circle-fill" class="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
          <p class="text-[13px] font-semibold leading-5 text-[var(--text-secondary)]">
            {{ item }}
          </p>
        </div>
      </div>
    </UCard>
  </aside>
</template>

<script setup lang="ts">
import type { ProPlan } from "~/composables/useMockGoProData"

const props = withDefaults(defineProps<{
  subscription: { plan: string; status: string; renewsAt: string }
  payments: ReadonlyArray<{ id: number; plan: string; amount: string; method: string; time: string }>
  stats: ReadonlyArray<{ label: string; value: string | number }>
  statusLabel: string
  selectedPlan?: ProPlan | null
  hasActiveSelection?: boolean
}>(), {
  selectedPlan: null,
  hasActiveSelection: false,
})

const emit = defineEmits<{
  reset: []
}>()

const { t } = useI18n()

const perkItems = computed(() =>
  props.selectedPlan?.features.slice(0, 3)
  ?? [
      t("pages.goProPage.perksItem1"),
      t("pages.goProPage.perksItem2"),
      t("pages.goProPage.perksItem3"),
    ],
)
</script>
