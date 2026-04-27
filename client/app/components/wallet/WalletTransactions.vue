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
