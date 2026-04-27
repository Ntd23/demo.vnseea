<template>
  <CommunityPresentationSettingsSectionCard v-bind="$attrs">
    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>
    <slot />
  </CommunityPresentationSettingsSectionCard>
</template>

<script setup lang="ts">
import CommunityPresentationSettingsSectionCard from "../../../src/community/presentation/components/SettingsSectionCard.vue"
</script>
