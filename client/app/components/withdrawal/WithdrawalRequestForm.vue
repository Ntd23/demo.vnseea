<template>
  <WithdrawalPresentationRequestForm 
    :available-balance="availableBalance" 
    :methods="methods" 
    :minimum-amount="minimumAmount"
    @request="$emit('request', $event)"
  />
</template>

<script setup lang="ts">
import WithdrawalPresentationRequestForm from "../../../src/withdrawal/presentation/components/WithdrawalRequestForm.vue"
import type { WithdrawalMethod, WithdrawalRequestPayload } from "../../../src/withdrawal/domain/types/withdrawal.types"

defineProps<{
  availableBalance: number
  minimumAmount: number
  methods: WithdrawalMethod[]
}>()

defineEmits<{
  (e: "request", payload: WithdrawalRequestPayload): void
}>()
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

