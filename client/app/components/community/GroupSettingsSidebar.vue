  <div class="space-y-6 xl:sticky xl:top-[100px]">
    <!-- Group Preview Card -->
    <section class="surface-card overflow-hidden ring-1 ring-secondary-100 shadow-xl group/preview">
      <div class="relative h-44 overflow-hidden">
        <div class="absolute inset-0 transition-transform duration-700 group-hover/preview:scale-110" :style="{ background: group.banner }" />
        <div class="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-secondary-900/40 to-transparent" />
        
        <div class="relative h-full flex flex-col justify-end p-5 space-y-4">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 text-xl font-black text-white backdrop-blur-xl ring-1 ring-white/30 shadow-2xl">
              {{ initials }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-lg font-black text-white tracking-tight">{{ $t(group.name) }}</p>
              <p class="truncate text-[11px] font-bold text-white/60 uppercase tracking-widest">vnseea.vn/g/{{ group.slug }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 pt-1">
            <UBadge variant="soft" class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1 bg-white/20 text-white backdrop-blur-md ring-1 ring-white/20">
              {{ $t(privacyLabel) }}
            </UBadge>
            <UBadge variant="soft" class="rounded-lg font-black text-[9px] uppercase tracking-widest px-2.5 py-1 bg-white/20 text-white backdrop-blur-md ring-1 ring-white/20">
              {{ $t(categoryLabel) }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Compact Stats Row -->
      <div class="grid grid-cols-3 border-t border-secondary-100">
        <div class="p-4 bg-secondary-50/50 text-center ring-1 ring-secondary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ $t('community.settings.finish.status', { enabled: 0, total: 0, privacy: '' }).split('.')[0] }}</p>
          <p class="text-sm font-black text-secondary-900 tracking-widest">{{ enabledPolicies }}/{{ totalPolicies }}</p>
        </div>
        <div class="p-4 bg-secondary-50/50 text-center ring-1 ring-secondary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ $t('community.settings.basics.stats.tagCount') }}</p>
          <p class="text-sm font-black text-secondary-900 tracking-widest">{{ group.tags.length }}</p>
        </div>
        <div class="p-4 bg-secondary-50/50 text-center ring-1 ring-secondary-100/50">
          <p class="text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1.5">{{ $t('community.settings.basics.stats.guidelinesCount') }}</p>
          <p class="text-sm font-black text-secondary-900 tracking-widest">{{ group.guidelines?.length || 0 }}</p>
        </div>
      </div>
    </section>

    <!-- Sub-sections are already modernized components -->
    <CommunityGroupAboutCard
      :group="group"
      :privacy-label="privacyLabel"
      :privacy-description="privacyDescription"
      :category-label="categoryLabel"
      :member-count-label="memberCountLabel"
      compact
    />

    <CommunityGroupMembersCard
      v-if="showMemberDirectory"
      :members="members"
      :member-count-label="memberCountLabel"
    />

    <!-- Tips & Notes Section -->
    <section class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
      
      <p class="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-5 pl-1">
        {{ $t('community.settings.sidebar.notes') }}
      </p>

      <div class="relative z-10 space-y-4">
        <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100/50">
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-1.5">{{ $t('community.settings.sidebar.tip1Title') }}</p>
          <p class="text-[11px] font-medium leading-relaxed text-secondary-500">
            {{ $t('community.settings.sidebar.tip1Desc') }}
          </p>
        </div>
        <div class="rounded-2xl bg-secondary-50/50 p-4 ring-1 ring-secondary-100/50 transition-all hover:bg-white hover:ring-primary-100/50">
          <p class="text-[11px] font-black uppercase tracking-widest text-secondary-900 mb-1.5">{{ $t('community.settings.sidebar.tip2Title') }}</p>
          <p class="text-[11px] font-medium leading-relaxed text-secondary-500">
            {{ $t('community.settings.sidebar.tip2Desc') }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { getCommunityInitials } from "../../../types/community"
import type {
  CommunityGroupMember,
  CommunityGroupRecord,
} from "../../../types/community"

const props = defineProps<{
  group: CommunityGroupRecord
  members: CommunityGroupMember[]
  memberCountLabel: string
  privacyLabel: string
  privacyDescription: string
  categoryLabel: string
  enabledPolicies: number
  totalPolicies: number
  showMemberDirectory: boolean
}>()

const initials = computed(() =>
  getCommunityInitials(props.group.name),
)
</script>
