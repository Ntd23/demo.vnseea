<!-- English description: Provides the responsive single-screen checkout shell without multi-step navigation. -->
<template>
  <div class="checkout-shell">
    <div class="checkout-shell__inner">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        icon="i-ph-arrow-left-bold"
        class="checkout-shell__back"
        @click="goBack"
      >
        {{ $t("checkout.summary.backToStore") }}
      </UButton>

      <div class="checkout-shell__grid">
        <section class="checkout-shell__address" :aria-label="leftLabel">
          <slot name="left" />
        </section>

        <section class="checkout-shell__summary" :aria-label="rightLabel">
          <slot name="right" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"

withDefaults(defineProps<{
  leftLabel?: string
  rightLabel?: string
}>(), {
  leftLabel: "",
  rightLabel: "",
})

const router = useRouter()

function goBack() {
  const previousRoute = import.meta.client ? window.history.state?.back : null

  if (typeof previousRoute === "string" && previousRoute.length > 0) {
    router.back()
    return
  }

  void navigateTo(appRoutes.products)
}
</script>

<style scoped>
.checkout-shell {
  min-height: calc(100dvh - 64px);
  padding: 20px 16px 48px;
  background: var(--bg-base);
}

.checkout-shell__inner {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.checkout-shell__back {
  margin-bottom: 14px;
  color: var(--text-secondary);
  font-weight: 700;
}

.checkout-shell__grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.78fr) minmax(0, 1.22fr);
  gap: 28px;
  align-items: start;
}

.checkout-shell__address,
.checkout-shell__summary {
  min-width: 0;
}

@media (max-width: 900px) {
  .checkout-shell__grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

@media (max-width: 640px) {
  .checkout-shell {
    padding: 12px 10px 32px;
  }
}
</style>
