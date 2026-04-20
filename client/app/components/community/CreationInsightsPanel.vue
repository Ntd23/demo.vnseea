<template>
  <div class="space-y-4 xl:sticky xl:top-[84px]">
    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.07)]">
      <div class="bg-[linear-gradient(140deg,#0f172a_0%,#243b63_34%,#0000ff_100%)] p-5 text-white">
        <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
          {{ $t("community.creation.insights.preview") }}
        </p>
        <div class="mt-4 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-[10px]">
          <div class="flex items-start gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#0000ff] shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
              <Icon :name="previewIcon" class="h-6 w-6" />
            </div>

            <div class="min-w-0">
              <p class="truncate text-[16px] font-black">
                {{ previewTitle }}
              </p>
              <p class="mt-1 break-all text-[12px] font-medium text-white/72">
                {{ previewUrl }}
              </p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <div
              v-if="showPrivacy"
              class="inline-flex items-center rounded-full bg-white/14 px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              <Icon name="i-ph-shield-check-fill" class="mr-1.5 h-4 w-4" />
              {{ privacyLabel }}
            </div>
            <div class="inline-flex items-center rounded-full bg-white/14 px-3 py-1.5 text-[12px] font-semibold text-white">
              <Icon name="i-ph-tag-fill" class="mr-1.5 h-4 w-4" />
              {{ categoryLabel }}
            </div>
          </div>

          <p class="mt-4 text-[13px] leading-6 text-white/82">
            {{ resolvedPreviewDescription }}
          </p>
        </div>
      </div>

      <div class="space-y-4 p-5">
        <div class="rounded-[22px] border border-[#eef2f8] bg-[#f8fbff] p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
                {{ $t("community.creation.insights.readiness") }}
              </p>
              <p class="mt-1 text-[15px] font-black text-[#243b63]">
                {{ $t("community.creation.insights.completionStatus", { count: completionCount, total: completionTotal }) }}
              </p>
            </div>
            <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.06)]">
              <Icon name="i-ph-check-fat-fill" class="h-5 w-5" />
            </div>
          </div>

          <div class="mt-4 space-y-2.5">
            <div
              v-for="item in readinessItems"
              :key="item.label"
              class="flex items-start gap-2.5 rounded-[16px] bg-white px-3 py-2.5"
            >
              <div
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]"
                :class="item.done ? 'bg-[#0000ff] text-white' : 'bg-[#eef2f8] text-slate-400'"
              >
                <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-dot-outline-bold'" class="h-3.5 w-3.5" />
              </div>
              <div class="min-w-0">
                <p class="text-[13px] font-semibold text-[#243b63]">
                  {{ item.label }}
                </p>
                <p class="mt-0.5 text-[12px] leading-5 text-slate-500">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showPrivacy"
          class="rounded-[22px] border border-[#eef2f8] bg-white p-4"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
            {{ $t("community.creation.insights.privacy") }}
          </p>
          <p class="mt-2 text-[14px] font-black text-[#243b63]">
            {{ privacyLabel }}
          </p>
          <p class="mt-2 text-[13px] leading-6 text-slate-500">
            {{ privacyDescription }}
          </p>
        </div>

        <div class="rounded-[22px] border border-[#eef2f8] bg-white p-4">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/70">
            {{ $t("community.creation.insights.afterCreation") }}
          </p>
          <div class="mt-3 space-y-3">
            <div
              v-for="step in resolvedNextSteps"
              :key="step.title"
              class="rounded-[18px] bg-[#f8fbff] px-4 py-3"
            >
              <p class="text-[13px] font-semibold text-[#243b63]">{{ step.title }}</p>
              <p class="mt-1 text-[12px] leading-5 text-slate-500">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = withDefaults(defineProps<{
  entityLabel: string
  completionCount: number
  completionTotal: number
  previewTitle: string
  previewUrl: string
  previewDescription: string
  privacyLabel?: string
  privacyDescription?: string
  categoryLabel: string
  showPrivacy?: boolean
  previewIcon?: string
  nextSteps?: Array<{ title: string; description: string }>
  nameReady?: boolean
  urlReady?: boolean
  descriptionReady?: boolean
  privacyReady?: boolean
  categoryReady?: boolean
}>(), {
  privacyLabel: "",
  privacyDescription: "",
  showPrivacy: true,
  previewIcon: "i-ph-users-three-fill",
  nextSteps: () => [],
  nameReady: false,
  urlReady: false,
  descriptionReady: false,
  privacyReady: false,
  categoryReady: false,
})

const resolvedPreviewDescription = computed(() => {
  const entity = t(props.entityLabel)
  const capitalizedEntity = entity.charAt(0).toUpperCase() + entity.slice(1)
  return props.previewDescription.trim()
    || t("community.creation.common.previewDescDefault", { entity: capitalizedEntity })
})

const readinessItems = computed(() => {
  const entity = t(props.entityLabel)

  const items = [
    {
      label: t("community.creation.readiness.nameLabel", { entity }),
      description: t("community.creation.readiness.nameDesc", { entity }),
      done: props.nameReady,
    },
    {
      label: t("community.creation.readiness.urlLabel"),
      description: t("community.creation.readiness.urlDesc", { entity }),
      done: props.urlReady,
    },
    {
      label: t("community.creation.readiness.descLabel"),
      description: t("community.creation.readiness.descDesc", { entity }),
      done: props.descriptionReady,
    },
    {
      label: t("community.creation.readiness.categoryLabel"),
      description: t("community.creation.readiness.categoryDesc", { entity }),
      done: props.categoryReady,
    },
  ]

  if (props.showPrivacy) {
    items.splice(3, 0, {
      label: t("community.creation.readiness.privacyLabel"),
      description: t("community.creation.readiness.privacyDesc", { entity }),
      done: props.privacyReady,
    })
  }

  return items
})

const resolvedNextSteps = computed(() => {
  if (props.nextSteps.length > 0) {
    return props.nextSteps
  }

  const entity = t(props.entityLabel)

  return [
    {
      title: t("community.creation.insights.finishTitle", { entity }),
      description: t("community.creation.insights.finishDesc", { entity }),
    },
    {
      title: t("community.creation.insights.inviteTitle"),
      description: props.showPrivacy
        ? t("community.creation.insights.inviteDescGroup")
        : t("community.creation.insights.inviteDescPage"),
    },
    {
      title: t("community.creation.insights.introPostTitle"),
      description: t("community.creation.insights.introPostDesc"),
    },
  ]
})
</script>
