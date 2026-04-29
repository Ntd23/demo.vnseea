<template>
  <div
    :class="compact
      ? 'inline-flex items-center gap-1 rounded-2xl border border-[#e2e8f0] bg-white p-1.5 shadow-sm'
      : 'surface-card p-4 ring-1 ring-secondary-100 bg-white space-y-4'"
  >
    <div
      v-if="!compact"
      class="flex items-center gap-2 px-1 text-[11px] font-semibold text-slate-500"
    >
      <Icon name="i-ph-translate-duotone" class="h-4 w-4" />
      <span>Language</span>
    </div>

    <div :class="compact ? 'flex items-center gap-1' : 'grid gap-2.5'">
      <UButton
        v-for="item in localeOptions"
        :key="item.code"
        variant="soft"
        :color="activeLocale === item.code ? 'primary' : 'white'"
        class="rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-all duration-150"
        :class="[
          compact ? 'min-w-[40px] justify-center' : 'w-full justify-start py-3 px-4',
          activeLocale === item.code 
            ? 'border-[#0000ff] bg-[#0000ff] text-white shadow-lg shadow-primary-500/20' 
            : 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569] hover:border-[rgba(0,0,255,0.16)] hover:bg-[rgba(0,0,255,0.04)] hover:text-[#0000ff]'
        ]"
        @click="changeLocale(item.code)"
      >
        <template v-if="!compact">
          <div class="flex w-full items-center justify-between gap-4">
            <span class="text-xs">{{ item.short }}</span>
            <span class="text-[10px] font-medium normal-case text-[var(--text-primary)] group-hover:text-primary-400">{{ item.name }}</span>
          </div>
        </template>
        <template v-else>
          {{ item.short }}
        </template>
      </UButton>
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
