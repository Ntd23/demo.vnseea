  <CommunitySettingsSectionCard
    :eyebrow="$t('community.pageSettings.basics.eyebrow')"
    :title="$t('community.pageSettings.basics.title')"
    :description="$t('community.pageSettings.basics.desc')"
    icon="i-ph-identification-card-duotone"
  >
    <template #trailing>
      <UButton
        :to="pagePath"
        variant="soft"
        size="md"
        class="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 bg-secondary-50 text-secondary-600 ring-1 ring-secondary-100 hover:bg-secondary-100 hover:text-secondary-900 transition-all shadow-sm"
      >
        <template #leading>
          <Icon name="i-ph-arrow-square-out-bold" class="h-4 w-4" />
        </template>
        {{ $t('community.pageSettings.basics.viewPage') }}
      </UButton>
    </template>

    <div class="space-y-8">
      <div class="grid gap-6 lg:grid-cols-2">
        <UFormGroup :label="$t('community.pageSettings.basics.fields.name')" name="name" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
          <UInput
            v-model="model.name"
            size="xl"
            :placeholder="$t('community.pageSettings.basics.fields.namePlaceholder')"
            :ui="{ 
              base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pl-4',
              placeholder: 'text-secondary-400 font-medium'
            }"
          />
        </UFormGroup>

        <UFormGroup :label="$t('community.pageSettings.basics.fields.url')" name="slug" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
          <UInput
            v-model="model.slug"
            size="xl"
            :placeholder="$t('community.pageSettings.basics.fields.slugPlaceholder')"
            :ui="{ 
              base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pl-[124px]',
              placeholder: 'text-secondary-400 font-medium'
            }"
          >
            <template #leading>
              <span class="pl-4 text-[13px] font-bold text-secondary-400">{{ urlPrefix }}</span>
            </template>
          </UInput>

          <div class="mt-3 flex flex-wrap items-center gap-3">
            <UBadge variant="soft" class="rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1.5 bg-secondary-100 text-secondary-500 ring-1 ring-secondary-200">
              {{ $t('community.pageSettings.basics.fields.urlSuggested', { slug: suggestedSlug || t('community.pageSettings.basics.fields.slugPlaceholder') }) }}
            </UBadge>
            <button
              v-if="suggestedSlug && model.slug.trim() !== suggestedSlug"
              class="rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary-600 transition hover:bg-primary-50 hover:border-primary-200 shadow-sm active:scale-95"
              type="button"
              @click="model.slug = suggestedSlug"
            >
              {{ $t('community.pageSettings.basics.fields.urlUseSuggestion') }}
            </button>
          </div>
        </UFormGroup>
      </div>

      <UFormGroup :label="$t('community.pageSettings.basics.fields.summary')" name="summary" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
        <UTextarea
          v-model="model.summary"
          size="xl"
          :rows="6"
          :placeholder="$t('community.pageSettings.basics.fields.summaryPlaceholder')"
          :ui="{ 
            base: 'rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 p-4 leading-relaxed',
            placeholder: 'text-secondary-400 font-medium'
          }"
        />
      </UFormGroup>

      <div class="grid gap-6 lg:grid-cols-2">
        <UFormGroup :label="$t('community.pageSettings.basics.fields.category')" name="category" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
          <USelectMenu
            v-model="model.category"
            size="xl"
            :options="communityPageCategoryOptions"
            value-attribute="value"
            option-attribute="label"
            :uiMenu="{ rounded: 'rounded-2xl', ring: 'ring-1 ring-secondary-100', shadow: 'shadow-2xl', base: 'p-1' }"
          >
            <template #default="{ open }">
              <UButton
                size="xl"
                class="w-full h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 justify-between text-secondary-900 font-medium transition-all"
                variant="ghost"
              >
                {{ $t(communityPageCategoryOptions.find(o => o.value === model.category)?.label || '') }}
                <Icon name="i-ph-caret-down" class="h-4 w-4 text-secondary-400 transition-transform" :class="open ? 'rotate-180' : ''" />
              </UButton>
            </template>
          </USelectMenu>
        </UFormGroup>

        <UFormGroup :label="$t('community.pageSettings.basics.fields.location')" name="location" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
          <UInput
            v-model="model.locationLabel"
            size="xl"
            icon="i-ph-map-pin-duotone"
            :placeholder="$t('community.pageSettings.basics.fields.locationPlaceholder')"
            :ui="{ 
              base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pl-4',
              placeholder: 'text-secondary-400 font-medium'
            }"
          />
        </UFormGroup>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <UFormGroup :label="$t('community.pageSettings.basics.fields.website')" name="website" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
          <UInput
            v-model="model.website"
            size="xl"
            icon="i-ph-link-duotone"
            :placeholder="$t('community.pageSettings.basics.fields.websitePlaceholder')"
            :ui="{ 
              base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pl-4',
              placeholder: 'text-secondary-400 font-medium'
            }"
          />
        </UFormGroup>

        <UFormGroup :label="$t('community.pageSettings.basics.fields.ownerLabel')" name="owner" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
          <UInput
            v-model="model.ownerLabel"
            size="xl"
            icon="i-ph-user-focus-duotone"
            :placeholder="$t('community.pageSettings.basics.fields.ownerPlaceholder')"
            :ui="{ 
              base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pl-4',
              placeholder: 'text-secondary-400 font-medium'
            }"
          />
        </UFormGroup>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <UFormGroup :label="$t('community.pageSettings.basics.fields.responseLabel')" name="response" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
          <UInput
            v-model="model.responseLabel"
            size="xl"
            icon="i-ph-timer-duotone"
            :placeholder="$t('community.pageSettings.basics.fields.responsePlaceholder')"
            :ui="{ 
              base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pl-4',
              placeholder: 'text-secondary-400 font-medium'
            }"
          />
        </UFormGroup>

        <UFormGroup :label="$t('community.pageSettings.basics.fields.ctaLabel')" name="cta" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
          <UInput
            v-model="model.ctaLabel"
            size="xl"
            icon="i-ph-cursor-click-duotone"
            :placeholder="$t('community.pageSettings.basics.fields.ctaPlaceholder')"
            :ui="{ 
              base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pl-4',
              placeholder: 'text-secondary-400 font-medium'
            }"
          />
        </UFormGroup>
      </div>

      <UFormGroup :label="$t('community.pageSettings.basics.fields.tags')" name="tags" :ui="{ label: { base: 'text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-2 pl-1' } }">
        <UInput
          v-model="model.tags"
          size="xl"
          icon="i-ph-tag-duotone"
          :placeholder="$t('community.pageSettings.basics.fields.tagsPlaceholder')"
          :ui="{ 
            base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pl-4',
            placeholder: 'text-secondary-400 font-medium'
          }"
        />
      </UFormGroup>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="stat in [
          { label: 'community.pageSettings.basics.fields.summary', value: $t('community.pageSettings.basics.stats.summaryLength', { count: model.summary.trim().length }) },
          { label: 'community.pageSettings.basics.stats.topicsLabel', value: $t('community.pageSettings.basics.stats.tagCount', { count: tagCount }) },
          { label: 'community.pageSettings.basics.stats.ctaLabel', value: model.ctaLabel.trim() || $t('community.pageSettings.basics.stats.ctaFallback') },
          { label: 'community.pageSettings.basics.stats.publicLinkLabel', value: model.website.trim() ? $t('community.pageSettings.basics.stats.websiteYes') : $t('community.pageSettings.basics.stats.websiteNo') }
        ]" :key="stat.label" class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:ring-primary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-2">{{ $t(stat.label) }}</p>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none truncate">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </CommunitySettingsSectionCard>
  </CommunitySettingsSectionCard>
</template>

<script setup lang="ts">
import {
  communityPageCategoryOptions,
  communityPageUrlPrefix,
  createCommunitySlug,
} from "../../../types/community"
import type { CommunityPageSettingsDraft } from "../../../types/community"

const model = defineModel<CommunityPageSettingsDraft>({ required: true })
const { t } = useI18n()

defineProps<{
  pagePath: string
}>()

const urlPrefix = communityPageUrlPrefix.replace("https://", "")

const suggestedSlug = computed(() =>
  createCommunitySlug(model.value.name),
)

const tagCount = computed(() =>
  model.value.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean)
    .length,
)
</script>
