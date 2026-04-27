<template>
  <WalletPresentationSendForm :balance="balance" @send="$emit('send', $event)" />
</template>

<script setup lang="ts">
import WalletPresentationSendForm from "../../../src/wallet/presentation/components/WalletSendForm.vue"
import type { WalletSendPayload } from "../../../src/wallet/domain/types/wallet.types"

defineProps<{
  balance: number
}>()

defineEmits<{
  (e: "send", payload: WalletSendPayload): void
}>()
</script>
