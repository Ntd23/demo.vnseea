<template>
  <WithdrawalPresentationHero :available-balance="availableBalance" :stats="stats" />
</template>

<script setup lang="ts">
import WithdrawalPresentationHero from "../../../src/withdrawal/presentation/components/WithdrawalHero.vue"

defineProps<{
  availableBalance: number
  stats: any[]
}>()
</script>
