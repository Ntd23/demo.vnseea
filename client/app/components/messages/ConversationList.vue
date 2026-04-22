  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white border-r border-secondary-100 ring-1 ring-secondary-100 shadow-xl">
    <!-- Header Search & Tabs -->
    <div class="shrink-0 bg-white px-6 py-6 border-b border-secondary-100">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <UInput
            id="chat-search"
            size="xl"
            icon="i-ph-magnifying-glass-duotone"
            :placeholder="$t('pages.messagesPage.searchPlaceholder')"
            :ui="{
              base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
              icon: { leading: { pointer: 'pointer-events-none', base: 'text-primary-500' } }
            }"
          >
            <template #trailing>
              <div class="flex items-center gap-1 px-2">
                <UKbd size="xs">⌘</UKbd>
                <UKbd size="xs">K</UKbd>
              </div>
            </template>
          </UInput>
        </div>
        <UButton
          size="xl"
          class="h-14 w-14 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black shadow-xl shadow-primary-500/20 transition-all active:scale-95"
          square
        >
          <Icon name="i-ph-user-plus-duotone" class="h-6 w-6" />
        </UButton>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex-1 flex items-center justify-center gap-2 rounded-xl h-11 transition-all duration-300 border font-black text-[10px] uppercase tracking-widest"
          :class="activeTab === tab.id 
            ? 'bg-primary-50 border-primary-100 text-primary-600 shadow-sm' 
            : 'bg-secondary-50 border-transparent text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600'"
          type="button"
          @click="activeTab = tab.id"
        >
          <Icon :name="activeTab === tab.id ? tab.icon : tab.icon.replace('-fill', '-duotone')" class="h-4 w-4" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto bg-secondary-50/20 px-6 py-6 space-y-8 scrollbar-hide">
      <!-- Compose New Message -->
      <div class="surface-card p-6 ring-1 ring-secondary-100 shadow-xl space-y-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
        
        <div class="space-y-2">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">{{ $t('pages.messagesPage.composeTitle') }}</p>
          <div class="h-1 w-12 bg-primary-600 rounded-full" />
        </div>

        <div class="space-y-5">
          <UFormGroup
            :label="$t('pages.messagesPage.sendTo')"
            label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
          >
            <UInput
              size="xl"
              icon="i-ph-users-duotone"
              :placeholder="$t('pages.messagesPage.recipientPlaceholder')"
              :ui="{
                base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
                icon: { leading: { pointer: 'pointer-events-none', base: 'text-primary-500' } }
              }"
            />
          </UFormGroup>

          <UFormGroup
            :label="$t('pages.messagesPage.content')"
            label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
          >
            <UTextarea
              size="xl"
              :rows="4"
              :placeholder="$t('pages.messagesPage.messagePlaceholder')"
              :ui="{
                base: 'rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
              }"
            />
          </UFormGroup>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 px-1">
            <UCheckbox
              :label="$t('pages.messagesPage.selectAll')"
              :ui="{
                label: 'text-xs font-bold text-secondary-500 uppercase tracking-widest',
                base: 'h-5 w-5 rounded-lg border-secondary-200 text-primary-600 focus:ring-primary-500'
              }"
            />
            <UButton
              size="xl"
              class="h-14 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-[0.98] px-8"
            >
              <template #leading>
                <Icon name="i-ph-paper-plane-tilt-duotone" class="h-5 w-5" />
              </template>
              {{ $t('pages.messagesPage.sendMessage') }}
            </UButton>
          </div>

          <UFormGroup
            :label="$t('pages.messagesPage.label')"
            label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
          >
            <USelectMenu
              size="xl"
              :placeholder="$t('pages.messagesPage.chooseTag')"
              :options="[$t('pages.messagesPage.important'), $t('pages.messagesPage.work')]"
              :ui="{
                trigger: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-black text-xs uppercase tracking-widest text-secondary-900',
                icon: { base: 'text-primary-500 h-5 w-5' }
              }"
            >
              <template #leading>
                <Icon name="i-ph-tag-duotone" class="h-5 w-5 text-primary-500" />
              </template>
            </USelectMenu>
          </UFormGroup>
        </div>
      </div>

      <!-- Users List -->
      <div class="space-y-6">
        <div class="flex items-center justify-between px-2">
          <div class="space-y-1">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500">{{ $t('pages.messagesPage.users') }}</p>
            <h3 class="text-xl font-black text-secondary-900 tracking-tighter">{{ $t('pages.messagesPage.resultCount', { count: users.length }) }}</h3>
          </div>
          <UButton
            icon="i-ph-faders-duotone"
            variant="soft"
            size="sm"
            class="rounded-xl font-black text-[10px] uppercase tracking-widest px-4 bg-secondary-100 text-secondary-600 hover:bg-primary-600 hover:text-white transition-all"
          >
            Filters
          </UButton>
        </div>

        <div class="space-y-3 px-1">
          <div v-for="user in users" :key="user.id" class="surface-card flex items-center justify-between gap-4 p-4 transition-all duration-300 hover:ring-2 hover:ring-primary-500/20 hover:scale-[1.01] group ring-1 ring-secondary-100/50 shadow-md">
            <div class="flex items-center gap-4 min-w-0">
              <div class="relative shrink-0">
                <UAvatar
                  :src="user.avatarUrl"
                  :alt="user.name"
                  size="xl"
                  class="ring-2 ring-white shadow-lg"
                  :ui="{ rounded: 'rounded-[18px]' }"
                />
                <span 
                  class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white shadow-sm"
                  :class="user.status.includes('Now') ? 'bg-green-500' : 'bg-secondary-300'"
                />
              </div>
              <div class="min-w-0 space-y-1">
                <p class="truncate text-[13px] font-black uppercase tracking-widest text-secondary-900 group-hover:text-primary-600 transition-colors">{{ user.name }}</p>
                <div class="flex items-center gap-2">
                  <span class="h-1.5 w-1.5 rounded-full" :class="user.status.includes('Now') ? 'bg-green-500' : 'bg-secondary-300'" />
                  <p class="truncate text-[10px] font-bold uppercase tracking-widest text-secondary-400">{{ user.status }}</p>
                </div>
              </div>
            </div>

            <UButton
              size="md"
              variant="soft"
              class="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 bg-primary-50 text-primary-600 ring-1 ring-primary-100 hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <template #leading>
                <Icon name="i-ph-chat-circle-dots-duotone" class="h-4 w-4" />
              </template>
              {{ $t('pages.messagesPage.openChat') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref<'group' | 'user' | 'teams'>('group')
const { t } = useI18n()
const tabs = computed(() => [
  { id: 'group', label: t('pages.messagesPage.sendMultiple'), icon: 'i-ph-user-list-fill' },
  { id: 'user', label: t('pages.messagesPage.users'), icon: 'i-ph-user-circle-fill' },
  { id: 'teams', label: t('pages.messagesPage.teams'), icon: 'i-ph-users-three-fill' },
] as const)
const users = computed(() => [
  { id: 1, name: 'Ngocktokyo', status: t('pages.messagesPage.activeNow'), avatarUrl: 'https://i.pravatar.cc/150?u=101' },
  { id: 2, name: 'dung1', status: t('pages.messagesPage.activeOneHourAgo'), avatarUrl: 'https://i.pravatar.cc/150?u=102' },
  { id: 3, name: 'dung2', status: t('pages.messagesPage.activeNow'), avatarUrl: 'https://i.pravatar.cc/150?u=103' },
  { id: 4, name: 'tien', status: t('pages.messagesPage.activeYesterday'), avatarUrl: 'https://i.pravatar.cc/150?u=104' },
])
</script>
