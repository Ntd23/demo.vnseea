<!-- Description: Renders a media-first lightbox with side details, navigation, and action controls, aligned to the legacy PHP viewer structure. -->
<template>
  <UModal
    v-if="open"
    :open="open"
    :title="resolvedTitle"
    :description="counterLabel"
    class="sm:max-w-7xl"
    scrollable
    @update:open="handleOpenChange"
  >
    <template #body>
      <div class="overflow-hidden rounded-[28px] bg-[#020617] text-white">
        <div class="grid min-h-[70vh] lg:grid-cols-[minmax(0,1fr)_340px]">
          <section class="relative flex min-h-[360px] items-center justify-center border-b border-white/10 px-4 py-6 sm:px-6 lg:border-b-0 lg:border-r">
            <div class="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/82 backdrop-blur">
                <span>{{ counterLabel }}</span>
                <span class="text-white/30">/</span>
                <span>{{ mediaTypeLabel }}</span>
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  type="button"
                  color="neutral"
                  variant="soft"
                  class="rounded-full border border-white/10 bg-black/35 text-white"
                  :disabled="!hasCurrentItem"
                  :aria-label="t('feed.lightboxModal.actionShare')"
                  @click="emit('share')"
                >
                  <Icon name="i-ph-share-network-fill" class="h-4 w-4" />
                </UButton>
                <UButton
                  type="button"
                  color="neutral"
                  variant="soft"
                  class="rounded-full border border-white/10 bg-black/35 text-white"
                  :disabled="!hasCurrentItem"
                  :aria-label="t('feed.lightboxModal.actionDownload')"
                  @click="emit('download')"
                >
                  <Icon name="i-ph-download-simple-bold" class="h-4 w-4" />
                </UButton>
              </div>
            </div>

            <UButton
              type="button"
              color="neutral"
              variant="soft"
              size="lg"
              class="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/35 text-white backdrop-blur"
              :disabled="!canNavigate"
              :aria-label="t('feed.lightboxModal.actionPrevious')"
              @click="prev"
            >
              <Icon name="i-ph-caret-left-bold" class="h-5 w-5" />
            </UButton>

            <div class="flex min-h-[320px] w-full items-center justify-center sm:min-h-[440px]">
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
                class="w-full max-w-md rounded-[24px] border border-white/10 bg-slate-900/80 text-center text-white shadow-none"
                :ui="{ body: 'p-8' }"
              >
                <div class="space-y-3">
                  <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <Icon name="i-ph-image-broken-fill" class="h-7 w-7" />
                  </div>
                  <p class="text-lg font-extrabold">
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
              class="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/35 text-white backdrop-blur"
              :disabled="!canNavigate"
              :aria-label="t('feed.lightboxModal.actionNext')"
              @click="next"
            >
              <Icon name="i-ph-caret-right-bold" class="h-5 w-5" />
            </UButton>
          </section>

          <aside class="flex flex-col gap-4 bg-[#020617] p-4 sm:p-5">
            <section class="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur">
              <div class="flex items-start gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[12px] font-bold text-white">
                  {{ authorInitials }}
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-white">
                    {{ resolvedAuthor }}
                  </p>
                  <p class="mt-1 text-[13px] leading-6 text-white/70">
                    {{ resolvedTitle }}
                  </p>
                </div>
              </div>

              <p v-if="caption" class="mt-4 text-sm leading-6 text-white/72">
                {{ caption }}
              </p>
              <p v-if="description" class="mt-2 text-sm leading-6 text-white/58">
                {{ description }}
              </p>
            </section>

            <section class="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur">
              <div class="grid gap-2">
                <UButton
                  type="button"
                  color="neutral"
                  variant="soft"
                  size="lg"
                  class="justify-start rounded-[18px] border border-white/10 bg-black/20 text-white"
                  :disabled="!hasCurrentItem"
                  @click="emit('like')"
                >
                  <Icon name="i-ph-heart-fill" class="mr-2 h-4 w-4 text-[#f97316]" />
                  {{ t("feed.lightboxModal.actionLike") }}
                </UButton>

                <UButton
                  type="button"
                  color="neutral"
                  variant="soft"
                  size="lg"
                  class="justify-start rounded-[18px] border border-white/10 bg-black/20 text-white"
                  :disabled="!hasCurrentItem"
                  @click="emit('comment')"
                >
                  <Icon name="i-ph-chat-circle-text-fill" class="mr-2 h-4 w-4" />
                  {{ t("feed.lightboxModal.actionComment") }}
                </UButton>

                <UButton
                  type="button"
                  color="neutral"
                  variant="soft"
                  size="lg"
                  class="justify-start rounded-[18px] border border-white/10 bg-black/20 text-white"
                  :disabled="!hasCurrentItem"
                  @click="emit('share')"
                >
                  <Icon name="i-ph-share-network-fill" class="mr-2 h-4 w-4" />
                  {{ t("feed.lightboxModal.actionShare") }}
                </UButton>
              </div>
            </section>

            <section v-if="items.length > 1" class="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
                {{ t("feed.lightboxViewer.description", { count: items.length }) }}
              </p>

              <div class="mt-3 grid grid-cols-4 gap-2">
                <button
                  v-for="(item, index) in items"
                  :key="`${item.src}-${index}`"
                  type="button"
                  class="overflow-hidden rounded-[14px] border transition"
                  :class="index === normalizedIndex
                    ? 'border-white/30 ring-2 ring-white/18'
                    : 'border-white/10 hover:border-white/20'"
                  @click="emit('change', index)"
                >
                  <NuxtImg
                    v-if="item.type === 'image'"
                    :src="item.src"
                    :alt="item.alt || resolvedTitle"
                    class="h-16 w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-16 w-full items-center justify-center bg-black/45 text-white/72"
                  >
                    <Icon name="i-ph-play-circle-fill" class="h-6 w-6" />
                  </div>
                </button>
              </div>
            </section>
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
