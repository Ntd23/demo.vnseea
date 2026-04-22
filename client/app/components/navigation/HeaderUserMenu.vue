  <details class="group relative">
    <summary class="flex list-none cursor-pointer items-center gap-3 rounded-2xl border border-secondary-100 bg-secondary-50/50 px-3 py-1.5 transition-all hover:bg-white hover:ring-2 hover:ring-primary-500/20 group-open:ring-2 group-open:ring-primary-500/20">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-[10px] font-black text-white shadow-lg shadow-primary-500/20 ring-2 ring-white">
        VN
      </div>
      <div class="hidden text-left xl:block">
        <p class="text-xs font-black text-secondary-900 tracking-tight">Van Nguyen</p>
        <p class="text-[10px] font-bold text-secondary-400 uppercase tracking-widest text-[9px]">Mock User</p>
      </div>
      <Icon name="i-ph-caret-down-bold" class="h-3.5 w-3.5 text-secondary-400 transition-transform duration-300 group-open:rotate-180" />
    </summary>

    <div class="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 surface-card p-2 ring-1 ring-secondary-100 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div class="p-3 border-b border-secondary-50 mb-1">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 px-2">
          {{ $t("navigation.headerBar.account") }}
        </p>
      </div>

      <div class="space-y-1">
        <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-black text-secondary-600 transition-all hover:bg-primary-50 hover:text-primary-600 group/item">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 group-hover/item:bg-white border border-secondary-100 transition-colors">
            <Icon :name="item.icon" class="h-4.5 w-4.5" />
          </div>
          <span class="uppercase tracking-widest">{{ $t(item.label) }}</span>
        </NuxtLink>
      </div>

      <div class="mt-2 pt-2 border-t border-secondary-50">
        <NuxtLink to="/welcome" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-black text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-600 group/logout">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 group-hover/logout:bg-white border border-rose-100 transition-colors">
            <Icon name="i-ph-sign-out-duotone" class="h-4.5 w-4.5" />
          </div>
          <span class="uppercase tracking-widest">Dang xuat</span>
        </NuxtLink>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
const menuItems = [
  { label: "navigation.headerBar.home", to: "/home", icon: "i-ph-house-duotone" },
  { label: "navigation.headerBar.messages", to: "/messages", icon: "i-ph-chat-circle-dots-duotone" },
]
</script>
</template>
