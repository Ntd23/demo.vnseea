<template>
  <FoundationEmptyState
    icon="i-ph-briefcase-fill"
    :eyebrow="$t('pages.jobsPage.emptyEyebrow')"
    :title="$t('pages.jobsPage.emptyTitle')"
    :description="$t('pages.jobsPage.emptyDescription')"
    :primary-label="$t('pages.jobsPage.viewAll')"
    @primary="$emit('reset')"
  />
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"

defineEmits<{
  reset: []
}>()
</script>
