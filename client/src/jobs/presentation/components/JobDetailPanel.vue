<!-- English description: Displays the PHTML-aligned job detail card with owner, metadata, salary, description, and application state. -->
<template>
  <article class="job-detail">
    <div class="job-detail__cover">
      <NuxtImg
        v-if="job.imageUrl"
        :src="job.imageUrl"
        :alt="job.title"
        class="job-detail__cover-image"
        width="960"
        height="420"
      />
      <div v-else class="job-detail__cover-fallback">
        <Icon name="i-ph-briefcase-duotone" class="h-14 w-14" />
      </div>
    </div>

    <div class="job-detail__header">
      <NuxtLink v-if="job.owner" :to="ownerPath" class="job-detail__avatar-link">
        <NuxtImg
          v-if="job.owner.avatarUrl"
          :src="job.owner.avatarUrl"
          :alt="job.owner.name"
          class="job-detail__avatar"
          width="112"
          height="112"
        />
        <span v-else class="job-detail__avatar job-detail__avatar--fallback">
          <Icon name="i-ph-buildings-duotone" class="h-9 w-9" />
        </span>
      </NuxtLink>

      <h1 class="job-detail__title">{{ job.title }}</h1>
      <NuxtLink v-if="job.owner" :to="ownerPath" class="job-detail__owner">
        {{ job.owner.name }}
      </NuxtLink>

      <div class="job-detail__meta">
        <span v-if="job.location" class="job-detail__meta-item">
          <Icon name="i-ph-map-pin-fill" class="job-detail__meta-icon job-detail__meta-icon--location" />
          {{ job.location }}
        </span>
        <span v-if="postTime" class="job-detail__meta-item">
          <Icon name="i-ph-clock-fill" class="job-detail__meta-icon job-detail__meta-icon--time" />
          {{ postTime }}
        </span>
        <span v-if="job.typeLabel" class="job-detail__meta-item">
          <Icon name="i-ph-briefcase-fill" class="job-detail__meta-icon job-detail__meta-icon--type" />
          {{ job.typeLabel }}
        </span>
        <NuxtLink :to="categoryHref" class="job-detail__meta-item job-detail__meta-link">
          <Icon name="i-ph-tag-fill" class="job-detail__meta-icon job-detail__meta-icon--category" />
          {{ job.categoryLabel }}
        </NuxtLink>
      </div>

      <UButton
        v-if="job.isOwner"
        block
        color="error"
        variant="soft"
        class="job-detail__primary-action"
        :disabled="job.applyCount === 0"
        @click="emit('viewApplicants', job)"
      >
        {{ $t("pages.jobsPage.viewCandidates", { count: job.applyCount }) }}
      </UButton>
      <UButton
        v-else-if="job.canApply"
        block
        color="warning"
        icon="i-ph-check-circle-fill"
        class="job-detail__primary-action job-detail__primary-action--apply"
        @click="emit('apply', job)"
      >
        {{ $t("pages.jobsPage.applyNow") }}
      </UButton>
      <UButton
        v-else-if="job.alreadyApplied"
        block
        color="neutral"
        variant="soft"
        icon="i-ph-check-circle-fill"
        class="job-detail__primary-action"
        disabled
      >
        {{ $t("pages.jobsPage.alreadyApplied") }}
      </UButton>
    </div>

    <div class="job-detail__body">
      <div v-if="job.minimum || job.maximum" class="job-detail__salary-panel">
        <div v-if="job.minimum" class="job-detail__salary-item">
          <strong>{{ $t("pages.jobsPage.minimumSalaryDetail") }}</strong>
          <span>{{ formatSalary(job.minimum) }} <small>{{ job.salaryDateLabel }}</small></span>
        </div>
        <div v-if="job.maximum" class="job-detail__salary-item">
          <strong>{{ $t("pages.jobsPage.maximumSalaryDetail") }}</strong>
          <span>{{ formatSalary(job.maximum) }} <small>{{ job.salaryDateLabel }}</small></span>
        </div>
      </div>

      <p v-if="job.description" class="job-detail__description">
        {{ job.description }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { JobRecord } from "../../domain/types/jobs.types"

const props = defineProps<{
  job: JobRecord
  postTime?: string
}>()
const emit = defineEmits<{
  apply: [job: JobRecord]
  viewApplicants: [job: JobRecord]
}>()
const { locale } = useI18n()

const ownerPath = computed(() => {
  if (!props.job.owner) {
    return appRoutes.jobs
  }

  return props.job.owner.kind === "page"
    ? appRoutes.pageDetail(props.job.owner.slug)
    : appRoutes.profile(props.job.owner.slug)
})
const categoryHref = computed(() => ({
  path: appRoutes.jobs,
  query: { category: props.job.category },
}))

function formatSalary(value: number) {
  return `${props.job.currencySymbol}${new Intl.NumberFormat(locale.value).format(value)}`
}
</script>

<style scoped>
.job-detail {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.job-detail__cover {
  width: 100%;
  aspect-ratio: 16 / 7;
  overflow: hidden;
  background: var(--bg-muted);
}

.job-detail__cover-image,
.job-detail__cover-fallback {
  width: 100%;
  height: 100%;
}

.job-detail__cover-image {
  display: block;
  object-fit: cover;
}

.job-detail__cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-secondary);
}

.job-detail__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 20px;
  text-align: center;
}

.job-detail__avatar-link {
  width: 112px;
  height: 112px;
  margin-top: -56px;
  border: 4px solid var(--bg-surface);
  border-radius: 50%;
  background: var(--bg-surface);
  box-shadow: var(--shadow-md);
}

.job-detail__avatar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  object-fit: cover;
}

.job-detail__avatar--fallback {
  background: var(--bg-muted);
  color: var(--icon-secondary);
}

.job-detail__title {
  margin: 18px 0 0;
  color: var(--text-primary);
  font-size: 25px;
  font-weight: 800;
  line-height: 1.25;
}

.job-detail__owner {
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
}

.job-detail__owner:hover,
.job-detail__meta-link:hover {
  color: var(--text-brand);
}

.job-detail__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 12px;
  margin-top: 14px;
}

.job-detail__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.job-detail__meta-item:not(:last-child)::after {
  margin-left: 7px;
  color: var(--text-tertiary);
  content: "•";
}

.job-detail__meta-icon {
  width: 16px;
  height: 16px;
}

.job-detail__meta-icon--location { color: var(--color-error); }
.job-detail__meta-icon--time { color: var(--color-success); }
.job-detail__meta-icon--type { color: var(--color-info); }
.job-detail__meta-icon--category { color: var(--color-warning); }

.job-detail__primary-action {
  width: 100%;
  min-height: 38px;
  margin-top: 20px;
  justify-content: center;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.job-detail__primary-action--apply {
  color: #ffffff;
}

.job-detail__body {
  padding: 0 24px 24px;
}

.job-detail__salary-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  border-radius: 8px;
  padding: 20px;
  background: var(--bg-muted);
}

.job-detail__salary-item {
  display: grid;
  gap: 4px;
  min-width: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.job-detail__salary-item strong {
  font-weight: 800;
}

.job-detail__salary-item small {
  color: var(--text-secondary);
  font-size: 11px;
}

.job-detail__description {
  margin: 18px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-line;
}

@media (max-width: 640px) {
  .job-detail__cover {
    aspect-ratio: 4 / 3;
  }

  .job-detail__header,
  .job-detail__body {
    padding-right: 16px;
    padding-left: 16px;
  }

  .job-detail__avatar-link {
    width: 96px;
    height: 96px;
    margin-top: -48px;
  }

  .job-detail__title {
    font-size: 22px;
  }

  .job-detail__salary-panel {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 16px;
  }
}
</style>
