<template>
  <div class="rounded-[18px] border border-[#0000ff]/10 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,255,0.04)]">
    <h3 class="text-heading text-[18px]">{{ t("pages.profilePage.aboutCard.title") }}</h3>

    <!-- Overview -->
    <div class="mt-4 space-y-4">
      <div v-for="section in sections" :key="section.title">
        <h4 class="text-caption-primary mb-2 flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#0000ff]/8 bg-[#0000ff]/5 text-[#0000ff]/60">
            <Icon :name="section.icon" class="h-3.5 w-3.5" />
          </span>
          {{ section.title }}
        </h4>
        <div class="space-y-2 pl-9">
          <div v-for="item in section.items" :key="item.value" class="flex items-start gap-2">
            <Icon :name="item.icon" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p class="text-body-primary text-[13px] font-medium">{{ item.value }}</p>
              <p v-if="item.sub" class="text-caption-secondary">{{ item.sub }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const sections = computed(() => [
  {
    title: t("pages.profilePage.aboutCard.sections.workEducation.title"),
    icon: "i-ph-briefcase",
    items: [
      {
        icon: "i-ph-buildings",
        value: t("pages.profilePage.aboutCard.sections.workEducation.items.job.value"),
        sub: t("pages.profilePage.aboutCard.sections.workEducation.items.job.sub"),
      },
      {
        icon: "i-ph-graduation-cap",
        value: t("pages.profilePage.aboutCard.sections.workEducation.items.school.value"),
        sub: t("pages.profilePage.aboutCard.sections.workEducation.items.school.sub"),
      },
    ],
  },
  {
    title: t("pages.profilePage.aboutCard.sections.living.title"),
    icon: "i-ph-map-pin",
    items: [
      {
        icon: "i-ph-house-simple",
        value: t("pages.profilePage.aboutCard.sections.living.items.current.value"),
      },
      {
        icon: "i-ph-map-trifold",
        value: t("pages.profilePage.aboutCard.sections.living.items.hometown.value"),
      },
    ],
  },
  {
    title: t("pages.profilePage.aboutCard.sections.contact.title"),
    icon: "i-ph-phone",
    items: [
      {
        icon: "i-ph-envelope-simple",
        value: t("pages.profilePage.aboutCard.sections.contact.items.email.value"),
      },
      {
        icon: "i-ph-globe-simple",
        value: t("pages.profilePage.aboutCard.sections.contact.items.website.value"),
      },
      {
        icon: "i-ph-phone",
        value: t("pages.profilePage.aboutCard.sections.contact.items.phone.value"),
      },
    ],
  },
  {
    title: t("pages.profilePage.aboutCard.sections.basic.title"),
    icon: "i-ph-info",
    items: [
      {
        icon: "i-ph-gender-intersex",
        value: t("pages.profilePage.aboutCard.sections.basic.items.gender.value"),
      },
      {
        icon: "i-ph-calendar-blank",
        value: t("pages.profilePage.aboutCard.sections.basic.items.birthday.value"),
      },
      {
        icon: "i-ph-heart",
        value: t("pages.profilePage.aboutCard.sections.basic.items.relationship.value"),
      },
    ],
  },
])
</script>
