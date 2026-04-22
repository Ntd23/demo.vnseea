  <CommunitySettingsSectionCard
    :eyebrow="$t('community.pageSettings.controls.eyebrow')"
    :title="$t('community.pageSettings.controls.title')"
    :description="$t('community.pageSettings.controls.desc')"
    icon="i-ph-cursor-click-duotone"
  >
    <template #trailing>
      <UBadge
        variant="soft"
        class="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 py-1.5 bg-primary-50 text-primary-600 ring-1 ring-primary-100"
      >
        {{ selectedCtaLabel }}
      </UBadge>
    </template>

    <div class="space-y-8">
      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-5 px-1">
          {{ $t('community.pageSettings.controls.preset') }}
        </p>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="option in ctaOptions"
            :key="option.value"
            class="relative flex flex-col items-start rounded-3xl border p-6 text-left transition-all duration-300 group"
            :class="selectedCtaLabel === option.labelText
              ? 'border-primary-200 bg-primary-50/50 ring-2 ring-primary-500 shadow-xl shadow-primary-500/10'
              : 'border-secondary-100 bg-white hover:border-primary-200 hover:bg-secondary-50/50 hover:shadow-lg'"
            type="button"
            @click="model.ctaLabel = option.labelText"
          >
            <div 
              class="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110"
              :class="selectedCtaLabel === option.labelText ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-primary-600 ring-1 ring-secondary-100'"
            >
              <Icon :name="(option.icon || 'i-ph-circle-fill').replace('-bold', '-duotone')" class="h-6 w-6" />
            </div>
            
            <div class="mt-6 space-y-2">
              <p class="text-[12px] font-black uppercase tracking-widest" :class="selectedCtaLabel === option.labelText ? 'text-primary-600' : 'text-secondary-900'">
                {{ option.labelText }}
              </p>
              <p class="text-[11px] font-medium leading-relaxed" :class="selectedCtaLabel === option.labelText ? 'text-primary-600/70' : 'text-secondary-500'">
                {{ option.descriptionText }}
              </p>
            </div>

            <!-- Selection Indicator -->
            <div v-if="selectedCtaLabel === option.labelText" class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-xl ring-4 ring-white">
              <Icon name="i-ph-check-bold" class="h-3 w-3" />
            </div>
          </button>
        </div>
      </div>

      <!-- Logic Box -->
      <div class="rounded-2xl bg-secondary-50/50 p-5 ring-1 ring-secondary-100/50">
        <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2 px-1">
          {{ $t('community.pageSettings.controls.logic') }}
        </p>
        <p class="text-xs font-medium leading-relaxed text-secondary-600 px-1" v-html="$t('community.pageSettings.controls.logicDesc', { cta: selectedCtaLabel.toLowerCase() })" />
      </div>

      <!-- Controls Toggles -->
      <div class="grid gap-6 lg:grid-cols-2">
        <div v-for="control in [
          { key: 'allowMessages', label: 'community.pageSettings.controls.toggles.messagesLabel', desc: 'community.pageSettings.controls.toggles.messagesDesc' },
          { key: 'showFollowerCount', label: 'community.pageSettings.controls.toggles.followersLabel', desc: 'community.pageSettings.controls.toggles.followersDesc' },
          { key: 'showLikeCount', label: 'community.pageSettings.controls.toggles.likesLabel', desc: 'community.pageSettings.controls.toggles.likesDesc' },
          { key: 'showWebsite', label: 'community.pageSettings.controls.toggles.websiteLabel', desc: 'community.pageSettings.controls.toggles.websiteDesc' },
          { key: 'recommendRelatedPages', label: 'community.pageSettings.controls.toggles.relatedLabel', desc: 'community.pageSettings.controls.toggles.relatedDesc' }
        ]" :key="control.key" class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-secondary-50 shadow-sm hover:border-primary-100 transition-colors group">
          <div class="space-y-1">
            <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 group-hover:text-primary-600 transition-colors">{{ $t(control.label) }}</p>
            <p class="text-[10px] font-medium text-secondary-500 leading-relaxed">{{ $t(control.desc) }}</p>
          </div>
          <UToggle
            v-model="model[control.key as keyof CommunityPageSettingsDraft]"
            size="lg"
            :ui="{ 
              active: 'bg-primary-600',
              inactive: 'bg-secondary-200',
              container: { base: 'rounded-full ring-2 ring-transparent transition-all group-hover:ring-primary-100' }
            }"
          />
        </div>
      </div>
    </div>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import { communityPageCtaOptions } from "../../../types/community"
import type { CommunityPageSettingsDraft } from "../../../types/community"

const model = defineModel<CommunityPageSettingsDraft>({ required: true })

const { t } = useI18n()

const ctaOptions = computed(() =>
  communityPageCtaOptions.map(option => ({
    ...option,
    labelText: t(option.label),
    descriptionText: option.description ? t(option.description) : "",
  })),
)

const selectedCtaLabel = computed(() =>
  model.value.ctaLabel.trim() ? model.value.ctaLabel : t("community.pageSettings.basics.stats.ctaFallback"),
)
</script>
