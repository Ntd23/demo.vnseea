<template>
  <div class="flex items-start justify-between gap-3">
    <div class="flex items-center gap-2.5">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0000ff] text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,255,0.2)] sm:h-11 sm:w-11">
        {{ initials }}
      </div>
      <div>
        <div class="flex items-center gap-1.5">
          <p class="text-[13px] font-bold text-slate-900 sm:text-sm">{{ author }}</p>
          <button class="text-[11px] font-bold text-[#0000ff] hover:underline" type="button">Theo dõi</button>
        </div>
        <div class="flex items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
          <span>{{ role }}</span>
          <span>•</span>
          <span>{{ time }}</span>
          <span>•</span>
          <Icon :name="audienceIcon" class="h-3 w-3" :title="audience" />
        </div>
      </div>
    </div>

    <!-- 3-dot menu -->
    <div ref="menuRef" class="relative">
      <button
        class="rounded-full p-2 text-slate-400 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]"
        :class="{ 'bg-[#0000ff]/5 text-[#0000ff]': open }"
        type="button"
        @click="open = !open"
      >
        <Icon name="i-lucide-more-horizontal" class="h-5 w-5" />
      </button>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition duration-150 ease-out origin-top-right"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in origin-top-right"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="open"
          class="absolute right-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-[18px] border border-[#0000ff]/10 bg-white shadow-[0_12px_40px_rgba(0,0,255,0.13)]"
        >
          <div class="py-1.5">
            <button
              v-for="item in menuItems"
              :key="item.label"
              class="group/item flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#0000ff]/4"
              :class="item.danger ? 'hover:bg-red-50' : ''"
              type="button"
              @click="item.action"
            >
              <span
                class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0000ff]/6 text-[#0000ff]/70 transition group-hover/item:bg-[#0000ff]/10 group-hover/item:text-[#0000ff]"
                :class="item.danger ? 'bg-red-50 text-red-400 group-hover/item:bg-red-100 group-hover/item:text-red-500' : ''"
              >
                <Icon :name="item.icon" class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <p
                  class="text-[13px] font-semibold leading-tight text-slate-800 transition"
                  :class="item.danger ? 'group-hover/item:text-red-600' : 'group-hover/item:text-[#0000ff]'"
                >
                  {{ item.label }}
                </p>
                <p class="mt-0.5 text-[11px] leading-tight text-slate-400">{{ item.desc }}</p>
              </div>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  author: string
  role: string
  time: string
  audience: string
}>()

const initials = computed(() =>
  props.author
    .split(" ")
    .slice(0, 2)
    .map(part => part[0])
    .join(""),
)

const audienceIcon = computed(() => {
  const map: Record<string, string> = {
    'Công khai': 'i-ph-globe-simple',
    'Public': 'i-ph-globe-simple',
    'Bạn bè': 'i-ph-users',
    'Friends': 'i-ph-users',
    'Chỉ mình tôi': 'i-ph-lock-simple',
    'Only me': 'i-ph-lock-simple',
  }
  return map[props.audience] || 'i-ph-globe-simple'
})

const open = ref(false)
const menuRef = ref<HTMLElement>()

const menuItems = [
  {
    label: "Xóa bài đăng",
    desc: "Xóa hoàn toàn bài đăng này.",
    icon: "i-lucide-trash-2",
    danger: true,
    action: () => { open.value = false },
  },
  {
    label: "Lưu bài đăng",
    desc: "Thêm bài đăng này vào danh sách yêu thích của bạn.",
    icon: "i-lucide-bookmark",
    danger: false,
    action: () => { open.value = false },
  },
  {
    label: "Báo cáo về bài đăng",
    desc: "Báo cáo bài đăng này cho chúng tôi.",
    icon: "i-lucide-flag",
    danger: false,
    action: () => { open.value = false },
  },
  {
    label: "Mở bài đăng trong tab mới",
    desc: "Xem bài đăng này trong một tab mới.",
    icon: "i-lucide-external-link",
    danger: false,
    action: () => { window.open(window.location.href, "_blank"); open.value = false },
  },
  {
    label: "Ẩn bài đăng",
    desc: "Tôi không muốn xem bài đăng này nữa.",
    icon: "i-lucide-eye-off",
    danger: false,
    action: () => { open.value = false },
  },
]

// Close on outside click
onMounted(() => document.addEventListener("mousedown", onOutside))
onUnmounted(() => document.removeEventListener("mousedown", onOutside))
const onOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) open.value = false
}
</script>
