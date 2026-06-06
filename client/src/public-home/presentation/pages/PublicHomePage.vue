<!-- English description: Renders the public indexable homepage for guests and search crawlers. -->
<template>
  <section class="public-home">
    <div class="public-home__hero">
      <div class="public-home__hero-copy">
        <p class="public-home__eyebrow">{{ brandName || "VNSEEA" }}</p>
        <h1>{{ brandName || "VNSEEA" }} kết nối cộng đồng, nội dung và kinh doanh địa phương</h1>
        <p class="public-home__lead">
          Khám phá bài viết, trang, nhóm, sản phẩm, ưu đãi và các hoạt động cộng đồng trên một nền tảng xã hội được xây dựng cho người dùng Việt Nam.
        </p>

        <div class="public-home__actions">
          <NuxtLink class="public-home__button public-home__button--primary" :to="appRoutes.welcome">
            Đăng nhập
          </NuxtLink>
          <NuxtLink class="public-home__button public-home__button--secondary" :to="appRoutes.register">
            Tạo tài khoản
          </NuxtLink>
        </div>
      </div>

      <div class="public-home__visual" aria-label="VNSEEA public features">
        <div class="public-home__brand-tile">
          <img
            v-if="displayLogoUrl"
            :src="displayLogoUrl"
            :alt="`${brandName || 'VNSEEA'} logo`"
            class="public-home__brand-image"
          >
          <span v-else class="public-home__brand-fallback">{{ fallbackInitial }}</span>
        </div>
        <div class="public-home__feature-grid">
          <div v-for="item in featureCards" :key="item.title" class="public-home__feature-card">
            <Icon :name="item.icon" class="public-home__feature-icon" />
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="public-home__sections" aria-label="Public areas">
      <NuxtLink v-for="item in publicLinks" :key="item.title" :to="item.to" class="public-home__section-card">
        <Icon :name="item.icon" class="public-home__section-icon" />
        <span>
          <strong>{{ item.title }}</strong>
          <small>{{ item.description }}</small>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useSiteBrandingStore } from "../../../site-branding/application/stores/useSiteBrandingStore"

const siteBrandingStore = useSiteBrandingStore()
const { branding } = storeToRefs(siteBrandingStore)

const brandName = computed(() => branding.value.siteName || branding.value.siteTitle)
const displayLogoUrl = computed(() => branding.value.logoUrl || branding.value.nightLogoUrl || branding.value.faviconUrl)
const fallbackInitial = computed(() => (brandName.value || "VNSEEA").trim().charAt(0).toUpperCase())

const featureCards = [
  { title: "Bảng tin", icon: "i-ph-newspaper-clipping-duotone" },
  { title: "Trang & nhóm", icon: "i-ph-users-three-duotone" },
  { title: "Sản phẩm", icon: "i-ph-storefront-duotone" },
  { title: "Tìm kiếm gần đây", icon: "i-ph-map-pin-duotone" },
]

const publicLinks = [
  {
    title: "Blog cộng đồng",
    description: "Đọc bài viết, câu chuyện và kiến thức được chia sẻ công khai.",
    icon: "i-ph-article-duotone",
    to: appRoutes.blogs,
  },
  {
    title: "Sản phẩm",
    description: "Khám phá sản phẩm và đơn hàng từ các cửa hàng trong cộng đồng.",
    icon: "i-ph-package-duotone",
    to: appRoutes.products,
  },
  {
    title: "Trang",
    description: "Theo dõi thương hiệu, cửa hàng và cộng đồng nội dung.",
    icon: "i-ph-flag-duotone",
    to: appRoutes.pages,
  },
  {
    title: "Liên hệ",
    description: "Gửi yêu cầu hoặc đọc thông tin hỗ trợ từ hệ thống.",
    icon: "i-ph-envelope-simple-duotone",
    to: appRoutes.contactUs,
  },
]
</script>

<style scoped>
.public-home {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem 0 3rem;
}

.public-home__hero {
  display: grid;
  min-height: min(680px, calc(100svh - 120px));
  overflow: hidden;
  border: 1px solid var(--border-light, #dbe3f2);
  border-radius: 28px;
  background:
    radial-gradient(circle at 80% 18%, rgba(0, 0, 255, 0.14), transparent 28rem),
    linear-gradient(135deg, #ffffff 0%, #eef4ff 56%, #dfe9ff 100%);
  background-color: #edf4ff;
  background-position: center;
  background-size: cover;
  box-shadow: 0 24px 60px rgba(15, 35, 110, 0.08);
}

.public-home__hero-copy {
  display: flex;
  max-width: 720px;
  flex-direction: column;
  justify-content: center;
  gap: 1.2rem;
  padding: clamp(2rem, 7vw, 5.5rem);
}

.public-home__eyebrow {
  color: var(--color-primary, #0000ff);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.public-home h1 {
  max-width: 12ch;
  color: var(--text-primary, #0f172a);
  font-size: clamp(2.6rem, 7vw, 5.8rem);
  font-weight: 950;
  letter-spacing: 0;
  line-height: 0.96;
}

.public-home__lead {
  max-width: 650px;
  color: var(--text-secondary, #475569);
  font-size: clamp(1rem, 2vw, 1.2rem);
  font-weight: 650;
  line-height: 1.7;
}

.public-home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.public-home__button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 0 1.35rem;
  font-size: 0.95rem;
  font-weight: 850;
  text-decoration: none;
}

.public-home__button--primary {
  background: var(--color-primary, #0000ff);
  color: #ffffff;
  box-shadow: 0 16px 34px rgba(0, 0, 255, 0.18);
}

.public-home__button--secondary {
  border: 1px solid var(--border-light, #dbe3f2);
  background: rgba(255, 255, 255, 0.84);
  color: var(--text-primary, #0f172a);
}

.public-home__visual {
  display: grid;
  align-content: end;
  gap: 1rem;
  padding: 0 clamp(1rem, 4vw, 3rem) clamp(1rem, 4vw, 3rem);
}

.public-home__brand-tile {
  display: inline-flex;
  width: 96px;
  height: 96px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 44px rgba(15, 35, 110, 0.14);
}

.public-home__brand-image {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

.public-home__brand-fallback {
  color: var(--color-primary, #0000ff);
  font-size: 2rem;
  font-weight: 950;
}

.public-home__feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  max-width: 420px;
}

.public-home__feature-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  padding: 0.9rem;
  color: var(--text-primary, #0f172a);
  font-weight: 800;
  box-shadow: 0 14px 32px rgba(15, 35, 110, 0.08);
}

.public-home__feature-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary, #0000ff);
}

.public-home__sections {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.public-home__section-card {
  display: flex;
  min-width: 0;
  gap: 0.9rem;
  border: 1px solid var(--border-light, #dbe3f2);
  border-radius: 22px;
  background: #ffffff;
  padding: 1rem;
  color: var(--text-primary, #0f172a);
  text-decoration: none;
  box-shadow: 0 14px 34px rgba(15, 35, 110, 0.06);
}

.public-home__section-icon {
  flex: 0 0 auto;
  width: 1.45rem;
  height: 1.45rem;
  color: var(--color-primary, #0000ff);
}

.public-home__section-card span {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.35rem;
}

.public-home__section-card strong {
  font-size: 1rem;
  font-weight: 900;
}

.public-home__section-card small {
  color: var(--text-secondary, #64748b);
  font-size: 0.86rem;
  font-weight: 650;
  line-height: 1.55;
}

@media (max-width: 900px) {
  .public-home__hero {
    min-height: auto;
    background:
      radial-gradient(circle at 80% 18%, rgba(0, 0, 255, 0.12), transparent 22rem),
      linear-gradient(135deg, #ffffff 0%, #eef4ff 56%, #dfe9ff 100%);
  }

  .public-home h1 {
    max-width: 11ch;
  }

  .public-home__sections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .public-home {
    padding-top: 0.25rem;
  }

  .public-home__hero {
    border-radius: 22px;
  }

  .public-home__hero-copy {
    padding: 1.5rem;
  }

  .public-home__actions {
    flex-direction: column;
  }

  .public-home__button {
    width: 100%;
  }

  .public-home__visual {
    padding: 0 1rem 1rem;
  }

  .public-home__feature-grid,
  .public-home__sections {
    grid-template-columns: 1fr;
  }
}
</style>
