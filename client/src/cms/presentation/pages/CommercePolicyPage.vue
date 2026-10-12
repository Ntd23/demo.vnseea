<template>
  <main v-if="policy" class="commerce-policy-page">
    <article class="commerce-policy-page__card">
      <p class="commerce-policy-page__eyebrow">VNSEEA · CHÍNH SÁCH</p>
      <h1>{{ policy.title }}</h1>
      <p class="commerce-policy-page__summary">{{ policy.summary }}</p>
      <p class="commerce-policy-page__updated">Cập nhật lần cuối: {{ policy.updatedAt }}</p>

      <section
        v-for="section in policy.sections"
        :key="section.heading"
        class="commerce-policy-page__section"
      >
        <h2>{{ section.heading }}</h2>
        <p v-for="paragraph in section.paragraphs || []" :key="paragraph">
          {{ paragraph }}
        </p>
        <ul v-if="section.items?.length">
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </ul>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
import { getCommercePolicy } from "../../domain/services/commerce-policy.service"

const route = useRoute()
const requestURL = useRequestURL()
const policy = getCommercePolicy(route.params.slug)

if (!policy) {
  throw createError({ statusCode: 404, statusMessage: "Không tìm thấy chính sách." })
}

useSeoMeta({
  title: () => `${policy.title} | VNSEEA`,
  description: () => policy.summary,
  robots: "index, follow",
})

useHead({
  link: [{ rel: "canonical", href: () => new URL(route.path, requestURL.origin).toString() }],
})
</script>

<style scoped>
.commerce-policy-page {
  padding: 2.5rem 1rem 4rem;
}

.commerce-policy-page__card {
  width: min(100%, 900px);
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 3rem);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.commerce-policy-page__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--text-brand);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.commerce-policy-page h1 {
  margin: 0;
  font-size: clamp(1.8rem, 5vw, 2.7rem);
  line-height: 1.15;
}

.commerce-policy-page__summary {
  margin: 1rem 0 0;
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.7;
}

.commerce-policy-page__updated {
  margin: 0.8rem 0 2rem;
  color: var(--text-tertiary, var(--text-secondary));
  font-size: 0.82rem;
}

.commerce-policy-page__section + .commerce-policy-page__section {
  margin-top: 1.75rem;
}

.commerce-policy-page__section h2 {
  margin: 0 0 0.65rem;
  font-size: 1.15rem;
}

.commerce-policy-page__section p,
.commerce-policy-page__section li {
  color: var(--text-secondary);
  line-height: 1.75;
}

.commerce-policy-page__section p {
  margin: 0.65rem 0 0;
}

.commerce-policy-page__section ul {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding-left: 1.3rem;
}
</style>
