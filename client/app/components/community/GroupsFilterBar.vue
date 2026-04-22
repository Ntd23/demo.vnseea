  <section class="surface-card p-4 sm:p-5 ring-1 ring-secondary-100 shadow-xl overflow-hidden relative">
    <!-- Visual Decor -->
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

    <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
      <!-- Nav Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.value"
          :to="tab.to"
          class="h-12 flex items-center justify-center rounded-2xl px-5 transition-all duration-300 border font-black text-[11px] uppercase tracking-[0.15em]"
          :class="activeTab === tab.value
            ? 'bg-primary-50 border-primary-100 text-primary-600 shadow-sm'
            : 'bg-secondary-50 border-transparent text-secondary-500 hover:bg-white hover:border-secondary-100 hover:text-secondary-900'"
        >
          {{ $t(tab.label) }}
          <span 
            class="ml-3 rounded-lg px-2 py-0.5 text-[9px] font-black transition-colors"
            :class="activeTab === tab.value ? 'bg-primary-600 text-white shadow-md' : 'bg-secondary-200 text-secondary-600 group-hover:bg-primary-600 group-hover:text-white'"
          >
            {{ tab.count }}
          </span>
        </NuxtLink>
      </div>

      <!-- Actions Area -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div class="w-full sm:w-[320px]">
          <UInput
            v-model="search"
            size="xl"
            icon="i-ph-magnifying-glass-duotone"
            :placeholder="$t('community.groups.filter.search')"
            :ui="{
              base: 'h-12 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
              icon: { leading: { pointer: 'pointer-events-none', base: 'text-primary-500' } }
            }"
          >
            <template #trailing>
              <div class="flex items-center gap-1 px-2">
                <UKbd size="xs">⌘</UKbd>
                <UKbd size="xs">F</UKbd>
              </div>
            </template>
          </UInput>
        </div>

        <UButton
          :to="createTo"
          size="xl"
          class="h-12 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95 px-8"
        >
          <template #leading>
            <Icon name="i-ph-plus-circle-duotone" class="h-5 w-5" />
          </template>
          {{ $t('community.groups.filter.create') }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CommunityGroupTab } from "../../../types/community"

const search = defineModel<string>("search", { default: "" })

defineProps<{
  tabs: Array<{ label: string; value: CommunityGroupTab; count: number; to: string }>
  activeTab: CommunityGroupTab
  createTo: string
}>()
</script>
