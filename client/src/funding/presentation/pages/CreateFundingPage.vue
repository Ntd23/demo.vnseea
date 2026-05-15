<!-- English description: Backend-backed funding creation form aligned to the WoWonder create_funding flow. -->
<template>
  <main class="mx-auto w-full max-w-3xl space-y-5 px-3 py-4 sm:px-5">
    <section class="surface-card p-4 sm:p-5">
      <p class="text-label-secondary">Funding</p>
      <h1 class="text-heading mt-1">{{ t("pages.createFundingPage.heroTitle") }}</h1>
    </section>

    <UForm :state="draft" class="surface-card space-y-4 p-4 sm:p-5" @submit="submit">
      <UFormField :label="t('pages.createFundingPage.formTitleLabel')" name="title" required>
        <UInput v-model="draft.title" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.createFundingPage.goalLabel')" name="amount" required>
        <UInput v-model.number="draft.amount" type="number" min="1" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.createFundingPage.descriptionLabel')" name="description" required>
        <UTextarea v-model="draft.description" :rows="7" class="w-full" />
      </UFormField>

      <UFormField :label="t('pages.createFundingPage.imageLabel')" name="image" required>
        <UInput type="file" accept="image/*" class="w-full" @change="onFileChange" />
      </UFormField>

      <div class="flex justify-end gap-2">
        <UButton to="/funding" color="neutral" variant="soft" class="rounded-[var(--radius-full)]">
          {{ t("pages.createFundingPage.backToFunding") }}
        </UButton>
        <UButton type="submit" color="primary" class="rounded-[var(--radius-full)]" :loading="submitting">
          {{ t("pages.createFundingPage.submitButton") }}
        </UButton>
      </div>
    </UForm>
  </main>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const submitting = ref(false)
const imageFile = ref<File | null>(null)
const draft = reactive({
  title: "",
  amount: null as number | null,
  description: "",
})

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  imageFile.value = input.files?.[0] ?? null
}

const submit = async () => {
  if (!draft.title || !draft.description || !draft.amount || !imageFile.value) return
  submitting.value = true

  try {
    const form = new FormData()
    form.append("title", draft.title)
    form.append("amount", String(draft.amount))
    form.append("description", draft.description)
    form.append("image", imageFile.value)
    await $fetch("/_api/funding/create", {
      method: "POST",
      body: form,
    })
    await navigateTo("/funding?tab=mine")
  }
  catch (err) {
    toast.add({
      color: "error",
      title: err instanceof Error ? err.message : "Unable to create funding campaign.",
    })
  }
  finally {
    submitting.value = false
  }
}
</script>
