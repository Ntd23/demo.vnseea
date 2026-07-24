<!-- English description: Public content layout for guest-accessible CMS and contact pages. -->
<template>
  <div class="public-layout">
    <header class="public-layout__header">
      <div class="public-layout__header-inner">
        <NavigationHeaderLogo :to="appRoutes.welcome" :inverted="false" />
        <nav class="public-layout__nav" aria-label="Public navigation">
          <NuxtLink class="public-layout__nav-link" :to="appRoutes.termsOfUse">
            {{ t("auth.footer.terms") }}
          </NuxtLink>
          <NuxtLink class="public-layout__nav-link" :to="appRoutes.privacyPolicy">
            {{ t("auth.footer.privacy") }}
          </NuxtLink>
          <NuxtLink class="public-layout__nav-link" :to="appRoutes.contactUs">
            {{ t("auth.footer.contact") }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="public-layout__main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import NavigationHeaderLogo from "../../src/navigation/presentation/components/HeaderLogo.vue"

const { t } = useI18n()
</script>

<style scoped>
.public-layout {
  min-height: 100svh;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--bg-brand) 8%, transparent), transparent 34rem),
    var(--bg-base);
  color: var(--text-primary);
}

.public-layout__header {
  position: sticky;
  top: 0;
  z-index: 30;
  border-bottom: 1px solid var(--border-light);
  background: color-mix(in srgb, var(--bg-surface) 90%, transparent);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.public-layout__header-inner {
  display: flex;
  width: min(100%, 1200px);
  margin: 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
}

.public-layout__nav {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.public-layout__nav-link {
  color: var(--text-secondary);
  font-size: 0.86rem;
  font-weight: 750;
  text-decoration: none;
}

.public-layout__nav-link:hover {
  color: var(--color-primary, var(--bg-brand));
}

.public-layout__main {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 1rem;
}

@media (max-width: 640px) {
  .public-layout__header-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .public-layout__nav {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.15rem;
  }

  .public-layout__nav-link {
    flex: 0 0 auto;
  }
}
</style>
