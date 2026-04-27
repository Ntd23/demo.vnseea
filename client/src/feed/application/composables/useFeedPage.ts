import { computed, onMounted, onUnmounted, ref } from "vue"
import { useFeedDataSource } from "../../infrastructure/adapters/feedData.adapter"

export function useFeedPage() {
  const { posts } = useFeedDataSource()

  const newPostsCount = ref(0)
  const pageSize = 2
  const page = ref(1)
  const loadingMore = ref(false)
  let newPostTimer: ReturnType<typeof setTimeout> | undefined

  const visiblePosts = computed(() => posts.slice(0, page.value * pageSize))
  const allLoaded = computed(() => visiblePosts.value.length >= posts.length)

  const loadNewPosts = () => {
    newPostsCount.value = 0
  }

  const loadMore = async () => {
    loadingMore.value = true
    await new Promise(resolve => setTimeout(resolve, 800))
    page.value += 1
    loadingMore.value = false
  }

  onMounted(() => {
    newPostTimer = setTimeout(() => {
      newPostsCount.value = 3
    }, 8000)
  })

  onUnmounted(() => {
    if (newPostTimer) {
      clearTimeout(newPostTimer)
    }
  })

  return {
    posts,
    newPostsCount,
    pageSize,
    page,
    loadingMore,
    visiblePosts,
    allLoaded,
    loadNewPosts,
    loadMore,
  }
}
