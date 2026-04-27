<template>
  <ProfilePresentationPage>
    <template #feed>
      <FeedPublisherBox />
      <ProfileFeedList :posts="posts" />
    </template>
  </ProfilePresentationPage>
</template>

<script setup lang="ts">
import ProfilePresentationPage from "../../../src/profile/presentation/pages/ProfilePage.vue"
/**
 * Legacy wrapper for ProfilePage.
 * Structure moved to src/profile/presentation/pages/ProfilePage.vue
 */
const { posts } = useMockSocialData()
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

