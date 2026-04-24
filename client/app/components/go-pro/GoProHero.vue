<template>
  <UCard
    class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-[linear-gradient(135deg,#0f172a_0%,#0369a1_40%,#2563eb_100%)] text-white shadow-[var(--shadow-xl)]"
    :ui="{ body: 'relative p-5 sm:p-7 lg:p-8' }"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.18),transparent_30%)]" />
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />

    <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div class="max-w-[760px]">
        <UBadge color="neutral" variant="soft" class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
          {{ t("pages.goProPage.heroEyebrow") }}
        </UBadge>

        <h1 class="mt-4 text-display text-[2.25rem] leading-[0.95] text-white sm:text-[3rem]">
          {{ t("pages.goProPage.heroTitle") }}
        </h1>
        <p class="mt-4 max-w-[640px] text-[15px] leading-7 text-white/88 sm:text-[17px]">
          {{ t("pages.goProPage.heroDescription") }}
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          <UBadge color="neutral" variant="soft" class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white">
            {{ billingLabel }}
          </UBadge>

          <UBadge
            v-if="selectedPlanName"
            color="neutral"
            variant="soft"
            class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            {{ t("pages.goProPage.selectedPlanBadge", { plan: selectedPlanName }) }}
          </UBadge>
        </div>

        <div class="mt-7 flex flex-wrap gap-3">
          <UButton
            type="button"
            color="neutral"
            variant="solid"
            size="xl"
            class="rounded-full bg-white text-[var(--text-primary)]"
            @click="emit('selectFeatured')"
          >
            <Icon name="i-ph-crown-simple-fill" class="mr-2 h-4 w-4" />
            {{ t("pages.goProPage.heroPrimaryCta") }}
          </UButton>

          <UButton
            v-if="hasActiveSelection"
            type="button"
            color="neutral"
            variant="outline"
            size="xl"
            class="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
            @click="emit('reset')"
          >
            {{ t("pages.goProPage.resetSelection") }}
          </UButton>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-3 xl:w-[460px] xl:grid-cols-1">
        <UCard
          v-for="item in stats"
          :key="item.label"
          class="rounded-[24px] border border-white/15 bg-white/10 backdrop-blur-[6px]"
          :ui="{ body: 'p-4' }"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-white/62">
            {{ item.label }}
          </p>
          <p class="mt-2 text-[1.6rem] font-black leading-none text-white">
            {{ item.value }}
          </p>
          <p class="mt-1 text-[13px] leading-5 text-white/74">
            {{ item.description }}
          </p>
        </UCard>
      </div>
    </div>

    <div class="relative z-10 mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <UCard
        class="rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-[6px]"
        :ui="{ body: 'p-5' }"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-label-secondary text-white/72">
              {{ t("pages.goProPage.currentPlanLabel") }}
            </p>
            <h2 class="mt-1 text-2xl font-black text-white">
              {{ subscription.plan }}
            </h2>
            <p class="mt-1 text-[13px] font-semibold text-white/78">
              {{ subscription.status }}
            </p>
          </div>

          <div class="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/12 text-white">
            <Icon name="i-ph-crown-simple-fill" class="h-7 w-7" />
          </div>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="rounded-[20px] border border-white/10 bg-white/10 p-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
              {{ t("pages.goProPage.renewsAtLabel") }}
            </p>
            <p class="mt-1 text-[14px] font-black text-white">
              {{ subscription.renewsAt }}
            </p>
          </div>

          <div class="rounded-[20px] border border-white/10 bg-white/10 p-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
              {{ t("pages.goProPage.paymentsLabel") }}
            </p>
            <p class="mt-1 text-[14px] font-black text-white">
              {{ t("pages.goProPage.transactionCount", { count: payments.length }) }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard
        class="rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-[6px]"
        :ui="{ body: 'p-5' }"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-label-secondary text-white/72">
              {{ t("pages.goProPage.recentLabel") }}
            </p>
            <h3 class="mt-1 text-[18px] font-black text-white">
              {{ t("pages.goProPage.mockHistoryTitle") }}
            </h3>
          </div>
          <Icon name="i-ph-receipt-fill" class="h-6 w-6 text-white" />
        </div>

        <div v-if="payments.length > 0" class="mt-4 space-y-2">
          <div
            v-for="item in payments.slice(0, 2)"
            :key="item.id"
            class="rounded-[18px] border border-white/10 bg-white/10 p-3"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-[13px] font-extrabold text-white">
                {{ item.plan }}
              </p>
              <p class="text-[12px] font-black text-white">
                {{ item.amount }}
              </p>
            </div>
            <p class="mt-1 text-[12px] font-semibold text-white/72">
              {{ item.method }} · {{ item.time }}
            </p>
          </div>
        </div>

        <p
          v-else
          class="mt-4 rounded-[18px] border border-white/10 bg-white/10 p-3 text-[13px] font-semibold text-white/78"
        >
          {{ t("pages.goProPage.emptyPayments") }}
        </p>
      </UCard>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  stats: ReadonlyArray<{ label: string; value: string | number; description: string }>
  subscription: { plan: string; status: string; renewsAt: string }
  payments: ReadonlyArray<{ id: number; plan: string; amount: string; method: string; time: string }>
  billingLabel: string
  selectedPlanName?: string
  hasActiveSelection?: boolean
}>()

const emit = defineEmits<{
  selectFeatured: []
  reset: []
}>()

const { t } = useI18n()
</script>
