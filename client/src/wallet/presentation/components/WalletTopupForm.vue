<!-- English description: Backend-backed wallet top-up form for redirect and bank-transfer methods. -->
<template>
  <section class="surface-card p-5 sm:p-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-label-secondary">{{ t("pages.walletPage.addFunds") }}</p>
        <h2 class="text-heading text-[var(--text-primary)]">{{ t("pages.walletPage.topupTitle") }}</h2>
      </div>
      <UBadge
        v-if="selectedMethod?.label"
        color="primary"
        variant="subtle"
        class="w-fit rounded-full px-3 py-1 font-semibold"
      >
        {{ selectedMethod.label }}
      </UBadge>
    </div>

    <div v-if="methods.length" class="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
      <UFormField :label="t('pages.walletPage.amountLabel')">
        <UInputNumber
          v-model="draft.amount"
          :min="1"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('pages.walletPage.topupMethod')">
        <USelect
          v-model="draft.method"
          :items="methods"
          label-key="label"
          value-key="value"
          class="w-full"
        />
      </UFormField>
    </div>

    <UAlert
      v-else
      class="mt-5 rounded-2xl"
      color="warning"
      variant="subtle"
      :description="t('pages.walletPage.noTopupMethods')"
    />

    <div v-if="selectedMethod?.type === 'upload'" class="mt-5 space-y-3">
      <UFormField :label="t('pages.walletPage.receipt')">
        <input
          class="block w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-body-primary"
          type="file"
          accept="image/*"
          @change="onReceiptChange"
        >
      </UFormField>
      <p v-if="selectedMethod.note" class="text-caption-secondary">
        {{ selectedMethod.note }}
      </p>
    </div>

    <UButton
      class="mt-6 rounded-full font-semibold"
      color="primary"
      :loading="submitting"
      :disabled="!methods.length || draft.amount <= 0"
      @click="submit"
    >
      {{ t("pages.walletPage.topupSubmit") }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import type {
  WalletTopupDraft,
  WalletTopupMethod,
} from "../../domain/types/wallet.types"

const props = defineProps<{
  methods: WalletTopupMethod[]
  submitting: boolean
}>()

const emit = defineEmits<{
  topup: [payload: WalletTopupDraft]
}>()

const { t } = useI18n()
const receiptFile = ref<File | null>(null)
const draft = reactive<WalletTopupDraft>({
  amount: 0,
  method: "",
})

const selectedMethod = computed(() =>
  props.methods.find(method => method.value === draft.method) ?? null,
)

watch(
  () => props.methods,
  (methods) => {
    if (!draft.method && methods.length) {
      draft.method = methods[0].value
    }

    if (draft.method && !methods.some(method => method.value === draft.method)) {
      draft.method = methods[0]?.value ?? ""
    }
  },
  { immediate: true },
)

function onReceiptChange(event: Event) {
  const input = event.target as HTMLInputElement
  receiptFile.value = input.files?.[0] ?? null
}

function submit() {
  if (!draft.method || draft.amount <= 0) return

  emit("topup", {
    amount: draft.amount,
    method: draft.method,
    receiptFile: selectedMethod.value?.type === "upload" ? receiptFile.value : null,
  })
}
</script>
