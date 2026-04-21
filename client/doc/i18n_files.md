# Danh sách file cần đưa title/label sang i18n

> Mục tiêu: gom các chỗ đang hardcode `title`, `label`, `placeholder`, `aria-label`, CTA text, heading và trạng thái UI để chuyển sang đa ngôn ngữ.

---

## ⚡ Hướng dẫn làm i18n (đọc trước khi làm)

### 1. Setup đã có sẵn

Module `@nuxtjs/i18n` đã được cài và cấu hình trong `nuxt.config.ts`:
- Locale mặc định: **`vi`** (Tiếng Việt)
- Locale thứ 2: **`en`** (English)
- Strategy: `no_prefix` → URL không thay đổi (`/home` thay vì `/vi/home`)
- File locale: `client/i18n/locales/vi.json` và `en.json` _(nằm ngoài thư mục `app/`, đây là convention của `@nuxtjs/i18n`)_

### 2. Cấu trúc key trong file JSON

Key được **tổ chức theo namespace** dạng `<section>.<component>.<key>`:

```json
// client/app/i18n/locales/vi.json
{
  "feed": {
    "commentComposer": {
      "placeholder": "Viết bình luận mang tính xây dựng...",
      "submit": "Gửi",
      "tooltipEmoji": "Emoji"
    }
  },
  "navigation": {
    "headerBar": {
      "search": "Tìm kiếm...",
      "notifications": "Thông báo"
    }
  }
}
```

> **Quy tắc đặt tên namespace:**
> - Dùng **camelCase**
> - `<section>` = tên thư mục component (feed, navigation, profile, blogs…)
> - `<component>` = tên file component bỏ `.vue` (commentComposer, headerBar…)
> - `<key>` = tên text ngắn gọn (submit, placeholder, title…)

### 3. Cách dùng trong `.vue`

#### Trong `<template>` — dùng `$t()` trực tiếp

```vue
<template>
  <!-- Text node -->
  <button>{{ $t('feed.commentComposer.submit') }}</button>

  <!-- Thuộc tính (placeholder, title, aria-label) — phải dùng binding : -->
  <input :placeholder="$t('feed.commentComposer.placeholder')" />
  <button :title="$t('feed.commentComposer.tooltipEmoji')">...</button>
  <div :aria-label="$t('feed.commentComposer.title')">...</div>
</template>
```

#### Trong `<script setup>` — dùng `useI18n()`

```vue
<script setup lang="ts">
const { t } = useI18n()

// Dùng khi cần text trong JS (useSeoMeta, computed, toast...)
useSeoMeta({ title: () => t('pages.home.title') })
const heading = computed(() => t('profile.profileHero.editProfile'))
</script>
```

### 4. Ví dụ thực tế — `CommentComposer.vue` ✅ (đã làm)

**Trước:**
```vue
<FormsTextareaAutoResize placeholder="Viết bình luận mang tính xây dựng..." />
<button title="Ảnh">...</button>
<button>Gửi</button>
```

**Sau:**
```vue
<FormsTextareaAutoResize :placeholder="$t('feed.commentComposer.placeholder')" />
<button :title="$t('feed.commentComposer.tooltipImage')">...</button>
<button>{{ $t('feed.commentComposer.submit') }}</button>
```

**Key thêm vào `vi.json`:**
```json
"feed": {
  "commentComposer": {
    "placeholder": "Viết bình luận mang tính xây dựng...",
    "submit": "Gửi",
    "tooltipEmoji": "Emoji",
    "tooltipImage": "Ảnh",
    "tooltipGif": "GIF",
    "tooltipSticker": "Sticker",
    "tooltipMention": "Nhắc đến"
  }
}
```

### 5. Quy trình làm từng file

```
1. Mở file .vue cần làm
2. Tìm tất cả text hiển thị cho user (string trong template, placeholder, title, aria-label)
3. Thêm key vào vi.json (tiếng Việt) VÀ en.json (tiếng Anh) cùng lúc
4. Thay text trong .vue bằng $t('...')
5. Đánh dấu [x] trong danh sách bên dưới
```

> ⚠️ **Không i18n** các text kỹ thuật như: tên route, class CSS, prop nội bộ, console.log

### 6. Khi cần text có biến (interpolation)

```json
// vi.json
{ "profile": { "friendCount": "{count} bạn bè" } }
```
```vue
{{ $t('profile.friendCount', { count: 42 }) }}
// → "42 bạn bè"
```

---



## Ưu tiên cao: page / route có `useSeoMeta({ title: ... })` hoặc heading chính hardcode

- [x] `client/app/pages/index.vue`
- [x] `client/app/pages/home.vue`
- [x] `client/app/pages/welcome.vue`
- [x] `client/app/pages/register.vue`
- [x] `client/app/pages/forgot-password.vue`
- [x] `client/app/pages/messages.vue`
- [x] `client/app/pages/reels.vue`
- [x] `client/app/pages/products.vue`
- [x] `client/app/pages/new-product.vue`
- [x] `client/app/pages/edit-product/[id].vue`
- [x] `client/app/pages/my-products.vue`
- [x] `client/app/pages/blogs.vue`
- [x] `client/app/pages/create-blog.vue`
- [x] `client/app/pages/read-blog/[slug].vue`
- [x] `client/app/pages/events/index.vue`
- [x] `client/app/pages/events/create-event.vue`
- [x] `client/app/pages/events/[id].vue`
- [x] `client/app/pages/jobs.vue`
- [x] `client/app/pages/funding.vue`
- [x] `client/app/pages/create_funding.vue`
- [x] `client/app/pages/show_fund/[id].vue`
- [x] `client/app/pages/live.vue`
- [x] `client/app/pages/watch.vue`
- [x] `client/app/pages/setting/index.vue`
- [x] `client/app/pages/explore.vue`
- [x] `client/app/pages/saved-posts.vue`
- [x] `client/app/pages/poke.vue`
- [x] `client/app/pages/memories.vue`
- [x] `client/app/pages/go-pro.vue`
- [x] `client/app/pages/forum/index.vue`
- [x] `client/app/pages/directory/index.vue`
- [x] `client/app/pages/wallet.vue`
- [x] `client/app/pages/withdrawal.vue`
- [x] `client/app/pages/g/[name].vue`
- [x] `client/app/pages/p/[name].vue`
- [x] `client/app/pages/@[username].vue`
- [x] `client/app/pages/[username].vue`
- [x] `client/app/pages/hashtag/[tag].vue`
- [x] `client/app/pages/setting/[page].vue`
- [x] `client/app/pages/checkout.vue`
- [x] `client/app/pages/orders.vue`
- [x] `client/app/pages/order/[id].vue`
- [x] `client/app/pages/customer-order/[id].vue`
- [x] `client/app/pages/create-group.vue`
- [x] `client/app/pages/groups.vue` (đã dịch toàn bộ)
- [x] `client/app/pages/group-setting/[group].vue`
- [x] `client/app/pages/create-page.vue`
- [x] `client/app/pages/pages.vue`
- [x] `client/app/pages/page-setting/[page].vue`
- [x] `client/app/pages/search.vue` (đã dịch toàn bộ)


## Components có title/heading/CTA hardcode cần i18n
### Feed / home
- [ ] `client/app/components/pages/HomeFeedPage.vue`
- [x] `client/app/components/feed/FeedPublisherBox.vue`
- [x] `client/app/components/feed/PostCard.vue`
- [x] `client/app/components/feed/PostHeader.vue`
- [x] `client/app/components/feed/CommentItem.vue`
- [x] `client/app/components/feed/CommentList.vue`
- [x] `client/app/components/feed/CommentComposer.vue` ← **ví dụ mẫu, xem hướng dẫn phần trên**
- [x] `client/app/components/feed/ShareModal.vue`
- [ ] `client/app/components/feed/StoryCarousel.vue`
- [ ] `client/app/components/feed/PublisherBox.vue`
- [x] `client/app/components/feed/PostMediaGrid.vue`
- [ ] `client/app/components/feed/LightboxViewer.vue`
- [x] `client/app/components/lightbox/LightboxModal.vue`

### Navigation / layout
- [ ] `client/app/components/navigation/HeaderBar.vue`
- [ ] `client/app/components/navigation/HeaderIconNav.vue`
- [ ] `client/app/components/navigation/MobileMenu.vue`
- [ ] `client/app/components/navigation/LeftSidebar.vue`
- [x] `client/app/components/navigation/RightSidebar.vue`
- [ ] `client/app/components/navigation/ChatWidget.vue`
- [ ] `client/app/components/navigation/HeaderSearchInput.vue`
- [ ] `client/app/components/navigation/HeaderLogo.vue`
- [ ] `client/app/components/navigation/SidebarMenuItem.vue`
- [ ] `client/app/components/navigation/WidgetCard.vue`
- [x] `client/app/layouts/default.vue`
- [ ] `client/app/layouts/guest.vue`
- [x] `client/app/layouts/messages.vue`

### Auth / onboarding
- [x] `client/app/components/pages/WelcomePage.vue`
- [x] `client/app/components/pages/RegisterPage.vue`
- [x] `client/app/components/pages/ForgotPasswordPage.vue`
- [x] `client/app/components/auth/AuthSplitShell.vue`
- [ ] `client/app/components/auth/AuthHeroPanel.vue`

### Messages / reels
- [x] `client/app/components/pages/MessagesPage.vue`
- [x] `client/app/components/messages/ConversationList.vue`
- [ ] `client/app/components/messages/MessagePane.vue`
- [x] `client/app/components/pages/ReelsPage.vue`
- [x] `client/app/components/reels/ReelsPlayer.vue`
- [x] `client/app/components/reels/ReelsOverlay.vue`

### Profile / community
- [x] `client/app/components/pages/ProfilePage.vue`
- [x] `client/app/components/pages/HashtagPage.vue`
- [x] `client/app/components/pages/GroupDetailPage.vue`
- [x] `client/app/components/pages/PageDetailPage.vue`
- [x] `client/app/components/profile/ProfileHero.vue`
- [x] `client/app/components/profile/ProfileCompletionCard.vue`
- [x] `client/app/components/profile/ProfileSidebar.vue`
- [ ] `client/app/components/profile/ProfileIntroCard.vue`
- [ ] `client/app/components/profile/ProfileAboutCard.vue`
- [x] `client/app/components/profile/ProfileInfoCard.vue`
- [ ] `client/app/components/profile/ProfileTabs.vue`
- [x] `client/app/components/profile/ProfileFeedList.vue`
- [ ] `client/app/components/profile/ProfileFriendsGrid.vue`
- [ ] `client/app/components/profile/ProfilePhotosGrid.vue`
- [x] `client/app/components/profile/ProfileMediaGrid.vue`
- [ ] `client/app/components/community/PageHeroBanner.vue`
- [ ] `client/app/components/community/PageFeedSection.vue`
- [ ] `client/app/components/community/PageAboutCard.vue`
- [ ] `client/app/components/community/PageActionCard.vue`
- [ ] `client/app/components/community/PageSettingsBasicsCard.vue`
- [ ] `client/app/components/community/PageSettingsControlsCard.vue`
- [ ] `client/app/components/community/PageSettingsSidebar.vue`
- [x] `client/app/components/community/PageHeroBanner.vue`
- [x] `client/app/components/community/PageFeedSection.vue`
- [x] `client/app/components/community/PageAboutCard.vue`
- [x] `client/app/components/community/PageActionCard.vue`
- [x] `client/app/components/community/GroupHeroBanner.vue`
- [x] `client/app/components/community/GroupFeedSection.vue`
- [x] `client/app/components/community/GroupAboutCard.vue`
- [x] `client/app/components/community/GroupTabsBar.vue`
- [x] `client/app/components/community/GroupMembersCard.vue`
- [x] `client/app/components/community/GroupAdminCard.vue`
- [x] `client/app/components/community/GroupTopicsCard.vue`
- [ ] `client/app/components/community/GroupSettingsBasicsCard.vue`
- [ ] `client/app/components/community/GroupSettingsControlsCard.vue`
- [ ] `client/app/components/community/GroupSettingsSidebar.vue`
- [ ] `client/app/components/community/GroupsFilterBar.vue`
- [ ] `client/app/components/community/PageDirectoryTabsBar.vue`
- [ ] `client/app/components/community/CreationHeaderCard.vue`
- [ ] `client/app/components/community/CreationInsightsPanel.vue`
- [ ] `client/app/components/community/CreationForm.vue`

### Blogs
- [x] `client/app/components/pages/BlogsPage.vue`
- [x] `client/app/components/blogs/BlogsHero.vue`
- [x] `client/app/components/blogs/BlogsFilters.vue`
- [x] `client/app/components/blogs/BlogsResultsHeader.vue`
- [x] `client/app/components/blogs/BlogsPagination.vue`
- [x] `client/app/components/blogs/BlogsSidebar.vue`
- [x] `client/app/components/blogs/BlogsEmptyState.vue`
- [x] `client/app/components/pages/CreateBlogPage.vue`
- [x] `client/app/components/blogs/CreateBlogHero.vue`
- [x] `client/app/components/blogs/CreateBlogSidebar.vue`
- [x] `client/app/components/pages/ReadBlogPage.vue`
- [x] `client/app/components/blogs/ReadBlogHero.vue`
- [x] `client/app/components/blogs/ReadBlogMain.vue`
- [x] `client/app/components/blogs/ReadBlogSidebar.vue`
- [x] `client/app/components/blogs/BlogArticleCard.vue`

### Events / jobs / funding / live / watch
- [x] `client/app/components/pages/EventsPage.vue`
- [x] `client/app/components/events/EventsHero.vue`
- [x] `client/app/components/events/EventsFilters.vue`
- [x] `client/app/components/events/EventCard.vue`
- [x] `client/app/components/events/EventDetailHero.vue`
- [x] `client/app/components/events/EventDetailMain.vue`
- [x] `client/app/components/events/EventDetailSidebar.vue`
- [x] `client/app/components/pages/CreateEventPage.vue`
- [x] `client/app/components/pages/EventDetailPage.vue`
- [x] `client/app/components/pages/JobsPage.vue`
- [x] `client/app/components/events/CreateEventHero.vue`
- [x] `client/app/components/events/CreateEventComposer.vue`
- [x] `client/app/components/events/EventsSidebar.vue`
- [x] `client/app/components/jobs/JobsHero.vue`
- [x] `client/app/components/jobs/JobsFilters.vue`
- [x] `client/app/components/jobs/JobsResultsHeader.vue`
- [x] `client/app/components/jobs/JobsSidebar.vue`
- [x] `client/app/components/jobs/JobsEmptyState.vue`
- [x] `client/app/components/jobs/JobCard.vue`
- [x] `client/app/components/jobs/JobDetailPanel.vue`
- [x] `client/app/components/jobs/JobApplyModal.vue`
- [x] `client/app/components/jobs/JobPostModal.vue`
- [x] `client/app/components/pages/FundingPage.vue`
- [x] `client/app/components/pages/CreateFundingPage.vue`
- [x] `client/app/components/pages/ShowFundPage.vue`
- [x] `client/app/components/funding/FundingHero.vue`
- [x] `client/app/components/funding/FundingFilters.vue`
- [x] `client/app/components/funding/FundingCard.vue`
- [x] `client/app/components/funding/FundingProgress.vue`
- [x] `client/app/components/funding/FundingSidebar.vue`
- [x] `client/app/components/funding/FundingDetailHero.vue`
- [x] `client/app/components/funding/FundingDetailMain.vue`
- [x] `client/app/components/funding/FundingDetailSidebar.vue`
- [x] `client/app/components/funding/CreateFundingForm.vue`
- [x] `client/app/components/funding/FundingDonateModal.vue`
- [x] `client/app/components/pages/LivePage.vue`
- [x] `client/app/components/live/LiveHero.vue`
- [x] `client/app/components/live/LivePlayer.vue`
- [x] `client/app/components/live/LiveStreamList.vue`
- [x] `client/app/components/live/LiveChat.vue`
- [x] `client/app/components/live/GoLiveModal.vue`
- [x] `client/app/components/pages/WatchPage.vue`
- [x] `client/app/components/watch/WatchHero.vue`
- [x] `client/app/components/watch/WatchFilters.vue`
- [x] `client/app/components/watch/WatchPlayer.vue`
- [x] `client/app/components/watch/WatchVideoInfo.vue`
- [x] `client/app/components/watch/WatchComments.vue`
- [x] `client/app/components/watch/RelatedVideos.vue`

### Marketplace / checkout / orders / wallet / withdrawal

- [x] `client/app/components/pages/NewProductPage.vue`
- [x] `client/app/components/pages/EditProductPage.vue`
- [x] `client/app/components/pages/MyProductsPage.vue`
- [x] `client/app/components/pages/ProductsPage.vue`
- [x] `client/app/components/pages/WalletPage.vue`
- [x] `client/app/components/pages/WithdrawalPage.vue`
- [x] `client/app/components/product/HeroBanner.vue`
- [x] `client/app/components/product/PreviewCard.vue`
- [x] `client/app/components/product/EditorFields.vue`
- [x] `client/app/components/product/CreateMediaField.vue`
- [x] `client/app/components/product/EditMediaManager.vue`
- [x] `client/app/components/product/ChecklistCard.vue`
- [x] `client/app/components/product/TipsCard.vue`
- [x] `client/app/components/wallet/WalletHero.vue`
- [x] `client/app/components/wallet/WalletTransactions.vue`
- [x] `client/app/components/wallet/WalletSendForm.vue`
- [x] `client/app/components/wallet/WalletTopupForm.vue`
- [x] `client/app/components/withdrawal/WithdrawalHero.vue`
- [x] `client/app/components/withdrawal/WithdrawalRequestForm.vue`
- [x] `client/app/components/withdrawal/WithdrawalPaymentInfo.vue`
- [x] `client/app/components/withdrawal/WithdrawalHistory.vue`
- [x] `client/app/components/checkout/CheckoutLayout.vue`
- [x] `client/app/components/checkout/CheckoutSummary.vue`
- [x] `client/app/components/checkout/ShippingAddressFormUI.vue`
- [x] `client/app/components/pages/CheckoutPage.vue`
- [x] `client/app/components/pages/OrdersPage.vue`
- [x] `client/app/components/pages/OrderDetailPage.vue`
- [x] `client/app/components/pages/CustomerOrderPage.vue`
- [x] `client/app/components/orders/FilterBar.vue`
- [x] `client/app/components/orders/OverviewSidebar.vue`
- [x] `client/app/components/orders/DetailSidebar.vue`
- [x] `client/app/components/orders/DetailTimelineCard.vue`
- [x] `client/app/components/orders/OrderItemCard.vue`
- [x] `client/app/components/orders/OrderPriceSummary.vue`
- [x] `client/app/components/orders/BuyerOrderCard.vue`
- [x] `client/app/components/orders/SellerOrderCard.vue`
- [x] `client/app/components/orders/SellerOrderSidebar.vue`
- [x] `client/app/components/orders/SellerOrderChecklistCard.vue`


### Search / explore / saved / poke / memories / directory / games / go-pro / forum / settings
- [x] `client/app/components/pages/SearchPage.vue`
- [x] `client/app/components/search/FiltersPanel.vue`
- [x] `client/app/components/search/ResultCard.vue`
- [x] `client/app/components/pages/ExplorePage.vue`
- [x] `client/app/components/explore/UserSpotlightCard.vue`
- [x] `client/app/components/pages/SavedPostsPage.vue`
- [x] `client/app/components/saved/PostCard.vue`
- [x] `client/app/components/pages/PokePage.vue`
- [x] `client/app/components/poke/RequestCard.vue`
- [x] `client/app/components/pages/MemoriesPage.vue`
- [x] `client/app/components/memories/MemoryCard.vue`
- [x] `client/app/components/pages/DirectoryIndexPage.vue`
- [x] `client/app/components/directory/DirectoryHero.vue`
- [x] `client/app/components/directory/DirectoryFilters.vue`
- [x] `client/app/components/directory/DirectorySidebar.vue`
- [x] `client/app/components/directory/DirectoryCard.vue`
- [x] `client/app/components/pages/GamesPage.vue`
- [x] `client/app/components/games/GamesHero.vue`
- [x] `client/app/components/games/GamesFilters.vue`
- [x] `client/app/components/games/GamesSidebar.vue`
- [x] `client/app/components/games/GameCard.vue`
- [x] `client/app/components/games/GamePlayModal.vue`

- [x] `client/app/components/go-pro/GoProHero.vue`
- [x] `client/app/components/go-pro/BillingToggle.vue`
- [x] `client/app/components/go-pro/ComparisonTable.vue`
- [x] `client/app/components/go-pro/GoProSidebar.vue`
- [x] `client/app/components/go-pro/PlanCard.vue`
- [x] `client/app/components/go-pro/CheckoutModal.vue`
- [x] `client/app/components/pages/ForumPage.vue`
- [x] `client/app/components/forum/ForumHero.vue`
- [x] `client/app/components/forum/ForumFilters.vue`
- [x] `client/app/components/forum/ForumStatsSidebar.vue`
- [x] `client/app/components/forum/ForumThreadCard.vue`
- [x] `client/app/components/forum/ForumThreadDetail.vue`
- [x] `client/app/components/forum/CreateThreadModal.vue`
- [x] `client/app/components/pages/SettingsPage.vue`
- [x] `client/app/components/settings/SettingsHero.vue`
- [x] `client/app/components/settings/SettingsSidebar.vue`
- [x] `client/app/components/settings/SettingsSection.vue`
- [x] `client/app/components/settings/SettingsField.vue`


## Note nhanh
Danh sách trên là những file có khả năng chứa UI text hardcode cao nhất. Khi bắt đầu i18n thật, nên ưu tiên:
1. `useSeoMeta` titles
2. headings / hero titles
3. button labels / empty states / helper text
4. aria-label / placeholder
5. trạng thái modal / toast / notification

## Gợi ý quy tắc
- Text hiển thị cho user: đưa vào i18n
- Text kỹ thuật / state nội bộ: giữ nguyên
- Label route / SEO: ưu tiên dùng key riêng theo page
- Nếu component dùng ở nhiều page, tách key theo namespace chung
