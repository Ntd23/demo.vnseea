<!-- English description: Connects a job post detail route to the normalized job detail card and real application flow. -->
<template>
  <div class="job-post-detail">
    <USkeleton v-if="vm.pending.value" class="job-post-detail__skeleton" />

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
      :post-time="postTime"
      @apply="vm.openApply"
      @view-applicants="vm.openApplicants"
    />

    <JobApplicantsModal
      :open="vm.applicantsModalOpen.value"
      :applicants="vm.applicants.value"
      :loading="vm.applicantsLoading.value"
      :error-message="vm.applicantsErrorMessage.value"
      @close="vm.closeApplicants"
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
  </div>
</template>

<script setup lang="ts">
import { useJobPostDetailVM } from "../../application/view-models/useJobPostDetailVM"
import JobApplicantsModal from "./JobApplicantsModal.vue"
import JobApplyModal from "./JobApplyModal.vue"
import JobDetailPanel from "./JobDetailPanel.vue"

const props = defineProps<{
  postId: number
  postTime?: string
}>()
const vm = useJobPostDetailVM(toRef(props, "postId"))
</script>

<style scoped>
.job-post-detail__skeleton {
  width: 100%;
  height: 620px;
  border-radius: 16px;
}
</style>
