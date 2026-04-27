<template>
  <WalletPresentationHero :balance="balance" :stats="stats" />
</template>

<script setup lang="ts">
import WalletPresentationHero from "../../../src/wallet/presentation/components/WalletHero.vue"

defineProps<{
  balance: number
  stats: any[]
}>()
</script>
