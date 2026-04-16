<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center" @click.self="$emit('close')">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="$emit('close')" />

        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-6 scale-[0.97]" enter-to-class="opacity-100 translate-y-0 scale-100">
          <div v-if="open" class="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_50px_rgba(0,0,255,0.13)] sm:max-h-[90vh] sm:rounded-[28px]">
            <div class="flex shrink-0 items-center justify-between border-b border-[#0000ff]/8 px-5 py-4">
              <div class="flex items-center gap-2.5">
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#0000ff]/8 text-[#0000ff]">
                  <Icon name="i-lucide-share-2" class="h-[18px] w-[18px]" />
                </div>
                <div>
                  <span class="block font-semibold text-slate-800">Chia sẻ bài đăng</span>
                  <span class="block text-[12px] text-slate-500">Chia sẻ tới timeline, group hoặc page</span>
                </div>
              </div>
              <button class="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#0000ff]/5 hover:text-[#0000ff]" type="button" @click="$emit('close')">
                <Icon name="i-lucide-x" class="h-[18px] w-[18px]" />
              </button>
            </div>

            <div class="flex-1 space-y-5 overflow-y-auto p-5">
              <div>
                <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0000ff]/50">Chia sẻ qua</p>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button v-for="platform in platforms" :key="platform.label" class="flex flex-col items-center gap-1.5 rounded-[16px] border border-[#0000ff]/10 bg-white py-3 text-[11px] font-medium text-slate-600 transition hover:border-[#0000ff]/30 hover:bg-[#0000ff]/4 hover:text-[#0000ff]" type="button" @click="platform.action">
                    <span class="flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#0000ff]/10 bg-[#0000ff]/6 text-[#0000ff]">
                      <Icon :name="platform.icon" class="h-[22px] w-[22px]" />
                    </span>
                    <span>{{ platform.label }}</span>
                  </button>
                </div>

                <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
                  <div v-if="copied" class="mt-2 flex items-center gap-2 rounded-[12px] border border-[#0000ff]/20 bg-[#0000ff]/5 px-3 py-2 text-xs font-medium text-[#0000ff]">
                    <Icon name="i-lucide-check-circle-2" class="h-4 w-4 shrink-0" />
                    Đã sao chép liên kết!
                  </div>
                </Transition>
              </div>

              <div class="flex items-center gap-3">
                <div class="h-px flex-1 bg-[#0000ff]/8" />
                <span class="text-[11px] font-medium text-[#0000ff]/35">hoặc chia sẻ lên</span>
                <div class="h-px flex-1 bg-[#0000ff]/8" />
              </div>

              <div>
                <textarea v-model="caption" placeholder="Thêm ghi chú cho bài chia sẻ..." rows="3" class="w-full resize-none rounded-[14px] border border-[#0000ff]/15 bg-[#0000ff]/3 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-[#0000ff]/40 focus:ring-2 focus:ring-[#0000ff]/8" />
              </div>

              <div>
                <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0000ff]/50">Đích chia sẻ</p>
                <div class="grid grid-cols-2 gap-2">
                  <button v-for="dest in destinations" :key="dest.value" class="flex items-center gap-3 rounded-[16px] border px-4 py-3 text-left text-sm font-medium transition" :class="selectedDest === dest.value ? 'border-[#0000ff] bg-[#0000ff]/5 text-[#0000ff]' : 'border-[#0000ff]/10 bg-white text-slate-600 hover:border-[#0000ff]/30 hover:text-[#0000ff]'" type="button" @click="selectedDest = dest.value">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition" :class="selectedDest === dest.value ? 'bg-[#0000ff] text-white' : 'bg-[#0000ff]/8 text-[#0000ff]'">
                      <Icon :name="dest.icon" class="h-4 w-4" />
                    </span>
                    <span class="leading-tight">{{ dest.label }}</span>
                  </button>
                </div>
              </div>

              <div v-if="post" class="rounded-[16px] border border-[#0000ff]/10 bg-[#0000ff]/3 p-3">
                <p class="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/40">Xem trước bài đăng</p>
                <div class="flex items-start gap-2">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0000ff] text-[10px] font-bold text-white">
                    {{ post.author.slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-[12px] font-semibold text-slate-800">{{ post.author }}</p>
                    <p class="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-slate-600">{{ post.text }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="shrink-0 border-t border-[#0000ff]/8 px-5 py-4">
              <button :disabled="!selectedDest" class="flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,255,0.25)] transition disabled:opacity-40" :class="shared ? 'bg-[#0000ff]/70' : 'bg-[#0000ff] hover:bg-[#0000cc]'" type="button" @click="onShare">
                <Transition mode="out-in" enter-active-class="transition duration-150" enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100">
                  <span v-if="shared" class="flex items-center gap-2">
                    <Icon name="i-lucide-check" class="h-4 w-4" /> Đã chia sẻ!
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <Icon name="i-lucide-share-2" class="h-4 w-4" /> Chia sẻ
                  </span>
                </Transition>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open?: boolean
  post?: {
    author: string
    text: string
  } | null
}>(), {
  open: false,
  post: null,
})

const emit = defineEmits<{ close: [] }>()

const caption = ref('')
const copied = ref(false)
const shared = ref(false)
const selectedDest = ref('timeline')

const pageUrl = computed(() => typeof window !== 'undefined' ? window.location.href : '')
const shareText = computed(() => caption.value || props.post?.text || '')

const platforms = [
  {
    label: 'Facebook',
    icon: 'i-simple-icons-facebook',
    action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl.value)}`, '_blank'),
  },
  {
    label: 'WhatsApp',
    icon: 'i-simple-icons-whatsapp',
    action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText.value + ' ' + pageUrl.value)}`, '_blank'),
  },
  {
    label: 'Telegram',
    icon: 'i-simple-icons-telegram',
    action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(pageUrl.value)}&text=${encodeURIComponent(shareText.value)}`, '_blank'),
  },
  {
    label: 'Sao chép',
    icon: 'i-lucide-link-2',
    action: async () => {
      await navigator.clipboard.writeText(pageUrl.value)
      copied.value = true
      setTimeout(() => { copied.value = false }, 2500)
    },
  },
]

const destinations = [
  { label: 'Dòng thời gian', value: 'timeline', icon: 'i-lucide-layout-list' },
  { label: 'Trang', value: 'page', icon: 'i-lucide-flag' },
  { label: 'Tập đoàn', value: 'group', icon: 'i-lucide-users-2' },
  { label: 'Tin nhắn', value: 'message', icon: 'i-lucide-send' },
]

const onShare = () => {
  if (!selectedDest.value) return
  shared.value = true
  setTimeout(() => {
    shared.value = false
    emit('close')
  }, 1400)
}

watch(() => props.open, (val) => {
  if (!val) {
    setTimeout(() => {
      caption.value = ''
      copied.value = false
      shared.value = false
      selectedDest.value = 'timeline'
    }, 200)
  }
})
</script>
