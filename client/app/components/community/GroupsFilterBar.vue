<template>
  <CommunityPresentationGroupsFilterBar v-bind="$attrs" v-model:search="search" />
</template>

<script setup lang="ts">
import CommunityPresentationGroupsFilterBar from "../../../src/community/presentation/components/GroupsFilterBar.vue"

const search = defineModel("search")
</script>
