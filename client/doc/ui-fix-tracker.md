# UI Fix Tracker

File nay la tracker full-site cho viec sua UI theo [ui_style_guide.md](/d:/Duong/src/laragon/www/demo.vnseea/client/doc/ui_style_guide.md).

Quy uoc:
- `[x]` da sua va da qua `npm run build`
- `[-]` da sua mot phan / dang sua do
- `[ ]` chua sua theo guide

## Global rules

- `[x]` bo dan border den cung kieu `black` / `#111111` o shell moi
- `[x]` icon shell chung da co utility soft style trong [main.css](/d:/Duong/src/laragon/www/demo.vnseea/client/app/assets/css/main.css)
- `[-]` bo dan `font-black`, `tracking-widest`, `tracking-[0.2em]` o navigation/feed
- `[-]` chuan hoa action button ve ghost style
- `[-]` chuan hoa radius card/button/input theo guide
- `[-]` chuan hoa shadow nhe theo guide
- `[ ]` ra soat responsive mobile va desktop cho toan site

## Shared shell

### Da sua

- `[x]` [main.css](/d:/Duong/src/laragon/www/demo.vnseea/client/app/assets/css/main.css)
  - utility `app-icon-shell`
  - base icon shell da ve `border-light + surface tinted`
  - active state xanh

- `[x]` [HeaderBar.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/HeaderBar.vue)
- `[x]` [HeaderIconNav.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/HeaderIconNav.vue)
- `[x]` [SidebarMenuItem.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/SidebarMenuItem.vue)
- `[x]` [LeftSidebar.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/LeftSidebar.vue)
- `[x]` [HeaderSearchInput.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/HeaderSearchInput.vue)
- `[x]` [LocaleSwitcher.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/LocaleSwitcher.vue)
- `[x]` [HeaderLogo.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/HeaderLogo.vue)
- `[x]` [RightSidebar.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/RightSidebar.vue)
- `[x]` [WidgetCard.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/WidgetCard.vue)
- `[x]` [ChatWidget.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/ChatWidget.vue)

### Dang sua do

- `[-]` [HeaderUserMenu.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/HeaderUserMenu.vue)
  - trigger/dropdown da on hon
  - can ra tiep icon item, spacing trong dropdown

- `[-]` [MobileMenu.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/MobileMenu.vue)
  - structure on
  - can doi icon row, label weight, spacing cho sat guide hon

## Context-by-context status

### Auth

- `[x]` [AuthSplitShell.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/auth/presentation/components/AuthSplitShell.vue)
- `[x]` [AuthHeroPanel.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/auth/presentation/components/AuthHeroPanel.vue)
- `[x]` [RegisterPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/auth/presentation/pages/RegisterPage.vue)
- `[x]` [ForgotPasswordPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/auth/presentation/pages/ForgotPasswordPage.vue)
- `[-]` visual parity voi baseline cu chua chot

### Pages shell

- `[x]` [WelcomePage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/pages/presentation/pages/WelcomePage.vue)
- `[-]` cac page generic khac trong `src/pages/presentation/pages/*` chua audit het theo guide

### Feed / Home / Explore / Popular / Saved / Reels / Watch / Photos / Movies / Memories

- `[x]` [HomeFeedPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/pages/HomeFeedPage.vue)
- `[x]` [FeedPublisherBox.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/components/FeedPublisherBox.vue)
- `[x]` [PostCard.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/components/PostCard.vue)
- `[-]` [StoryCarousel.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/components/StoryCarousel.vue)
- `[-]` [StatusCreatePage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/pages/StatusCreatePage.vue)
- `[-]` [CommentItem.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/components/CommentItem.vue)
- `[-]` [CommentList.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/components/CommentList.vue)
- `[-]` [ShareModal.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/components/ShareModal.vue)
- `[-]` [PublisherComposerPanel.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/feed/presentation/components/PublisherComposerPanel.vue)
- `[-]` [LightboxModal.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/lightbox/presentation/components/LightboxModal.vue)

### Messages

- `[x]` [ChatWidget.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/navigation/presentation/components/ChatWidget.vue)
- `[-]` [MessagesPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/messages/presentation/pages/MessagesPage.vue)
- `[-]` [ChatList.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/messages/presentation/components/ChatList.vue)
- `[-]` [ChatWindow.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/messages/presentation/components/ChatWindow.vue)
- `[ ]` route `/messages` chua duoc tick visual parity

### Profile

- `[-]` [ProfilePage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/profile/presentation/pages/ProfilePage.vue)
- `[-]` [ProfileHero.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/profile/presentation/components/ProfileHero.vue)
- `[-]` [ProfileSidebar.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/profile/presentation/components/ProfileSidebar.vue)
- `[ ]` route `/@:username` chua audit full theo guide
- `[ ]` profile sidebar / cards / feed list chua danh dau xong

### Community

- `[-]` [GroupsPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/community/presentation/pages/GroupsPage.vue)
- `[ ]` `/groups`
- `[ ]` `/pages`
- `[ ]` `/g/[name]`
- `[ ]` `/p/[name]`
- `[ ]` `/group-setting/[group]`
- `[ ]` `/page-setting/[page]`
- `[ ]` page-level composition chua audit

### Product

- `[-]` [ProductsPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/product/presentation/pages/ProductsPage.vue)
- `[-]` [HeroBanner.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/product/presentation/components/HeroBanner.vue)
- `[-]` [PreviewCard.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/product/presentation/components/PreviewCard.vue)
- `[ ]` `/products`
- `[ ]` `/my-products`
- `[ ]` `/new-product`
- `[ ]` `/edit-product/[id]`
- `[ ]` card / hero / editor field / preview chua audit full theo guide

### Checkout

- `[-]` [CheckoutLayout.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/checkout/presentation/components/CheckoutLayout.vue)
- `[-]` [CheckoutSummary.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/checkout/presentation/components/CheckoutSummary.vue)
- `[-]` [ShippingAddressFormUI.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/checkout/presentation/components/ShippingAddressFormUI.vue)
- `[ ]` `/checkout`
- `[ ]` summary card, form shell, button hierarchy chua audit full

### Orders

- `[-]` [OrdersPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/orders/presentation/pages/OrdersPage.vue)
- `[-]` [BuyerOrderCard.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/orders/presentation/components/BuyerOrderCard.vue)
- `[ ]` `/orders`
- `[ ]` `/order/[id]`
- `[ ]` `/customer_order/[id]`

### Wallet / Withdrawal

- `[-]` [WalletTopupForm.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/wallet/presentation/components/WalletTopupForm.vue)
- `[-]` [WalletSendForm.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/wallet/presentation/components/WalletSendForm.vue)
- `[-]` [WithdrawalRequestForm.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/withdrawal/presentation/components/WithdrawalRequestForm.vue)
- `[ ]` `/wallet`
- `[ ]` `/withdrawal`

### Settings

- `[-]` [SettingsPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/settings/presentation/pages/SettingsPage.vue)
- `[-]` [SettingsSidebar.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/settings/presentation/components/SettingsSidebar.vue)
- `[ ]` `/setting`
- `[ ]` `/setting/[page]`

### Blogs

- `[-]` [BlogsHero.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/blogs/presentation/components/BlogsHero.vue)
- `[-]` `/blogs`
- `[-]` `/create-blog`
- `[-]` `/read-blog/[slug]`

### Search

- `[-]` [SearchPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/search/presentation/pages/SearchPage.vue)
- `[-]` [FiltersPanel.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/search/presentation/components/FiltersPanel.vue)
- `[-]` [ResultCard.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/search/presentation/components/ResultCard.vue)
- `[ ]` `/search`
- `[ ]` filter/sidebar/result card chua audit full

### Events

- `[-]` [EventsHero.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/events/presentation/components/EventsHero.vue)
- `[-]` `/events`
- `[-]` `/events/[id]`
- `[-]` `/events/create-event`

### Funding

- `[-]` [FundingPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/funding/presentation/pages/FundingPage.vue)
- `[-]` `/funding`
- `[-]` `/create_funding`
- `[-]` `/show_fund/[id]`

### Jobs

- `[-]` [JobsHero.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/jobs/presentation/components/JobsHero.vue)
- `[-]` `/jobs`

### Games

- `[-]` [GamesPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/games/presentation/pages/GamesPage.vue)
- `[-]` `/games`

### Go Pro

- `[-]` [GoProHero.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/go-pro/presentation/components/GoProHero.vue)
- `[-]` [PlanCard.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/go-pro/presentation/components/PlanCard.vue)
- `[-]` `/go-pro`

### Forum

- `[-]` [ForumPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/forum/presentation/pages/ForumPage.vue)
- `[-]` `/forum`

### Directory

- `[-]` [DirectoryIndexPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/directory/presentation/pages/DirectoryIndexPage.vue)
- `[-]` `/directory`

### Live

- `[-]` [LivePage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/live/presentation/pages/LivePage.vue)
- `[-]` `/live`

### Poke

- `[-]` [PokePage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/poke/presentation/pages/PokePage.vue)
- `[-]` [RequestCard.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/poke/presentation/components/RequestCard.vue)
- `[-]` `/poke`

### Photos

- `[-]` [PhotosPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/photos/presentation/pages/PhotosPage.vue)
- `[-]` `/photos`

### Watch

- `[-]` [WatchPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/watch/presentation/pages/WatchPage.vue)
- `[-]` `/watch`

### Reels

- `[-]` [ReelsPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/reels/presentation/pages/ReelsPage.vue)
- `[-]` `/reels`

### Popular

- `[-]` [Hero.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/popular/presentation/components/Hero.vue)
- `[-]` `/popular`

### Saved

- `[-]` [SavedPostsPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/saved/presentation/pages/SavedPostsPage.vue)
- `[-]` `/saved-posts`

### Movies

- `[-]` [MoviesPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/movies/presentation/pages/MoviesPage.vue)
- `[-]` `/movies`

### Memories

- `[-]` [MemoriesPage.vue](/d:/Duong/src/laragon/www/demo.vnseea/client/src/memories/presentation/pages/MemoriesPage.vue)
- `[-]` `/memories`

## Priority batches

### Batch 1

- `[x]` navigation shell
- `[x]` auth shell
- `[-]` home/feed shell

### Batch 2

- `[-]` feed details
  - `StatusCreatePage`
  - `CommentItem`
  - `CommentList`
  - `ShareModal`
  - `PublisherComposerPanel`
  - `StoryCarousel`

### Batch 3

- `[-]` profile
- `[-]` messages page-level
- `[-]` community

### Batch 4

- `[-]` product
- `[-]` checkout
- `[-]` orders
- `[-]` wallet
- `[-]` withdrawal

### Batch 5

- `[-]` blogs
- `[-]` search
- `[-]` events
- `[-]` funding
- `[-]` jobs
- `[-]` games
- `[-]` go-pro
- `[-]` forum
- `[-]` directory
- `[-]` live
- `[-]` poke
- `[-]` photos
- `[-]` watch
- `[-]` reels
- `[-]` popular
- `[-]` saved
- `[-]` movies
- `[-]` memories

## Route smoke checklist

### Core

- `[ ]` `/welcome`
- `[ ]` `/register`
- `[ ]` `/forgot-password`
- `[ ]` `/home`
- `[ ]` `/messages`
- `[ ]` `/@:username`

### Social / content

- `[ ]` `/explore`
- `[ ]` `/search`
- `[ ]` `/blogs`
- `[ ]` `/create-blog`
- `[ ]` `/read-blog/[slug]`
- `[ ]` `/photos`
- `[ ]` `/watch`
- `[ ]` `/reels`
- `[ ]` `/popular`
- `[ ]` `/saved-posts`
- `[ ]` `/movies`
- `[ ]` `/memories`
- `[ ]` `/status/create`

### Community / product / commerce

- `[ ]` `/groups`
- `[ ]` `/pages`
- `[ ]` `/g/[name]`
- `[ ]` `/p/[name]`
- `[ ]` `/products`
- `[ ]` `/new-product`
- `[ ]` `/checkout`
- `[ ]` `/orders`
- `[ ]` `/wallet`
- `[ ]` `/withdrawal`

### Other features

- `[ ]` `/events`
- `[ ]` `/funding`
- `[ ]` `/jobs`
- `[ ]` `/games`
- `[ ]` `/go-pro`
- `[ ]` `/forum`
- `[ ]` `/directory`
- `[ ]` `/live`
- `[ ]` `/poke`

## Per-file done checklist

- `[ ]` khong con `border-black` / `#111111`
- `[ ]` khong con `font-black` cho menu/body text
- `[ ]` khong con `tracking-widest` hoac `tracking-[0.2em]` o nav/action text
- `[ ]` icon inactive la soft gray / tinted
- `[ ]` icon active la xanh
- `[ ]` button action la ghost hoac primary dung guide
- `[ ]` shadow nhe
- `[ ]` radius dung guide
- `[ ]` mobile va desktop deu on
- `[ ]` `npm run build` pass

## Current build status

- `[x]` batch moi nhat da pass `npm run build`
