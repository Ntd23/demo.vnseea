<!-- English description: Shared navigation menu row for switching the persisted Nuxt application locale. -->
<template>
  <div class="locale-switcher">
    <div class="locale-switcher__identity">
      <Icon name="i-ph-translate-bold" class="locale-switcher__icon" />
    </div>

    <div
      class="locale-switcher__options"
      role="group"
      :aria-label="$t('navigation.mobileMenu.settingsNav.language')"
      :aria-busy="Boolean(pendingLocale)"
    >
      <button
        v-for="item in localeOptions"
        :key="item.code"
        type="button"
        class="locale-switcher__option"
        :class="{ 'locale-switcher__option--active': activeLocale === item.code }"
        :aria-label="item.name"
        :aria-pressed="activeLocale === item.code"
        :disabled="Boolean(pendingLocale)"
        @click.prevent.stop="changeLocale(item.code)"
      >
        {{ item.short }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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

async function changeLocale(code: string) {
  if (code === activeLocale.value || pendingLocale.value) {
    return
  }

  try {
    pendingLocale.value = code
    await setLocale(code)
  }
  finally {
    pendingLocale.value = ""
  }
}
</script>

<style scoped>
.locale-switcher {
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 10px 18px;
  color: var(--text-primary);
}

@media (max-width: 1279px) {
  .locale-switcher {
    padding: 10px 14px;
  }
}

.locale-switcher__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.locale-switcher__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--text-secondary, #64748b);
}

.locale-switcher__label {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.locale-switcher__options {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
  padding: 3px;
  border-radius: 10px;
  background: var(--bg-muted, #f1f5f9);
}

.locale-switcher__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary, #475569);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.locale-switcher__option:hover:not(.locale-switcher__option--active) {
  color: var(--text-primary, #0f172a);
  background: rgba(0, 0, 255, 0.04);
}

.locale-switcher__option--active {
  background: #ffffff !important;
  color: var(--bg-brand, #0000ff) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 255, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04) !important;
}

.locale-switcher__option:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
