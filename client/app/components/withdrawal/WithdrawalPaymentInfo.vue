<template>
  <WithdrawalPresentationPaymentInfo :profiles="profiles" />
</template>

<script setup lang="ts">
import WithdrawalPresentationPaymentInfo from "../../../src/withdrawal/presentation/components/WithdrawalPaymentInfo.vue"
import type { PaymentProfile } from "../../../src/withdrawal/domain/types/withdrawal.types"

defineProps<{
  profiles: PaymentProfile[]
}>()
</script>
