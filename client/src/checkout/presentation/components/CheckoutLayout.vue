<template>
  <div class="ck-page">
    <!-- Header -->
    <header class="ck-header">
      <div class="ck-header-inner">
        <NuxtLink to="/" class="ck-logo">VNSEEA</NuxtLink>
        <nav class="ck-stepper" aria-label="Checkout steps">
          <div class="ck-step ck-step--done">
            <span class="ck-step-circle ck-step-circle--done">
              <Icon name="i-ph-check-bold" class="ck-step-check" />
            </span>
            <span class="ck-step-text">{{ $t("checkout.stepper.cart") }}</span>
          </div>
          <span class="ck-step-line ck-step-line--done" />
          <div class="ck-step ck-step--done">
            <span class="ck-step-circle ck-step-circle--done">
              <Icon name="i-ph-check-bold" class="ck-step-check" />
            </span>
            <span class="ck-step-text">{{ $t("checkout.stepper.confirm") }}</span>
          </div>
          <span class="ck-step-line" />
          <div class="ck-step ck-step--active">
            <span class="ck-step-circle ck-step-circle--active">3</span>
            <span class="ck-step-text ck-step-text--active">{{ $t("checkout.stepper.payment") }}</span>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main -->
    <main class="ck-main">
      <div class="ck-grid">
        <section class="ck-col-left" :aria-label="leftLabel || title">
          <h1 class="ck-title">{{ title }}</h1>
          <slot name="left" />
        </section>
        <aside class="ck-col-right" :aria-label="rightLabel || $t('checkout.page.summaryRegion')">
          <div class="ck-sticky">
            <slot name="right" />
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  eyebrow?: string
  description?: string
  progressLabel?: string
  progressText?: string
  progressValue?: number
  leftLabel?: string
  rightLabel?: string
}>(), {
  eyebrow: "",
  description: "",
  progressLabel: "",
  progressText: "",
  progressValue: 0,
  leftLabel: "",
  rightLabel: "",
})

useHead({
  bodyAttrs: {
    style: "background:#fff;overflow:hidden",
  },
})
</script>

<style scoped>
.ck-page {
  min-height: 100vh;
  background: #fff;
  overflow: hidden;
}

/* ── Header ── */
.ck-header {
  background: #fff;
  border-bottom: 1px solid #e8eaed;
}

.ck-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1140px;
  margin: 0 auto;
  padding: 18px 24px;
}

.ck-logo {
  font-family: 'Montserrat', sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: #1B08FF;
  text-decoration: none;
  letter-spacing: -2px;
}

/* ── Stepper ── */
.ck-stepper {
  display: flex;
  align-items: center;
  gap: 0;
}

.ck-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ck-step-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.ck-step-circle--done {
  background: #4361ee;
  color: #fff;
}

.ck-step-circle--active {
  background: #4361ee;
  color: #fff;
}

.ck-step-check {
  width: 14px;
  height: 14px;
}

.ck-step-text {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.ck-step-text--active {
  font-weight: 700;
  color: #111827;
}

.ck-step-line {
  width: 48px;
  height: 2px;
  margin: 0 12px;
  background: #d1d5db;
  border-radius: 1px;
}

.ck-step-line--done {
  background: #4361ee;
}

/* ── Main ── */
.ck-main {
  max-width: 1140px;
  margin: 0 auto;
  padding: 36px 24px 0;
  position: relative;
  min-height: calc(100vh - 65px);
}

.ck-main::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  right: calc(380px + 40px + 24px);
  width: 1px;
  background: #e5e7eb;
}

.ck-title {
  margin: 0 0 28px;
  font-size: 30px;
  font-weight: 900;
  color: #111827;
  letter-spacing: -0.3px;
}

.ck-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 0;
  align-items: start;
}

.ck-col-right {
  padding-left: 40px;
  margin-left: 40px;
}

.ck-sticky {
  position: sticky;
  top: 24px;
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .ck-main::after {
    display: none;
  }

  .ck-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .ck-col-right {
    padding-left: 0;
    margin-left: 0;
    border-top: 1px solid #e5e7eb;
    padding-top: 28px;
  }

  .ck-sticky {
    position: static;
  }
}

@media (max-width: 640px) {
  .ck-header-inner {
    flex-direction: column;
    gap: 16px;
    padding: 14px 16px;
  }

  .ck-stepper {
    width: 100%;
    justify-content: center;
  }

  .ck-step-line {
    width: 28px;
    margin: 0 6px;
  }

  .ck-main {
    padding: 24px 16px 48px;
  }

  .ck-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
}
</style>
