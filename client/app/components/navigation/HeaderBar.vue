<template>
  <header class="sticky top-0 z-30">
    <div class="hidden border-b border-[#dfe6ff] bg-white/95 shadow-[0_10px_26px_rgba(15,35,110,0.08)] backdrop-blur xl:block">
      <div class="mx-auto flex h-16 w-full max-w-[1880px] items-center gap-4 px-5">
        <NuxtLink to="/home" class="shrink-0 text-[20px] font-black tracking-[-0.05em] text-[#0000ff]">VNSEEA</NuxtLink>

        <div class="flex shrink-0 items-center gap-2 rounded-full border border-[#dbe3f2] bg-[#f7f9ff] p-1">
          <button class="desktop-pill" :class="isHome ? 'desktop-pill--active' : 'desktop-pill--inactive'" type="button">
            <Icon name="i-ph-house-fill" class="h-4.5 w-4.5" />
            <span>Trang chủ</span>
          </button>
          <button class="desktop-pill desktop-pill--inactive" type="button">
            <Icon name="i-ph-plus-circle-fill" class="h-4.5 w-4.5" />
            <span>Tạo ra</span>
          </button>
        </div>

        <div class="ml-auto flex shrink-0 items-center gap-2">
          <button v-for="action in desktopActions" :key="action.label" class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f5f8ff] text-[#33496d] transition hover:border-[#c8d6f2] hover:text-[#0000ff]" type="button" :aria-label="action.label">
            <Icon :name="action.icon" class="h-5 w-5" />
            <span v-if="action.badge" class="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0000ff] px-1 text-[9px] font-bold text-white">{{ action.badge }}</span>
          </button>
          <button class="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#dce4ff] bg-[linear-gradient(145deg,#1f34ff_0%,#0000ff_60%,#4d63ff_100%)] text-white shadow-[0_8px_18px_rgba(0,0,255,0.16)]" type="button" aria-label="Tài khoản" @click="$emit('toggle-menu')">
            <Icon name="i-lucide-circle-user-round" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="bg-[linear-gradient(135deg,#1738ff_0%,#0016c9_100%)] px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,255,0.25)] xl:hidden">
      <div class="flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
        <NuxtLink
          v-for="item in mobileIconItems.slice(0, -1)"
          :key="item.label"
          :to="item.to"
          class="mobile-icon-btn"
          :class="item.active ? 'mobile-icon-btn--active' : ''"
          :aria-label="item.label"
        >
          <Icon :name="item.icon" class="h-[21px] w-[21px]" />
          <span v-if="item.badge" class="mobile-icon-badge">{{ item.badge }}</span>
        </NuxtLink>

        <button
          class="mobile-icon-btn mobile-icon-btn--avatar"
          type="button"
          aria-label="Tài khoản"
          @click="$emit('toggle-menu')"
        >
          <Icon name="i-lucide-circle-user-round" class="h-[21px] w-[21px] text-white" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ 'toggle-menu': [] }>()

const route = useRoute()
const search = ref('')

const isMarketplaceRoute = computed(() =>
  route.path === '/products'
  || route.path === '/new-product'
  || route.path === '/my-products'
  || route.path.startsWith('/edit-product/')
  || route.path.startsWith('/order/')
  || route.path.startsWith('/customer_order/')
  || route.path === '/checkout'
  || route.path === '/orders',
)

const centerNavItems = computed(() => [
  { label: 'Home', to: '/', icon: 'i-ph-house-fill', active: route.path === '/' },
  { label: 'Photos', to: '/home', icon: 'i-ph-image-fill', active: route.path === '/home' },
  { label: 'People', to: '/messages', icon: 'i-ph-users-fill', active: route.path === '/messages' },
  { label: 'Shop', to: '/products', icon: 'i-ph-storefront-fill', active: isMarketplaceRoute.value },
  { label: 'Profile', to: '/@me', icon: 'i-ph-user-circle-fill', active: route.path.includes('/@') },
])

const desktopActions = [
  { label: 'Yêu cầu kết bạn', icon: 'i-ph-user-plus-fill', badge: 1 },
  { label: 'Tin nhắn', icon: 'i-ph-chat-circle-dots-fill', badge: 2 },
  { label: 'Thông báo', icon: 'i-ph-bell-fill', badge: 3 },
]


const mobileIconItems = computed(() => [
  { label: 'Home', to: '/home', icon: 'i-ph-house-fill', active: route.path === '/' || route.path === '/home' },
  { label: 'Create', to: '/home', icon: 'i-ph-plus-bold', active: false },
  { label: 'Search', to: '/home', icon: 'i-ph-magnifying-glass-bold', active: false },
  { label: 'People', to: '/messages', icon: 'i-ph-user-plus-fill', active: route.path === '/messages' },
  { label: 'Messages', to: '/messages', icon: 'i-ph-chat-circle-dots-fill', active: route.path === '/messages', badge: 1 },
  { label: 'Notifications', to: '/home', icon: 'i-ph-bell-fill', active: false },
  { label: 'Profile', to: '/@me', icon: 'i-ph-handshake-fill', active: route.path.includes('/@') },
])
</script>

<style scoped>
.desktop-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 9999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.78rem;
  font-weight: 800;
  transition: all 0.15s ease;
}

.desktop-pill--active {
  background: linear-gradient(180deg, #2749ff 0%, #0000ff 100%);
  color: #fff;
  box-shadow: 0 8px 18px rgba(0, 0, 255, 0.22);
}

.desktop-pill--inactive {
  color: #4a5c7a;
}

.desktop-pill--inactive:hover {
  color: #0000ff;
  background: #eef3ff;
}

.mobile-icon-btn {
  position: relative;
  display: flex;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.92);
  transition: all 0.15s ease;
}

.mobile-icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.mobile-icon-btn--active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.mobile-icon-btn--avatar {
  background: rgba(255, 255, 255, 0.12);
}

.mobile-icon-badge {
  position: absolute;
  right: 0.15rem;
  top: 0.15rem;
  display: inline-flex;
  min-width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #ff3b30;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 59, 48, 0.28);
}

.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
