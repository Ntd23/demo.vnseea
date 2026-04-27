<template>
  <WithdrawalPresentationHistory :items="items" />
</template>

<script setup lang="ts">
import WithdrawalPresentationHistory from "../../../src/withdrawal/presentation/components/WithdrawalHistory.vue"
import type { WithdrawalHistoryItem } from "../../../src/withdrawal/domain/types/withdrawal.types"

defineProps<{
  items: WithdrawalHistoryItem[]
}>()
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

