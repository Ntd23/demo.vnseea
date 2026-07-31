<!-- English description: Renders the backend-backed jobs directory with owner-aware application and deletion flows aligned with the PHP jobs page. -->
<template>
  <div class="mt-1.5 max-w-[1120px] space-y-4 pb-10">
    <JobsFilters
      v-model:search="vm.searchQuery.value"
      v-model:selected-type="vm.selectedType.value"
      v-model:selected-category="vm.selectedCategory.value"
      v-model:selected-distance="vm.selectedDistance.value"
      :types="vm.types.value"
      :categories="vm.categories.value"
      :distance-options="vm.distanceOptions.value"
      :distance-enabled="vm.distanceEnabled.value"
      :location-pending="vm.locationPending.value"
      :distance-status="vm.distanceStatus.value"
      :can-create="vm.canCreate.value"
      :create-disabled-reason="vm.createDisabledReason.value"
      :has-active-filters="vm.hasActiveFilters.value"
      @open-create="vm.openCreate"
      @request-location="vm.requestCurrentLocation"
      @reset="vm.resetFilters"
    />

    <UAlert
      v-if="vm.errorMessage.value"
      color="error"
      variant="subtle"
      class="rounded-[24px]"
      :title="vm.errorMessage.value"
    />

    <div v-if="vm.loading.value" class="grid gap-4 lg:grid-cols-2">
      <div v-for="index in 4" :key="index" class="jobs-skeleton-card">
        <div class="jobs-skeleton-cover">
          <USkeleton class="jobs-skeleton-bg" />
        </div>

        <div class="jobs-skeleton-body">
          <USkeleton class="h-[24px] w-[78%] rounded-md" />
          <USkeleton class="h-[16px] w-[45%] rounded-md" />
          <USkeleton class="h-[16px] w-[58%] rounded-md" />
          <USkeleton class="mt-1 h-[38px] w-full rounded-lg" />
        </div>
      </div>
    </div>

    <div v-else class="jobs-results" :class="{ 'jobs-results--refreshing': vm.refreshing.value }">
      <div
        v-if="vm.refreshing.value"
        class="jobs-results__loading"
        role="status"
        :aria-label="$t('pages.jobsPage.loadingJobs')"
      >
        <Icon name="i-ph-spinner-gap-bold" class="jobs-results__spinner" />
      </div>

      <template v-if="vm.items.value.length > 0">
        <div class="grid gap-4 lg:grid-cols-2">
          <JobCard
            v-for="job in vm.items.value"
            :key="job.id"
            :job="job"
            :deleting="vm.deleteSubmitting.value && vm.deleteModalJob.value?.id === job.id"
            @apply="vm.openApply"
            @delete="vm.openDelete"
          />
        </div>

        <div v-if="vm.hasMore.value" class="flex justify-center pt-2">
          <UButton
            color="neutral"
            variant="outline"
            class="rounded-full px-6"
            :loading="vm.loadingMore.value"
            @click="vm.loadMore"
          >
            {{ $t("navigation.leftSidebar.showMore") }}
          </UButton>
        </div>
      </template>

      <JobsEmptyState v-else @reset="vm.resetFilters" />
    </div>

    <JobApplyModal
      :open="Boolean(vm.applyModalJob.value)"
      :job="vm.applyModalJob.value"
      :defaults="vm.currentUser.value"
      :submitting="vm.applySubmitting.value"
      :error-message="vm.applyErrorMessage.value"
      @close="vm.closeApply"
      @submit="vm.submitApplication"
    />

    <JobPostModal
      :open="vm.createModalOpen.value"
      :categories="vm.categories.value"
      :types="vm.types.value"
      :currencies="vm.currencies.value"
      :salary-dates="vm.salaryDates.value"
      :question-types="vm.questionTypes.value"
      :image-types="vm.imageTypes.value"
      :owned-pages="vm.ownedPages.value"
      :preferred-page-id="vm.preferredCreatePageId.value"
      :defaults="vm.currentUser.value"
      :can-create="vm.canCreate.value"
      :create-disabled-reason="vm.createDisabledReason.value"
      :submitting="vm.createSubmitting.value"
      :error-message="vm.createErrorMessage.value"
      @close="vm.closeCreate"
      @submit="vm.submitCreate"
    />

    <UModal
      :open="Boolean(vm.deleteModalJob.value)"
      :title="$t('pages.jobsPage.deleteConfirmTitle')"
      @update:open="(open) => !open && vm.closeDelete()"
    >
      <template #body>
        <div class="space-y-3">
          <p class="text-sm text-[var(--text-secondary)]">
            {{ $t("pages.jobsPage.deleteConfirmDescription", { title: vm.deleteModalJob.value?.title || "-" }) }}
          </p>
          <UAlert
            v-if="vm.deleteErrorMessage.value"
            color="error"
            variant="subtle"
            :title="vm.deleteErrorMessage.value"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="soft"
            :disabled="vm.deleteSubmitting.value"
            @click="vm.closeDelete"
          >
            {{ $t("pages.jobsPage.cancel") }}
          </UButton>
          <UButton
            color="error"
            icon="i-ph-trash-duotone"
            :loading="vm.deleteSubmitting.value"
            @click="vm.submitDelete"
          >
            {{ $t("pages.jobsPage.deleteJob") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useJobsPageVM } from "../../application/view-models/useJobsPageVM"
import JobApplyModal from "../components/JobApplyModal.vue"
import JobCard from "../components/JobCard.vue"
import JobPostModal from "../components/JobPostModal.vue"
import JobsEmptyState from "../components/JobsEmptyState.vue"
import JobsFilters from "../components/JobsFilters.vue"

const vm = useJobsPageVM()
</script>

<style scoped>
.jobs-skeleton-card {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 14px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.jobs-skeleton-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.jobs-skeleton-bg {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}

.jobs-skeleton-body {
  display: grid;
  gap: 9px;
  padding: 14px;
}

.jobs-results {
  position: relative;
  min-height: 180px;
}

.jobs-results--refreshing {
  pointer-events: none;
}

.jobs-results__loading {
  position: absolute;
  z-index: 3;
  top: 12px;
  right: 12px;
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bg-surface);
  color: var(--text-brand);
  box-shadow: var(--shadow-sm);
}

.jobs-results__spinner {
  width: 18px;
  height: 18px;
  animation: jobs-results-spin 0.75s linear infinite;
}

@keyframes jobs-results-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
