<!-- English description: Compact flag-based language toggle button switching between Vietnamese and English. -->
<template>
  <button
    type="button"
    class="header-action-btn lang-toggle-btn"
    :title="activeLocale === 'vi' ? 'Chuyển sang English' : 'Switch to Tiếng Việt'"
    :aria-label="activeLocale === 'vi' ? 'Chuyển sang English' : 'Switch to Tiếng Việt'"
    :disabled="Boolean(pendingLocale)"
    @click="toggleLanguage"
  >
    <div
      class="lang-flag-wrapper"
      :class="{ 'lang-flag--animating': isAnimating }"
    >
      <!-- Vietnam Flag -->
      <svg
        v-if="activeLocale === 'vi'"
        viewBox="0 0 32 32"
        class="h-5 w-5 rounded-full shadow-xs"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="16" fill="#da251d" />
        <polygon points="16,6 19.1,12.3 26.1,13.3 21,18.3 22.2,25.2 16,22 9.8,25.2 11,18.3 5.9,13.3 12.9,12.3" fill="#ffff00" />
      </svg>

      <!-- UK Flag -->
      <svg
        v-else
        viewBox="0 0 32 32"
        class="h-5 w-5 rounded-full shadow-xs"
        aria-hidden="true"
      >
        <clipPath id="uk-flag-clip"><circle cx="16" cy="16" r="16" /></clipPath>
        <g clip-path="url(#uk-flag-clip)">
          <rect width="32" height="32" fill="#012169" />
          <path d="M0,0 L32,32 M32,0 L0,32" stroke="#ffffff" stroke-width="6" />
          <path d="M0,0 L32,32 M32,0 L0,32" stroke="#c8102e" stroke-width="2" />
          <path d="M16,0 V32 M0,16 H32" stroke="#ffffff" stroke-width="10" />
          <path d="M16,0 V32 M0,16 H32" stroke="#c8102e" stroke-width="6" />
        </g>
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const pendingLocale = ref("")
const isAnimating = ref(false)

const activeLocale = computed(() => String(locale.value))

async function toggleLanguage() {
  if (pendingLocale.value) return

  const targetLocale = activeLocale.value === "vi" ? "en" : "vi"
  isAnimating.value = true

  try {
    pendingLocale.value = targetLocale
    await setLocale(targetLocale)
  }
  finally {
    pendingLocale.value = ""
    setTimeout(() => {
      isAnimating.value = false
    }, 400)
  }
}
</script>

<style scoped>
.header-action-btn {
  position: relative;
  display: inline-flex;
  height: 38px;
  width: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
}

.header-action-btn:hover {
  border-color: var(--border-light);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

@media (max-width: 1279.98px) {
  .header-action-btn {
    height: 40px;
    width: 40px;
    background: var(--bg-muted);
  }
}

.lang-flag-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lang-toggle-btn:hover .lang-flag-wrapper {
  transform: scale(1.15);
}

.lang-flag--animating {
  animation: flip-flag 0.4s ease-in-out;
}

@keyframes flip-flag {
  0% {
    transform: scale(1) rotateY(0deg);
  }
  50% {
    transform: scale(0.6) rotateY(90deg);
  }
  100% {
    transform: scale(1) rotateY(0deg);
  }
}
</style>
