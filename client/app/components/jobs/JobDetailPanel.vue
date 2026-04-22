<template>
  <aside class="space-y-4">
    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <div class="flex items-start gap-3">
        <div
          class="avatar-lg shrink-0 text-white"
          :style="{ background: job.companyGradient }"
        >
          {{ job.companyInitials }}
        </div>
        <div class="min-w-0">
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            {{ $t("pages.jobsPage.detailEyebrow") }}
          </p>
          <h2 class="mt-1 text-title-primary">
            {{ job.title }}
          </h2>
          <p class="mt-1 text-caption-secondary">
            {{ job.company }} · {{ job.postedAt }}
          </p>
        </div>
      </div>

      <div class="mt-4 grid gap-2 text-[13px] font-semibold text-[var(--text-secondary)]">
        <div class="flex items-center gap-2 rounded-[18px] bg-[var(--color-secondary-100)] px-3 py-2">
          <Icon name="i-ph-map-pin-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
          {{ job.location }}
        </div>
        <div class="flex items-center gap-2 rounded-[18px] bg-[var(--color-secondary-100)] px-3 py-2">
          <Icon name="i-ph-money-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
          {{ job.salary }}
        </div>
        <div class="flex items-center gap-2 rounded-[18px] bg-[var(--color-secondary-100)] px-3 py-2">
          <Icon name="i-ph-calendar-check-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
          {{ $t("pages.jobsPage.deadlineLabel", { date: job.deadline }) }}
        </div>
      </div>

      <p class="mt-4 text-[13px] leading-6 text-[var(--text-secondary)]">
        {{ job.description }}
      </p>

      <div class="mt-4 flex flex-wrap gap-1.5">
        <span
          v-for="skill in job.skills"
          :key="skill"
          class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary-600)]"
        >
          #{{ skill }}
        </span>
      </div>

      <button
        class="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary-500)] text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
        type="button"
        @click="$emit('apply', job)"
      >
        <Icon name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
        {{ $t("pages.jobsPage.applyThisJob") }}
      </button>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        {{ $t("pages.jobsPage.requirements") }}
      </p>
      <ul class="mt-3 space-y-2">
        <li
          v-for="item in job.requirements"
          :key="item"
          class="flex gap-2 text-[13px] leading-6 text-[var(--text-secondary)]"
        >
          <Icon name="i-ph-check-circle-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-success)]" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </section>

    <section class="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-label-secondary text-[var(--color-primary-600)]">
        {{ $t("pages.jobsPage.benefits") }}
      </p>
      <ul class="mt-3 space-y-2">
        <li
          v-for="item in job.benefits"
          :key="item"
          class="flex gap-2 text-[13px] leading-6 text-[var(--text-secondary)]"
        >
          <Icon name="i-ph-gift-fill" class="mt-1 h-4 w-4 shrink-0 text-[var(--color-accent-500)]" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { MockJob } from "~/composables/useMockJobsData"

defineProps<{
  job: MockJob
}>()

defineEmits<{
  apply: [job: MockJob]
}>()
</script>
