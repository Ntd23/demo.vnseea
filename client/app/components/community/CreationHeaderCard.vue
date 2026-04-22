  <section class="surface-card group overflow-hidden p-8 sm:p-12 ring-1 ring-secondary-200/50 shadow-2xl relative bg-white">
    <!-- Premium Decorations -->
    <div class="pointer-events-none absolute right-[-5%] top-[-30%] h-96 w-96 rounded-full bg-primary-100/30 blur-[120px] transition-transform duration-1000 group-hover:scale-110" />
    <div class="pointer-events-none absolute bottom-[-40%] left-[5%] h-80 w-80 rounded-full bg-emerald-100/20 blur-[120px] transition-transform duration-1000 group-hover:-translate-x-4" />

    <div class="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-8">
        <!-- Main Icon Container -->
        <div class="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-[32px] bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-2xl shadow-primary-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon :name="icon.includes('duotone') ? icon : icon.replace('-fill', '-duotone')" class="h-10 w-10 sm:h-12 sm:w-12" />
        </div>

        <div class="min-w-0 space-y-2.5">
          <p
            v-if="eyebrow"
            class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1"
          >
            {{ $t(eyebrow) }}
          </p>
          <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-secondary-900 leading-none">
            {{ $t(title) }}
          </h1>
          <p
            v-if="description"
            class="text-base font-medium leading-relaxed text-secondary-500 max-w-2xl pl-1 italic"
          >
            "{{ $t(description) }}"
          </p>
        </div>
      </div>

      <!--   <section class="surface-card p-1 pb-1 space-y-0 ring-1 ring-secondary-200/50 shadow-2xl overflow-hidden bg-secondary-50/10">
    <div class="bg-white p-8 sm:p-12 space-y-12 rounded-b-3xl ring-1 ring-secondary-100 shadow-sm">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between border-b border-secondary-50 pb-10">
        <div class="max-w-3xl space-y-3">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
            {{ $t("community.creation.common.basicSetup") }}
          </p>
          <h2 class="text-4xl sm:text-5xl font-black tracking-tight text-secondary-900 leading-none">
            {{ $t("community.creation.common.fillInfo", { entity: $t(entityLabel) }) }}
          </h2>
          <p class="text-[15px] font-medium leading-relaxed text-secondary-500 pl-1 italic">
            {{ $t("community.creation.common.fillDesc", { entity: $t(entityLabel) }) }}
          </p>
        </div>

        <UBadge
          variant="soft"
          size="lg"
          class="rounded-2xl px-6 font-black uppercase tracking-widest h-14 bg-primary-50 text-primary-600 ring-1 ring-primary-100 shadow-lg shadow-primary-500/10 flex items-center justify-center min-w-[200px]"
        >
          <template #leading>
            <Icon name="i-ph-check-circle-duotone" class="h-6 w-6 mr-3" />
          </template>
          {{ $t("community.creation.common.completionStatus", { count: completionCount, total: completionTotal }) }}
        </UBadge>
      </div>

      <div class="grid gap-12 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div class="space-y-14">
          <!-- Identity Section -->
          <section class="space-y-10 group/section">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-50 pb-6 transition-colors group-hover/section:border-primary-100">
              <div class="space-y-1.5">
                <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                  {{ identitySectionLabelText }}
                </p>
                <p class="text-2xl font-black text-secondary-900 leading-none tracking-tight">
                  {{ identitySectionTitleText }}
                </p>
              </div>

              <UBadge variant="soft" class="rounded-xl bg-secondary-50 ring-1 ring-secondary-100 text-secondary-400 font-black text-[9px] uppercase tracking-widest px-4 py-2 transition-all group-hover/section:text-primary-600 group-hover/section:bg-primary-50 group-hover/section:ring-primary-100">
                {{ identitySectionBadgeText }}
              </UBadge>
            </div>

            <div class="space-y-10">
              <UFormGroup :label="nameLabelText" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
                <UInput
                  v-model="model.name"
                  :placeholder="namePlaceholder"
                  size="xl"
                  class="rounded-2xl"
                  :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-xl px-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold placeholder:font-medium placeholder:text-secondary-300' }"
                />
                <div class="mt-3 flex flex-wrap items-center gap-3 pl-1">
                  <div class="flex items-center gap-2 rounded-xl bg-secondary-50/50 px-4 py-2 ring-1 ring-secondary-100 transition-all hover:bg-white hover:ring-primary-100 hover:shadow-sm">
                    <Icon name="i-ph-info-duotone" class="h-4 w-4 text-primary-500" />
                    <span class="text-[11px] font-bold text-secondary-400 italic">
                      {{ identityHintText }}
                    </span>
                  </div>
                  <transition enter-active-class="duration-500 cubic-bezier(0.4, 0, 0.2, 1)" enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100">
                    <div v-if="isNameReady" class="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 ring-1 ring-emerald-100">
                      <Icon name="i-ph-check-circle-duotone" class="h-4 w-4 text-emerald-500" />
                      <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        {{ identityReadyLabelText }}
                      </span>
                    </div>
                  </transition>
                </div>
              </UFormGroup>

              <UFormGroup :label="urlLabelText" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
                <div class="relative group/input">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-8 text-lg font-black text-secondary-300 pointer-events-none group-focus-within/input:text-primary-500/50 transition-colors uppercase tracking-tight">
                    {{ urlPrefix }}
                  </div>
                  <UInput
                    v-model="model.slug"
                    :placeholder="slugPlaceholder"
                    size="xl"
                    class="rounded-2xl"
                    :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-xl pl-[164px] pr-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold' }"
                  />
                </div>

                <div class="mt-5 overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm transition-all group-hover/section:shadow-md lg:flex lg:items-center lg:justify-between p-1">
                  <div class="flex items-center gap-5 p-4 px-6 flex-1 bg-secondary-50/30 rounded-xl ring-1 ring-inset ring-secondary-50">
                    <div class="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white shadow-sm text-primary-500 ring-1 ring-secondary-100/50">
                      <Icon name="i-ph-link-duotone" class="h-5 w-5" />
                    </div>
                    <div class="min-w-0 space-y-1">
                      <p class="text-[9px] font-black uppercase tracking-[0.2em] text-secondary-400">
                        {{ $t("community.creation.common.urlSuggested") }}
                      </p>
                      <p class="text-sm font-black text-primary-600 truncate tracking-tight">
                        {{ urlPrefix }}{{ suggestedSlug || $t("community.creation.common.urlDefault") }}
                      </p>
                    </div>
                  </div>

                  <div class="p-3 lg:px-5">
                    <UButton
                      v-if="suggestedSlug && model.slug.trim() !== suggestedSlug"
                      size="lg"
                      class="w-full lg:w-auto h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-white text-secondary-900 border border-secondary-200 hover:border-primary-500 hover:text-primary-600 transition-all active:scale-95 shadow-sm px-8"
                      @click="applySuggestedSlug"
                    >
                      {{ $t("community.creation.common.useSuggestion") }}
                    </UButton>
                  </div>
                </div>
              </UFormGroup>
            </div>
          </section>

          <!-- Description Section -->
          <section class="space-y-10 group/section">
            <div class="space-y-1.5 border-b border-secondary-50 pb-6 transition-colors group-hover/section:border-primary-100">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                {{ descriptionSectionLabelText }}
              </p>
              <p class="text-2xl font-black text-secondary-900 leading-none tracking-tight">
                {{ descriptionSectionTitleText }}
              </p>
            </div>

            <UFormGroup :label="descriptionLabelText" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
              <UTextarea
                v-model="model.description"
                :placeholder="descriptionPlaceholder"
                size="xl"
                :rows="6"
                class="rounded-3xl"
                :ui="{ rounded: 'rounded-3xl', base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all px-8 py-6 text-lg leading-relaxed font-medium placeholder:font-medium placeholder:text-secondary-300' }"
              />
              <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pl-1">
                <div class="flex items-center gap-2 rounded-xl bg-secondary-50/50 px-4 py-2 ring-1 ring-secondary-100">
                  <Icon name="i-ph-chat-teardrop-text-duotone" class="h-4 w-4 text-primary-500" />
                  <p class="text-[11px] font-bold text-secondary-400 italic">
                    {{ descriptionHintText }}
                  </p>
                </div>
                <div class="flex h-10 items-center gap-3 rounded-xl bg-white px-5 ring-1 ring-secondary-100 shadow-sm">
                  <p class="text-[10px] font-black text-secondary-500 uppercase tracking-widest">{{ $t("community.creation.common.charCount") }}</p>
                  <span class="h-4 w-px bg-secondary-100" />
                  <p class="text-[11px] font-black text-primary-600 transition-all" :class="descriptionLength >= 24 ? 'text-emerald-500' : ''">
                    {{ descriptionLength }}
                  </p>
                </div>
              </div>
            </UFormGroup>
          </section>

          <!-- Configuration Section -->
          <section class="space-y-10 group/section">
            <div class="space-y-1.5 border-b border-secondary-50 pb-6 transition-colors group-hover/section:border-primary-100">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                {{ configurationSectionLabelText }}
              </p>
              <p class="text-2xl font-black text-secondary-900 leading-none tracking-tight">
                {{ configurationSectionTitleText }}
              </p>
            </div>

            <div v-if="showPrivacy" class="grid gap-5 sm:grid-cols-3">
              <button
                v-for="option in privacyOptions"
                :key="option.value"
                class="flex flex-col h-full rounded-2xl border p-6 text-left transition-all duration-500 relative group/opt overflow-hidden ring-offset-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                :class="model.privacy === option.value
                  ? 'border-primary-500 bg-primary-50 shadow-2xl ring-1 ring-primary-500'
                  : 'border-secondary-100 bg-white hover:border-primary-300 hover:shadow-xl hover:-translate-y-1'"
                type="button"
                @click="selectPrivacy(option.value)"
              >
                <div class="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary-200/20 blur-2xl opacity-0 transition-opacity group-hover/opt:opacity-100" />
                
                <div class="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover/opt:scale-110 group-hover/opt:rotate-3"
                  :class="model.privacy === option.value ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/40' : 'bg-secondary-50 text-secondary-400 ring-1 ring-secondary-100'"
                >
                  <Icon :name="option.icon ? option.icon.replace('-fill', '-duotone') : 'i-ph-circle-duotone'" class="h-7 w-7" />
                </div>
                
                <p class="mt-6 text-base font-black tracking-tight text-secondary-900 group-hover/opt:text-primary-600 transition-colors uppercase tracking-widest text-[11px]">
                  {{ $t(option.label) }}
                </p>
                <p class="mt-2.5 text-[11px] leading-relaxed font-medium text-secondary-500 line-clamp-2">
                  {{ option.description ? $t(option.description) : "" }}
                </p>

                <div v-if="model.privacy === option.value" class="absolute top-4 right-4">
                  <Icon name="i-ph-seal-check-fill" class="h-6 w-6 text-primary-600 drop-shadow-sm" />
                </div>
              </button>
            </div>

            <UFormGroup :label="categoryLabelText" class="space-y-4" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-500 mb-2 block pl-1' } }">
              <div class="relative group/select">
                <USelect
                  v-model="model.category"
                  :options="categoryOptions.map(o => ({ label: $t(o.label), value: o.value }))"
                  size="xl"
                  class="rounded-2xl"
                  :ui="{ rounded: 'rounded-2xl', size: { xl: 'h-[72px] text-lg px-8' }, base: 'bg-secondary-50/30 ring-1 ring-secondary-200 focus:ring-primary-500 hover:ring-primary-200 transition-all font-bold cursor-pointer' }"
                />
                <Icon name="i-ph-caret-up-down-duotone" class="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-300 pointer-events-none group-focus-within/select:text-primary-500 transition-colors" />
              </div>
              <div class="mt-4 rounded-2xl bg-white p-5 px-6 ring-1 ring-secondary-100 shadow-sm flex items-start gap-4 transition-all group-hover/section:shadow-md">
                <Icon name="i-ph-tag-duotone" class="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                <p class="text-[12px] font-medium leading-relaxed text-secondary-500 italic px-0.5">
                  {{ selectedCategoryDescription }}
                </p>
              </div>
            </UFormGroup>
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
    </div>

    <!-- Final Action Section -->
    <section class="rounded-t-3xl bg-gradient-to-br from-secondary-950 via-primary-900 to-secondary-900 p-8 sm:p-14 relative overflow-hidden group/action ring-1 ring-inset ring-white/10 shadow-2xl">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_40%)] pointer-events-none" />
      <div class="absolute inset-0 bg-primary-600/5 group-hover/action:bg-primary-600/10 transition-colors duration-1000" />
      
      <div class="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <p class="text-[10px] font-black uppercase tracking-[0.5em] text-primary-400 pl-1">
            {{ $t("community.creation.common.action") }}
          </p>
          <p class="text-base sm:text-lg font-medium leading-relaxed text-white/80 max-w-xl pr-4">
            {{ actionDescriptionText }}
          </p>
        </div>

        <div class="flex flex-col-reverse gap-4 sm:flex-row sm:items-center shrink-0">
          <UButton
            :to="backTo"
            variant="ghost"
            size="xl"
            class="h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-white/50 hover:text-white hover:bg-white/10 transition-all px-10 border border-white/5 hover:border-white/20 active:scale-95"
          >
            <template #leading>
              <Icon name="i-ph-arrow-left-duotone" class="h-5 w-5 mr-1" />
            </template>
            {{ backLabelText }}
          </UButton>

          <UButton
            v-if="submitTo"
            :to="submitTo"
            size="xl"
            class="h-16 min-w-[280px] rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] bg-primary-600 hover:bg-primary-700 text-white shadow-2xl shadow-primary-500/40 transition-all active:scale-95 px-12 border-none"
          >
            <template #leading>
              <Icon name="i-ph-sparkle-duotone" class="h-6 w-6 mr-1" />
            </template>
            {{ submitLabelText }}
          </UButton>

          <UButton
            v-else
            size="xl"
            class="h-16 min-w-[280px] rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] bg-primary-600 hover:bg-primary-700 text-white shadow-2xl shadow-primary-500/40 transition-all active:scale-95 px-12 border-none"
            @click="$emit('submit')"
          >
            <template #leading>
              <Icon name="i-ph-sparkle-duotone" class="h-6 w-6 mr-1" />
            </template>
            {{ submitLabelText }}
          </UButton>
        </div>
      </div>
    </section>
  </section>

      <!-- Highlights/Badges Container -->
      <div class="flex flex-wrap gap-3 pt-6 lg:pt-0">
        <div
          v-for="highlight in normalizedHighlights"
          :key="highlight"
          class="rounded-2xl border border-secondary-100 bg-secondary-50/50 px-6 py-3 font-black text-[10px] uppercase tracking-widest text-secondary-500 shadow-sm transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100/50 hover:shadow-md hover:-translate-y-1 active:scale-95"
        >
          {{ $t(highlight) }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  eyebrow?: string
  icon?: string
  highlights?: string[]
}>(), {
  description: "",
  eyebrow: "",
  icon: "i-ph-users-three-fill",
  highlights: () => [],
})

const { t } = useI18n()

const normalizedHighlights = computed(() =>
  props.highlights.length > 0
    ? props.highlights
    : [t("community.creation.common.quickFill"), t("community.creation.common.editLater")],
)
</script>
