<!-- English description: Renders the branded visual hero panel shared by guest authentication pages. -->
<template>
  <aside class="auth-hero" aria-labelledby="auth-hero-title">
    <!-- Background effects -->
    <div class="auth-hero__bg" aria-hidden="true">
      <span class="auth-hero__orb auth-hero__orb--a animate-pulse" />
      <span class="auth-hero__orb auth-hero__orb--b" />
      <span class="auth-hero__orb auth-hero__orb--c animate-pulse" />
      <span class="auth-hero__grid" />
    </div>

    <!-- Centered Header Wrapper (Aligns logo with content area) -->
    <div class="auth-hero__header-wrapper">
      <header v-if="hasBrandIdentity" class="auth-hero__brand">
        <div class="auth-hero__brand-shell">
          <div class="auth-hero__brand-icon">
            <NuxtImg
              v-if="optimizedLogoUrl && !logoFailed"
              :src="optimizedLogoUrl"
              :alt="logoAlt"
              width="124"
              densities="1x 2x"
              loading="eager"
              class="auth-hero__brand-logo"
              @error="logoFailed = true"
            />
            <Icon v-else name="i-ph-sparkles-fill" class="h-10 w-10 text-[var(--text-media)]" />
          </div>
          <div class="auth-hero__brand-ring" />
        </div>
      </header>
    </div>

    <!-- Unified Visual & Form Core -->
    <div class="auth-hero__visual-core">
      <!-- Left side: Graphical interactive widgets (Hidden on mobile, visible on desktop) -->
      <div class="auth-hero__graphics" aria-hidden="true">
        <!-- 1. Central Portal (Globe & Network) -->
        <div class="hero-widget hero-widget--central">
          <div class="hero-widget__orbit">
            <div class="hero-widget__node hero-widget__node--center">
              <Icon name="i-ph-globe-hemisphere-east-duotone" class="h-12 w-12 text-[var(--text-media)]" />
            </div>
            <!-- Orbiting Nodes -->
            <div class="hero-widget__node hero-widget__node--orbit-1">
              <Icon name="i-ph-chat-circle-dots-duotone" class="w-5 h-5 text-rose-300" />
            </div>
            <div class="hero-widget__node hero-widget__node--orbit-2">
              <Icon name="i-ph-heart-duotone" class="w-5 h-5 text-rose-300" />
            </div>
            <div class="hero-widget__node hero-widget__node--orbit-3">
              <Icon name="i-ph-paper-plane-tilt-duotone" class="w-5 h-5 text-emerald-300" />
            </div>
            <div class="hero-widget__node hero-widget__node--orbit-4">
              <Icon name="i-ph-phone-duotone" class="w-5 h-5 text-amber-300" />
            </div>
          </div>
        </div>

        <!-- 2. Asymmetric Floating Widgets -->
        <div class="hero-widget-grid">
          <!-- Widget A: Connections & Sharing -->
          <div class="hero-widget hero-widget--glass hero-widget--a">
            <div class="widget-header">
              <Icon name="i-ph-share-network-duotone" class="h-6 w-6 text-[var(--text-brand)]" />
              <div class="widget-status-dot" />
            </div>
            <div class="widget-avatars">
              <span class="widget-avatar-shell"><Icon name="i-ph-user-circle-duotone" class="h-6 w-6 text-[var(--text-media)] opacity-90" /></span>
              <span class="widget-avatar-shell"><Icon name="i-ph-user-circle-duotone" class="h-6 w-6 text-[var(--text-media)] opacity-70" /></span>
              <span class="widget-avatar-shell"><Icon name="i-ph-user-circle-duotone" class="h-6 w-6 text-[var(--text-media)] opacity-50" /></span>
              <span class="widget-avatar-add"><Icon name="i-ph-plus-bold" class="h-3 w-3 text-[var(--text-media)]" /></span>
            </div>
          </div>

          <!-- Widget B: Boost / Lightning -->
          <div class="hero-widget hero-widget--glass hero-widget--b">
            <div class="widget-icon-box widget-icon-box--amber">
              <Icon name="i-ph-lightning-duotone" class="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div class="widget-bars">
              <span class="widget-bar" style="height: 12px; animation-delay: 0.1s;" />
              <span class="widget-bar" style="height: 24px; animation-delay: 0.2s;" />
              <span class="widget-bar widget-bar--active animate-pulse" style="height: 38px; animation-delay: 0.3s;" />
              <span class="widget-bar" style="height: 18px; animation-delay: 0.4s;" />
            </div>
          </div>

          <!-- Widget C: Media & Music -->
          <div class="hero-widget hero-widget--glass hero-widget--c">
            <div class="widget-icon-box widget-icon-box--rose">
              <Icon name="i-ph-music-notes-simple-duotone" class="w-6 h-6 text-rose-400" />
            </div>
            <div class="widget-wave">
              <span class="wave-bar" style="animation-delay: 0.1s;" />
              <span class="wave-bar" style="animation-delay: 0.3s;" />
              <span class="wave-bar" style="animation-delay: 0.2s;" />
              <span class="wave-bar" style="animation-delay: 0.4s;" />
            </div>
          </div>

          <!-- Widget D: Security & Crown -->
          <div class="hero-widget hero-widget--glass hero-widget--d">
            <div class="widget-badge-circle">
              <Icon name="i-ph-shield-check-duotone" class="w-8 h-8 text-emerald-400" />
            </div>
            <div class="widget-badge-mini">
              <Icon name="i-ph-crown-duotone" class="w-4 h-4 text-amber-300" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Authentication Form Card (Slot) -->
      <main class="auth-hero__form-container"> <!-- Negative top margin to counteract padding and prevent scrollbar -->
        <div class="auth-hero__form-card">
          <slot />
        </div>
      </main>
    </div>

    <footer class="auth-hero__footer" aria-label="Public site links">
      <span class="auth-hero__footer-copy">
        © {{ currentYear }} {{ footerBrandName }}
      </span>
      <template v-for="link in footerLinks" :key="link.to">
        <span class="auth-hero__footer-separator" aria-hidden="true">•</span>
        <NuxtLink
          class="auth-hero__footer-link"
          :to="link.to"
        >
          {{ link.label }}
        </NuxtLink>
      </template>
      <span class="auth-hero__footer-separator" aria-hidden="true">•</span>
      <button
        type="button"
        class="auth-hero__footer-link auth-hero__footer-button"
        @click="languageModalOpen = true"
      >
        <Icon name="i-ph-globe-hemisphere-east-duotone" class="h-3.5 w-3.5" />
        <span>{{ t("auth.footer.language") }}</span>
      </button>
    </footer>

    <Teleport to="body">
      <div
        v-if="languageModalOpen"
        class="auth-language-modal"
        role="presentation"
        @click.self="languageModalOpen = false"
      >
        <section
          class="auth-language-modal__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="languageModalTitleId"
          :aria-describedby="languageModalDescriptionId"
        >
          <header class="auth-language-modal__header">
            <div>
              <h2 :id="languageModalTitleId" class="auth-language-modal__title">
                {{ t('auth.footer.languageTitle') }}
              </h2>
              <p :id="languageModalDescriptionId" class="auth-language-modal__description">
                {{ t('auth.footer.languageDescription') }}
              </p>
            </div>
            <button
              type="button"
              class="auth-language-modal__close"
              aria-label="Close language dialog"
              @click="languageModalOpen = false"
            >
              <Icon name="i-ph-x-bold" class="h-5 w-5" />
            </button>
          </header>
        <div class="auth-hero__language-list">
          <button
            v-for="item in localeOptions"
            :key="item.code"
            type="button"
            class="auth-hero__language-option"
            :class="{ 'auth-hero__language-option--active': item.code === activeLocale }"
            @click="changeLocale(item.code)"
          >
            <span class="auth-hero__language-copy">
              <span class="auth-hero__language-name">{{ item.name }}</span>
              <span class="auth-hero__language-code">{{ item.short }}</span>
            </span>
            <Icon
              v-if="item.code === activeLocale"
              name="i-ph-check-circle-fill"
              class="h-5 w-5 text-[var(--text-brand)]"
            />
          </button>
        </div>
        </section>
      </div>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useSiteBrandingStore } from "../../../site-branding/application/stores/useSiteBrandingStore"

const props = withDefaults(defineProps<{
  title: string
  subtitle: string
  imageSrc?: string
  imageAlt?: string
}>(), {
  imageSrc: '',
  imageAlt: '',
})

const { t, locale, locales, setLocale } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)
const logoFailed = ref(false)
const languageModalOpen = ref(false)
const languageModalTitleId = "auth-language-modal-title"
const languageModalDescriptionId = "auth-language-modal-description"
const pendingLocale = ref("")
const currentYear = new Date().getFullYear()

const brandName = computed(() => branding.value.siteName || branding.value.siteTitle)
const footerBrandName = computed(() => brandName.value || "VNSEEA")
const displayLogoUrl = computed(() => branding.value.nightLogoUrl || branding.value.logoUrl)
const optimizedLogoUrl = computed(() => {
  const source = displayLogoUrl.value

  if (!source) {
    return ""
  }

  if (/^https?:\/\//i.test(source)) {
    return source
  }

  const backendBase = String(runtimeConfig.public.backendWebBase || runtimeConfig.public.siteUrl || "").replace(/\/+$/, "")

  if (backendBase && (source.startsWith("/themes/") || source.startsWith("/upload/"))) {
    return `${backendBase}${source}`
  }

  return source
})
const logoAlt = computed(() => brandName.value ? `${brandName.value} Logo` : "Site logo")
const hasBrandIdentity = computed(() => Boolean(optimizedLogoUrl.value && !logoFailed.value) || Boolean(brandName.value))
const activeLocale = computed(() => String(locale.value))
const footerLinks = computed(() => [
  { label: t("auth.footer.terms"), to: appRoutes.termsOfUse },
  { label: t("auth.footer.privacy"), to: appRoutes.privacyPolicy },
  { label: t("auth.footer.contact"), to: appRoutes.contactUs },
  { label: t("auth.footer.about"), to: appRoutes.terms("about-us") },
])
const localeOptions = computed(() => {
  const entries = locales.value.length ? locales.value : [locale.value]

  return entries.map((entry) => {
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
  })
})

const changeLocale = async (code: string) => {
  if (code === activeLocale.value || pendingLocale.value) return

  try {
    pendingLocale.value = code
    await setLocale(code)
    languageModalOpen.value = false
  }
  finally {
    pendingLocale.value = ""
  }
}

watch(optimizedLogoUrl, () => {
  logoFailed.value = false
})

watch(languageModalOpen, (isOpen) => {
  if (import.meta.client) {
    document.documentElement.style.overflow = isOpen ? "hidden" : ""
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.documentElement.style.overflow = ""
  }
})
</script>

<style scoped>
/* ─── Hero wrapper ─────────────────────────────────────── */
.auth-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  width: 100%;
  min-height: 100svh;
  overflow-x: clip;
  color: var(--text-media);
  background: linear-gradient(160deg, color-mix(in srgb, var(--bg-brand) 34%, var(--bg-media)) 0%, color-mix(in srgb, var(--bg-brand) 20%, var(--bg-media)) 50%, var(--bg-media) 100%);
}

@media (min-width: 1024px) {
  .auth-hero {
    padding: 1.5rem 3rem;
    min-height: 100vh;
  }
}

/* ─── Background ───────────────────────────────────────── */
.auth-hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-hero__orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(72px);
  opacity: 0.45;
}

.auth-hero__orb--a {
  top: -8%;
  left: -8%;
  width: 22rem;
  height: 22rem;
  background: color-mix(in srgb, var(--text-media) 18%, transparent);
  animation-duration: 4s;
}

.auth-hero__orb--b {
  right: -5%;
  top: 20%;
  width: 26rem;
  height: 26rem;
  background: color-mix(in srgb, var(--bg-brand) 35%, transparent);
}

.auth-hero__orb--c {
  left: 10%;
  bottom: -8%;
  width: 24rem;
  height: 24rem;
  background: color-mix(in srgb, var(--text-media) 8%, transparent);
  animation-duration: 5s;
}

.auth-hero__grid {
  position: absolute;
  inset: 0;
  opacity: 0.07;
  background-image:
    linear-gradient(color-mix(in srgb, var(--text-media) 18%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--text-media) 15%, transparent) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* ─── Centered Header Wrapper ──────────────────────────── */
.auth-hero__header-wrapper {
  position: relative;
  z-index: 15;
  width: 30%;
  max-width: 76rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
@media (min-width: 1024px) {
  .auth-hero__header-wrapper {
    margin-left: 100px;
  }
}
.auth-hero__brand {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-hero__brand-shell {
  position: relative;
  display: inline-flex;
  padding: 4px;
}

.auth-hero__brand-icon {
  display: flex;
  width: 5.5rem !important;
  height: 5.5rem !important;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl);
  border: 2px solid var(--border-media);
  background: color-mix(in srgb, var(--text-media) 16%, transparent);
  box-shadow: var(--shadow-lg), 0 0 32px color-mix(in srgb, var(--text-media) 12%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 2;
  transition: transform var(--duration-normal) var(--ease-default);
}

.auth-hero__brand-icon:hover {
  transform: scale(1.05);
}

.auth-hero__brand-logo {
  width: 3.85rem !important;
  height: auto !important;
  max-height: 3.85rem;
  object-fit: contain;
}

.auth-hero__brand-ring {
  position: absolute;
  inset: -3px;
  border-radius: 28px;
  border: 1.5px dashed var(--border-media);
  animation: rotate-orbit 40s linear infinite;
  pointer-events: none;
}

/* ─── Unified Core ─────────────────────────────────────── */
.auth-hero__visual-core {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: 100%;
  margin-top: 2rem; /* Compact mobile top margin */
}

@media (min-width: 1024px) {
  .auth-hero__visual-core {
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    gap: 4rem;
    max-width: 76rem;
    margin: 0rem auto 0; /* Tiny top margin on desktop to avoid scrollbar */
  }
}

/* Left side: Graphics */
.auth-hero__graphics {
  display: none; /* Hidden on mobile */
}

@media (min-width: 1024px) {
  .auth-hero__graphics {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3.5rem;
    flex: 1;
    max-width: 32rem;
  }
}

/* Right side: Form container & card */
.auth-hero__form-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  flex: 1;
}

@media (min-width: 1024px) {
  .auth-hero__form-container {
    align-self: center;
  }
}

.auth-hero__form-card {
  width: 100%;
  max-width: 26rem;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 1.75rem 1.25rem; /* Highly compact padding to prevent scrollbar */
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  transition: transform var(--duration-normal) var(--ease-default);
}

@media (min-width: 640px) {
  .auth-hero__form-card {
    padding: 2rem 2.25rem; /* Elegant, compact padding on desktop */
  }
}

.auth-hero__form-card:hover {
  transform: translateY(-2px);
}

/* Public auth footer links */
.auth-hero__footer {
  position: relative;
  z-index: 15;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.35rem 0.85rem;
  width: 100%;
  max-width: 72rem;
  margin: 1.25rem auto 0;
  padding: 0 1rem;
  color: var(--text-media-muted);
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.4;
}

.auth-hero__footer-copy,
.auth-hero__footer-separator {
  color: var(--text-media-muted);
}

.auth-hero__footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-media-muted);
  text-decoration: none;
  transition: color var(--duration-normal) var(--ease-default);
}

.auth-hero__footer-link:hover {
  color: var(--text-media);
  text-decoration: underline;
  text-underline-offset: 0.22em;
}

.auth-hero__footer-button {
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.auth-language-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: color-mix(in srgb, var(--bg-media) 46%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.auth-language-modal__panel {
  width: min(100%, 420px);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  box-shadow: var(--shadow-lg);
  padding: 1.25rem;
}

.auth-language-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.auth-language-modal__title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 900;
  line-height: 1.2;
}

.auth-language-modal__description {
  margin-top: 0.3rem;
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 650;
  line-height: 1.5;
}

.auth-language-modal__close {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
}

.auth-language-modal__close:hover,
.auth-language-modal__close:focus-visible {
  color: var(--bg-brand);
  border-color: color-mix(in srgb, var(--bg-brand) 24%, transparent);
}

.auth-hero__language-list {
  display: grid;
  gap: 0.65rem;
}

.auth-hero__language-option {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 0.9rem 1rem;
  color: var(--text-primary);
  text-align: left;
  transition:
    border-color var(--duration-normal) var(--ease-default),
    box-shadow var(--duration-normal) var(--ease-default),
    background var(--duration-normal) var(--ease-default);
}

.auth-hero__language-option:hover,
.auth-hero__language-option--active {
  border-color: color-mix(in srgb, var(--bg-brand) 26%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
  box-shadow: var(--shadow-xs);
}

.auth-hero__language-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.15rem;
}

.auth-hero__language-name {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 750;
}

.auth-hero__language-code {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

@media (min-width: 1024px) {
  .auth-hero__footer {
    margin-top: 0.75rem;
  }
}

/* ─── Central Portal (Planetary Orbit) ─────────────────── */
.hero-widget--central {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes rotate-orbit {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hero-widget__orbit {
  position: relative;
  width: 14rem;
  height: 14rem;
  border-radius: 50%;
  border: 1.5px dashed var(--border-media);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: rotate-orbit 32s linear infinite;
}

.hero-widget__node {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  transition: transform var(--duration-normal) var(--ease-default);
}

.hero-widget__node--center {
  position: relative;
  width: 5.5rem;
  height: 5.5rem;
  background: linear-gradient(135deg, color-mix(in srgb, var(--text-media) 18%, transparent) 0%, color-mix(in srgb, var(--text-media) 8%, transparent) 100%);
  border: 1px solid var(--border-media);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: var(--shadow-brand), 0 0 32px color-mix(in srgb, var(--text-media) 12%, transparent);
  z-index: 5;
}

@keyframes counter-rotate {
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
}

.hero-widget__node--orbit-1,
.hero-widget__node--orbit-2,
.hero-widget__node--orbit-3,
.hero-widget__node--orbit-4 {
  width: 2.25rem;
  height: 2.25rem;
  background: color-mix(in srgb, var(--text-media) 10%, transparent);
  border: 1px solid var(--border-media);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.hero-widget__node--orbit-1 *,
.hero-widget__node--orbit-2 *,
.hero-widget__node--orbit-3 *,
.hero-widget__node--orbit-4 * {
  animation: counter-rotate 32s linear infinite;
}

.hero-widget__node--orbit-1 {
  top: -1.125rem;
  left: calc(50% - 1.125rem);
}

.hero-widget__node--orbit-2 {
  right: -1.125rem;
  top: calc(50% - 1.125rem);
}

.hero-widget__node--orbit-3 {
  bottom: -1.125rem;
  left: calc(50% - 1.125rem);
}

.hero-widget__node--orbit-4 {
  left: -1.125rem;
  top: calc(50% - 1.125rem);
}

/* ─── Floating Widgets Grid ────────────────────────────── */
.hero-widget-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;
}

.hero-widget--glass {
  border: 1px solid var(--border-light);
  background: color-mix(in srgb, var(--text-media) 8%, transparent);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: transform var(--duration-normal) var(--ease-default), border-color var(--duration-normal) var(--ease-default), background var(--duration-normal) var(--ease-default);
}

.hero-widget--glass:hover {
  transform: translateY(-4px);
  border-color: var(--border-media);
  background: color-mix(in srgb, var(--text-media) 12%, transparent);
  box-shadow: var(--shadow-lg);
}

/* Widget A: Connections */
.hero-widget--a {
  grid-column: span 1;
  border-radius: var(--radius-xl);
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-success);
  box-shadow: 0 0 10px var(--color-success);
}

.widget-avatars {
  display: flex;
  align-items: center;
}

.widget-avatar-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--text-media) 12%, transparent);
  border: 1px solid var(--border-media);
  margin-left: -0.5rem;
}

.widget-avatar-shell:first-child {
  margin-left: 0;
}

.widget-avatar-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-full);
  background: var(--bg-brand);
  border: 1px solid var(--border-media);
  margin-left: -0.5rem;
  box-shadow: var(--shadow-brand);
}

/* Widget B: Boost / Activity Bars */
.hero-widget--b {
  grid-column: span 1;
  border-radius: var(--radius-xl);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-icon-box {
  display: inline-flex;
  padding: 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-media);
  background: color-mix(in srgb, var(--text-media) 8%, transparent);
}

.widget-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.widget-bar {
  width: 6px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--text-media) 15%, transparent);
}

.widget-bar--active {
  background: linear-gradient(180deg, var(--color-warning) 0%, color-mix(in srgb, var(--color-warning) 72%, var(--bg-media)) 100%);
  box-shadow: 0 0 14px color-mix(in srgb, var(--color-warning) 40%, transparent);
}

/* Widget C: Audio visualizer / Wave */
.hero-widget--c {
  grid-column: span 1;
  border-radius: var(--radius-xl);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@keyframes audio-wave {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

.widget-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 24px;
}

.wave-bar {
  width: 3px;
  height: 100%;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--text-media) 30%, transparent);
  animation: audio-wave 1.2s ease-in-out infinite;
  transform-origin: center;
}

/* Widget D: Floating Crown / Shield */
@keyframes float-badge {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.hero-widget--d {
  grid-column: span 1;
  border-radius: var(--radius-xl);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 4.75rem;
  animation: float-badge 4s ease-in-out infinite;
}

.widget-badge-circle {
  display: inline-flex;
  padding: 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-media);
  background: color-mix(in srgb, var(--text-media) 10%, transparent);
  box-shadow: var(--shadow-md);
}

.widget-badge-mini {
  position: absolute;
  top: 10px;
  right: 12px;
  display: inline-flex;
  padding: 4px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-media);
  background: var(--bg-brand);
  box-shadow: var(--shadow-brand);
}
</style>
