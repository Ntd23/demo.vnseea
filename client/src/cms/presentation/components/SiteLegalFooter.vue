<template>
  <footer class="site-legal-footer" aria-label="Thông tin doanh nghiệp và chính sách">
    <div class="site-legal-footer__inner">
      <section class="site-legal-footer__business" aria-labelledby="site-legal-footer-business">
        <h2 id="site-legal-footer-business" class="site-legal-footer__heading">
          CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN VNSEEA
        </h2>
        <p>VNSEEA INVESTMENT AND DEVELOPMENT JOINT STOCK COMPANY</p>
        <p><strong>Mã số thuế:</strong> 0801471473</p>
        <p><strong>Địa chỉ:</strong> 170 Louis 3 đường Lê Giản, Phường Đại Mỗ, Thành phố Hà Nội, Việt Nam</p>
        <p><strong>Người đại diện:</strong> LÊ NGỌC ANH</p>
        <p><strong>Điện thoại:</strong> <a href="tel:+84971765268">0971 765 268</a></p>
        <p><strong>Email:</strong> <a href="mailto:support@vnseea.vn">support@vnseea.vn</a></p>
      </section>

      <nav class="site-legal-footer__policies" aria-label="Chính sách">
        <h2 class="site-legal-footer__heading">Chính sách</h2>
        <NuxtLink
          v-for="policy in policies"
          :key="policy.slug"
          :to="appRoutes.commercePolicy(policy.slug)"
        >
          {{ policy.title }}
        </NuxtLink>
        <NuxtLink :to="appRoutes.contactUs">Liên hệ</NuxtLink>
      </nav>
    </div>
    <p class="site-legal-footer__copyright">© {{ year }} VNSEEA. Bảo lưu mọi quyền.</p>
  </footer>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { getCommercePolicyLinks } from "../../domain/services/commerce-policy.service"

const policies = getCommercePolicyLinks()
const year = new Date().getFullYear()
</script>

<style scoped>
.site-legal-footer {
  margin-top: 2rem;
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-secondary);
}

.site-legal-footer__inner {
  display: grid;
  width: min(100%, 1200px);
  margin: 0 auto;
  grid-template-columns: minmax(0, 1.6fr) minmax(220px, 0.8fr);
  gap: 2rem;
  padding: 1.75rem 1rem 1.25rem;
}

.site-legal-footer__business p {
  margin: 0.4rem 0 0;
  font-size: 0.82rem;
  line-height: 1.6;
}

.site-legal-footer__business strong {
  color: var(--text-primary);
}

.site-legal-footer__heading {
  margin: 0 0 0.6rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 800;
}

.site-legal-footer__business a,
.site-legal-footer__policies a {
  color: inherit;
  text-decoration: none;
}

.site-legal-footer__business a:hover,
.site-legal-footer__policies a:hover {
  color: var(--text-brand);
  text-decoration: underline;
}

.site-legal-footer__policies {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: 0.55rem;
  font-size: 0.84rem;
}

.site-legal-footer__copyright {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 0.75rem 1rem 1rem;
  border-top: 1px solid var(--border-light);
  font-size: 0.76rem;
}

@media (max-width: 640px) {
  .site-legal-footer__inner {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>
