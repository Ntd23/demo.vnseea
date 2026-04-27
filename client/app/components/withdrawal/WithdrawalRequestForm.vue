<template>
  <WithdrawalPresentationRequestForm 
    :available-balance="availableBalance" 
    :methods="methods" 
    :minimum-amount="minimumAmount"
    @request="$emit('request', $event)"
  />
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
