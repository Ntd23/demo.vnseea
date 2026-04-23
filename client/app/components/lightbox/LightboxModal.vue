<template>
  <UModal
    v-if="open"
    :open="open"
    :title="resolvedTitle"
    :description="counterLabel"
    class="sm:max-w-6xl"
    scrollable
    @update:open="handleOpenChange"
  >
    <template #body>
      <div class="space-y-5">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <UAlert
            color="primary"
            variant="subtle"
            icon="i-ph-image-square-bold"
            :title="t('feed.lightboxModal.viewTitle')"
            :description="statusDescription"
            class="rounded-[24px] lg:flex-1"
          />

          <div class="flex flex-wrap gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              class="justify-center rounded-full"
              :disabled="!hasCurrentItem"
              :aria-label="t('feed.lightboxModal.actionShare')"
              @click="emit('share')"
            >
              <Icon name="i-lucide-share-2" class="h-4 w-4" />
            </UButton>

            <UButton
              type="button"
              color="neutral"
              variant="outline"
              class="justify-center rounded-full"
              :disabled="!hasCurrentItem"
              :aria-label="t('feed.lightboxModal.actionDownload')"
              @click="emit('download')"
            >
              <Icon name="i-lucide-download" class="h-4 w-4" />
            </UButton>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section class="relative overflow-hidden rounded-[28px] bg-black/95 px-4 py-6 sm:px-6">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="lg"
              class="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full"
              :disabled="!canNavigate"
              :aria-label="t('feed.lightboxModal.actionPrevious')"
              @click="prev"
            >
              <Icon name="i-ph-caret-left-bold" class="h-5 w-5" />
            </UButton>

            <div class="flex min-h-[320px] items-center justify-center sm:min-h-[440px]">
              <NuxtImg
                v-if="currentItem?.type === 'image'"
                :src="currentItem.src"
                :alt="currentItem.alt || resolvedTitle"
                class="max-h-[72vh] max-w-full rounded-[22px] object-contain shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
                loading="eager"
                sizes="100vw sm:80vw lg:960px"
              />

              <video
                v-else-if="currentItem?.type === 'video'"
                controls
                playsinline
                preload="metadata"
                class="max-h-[72vh] max-w-full rounded-[22px] bg-black shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
              >
                <source :src="currentItem.src" :type="currentItem.mime || 'video/mp4'">
              </video>

              <UCard
                v-else
                class="w-full max-w-md rounded-[24px] border border-white/10 bg-slate-900/80 text-center shadow-none"
                :ui="{ body: 'p-8' }"
              >
                <div class="space-y-3 text-white">
                  <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <Icon name="i-ph-image-broken-fill" class="h-7 w-7" />
                  </div>
                  <p class="text-lg font-black">
                    {{ t("feed.lightboxModal.empty") }}
                  </p>
                </div>
              </UCard>
            </div>

            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="lg"
              class="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full"
              :disabled="!canNavigate"
              :aria-label="t('feed.lightboxModal.actionNext')"
              @click="next"
            >
              <Icon name="i-ph-caret-right-bold" class="h-5 w-5" />
            </UButton>
          </section>

          <aside class="space-y-4">
            <UCard class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
              <div class="flex flex-wrap items-center gap-2">
                <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[11px] font-semibold">
                  {{ counterLabel }}
                </UBadge>

                <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1.5 text-[11px] font-semibold">
                  {{ mediaTypeLabel }}
                </UBadge>
              </div>

              <p v-if="description" class="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                {{ description }}
              </p>
              <p v-else class="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                {{ t("feed.lightboxViewer.description", { count: items.length }) }}
              </p>
            </UCard>

            <UCard class="rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-md)]" :ui="{ body: 'p-4' }">
              <div class="flex items-start gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-bold text-white">
                  {{ authorInitials }}
                </div>

                <div class="min-w-0">
                  <p class="text-sm font-semibold text-[var(--text-primary)]">
                    {{ resolvedAuthor }}
                  </p>
                  <p v-if="caption" class="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {{ caption }}
                  </p>
                </div>
              </div>
            </UCard>

            <div class="grid gap-2">
              <UButton
                type="button"
                color="neutral"
                variant="outline"
                size="lg"
                class="justify-start rounded-[20px]"
                :disabled="!hasCurrentItem"
                @click="emit('like')"
              >
                <Icon name="i-ph-heart-fill" class="mr-2 h-4 w-4 text-[var(--color-accent-500)]" />
                {{ t("feed.lightboxModal.actionLike") }}
              </UButton>

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                size="lg"
                class="justify-start rounded-[20px]"
                :disabled="!hasCurrentItem"
                @click="emit('comment')"
              >
                <Icon name="i-ph-chat-circle-text-fill" class="mr-2 h-4 w-4 text-[var(--color-primary-600)]" />
                {{ t("feed.lightboxModal.actionComment") }}
              </UButton>

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                size="lg"
                class="justify-start rounded-[20px]"
                :disabled="!hasCurrentItem"
                @click="emit('share')"
              >
                <Icon name="i-ph-share-network-fill" class="mr-2 h-4 w-4 text-[var(--color-primary-600)]" />
                {{ t("feed.lightboxModal.actionShare") }}
              </UButton>
            </div>
          </aside>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
type LightboxItem = {
  type: "image" | "video"
  src: string
  alt?: string
  mime?: string
}

const { t } = useI18n()

const props = withDefaults(defineProps<{
  open?: boolean
  title?: string
  description?: string
  author?: string
  caption?: string
  items: ReadonlyArray<LightboxItem>
  currentIndex?: number
}>(), {
  open: false,
  title: "",
  description: "",
  author: "VNSEEA",
  caption: "",
  currentIndex: 0,
})

const emit = defineEmits<{
  close: []
  share: []
  download: []
  like: []
  comment: []
  change: [index: number]
}>()

const normalizedIndex = computed(() => {
  const total = props.items.length

  if (total === 0) return 0

  return ((props.currentIndex % total) + total) % total
})

const currentItem = computed(() => props.items[normalizedIndex.value] ?? null)
const hasCurrentItem = computed(() => Boolean(currentItem.value))
const canNavigate = computed(() => props.items.length > 1)
const resolvedTitle = computed(() => props.title || t("feed.lightboxModal.defaultTitle"))
const resolvedAuthor = computed(() => props.author || "VNSEEA")
const counterLabel = computed(() =>
  t("feed.lightboxModal.counter", {
    current: props.items.length === 0 ? 0 : normalizedIndex.value + 1,
    total: props.items.length,
  }),
)

const statusDescription = computed(() => {
  if (props.description) {
    return `${props.description} · ${t("feed.lightboxViewer.description", { count: props.items.length })}`
  }

  return t("feed.lightboxViewer.description", { count: props.items.length })
})

const mediaTypeLabel = computed(() => {
  if (currentItem.value?.type === "video") {
    return t("feed.lightboxModal.itemVideo")
  }

  return t("feed.lightboxModal.itemImage")
})

const authorInitials = computed(() => {
  const initials = resolvedAuthor.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "VN"
})

onMounted(() => {
  window.addEventListener("keydown", handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown)
})

function handleOpenChange(nextOpen: boolean) {
  if (!nextOpen) {
    emit("close")
  }
}

function prev() {
  if (!props.items.length) return

  emit("change", (normalizedIndex.value - 1 + props.items.length) % props.items.length)
}

function next() {
  if (!props.items.length) return

  emit("change", (normalizedIndex.value + 1) % props.items.length)
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.open || !props.items.length) return

  if (event.key === "ArrowLeft") {
    event.preventDefault()
    prev()
  }

  if (event.key === "ArrowRight") {
    event.preventDefault()
    next()
  }
}
</script>
