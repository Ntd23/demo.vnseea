  <section class="surface-card p-6 sm:p-10 space-y-10 ring-1 ring-secondary-100 shadow-2xl">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-secondary-50 pb-8">
      <div class="max-w-3xl space-y-2">
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("community.creation.common.basicSetup") }}
        </p>
        <h2 class="text-4xl font-black tracking-tight text-secondary-900 leading-tight">
          {{ $t("community.creation.common.fillInfo", { entity: $t(entityLabel) }) }}
        </h2>
        <p class="text-sm font-medium leading-relaxed text-secondary-500 pl-0.5">
          {{ $t("community.creation.common.fillDesc", { entity: $t(entityLabel) }) }}
        </p>
      </div>

      <UBadge
        variant="soft"
        size="lg"
        class="rounded-xl px-5 font-black uppercase tracking-widest h-11 bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-sm"
      >
        <template #leading>
          <Icon name="i-ph-check-circle-duotone" class="h-4 w-4 mr-2" />
        </template>
        {{ $t("community.creation.common.completionStatus", { count: completionCount, total: completionTotal }) }}
      </UBadge>
    </div>

    <div class="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <div class="space-y-10">
        <!-- Identity Section -->
        <section class="surface-card p-6 sm:p-8 bg-secondary-50/30 ring-1 ring-secondary-100 space-y-8 group hover:bg-white transition-all duration-500">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-100 pb-6">
            <div class="space-y-1">
              <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                {{ identitySectionLabelText }}
              </p>
              <p class="text-xl font-black text-secondary-900 leading-none tracking-tight">
                {{ identitySectionTitleText }}
              </p>
            </div>

            <UBadge variant="soft" class="rounded-lg bg-white ring-1 ring-secondary-100 text-secondary-400 font-black text-[9px] uppercase tracking-widest px-3 py-1.5 shadow-sm">
              {{ identitySectionBadgeText }}
            </UBadge>
          </div>

          <div class="space-y-8">
            <UFormGroup :label="nameLabelText" class="space-y-3" :ui="{ label: { base: 'text-xs font-black uppercase tracking-widest text-secondary-900 mb-2 block pl-1' } }">
              <UInput
                v-model="model.name"
                :placeholder="namePlaceholder"
                size="xl"
                class="rounded-2xl"
                :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[64px] text-lg px-6' }, base: 'bg-white ring-1 ring-secondary-200 focus:ring-primary-500' }"
              />
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <UBadge color="white" variant="soft" class="rounded-lg bg-white/50 text-secondary-400 font-bold text-[10px] px-3 py-1 border border-secondary-100 italic">
                  {{ identityHintText }}
                </UBadge>
                <transition enter-active-class="duration-300 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100">
                  <UBadge v-if="isNameReady" color="emerald" variant="soft" class="rounded-lg font-bold text-[10px] px-3 py-1 uppercase tracking-tight">
                    {{ identityReadyLabelText }}
                  </UBadge>
                </transition>
              </div>
            </UFormGroup>

            <UFormGroup :label="urlLabelText" class="space-y-3" :ui="{ label: { base: 'text-xs font-black uppercase tracking-widest text-secondary-900 mb-2 block pl-1' } }">
              <div class="relative group/input">
                <div class="absolute inset-y-0 left-0 flex items-center pl-6 text-sm font-black text-secondary-400 pointer-events-none group-focus-within/input:text-primary-500 transition-colors">
                  {{ urlPrefix }}
                </div>
                <UInput
                  v-model="model.slug"
                  :placeholder="slugPlaceholder"
                  size="xl"
                  class="rounded-2xl"
                  :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[64px] text-lg pl-[164px] pr-6' }, base: 'bg-white ring-1 ring-secondary-200 focus:ring-primary-500' }"
                />
              </div>

              <div class="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-secondary-100 shadow-sm transition-all group-hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase tracking-widest text-secondary-400">
                    {{ $t("community.creation.common.urlSuggested") }}
                  </p>
                  <p class="text-xs font-black text-primary-600 truncate max-w-[280px]">
                    {{ urlPrefix }}{{ suggestedSlug || $t("community.creation.common.urlDefault") }}
                  </p>
                </div>

                <UButton
                  v-if="suggestedSlug && model.slug.trim() !== suggestedSlug"
                  size="sm"
                  color="white"
                  variant="soft"
                  class="rounded-xl font-black text-[10px] uppercase tracking-widest bg-secondary-50 hover:bg-secondary-100 text-secondary-900 border border-secondary-100 px-4 py-2 transition-all active:scale-95"
                  @click="applySuggestedSlug"
                >
                  {{ $t("community.creation.common.useSuggestion") }}
                </UButton>
              </div>
            </UFormGroup>
          </div>
        </section>

        <!-- Description Section -->
        <section class="surface-card p-6 sm:p-8 bg-secondary-50/30 ring-1 ring-secondary-100 space-y-8 group hover:bg-white transition-colors duration-500">
          <div class="space-y-1 border-b border-secondary-100 pb-6">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 pl-1">
              {{ descriptionSectionLabelText }}
            </p>
            <p class="text-lg font-black text-secondary-900 leading-none">
              {{ descriptionSectionTitleText }}
            </p>
          </div>

          <UFormGroup :label="descriptionLabelText" class="space-y-3" :ui="{ label: { base: 'text-xs font-black uppercase tracking-widest text-secondary-900 mb-2 block pl-1' } }">
            <UTextarea
              v-model="model.description"
              :placeholder="descriptionPlaceholder"
              size="xl"
              :rows="6"
              class="rounded-3xl"
              :ui="{ rounded: 'rounded-3xl', base: 'bg-white ring-1 ring-secondary-200 focus:ring-primary-500 px-6 py-5 text-base leading-relaxed' }"
            />
            <div class="mt-4 flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-secondary-100 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p class="text-[11px] font-medium text-secondary-500">
                {{ descriptionHintText }}
              </p>
              <UBadge color="white" variant="soft" class="rounded-lg bg-secondary-50 text-secondary-400 font-black text-[10px] uppercase tracking-widest px-3 py-1">
                {{ $t("community.creation.common.charCount", { count: descriptionLength }) }}
              </UBadge>
            </div>
          </UFormGroup>
        </section>

        <!-- Configuration Section -->
        <section class="surface-card p-6 sm:p-8 bg-secondary-50/30 ring-1 ring-secondary-100 space-y-8 group hover:bg-white transition-colors duration-500">
          <div class="space-y-1 border-b border-secondary-100 pb-6">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 pl-1">
              {{ configurationSectionLabelText }}
            </p>
            <p class="text-lg font-black text-secondary-900 leading-none">
              {{ configurationSectionTitleText }}
            </p>
          </div>

          <div v-if="showPrivacy" class="grid gap-4 sm:grid-cols-3">
            <button
              v-for="option in privacyOptions"
              :key="option.value"
              class="flex flex-col h-full rounded-2xl border p-5 text-left transition-all duration-300 relative group/opt overflow-hidden"
              :class="model.privacy === option.value
                ? 'border-primary-400 bg-primary-50/50 shadow-xl ring-1 ring-primary-100'
                : 'border-secondary-100 bg-white hover:border-primary-200 hover:bg-primary-50/10'"
              type="button"
              @click="selectPrivacy(option.value)"
            >
              <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary-100/20 blur-xl opacity-0 transition-opacity group-hover/opt:opacity-100" />
              
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover/opt:scale-110 group-hover/opt:rotate-3"
                :class="model.privacy === option.value ? 'bg-primary-600 text-white shadow-primary-500/30' : 'bg-secondary-50 text-secondary-400 border border-secondary-50'"
              >
                <Icon :name="option.icon || 'i-ph-circle-fill'" class="h-6 w-6" />
              </div>
              
              <p class="mt-5 text-sm font-black tracking-tight text-secondary-900">
                {{ $t(option.label) }}
              </p>
              <p class="mt-2 text-[11px] leading-relaxed font-medium text-secondary-500">
                {{ option.description ? $t(option.description) : "" }}
              </p>

              <div v-if="model.privacy === option.value" class="absolute top-4 right-4">
                <Icon name="i-ph-seal-check-fill" class="h-5 w-5 text-primary-600 animate-pulse" />
              </div>
            </button>
          </div>

          <UFormGroup :label="categoryLabelText" class="space-y-3" :ui="{ label: { base: 'text-xs font-black uppercase tracking-widest text-secondary-900 mb-2 block pl-1' } }">
            <USelect
              v-model="model.category"
              :options="categoryOptions.map(o => ({ label: $t(o.label), value: o.value }))"
              size="xl"
              class="rounded-2xl"
              :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[64px] text-lg px-6' }, base: 'bg-white ring-1 ring-secondary-200 focus:ring-primary-500 appearance-none' }"
            />
            <div class="mt-4 rounded-2xl bg-white p-4 ring-1 ring-secondary-100 shadow-sm">
              <p class="text-[11px] font-medium leading-relaxed text-secondary-500 italic">
                {{ selectedCategoryDescription }}
              </p>
            </div>
          </UFormGroup>
        </section>

        <!-- Final Action Section -->
        <section class="surface-card p-8 sm:p-10 bg-secondary-900 shadow-2xl ring-1 ring-white/10 relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div class="relative z-10 flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
            <div class="space-y-2">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 pl-1">
                {{ $t("community.creation.common.action") }}
              </p>
              <p class="text-sm font-medium leading-relaxed text-white/70 max-w-md italic">
                {{ actionDescriptionText }}
              </p>
            </div>

            <div class="flex flex-col-reverse gap-5 sm:flex-row sm:items-center">
              <UButton
                :to="backTo"
                variant="ghost"
                size="xl"
                icon="i-ph-arrow-left-bold"
                class="rounded-2xl font-black text-[11px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                {{ backLabelText }}
              </UButton>

              <UButton
                v-if="submitTo"
                :to="submitTo"
                size="xl"
                class="min-w-[220px] rounded-2xl font-black text-[11px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white shadow-2xl shadow-primary-500/40 transition-all active:scale-95 py-4"
              >
                {{ submitLabelText }}
              </UButton>

              <UButton
                v-else
                size="xl"
                class="min-w-[220px] rounded-2xl font-black text-[11px] uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white shadow-2xl shadow-primary-500/40 transition-all active:scale-95 py-4"
                @click="$emit('submit')"
              >
                {{ submitLabelText }}
              </UButton>
            </div>
          </div>
        </section>
      </div>

      <CommunityCreationInsightsPanel
        :entity-label="entityLabel"
        :completion-count="completionCount"
        :completion-total="completionTotal"
        :preview-title="previewTitle"
        :preview-url="previewUrl"
        :preview-description="previewDescription"
        :privacy-label="selectedPrivacyLabel"
        :privacy-description="selectedPrivacyDescription"
        :category-label="selectedCategoryLabel"
        :show-privacy="showPrivacy"
        :preview-icon="previewIcon"
        :next-steps="nextSteps"
        :name-ready="isNameReady"
        :url-ready="isUrlReady"
        :description-ready="isDescriptionReady"
        :privacy-ready="isPrivacyReady"
        :category-ready="isCategoryReady"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  createCommunitySlug,
  communityUrlPrefix,
  getCommunityCompletionCount,
  getCommunityCompletionTotal,
} from "../../../types/community"
import type {
  CommunityDraft,
  CommunityOption,
} from "../../../types/community"

const { t } = useI18n()

const model = defineModel<CommunityDraft>({ required: true })

const props = withDefaults(defineProps<{
  entityLabel: string
  categoryOptions: CommunityOption[]
  privacyOptions?: CommunityOption[]
  showPrivacy?: boolean
  submitLabel?: string
  submitTo?: string
  backLabel?: string
  backTo?: string
  nameLabel?: string
  namePlaceholder?: string
  urlLabel?: string
  slugPlaceholder?: string
  descriptionLabel?: string
  descriptionPlaceholder?: string
  categoryLabel?: string
  privacyLabel?: string
  urlPrefix?: string
  identitySectionLabel?: string
  identitySectionTitle?: string
  identitySectionBadge?: string
  identityHint?: string
  identityReadyLabel?: string
  descriptionSectionLabel?: string
  descriptionSectionTitle?: string
  descriptionHint?: string
  configurationSectionLabel?: string
  configurationSectionTitle?: string
  actionDescription?: string
  previewIcon?: string
  nextSteps?: Array<{ title: string; description: string }>
}>(), {
  privacyOptions: () => [],
  showPrivacy: true,
  submitLabel: "", // handled in computed
  backLabel: "",   // handled in computed
  backTo: "/home",
  nameLabel: "",
  namePlaceholder: "",
  urlLabel: "",
  slugPlaceholder: "",
  descriptionLabel: "",
  descriptionPlaceholder: "",
  categoryLabel: "",
  privacyLabel: "",
  urlPrefix: communityUrlPrefix,
  identitySectionLabel: "",
  identitySectionTitle: "",
  identitySectionBadge: "",
  identityHint: "",
  identityReadyLabel: "",
  descriptionSectionLabel: "",
  descriptionSectionTitle: "",
  descriptionHint: "",
  configurationSectionLabel: "",
  configurationSectionTitle: "",
  actionDescription: "",
  previewTitle: "",
  previewIcon: "i-ph-users-three-fill",
  nextSteps: () => [],
})

const submitLabelText = computed(() =>
  props.submitLabel || t("community.creation.common.create"),
)

const backLabelText = computed(() =>
  props.backLabel || t("community.creation.common.back"),
)

const nameLabelText = computed(() =>
  props.nameLabel || t("community.creation.common.nameLabel"),
)

const urlLabelText = computed(() =>
  props.urlLabel || t("community.creation.common.urlLabel"),
)

const descriptionLabelText = computed(() =>
  props.descriptionLabel || t("community.creation.common.descriptionLabel"),
)

const categoryLabelText = computed(() =>
  props.categoryLabel || t("community.creation.common.categoryLabel"),
)

const completionCount = computed(() =>
  getCommunityCompletionCount(model.value, { includePrivacy: props.showPrivacy }),
)

const completionTotal = computed(() =>
  getCommunityCompletionTotal(props.showPrivacy),
)

const descriptionLength = computed(() => model.value.description.trim().length)
const suggestedSlug = computed(() => createCommunitySlug(model.value.name))

const selectedPrivacyLabel = computed(() =>
  props.privacyOptions.find(option => option.value === model.value.privacy)?.label
    ? t(props.privacyOptions.find(option => option.value === model.value.privacy)!.label)
    : t("community.creation.common.noPrivacy"),
)

const selectedPrivacyDescription = computed(() =>
  props.privacyOptions.find(option => option.value === model.value.privacy)?.description
    ? t(props.privacyOptions.find(option => option.value === model.value.privacy)!.description!)
    : t("community.creation.common.privacyDescDefault", { entity: t(props.entityLabel) }),
)

const selectedCategoryLabel = computed(() =>
  props.categoryOptions.find(option => option.value === model.value.category)?.label
    ? t(props.categoryOptions.find(option => option.value === model.value.category)!.label)
    : t("community.creation.common.noCategory"),
)

const selectedCategoryDescription = computed(() =>
  props.categoryOptions.find(option => option.value === model.value.category)?.description
    ? t(props.categoryOptions.find(option => option.value === model.value.category)!.description!)
    : t("community.creation.common.categoryDescDefault", { entity: t(props.entityLabel) }),
)

const identitySectionLabelText = computed(() =>
  props.identitySectionLabel || t("community.creation.common.identitySection", { entity: t(props.entityLabel) }),
)

const identitySectionTitleText = computed(() =>
  props.identitySectionTitle || t("community.creation.common.identityTitle"),
)

const identitySectionBadgeText = computed(() =>
  props.identitySectionBadge || t("community.creation.common.identityBadge"),
)

const identityHintText = computed(() =>
  props.identityHint || t("community.creation.common.identityHint"),
)

const identityReadyLabelText = computed(() =>
  props.identityReadyLabel || t("community.creation.common.identityReady"),
)

const descriptionSectionLabelText = computed(() =>
  props.descriptionSectionLabel || t("community.creation.common.introSection", { entity: t(props.entityLabel) }),
)

const descriptionSectionTitleText = computed(() =>
  props.descriptionSectionTitle
    || (props.showPrivacy ? t("community.creation.common.introTitleGroup") : t("community.creation.common.introTitlePage")),
)

const descriptionHintText = computed(() =>
  props.descriptionHint
    || t("community.creation.common.introHint", { entity: t(props.entityLabel) }),
)

const configurationSectionLabelText = computed(() =>
  props.configurationSectionLabel || (props.showPrivacy ? t("community.creation.common.configLabelDisplay") : t("community.creation.common.configLabelContent")),
)

const configurationSectionTitleText = computed(() =>
  props.configurationSectionTitle
    || (props.showPrivacy
      ? t("community.creation.common.configTitleGroup")
      : t("community.creation.common.configTitlePage")),
)

const actionDescriptionText = computed(() =>
  props.actionDescription
    || t("community.creation.common.finishHint", { extra: props.showPrivacy ? t("community.creation.common.finishExtraGroup") : t("community.creation.common.finishExtraPage") }),
)

const previewTitle = computed(() =>
  model.value.name.trim() || t("community.creation.common.previewTitle", { entity: t(props.entityLabel) }),
)

const effectiveSlug = computed(() =>
  model.value.slug.trim() || suggestedSlug.value || t("community.creation.common.previewUrlDefault"),
)

const previewUrl = computed(() =>
  `${props.urlPrefix}${effectiveSlug.value}`,
)

const previewDescription = computed(() => {
  const entity = t(props.entityLabel)
  const capitalizedEntity = entity.charAt(0).toUpperCase() + entity.slice(1)
  return model.value.description.trim()
    || t("community.creation.common.previewDescDefault", { entity: capitalizedEntity })
})

const isNameReady = computed(() => model.value.name.trim().length >= 3)
const isUrlReady = computed(() => model.value.slug.trim().length >= 3)
const isDescriptionReady = computed(() => descriptionLength.value >= 24)
const isPrivacyReady = computed(() => !props.showPrivacy || Boolean(model.value.privacy))
const isCategoryReady = computed(() => Boolean(model.value.category))

function applySuggestedSlug() {
  if (suggestedSlug.value) {
    model.value.slug = suggestedSlug.value
  }
}

function selectPrivacy(value: string) {
  model.value.privacy = value as CommunityDraft["privacy"]
}
</script>
