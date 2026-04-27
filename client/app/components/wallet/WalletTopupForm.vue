<template>
  <WalletPresentationTopupForm :methods="methods" @topup="$emit('topup', $event)" />
</template>

<script setup lang="ts">
import WalletPresentationTopupForm from "../../../src/wallet/presentation/components/WalletTopupForm.vue"
import type { TopupMethod, WalletTopupPayload } from "../../../src/wallet/domain/types/wallet.types"

defineProps<{
  methods: TopupMethod[]
}>()

defineEmits<{
  (e: "topup", payload: WalletTopupPayload): void
}>()
</script>
