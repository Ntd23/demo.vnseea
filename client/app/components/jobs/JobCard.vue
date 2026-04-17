<template>
  <article class="group rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
    <div class="flex items-start gap-3">
      <div
        class="avatar-lg shrink-0 text-white"
        :style="{ background: job.companyGradient }"
      >
        {{ job.companyInitials }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-black text-[var(--color-primary-600)]">
            {{ job.categoryLabel }}
          </span>
          <span
            v-if="job.isFeatured"
            class="rounded-[var(--radius-full)] bg-[var(--color-accent-100)] px-2.5 py-1 text-[11px] font-black text-[var(--color-accent-700)]"
          >
            Nổi bật
          </span>
          <span
            v-if="job.isOwner"
            class="rounded-[var(--radius-full)] bg-[var(--color-secondary-100)] px-2.5 py-1 text-[11px] font-black text-[var(--text-secondary)]"
          >
            Của tôi
          </span>
        </div>

        <h3 class="mt-3 line-clamp-2 text-[1.15rem] font-black leading-tight tracking-[-0.035em] text-[var(--text-primary)]">
          {{ job.title }}
        </h3>
        <p class="mt-1 text-[13px] font-bold text-[var(--text-secondary)]">
          {{ job.company }} · {{ job.typeLabel }}
        </p>
      </div>
    </div>

    <p class="mt-4 min-h-[72px] text-[13px] leading-6 text-[var(--text-secondary)]">
      {{ job.description }}
    </p>

    <div class="mt-4 grid gap-2 text-[13px] font-semibold text-[var(--text-secondary)] sm:grid-cols-2">
      <div class="flex items-center gap-2">
        <Icon name="i-ph-map-pin-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
        <span class="truncate">{{ job.location }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="i-ph-money-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
        <span class="truncate">{{ job.salary }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="i-ph-briefcase-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
        <span>{{ job.experience }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="i-ph-users-three-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
        <span>{{ job.applicants }} ứng viên</span>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-1.5">
      <span
        v-for="skill in job.skills"
        :key="skill"
        class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary-600)]"
      >
        #{{ skill }}
      </span>
    </div>

    <div class="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_44px]">
      <button
        class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary-500)] px-4 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
        type="button"
        @click="$emit('apply', job)"
      >
        <Icon name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
        Ứng tuyển
      </button>
      <button
        class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-[var(--border-default)] bg-white px-4 text-[13px] font-extrabold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
        type="button"
        @click="$emit('view', job)"
      >
        Chi tiết
      </button>
      <button
        class="inline-flex h-11 items-center justify-center rounded-[18px] border border-[var(--border-default)] bg-white text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
        type="button"
        @click="$emit('toggleSave', job.id)"
      >
        <Icon :name="saved ? 'i-ph-bookmark-simple-fill' : 'i-ph-bookmark-simple'" class="h-5 w-5" />
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockJob } from "~/composables/useMockJobsData"

defineProps<{
  job: MockJob
  saved: boolean
}>()

defineEmits<{
  apply: [job: MockJob]
  view: [job: MockJob]
  toggleSave: [id: string]
}>()
</script>
