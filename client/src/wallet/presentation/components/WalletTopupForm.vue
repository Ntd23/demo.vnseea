<template>
  <section class="surface-card p-6">
    <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">{{ t("pages.walletPage.topupEyebrow") }}</p>
    <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.topupTitle") }}</h2>
    <p class="mt-3 text-body-secondary">{{ t("pages.walletPage.topupDescription") }}</p>

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <UButton
        v-for="amount in presetAmounts"
        :key="amount"
        color="neutral"
        variant="soft"
        class="justify-between rounded-2xl px-4 py-4"
        :class="form.amount === amount ? 'ring-2 ring-primary-500 bg-primary-50 text-primary-700' : ''"
        @click="form.amount = amount"
      >
        <span class="font-bold">{{ formatWalletCurrency(amount, locale.value) }}</span>
        <Icon name="i-ph-plus-circle-bold" class="h-4 w-4" />
      </UButton>
    </div>

    <div class="mt-6 space-y-5">
      <UFormField :label="t('pages.walletPage.otherAmountLabel')">
        <UInputNumber v-model="form.amount" :min="0" :step="50000" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.walletPage.topupSubmit')">
        <USelect
          v-model="form.method"
          :items="methods"
          label-key="label"
          value-key="value"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="mt-6 flex flex-wrap gap-3">
      <UBadge
        v-for="method in methods"
        :key="method.value"
        color="neutral"
        variant="subtle"
        class="rounded-full px-3 py-1.5 font-semibold"
      >
        {{ method.label }}
      </UBadge>
    </div>

    <UButton
      class="mt-6 h-12 rounded-2xl font-black uppercase tracking-widest"
      block
      @click="submit"
    >
      {{ t("pages.walletPage.topupSubmit") }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import type { WalletTopupPayload } from "../../application/composables/useMockWalletData"
import { formatWalletCurrency } from "../../application/composables/useMockWalletData"

const { t, locale } = useI18n()

const props = defineProps<{
  methods: ReadonlyArray<{ label: string; value: WalletTopupPayload["method"]; icon: string }>
}>()

const emit = defineEmits<{ topup: [payload: WalletTopupPayload] }>()

const presetAmounts = [100000, 300000, 500000, 1000000]
const form = reactive<WalletTopupPayload>({
  amount: 300000,
  method: "bank",
})

watch(
  () => props.methods,
  methods => {
    if (methods.length && !methods.some(item => item.value === form.method)) {
      form.method = methods[0].value
    }
  },
  { immediate: true },
)

const submit = () => {
  if (form.amount <= 0) return
  emit("topup", { ...form })
}
</script>
