<!-- English description: Renders a public CMS page sourced from PHP terms or custom page data. -->
<template>
  <div class="cms-page" :class="{ 'cms-page--plain': !hasHero }">
    <section v-if="hasHero" class="cms-page__hero">
      <div class="cms-page__hero-inner">
        <p class="cms-page__eyebrow">CMS</p>
        <h1 class="cms-page__title">
          {{ page?.title }}
        </h1>
      </div>
    </section>

    <section class="cms-page__body" :class="{ 'cms-page__body--plain': !hasHero }">
      <div v-if="page" class="cms-page__content" v-html="page.contentHtml" />
      <div v-else class="cms-page__empty">
        Không tìm thấy nội dung.
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { usePublicSeoMeta } from "../../../seo/application/composables/usePublicSeoMeta"
import type { CmsPageKind } from "../../domain/types/cms.types"
import { useCmsPageVM } from "../../application/view-models/useCmsPageVM"

const props = defineProps<{
  kind: CmsPageKind
  identifier: string
}>()

const {
  page,
  seoMeta,
  hasHero,
} = await useCmsPageVM({
  kind: props.kind,
  identifier: props.identifier,
})

usePublicSeoMeta(seoMeta)
</script>

<style scoped>
.cms-page {
  width: 100%;
  padding: var(--space-4) 0 var(--space-8);
}

.cms-page--plain {
  padding-top: var(--space-6);
}

.cms-page__hero {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(135deg, rgba(0, 0, 255, 0.9), rgba(30, 58, 138, 0.88)),
    var(--bg-brand);
  box-shadow: var(--shadow-lg);
  color: var(--text-inverse);
}

.cms-page__hero-inner {
  padding: clamp(2rem, 5vw, 4.5rem);
}

.cms-page__eyebrow {
  margin: 0;
  font-size: var(--text-caption);
  font-weight: var(--weight-bold);
  color: rgba(255, 255, 255, 0.72);
}

.cms-page__title {
  margin: var(--space-3) 0 0;
  max-width: 52rem;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: var(--weight-bold);
  line-height: 1.05;
  letter-spacing: 0;
}

.cms-page__body {
  margin: calc(var(--space-6) * -1) auto 0;
  max-width: 58rem;
  position: relative;
}

.cms-page__body--plain {
  margin-top: 0;
}

.cms-page__content,
.cms-page__empty {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  box-shadow: var(--shadow-md);
  color: var(--text-primary);
  padding: clamp(1.25rem, 3vw, 2.25rem);
}

.cms-page__content {
  font-size: var(--text-body);
  line-height: 1.78;
}

.cms-page__content :deep(h1),
.cms-page__content :deep(h2),
.cms-page__content :deep(h3) {
  margin: 1.6em 0 0.65em;
  color: var(--text-primary);
  font-weight: var(--weight-bold);
  line-height: 1.2;
  letter-spacing: 0;
}

.cms-page__content :deep(h1:first-child),
.cms-page__content :deep(h2:first-child),
.cms-page__content :deep(h3:first-child),
.cms-page__content :deep(p:first-child) {
  margin-top: 0;
}

.cms-page__content :deep(p),
.cms-page__content :deep(ul),
.cms-page__content :deep(ol) {
  margin: 0 0 1em;
}

.cms-page__content :deep(a) {
  color: var(--text-brand);
  font-weight: var(--weight-semibold);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.cms-page__content :deep(img),
.cms-page__content :deep(video),
.cms-page__content :deep(iframe) {
  max-width: 100%;
  border-radius: var(--radius-lg);
}

.cms-page__empty {
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 640px) {
  .cms-page {
    padding-top: var(--space-3);
  }

  .cms-page__hero {
    border-radius: var(--radius-xl);
  }

  .cms-page__body {
    margin-top: calc(var(--space-4) * -1);
  }

  .cms-page__body--plain {
    margin-top: 0;
  }

  .cms-page__content,
  .cms-page__empty {
    border-radius: var(--radius-lg);
  }
}
</style>
