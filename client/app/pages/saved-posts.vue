<!-- Description: Compatibility redirect from Saved Posts to Activity Center. -->
<template><div /></template>
<script setup lang="ts">
import { appRoutes } from "../../src/shared-kernel/application/constants/route-registry"
await navigateTo({ path: appRoutes.activity, query: { tab: "saved" } }, { replace: true, redirectCode: 302 })
</script>
