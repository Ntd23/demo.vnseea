<template>
  <div
    :class="compact
      ? 'inline-flex items-center gap-1 rounded-full border border-[#dbe3f2] bg-[#f5f8ff] p-1'
      : 'rounded-[16px] border border-slate-200 bg-slate-50 p-2'"
  >
    <div
      v-if="!compact"
      class="mb-2 flex items-center gap-2 px-2 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500"
    >
      <Icon name="i-ph-translate" class="h-4 w-4" />
      <span>Language</span>
    </div>

    <div :class="compact ? 'flex items-center gap-1' : 'grid gap-2'">
      <button
        v-for="item in localeOptions"
        :key="item.code"
        :class="compact
          ? activeLocale === item.code
            ? 'rounded-full bg-[#0000ff] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_8px_18px_rgba(0,0,255,0.22)]'
            : 'rounded-full px-3 py-1.5 text-[11px] font-black text-[#4a5c7a] hover:bg-[#eef3ff] hover:text-[#0000ff]'
          : activeLocale === item.code
            ? 'border-[#0000ff] bg-white text-[#0000ff]'
            : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:text-[#0000ff]'"
        class="transition"
        type="button"
        @click="changeLocale(item.code)"
      >
        <span v-if="compact">{{ item.short }}</span>
        <span v-else class="flex w-full items-center justify-between gap-3 rounded-[12px] border px-3 py-2 text-left text-[13px] font-bold">
          <span>{{ item.short }}</span>
          <span class="text-[12px] font-semibold opacity-80">{{ item.name }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false,
})

const { locale, locales, setLocale } = useI18n()
const pendingLocale = ref("")

const localeOptions = computed(() =>
  locales.value.map((entry) => {
    if (typeof entry === "string") {
      return {
        code: entry,
        name: entry.toUpperCase(),
        short: entry.toUpperCase(),
      }
    }

    return {
      code: entry.code,
      name: entry.name ?? entry.code.toUpperCase(),
      short: entry.code.toUpperCase(),
    }
  }),
)

const activeLocale = computed(() => String(locale.value))

const changeLocale = async (code: string) => {
  if (code === activeLocale.value || pendingLocale.value) return

  try {
    pendingLocale.value = code
    await setLocale(code)
  }
  finally {
    pendingLocale.value = ""
  }
}
</script>
