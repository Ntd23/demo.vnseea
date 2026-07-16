<!-- English description: Displays owner-only job applicant profiles using the contact, experience, and answer fields from the PHP job application view. -->
<template>
  <FoundationModalShell
    :open="open"
    :title="$t('pages.jobsPage.applicantsTitle')"
    size="xl"
    body-class="space-y-4"
    @close="emit('close')"
  >
    <div class="applicants-modal">
      <div v-if="loading" class="applicants-modal__loading">
        <USkeleton v-for="index in 2" :key="index" class="h-64 w-full rounded-[16px]" />
      </div>

      <UAlert
        v-else-if="errorMessage"
        color="error"
        variant="subtle"
        icon="i-ph-warning-circle-fill"
        :title="errorMessage"
      />

      <UAlert
        v-else-if="applicants.length === 0"
        color="neutral"
        variant="subtle"
        icon="i-ph-users-duotone"
        :title="$t('pages.jobsPage.applicantsEmpty')"
      />

      <article
        v-for="applicant in applicants"
        v-else
        :key="applicant.id"
        class="applicant-card"
      >
        <header class="applicant-card__header">
          <NuxtLink :to="profilePath(applicant)" class="applicant-card__avatar-link">
            <NuxtImg
              v-if="applicant.avatarUrl"
              :src="applicant.avatarUrl"
              :alt="applicant.userName"
              class="applicant-card__avatar"
              width="72"
              height="72"
            />
            <span v-else class="applicant-card__avatar applicant-card__avatar--fallback">
              <Icon name="i-ph-user-duotone" class="h-7 w-7" />
            </span>
          </NuxtLink>

          <div class="applicant-card__identity">
            <NuxtLink :to="profilePath(applicant)" class="applicant-card__name">
              {{ applicant.userName }}
            </NuxtLink>
            <div class="applicant-card__contact-grid">
              <span v-if="applicant.location" class="applicant-card__contact">
                <Icon name="i-ph-map-pin-fill" class="text-[var(--color-error)]" />
                {{ applicant.location }}
              </span>
              <span v-if="applicant.appliedAt" class="applicant-card__contact">
                <Icon name="i-ph-clock-fill" class="text-[var(--color-success)]" />
                {{ formatAppliedAt(applicant.appliedAt) }}
              </span>
              <a v-if="applicant.phoneNumber" :href="`tel:${applicant.phoneNumber}`" class="applicant-card__contact applicant-card__contact--link">
                <Icon name="i-ph-phone-fill" class="text-[var(--color-info)]" />
                {{ applicant.phoneNumber }}
              </a>
              <a v-if="applicant.email" :href="`mailto:${applicant.email}`" class="applicant-card__contact applicant-card__contact--link">
                <Icon name="i-ph-envelope-simple-fill" class="text-[var(--color-accent-500)]" />
                {{ applicant.email }}
              </a>
            </div>
          </div>
        </header>

        <div
          v-if="hasExperience(applicant)"
          class="applicant-card__section applicant-card__experience"
        >
          <div v-if="applicant.workplace" class="applicant-card__field">
            <strong>{{ $t("pages.jobsPage.whereDidYouWork") }}</strong>
            <span>{{ applicant.workplace }}</span>
          </div>
          <div v-if="applicant.position" class="applicant-card__field">
            <strong>{{ $t("pages.jobsPage.position") }}</strong>
            <span>{{ applicant.position }}</span>
          </div>
          <div v-if="applicant.experienceStartYear" class="applicant-card__field">
            <strong>{{ $t("pages.jobsPage.experienceStartDate") }}</strong>
            <span>{{ applicant.experienceStartYear }}</span>
          </div>
          <div v-if="applicant.experienceEndYear" class="applicant-card__field">
            <strong>{{ $t("pages.jobsPage.experienceEndDate") }}</strong>
            <span>{{ applicant.experienceEndYear }}</span>
          </div>
          <div v-if="applicant.experienceDescription" class="applicant-card__field applicant-card__field--wide">
            <strong>{{ $t("pages.jobsPage.experienceDescription") }}</strong>
            <span>{{ applicant.experienceDescription }}</span>
          </div>
        </div>

        <div v-if="applicant.answers.length" class="applicant-card__section applicant-card__answers">
          <div v-for="answer in applicant.answers" :key="answer.question" class="applicant-card__field">
            <strong>{{ answer.question }}</strong>
            <span>{{ answer.answer }}</span>
          </div>
        </div>
      </article>

      <div class="applicants-modal__footer">
        <UButton color="neutral" variant="soft" @click="emit('close')">
          {{ $t("pages.jobsPage.close") }}
        </UButton>
      </div>
    </div>
  </FoundationModalShell>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import FoundationModalShell from "../../../foundation/presentation/components/ModalShell.vue"
import type { JobApplicantRecord } from "../../domain/types/jobs.types"

defineProps<{
  open: boolean
  applicants: JobApplicantRecord[]
  loading: boolean
  errorMessage: string
}>()
const emit = defineEmits<{
  close: []
}>()
const { locale } = useI18n()

function profilePath(applicant: JobApplicantRecord) {
  return applicant.username
    ? appRoutes.profile(applicant.username)
    : appRoutes.jobs
}

function formatAppliedAt(timestamp: number) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000))
}

function hasExperience(applicant: JobApplicantRecord) {
  return Boolean(
    applicant.workplace
    || applicant.position
    || applicant.experienceStartYear
    || applicant.experienceEndYear
    || applicant.experienceDescription,
  )
}
</script>

<style scoped>
.applicants-modal,
.applicants-modal__loading {
  display: grid;
  gap: 16px;
}

.applicant-card {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  background: var(--bg-surface);
}

.applicant-card__header {
  display: flex;
  gap: 14px;
  padding: 18px;
}

.applicant-card__avatar-link,
.applicant-card__avatar {
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  border-radius: 50%;
}

.applicant-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: cover;
}

.applicant-card__avatar--fallback {
  background: var(--bg-muted);
  color: var(--icon-secondary);
}

.applicant-card__identity {
  min-width: 0;
  flex: 1;
}

.applicant-card__name {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 800;
  text-decoration: none;
}

.applicant-card__name:hover,
.applicant-card__contact--link:hover {
  color: var(--text-brand);
}

.applicant-card__contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  margin-top: 10px;
}

.applicant-card__contact {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.applicant-card__contact :deep(svg) {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.applicant-card__section {
  display: grid;
  gap: 14px;
  border-top: 1px solid var(--border-subtle);
  padding: 18px;
  background: var(--bg-surface-hover);
}

.applicant-card__experience {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.applicant-card__field {
  display: grid;
  gap: 4px;
  min-width: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.55;
}

.applicant-card__field strong {
  color: var(--text-primary);
  font-weight: 700;
}

.applicant-card__field--wide {
  grid-column: 1 / -1;
}

.applicant-card__answers {
  background: var(--bg-surface);
}

.applicants-modal__footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .applicant-card__header {
    align-items: flex-start;
    padding: 14px;
  }

  .applicant-card__avatar-link,
  .applicant-card__avatar {
    width: 56px;
    height: 56px;
    flex-basis: 56px;
  }

  .applicant-card__contact-grid,
  .applicant-card__experience {
    grid-template-columns: 1fr;
  }

  .applicant-card__section {
    padding: 14px;
  }
}
</style>
