<template>
  <CommunityPresentationGroupsPage :mode="props.mode" />
</template>

<script setup lang="ts">
import CommunityPresentationGroupsPage from "../../../src/community/presentation/pages/GroupsPage.vue"
import type { CommunityGroupTab } from "../../../src/community/domain/types/community.types"

const props = withDefaults(defineProps<{
  mode?: CommunityGroupTab
}>(), {
  mode: "mine",
})
</script>
