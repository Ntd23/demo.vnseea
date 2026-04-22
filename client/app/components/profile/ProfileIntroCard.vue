<template>
  <div class="rounded-[18px] border border-[#0000ff]/10 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,255,0.04)]">
    <div class="flex items-center justify-between">
      <h3 class="text-title-primary">{{ t("pages.profilePage.introCard.title") }}</h3>
      <button class="text-caption-secondary hover:text-[#0000ff] transition" type="button">{{ t("pages.profilePage.introCard.edit") }}</button>
    </div>

    <p class="text-body-secondary mt-3 leading-relaxed">
      {{ t("pages.profilePage.introCard.headline") }}
    </p>

    <div class="mt-4 space-y-3">
      <div v-for="item in infoItems" :key="item.label" class="flex items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-[#0000ff]/8 bg-[#0000ff]/5 text-[#0000ff]/70">
          <Icon :name="item.icon" class="h-4 w-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-caption-secondary">{{ item.label }}</p>
          <p class="text-body-primary truncate text-[13px] font-medium">{{ item.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const infoItems = computed(() => [
  {
    icon: "i-ph-briefcase",
    label: t("pages.profilePage.introCard.items.work.label"),
    value: t("pages.profilePage.introCard.items.work.value"),
  },
  {
    icon: "i-ph-graduation-cap",
    label: t("pages.profilePage.introCard.items.education.label"),
    value: t("pages.profilePage.introCard.items.education.value"),
  },
  {
    icon: "i-ph-map-pin",
    label: t("pages.profilePage.introCard.items.livesIn.label"),
    value: t("pages.profilePage.introCard.items.livesIn.value"),
  },
  {
    icon: "i-ph-heart",
    label: t("pages.profilePage.introCard.items.relationship.label"),
    value: t("pages.profilePage.introCard.items.relationship.value"),
  },
  {
    icon: "i-ph-calendar-blank",
    label: t("pages.profilePage.introCard.items.joined.label"),
    value: t("pages.profilePage.introCard.items.joined.value"),
  },
  {
    icon: "i-ph-globe-simple",
    label: t("pages.profilePage.introCard.items.website.label"),
    value: t("pages.profilePage.introCard.items.website.value"),
  },
])
</script>
