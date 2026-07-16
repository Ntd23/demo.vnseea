<!-- English description: Plays a backend movie source or renders its configured embedded player. -->
<template>
  <section class="movie-player" aria-label="Trình phát phim">
    <div class="movie-player__frame">
      <video
        v-if="movie.source"
        class="movie-player__video"
        :src="movie.source"
        :poster="movie.cover"
        controls
        playsinline
        preload="metadata"
      />
      <iframe
        v-else-if="movie.embedUrl"
        class="movie-player__embed"
        :src="movie.embedUrl"
        :title="movie.title"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
      />
      <div v-else class="movie-player__empty">
        <Icon name="i-ph-video-camera-slash-duotone" class="h-10 w-10" />
        <span>Phim này chưa có nguồn phát.</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MovieRecord } from "../../domain/types/movies.types";

defineProps<{
  movie: MovieRecord;
}>();
</script>

<style scoped>
.movie-player {
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #020617;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.12);
}

.movie-player__frame {
  display: grid;
  width: 100%;
  aspect-ratio: 16 / 9;
  place-items: center;
}

.movie-player__video,
.movie-player__embed {
  width: 100%;
  height: 100%;
  border: 0;
  background: #000000;
}

.movie-player__video {
  object-fit: contain;
}

.movie-player__empty {
  display: grid;
  place-items: center;
  gap: 10px;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 700;
}
</style>
