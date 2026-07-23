<!-- English description: Composes the backend movie overview, player, related catalog, sharing, and comments experience. -->
<template>
  <main class="movie-detail-page">
    <div class="container mx-auto">
      <div v-if="loading" class="movie-detail-page__loading" aria-busy="true">
        <div class="movie-detail-page__loading-overview">
          <span class="movie-detail-page__loading-poster" />
          <div>
            <span
              class="movie-detail-page__loading-line movie-detail-page__loading-line--title"
            />
            <span class="movie-detail-page__loading-line" />
            <span
              class="movie-detail-page__loading-line movie-detail-page__loading-line--wide"
            />
          </div>
        </div>
        <span class="movie-detail-page__loading-player" />
      </div>

      <div
        v-else-if="errorMessage || movieNotFound || !movie"
        class="movie-detail-page__state"
        role="alert"
      >
        <Icon name="i-ph-film-strip-duotone" class="h-12 w-12" />
        <h1>
          {{ movieNotFound ? "Không tìm thấy phim" : "Không thể tải phim" }}
        </h1>
        <p>{{ errorMessage || "Phim này không tồn tại hoặc đã bị xóa." }}</p>
        <div class="movie-detail-page__state-actions">
          <UButton
            icon="i-ph-arrow-counter-clockwise-bold"
            label="Thử lại"
            @click="refresh"
          />
          <UButton
            :to="appRoutes.movies"
            color="neutral"
            variant="outline"
            icon="i-ph-arrow-left-bold"
            label="Về danh sách phim"
          />
        </div>
      </div>

      <template v-else>
        <MovieDetailOverview
          :movie="movie"
          :genre-label="formatFilterLabel(movie.genre)"
          :country-label="formatFilterLabel(movie.country)"
          :description-expanded="descriptionExpanded"
          :can-expand-description="canExpandDescription"
          :facebook-share-url="facebookShareUrl"
          :twitter-share-url="twitterShareUrl"
          @toggle-description="descriptionExpanded = !descriptionExpanded"
        />

        <MoviePlayer :movie="movie" />

        <section
          v-if="relatedMovies.length > 0"
          class="movie-detail-page__related"
        >
          <header class="movie-detail-page__section-header">
            <span>
              <Icon name="i-ph-film-strip-fill" />
            </span>
            <h2>Hơn như thế này</h2>
          </header>
          <div class="movie-detail-page__related-grid">
            <MoviesCard
              v-for="relatedMovie in relatedMovies"
              :key="relatedMovie.id"
              :movie="relatedMovie"
              :genre-label="formatFilterLabel(relatedMovie.genre)"
            />
          </div>
        </section>

        <MovieCommentsSection
          :comments="comments"
          :comment-count="commentCount"
          :comments-loading="commentsLoading"
          :commenting="commenting"
          :current-user-name="currentUserName"
          :current-user-avatar-url="currentUserAvatarUrl"
          :comment-action-repository="commentActionRepository"
          @add-comment="addComment"
        />
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry";
import MoviesCard from "../components/Card.vue";
import MovieCommentsSection from "../components/MovieCommentsSection.vue";
import MovieDetailOverview from "../components/MovieDetailOverview.vue";
import MoviePlayer from "../components/MoviePlayer.vue";
import { useMovieDetailPageVM } from "../../application/view-models/useMovieDetailPageVM";

const {
  movie,
  relatedMovies,
  comments,
  loading,
  commentsLoading,
  commenting,
  movieNotFound,
  errorMessage,
  commentCount,
  descriptionExpanded,
  canExpandDescription,
  facebookShareUrl,
  twitterShareUrl,
  currentUserName,
  currentUserAvatarUrl,
  commentActionRepository,
  addComment,
  refresh,
} = useMovieDetailPageVM();

const formatFilterLabel = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(
      (part) =>
        `${part.charAt(0).toLocaleUpperCase()}${part.slice(1).toLocaleLowerCase()}`,
    )
    .join(" ");
</script>

<style scoped>
.movie-detail-page {
  min-height: 100%;
  padding: 18px 0 32px;
}

.movie-detail-page .container {
  display: grid;
  gap: 18px;
  width: min(1120px, calc(100% - 24px));
}

.movie-detail-page__related,
.movie-detail-page__state {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.movie-detail-page__related {
  overflow: hidden;
}

.movie-detail-page__section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #eef2f7;
  padding: 14px 16px;
}

.movie-detail-page__section-header > span {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--color-accent-700, var(--bg-brand));
  color: #ffffff;
}

.movie-detail-page__section-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.movie-detail-page__related-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 16px;
}

.movie-detail-page__state {
  display: grid;
  min-height: 360px;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 28px;
  color: var(--text-secondary);
  text-align: center;
}

.movie-detail-page__state h1,
.movie-detail-page__state p {
  margin: 0;
}

.movie-detail-page__state h1 {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 800;
}

.movie-detail-page__state p {
  max-width: 520px;
  font-size: 13px;
  line-height: 1.6;
}

.movie-detail-page__state-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.movie-detail-page__loading {
  display: grid;
  gap: 18px;
}

.movie-detail-page__loading-overview {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 24px;
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 20px;
}

.movie-detail-page__loading-overview > div {
  display: grid;
  align-content: start;
  gap: 12px;
}

.movie-detail-page__loading-poster,
.movie-detail-page__loading-line,
.movie-detail-page__loading-player {
  display: block;
  background: linear-gradient(90deg, #e5e7eb 25%, #f8fafc 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: movie-detail-loading 1.2s ease-in-out infinite;
}

.movie-detail-page__loading-poster {
  border-radius: 12px;
  aspect-ratio: 2 / 3;
}

.movie-detail-page__loading-line {
  width: 44%;
  height: 14px;
  border-radius: 4px;
}

.movie-detail-page__loading-line--title {
  width: 70%;
  height: 34px;
}

.movie-detail-page__loading-line--wide {
  width: 92%;
}

.movie-detail-page__loading-player {
  border-radius: 16px;
  aspect-ratio: 16 / 9;
}

@keyframes movie-detail-loading {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

@media (min-width: 640px) {
  .movie-detail-page__related-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .movie-detail-page__related-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .movie-detail-page {
    padding-top: 10px;
  }

  .movie-detail-page .container {
    width: 100%;
  }

  .movie-detail-page__loading-overview {
    grid-template-columns: 108px 1fr;
    gap: 14px;
    border-radius: 0;
    padding: 14px;
  }

  .movie-detail-page__related {
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }
}
</style>
