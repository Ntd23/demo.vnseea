<template>
  <article>
    <UCard
      class="flex h-full flex-col rounded-[30px] border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
      :class="cardClass"
      :ui="{ body: 'p-5' }"
    >
      <div class="flex items-start gap-4">
        <div
          class="avatar-lg shrink-0 text-white shadow-[var(--shadow-md)]"
          :style="{ background: job.companyGradient }"
        >
          {{ job.companyInitials }}
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1 text-[11px] font-bold">
              {{ job.categoryLabel }}
            </UBadge>

            <UBadge
              v-if="selected"
              color="success"
              variant="subtle"
              class="rounded-full px-3 py-1 text-[11px] font-bold"
            >
              {{ $t("pages.jobsPage.selectedBadge") }}
            </UBadge>

            <UBadge
              v-if="job.isFeatured"
              color="warning"
              variant="subtle"
              class="rounded-full px-3 py-1 text-[11px] font-bold"
            >
              {{ $t("pages.jobsPage.featuredBadge") }}
            </UBadge>

            <UBadge
              v-if="job.isOwner"
              color="neutral"
              variant="subtle"
              class="rounded-full px-3 py-1 text-[11px] font-bold"
            >
              {{ $t("pages.jobsPage.myBadge") }}
            </UBadge>

            <UBadge
              v-if="job.isRemote"
              color="info"
              variant="subtle"
              class="rounded-full px-3 py-1 text-[11px] font-bold"
            >
              {{ $t("pages.jobsPage.remoteBadge") }}
            </UBadge>
          </div>

          <h3 class="mt-4 line-clamp-2 text-[1.2rem] font-black leading-tight tracking-[-0.04em] text-[var(--text-primary)]">
            {{ job.title }}
          </h3>
          <p class="mt-1 text-[13px] font-bold text-[var(--text-secondary)]">
            {{ job.company }} · {{ job.typeLabel }}
          </p>
          <p class="mt-2 text-[12px] font-semibold text-[var(--text-tertiary)]">
            {{ job.postedAt }}
          </p>
        </div>
      </div>

      <p class="mt-5 min-h-[72px] text-[13px] leading-6 text-[var(--text-secondary)]">
        {{ job.description }}
      </p>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <div class="rounded-[20px] bg-[var(--bg-surface-hover)] px-3 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.jobLocationLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-extrabold text-[var(--text-primary)]">
            {{ job.location }}
          </p>
        </div>

        <div class="rounded-[20px] bg-[var(--bg-surface-hover)] px-3 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.jobSalaryLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-extrabold text-[var(--text-primary)]">
            {{ job.salary }}
          </p>
        </div>

        <div class="rounded-[20px] bg-[var(--bg-surface-hover)] px-3 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.jobExperienceLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-extrabold text-[var(--text-primary)]">
            {{ job.experience }}
          </p>
        </div>

        <div class="rounded-[20px] bg-[var(--bg-surface-hover)] px-3 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.jobApplicantsLabel") }}
          </p>
          <p class="mt-1 text-[13px] font-extrabold text-[var(--text-primary)]">
            {{ $t("pages.jobsPage.applicantCount", { count: job.applicants }) }}
          </p>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <UBadge
          v-for="skill in job.skills"
          :key="skill"
          color="neutral"
          variant="soft"
          class="rounded-full px-3 py-1 text-[11px] font-semibold"
        >
          #{{ skill }}
        </UBadge>
      </div>

      <div class="mt-6 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <UButton
          type="button"
          color="primary"
          size="lg"
          class="justify-center rounded-full"
          @click="emit('apply', job)"
        >
          <Icon name="i-ph-paper-plane-tilt-fill" class="mr-1.5 h-4 w-4" />
          {{ $t("pages.jobsPage.apply") }}
        </UButton>

        <UButton
          type="button"
          :color="selected ? 'success' : 'neutral'"
          :variant="selected ? 'solid' : 'outline'"
          size="lg"
          class="justify-center rounded-full"
          @click="emit('view', job)"
        >
          {{ selected ? $t("pages.jobsPage.viewingDetail") : $t("pages.jobsPage.viewDetail") }}
        </UButton>

        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          class="justify-center rounded-full"
          :aria-pressed="saved"
          @click="emit('toggleSave', job.id)"
        >
          <Icon :name="saved ? 'i-ph-bookmark-simple-fill' : 'i-ph-bookmark-simple'" class="h-5 w-5" />
        </UButton>
      </div>
    </UCard>
  </article>
</template>

<script setup lang="ts">
import type { MockJob } from "~/composables/useMockJobsData"

const props = withDefaults(defineProps<{
  job: MockJob
  saved: boolean
  selected?: boolean
}>(), {
  selected: false,
})

const emit = defineEmits<{
  apply: [job: MockJob]
  view: [job: MockJob]
  toggleSave: [id: string]
}>()

const cardClass = computed(() =>
  props.selected
    ? "border-[var(--color-success)] ring-4 ring-emerald-50 shadow-[var(--shadow-xl)]"
    : "border-[var(--border-default)] shadow-[var(--shadow-md)]",
)
</script>
