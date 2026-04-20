<template>
  <div class="space-y-5 pb-10">
    <EventsCreateEventHero
      :stats="heroStats"
      @quick-fill="quickFillSeed++"
    />
    <EventsCreateEventComposer :quick-fill-seed="quickFillSeed" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t("pages.createEventPage.seoTitle"),
  description: () => t("pages.createEventPage.seoDescription"),
})

const quickFillSeed = ref(0)

const heroStats = computed(() => [
  {
    label: t("pages.createEventPage.statMainFields"),
    value: "7",
    description: t("pages.createEventPage.statMainFieldsDescription"),
  },
  {
    label: t("pages.createEventPage.statPreview"),
    value: t("pages.createEventPage.statPreviewValue"),
    description: t("pages.createEventPage.statPreviewDescription"),
  },
  {
    label: t("pages.createEventPage.statSubmit"),
    value: t("pages.createEventPage.statSubmitValue"),
    description: t("pages.createEventPage.statSubmitDescription"),
  },
] as const)
</script>
