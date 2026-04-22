<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm" @click.self="emit('close')">
        <div class="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#0000ff]/8 text-[#0000ff]">
                <Icon name="i-ph-image-square-bold" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800">{{ t("feed.lightboxModal.viewTitle") }}</p>
                <p class="text-[12px] text-slate-500">{{ t("feed.lightboxModal.counter", { current: currentIndex + 1, total: items.length }) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button" @click="emit('share')">
                <Icon name="i-lucide-share-2" class="h-4 w-4" />
              </button>
              <button class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button" @click="emit('download')">
                <Icon name="i-lucide-download" class="h-4 w-4" />
              </button>
              <button class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button" @click="emit('close')">
                <Icon name="i-lucide-x" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div class="relative flex items-center justify-center bg-black/95 px-4 py-6">
              <button class="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20" type="button" @click="prev">
                <Icon name="i-ph-caret-left-bold" class="h-5 w-5" />
              </button>

              <img v-if="currentItem?.type === 'image'" :src="currentItem.src" class="max-h-[72vh] max-w-full rounded-[18px] object-contain shadow-[0_10px_40px_rgba(0,0,0,0.3)]" :alt="currentItem.alt || 'media'">
              <video v-else-if="currentItem?.type === 'video'" controls class="max-h-[72vh] max-w-full rounded-[18px] bg-black shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <source :src="currentItem.src" :type="currentItem.mime || 'video/mp4'">
              </video>
              <div v-else class="rounded-[18px] bg-slate-800 px-6 py-8 text-center text-white">
                <p class="text-lg font-bold">{{ t("feed.lightboxModal.empty") }}</p>
              </div>

              <button class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20" type="button" @click="next">
                <Icon name="i-ph-caret-right-bold" class="h-5 w-5" />
              </button>
            </div>

            <aside class="flex min-h-0 flex-col border-t border-slate-200 bg-white lg:border-t-0 lg:border-l">
              <div class="border-b border-slate-200 px-4 py-3">
                <p class="text-sm font-bold text-slate-800">{{ resolvedTitle }}</p>
                <p class="mt-1 text-[12px] text-slate-500">{{ description }}</p>
              </div>

              <div class="flex-1 space-y-3 overflow-y-auto p-4">
                <div class="rounded-[18px] border border-[#0000ff]/10 bg-[#0000ff]/3 p-3">
                  <div class="flex items-start gap-2">
                    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0000ff] text-[10px] font-bold text-white">
                      {{ authorInitials }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-[13px] font-semibold text-slate-800">{{ resolvedAuthor }}</p>
                      <p class="text-[12px] leading-relaxed text-slate-600">{{ caption }}</p>
                    </div>
                  </div>
                </div>

                <button class="w-full rounded-[14px] border border-[#0000ff]/15 bg-white px-3 py-2 text-left text-[13px] font-semibold text-slate-600 transition hover:border-[#0000ff]/30 hover:text-[#0000ff]" type="button" @click="emit('like')">
                  {{ t("feed.lightboxModal.actionLike") }}
                </button>

                <button class="w-full rounded-[14px] border border-[#0000ff]/15 bg-white px-3 py-2 text-left text-[13px] font-semibold text-slate-600 transition hover:border-[#0000ff]/30 hover:text-[#0000ff]" type="button" @click="emit('comment')">
                  {{ t("feed.lightboxModal.actionComment") }}
                </button>

                <button class="w-full rounded-[14px] border border-[#0000ff]/15 bg-white px-3 py-2 text-left text-[13px] font-semibold text-slate-600 transition hover:border-[#0000ff]/30 hover:text-[#0000ff]" type="button" @click="emit('share')">
                  {{ t("feed.lightboxModal.actionShare") }}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = withDefaults(defineProps<{
  open?: boolean
  title?: string
  description?: string
  author?: string
  caption?: string
  items: Array<{ type: 'image' | 'video'; src: string; alt?: string; mime?: string }>
  currentIndex?: number
}>(), {
  open: false,
  title: "",
  description: "",
  author: "VNSEEA",
  caption: "",
  currentIndex: 0,
})

const emit = defineEmits<{ close: []; share: []; download: []; like: []; comment: []; change: [index: number] }>()

const currentItem = computed(() => props.items[props.currentIndex] ?? null)
const resolvedTitle = computed(() => props.title || t("feed.lightboxModal.defaultTitle"))
const resolvedAuthor = computed(() => props.author || "VNSEEA")
const authorInitials = computed(() => resolvedAuthor.value.slice(0, 2).toUpperCase())

const prev = () => {
  if (!props.items.length) return
  emit('change', (props.currentIndex - 1 + props.items.length) % props.items.length)
}

const next = () => {
  if (!props.items.length) return
  emit('change', (props.currentIndex + 1) % props.items.length)
}
</script>
