<template>
  <FoundationModalShell
    :open="Boolean(job)"
    :title="modalTitle"
    :description="modalDescription"
    size="lg"
    :status="submitStatus"
    :status-title="statusTitle"
    :status-description="statusDescription"
    body-class="space-y-5"
    @close="emit('close')"
  >
    <UForm :state="form" class="space-y-5" @submit="submit">
      <div class="space-y-2">
        <p class="text-label-secondary text-[var(--text-primary)]">
          {{ $t("pages.jobsPage.applyEyebrow") }}
        </p>
        <p class="text-body-secondary">
          {{ $t("pages.jobsPage.applyHelper") }}
        </p>
      </div>

      <UCard
        v-if="job"
        class="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)]"
        :ui="{ body: 'p-4' }"
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
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[11px] font-semibold">
                {{ job.location }}
              </UBadge>
            </div>

            <h3 class="mt-4 text-lg font-black tracking-[-0.03em] text-[var(--text-primary)]">
              {{ job.title }}
            </h3>
            <p class="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
              {{ job.company }} · {{ job.typeLabel }}
            </p>
          </div>
        </div>
      </UCard>

      <div class="grid gap-5 sm:grid-cols-2">
        <UFormField
          name="name"
          :label="$t('pages.jobsPage.fullName')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.name || undefined"
        >
          <UInput
            v-model="form.name"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            :placeholder="$t('pages.jobsPage.fullNamePlaceholder')"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>

        <UFormField
          name="email"
          :label="$t('pages.jobsPage.email')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.email || undefined"
        >
          <UInput
            v-model="form.email"
            type="email"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            placeholder="email@example.com"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>

        <UFormField
          name="phone"
          :label="$t('pages.jobsPage.phone')"
          required
          size="xl"
          class="space-y-2"
          :error="fieldErrors.phone || undefined"
        >
          <UInput
            v-model="form.phone"
            type="tel"
            size="xl"
            color="primary"
            class="w-full"
            :disabled="isBusy"
            :placeholder="$t('pages.jobsPage.phonePlaceholder')"
            :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
          />
        </UFormField>

        <UFormField
          name="cvName"
          :label="$t('pages.jobsPage.cvUpload')"
          size="xl"
          class="space-y-2"
        >
          <div class="rounded-[22px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm font-semibold text-[var(--text-primary)]">
                  {{ form.cvName || $t("pages.jobsPage.cvPlaceholder") }}
                </p>
                <p class="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  {{ $t("pages.jobsPage.cvHelper") }}
                </p>
              </div>

              <input
                ref="fileInput"
                class="sr-only"
                type="file"
                accept=".pdf,.doc,.docx"
                :disabled="isBusy"
                @change="setCvName"
              >

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                class="justify-center rounded-full"
                :disabled="isBusy"
                @click="fileInput?.click()"
              >
                <Icon name="i-ph-paperclip" class="mr-1.5 h-4 w-4" />
                {{ $t("pages.jobsPage.selectCv") }}
              </UButton>
            </div>
          </div>
        </UFormField>
      </div>

      <UFormField
        name="message"
        :label="$t('pages.jobsPage.message')"
        required
        size="xl"
        class="space-y-2"
        :error="fieldErrors.message || undefined"
      >
        <UTextarea
          v-model="form.message"
          autoresize
          :rows="6"
          size="xl"
          color="primary"
          class="w-full"
          :disabled="isBusy"
          :placeholder="$t('pages.jobsPage.messagePlaceholder')"
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
          :disabled="isBusy || !job"
        >
          <Icon name="i-ph-paper-plane-tilt-fill" class="mr-1.5 h-4 w-4" />
          {{ $t("pages.jobsPage.submitApplication") }}
        </UButton>
      </div>
    </UForm>
  </FoundationModalShell>
</template>

<script setup lang="ts">
import type { JobApplicationPayload, MockJob } from "../../application/composables/useMockJobsData"
import FoundationModalShell from "../../../foundation/presentation/components/ModalShell.vue"

type ApplyStatus = "idle" | "loading" | "success" | "error"

type ApplyFormState = {
  name: string
  email: string
  phone: string
  message: string
  cvName: string
}

const props = defineProps<{
  job?: MockJob | null
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: JobApplicationPayload]
}>()

const { t } = useI18n()
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive<ApplyFormState>({
  name: "",
  email: "",
  phone: "",
  message: "",
  cvName: "",
})

const fieldErrors = reactive<Record<keyof ApplyFormState, string>>({
  name: "",
  email: "",
  phone: "",
  message: "",
  cvName: "",
})

const submitStatus = ref<ApplyStatus>("idle")
const isBusy = computed(() => submitStatus.value === "loading")

const modalTitle = computed(() => {
  if (!props.job) return t("pages.jobsPage.applyTitle")

  return t("pages.jobsPage.applyTitleJob", {
    title: props.job.title,
  })
})

const modalDescription = computed(() => {
  if (!props.job) return t("pages.jobsPage.applyDescription")

  return t("pages.jobsPage.applyDescriptionJob", {
    company: props.job.company,
  })
})

const statusTitle = computed(() => {
  if (submitStatus.value === "loading") return t("pages.jobsPage.applyStatusLoadingTitle")
  if (submitStatus.value === "success") return t("pages.jobsPage.applyStatusSuccessTitle")
  if (submitStatus.value === "error") return t("pages.jobsPage.applyStatusErrorTitle")
  return ""
})

const statusDescription = computed(() => {
  if (submitStatus.value === "loading") return t("pages.jobsPage.applyStatusLoadingDescription")
  if (submitStatus.value === "success") return t("pages.jobsPage.applyStatusSuccessDescription")
  if (submitStatus.value === "error") return t("pages.jobsPage.applyStatusErrorDescription")
  return ""
})

watch(
  () => props.job?.id,
  () => {
    resetForm()
    clearErrors()
    submitStatus.value = "idle"
  },
  { immediate: true },
)

watch(
  () => [form.name, form.email, form.phone, form.message, form.cvName],
  () => {
    if (submitStatus.value !== "loading") {
      submitStatus.value = "idle"
    }

    clearErrors()
  },
)

function setCvName(event: Event) {
  const input = event.target as HTMLInputElement | null
  form.cvName = input?.files?.[0]?.name ?? ""
}

async function submit() {
  if (!props.job) return

  clearErrors()

  if (form.name.trim().length < 2) {
    fieldErrors.name = t("pages.jobsPage.fullNameError")
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = t("pages.jobsPage.emailError")
  }

  if (form.phone.trim().length < 8) {
    fieldErrors.phone = t("pages.jobsPage.phoneError")
  }

  if (form.message.trim().length < 20) {
    fieldErrors.message = t("pages.jobsPage.messageError")
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    submitStatus.value = "error"
    return
  }

  submitStatus.value = "loading"

  await new Promise(resolve => setTimeout(resolve, 320))

  if (!props.job) return

  const payload: JobApplicationPayload = {
    jobId: props.job.id,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    message: form.message.trim(),
    cvName: form.cvName.trim(),
  }

  emit("submit", payload)
  submitStatus.value = "success"

  toast.add({
    title: t("pages.jobsPage.applyToastTitle"),
    description: t("pages.jobsPage.applyToastDescription", {
      title: props.job.title,
    }),
    color: "success",
    icon: "i-ph-check-circle-fill",
  })

  setTimeout(() => {
    emit("close")
  }, 220)
}

function clearErrors() {
  fieldErrors.name = ""
  fieldErrors.email = ""
  fieldErrors.phone = ""
  fieldErrors.message = ""
  fieldErrors.cvName = ""
}

function resetForm() {
  form.name = ""
  form.email = ""
  form.phone = ""
  form.message = ""
  form.cvName = ""

  if (fileInput.value) {
    fileInput.value.value = ""
  }
}
</script>
