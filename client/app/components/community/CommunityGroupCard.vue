  <article class="surface-card overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:ring-2 hover:ring-primary-500/20 group ring-1 ring-secondary-100 shadow-xl">
    <!-- Banner Section -->
    <div class="relative overflow-hidden px-6 pb-8 pt-8 text-white min-h-[180px] flex flex-col justify-end" :style="{ background: group.banner }">
      <!-- Premium Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div class="relative z-10 space-y-4">
        <div class="flex items-center justify-between">
          <UBadge
            variant="soft"
            class="rounded-lg font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30"
          >
            {{ privacyLabel }}
          </UBadge>
          <div class="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30 shadow-lg">
            <Icon name="i-ph-users-three-duotone" class="h-6 w-6" />
          </div>
        </div>

        <div class="space-y-1">
          <NuxtLink
            :to="groupTo"
            class="block text-2xl font-black tracking-tighter text-white transition hover:text-primary-200"
          >
            {{ $t(group.name) }}
          </NuxtLink>
          <p class="max-w-[28rem] text-xs font-medium leading-relaxed text-white/80 line-clamp-2">
            {{ $t(group.summary) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-6 space-y-6 bg-white">
      <!-- Status Badges -->
      <div class="flex flex-wrap items-center gap-2">
        <UBadge variant="soft" class="rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1.5 bg-primary-50 text-primary-600 ring-1 ring-primary-100">
          <Icon name="i-ph-users-duotone" class="mr-1.5 h-3.5 w-3.5" />
          {{ memberLabel }}
        </UBadge>
        <UBadge variant="soft" class="rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1.5 bg-secondary-50 text-secondary-500 ring-1 ring-secondary-100">
          {{ categoryLabel }}
        </UBadge>
        <UBadge 
          v-for="tag in group.tags.slice(0, 2)" 
          :key="tag" 
          variant="outline"
          class="rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1.5 border-secondary-100 text-secondary-400 group-hover:border-primary-200 group-hover:text-primary-500 transition-colors"
        >
          #{{ tag }}
        </UBadge>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all group-hover:ring-primary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">
            {{ $t('community.groups.card.activity') }}
          </p>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none">
            {{ $t(group.activityLabel) }}
          </p>
        </div>

        <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all group-hover:ring-primary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">
            {{ $t('community.groups.card.context') }}
          </p>
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 leading-none truncate">
            {{ $t(group.ownerLabel) }}
          </p>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-secondary-50">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black uppercase tracking-widest text-primary-600">/g/{{ group.slug }}</span>
          <span class="h-1 w-1 rounded-full bg-secondary-300" />
          <span class="text-[9px] font-bold uppercase tracking-widest text-secondary-400">{{ privacyDescription }}</span>
        </div>

        <UButton
          :to="groupTo"
          size="md"
          class="h-11 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 px-6"
        >
          <template #leading>
            <Icon name="i-ph-arrow-square-out-bold" class="h-4 w-4" />
          </template>
          {{ resolvedActionLabel }}
        </UButton>
      </div>
    </div>
  </article>
  </article>
</template>

<script setup lang="ts">
import {
  getCommunityGroupPath,
  communityCategoryOptions,
  communityPrivacyOptions,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../../types/community"
import type { CommunityGroupRecord } from "../../../types/community"

const { t } = useI18n()

const props = withDefaults(defineProps<{
  group: CommunityGroupRecord
  actionLabel?: string
}>(), {
  actionLabel: "",
})

const memberLabel = computed(() =>
  t("community.groups.format.members", { count: props.group.members.toLocaleString() }),
)

const privacyLabel = computed(() => {
  const label = getCommunityOptionLabel(communityPrivacyOptions, props.group.privacy, "")
  return label ? t(label) : t("community.groups.card.privacyFallback")
})

const privacyDescription = computed(() => {
  const desc = getCommunityOptionDescription(communityPrivacyOptions, props.group.privacy, "")
  return desc ? t(desc) : t("community.groups.card.privacyHint")
})

const categoryLabel = computed(() => {
  const label = getCommunityOptionLabel(communityCategoryOptions, props.group.category, "")
  return label ? t(label) : t("community.groups.card.noCategory")
})

const resolvedActionLabel = computed(() =>
  props.actionLabel ? t(props.actionLabel) : t("community.groups.action.viewGroup"),
)

const primaryButtonBackground = computed(() =>
  `linear-gradient(135deg, ${props.group.accent} 0%, #0000ff 100%)`,
)

const groupTo = computed(() =>
  getCommunityGroupPath(props.group.slug),
)
</script>
