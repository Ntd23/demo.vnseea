<template>
  <FoundationModalShell
    :open="open"
    :title="$t('pages.jobsPage.postTitle')"
    :description="$t('pages.jobsPage.postDescription')"
    size="xl"
    :status="submitStatus"
    :status-title="statusTitle"
    :status-description="statusDescription"
    body-class="space-y-5"
    @close="emit('close')"
  >
    <UForm :state="form" class="space-y-5" @submit="submit">
      <div class="space-y-2">
        <p class="text-label-secondary text-[var(--text-primary)]">
          {{ $t("pages.jobsPage.postEyebrow") }}
        </p>
        <p class="text-body-secondary">
          {{ $t("pages.jobsPage.postHelper") }}
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <UFormField
          name="title"
          :label="$t('pages.jobsPage.roleTitle')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.title || undefined"
        >
          <UInput
            v-model="form.title"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            :placeholder="$t('pages.jobsPage.roleTitlePlaceholder')"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>

        <UFormField
          name="company"
          :label="$t('pages.jobsPage.company')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.company || undefined"
        >
          <UInput
            v-model="form.company"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            :placeholder="$t('pages.jobsPage.companyPlaceholder')"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>

        <UFormField
          name="category"
          :label="$t('pages.jobsPage.category')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.category || undefined"
        >
          <USelect
            v-model="form.category"
            :items="categoryOptions"
            value-key="value"
            label-key="label"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>

        <UFormField
          name="type"
          :label="$t('pages.jobsPage.type')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.type || undefined"
        >
          <USelect
            v-model="form.type"
            :items="typeOptions"
            value-key="value"
            label-key="label"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>

        <UFormField
          name="locationKey"
          :label="$t('pages.jobsPage.location')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.locationKey || undefined"
        >
          <USelect
            v-model="form.locationKey"
            :items="locationOptions"
            value-key="value"
            label-key="label"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>

        <UFormField
          name="location"
          :label="$t('pages.jobsPage.displayLocation')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.location || undefined"
        >
          <UInput
            v-model="form.location"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            :placeholder="$t('pages.jobsPage.displayLocationPlaceholder')"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>
      </div>

      <UFormField
        name="salary"
        :label="$t('pages.jobsPage.salary')"
        required
        size="xl"
        class="space-y-2"
        :error="fieldErrors.salary || undefined"
      >
        <UInput
          v-model="form.salary"
          size="xl"
          color="primary"
          class="w-full"
          :disabled="isBusy"
          :placeholder="$t('pages.jobsPage.salaryPlaceholder')"
          :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="$t('pages.jobsPage.jobDescription')"
        required
        size="xl"
        class="space-y-2"
        :error="fieldErrors.description || undefined"
      >
        <UTextarea
          v-model="form.description"
          autoresize
          :rows="6"
          size="xl"
          color="primary"
          class="w-full"
          :disabled="isBusy"
          :placeholder="$t('pages.jobsPage.jobDescriptionPlaceholder')"
          :ui="{ base: 'min-h-[180px] rounded-[20px] px-4 py-3 text-[14px] leading-7' }"
        />
      </UFormField>

      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          size="lg"
          class="justify-center rounded-full"
          :disabled="isBusy"
          @click="emit('close')"
        >
          {{ $t("pages.jobsPage.close") }}
        </UButton>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          class="justify-center rounded-full"
          :loading="isBusy"
          :disabled="isBusy"
        >
          <Icon name="i-ph-briefcase-fill" class="mr-1.5 h-4 w-4" />
          {{ $t("pages.jobsPage.postJob") }}
        </UButton>
      </div>
    </UForm>
  </FoundationModalShell>
</template>

<script setup lang="ts">
import type { JobCategoryKey, JobLocationKey, JobOption, JobPostPayload, JobTypeKey } from "~/composables/useMockJobsData"

type PostStatus = "idle" | "loading" | "success" | "error"

type PostFormState = JobPostPayload

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

const { t } = useI18n()
const toast = useToast()

const categoryOptions = computed(() =>
  props.categories.filter(item => item.value !== "all") as JobOption<JobCategoryKey>[],
)

const locationOptions = computed(() =>
  props.locations.filter(item => item.value !== "all") as JobOption<Exclude<JobLocationKey, "all">>[],
)

const typeOptions = computed(() =>
  props.types.filter(item => item.value !== "all") as JobOption<Exclude<JobTypeKey, "all">>[],
)

const form = reactive<PostFormState>({
  title: "",
  company: "",
  category: "engineering",
  locationKey: "ho-chi-minh",
  location: "",
  type: "full-time",
  salary: "",
  description: "",
})

const fieldErrors = reactive<Record<keyof PostFormState, string>>({
  title: "",
  company: "",
  category: "",
  locationKey: "",
  location: "",
  type: "",
  salary: "",
  description: "",
})

const submitStatus = ref<PostStatus>("idle")
const isBusy = computed(() => submitStatus.value === "loading")

const statusTitle = computed(() => {
  if (submitStatus.value === "loading") return t("pages.jobsPage.postStatusLoadingTitle")
  if (submitStatus.value === "success") return t("pages.jobsPage.postStatusSuccessTitle")
  if (submitStatus.value === "error") return t("pages.jobsPage.postStatusErrorTitle")
  return ""
})

const statusDescription = computed(() => {
  if (submitStatus.value === "loading") return t("pages.jobsPage.postStatusLoadingDescription")
  if (submitStatus.value === "success") return t("pages.jobsPage.postStatusSuccessDescription")
  if (submitStatus.value === "error") return t("pages.jobsPage.postStatusErrorDescription")
  return ""
})

watch(
  () => props.open,
  (open) => {
    if (!open) {
      submitStatus.value = "idle"
      clearErrors()
      return
    }

    resetForm()
    clearErrors()
    submitStatus.value = "idle"
  },
)

watch(
  () => [form.title, form.company, form.category, form.locationKey, form.location, form.type, form.salary, form.description],
  () => {
    if (submitStatus.value !== "loading") {
      submitStatus.value = "idle"
    }

    clearErrors()
  },
)

async function submit() {
  clearErrors()

  if (form.title.trim().length < 4) {
    fieldErrors.title = t("pages.jobsPage.roleTitleError")
  }

  if (form.company.trim().length < 2) {
    fieldErrors.company = t("pages.jobsPage.companyError")
  }

  if (form.location.trim().length < 2) {
    fieldErrors.location = t("pages.jobsPage.displayLocationError")
  }

  if (form.salary.trim().length < 3) {
    fieldErrors.salary = t("pages.jobsPage.salaryError")
  }

  if (form.description.trim().length < 40) {
    fieldErrors.description = t("pages.jobsPage.jobDescriptionError")
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    submitStatus.value = "error"
    return
  }

  submitStatus.value = "loading"

  await new Promise(resolve => setTimeout(resolve, 360))

  emit("create", {
    title: form.title.trim(),
    company: form.company.trim(),
    category: form.category,
    locationKey: form.locationKey,
    location: form.location.trim(),
    type: form.type,
    salary: form.salary.trim(),
    description: form.description.trim(),
  })

  submitStatus.value = "success"

  toast.add({
    title: t("pages.jobsPage.postToastTitle"),
    description: t("pages.jobsPage.postToastDescription", {
      title: form.title.trim(),
    }),
    color: "success",
    icon: "i-ph-check-circle-fill",
  })

  setTimeout(() => {
    emit("close")
  }, 220)
}

function clearErrors() {
  fieldErrors.title = ""
  fieldErrors.company = ""
  fieldErrors.category = ""
  fieldErrors.locationKey = ""
  fieldErrors.location = ""
  fieldErrors.type = ""
  fieldErrors.salary = ""
  fieldErrors.description = ""
}

function resetForm() {
  form.title = ""
  form.company = ""
  form.category = categoryOptions.value[0]?.value ?? "engineering"
  form.locationKey = locationOptions.value[0]?.value ?? "ho-chi-minh"
  form.location = ""
  form.type = typeOptions.value[0]?.value ?? "full-time"
  form.salary = ""
  form.description = ""
}
</script>
