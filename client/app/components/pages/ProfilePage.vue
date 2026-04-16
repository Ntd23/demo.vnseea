<template>
  <div class="space-y-4 pb-10">
    <ProfileHero />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.26fr)_270px] 2xl:grid-cols-[minmax(0,1.28fr)_280px]">
      <section class="space-y-4 min-w-0">
        <ProfileCompletionCard :items="checklist" />
        <FeedPublisherBox />
        <ProfileFeedList :posts="posts" />
      </section>

      <ProfileSidebar
        :highlight-photos="highlightPhotos"
        :mutual-friends="mutualFriends"
        :products="products"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { posts } = useMockSocialData()
const checklist = ['Ảnh đại diện', 'Ảnh bìa', 'Giới thiệu', 'Bài đăng', 'Bạn bè']
const mutualFriends = [
  { initials: 'TH', name: 'Thu Hà', meta: '8 bạn chung' },
  { initials: 'BT', name: 'Bảo Trân', meta: '12 bạn chung' },
  { initials: 'NP', name: 'Nam Phạm', meta: '5 bạn chung' },
  { initials: 'LD', name: 'Linh Đào', meta: '9 bạn chung' },
]
const highlightPhotos = Array.from({ length: 4 }, (_, i) => i)
const products = [
  { title: 'Áo hoodie', price: '299k' },
  { title: 'Sticker set', price: '49k' },
  { title: 'Tách cà phê', price: '129k' },
  { title: 'Notebook', price: '89k' },
]
</script>
