<template>
  <div class="flex items-start justify-between gap-3">
    <div class="flex items-center gap-2.5">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0000ff] text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,255,0.2)] sm:h-11 sm:w-11">
        {{ initials }}
      </div>
      <div>
        <div class="flex items-center gap-1.5">
          <p class="text-[13px] font-bold text-slate-900 sm:text-sm">{{ author }}</p>
          <UButton
            color="primary"
            variant="ghost"
            size="xs"
            class="rounded-full"
            :loading="followStatus === 'loading'"
            :disabled="followStatus === 'loading'"
            @click="toggleFollow"
          >
            {{ followLabel }}
          </UButton>
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
        :aria-label="t('feed.postHeader.menuOpenLabel')"
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
              :key="item.key"
              class="group/item flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#0000ff]/4"
              :class="item.danger ? 'hover:bg-red-50' : ''"
              type="button"
              @click="handleMenuAction(item)"
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
import { onClickOutside } from "@vueuse/core"

const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  author: string
  role: string
  time: string
  audience: string
  postUrl?: string
}>()

const emit = defineEmits<{
  menuAction: [action: string]
  follow: [followed: boolean]
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
const menuRef = ref<HTMLElement | null>(null)
const followed = ref(false)
const followStatus = ref<"idle" | "loading">("idle")

const followLabel = computed(() => {
  if (followStatus.value === "loading") return t("feed.postHeader.following")
  if (followed.value) return t("feed.postHeader.followed")
  return t("feed.postHeader.follow")
})

const menuItems = computed(() => [
  {
    key: "delete",
    label: t("feed.postHeader.menuDeleteLabel"),
    desc: t("feed.postHeader.menuDeleteDescription"),
    icon: "i-lucide-trash-2",
    danger: true,
  },
  {
    key: "save",
    label: t("feed.postHeader.menuSaveLabel"),
    desc: t("feed.postHeader.menuSaveDescription"),
    icon: "i-lucide-bookmark",
    danger: false,
  },
  {
    key: "report",
    label: t("feed.postHeader.menuReportLabel"),
    desc: t("feed.postHeader.menuReportDescription"),
    icon: "i-lucide-flag",
    danger: false,
  },
  {
    key: "open",
    label: t("feed.postHeader.menuOpenLabel"),
    desc: t("feed.postHeader.menuOpenDescription"),
    icon: "i-lucide-external-link",
    danger: false,
  },
  {
    key: "hide",
    label: t("feed.postHeader.menuHideLabel"),
    desc: t("feed.postHeader.menuHideDescription"),
    icon: "i-lucide-eye-off",
    danger: false,
  },
])

onClickOutside(menuRef, () => {
  open.value = false
})

async function toggleFollow() {
  if (followStatus.value === "loading") return

  followStatus.value = "loading"
  await new Promise(resolve => setTimeout(resolve, 200))
  followed.value = !followed.value
  followStatus.value = "idle"

  toast.add({
    color: "success",
    icon: "i-ph-check-circle-fill",
    title: props.author,
    description: followed.value ? t("feed.postHeader.followed") : t("feed.postHeader.follow"),
  })

  emit("follow", followed.value)
}

function handleMenuAction(item: { key: string; label: string; danger: boolean }) {
  open.value = false

  if (item.key === "open" && props.postUrl && import.meta.client) {
    window.open(props.postUrl, "_blank", "noopener,noreferrer")
  }

  toast.add({
    color: item.danger ? "warning" : "primary",
    icon: item.danger ? "i-ph-warning-circle-fill" : "i-ph-check-circle-fill",
    title: props.author,
    description: item.label,
  })

  emit("menuAction", item.key)
}
</script>
