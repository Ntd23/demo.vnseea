<template>
<div class="space-y-6 xl:sticky xl:top-[100px]">
    <section class="surface-card overflow-hidden ring-1 ring-secondary-100 shadow-2xl group/panel">
      <!-- Preview Section -->
      <div class="relative overflow-hidden p-8 text-white group/preview">
        <div class="absolute inset-0 bg-gradient-to-br from-secondary-950 via-primary-900 to-secondary-900 z-0 transition-transform duration-700 group-hover/panel:scale-105" />
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] z-0" />
        
        <div class="relative z-10 space-y-6">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/50 pl-1">
            {{ $t("community.creation.insights.preview") }}
          </p>
          
          <div class="rounded-[32px] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl ring-1 ring-white/20 transition-all duration-500 group-hover/preview:bg-white/15 group-hover/preview:shadow-2xl">
            <div class="flex items-start gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-2xl transition-all duration-500 group-hover/preview:scale-110 group-hover/preview:rotate-6">
                <Icon :name="previewIcon.includes('duotone') ? previewIcon : previewIcon.replace('-fill', '-duotone')" class="h-8 w-8" />
              </div>

              <div class="min-w-0 space-y-1.5">
                <p class="truncate text-xl font-black tracking-tight leading-none text-white">
                  {{ previewTitle }}
                </p>
                <p class="truncate text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">
                  {{ previewUrl }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-2.5">
              <UBadge v-if="showPrivacy" variant="soft" class="rounded-xl bg-white/10 px-3.5 py-2 font-black uppercase tracking-widest text-[9px] text-white backdrop-blur-md border border-white/20">
                <Icon name="i-ph-shield-check-duotone" class="mr-2 h-4 w-4" />
                {{ privacyLabel }}
              </UBadge>
              <UBadge variant="soft" class="rounded-xl bg-white/10 px-3.5 py-2 font-black uppercase tracking-widest text-[9px] text-white backdrop-blur-md border border-white/20">
                <Icon name="i-ph-tag-duotone" class="mr-2 h-4 w-4" />
                {{ categoryLabel }}
              </UBadge>
            </div>

            <p class="mt-6 text-[13px] font-medium leading-relaxed text-white/80 line-clamp-3 italic">
              "{{ resolvedPreviewDescription }}"
            </p>
          </div>
        </div>
      </div>

      <!-- Readiness Section -->
      <div class="p-8 space-y-8">
        <div class="surface-card p-6 bg-secondary-50/50 ring-1 ring-secondary-100/50 space-y-6">
          <div class="flex items-center justify-between gap-4 border-b border-secondary-100/50 pb-5">
            <div class="space-y-1">
              <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                {{ $t("community.creation.insights.readiness") }}
              </p>
              <p class="text-xl font-black text-secondary-900 tracking-tight leading-none">
                {{ $t("community.creation.insights.completionStatus", { count: completionCount, total: completionTotal }) }}
              </p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm ring-1 ring-secondary-100 ring-offset-4 ring-offset-secondary-50/50">
              <Icon name="i-ph-check-fat-duotone" class="h-6 w-6" />
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="item in readinessItems"
              :key="item.label"
              class="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300"
              :class="item.done ? 'bg-primary-50/50 ring-1 ring-primary-100/50' : 'bg-white ring-1 ring-secondary-100/50'"
            >
              <div
                class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-500"
                :class="item.done ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/40' : 'bg-secondary-100 text-secondary-400'"
              >
                <Icon :name="item.done ? 'i-ph-check-bold' : 'i-ph-dot-outline-duotone'" class="h-4 w-4" />
              </div>
              <div class="min-w-0 space-y-1">
                <p class="text-xs font-black text-secondary-900 uppercase tracking-widest leading-none">
                  {{ item.label }}
                </p>
                <p class="text-[11px] font-medium leading-relaxed text-secondary-500">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy Meta -->
        <div v-if="showPrivacy" class="surface-card p-6 bg-white ring-1 ring-secondary-100/50 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
            {{ $t("community.creation.insights.privacy") }}
          </p>
          <div class="space-y-1.5">
            <p class="text-sm font-black text-secondary-900 tracking-tight">
              {{ privacyLabel }}
            </p>
            <p class="text-[11px] font-medium leading-relaxed text-secondary-500 italic">
              {{ privacyDescription }}
            </p>
          </div>
        </div>

        <!-- Next Steps Section -->
        <div class="surface-card p-6 bg-white ring-1 ring-secondary-100/50 space-y-5 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
            {{ $t("community.creation.insights.afterCreation") }}
          </p>
          <div class="space-y-4">
            <div
              v-for="step in resolvedNextSteps"
              :key="step.title"
              class="group/step p-4 rounded-2xl bg-secondary-50/50 hover:bg-primary-50/50 ring-1 ring-transparent hover:ring-primary-100/50 transition-all"
            >
              <p class="text-xs font-black text-secondary-900 group-hover/step:text-primary-700 transition-colors uppercase tracking-widest">{{ step.title }}</p>
              <p class="mt-1.5 text-[11px] font-medium leading-relaxed text-secondary-500 group-hover/step:text-primary-600/80 transition-colors">{{ step.description }}</p>
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
