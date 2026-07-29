<!-- English description: Displays a compact PHTML-aligned job card with linked job details, category, and owner-aware actions. -->
<template>
  <article class="job-card">
    <NuxtLink
      :to="jobHref"
      class="job-card__cover"
      :aria-label="job.title"
    >
      <NuxtImg
        v-if="job.imageUrl"
        :src="job.imageUrl"
        :alt="job.title"
        class="job-card__image"
        width="640"
        height="360"
        loading="lazy"
      />
      <div v-else class="job-card__fallback">
        <Icon name="i-ph-briefcase-fill" class="h-10 w-10" />
      </div>
    </NuxtLink>

    <div class="job-card__content">
      <h3 class="job-card__title">
        <NuxtLink :to="jobHref" class="job-card__title-link">
          {{ job.title }}
        </NuxtLink>
      </h3>

      <div class="job-card__meta">
        <span class="job-card__meta-item">
          <Icon name="i-ph-money-duotone" class="job-card__meta-icon job-card__meta-icon--salary" />
          {{ salaryRangeLabel || $t("pages.jobsPage.salaryUnknown") }}
        </span>
        <NuxtLink :to="categoryHref" class="job-card__meta-item job-card__category-link">
          <Icon name="i-ph-shapes-duotone" class="job-card__meta-icon job-card__meta-icon--category" />
          <span>{{ job.categoryLabel }}</span>
        </NuxtLink>
      </div>

      <div class="job-card__actions">
        <UButton
          v-if="job.isOwner"
          block
          color="error"
          icon="i-ph-trash-duotone"
          class="job-card__action job-card__action--delete"
          :loading="deleting"
          @click="emit('delete', job)"
        >
          {{ $t("pages.jobsPage.deleteJob") }}
        </UButton>

        <UButton
          v-else-if="job.canApply"
          block
          color="warning"
          icon="i-ph-check-circle-fill"
          class="job-card__action job-card__action--apply"
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
          class="job-card__action job-card__applied"
          disabled
        >
          {{ $t("pages.jobsPage.alreadyApplied") }}
        </UButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { JobRecord } from "../../domain/types/jobs.types"

const props = defineProps<{
  job: JobRecord
  deleting?: boolean
}>()

const jobHref = computed(() =>
  props.job.postId
    ? appRoutes.postDetail(props.job.postId)
    : appRoutes.jobDetail(props.job.id),
)

const salaryRangeLabel = computed(() =>
  [props.job.minimum, props.job.maximum]
    .filter((value): value is number => typeof value === "number" && value > 0)
    .map(value => `${props.job.currencySymbol}${value}`)
    .join(" - "),
)

const categoryHref = computed(() => ({
  path: appRoutes.jobs,
  query: {
    category: props.job.category,
  },
}))

const emit = defineEmits<{
  apply: [job: JobRecord]
  delete: [job: JobRecord]
}>()
</script>

<style scoped>
.job-card {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 14px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.job-card:hover {
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.job-card__cover {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-muted);
}

.job-card__image,
.job-card__fallback {
  width: 100%;
  height: 100%;
}

.job-card__image {
  display: block;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.job-card__cover:hover .job-card__image {
  transform: scale(1.02);
}

.job-card__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-secondary);
}

.job-card__title {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
}

.job-card__content {
  padding: 14px;
}

.job-card__title-link {
  color: inherit;
  text-decoration: none;
}

.job-card__title-link:hover {
  color: var(--text-brand);
}

.job-card__meta {
  display: grid;
  gap: 7px;
  margin-top: 8px;
}

.job-card__meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.job-card__meta-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.job-card__meta-icon--salary {
  color: var(--color-error);
}

.job-card__meta-icon--category {
  color: var(--color-primary-600);
}

.job-card__category-link {
  width: fit-content;
  text-decoration: none;
}

.job-card__category-link:hover {
  color: var(--text-brand);
}

.job-card__actions {
  display: flex;
  width: 100%;
  margin-top: 10px;
}

.job-card__action,
.job-card__applied {
  display: inline-flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 800;
}

.job-card__action--apply {
  background: var(--color-accent-500);
  color: #ffffff;
}

.job-card__action--apply:hover {
  background: var(--color-accent-600);
}

.job-card__applied {
  background: var(--bg-surface-active);
  color: var(--text-brand);
}
</style>
