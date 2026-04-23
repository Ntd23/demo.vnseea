<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :page-key="pageKey" />
    </NuxtLayout>
    <UToaster />
  </UApp>
</template>

<script setup lang="ts">
const pageKey = (route: { path: string }) => route.path
</script>
