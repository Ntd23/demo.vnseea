<template>
  <PagesGroupSettingPage />
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" })

const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const { group } = useCommunityGroupDetail(computed(() => String(route.params.group || "")))

const canonicalUrl = computed(() => {
  const slug = String(route.params.group || "")
  return new URL(route.fullPath || `/group-setting/${slug}`, requestURL.origin).toString()
})

useSeoMeta({
  title: () =>
    group.value
      ? `${t("community.settings.title", { name: t(group.value.name) })} | VNSEEA`
      : `${t("community.settings.eyebrow")} | VNSEEA`,
  description: () =>
    group.value ? t(group.value.summary) : t("community.settings.desc"),
  ogTitle: () =>
    group.value
      ? `${t("community.settings.title", { name: t(group.value.name) })} | VNSEEA`
      : `${t("community.settings.eyebrow")} | VNSEEA`,
  ogDescription: () =>
    group.value ? t(group.value.summary) : t("community.settings.desc"),
  ogUrl: () => canonicalUrl.value,
  robots: "noindex, nofollow",
})

useHead({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl,
    },
  ],
})
</script>
