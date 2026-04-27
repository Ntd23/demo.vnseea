<template>
  <CommunityPresentationPagesDirectoryPage :mode="props.mode" />
</template>

<script setup lang="ts">
import CommunityPresentationPagesDirectoryPage from "../../../src/community/presentation/pages/PagesDirectoryPage.vue"
import type { CommunityPageTab } from "../../../src/community/domain/types/community.types"

const props = withDefaults(defineProps<{
  mode?: CommunityPageTab
}>(), {
  mode: "mine",
})
</script>
