<!-- English description: Nuxt route wrapper for the wallet bounded-context page. -->
<template>
  <PagesWalletPage />
</template>

<script setup lang="ts">
import PagesWalletPage from "../../src/wallet/presentation/pages/WalletPage.vue"
definePageMeta({
  layout: "default",
})
</script>
