<!-- English description: Thin Nuxt route wrapper for viewing a job by job id when no valid feed post route exists. -->
<template>
  <JobsPresentationJobDetailPage :job-id="jobId" />
</template>

<script setup lang="ts">
import JobsPresentationJobDetailPage from "../../../src/jobs/presentation/pages/JobDetailPage.vue"

definePageMeta({
  layout: "default",
})

const route = useRoute()
const jobId = computed(() => Number.parseInt(String(route.params.id ?? ""), 10) || 0)
</script>
