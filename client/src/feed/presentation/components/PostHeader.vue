<!-- Description: Renders the post header with backend-backed author metadata and a reduced action menu without mock follow behavior. -->
<template>
  <div class="post-header">
    <div class="post-header__left">
      <div class="post-header__avatar">
        <img
          v-if="authorAvatarUrl"
          :src="authorAvatarUrl"
          :alt="author"
          class="post-header__avatar-image"
        >
        <span v-else>{{ initials }}</span>
      </div>
      <div class="post-header__info">
        <div class="post-header__name-row">
          <p class="post-header__name">{{ author }}</p>
        </div>
        <div class="post-header__meta">
          <span>{{ role }}</span>
          <span class="post-header__dot">·</span>
          <span>{{ time }}</span>
          <span class="post-header__dot">·</span>
          <Icon :name="audienceIcon" class="post-header__audience-icon" :title="audience" />
        </div>
      </div>
    </div>

    <div ref="menuRef" class="relative">
      <button
        class="post-header__menu-btn"
        :class="{ 'post-header__menu-btn--open': open }"
        type="button"
        :aria-label="t('feed.postHeader.menuOpenLabel')"
        @click="open = !open"
      >
        <Icon name="i-lucide-more-horizontal" class="h-5 w-5" />
      </button>

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
          class="post-header__dropdown"
        >
          <div class="py-1">
            <button
              v-for="item in menuItems"
              :key="item.key"
              class="post-header__dropdown-item"
              :class="{ 'post-header__dropdown-item--danger': item.danger }"
              type="button"
              @click="handleMenuAction(item)"
            >
              <span class="post-header__dropdown-icon-wrap" :class="{ 'post-header__dropdown-icon-wrap--danger': item.danger }">
                <Icon :name="item.icon" class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <p class="post-header__dropdown-label" :class="{ 'post-header__dropdown-label--danger': item.danger }">
                  {{ item.label }}
                </p>
                <p class="post-header__dropdown-desc">{{ item.desc }}</p>
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

const props = defineProps<{
  author: string
  authorAvatarUrl?: string
  role: string
  time: string
  audience: string
}>()

const emit = defineEmits<{
  menuAction: [action: string]
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
    Public: "i-ph-globe-simple",
    Friends: "i-ph-users",
    Group: "i-ph-users-three",
    "Only me": "i-ph-lock-simple",
  }
  return map[props.audience] || "i-ph-globe-simple"
})

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const menuItems = computed(() => [
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
    key: "copy",
    label: t("feed.postHeader.menuCopyLabel"),
    desc: t("feed.postHeader.menuCopyDescription"),
    icon: "i-lucide-copy",
    danger: false,
  },
])

onClickOutside(menuRef, () => {
  open.value = false
})

function handleMenuAction(item: { key: string }) {
  open.value = false
  emit("menuAction", item.key)
}
</script>

<style scoped>
.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.post-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.post-header__avatar {
  display: flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(145deg, #3333ff 0%, #0000ff 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 4px 14px rgba(0, 0, 255, 0.18);
}

.post-header__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-header__info {
  min-width: 0;
}

.post-header__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-header__name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.post-header__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  font-size: 12px;
  color: #94a3b8;
}

.post-header__dot {
  color: #cbd5e1;
}

.post-header__audience-icon {
  width: 13px;
  height: 13px;
}

.post-header__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s ease;
}

.post-header__menu-btn:hover,
.post-header__menu-btn--open {
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
}

.post-header__dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 30;
  margin-top: 4px;
  width: 260px;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 255, 0.08);
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(0, 0, 255, 0.1);
}

.post-header__dropdown-item {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.12s ease;
}

.post-header__dropdown-item:hover {
  background: rgba(0, 0, 255, 0.03);
}

.post-header__dropdown-icon-wrap {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 255, 0.05);
  color: rgba(0, 0, 255, 0.6);
  margin-top: 2px;
  transition: all 0.12s ease;
}

.post-header__dropdown-item:hover .post-header__dropdown-icon-wrap {
  background: rgba(0, 0, 255, 0.08);
  color: #0000ff;
}

.post-header__dropdown-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.post-header__dropdown-desc {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  line-height: 1.3;
}
</style>
