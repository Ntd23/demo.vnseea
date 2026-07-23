<!-- English description: Renders movie artwork, metadata, description controls, and social sharing actions. -->
<template>
  <section class="movie-overview">
    <div class="movie-overview__poster-shell">
      <span v-if="movie.quality" class="movie-overview__quality">
        <Icon name="i-ph-video-camera-fill" class="h-3.5 w-3.5" />
        {{ movie.quality.toUpperCase() }}
      </span>
      <img
        class="movie-overview__poster"
        :src="movie.cover"
        :alt="movie.title"
      />
    </div>

    <div class="movie-overview__content">
      <div>
        <NuxtLink class="movie-overview__back" :to="appRoutes.movies">
          <Icon name="i-ph-arrow-left-bold" class="h-4 w-4" />
          Phim
        </NuxtLink>
        <h1 class="movie-overview__title">{{ movie.title }}</h1>
        <div class="movie-overview__headline-meta">
          <span>
            <Icon name="i-ph-star-fill" />
            {{ movie.rating.toFixed(1) }}
          </span>
          <span v-if="movie.runtime">
            <Icon name="i-ph-clock-duotone" />
            {{ movie.runtime }}
          </span>
          <span v-if="movie.year">
            <Icon name="i-ph-calendar-blank-duotone" />
            {{ movie.year }}
          </span>
        </div>
      </div>

      <div v-if="movie.summary" class="movie-overview__description">
        <p
          :class="{
            'movie-overview__description-text--clamped':
              canExpandDescription && !descriptionExpanded,
          }"
        >
          {{ movie.summary }}
        </p>
        <button
          v-if="canExpandDescription"
          class="movie-overview__description-toggle"
          type="button"
          @click="$emit('toggleDescription')"
        >
          <Icon
            :name="descriptionExpanded ? 'i-ph-minus-bold' : 'i-ph-plus-bold'"
            class="h-3.5 w-3.5"
          />
          {{ descriptionExpanded ? "Thu gọn" : "Xem thêm" }}
        </button>
      </div>

      <dl class="movie-overview__facts">
        <div v-if="movie.stars.length > 0">
          <dt>Các ngôi sao</dt>
          <dd>{{ movie.stars.join(", ") }}</dd>
        </div>
        <div v-if="movie.genre">
          <dt>Thể loại</dt>
          <dd>
            <NuxtLink
              :to="{ path: appRoutes.movies, query: { genre: movie.genre } }"
            >
              {{ genreLabel || movie.genre.toUpperCase() }}
            </NuxtLink>
          </dd>
        </div>
        <div v-if="movie.director">
          <dt>Người sản xuất</dt>
          <dd>
            <NuxtLink
              :to="{
                path: appRoutes.movies,
                query: { search: movie.director },
              }"
            >
              {{ movie.director }}
            </NuxtLink>
          </dd>
        </div>
        <div v-if="movie.country">
          <dt>Quốc gia</dt>
          <dd>
            <NuxtLink
              :to="{
                path: appRoutes.movies,
                query: { country: movie.country },
              }"
            >
              {{ countryLabel || movie.country }}
            </NuxtLink>
          </dd>
        </div>
        <div>
          <dt>Lượt xem</dt>
          <dd>{{ viewsLabel }}</dd>
        </div>
        <div>
          <dt>Chia sẻ với</dt>
          <dd class="movie-overview__share">
            <a
              :href="facebookShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chia sẻ lên Facebook"
              title="Facebook"
            >
              <Icon name="i-ph-facebook-logo-fill" />
            </a>
            <a
              :href="twitterShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chia sẻ lên X"
              title="X"
            >
              <Icon name="i-ph-x-logo-bold" />
            </a>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry";
import type { MovieRecord } from "../../domain/types/movies.types";

const props = defineProps<{
  movie: MovieRecord;
  genreLabel?: string;
  countryLabel?: string;
  descriptionExpanded: boolean;
  canExpandDescription: boolean;
  facebookShareUrl: string;
  twitterShareUrl: string;
}>();

defineEmits<{
  toggleDescription: [];
}>();

const viewsLabel = computed(() =>
  new Intl.NumberFormat("vi-VN").format(props.movie.views),
);
</script>

<style scoped>
.movie-overview {
  display: grid;
  grid-template-columns: minmax(0, 180px) minmax(0, 1fr);
  gap: 24px;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  background: var(--color-surface, #ffffff);
  padding: 20px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.movie-overview__poster-shell {
  position: relative;
  align-self: start;
  overflow: hidden;
  border-radius: 12px;
  background: #e2e8f0;
  aspect-ratio: 2 / 3;
}

.movie-overview__poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-overview__quality {
  position: absolute;
  z-index: 1;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.88);
  padding: 5px 8px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
}

.movie-overview__content {
  display: grid;
  align-content: start;
  gap: 18px;
  min-width: 0;
}

.movie-overview__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 9px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.movie-overview__back:hover,
.movie-overview__facts a {
  color: var(--color-accent-700, var(--bg-brand));
}

.movie-overview__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 34px;
  font-weight: 800;
  line-height: 1.16;
}

.movie-overview__headline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.movie-overview__headline-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.movie-overview__headline-meta span:first-child :deep(svg) {
  color: #f5b301;
}

.movie-overview__description {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.7;
}

.movie-overview__description p {
  margin: 0;
  white-space: pre-line;
}

.movie-overview__description-text--clamped {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
}

.movie-overview__description-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--color-accent-700, var(--bg-brand));
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.movie-overview__facts {
  display: grid;
  gap: 12px;
  margin: 0;
}

.movie-overview__facts > div {
  display: grid;
  grid-template-columns: minmax(110px, 140px) minmax(0, 1fr);
  gap: 12px;
}

.movie-overview__facts dt {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.movie-overview__facts dd {
  min-width: 0;
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.movie-overview__facts a {
  text-decoration: none;
}

.movie-overview__share {
  display: flex;
  gap: 8px;
}

.movie-overview__share a {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 18px;
  transition: 0.15s ease;
}

.movie-overview__share a:hover {
  border-color: var(--color-accent-700, var(--bg-brand));
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .movie-overview {
    grid-template-columns: 108px minmax(0, 1fr);
    gap: 14px;
    padding: 14px;
  }

  .movie-overview__content {
    display: contents;
  }

  .movie-overview__content > div:first-child {
    grid-column: 2;
    min-width: 0;
  }

  .movie-overview__title {
    font-size: 21px;
  }

  .movie-overview__description,
  .movie-overview__facts {
    grid-column: 1 / -1;
  }

  .movie-overview__facts > div {
    grid-template-columns: 104px minmax(0, 1fr);
  }
}
</style>
