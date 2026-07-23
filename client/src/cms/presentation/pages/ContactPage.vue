<!-- English description: Renders the public contact-us form and submits to the PHP contact handler. -->
<template>
  <section class="contact-page">
    <div class="contact-page__hero">
      <p class="contact-page__eyebrow">{{ t("contactPage.eyebrow") }}</p>
      <h1 class="contact-page__title">{{ t("contactPage.title") }}</h1>
      <p class="contact-page__description">{{ t("contactPage.description") }}</p>
    </div>

    <form class="contact-page__form" @submit.prevent="submit">
      <UAlert
        v-if="statusMessage"
        :color="statusTone"
        :title="statusMessage"
        variant="soft"
      />

      <div class="contact-page__grid">
        <UFormField :label="t('contactPage.firstName')">
          <UInput v-model="form.firstName" size="lg" />
        </UFormField>
        <UFormField :label="t('contactPage.lastName')">
          <UInput v-model="form.lastName" size="lg" />
        </UFormField>
      </div>

      <UFormField :label="t('contactPage.email')">
        <UInput v-model="form.email" type="email" size="lg" />
      </UFormField>

      <UFormField :label="t('contactPage.message')">
        <UTextarea v-model="form.message" :rows="6" size="lg" />
      </UFormField>

      <UCheckbox
        v-model="accepted"
        :label="t('contactPage.acceptTerms')"
      />

      <UButton
        type="submit"
        size="lg"
        color="primary"
        block
        :loading="submitting"
        :disabled="!accepted || submitting"
      >
        {{ t("contactPage.send") }}
      </UButton>
    </form>
  </section>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"

const { t } = useI18n()
const requestURL = useRequestURL()

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  message: "",
})
const accepted = ref(false)
const submitting = ref(false)
const statusMessage = ref("")
const statusTone = ref<"success" | "warning">("success")

useSeoMeta({
  title: t("contactPage.title"),
  description: t("contactPage.description"),
  ogTitle: t("contactPage.title"),
  ogDescription: t("contactPage.description"),
  robots: "index, follow",
})

useHead({
  link: [
    {
      rel: "canonical",
      href: new URL(appRoutes.contactUs, requestURL.origin).toString(),
    },
  ],
})

const submit = async () => {
  statusMessage.value = ""

  if (!form.firstName || !form.lastName || !form.email || !form.message) {
    statusTone.value = "warning"
    statusMessage.value = t("contactPage.validationRequired")
    return
  }

  try {
    submitting.value = true
    const response = await $fetch<{ message?: string }>("/_api/contact-us", {
      method: "POST",
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        message: form.message,
      },
    })

    statusTone.value = "success"
    statusMessage.value = response.message || t("contactPage.sent")
    form.firstName = ""
    form.lastName = ""
    form.email = ""
    form.message = ""
    accepted.value = false
  }
  catch (error: any) {
    statusTone.value = "warning"
    statusMessage.value = error?.data?.message || error?.statusMessage || t("contactPage.failed")
  }
  finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.contact-page {
  display: grid;
  gap: 1.25rem;
  padding: 1rem 0 3rem;
}

.contact-page__hero,
.contact-page__form {
  border: 1px solid var(--border-light, #dbe3f2);
  border-radius: var(--radius-xl, 1.5rem);
  background: #ffffff;
  box-shadow: var(--shadow-sm, 0 12px 28px rgba(13, 38, 76, 0.05));
}

.contact-page__hero {
  padding: clamp(1.35rem, 4vw, 2.5rem);
}

.contact-page__eyebrow {
  margin: 0 0 0.4rem;
  color: var(--color-primary, var(--bg-brand));
  font-size: 0.8rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.contact-page__title {
  margin: 0;
  color: var(--text-primary, #0f172a);
  font-size: clamp(2rem, 5vw, 3.35rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.05;
}

.contact-page__description {
  max-width: 42rem;
  margin: 0.8rem 0 0;
  color: var(--text-secondary, #64748b);
  font-size: 1rem;
  line-height: 1.7;
}

.contact-page__form {
  display: grid;
  gap: 1rem;
  width: min(100%, 720px);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 1.5rem);
}

.contact-page__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 640px) {
  .contact-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
