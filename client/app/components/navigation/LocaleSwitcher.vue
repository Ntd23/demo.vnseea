<template>
  <div
    :class="compact
      ? 'inline-flex items-center gap-1 rounded-2xl border border-secondary-100 bg-secondary-50/50 p-1.5 ring-1 ring-inset ring-white/50 shadow-sm'
      : 'surface-card p-4 ring-1 ring-secondary-100 bg-white space-y-4'"
  >
    <div
      v-if="!compact"
      class="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-[0.3em] text-secondary-900"
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
        class="transition-all duration-300 rounded-xl font-black text-[10px] uppercase tracking-widest px-3 py-1.5"
        :class="[
          compact ? 'min-w-[40px] justify-center' : 'w-full justify-start py-3 px-4',
          activeLocale === item.code 
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
            : 'bg-white text-secondary-500 border border-secondary-100 hover:border-primary-200 hover:text-secondary-900'
        ]"
        @click="changeLocale(item.code)"
      >
        <template v-if="!compact">
          <div class="flex w-full items-center justify-between gap-4">
            <span class="text-xs">{{ item.short }}</span>
            <span class="text-[10px] font-medium normal-case text-secondary-400 group-hover:text-primary-400">{{ item.name }}</span>
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
