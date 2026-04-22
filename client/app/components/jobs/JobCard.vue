  <article class="surface-card group overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ring-1 ring-secondary-200/50 hover:ring-primary-500/20 relative">
    <div class="h-1.5 w-full bg-gradient-to-r from-primary-400 to-primary-600 shadow-sm" />

    <div class="p-6 space-y-6 bg-white">
      <div class="flex items-start gap-4">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[15px] font-black text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-primary-500/20"
          :style="{ background: job.companyGradient }"
        >
          {{ job.companyInitials }}
        </div>
        <div class="min-w-0 flex-1 space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-xl bg-primary-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary-600 ring-1 ring-primary-100">
              {{ job.categoryLabel }}
            </span>
            <span
              v-if="job.isFeatured"
              class="rounded-xl bg-orange-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-orange-600 ring-1 ring-orange-100"
            >
              {{ $t("pages.jobsPage.featuredBadge") }}
            </span>
            <span
              v-if="job.isOwner"
              class="rounded-xl bg-secondary-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-secondary-500 ring-1 ring-secondary-100"
            >
              {{ $t("pages.jobsPage.myBadge") }}
            </span>
          </div>

          <div class="space-y-1">
            <h3 class="line-clamp-2 text-xl font-black tracking-tight text-secondary-900 group-hover:text-primary-600 transition-colors leading-tight">
              {{ job.title }}
            </h3>
            <p class="text-[11px] font-black uppercase tracking-widest text-secondary-500">
              {{ job.company }} <span class="mx-1 text-secondary-300">·</span> {{ job.typeLabel }}
            </p>
          </div>
        </div>
      </div>

      <p class="text-[13px] font-medium leading-relaxed text-secondary-600 line-clamp-3 min-h-[3.75rem] px-1 italic">
        "{{ job.description }}"
      </p>

      <div class="grid gap-3 text-[11px] font-black uppercase tracking-widest text-secondary-500 sm:grid-cols-2 bg-secondary-50/50 p-4 rounded-2xl ring-1 ring-secondary-100">
        <div class="flex items-center gap-2.5 px-1 truncate">
          <Icon name="i-ph-map-pin-duotone" class="h-4.5 w-4.5 text-primary-500 shrink-0" />
          <span class="truncate">{{ job.location }}</span>
        </div>
        <div class="flex items-center gap-2.5 px-1 truncate">
          <Icon name="i-ph-money-duotone" class="h-4.5 w-4.5 text-primary-500 shrink-0" />
          <span class="truncate">{{ job.salary }}</span>
        </div>
        <div class="flex items-center gap-2.5 px-1 truncate">
          <Icon name="i-ph-briefcase-duotone" class="h-4.5 w-4.5 text-primary-500 shrink-0" />
          <span class="truncate">{{ job.experience }}</span>
        </div>
        <div class="flex items-center gap-2.5 px-1 truncate">
          <Icon name="i-ph-users-three-duotone" class="h-4.5 w-4.5 text-primary-500 shrink-0" />
          <span class="truncate">{{ $t("pages.jobsPage.applicantCount", { count: job.applicants }) }}</span>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 pt-2 px-1">
        <span
          v-for="skill in job.skills"
          :key="skill"
          class="inline-flex items-center rounded-lg border border-secondary-100 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary-600 hover:border-primary-100 cursor-default"
        >
          #{{ skill }}
        </span>
      </div>

      <div class="flex flex-col gap-3 pt-4 sm:flex-row border-t border-secondary-50">
        <UButton
          size="xl"
          class="flex-1 h-11 rounded-2xl bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 border-none"
          @click="$emit('apply', job)"
        >
          <template #leading>
            <Icon name="i-ph-paper-plane-tilt-duotone" class="h-4.5 w-4.5" />
          </template>
          {{ $t("pages.jobsPage.applyNow") }}
        </UButton>

        <UButton
          variant="soft"
          size="xl"
          class="flex-1 h-11 rounded-2xl bg-secondary-50 text-secondary-600 ring-1 ring-secondary-100 hover:bg-white hover:text-primary-600 hover:border-primary-100 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
          @click="$emit('view', job)"
        >
          {{ $t("pages.jobsPage.viewDetails") }}
        </UButton>

        <button
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-500 ring-1 ring-secondary-100 transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100 active:scale-95"
          type="button"
          @click="$emit('toggleSave', job.id)"
        >
          <Icon :name="saved ? 'i-ph-bookmark-simple-fill' : 'i-ph-bookmark-simple-duotone'" class="h-5 w-5" />
        </button>
      </div>
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
