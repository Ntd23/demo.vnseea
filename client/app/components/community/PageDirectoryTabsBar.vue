<template>
  <CommunityPresentationPageDirectoryTabsBar v-bind="$attrs" v-model:search="search" />
</template>

<script setup lang="ts">
import CommunityPresentationPageDirectoryTabsBar from "../../../src/community/presentation/components/PageDirectoryTabsBar.vue"

const search = defineModel("search")
</script>
