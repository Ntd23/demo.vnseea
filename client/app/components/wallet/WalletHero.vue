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


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

