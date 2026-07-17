// English description: Owns shared backend-backed create and edit event form state, validation, preview, and submission.

import type { FormError, FormSubmitEvent } from "@nuxt/ui"
import type { Ref } from "vue"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { createApiEventsRepository } from "../../infrastructure/repositories/ApiEventsRepository"
import type { EventCreateDraft, EventRecord } from "../../domain/types/events.types"

export function useCreateEventPageVM(
  initialEvent: Readonly<Ref<EventRecord | null | undefined>> = ref(null),
  repository = createApiEventsRepository(),
) {
  const { t } = useI18n()
  const toast = useToast()

  const form = reactive<EventCreateDraft>({
    name: "",
    location: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    coverFile: null,
  })

  const coverPreviewUrl = ref("")
  const coverObjectUrl = ref("")
  const submitting = ref(false)
  const submitError = ref("")
  const isEditing = computed(() => Boolean(initialEvent.value?.id))

  watch(
    initialEvent,
    (event) => {
      if (!event) return

      Object.assign(form, {
        name: event.name,
        location: event.location,
        description: event.description,
        startDate: event.startDateValue,
        startTime: event.startTime,
        endDate: event.endDateValue,
        endTime: event.endTime,
        coverFile: null,
      })
      coverPreviewUrl.value = event.coverUrl
    },
    { immediate: true },
  )

  const dateRangeLabel = computed(() => {
    const start = [form.startDate, form.startTime].filter(Boolean).join(" • ")
    const end = [form.endDate, form.endTime].filter(Boolean).join(" • ")

    if (!start && !end) return ""
    if (!end || start === end) return start
    return `${start} → ${end}`
  })

  const validate = (state: EventCreateDraft): FormError[] => {
    const errors: FormError[] = []

    if (state.name.trim().length < 5) {
      errors.push({ name: "name", message: t("pages.createEventPage.validationTitleRequired") })
    }

    if (state.location.trim().length < 3) {
      errors.push({ name: "location", message: t("pages.createEventPage.validationLocationRequired") })
    }

    if (state.description.trim().length < 10) {
      errors.push({ name: "description", message: t("pages.createEventPage.validationDescriptionRequired") })
    }

    if (!state.startDate) {
      errors.push({ name: "startDate", message: t("pages.createEventPage.validationStartRequired") })
    }

    if (!state.startTime) {
      errors.push({ name: "startTime", message: t("pages.createEventPage.validationStartRequired") })
    }

    if (!state.endDate) {
      errors.push({ name: "endDate", message: t("pages.createEventPage.validationEndRequired") })
    }

    if (!state.endTime) {
      errors.push({ name: "endTime", message: t("pages.createEventPage.validationEndRequired") })
    }

    if (state.startDate && state.startTime && state.endDate && state.endTime) {
      const start = new Date(`${state.startDate}T${state.startTime}`)
      const end = new Date(`${state.endDate}T${state.endTime}`)

      if (Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end < start) {
        errors.push({ name: "endDate", message: t("pages.createEventPage.validationDateOrder") })
      }
    }

    return errors
  }

  const onCoverChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] || null

    form.coverFile = file
    submitError.value = ""

    if (coverObjectUrl.value) {
      URL.revokeObjectURL(coverObjectUrl.value)
      coverObjectUrl.value = ""
    }

    if (file) {
      coverObjectUrl.value = URL.createObjectURL(file)
      coverPreviewUrl.value = coverObjectUrl.value
    }
    else {
      coverPreviewUrl.value = initialEvent.value?.coverUrl || ""
    }
  }

  const submit = async (_event: FormSubmitEvent<EventCreateDraft>) => {
    const errors = validate(form)

    if (errors.length > 0) {
      submitError.value = errors[0]?.message || t("pages.createEventPage.statusErrorDescription")
      return
    }

    submitting.value = true
    submitError.value = ""

    try {
      const currentEvent = initialEvent.value
      const savedEvent = currentEvent?.id
        ? await repository.updateEvent(currentEvent.id, form)
        : await repository.createEvent(form)

      toast.add({
        color: "success",
        icon: "i-ph-check-circle-fill",
        title: savedEvent.name,
        description: currentEvent?.id
          ? t("pages.createEventPage.updateComplete")
          : t("pages.createEventPage.publishComplete"),
      })

      await navigateTo(appRoutes.eventDetail(savedEvent.id))
    }
    catch (error) {
      submitError.value = error instanceof Error
        ? error.message
        : t("pages.createEventPage.statusErrorDescription")
    }
    finally {
      submitting.value = false
    }
  }

  onUnmounted(() => {
    if (coverObjectUrl.value) {
      URL.revokeObjectURL(coverObjectUrl.value)
    }
  })

  return {
    form,
    isEditing,
    coverPreviewUrl,
    dateRangeLabel,
    submitting,
    submitError,
    validate,
    onCoverChange,
    submit,
  }
}
