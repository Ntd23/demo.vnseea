<!-- English description: Displays a job detail by job id, including the one-time application state for jobs without a usable feed post link. -->
<template>
  <section class="job-detail-page mt-1.5">
    <USkeleton v-if="vm.pending.value" class="job-detail-page__skeleton" />

    <UAlert
      v-else-if="vm.errorMessage.value || !vm.job.value"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      :title="$t('pages.jobsPage.detailNotFound')"
      :description="vm.errorMessage.value || $t('pages.jobsPage.detailLoadError')"
    />

    <JobDetailPanel
      v-else
      :job="vm.job.value"
      @apply="vm.openApply"
    />

    <JobApplyModal
      :open="Boolean(vm.applyModalJob.value)"
      :job="vm.applyModalJob.value"
      :defaults="vm.currentUser.value"
      :submitting="vm.applySubmitting.value"
      :error-message="vm.applyErrorMessage.value"
      @close="vm.closeApply"
      @submit="vm.submitApplication"
    />
  </section>
</template>

<script setup lang="ts">
import { useJobDetailVM } from "../../application/view-models/useJobDetailVM"
import JobApplyModal from "../components/JobApplyModal.vue"
import JobDetailPanel from "../components/JobDetailPanel.vue"

const props = defineProps<{
  jobId: number
}>()
const vm = useJobDetailVM(toRef(props, "jobId"))
</script>

<style scoped>
.job-detail-page {
  width: min(100%, 960px);
  padding-bottom: 40px;
}

.job-detail-page__skeleton {
  width: 100%;
  height: 620px;
  border-radius: 16px;
}
</style>
