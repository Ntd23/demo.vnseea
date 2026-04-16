<template>
  <header class="sticky top-0 z-30">
    <div class="hidden border-b border-[#dfe6ff] bg-white shadow-[0_8px_24px_rgba(15,35,110,0.06)] xl:block">
      <div class="mx-auto flex h-16 w-full max-w-[1880px] items-center px-5">
        <div class="flex shrink-0 items-center gap-3">
          <NuxtLink to="/" class="shrink-0 text-[18px] font-black tracking-[-0.05em] text-[#0000ff]">VNSEEA</NuxtLink>
          <div class="min-w-0 max-w-[340px]">
            <label class="relative block">
              <Icon name="i-lucide-search" class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input v-model="search" class="h-10 w-full rounded-full border border-[#e4e9fb] bg-[#f7f9ff] pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#b9c8ff] focus:bg-white focus:ring-4 focus:ring-[#edf1ff]" placeholder="Tìm kiếm người, trang, nhóm..." type="search">
            </label>
          </div>
        </div>

        <nav class="mx-auto flex items-center gap-2 rounded-full border border-[#e4e9fb] bg-white px-2 py-2 shadow-[0_4px_14px_rgba(0,0,255,0.04)]">
          <NuxtLink v-for="item in centerNavItems" :key="item.label" :to="item.to" class="relative flex h-11 w-11 items-center justify-center rounded-full transition" :class="item.active ? 'bg-[#0000ff] text-white shadow-[0_6px_16px_rgba(0,0,255,0.24)]' : 'text-slate-500 hover:bg-[#f4f7ff] hover:text-[#0000ff]'" :aria-label="item.label">
            <Icon :name="item.icon" class="h-5 w-5" :class="item.active ? 'text-white' : ''" />
          </NuxtLink>
        </nav>

        <div class="ml-auto flex shrink-0 items-center gap-2">
          <button v-for="action in desktopActions" :key="action.label" class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#e4e9fb] bg-[#f0f3ff] text-slate-600 transition hover:bg-[#e8eeff] hover:text-[#0000ff]" type="button" :aria-label="action.label">
            <Icon :name="action.icon" class="h-5 w-5" />
            <span v-if="action.badge" class="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0000ff] px-1 text-[9px] font-bold text-white">{{ action.badge }}</span>
          </button>
          <button class="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#dce4ff] bg-[linear-gradient(145deg,#1f34ff_0%,#0000ff_60%,#4d63ff_100%)] text-white shadow-[0_8px_18px_rgba(0,0,255,0.16)]" type="button" aria-label="Tai khoan" @click="$emit('toggle-menu')">
            <Icon name="i-lucide-circle-user-round" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between bg-[#0000ff] px-2.5 py-2 xl:hidden">
      <div class="flex items-center gap-1">
        <NuxtLink v-for="item in mobileNavItemsLeft" :key="item.label" :to="item.to" class="flex h-10 w-10 items-center justify-center rounded-xl transition" :class="item.active ? 'bg-white/20' : 'hover:bg-white/10'" :aria-label="item.label">
          <Icon :name="item.icon" class="h-[22px] w-[22px]" :class="item.active ? 'text-white' : 'text-white'" />
        </NuxtLink>
      </div>

      <div class="flex items-center gap-1">
        <NuxtLink v-for="item in mobileNavItemsRight" :key="item.label" :to="item.to" class="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/10" :class="item.active ? 'bg-white/20' : ''" :aria-label="item.label">
          <Icon :name="item.icon" class="h-[22px] w-[22px]" :class="item.active ? 'text-white' : 'text-white'" />
          <span v-if="item.badge" class="absolute right-0.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">{{ item.badge }}</span>
        </NuxtLink>
        <button class="flex h-10 w-10 items-center justify-center rounded-full transition" type="button" @click="$emit('toggle-menu')">
          <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 bg-orange-400 text-sm">😊</div>
        </button>
      </div>
    </div>

    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="showSearch" class="bg-[#0000ff] px-3 pb-2.5 xl:hidden">
        <label class="relative block">
          <Icon name="i-ph-magnifying-glass" class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input class="h-10 w-full rounded-full border border-white/20 bg-white/15 pl-10 pr-4 text-sm text-white placeholder:text-white/50 outline-none transition focus:bg-white/20 focus:ring-2 focus:ring-white/20" placeholder="Tìm kiếm..." type="search" autofocus>
        </label>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ 'toggle-menu': [] }>()

const route = useRoute()
const search = ref('')
const showSearch = ref(false)

const centerNavItems = computed(() => [
  { label: 'Home', to: '/', icon: 'i-ph-house-fill', active: route.path === '/' },
  { label: 'Photos', to: '/home', icon: 'i-ph-image-fill', active: route.path === '/home' },
  { label: 'People', to: '/messages', icon: 'i-ph-users-fill', active: route.path === '/messages' },
  { label: 'Shop', to: '/products', icon: 'i-ph-storefront-fill', active: route.path === '/products' },
  { label: 'Profile', to: '/@me', icon: 'i-ph-user-circle-fill', active: route.path.includes('/@') },
])

const desktopActions = [
  { label: 'Tin nhan', icon: 'i-ph-chat-circle-dots-fill', badge: 2 },
  { label: 'Thong bao', icon: 'i-ph-bell-fill', badge: 3 },
]

const mobileNavItemsLeft = [
  { label: 'Home', to: '/', icon: 'i-ph-house-simple-fill', active: route.path === '/' },
  { label: 'Photos', to: '/home', icon: 'i-ph-image-fill', active: route.path === '/home' },
  { label: 'People', to: '/messages', icon: 'i-ph-users-fill', active: route.path === '/messages' },
]

const mobileNavItemsRight = [
  { label: 'Shop', to: '/products', icon: 'i-ph-storefront-fill', active: route.path === '/products' },
  { label: 'Profile', to: '/@me', icon: 'i-ph-user-circle-fill', active: route.path.includes('/@'), badge: 3 },
]
</script>
