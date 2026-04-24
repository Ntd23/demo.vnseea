<template>
  <section class="surface-card p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-label-primary text-secondary-500 uppercase tracking-widest">{{ t("pages.withdrawalPage.requestEyebrow") }}</p>
        <h2 class="mt-1 text-heading text-secondary-900">{{ t("pages.withdrawalPage.requestTitle") }}</h2>
        <p class="mt-2 text-body-secondary">
          {{ t("pages.withdrawalPage.requestDescription", { amount: formatWithdrawalCurrency(minimumAmount, locale) }) }}
        </p>
      </div>

      <UBadge
        :label="t('pages.withdrawalPage.availableBadge', { amount: formatWithdrawalCurrency(availableBalance, locale) })"
        size="lg"
        variant="subtle"
        color="primary"
        class="rounded-full px-4 font-bold"
      />
    </div>

    <!-- Method Selection Tiles -->
    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <button
        v-for="method in methods"
        :key="method.value"
        :class="form.method === method.value
          ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
          : 'border-secondary-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'"
        class="group relative flex flex-col items-start rounded-2xl border p-5 transition-all duration-200 text-left outline-none"
        type="button"
        @click="form.method = method.value"
      >
        <div 
          :class="form.method === method.value ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-500 group-hover:bg-primary-100 group-hover:text-secondary-900'"
          class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
        >
          <Icon :name="messageText(method.icon)" class="h-6 w-6" />
        </div>
        <p class="mt-4 text-[14px] font-black text-secondary-900">{{ messageText(method.label) }}</p>
        <p class="mt-1 text-[12px] font-medium text-secondary-500 leading-normal">{{ messageText(method.description) }}</p>
        
        <!-- Selection Checkmark -->
        <div 
          v-if="form.method === method.value"
          class="absolute top-4 right-4"
        >
          <div class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
            <Icon name="i-ph-check-bold" class="h-3 w-3" />
          </div>
        </div>
      </button>
    </div>

    <UForm
      :state="form"
      :validate="validate"
      class="mt-8 space-y-6"
      @submit="onSubmit"
    >
      <div class="grid gap-6 md:grid-cols-2">
        <UFormGroup
          :label="t('pages.withdrawalPage.amountLabel')"
          name="amount"
          required
        >
          <UInput
            v-model.number="form.amount"
            type="number"
            icon="i-ph-money"
            size="xl"
            variant="outline"
            :placeholder="t('pages.withdrawalPage.amountPlaceholder')"
            class="font-bold"
          />
        </UFormGroup>

        <UFormGroup
          :label="t('pages.withdrawalPage.accountNameLabel')"
          name="accountName"
          required
        >
          <UInput
            v-model="form.accountName"
            icon="i-ph-user"
            size="xl"
            variant="outline"
            :placeholder="t('pages.withdrawalPage.accountNamePlaceholder')"
          />
        </UFormGroup>

        <UFormGroup
          :label="t('pages.withdrawalPage.accountNumberLabel')"
          name="accountNumber"
          required
        >
          <UInput
            v-model="form.accountNumber"
            icon="i-ph-hash"
            size="xl"
            variant="outline"
            :placeholder="t('pages.withdrawalPage.accountNumberPlaceholder')"
          />
        </UFormGroup>

        <UFormGroup
          :label="t('pages.withdrawalPage.noteLabel')"
          name="note"
        >
          <UInput
            v-model="form.note"
            icon="i-ph-note"
            size="xl"
            variant="outline"
            :placeholder="t('pages.withdrawalPage.notePlaceholder')"
          />
        </UFormGroup>
      </div>

      <UAlert
        v-if="errorMessage"
        color="red"
        variant="soft"
        icon="i-ph-warning-circle"
        :title="errorMessage"
        class="mt-4"
      />

      <UButton
        type="submit"
        size="xl"
        block
        color="primary"
        class="rounded-full font-black shadow-lg shadow-primary-500/30"
        :label="t('pages.withdrawalPage.submit')"
      />
    </UForm>
  </section>
</template>

<script setup lang="ts">
import type { WithdrawalMethod, WithdrawalRequestPayload } from "~/composables/useMockWithdrawalData"
import { formatWithdrawalCurrency } from "~/composables/useMockWithdrawalData"

const { t, rt, locale } = useI18n()
const { rules, createValidator } = useFormValidation()

const props = defineProps<{
  availableBalance: number
  minimumAmount: number
  methods: ReadonlyArray<WithdrawalMethod>
}>()

const emit = defineEmits<{ request: [payload: WithdrawalRequestPayload] }>()

const errorMessage = ref("")
const form = reactive<WithdrawalRequestPayload>({
  amount: props.minimumAmount,
  method: "bank",
  accountName: "",
  accountNumber: "",
  note: "",
})

const messageText = (value: unknown) =>
  typeof value === "string" ? value : rt(value as never)

// Validation logic using our new shared composable
const validate = createValidator({
  amount: [
    rules.required(),
    (val) => val < props.minimumAmount ? t("pages.withdrawalPage.errorMinimum", {
      amount: formatWithdrawalCurrency(props.minimumAmount, locale.value),
    }) : true,
    (val) => val > props.availableBalance ? t("pages.withdrawalPage.errorMaximum") : true
  ],
  accountName: [rules.required()],
  accountNumber: [rules.required()]
})

function onSubmit() {
  errorMessage.value = ""
  
  emit("request", { ...form })
  
  // Reset form but keep method
  form.amount = props.minimumAmount
  form.accountName = ""
  form.accountNumber = ""
  form.note = ""
}
</script>
