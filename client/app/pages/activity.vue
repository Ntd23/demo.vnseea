<!-- English description: Thin authenticated route wrapper for Activity Center. -->
<template><ActivityPresentationActivityCenterPage /></template>
<script setup lang="ts">
import ActivityPresentationActivityCenterPage from "../../src/activity/presentation/pages/ActivityCenterPage.vue"
definePageMeta({ layout: "default" })
const { t } = useI18n()
useHead({ title: () => t("pages.activityCenter.seoTitle") })
</script>
