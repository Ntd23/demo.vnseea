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
- [ ] `client/app/pages/setting/[page].vue`
- [ ] `client/app/pages/checkout.vue`
- [ ] `client/app/pages/orders.vue`
- [ ] `client/app/pages/order/[id].vue`
- [ ] `client/app/pages/customer_order/[id].vue`
- [ ] `client/app/pages/create-group.vue`
- [ ] `client/app/pages/groups.vue`
- [ ] `client/app/pages/group-setting/[group].vue`
- [ ] `client/app/pages/create-page.vue`
- [ ] `client/app/pages/pages.vue`
- [ ] `client/app/pages/page-setting/[page].vue`
- [ ] `client/app/pages/search.vue`
- [ ] `client/app/pages/explore.vue`
- [ ] `client/app/pages/saved-posts.vue`
- [ ] `client/app/pages/poke.vue`
- [ ] `client/app/pages/memories.vue`
- [ ] `client/app/pages/go-pro.vue`
- [ ] `client/app/pages/forum/index.vue`
- [ ] `client/app/pages/directory/index.vue`
- [ ] `client/app/pages/wallet.vue`
- [ ] `client/app/pages/withdrawal.vue`
- [ ] `client/app/pages/g/[name].vue`
- [ ] `client/app/pages/p/[name].vue`
- [ ] `client/app/pages/@[username].vue`
- [ ] `client/app/pages/[username].vue`
- [ ] `client/app/pages/hashtag/[tag].vue`

## Components có title/heading/CTA hardcode cần i18n
### Feed / home
- [ ] `client/app/components/pages/HomeFeedPage.vue`
- [ ] `client/app/components/feed/FeedPublisherBox.vue`
- [ ] `client/app/components/feed/PostCard.vue`
- [ ] `client/app/components/feed/PostHeader.vue`
- [ ] `client/app/components/feed/CommentItem.vue`
- [ ] `client/app/components/feed/CommentList.vue`
- [x] `client/app/components/feed/CommentComposer.vue` ← **ví dụ mẫu, xem hướng dẫn phần trên**
- [ ] `client/app/components/feed/ShareModal.vue`
- [ ] `client/app/components/feed/StoryCarousel.vue`
- [ ] `client/app/components/feed/PublisherBox.vue`
- [ ] `client/app/components/feed/PostMediaGrid.vue`
- [ ] `client/app/components/feed/LightboxViewer.vue`
- [ ] `client/app/components/lightbox/LightboxModal.vue`

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
- [ ] `client/app/components/pages/ProfilePage.vue`
- [ ] `client/app/components/profile/ProfileHero.vue`
- [ ] `client/app/components/profile/ProfileIntroCard.vue`
- [ ] `client/app/components/profile/ProfileAboutCard.vue`
- [ ] `client/app/components/profile/ProfileInfoCard.vue`
- [ ] `client/app/components/profile/ProfileTabs.vue`
- [ ] `client/app/components/profile/ProfileFeedList.vue`
- [ ] `client/app/components/profile/ProfileFriendsGrid.vue`
- [ ] `client/app/components/profile/ProfilePhotosGrid.vue`
- [ ] `client/app/components/profile/ProfileMediaGrid.vue`
- [ ] `client/app/components/community/PageHeroBanner.vue`
- [ ] `client/app/components/community/PageFeedSection.vue`
- [ ] `client/app/components/community/PageAboutCard.vue`
- [ ] `client/app/components/community/PageActionCard.vue`
- [ ] `client/app/components/community/PageSettingsBasicsCard.vue`
- [ ] `client/app/components/community/PageSettingsControlsCard.vue`
- [ ] `client/app/components/community/PageSettingsSidebar.vue`
- [ ] `client/app/components/community/GroupHeroBanner.vue`
- [ ] `client/app/components/community/GroupFeedSection.vue`
- [ ] `client/app/components/community/GroupAboutCard.vue`
- [ ] `client/app/components/community/GroupTabsBar.vue`
- [ ] `client/app/components/community/GroupMembersCard.vue`
- [ ] `client/app/components/community/GroupAdminCard.vue`
- [ ] `client/app/components/community/GroupTopicsCard.vue`
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
- [ ] `client/app/components/pages/ReadBlogPage.vue`
- [ ] `client/app/components/blogs/ReadBlogHero.vue`
- [ ] `client/app/components/blogs/ReadBlogMain.vue`
- [ ] `client/app/components/blogs/ReadBlogSidebar.vue`
- [x] `client/app/components/blogs/BlogArticleCard.vue`

### Events / jobs / funding / live / watch
- [ ] `client/app/components/pages/EventsPage.vue`
- [ ] `client/app/components/events/EventsHero.vue`
- [ ] `client/app/components/events/EventsFilters.vue`
- [ ] `client/app/components/events/EventCard.vue`
- [ ] `client/app/components/events/EventDetailHero.vue`
- [ ] `client/app/components/events/EventDetailMain.vue`
- [ ] `client/app/components/events/EventDetailSidebar.vue`
- [ ] `client/app/components/events/CreateEventPage.vue`
- [ ] `client/app/components/events/CreateEventHero.vue`
- [ ] `client/app/components/events/CreateEventComposer.vue`
- [ ] `client/app/components/events/EventsSidebar.vue`
- [ ] `client/app/components/jobs/JobsHero.vue`
- [ ] `client/app/components/jobs/JobsFilters.vue`
- [ ] `client/app/components/jobs/JobsResultsHeader.vue`
- [ ] `client/app/components/jobs/JobsSidebar.vue`
- [ ] `client/app/components/jobs/JobsEmptyState.vue`
- [ ] `client/app/components/jobs/JobCard.vue`
- [ ] `client/app/components/jobs/JobDetailPanel.vue`
- [ ] `client/app/components/jobs/JobApplyModal.vue`
- [ ] `client/app/components/jobs/JobPostModal.vue`
- [ ] `client/app/components/funding/FundingHero.vue`
- [ ] `client/app/components/funding/FundingFilters.vue`
- [ ] `client/app/components/funding/FundingCard.vue`
- [ ] `client/app/components/funding/FundingProgress.vue`
- [ ] `client/app/components/funding/FundingSidebar.vue`
- [ ] `client/app/components/funding/FundingDetailHero.vue`
- [ ] `client/app/components/funding/FundingDetailMain.vue`
- [ ] `client/app/components/funding/FundingDetailSidebar.vue`
- [ ] `client/app/components/funding/CreateFundingForm.vue`
- [ ] `client/app/components/funding/FundingDonateModal.vue`
- [ ] `client/app/components/funding/FundingFilters.vue`
- [ ] `client/app/components/live/LiveHero.vue`
- [ ] `client/app/components/live/LivePlayer.vue`
- [ ] `client/app/components/live/LiveStreamList.vue`
- [ ] `client/app/components/live/LiveChat.vue`
- [ ] `client/app/components/live/GoLiveModal.vue`
- [ ] `client/app/components/watch/WatchHero.vue`
- [ ] `client/app/components/watch/WatchFilters.vue`
- [ ] `client/app/components/watch/WatchPlayer.vue`
- [ ] `client/app/components/watch/WatchVideoInfo.vue`
- [ ] `client/app/components/watch/WatchComments.vue`
- [ ] `client/app/components/watch/RelatedVideos.vue`

### Marketplace / checkout / orders / wallet / withdrawal
- [x] `client/app/components/pages/NewProductPage.vue`
- [x] `client/app/components/pages/EditProductPage.vue`
- [x] `client/app/components/pages/MyProductsPage.vue`
- [x] `client/app/components/pages/ProductsPage.vue`
- [x] `client/app/components/product/HeroBanner.vue`
- [x] `client/app/components/product/PreviewCard.vue`
- [x] `client/app/components/product/EditorFields.vue`
- [x] `client/app/components/product/CreateMediaField.vue`
- [x] `client/app/components/product/EditMediaManager.vue`
- [x] `client/app/components/product/ChecklistCard.vue`
- [x] `client/app/components/product/TipsCard.vue`
- [ ] `client/app/components/forms/SubmitBar.vue`
- [ ] `client/app/components/checkout/CheckoutLayout.vue`
- [ ] `client/app/components/checkout/CheckoutSummary.vue`
- [ ] `client/app/components/checkout/ShippingAddressFormUI.vue`
- [ ] `client/app/components/pages/CheckoutPage.vue`
- [ ] `client/app/components/pages/OrdersPage.vue`
- [ ] `client/app/components/pages/OrderDetailPage.vue`
- [ ] `client/app/components/pages/CustomerOrderPage.vue`
- [ ] `client/app/components/orders/FilterBar.vue`
- [ ] `client/app/components/orders/OverviewSidebar.vue`
- [ ] `client/app/components/orders/DetailSidebar.vue`
- [ ] `client/app/components/orders/DetailTimelineCard.vue`
- [ ] `client/app/components/orders/OrderItemCard.vue`
- [ ] `client/app/components/orders/OrderPriceSummary.vue`
- [ ] `client/app/components/orders/BuyerOrderCard.vue`
- [ ] `client/app/components/orders/SellerOrderCard.vue`
- [ ] `client/app/components/orders/SellerOrderSidebar.vue`
- [ ] `client/app/components/orders/SellerOrderChecklistCard.vue`
- [ ] `client/app/components/wallet/WalletHero.vue`
- [ ] `client/app/components/wallet/WalletTransactions.vue`
- [ ] `client/app/components/wallet/WalletSendForm.vue`
- [ ] `client/app/components/wallet/WalletTopupForm.vue`
- [ ] `client/app/components/withdrawal/WithdrawalHero.vue`
- [ ] `client/app/components/withdrawal/WithdrawalRequestForm.vue`
- [ ] `client/app/components/withdrawal/WithdrawalPaymentInfo.vue`
- [ ] `client/app/components/withdrawal/WithdrawalHistory.vue`

### Search / explore / saved / poke / memories / directory / games / go-pro / forum / settings
- [ ] `client/app/components/pages/SearchPage.vue`
- [ ] `client/app/components/search/FiltersPanel.vue`
- [ ] `client/app/components/search/ResultCard.vue`
- [ ] `client/app/components/pages/ExplorePage.vue`
- [ ] `client/app/components/explore/UserSpotlightCard.vue`
- [ ] `client/app/components/pages/SavedPostsPage.vue`
- [ ] `client/app/components/saved/PostCard.vue`
- [ ] `client/app/components/pages/PokePage.vue`
- [ ] `client/app/components/poke/RequestCard.vue`
- [ ] `client/app/components/pages/MemoriesPage.vue`
- [ ] `client/app/components/memories/MemoryCard.vue`
- [ ] `client/app/components/pages/DirectoryIndexPage.vue`
- [ ] `client/app/components/directory/DirectoryHero.vue`
- [ ] `client/app/components/directory/DirectoryFilters.vue`
- [ ] `client/app/components/directory/DirectorySidebar.vue`
- [ ] `client/app/components/directory/DirectoryCard.vue`
- [ ] `client/app/components/pages/GamesPage.vue`
- [ ] `client/app/components/games/GamesHero.vue`
- [ ] `client/app/components/games/GamesFilters.vue`
- [ ] `client/app/components/games/GamesSidebar.vue`
- [ ] `client/app/components/games/GameCard.vue`
- [ ] `client/app/components/games/GamePlayModal.vue`
- [ ] `client/app/components/go-pro/GoProHero.vue`
- [ ] `client/app/components/go-pro/BillingToggle.vue`
- [ ] `client/app/components/go-pro/ComparisonTable.vue`
- [ ] `client/app/components/go-pro/GoProSidebar.vue`
- [ ] `client/app/components/go-pro/PlanCard.vue`
- [ ] `client/app/components/go-pro/CheckoutModal.vue`
- [ ] `client/app/components/pages/ForumPage.vue`
- [ ] `client/app/components/forum/ForumHero.vue`
- [ ] `client/app/components/forum/ForumFilters.vue`
- [ ] `client/app/components/forum/ForumStatsSidebar.vue`
- [ ] `client/app/components/forum/ForumThreadCard.vue`
- [ ] `client/app/components/forum/ForumThreadDetail.vue`
- [ ] `client/app/components/forum/CreateThreadModal.vue`
- [ ] `client/app/components/pages/SettingsPage.vue`
- [ ] `client/app/components/settings/SettingsHero.vue`
- [ ] `client/app/components/settings/SettingsSidebar.vue`
- [ ] `client/app/components/settings/SettingsSection.vue`
- [ ] `client/app/components/settings/SettingsField.vue`

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
