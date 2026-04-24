<template>
  <div class="flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_4px_24px_rgba(0,0,255,0.06)] ring-1 ring-secondary-100">
    <!-- Header -->
    <div class="flex shrink-0 items-center justify-between border-b border-secondary-50 px-4 py-4">
      <div>
        <span class="block text-lg font-black text-secondary-900 tracking-tight">{{ $t("navigation.chatWidget.title") }}</span>
        <div class="flex items-center gap-2 mt-0.5">
          <div class="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span class="block text-[10px] font-black uppercase tracking-widest text-secondary-400">{{ $t("navigation.chatWidget.onlineCount", { count: onlineCount }) }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <UButton
          color="white"
          variant="soft"
          icon="i-ph-user-plus-duotone"
          size="xs"
          class="rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100 ring-1 ring-secondary-100 shadow-none h-8 w-8 justify-center"
          :title="$t('navigation.chatWidget.actionCreateGroup')"
        />
        <UButton
          color="white"
          variant="soft"
          icon="i-ph-gear-duotone"
          size="xs"
          class="rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-100 ring-1 ring-secondary-100 shadow-none h-8 w-8 justify-center"
          :title="$t('navigation.chatWidget.actionSettings')"
        />
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="px-4 py-2 border-b border-secondary-50">
      <UTabs
        v-model="tabIndex"
        :items="tabItems"
        :ui="{
          wrapper: 'flex flex-col',
          list: {
            base: 'relative h-10 p-1 flex items-center justify-center rounded-xl bg-secondary-50/50 ring-1 ring-secondary-100',
            marker: {
              base: 'absolute top-[4px] left-[4px] bottom-[4px] rounded-lg bg-white shadow-sm ring-1 ring-secondary-100'
            },
            tab: {
              active: 'text-secondary-900',
              inactive: 'text-secondary-400 hover:text-secondary-900',
              size: 'text-xs',
              font: 'font-black uppercase tracking-widest'
            }
          }
        }"
      >
        <template #icon="{ item, selected }">
          <Icon :name="selected ? item.icon.replace('-duotone', '-fill') : item.icon" class="h-5 w-5" />
        </template>
      </UTabs>
    </div>

    <!-- Tab Content Area -->
    <div class="flex-1 overflow-y-auto no-scrollbar relative">
      <!-- Send Message Tab -->
      <div v-if="activeTab === 'send'" class="flex flex-col gap-5 px-5 py-6">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900 pl-1">{{ $t("navigation.chatWidget.content") }}</p>

        <UFormGroup :label="$t('navigation.chatWidget.sendToLabel')" class="space-y-2">
          <UInput
            v-model="sendTo"
            size="xl"
            color="white"
            class="rounded-xl"
            :placeholder="$t('navigation.chatWidget.recipientPlaceholder')"
            :ui="{ 
              rounded: 'rounded-xl',
              base: 'bg-secondary-50/30 font-semibold focus:bg-white transition-all ring-1 ring-secondary-100 focus:ring-primary-500' 
            }"
          />
        </UFormGroup>

        <UFormGroup class="space-y-2">
          <UTextarea
            v-model="sendMessage"
            size="xl"
            color="white"
            class="rounded-xl"
            :rows="4"
            :placeholder="$t('navigation.chatWidget.messagePlaceholder')"
            :ui="{ 
              rounded: 'rounded-2xl',
              base: 'bg-secondary-50/30 font-semibold focus:bg-white transition-all ring-1 ring-secondary-100 focus:ring-primary-500' 
            }"
          />
        </UFormGroup>

        <UFormGroup :label="$t('navigation.chatWidget.attachLabel')" class="space-y-2">
          <div class="flex items-center overflow-hidden rounded-xl border border-dashed border-primary-200 bg-primary-50/20 py-1 px-1">
            <label class="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-4 shadow-sm ring-1 ring-primary-100 transition hover:bg-primary-50 active:scale-95">
              <Icon name="i-ph-paperclip-duotone" class="h-4.5 w-4.5 text-secondary-900" />
              <span class="text-xs font-black uppercase tracking-widest text-secondary-900">{{ $t("navigation.chatWidget.chooseFile") }}</span>
              <input class="hidden" type="file" @change="onFile">
            </label>
            <span class="px-3 text-[11px] font-semibold text-secondary-500 truncate italic flex-1">
              {{ attachFile ? attachFile.name : $t("navigation.chatWidget.noFileSelected") }}
            </span>
          </div>
        </UFormGroup>

        <div class="flex items-center justify-between gap-4">
          <UCheckbox
            v-model="selectAll"
            :label="$t('navigation.chatWidget.selectAll')"
            :ui="{ 
              rounded: 'rounded-md', 
              label: 'text-xs font-black uppercase tracking-widest text-secondary-500 cursor-pointer',
              border: 'border-secondary-300 checked:bg-primary-600'
            }"
          />
          
          <div class="relative min-w-[140px]">
             <USelect
              icon="i-ph-tag-duotone"
              size="sm"
              :options="[
                { label: $t('navigation.chatWidget.selectTag'), value: '' },
                { label: $t('navigation.chatWidget.tagImportant'), value: 'important' },
                { label: $t('navigation.chatWidget.tagWork'), value: 'work' }
              ]"
              :ui="{ 
                rounded: 'rounded-xl',
                base: 'bg-secondary-50/50 font-bold border-none ring-1 ring-secondary-100'
              }"
            />
          </div>
        </div>

        <UButton
          block
          size="xl"
          icon="i-ph-paper-plane-right-duotone"
          class="rounded-2xl bg-secondary-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-secondary-900/10 transition-all active:scale-95"
        >
          {{ $t("navigation.chatWidget.sendMessage") }}
        </UButton>
      </div>

      <!-- Contacts Tab -->
      <div v-else-if="activeTab === 'contacts'" class="flex flex-col py-3">
        <UButton
          v-for="contact in extendedContacts"
          :key="contact.id"
          variant="ghost"
          class="flex w-full items-center gap-4 px-6 py-3 transition-all duration-300 hover:bg-secondary-50 group/contact relative active:bg-secondary-100"
          @click="openMiniChat(contact)"
        >
          <div class="relative shrink-0">
            <div class="h-10 w-10 relative">
              <img v-if="contact.avatarUrl" :src="contact.avatarUrl" class="h-full w-full rounded-2xl object-cover ring-2 ring-white shadow-md">
              <div v-else class="flex h-full w-full items-center justify-center rounded-2xl text-[11px] font-black text-white shadow-md ring-2 ring-white" :style="{ background: avatarColor(contact.id) }">{{ contact.avatar }}</div>
              <div class="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[2.5px] border-white z-10" :class="contact.online ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-secondary-300'" />
            </div>
          </div>

          <div class="min-w-0 flex-1 text-left">
            <div class="flex items-center gap-2">
              <span class="truncate text-sm font-black text-secondary-900 group-hover/contact:text-secondary-900 transition-colors">{{ contact.name }}</span>
              <UBadge v-if="contact.online" variant="soft" color="primary" class="rounded-lg font-black text-[8px] uppercase tracking-widest px-1.5 py-0.5">Live</UBadge>
            </div>
            <p class="truncate text-[11px] font-medium text-secondary-400 group-hover/contact:text-secondary-500 transition-colors italic">{{ contact.status || $t("navigation.chatWidget.readyToChat") }}</p>
          </div>

          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-secondary-100 text-secondary-400 shadow-sm transition-all group-hover/contact:bg-primary-600 group-hover/contact:text-white group-hover/contact:border-primary-500 group-hover/contact:shadow-lg group-hover/contact:shadow-primary-600/20">
            <Icon name="i-ph-chat-circle-dots-duotone" class="h-4.5 w-4.5" />
          </div>
        </UButton>
      </div>

      <!-- Groups Tab -->
      <div v-else-if="activeTab === 'groups'" class="flex flex-col py-3">
        <UButton
          v-for="group in groups"
          :key="group.id"
          variant="ghost"
          class="flex w-full items-center gap-4 px-6 py-3.5 transition-all duration-300 hover:bg-secondary-50 group/group active:bg-secondary-100"
          @click="openMiniGroup(group)"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 ring-1 ring-indigo-200">
            <Icon name="i-ph-users-three-duotone" class="h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <p class="truncate text-sm font-black text-secondary-900 group-hover/group:text-indigo-600 transition-colors">{{ group.name }}</p>
            <p class="text-[11px] font-medium text-secondary-400 uppercase tracking-widest">{{ $t("navigation.chatWidget.groupMembers", { count: group.members }) }} members</p>
          </div>
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-secondary-300 opacity-0 group-hover/group:opacity-100 transition-opacity">
            <Icon name="i-ph-arrow-right-bold" class="h-4 w-4" />
          </div>
        </UButton>
      </div>
    </div>

    <!-- Search Footer -->
    <div class="shrink-0 border-t border-secondary-50 p-4 bg-secondary-50/30">
      <UInput
        v-model="search"
        size="lg"
        icon="i-ph-magnifying-glass-duotone"
        :placeholder="$t('navigation.chatWidget.searchPlaceholder')"
        :ui="{
          rounded: 'rounded-xl',
          base: 'bg-white font-medium border-none ring-1 ring-secondary-200 focus:ring-primary-500 shadow-sm'
        }"
      />
    </div>

    <!-- Mini Chat Overlay -->
    <Transition 
      enter-active-class="transition duration-300 ease-out" 
      enter-from-class="opacity-0 translate-y-8 scale-95" 
      enter-to-class="opacity-100 translate-y-0 scale-100" 
      leave-active-class="transition duration-200 ease-in" 
      leave-from-class="opacity-100 translate-y-0 scale-100" 
      leave-to-class="opacity-0 translate-y-8 scale-95"
    >
      <div v-if="miniChat.open" class="absolute inset-x-3 bottom-16 z-20 rounded-[24px] border border-primary-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
        <div class="flex items-center justify-between border-b border-secondary-50 bg-secondary-50/50 px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-[13px] font-black text-secondary-900 tracking-tight">{{ miniChat.title }}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <div class="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <p class="text-[10px] font-black uppercase tracking-widest text-sky-600">{{ $t("navigation.chatWidget.miniChatActive") }}</p>
            </div>
          </div>
          <UButton
            color="white"
            variant="ghost"
            icon="i-ph-x-bold"
            size="xs"
            class="rounded-lg h-7 w-7 text-secondary-400 hover:text-secondary-900 transition-colors shadow-none"
            @click="miniChat.open = false"
          />
        </div>

        <div class="max-h-64 space-y-4 overflow-y-auto p-4 no-scrollbar">
          <div class="flex justify-end">
            <div class="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-primary-500/10">{{ miniSample }}</div>
          </div>
          <div class="flex justify-start">
            <div class="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary-50 border border-secondary-100 px-4 py-2.5 text-xs font-semibold text-secondary-700 shadow-sm">{{ miniReply }}</div>
          </div>
        </div>

        <div class="border-t border-secondary-50 p-3 bg-white">
          <div class="flex items-center gap-2 rounded-xl bg-secondary-50/50 p-1 ring-1 ring-secondary-100 focus-within:ring-primary-500 transition-all">
            <input 
              v-model="miniChat.message" 
              class="flex-1 bg-transparent px-3 text-[13px] font-semibold text-secondary-900 placeholder:text-secondary-400 outline-none" 
              :placeholder="$t('navigation.chatWidget.miniInputPlaceholder')" 
              type="text"
              @keyup.enter="miniChat.message = ''"
            >
            <UButton
              color="primary"
              variant="solid"
              icon="i-ph-paper-plane-right-duotone"
              class="rounded-lg shadow-lg shadow-primary-500/20"
              size="sm"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const { contacts } = useMockSocialData()

const tabIndex = ref(0)
const tabs = [
  { value: 'send', icon: 'i-ph-paper-plane-right-duotone', label: 'navigation.chatWidget.tabSend' },
  { value: 'contacts', icon: 'i-ph-address-book-duotone', label: 'navigation.chatWidget.tabContacts' },
  { value: 'groups', icon: 'i-ph-users-three-duotone', label: 'navigation.chatWidget.tabGroups' },
]

const tabItems = computed(() => tabs.map(tab => ({
  label: t(tab.label),
  icon: tab.icon,
  value: tab.value
})))

const activeTab = computed(() => tabs[tabIndex.value].value)

const search = ref('')
const sendTo = ref('')
const sendMessage = ref('')
const attachFile = ref<File | null>(null)
const selectAll = ref(false)
const onlineCount = computed(() => contacts.filter(c => c.online).length)

const groups = [
  { id: 1, name: 'Core Design Team', members: 12 },
  { id: 2, name: 'VNSEEA Marketplace', members: 8 },
  { id: 3, name: 'Community Support', members: 45 },
]

const extendedContacts = computed(() => contacts.map((c, i) => {
  let img = ''
  if (c.name === 'Xu Nguyễn') img = 'https://i.pravatar.cc/150?u=1'
  if (i === 1) img = 'https://i.pravatar.cc/150?u=2'
  if (i === 2) img = 'https://i.pravatar.cc/150?u=3'
  if (i === 4) img = 'https://i.pravatar.cc/150?u=4'
  if (i === 5) img = 'https://i.pravatar.cc/150?u=5'
  return { ...c, avatarUrl: img, status: c.online ? t('navigation.chatWidget.onlineStatus') : t('navigation.chatWidget.offlineToday') }
}))

const palette = ['#4f46e5', '#3b82f6', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
function avatarColor(id: number) { return palette[(id - 1) % palette.length] }

const miniChat = reactive<{ open: boolean; title: string; message: string; kind: 'direct' | 'group' }>({
  open: false,
  title: '',
  message: '',
  kind: 'direct',
})

const miniSample = computed(() =>
  miniChat.kind === 'group' ? t('navigation.chatWidget.miniGroupSample') : t('navigation.chatWidget.miniChatSample'),
)

const miniReply = computed(() =>
  miniChat.kind === 'group' ? t('navigation.chatWidget.miniGroupReply') : t('navigation.chatWidget.miniChatReply'),
)

const openMiniChat = (contact: any) => {
  miniChat.title = contact.name
  miniChat.kind = 'direct'
  miniChat.open = true
}
const openMiniGroup = (group: any) => {
  miniChat.title = group.name
  miniChat.kind = 'group'
  miniChat.open = true
}

const onFile = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) attachFile.value = f
}
</script>
