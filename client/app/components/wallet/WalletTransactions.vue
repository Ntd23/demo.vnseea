<template>
  <WalletPresentationTransactions :transactions="transactions" />
</template>

<script setup lang="ts">
import WalletPresentationTransactions from "../../../src/wallet/presentation/components/WalletTransactions.vue"
import type { WalletTransaction } from "../../../src/wallet/domain/types/wallet.types"

defineProps<{
  transactions: WalletTransaction[]
}>()
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

