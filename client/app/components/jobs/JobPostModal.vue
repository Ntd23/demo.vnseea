<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-4 backdrop-blur-[2px] sm:items-center"
      @click.self="$emit('close')"
    >
      <form
        class="max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-xl)]"
        @submit.prevent="submit"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-label-secondary text-[var(--color-primary-600)]">
              {{ $t("pages.jobsPage.postEyebrow") }}
            </p>
            <h2 class="mt-1 text-heading text-[var(--text-primary)]">
              {{ $t("pages.jobsPage.postTitle") }}
            </h2>
            <p class="mt-1 text-body-secondary">
              {{ $t("pages.jobsPage.postDescription") }}
            </p>
          </div>
          <button
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--color-secondary-100)] text-[var(--text-secondary)] transition hover:text-[var(--color-primary-600)]"
            type="button"
            @click="$emit('close')"
          >
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.jobsPage.roleTitle") }}</span>
            <input v-model="form.title" required class="job-input mt-2" :placeholder="$t('pages.jobsPage.roleTitlePlaceholder')">
          </label>
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.jobsPage.company") }}</span>
            <input v-model="form.company" required class="job-input mt-2" :placeholder="$t('pages.jobsPage.companyPlaceholder')">
          </label>
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.jobsPage.category") }}</span>
            <select v-model="form.category" class="job-input mt-2">
              <option
                v-for="category in categories.filter(item => item.value !== 'all')"
                :key="category.value"
                :value="category.value"
              >
                {{ category.label }}
              </option>
            </select>
          </label>
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.jobsPage.type") }}</span>
            <select v-model="form.type" class="job-input mt-2">
              <option
                v-for="type in types.filter(item => item.value !== 'all')"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </label>
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.jobsPage.location") }}</span>
            <select v-model="form.locationKey" class="job-input mt-2">
              <option
                v-for="location in locations.filter(item => item.value !== 'all')"
                :key="location.value"
                :value="location.value"
              >
                {{ location.label }}
              </option>
            </select>
          </label>
          <label class="block">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.jobsPage.displayLocation") }}</span>
            <input v-model="form.location" required class="job-input mt-2" :placeholder="$t('pages.jobsPage.displayLocationPlaceholder')">
          </label>
          <label class="block sm:col-span-2">
            <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.jobsPage.salary") }}</span>
            <input v-model="form.salary" required class="job-input mt-2" :placeholder="$t('pages.jobsPage.salaryPlaceholder')">
          </label>
        </div>

        <label class="mt-4 block">
          <span class="text-[12px] font-bold text-[var(--text-secondary)]">{{ $t("pages.jobsPage.jobDescription") }}</span>
          <textarea v-model="form.description" required class="job-input mt-2 min-h-[140px] resize-y py-3" :placeholder="$t('pages.jobsPage.jobDescriptionPlaceholder')" />
        </label>

        <div
          v-if="created"
          class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]"
        >
          {{ $t("pages.jobsPage.postSuccess") }}
        </div>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            class="inline-flex h-11 items-center justify-center rounded-[18px] border border-[var(--border-default)] bg-white px-4 text-[13px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]"
            type="button"
            @click="$emit('close')"
          >
            {{ $t("pages.jobsPage.close") }}
          </button>
          <button
            class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary-500)] px-5 text-[13px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
            type="submit"
          >
            <Icon name="i-ph-briefcase-fill" class="h-4 w-4" />
            {{ $t("pages.jobsPage.postJob") }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { JobCategoryKey, JobLocationKey, JobOption, JobPostPayload, JobTypeKey } from "~/composables/useMockJobsData"

const props = defineProps<{
  open: boolean
  categories: ReadonlyArray<JobOption<"all" | JobCategoryKey>>
  locations: ReadonlyArray<JobOption<JobLocationKey>>
  types: ReadonlyArray<JobOption<JobTypeKey>>
}>()

const emit = defineEmits<{
  close: []
  create: [payload: JobPostPayload]
}>()

const created = ref(false)
const form = reactive<JobPostPayload>({
  title: "",
  company: "",
  category: "engineering",
  locationKey: "ho-chi-minh",
  location: "",
  type: "full-time",
  salary: "",
  description: "",
})

watch(() => props.open, (open) => {
  if (open) created.value = false
})

const submit = () => {
  created.value = true
  emit("create", { ...form })
}
</script>

<style scoped>
.job-input {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: var(--color-secondary-100);
  padding: 0 14px;
  min-height: 46px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: all var(--duration-fast) var(--ease-default);
}

.job-input:focus {
  border-color: var(--color-primary-200);
  background: var(--bg-surface);
  box-shadow: 0 0 0 4px var(--bg-surface-active);
}
</style>
