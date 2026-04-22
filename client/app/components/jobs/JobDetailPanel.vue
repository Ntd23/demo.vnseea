<template>
  <aside class="space-y-6">
    <section class="surface-card p-6 sm:p-8 ring-1 ring-secondary-200/50 shadow-2xl bg-white/80 backdrop-blur-xl space-y-8 group/detail rounded-2xl">
      <div class="flex items-start gap-4 border-b border-secondary-50 pb-8 rounded-b-none">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[15px] font-black text-white shadow-xl transition-transform duration-500 group-hover/detail:scale-110 shadow-primary-500/20"
          :style="{ background: job.companyGradient }"
        >
          {{ job.companyInitials }}
        </div>
        <div class="min-w-0 space-y-1">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
            {{ $t("pages.jobsPage.detailEyebrow") }}
          </p>
          <h2 class="text-2xl font-black tracking-tight text-secondary-900 leading-tight">
            {{ job.title }}
          </h2>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-400">
            {{ job.company }} <span class="mx-1.5 text-secondary-300">·</span> {{ job.postedAt }}
          </p>
        </div>
      </div>

      <div class="grid gap-3 text-[11px] font-black uppercase tracking-widest text-secondary-500">
        <div class="flex items-center gap-3 rounded-xl bg-secondary-50/50 px-4 py-3 ring-1 ring-secondary-100 transition-colors hover:bg-white hover:ring-primary-100/50 group/row">
          <Icon name="i-ph-map-pin-duotone" class="h-5 w-5 text-primary-500 transition-transform group-hover/row:scale-110" />
          {{ job.location }}
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-secondary-50/50 px-4 py-3 ring-1 ring-secondary-100 transition-colors hover:bg-white hover:ring-primary-100/50 group/row">
          <Icon name="i-ph-money-duotone" class="h-5 w-5 text-primary-500 transition-transform group-hover/row:scale-110" />
          {{ job.salary }}
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-secondary-50/50 px-4 py-3 ring-1 ring-secondary-100 transition-colors hover:bg-white hover:ring-primary-100/50 group/row">
          <Icon name="i-ph-calendar-check-duotone" class="h-5 w-5 text-primary-500 transition-transform group-hover/row:scale-110" />
          {{ $t("pages.jobsPage.deadlineLabel", { date: job.deadline }) }}
        </div>
      </div>

      <p class="text-[14px] font-medium leading-relaxed text-secondary-600 px-1 italic">
        "{{ job.description }}"
      </p>

      <div class="flex flex-wrap gap-2 px-1">
        <span
          v-for="skill in job.skills"
          :key="skill"
          class="inline-flex items-center rounded-lg border border-secondary-100 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary-600"
        >
          #{{ skill }}
        </span>
      </div>

      <UButton
        size="xl"
        class="w-full h-14 rounded-2xl bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary-500/30 transition-all hover:bg-primary-700 active:scale-95 border-none"
        @click="$emit('apply', job)"
      >
        <template #leading>
          <Icon name="i-ph-paper-plane-tilt-duotone" class="h-5 w-5" />
        </template>
        {{ $t("pages.jobsPage.applyThisJob") }}
      </UButton>
    </section>

    <section class="surface-card p-6 sm:p-8 ring-1 ring-secondary-200/50 shadow-xl bg-white space-y-6">
      <div class="space-y-1">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("pages.jobsPage.requirements") }}
        </p>
        <h3 class="text-lg font-black tracking-tight text-secondary-900">{{ $t("pages.jobsPage.whatWeNeed") }}</h3>
      </div>
      <ul class="space-y-4">
        <li
          v-for="item in job.requirements"
          :key="item"
          class="flex gap-3 text-[13px] font-medium leading-relaxed text-secondary-600 group/item"
        >
          <Icon name="i-ph-check-circle-duotone" class="mt-1 h-5 w-5 shrink-0 text-emerald-500 transition-transform group-hover/item:scale-110" />
          <span class="pt-0.5">{{ item }}</span>
        </li>
      </ul>
    </section>

    <section class="surface-card p-6 sm:p-8 ring-1 ring-secondary-200/50 shadow-xl bg-white space-y-6">
      <div class="space-y-1">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500 pl-1">
          {{ $t("pages.jobsPage.benefits") }}
        </p>
        <h3 class="text-lg font-black tracking-tight text-secondary-900">{{ $t("pages.jobsPage.whyJoinUs") }}</h3>
      </div>
      <ul class="space-y-4">
        <li
          v-for="item in job.benefits"
          :key="item"
          class="flex gap-3 text-[13px] font-medium leading-relaxed text-secondary-600 group/item"
        >
          <Icon name="i-ph-gift-duotone" class="mt-1 h-5 w-5 shrink-0 text-orange-500 transition-transform group-hover/item:scale-110" />
          <span class="pt-0.5">{{ item }}</span>
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
