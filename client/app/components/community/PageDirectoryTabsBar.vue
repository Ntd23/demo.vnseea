  <section class="surface-card p-4 sm:p-5 ring-1 ring-secondary-100 shadow-lg">
    <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <!-- Tabs Container -->
      <div class="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.value"
          :to="tab.to"
          class="inline-flex h-12 items-center px-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative group"
          :class="activeTab === tab.value
            ? 'text-primary-600'
            : 'text-secondary-400 hover:text-secondary-900'"
        >
          {{ $t(tab.label) }}
          
          <!-- Active Indicator -->
          <div 
            v-if="activeTab === tab.value"
            class="absolute bottom-0 left-4 right-4 h-1 rounded-full bg-primary-600 shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
          />
          <div 
            v-else
            class="absolute bottom-0 left-4 right-4 h-1 rounded-full bg-primary-600 opacity-0 transition-opacity group-hover:opacity-20"
          />
        </NuxtLink>
      </div>

      <!-- Action Button -->
      <UButton
        :to="createTo"
        size="xl"
        icon="i-ph-plus-bold"
        class="rounded-2xl font-black text-xs uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/30 transition-all active:scale-95"
      >
        {{ createLabelText }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityPageTab } from "../../../types/community"

const props = withDefaults(defineProps<{
  tabs: Array<{ label: string; value: CommunityPageTab; to: string }>
  activeTab: CommunityPageTab
  createTo: string
  createLabel?: string
}>(), {
  createLabel: "",
})

const { t } = useI18n()

const createLabelText = computed(() =>
  props.createLabel || t("community.pagesDirectory.createAction"),
)
</script>
