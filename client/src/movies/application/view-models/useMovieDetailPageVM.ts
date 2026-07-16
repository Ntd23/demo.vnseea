// English description: Owns movie detail loading, sharing, related movies, playback metadata, and comment workflows.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry";
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore";
import type {
  FeedCommentRecord,
  FeedCommentSubmitPayload,
} from "../../../feed/domain/types/feed.types";
import type { FeedCommentActionRepository } from "../../../feed/application/view-models/useFeedCommentItemVM";
import { createApiMoviesRepository } from "../../infrastructure/repositories/ApiMoviesRepository";
import type { MoviesRepository } from "../../domain/repositories/MoviesRepository";

const countCommentsAndReplies = (comments: FeedCommentRecord[]) =>
  comments.reduce(
    (total, comment) =>
      total +
      1 +
      Math.max(comment.replies?.length ?? 0, comment.repliesCount ?? 0),
    0,
  );

export function useMovieDetailPageVM(
  repository: MoviesRepository = createApiMoviesRepository(),
) {
  const route = useRoute();
  const requestURL = useRequestURL();
  const currentAuthUserStore = useCurrentAuthUserStore();
  const routeMovieId = computed(() =>
    Number.parseInt(String(route.params.id ?? ""), 10),
  );
  const validMovieId = computed(() =>
    Number.isInteger(routeMovieId.value) && routeMovieId.value > 0
      ? routeMovieId.value
      : 0,
  );

  const {
    data: detail,
    status,
    error,
    refresh,
  } = useAsyncData(
    () => `movies:detail:${validMovieId.value}`,
    () =>
      validMovieId.value
        ? repository.getDetail(validMovieId.value)
        : Promise.resolve(null),
    {
      watch: [validMovieId],
      default: () => null,
    },
  );
  const {
    data: backendComments,
    status: commentsStatus,
    refresh: refreshComments,
  } = useAsyncData(
    () => `movies:detail:${validMovieId.value}:comments`,
    () =>
      validMovieId.value
        ? repository.getComments(validMovieId.value)
        : Promise.resolve([]),
    {
      watch: [validMovieId],
      default: () => [],
    },
  );

  const comments = ref<FeedCommentRecord[]>([]);
  const commenting = ref(false);
  const descriptionExpanded = ref(false);

  watch(
    backendComments,
    (value) => {
      comments.value = [...value];
    },
    { immediate: true },
  );

  watch(validMovieId, () => {
    comments.value = [];
    descriptionExpanded.value = false;
  });

  onMounted(async () => {
    await currentAuthUserStore.hydrate();
  });

  const movie = computed(() => detail.value?.movie ?? null);
  const relatedMovies = computed(() => detail.value?.related ?? []);
  const loading = computed(() => status.value === "pending");
  const commentsLoading = computed(() => commentsStatus.value === "pending");
  const movieNotFound = computed(
    () => !loading.value && (!validMovieId.value || !movie.value),
  );
  const errorMessage = computed(() =>
    error.value instanceof Error && error.value.message
      ? error.value.message
      : error.value
        ? "Không thể tải thông tin phim."
        : "",
  );
  const commentCount = computed(() => countCommentsAndReplies(comments.value));
  const shareUrl = computed(() =>
    new URL(
      appRoutes.movieDetail(
        validMovieId.value || route.params.id?.toString() || "",
      ),
      requestURL.origin,
    ).toString(),
  );
  const facebookShareUrl = computed(
    () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`,
  );
  const twitterShareUrl = computed(
    () =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(movie.value?.title || "")}`,
  );
  const canExpandDescription = computed(
    () => (movie.value?.summary.length ?? 0) > 420,
  );

  async function addComment(payload: FeedCommentSubmitPayload) {
    if (commenting.value || !validMovieId.value || !payload.text.trim()) {
      return;
    }

    commenting.value = true;

    try {
      const comment = await repository.addComment(validMovieId.value, payload);
      await refreshComments();

      if (!backendComments.value.some((item) => item.id === comment.id)) {
        comments.value = [comment, ...comments.value];
      }
    } finally {
      commenting.value = false;
    }
  }

  const commentActionRepository: FeedCommentActionRepository = {
    getCommentReplies(input) {
      return repository.getCommentReplies(validMovieId.value, input);
    },
    runCommentAction(input) {
      return repository.runCommentAction(validMovieId.value, input);
    },
  };

  useSeoMeta({
    title: () =>
      movie.value ? `${movie.value.title} | VNSEEA` : "Chi tiết phim | VNSEEA",
    description: () =>
      movie.value?.summary || "Xem thông tin và nội dung phim trên VNSEEA.",
    ogTitle: () => movie.value?.title || "Chi tiết phim",
    ogDescription: () => movie.value?.summary || "",
    ogImage: () => movie.value?.cover || "",
    ogUrl: () => shareUrl.value,
  });

  return {
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
    shareUrl,
    facebookShareUrl,
    twitterShareUrl,
    currentUserName: computed(() => currentAuthUserStore.user?.name || ""),
    currentUserAvatarUrl: computed(
      () => currentAuthUserStore.user?.avatarUrl || "",
    ),
    commentActionRepository,
    addComment,
    refresh,
  };
}
