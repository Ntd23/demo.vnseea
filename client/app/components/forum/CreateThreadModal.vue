<template>
  <UModal
    :open="open"
    :title="t('pages.forumPage.modalTitle')"
    class="sm:max-w-2xl"
    @update:open="handleOpenChange"
  >
    <template #body>
      <UForm :state="form" class="space-y-5" @submit="submit">
        <div class="space-y-2">
          <p class="text-label-secondary text-[var(--color-primary-600)]">
            {{ t("pages.forumPage.modalEyebrow") }}
          </p>
          <p class="text-body-secondary">
            {{ t("pages.forumPage.modalDescription") }}
          </p>
        </div>

        <UAlert
          v-if="statusAlert"
          :color="statusAlert.color"
          variant="subtle"
          :icon="statusAlert.icon"
          :title="statusAlert.title"
          :description="statusAlert.description"
          class="rounded-[22px]"
          aria-live="polite"
        />

        <div class="grid gap-4">
          <UFormField
            name="title"
            :label="t('pages.forumPage.modalTitleLabel')"
            required
            size="xl"
            class="space-y-2"
            :error="fieldErrors.title || undefined"
          >
            <UInput
              v-model="form.title"
              :placeholder="t('pages.forumPage.modalTitlePlaceholder')"
              :disabled="isBusy"
              color="primary"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="section"
            :label="t('pages.forumPage.modalSectionLabel')"
            required
            size="xl"
            class="space-y-2"
            :error="fieldErrors.section || undefined"
          >
            <USelect
              v-model="form.section"
              :items="sectionOptions"
              value-key="value"
              label-key="label"
              :disabled="isBusy || sectionOptions.length === 0"
              color="primary"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="message"
            :label="t('pages.forumPage.modalMessageLabel')"
            required
            size="xl"
            class="space-y-2"
            :error="fieldErrors.message || undefined"
          >
            <UTextarea
              v-model="form.message"
              autoresize
              :rows="6"
              :placeholder="t('pages.forumPage.modalMessagePlaceholder')"
              :disabled="isBusy"
              color="primary"
              size="xl"
              class="w-full"
              :ui="{
                base: 'min-h-[160px] resize-y rounded-[20px] border-[var(--border-default)] bg-[var(--bg-surface-hover)] px-4 py-3 text-[14px] leading-6 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
              }"
            />
          </UFormField>
        </div>

        <div class="flex flex-col gap-3 rounded-[22px] bg-[var(--bg-surface-hover)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[12px] font-semibold leading-5 text-[var(--text-secondary)]">
            {{ t("pages.forumPage.modalHelper") }}
          </p>
          <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
            {{ t("pages.forumPage.modalCharCount", { count: form.message.trim().length }) }}
          </UBadge>
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            size="lg"
            class="rounded-full"
            :disabled="isBusy"
            @click="emit('close')"
          >
            {{ t("pages.forumPage.modalClose") }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="rounded-full"
            :loading="isBusy"
            :disabled="isBusy || sectionOptions.length === 0"
          >
            {{ t("pages.forumPage.modalSubmit") }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ForumSection, ForumSectionKey, ForumThreadPayload } from "~/composables/useMockForumData"

type ModalSubmitStatus = "idle" | "loading" | "success" | "error"

const props = defineProps<{
  open: boolean
  sections: ReadonlyArray<ForumSection>
  defaultSection?: Exclude<ForumSectionKey, "all">
}>()

const { t } = useI18n()
const toast = useToast()

const emit = defineEmits<{
  close: []
  create: [payload: ForumThreadPayload]
}>()

const form = reactive<ForumThreadPayload>({
  title: "",
  section: "support",
  message: "",
})

const fieldErrors = reactive<Record<keyof ForumThreadPayload, string>>({
  title: "",
  section: "",
  message: "",
})

const submitStatus = ref<ModalSubmitStatus>("idle")

const sectionOptions = computed(() =>
  props.sections
    .filter(section => section.value !== "all")
    .map(section => ({
      label: section.label,
      value: section.value,
    })),
)

const resolvedDefaultSection = computed<Exclude<ForumSectionKey, "all">>(() => {
  if (props.defaultSection) return props.defaultSection
  return sectionOptions.value[0]?.value ?? "support"
})

const isBusy = computed(() => submitStatus.value === "loading")

const statusAlert = computed(() => {
  if (submitStatus.value === "idle") return null

  if (submitStatus.value === "loading") {
    return {
      color: "primary" as const,
      icon: "i-ph-spinner-gap-bold",
      title: t("pages.forumPage.modalStatusLoadingTitle"),
      description: t("pages.forumPage.modalStatusLoadingDescription"),
    }
  }

  if (submitStatus.value === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("pages.forumPage.modalStatusSuccessTitle"),
      description: t("pages.forumPage.modalStatusSuccessDescription"),
    }
  }

  return {
    color: "warning" as const,
    icon: "i-ph-warning-circle-fill",
    title: t("pages.forumPage.modalStatusErrorTitle"),
    description: t("pages.forumPage.modalStatusErrorDescription"),
  }
})

watch(
  () => props.open,
  (open) => {
    if (!open) {
      clearErrors()
      submitStatus.value = "idle"
      return
    }

    resetForm()
  },
)

watch(
  () => [form.title, form.section, form.message],
  () => {
    if (submitStatus.value !== "loading") {
      submitStatus.value = "idle"
    }

    clearErrors()
  },
)

function handleOpenChange(nextOpen: boolean) {
  if (!nextOpen) {
    emit("close")
  }
}

function clearErrors() {
  fieldErrors.title = ""
  fieldErrors.section = ""
  fieldErrors.message = ""
}

function resetForm() {
  form.title = ""
  form.section = resolvedDefaultSection.value
  form.message = ""
  clearErrors()
  submitStatus.value = "idle"
}

function validateForm() {
  clearErrors()

  const title = form.title.trim()
  const message = form.message.trim()

  form.title = title
  form.message = message

  if (title.length < 8) {
    fieldErrors.title = t("pages.forumPage.modalTitleError")
  }

  if (!sectionOptions.value.some(option => option.value === form.section)) {
    fieldErrors.section = t("pages.forumPage.modalSectionError")
  }

  if (message.length < 20) {
    fieldErrors.message = t("pages.forumPage.modalMessageError")
  }

  return !fieldErrors.title && !fieldErrors.section && !fieldErrors.message
}

async function submit() {
  if (!validateForm()) {
    submitStatus.value = "error"
    return
  }

  submitStatus.value = "loading"

  await new Promise(resolve => setTimeout(resolve, 240))

  emit("create", {
    title: form.title,
    section: form.section,
    message: form.message,
  })

  submitStatus.value = "success"

  toast.add({
    color: "success",
    icon: "i-ph-check-circle-fill",
    title: t("pages.forumPage.modalStatusSuccessTitle"),
    description: t("pages.forumPage.modalStatusSuccessDescription"),
  })
}
</script>
