# Client Components Migration Doc

Tài liệu này mô tả toàn bộ scope trong:
- `client/app/components/*`
- `client/app/composables/*`

Mục tiêu:
- có một bản đồ module rõ ràng để giao task
- biết khu nào đã tận dụng thư viện tốt
- biết khu nào còn đang là HTML/Tailwind/JS thủ công
- áp tiêu chí bắt buộc cho migration về `SEO`, `UI/UX`, `SSR`

## Nguyên tắc bắt buộc

Mọi task migration trong `client` phải thỏa đồng thời 3 nhóm yêu cầu:

### SEO

- Mỗi page phải có `useSeoMeta()` hoặc `useHead()` rõ ràng
- Title, description, Open Graph, canonical phải được set ở page-level khi hợp lý
- Listing pages phải hỗ trợ URL có ý nghĩa, query/filter nên đồng bộ được với route khi cần
- Nội dung quan trọng không được phụ thuộc hoàn toàn vào client-only render nếu đó là content nên index
- Ảnh quan trọng nên ưu tiên `NuxtImg` / `NuxtPicture` thay vì `<img>` thường khi có lợi cho tối ưu tải
- Cần tránh render text placeholder vô nghĩa cho crawler ở các page public

### UI/UX

- Không chỉ đổi native input sang `UInput`, mà phải cải thiện flow thao tác
- Form phải có trạng thái rõ: `idle`, `loading`, `success`, `error`, `disabled`
- Action quan trọng phải có feedback: inline message, `UAlert`, `useToast`, progress, hoặc disabled state
- Mobile-first: thao tác phải ổn trên màn nhỏ, touch, keyboard, viewport hẹp
- Accessibility tối thiểu:
  - label rõ ràng
  - focus state rõ
  - keyboard navigation không vỡ
  - modal/drawer/dropdown không trap focus lỗi
- Không tự tạo quá nhiều UI primitive nếu `@nuxt/ui` đã giải quyết tốt

### SSR

- Không đọc browser API trực tiếp trong setup nếu code có thể chạy ở server
- Mọi logic `localStorage`, `sessionStorage`, `window`, `document`, `matchMedia`, `File`, `navigator` phải có guard client hoặc composable SSR-safe
- Không để state ban đầu phụ thuộc vào side effect client-only nếu template SSR cần render ổn định
- Tránh mismatch giữa SSR và hydration:
  - default state phải đủ shape
  - không render prop `undefined` cho component đang kỳ vọng array/object/string ổn định
  - không dùng readonly computed làm mutable form state
- Composable phải ưu tiên contract ổn định cho SSR trước, rồi mới sync browser state ở client

## Tổng quan

- Tổng số thư mục module trong `client/app/components`: `29`
- Tổng số component Vue: khoảng `244`
- Tổng số composable hiện có: `27`

### Mức tận dụng thư viện hiện tại

- `@nuxt/ui`: mới xuất hiện rõ ở `foundation`, `forms` một phần nhỏ, `pages` một ít, và `product`
- `@vueuse/nuxt`: mới dùng thực tế ở product editor
- `@nuxt/image`: mới thấy dùng rõ ở product media
- `@nuxtjs/i18n`: mới phủ rất ít
- `@pinia/nuxt`: gần như chưa tận dụng

## Inventory Components

## Priority Matrix

Thang đánh giá:
- `High`: ảnh hưởng lớn hoặc rủi ro cao, nên ưu tiên sớm
- `Medium`: quan trọng nhưng không chặn toàn cục
- `Low`: ưu tiên sau

| Module | SEO impact | UX impact | SSR risk | Ghi chú |
| --- | --- | --- | --- | --- |
| `auth` | Medium | High | Medium | Form đăng nhập/đăng ký quan trọng cho conversion, cần form UX tốt và SSR-safe |
| `blogs` | High | High | Medium | Blog là content public, ảnh hưởng SEO rõ nhất |
| `checkout` | Low | High | High | SEO không quan trọng, nhưng form/state SSR rất dễ lỗi |
| `community` | High | High | Medium | Group/page create/settings và listing đều quan trọng |
| `directory` | High | Medium | Medium | Filter/listing nên sync URL tốt để hỗ trợ SEO |
| `events` | High | High | Medium | Page public + create flow + filters |
| `explore` | Medium | Low | Low | Module nhỏ |
| `feed` | Medium | High | Medium | Interaction-heavy, ảnh hưởng UX lớn |
| `forms` | Low | High | Low | Là tầng primitive, ảnh hưởng dây chuyền |
| `forum` | High | High | Medium | Forum list/detail là public content |
| `foundation` | Low | High | Low | Pattern nền tảng cho toàn app |
| `funding` | High | High | Medium | Public listing/detail + form create/donate |
| `games` | Medium | Medium | Low | Filter/modal là chính |
| `go-pro` | Medium | High | Low | Pricing/upgrade flow ảnh hưởng conversion |
| `jobs` | High | High | Medium | Listing/detail/apply/post đều quan trọng |
| `lightbox` | Low | Medium | Low | UI utility |
| `live` | Medium | High | Medium | Interaction, media, chat behavior |
| `memories` | Low | Low | Low | Module nhỏ |
| `messages` | Low | High | High | SEO thấp nhưng UX và SSR/client-state rất nhạy |
| `navigation` | High | High | Medium | Ảnh hưởng toàn app, search/menu/mobile |
| `orders` | Low | High | Medium | Business flow nội bộ người dùng |
| `pages` | High | High | High | Tầng phối ghép page-level, ảnh hưởng toàn cục |
| `poke` | Low | Low | Low | Module nhỏ |
| `product` | High | High | High | Listing/detail/create/edit đều quan trọng |
| `profile` | High | Medium | Medium | Public profile có ảnh hưởng SEO |
| `reels` | Medium | High | Medium | Media UX nặng hơn SEO |
| `saved` | Low | Low | Low | Cá nhân hóa, SEO thấp |
| `search` | High | High | Medium | Search/filter/indexability quan trọng |
| `settings` | Low | Medium | Medium | Chủ yếu UX form/settings |
| `wallet` | Low | High | Medium | Transactional UX quan trọng |
| `watch` | High | High | Medium | Video detail, comment, related content |
| `withdrawal` | Low | High | Medium | Transactional form UX |
| `composables` | Medium | High | High | Sai ở đây sẽ lan ra nhiều module |

### Ưu tiên rollout đề xuất

1. `pages`, `product`, `checkout`, `auth`, `navigation`
2. `blogs`, `community`, `funding`, `jobs`, `search`, `messages`
3. `forum`, `events`, `profile`, `watch`, `wallet`, `orders`
4. `games`, `go-pro`, `live`, `directory`, `settings`
5. `explore`, `lightbox`, `memories`, `poke`, `saved`

### `auth` - 2 files

Files:
- `AuthHeroPanel.vue`
- `AuthSplitShell.vue`

Vai trò:
- shell và hero dùng cho login/register/forgot password

Nhận xét migrate:
- `AuthSplitShell.vue` hiện là shell thật của `guest layout` cho `login/register/forgot-password`
- shell đã giữ đúng scope layout:
  - mobile-first, chỉ hiện hero từ `lg`
  - có mobile brand/header rõ ràng
  - không đụng browser API nên an toàn cho SSR
- `AuthHeroPanel.vue` đã được nâng lên theo hướng reusable hơn:
  - dùng `NuxtImg` thay cho `<img>` thường
  - có fallback preview nội bộ khi ảnh remote lỗi hoặc không có ảnh
  - không đụng vào browser API nên an toàn cho SSR
- `WelcomePage.vue` đã migrate sang `@nuxt/ui`:
  - dùng `UForm`, `UFormField`, `UInput`, `UButton`, `UAlert`
  - có state rõ `idle`, `loading`, `success`, `error`, `disabled`
  - `SEO` đã được dời lên page-level route
- `RegisterPage.vue` đã migrate sang `@nuxt/ui`:
  - dùng `UForm`, `UFormField`, `UInput`, `USelect`, `URadioGroup`, `UButton`, `UAlert`
  - có state rõ `idle`, `loading`, `success`, `error`, `disabled`
  - `SEO` đã được dời lên page-level route
- `ForgotPasswordPage.vue` đã migrate sang `@nuxt/ui`:
  - dùng `UForm`, `UFormField`, `UInput`, `UCheckbox`, `UButton`, `UAlert`
  - có state rõ `idle`, `loading`, `success`, `error`, `disabled`
  - `SEO` đã được dời lên page-level route

### `blogs` - 12 files

Files:
- `BlogArticleCard.vue`
- `BlogsEmptyState.vue`
- `BlogsFilters.vue`
- `BlogsHero.vue`
- `BlogsPagination.vue`
- `BlogsResultsHeader.vue`
- `BlogsSidebar.vue`
- `CreateBlogHero.vue`
- `CreateBlogSidebar.vue`
- `ReadBlogHero.vue`
- `ReadBlogMain.vue`
- `ReadBlogSidebar.vue`

Vai trò:
- listing blog, hero, sidebar, card, read page, create page support

Nhận xét migrate:
- đã có cấu trúc component tốt
- `BlogArticleCard.vue` đã chuyển ảnh card sang `NuxtImg` và fallback reactive:
  - không còn mutate DOM trực tiếp khi ảnh lỗi
  - an toàn hơn cho SSR/hydration
- `BlogsEmptyState.vue` đã đổi CTA chính sang `UButton`
- `BlogsFilters.vue` đã nâng phần action/search lên `@nuxt/ui`:
  - dùng `UInput`, `UButton`
  - bổ sung `aria-label`, `aria-pressed`, `aria-live` cho các điểm tương tác chính
- `BlogsHero.vue`, `BlogsPagination.vue`, `BlogsResultsHeader.vue` đã chuẩn hóa action chính bằng `@nuxt/ui`:
  - dùng `UButton`, `UBadge`, `UCard` ở các vùng điều hướng/trạng thái quan trọng
  - pagination không còn button CSS thủ công riêng
  - phần heading/status có landmark và live feedback rõ hơn
- `BlogsSidebar.vue` đã chuyển các block phụ sang `UCard`, `UButton`, `UBadge`:
  - topic list và author list có semantics rõ hơn (`role="list"`, `role="listitem"`)
  - CTA/filter phụ không còn là button tự dựng bằng CSS thuần
- `CreateBlogHero.vue` và `CreateBlogSidebar.vue` đã chuẩn hóa theo `@nuxt/ui`:
  - hero action dùng `UButton`
  - stat/preview/checklist block dùng `UCard`, `UBadge`
  - preview sidebar có `aria-live` để phản ánh trạng thái preview/checklist rõ hơn
- `ReadBlogHero.vue`, `ReadBlogMain.vue`, `ReadBlogSidebar.vue` đã được chuẩn hóa lại:
  - hero detail dùng `NuxtImg` thay cho `<img>` thường và fallback không còn mutate DOM trực tiếp
  - action bar, content block, comment area, author/related sidebar đã chuyển sang `UCard`, `UButton`, `UBadge`, `UTextarea`
  - detail view có semantics và live feedback rõ hơn ở share/comment state
- `/blogs` đã dời `SEO` về page-level route:
  - có `useSeoMeta()` + canonical + Open Graph
  - query `search/category/sort/mine/page` đã sync với route cho listing public
- `/create-blog` đã dời `SEO` về page-level route:
  - có `useSeoMeta()` + canonical
  - route create flow để `noindex, nofollow`, tránh index nhầm page thao tác nội bộ
- `/read-blog/[slug]` đã dời `SEO` về page-level route:
  - có `useSeoMeta()` + canonical + `ogImage`
  - slug không hợp lệ sẽ bị `noindex, nofollow` để tránh index sai route detail
- đã có `i18n` cho `blogsPage`, `createBlogPage`, `readBlogPage` để tránh render raw key ở listing/read/create support
- `CreateBlogPage.vue` vẫn là form native lớn
- chưa có `VueUse` cho draft/search/filter persistence

### `checkout` - 3 files

Files:
- `CheckoutLayout.vue`
- `CheckoutSummary.vue`
- `ShippingAddressFormUI.vue`

Vai trò:
- flow checkout marketplace

Nhận xét migrate:
- layout đã tách gọn
- `ShippingAddressFormUI.vue` vẫn là form native lớn
- `CheckoutSummary.vue` nên chuẩn hóa button/input bằng `@nuxt/ui`
- hợp để thêm `useStorage` cho address draft
- hợp để đưa cart/checkout state sang `Pinia`

### `community` - 25 files

Files:
- `CommunityGroupCard.vue`
- `CreationForm.vue`
- `CreationHeaderCard.vue`
- `CreationInsightsPanel.vue`
- `GroupAboutCard.vue`
- `GroupAdminCard.vue`
- `GroupFeedSection.vue`
- `GroupHeroBanner.vue`
- `GroupMembersCard.vue`
- `GroupSettingsBasicsCard.vue`
- `GroupSettingsControlsCard.vue`
- `GroupSettingsSidebar.vue`
- `GroupsFilterBar.vue`
- `GroupTabsBar.vue`
- `GroupTopicsCard.vue`
- `PageAboutCard.vue`
- `PageActionCard.vue`
- `PageCard.vue`
- `PageDirectoryTabsBar.vue`
- `PageFeedSection.vue`
- `PageHeroBanner.vue`
- `PageSettingsBasicsCard.vue`
- `PageSettingsControlsCard.vue`
- `PageSettingsSidebar.vue`
- `SettingsSectionCard.vue`

Vai trò:
- group/page listing, detail, creation, settings

Nhận xét migrate:
- đây là một trong các module lớn nhất
- `CreationForm.vue`, `GroupSettingsBasicsCard.vue`, `PageSettingsBasicsCard.vue` còn native form nhiều
- `GroupsFilterBar.vue` phù hợp để thêm `VueUse` cho debounce/filter persistence
- nên chuẩn hóa form system của community bằng `UForm`, `UInput`, `UTextarea`, `USelect`, `USwitch`
- chưa có `i18n`

### `directory` - 4 files

Files:
- `DirectoryCard.vue`
- `DirectoryFilters.vue`
- `DirectoryHero.vue`
- `DirectorySidebar.vue`

Vai trò:
- directory listing và filter

Nhận xét migrate:
- `DirectoryFilters.vue` là điểm nên migrate trước
- hợp để dùng `UInput`, `USelect`, `watchDebounced`, `useStorage`

### `events` - 9 files

Files:
- `CreateEventComposer.vue`
- `CreateEventHero.vue`
- `EventCard.vue`
- `EventDetailHero.vue`
- `EventDetailMain.vue`
- `EventDetailSidebar.vue`
- `EventsFilters.vue`
- `EventsHero.vue`
- `EventsSidebar.vue`

Vai trò:
- event listing, detail, create

Nhận xét migrate:
- create flow và filters là điểm nên chuyển sang `@nuxt/ui`
- event create hợp với `UForm`, `UInputDate`, `UTextarea`, `USelect`
- filters hợp với `VueUse`

### `explore` - 1 file

Files:
- `UserSpotlightCard.vue`

Vai trò:
- card spotlight ở explore

Nhận xét migrate:
- module nhỏ, ưu tiên thấp

### `feed` - 11 files

Files:
- `CommentComposer.vue`
- `CommentItem.vue`
- `CommentList.vue`
- `FeedPublisherBox.vue`
- `LightboxViewer.vue`
- `PostCard.vue`
- `PostHeader.vue`
- `PostMediaGrid.vue`
- `PublisherBox.vue`
- `ShareModal.vue`
- `StoryCarousel.vue`

Vai trò:
- feed, post card, comment, publisher, share modal, story

Nhận xét migrate:
- `CommentComposer.vue` là một trong số ít file đã dùng `i18n`
- còn nhiều button/panel native
- `ShareModal.vue` nên chuẩn hóa với `UModal`
- `PublisherBox.vue`/`FeedPublisherBox.vue` đang có warning trùng tên component
- feed là khu tốt để tận dụng `UAvatar`, `UDropdownMenu`, `UTooltip`, `UTextarea`

### `forms` - 12 files

Files:
- `CheckboxField.vue`
- `FormSection.vue`
- `MediaPreviewList.vue`
- `PasswordInput.vue`
- `RadioGroupField.vue`
- `SearchInput.vue`
- `SelectBox.vue`
- `SubmitBar.vue`
- `TextareaAutoResize.vue`
- `TextInput.vue`
- `ToggleSwitch.vue`
- `Uploader.vue`

Vai trò:
- shared form primitives tự build

Nhận xét migrate:
- đây là khu cần quyết định kiến trúc
- nhiều component đang overlap với `@nuxt/ui`
- nên phân loại:
  - cái nào giữ lại vì có business styling riêng
  - cái nào bỏ dần để thay bằng `UInput`, `USelect`, `UCheckbox`, `USwitch`, `UFileUpload`
- hiện `SubmitBar.vue` đã được migrate tốt

### `forum` - 6 files

Files:
- `CreateThreadModal.vue`
- `ForumFilters.vue`
- `ForumHero.vue`
- `ForumStatsSidebar.vue`
- `ForumThreadCard.vue`
- `ForumThreadDetail.vue`

Vai trò:
- forum list/detail/create thread

Nhận xét migrate:
- `CreateThreadModal.vue` nên dùng `UModal` + `UForm`
- `ForumFilters.vue` nên thêm `VueUse`

### `foundation` - 8 files

Files:
- `DrawerShell.vue`
- `DropdownShell.vue`
- `EmptyState.vue`
- `LoadingSkeleton.vue`
- `ModalShell.vue`
- `PageHeader.vue`
- `PageSection.vue`
- `ResponsiveContainer.vue`

Vai trò:
- UI shell/foundation layer

Nhận xét migrate:
- đây là khu đã tận dụng `@nuxt/ui` tốt nhất ngoài product
- nên tiếp tục dùng làm pattern chung cho app

### `funding` - 10 files

Files:
- `CreateFundingForm.vue`
- `FundingCard.vue`
- `FundingDetailHero.vue`
- `FundingDetailMain.vue`
- `FundingDetailSidebar.vue`
- `FundingDonateModal.vue`
- `FundingFilters.vue`
- `FundingHero.vue`
- `FundingProgress.vue`
- `FundingSidebar.vue`

Vai trò:
- crowdfunding list/detail/create/donate

Nhận xét migrate:
- `CreateFundingForm.vue` còn native form nhiều
- `FundingDonateModal.vue` nên chuyển sang `UModal` + `UForm`
- `FundingFilters.vue` nên thêm `watchDebounced`
- hợp để dùng `UInputNumber`, `UFileUpload`, `UProgress`, `UAlert`

### `games` - 5 files

Files:
- `GameCard.vue`
- `GamePlayModal.vue`
- `GamesFilters.vue`
- `GamesHero.vue`
- `GamesSidebar.vue`

Vai trò:
- game listing, modal play, filters

Nhận xét migrate:
- `GamePlayModal.vue` nên chuẩn hóa bằng modal shell
- `GamesFilters.vue` là điểm hợp để dùng `VueUse`

### `go-pro` - 6 files

Files:
- `BillingToggle.vue`
- `CheckoutModal.vue`
- `ComparisonTable.vue`
- `GoProHero.vue`
- `GoProSidebar.vue`
- `PlanCard.vue`

Vai trò:
- pricing/paywall/plan compare

Nhận xét migrate:
- `BillingToggle.vue` hợp với `USwitch` hoặc `URadioGroup`
- `CheckoutModal.vue` nên chuẩn hóa với `UModal`
- `ComparisonTable.vue` có thể cân nhắc `UTable`

### `jobs` - 9 files

Files:
- `JobApplyModal.vue`
- `JobCard.vue`
- `JobDetailPanel.vue`
- `JobPostModal.vue`
- `JobsEmptyState.vue`
- `JobsFilters.vue`
- `JobsHero.vue`
- `JobsResultsHeader.vue`
- `JobsSidebar.vue`

Vai trò:
- job list/detail/apply/post

Nhận xét migrate:
- `JobApplyModal.vue`, `JobPostModal.vue` là ứng viên rõ để dùng `UModal` + `UForm`
- `JobsFilters.vue` nên thêm `VueUse`

### `lightbox` - 1 file

Files:
- `LightboxModal.vue`

Vai trò:
- lightbox modal riêng

Nhận xét migrate:
- cần rà xem có thể hợp nhất với `foundation/ModalShell.vue` hay không

### `live` - 5 files

Files:
- `GoLiveModal.vue`
- `LiveChat.vue`
- `LiveHero.vue`
- `LivePlayer.vue`
- `LiveStreamList.vue`

Vai trò:
- live streaming UI

Nhận xét migrate:
- `GoLiveModal.vue` nên đi theo chuẩn `UModal`
- `LiveChat.vue` hợp với `VueUse` cho scroll/input behavior

### `memories` - 1 file

Files:
- `MemoryCard.vue`

Vai trò:
- memory feed card

Nhận xét migrate:
- module nhỏ, ưu tiên thấp

### `messages` - 3 files

Files:
- `ConversationList.vue`
- `MessagePane.vue`
- `MessageSidePanel.vue`

Vai trò:
- inbox/messages UI

Nhận xét migrate:
- đây là module tương tác mạnh nhưng mới tận dụng thư viện rất ít
- nên dùng:
  - `UAvatar`
  - `UInput`
  - `UDrawer` cho mobile side panel
  - `UCollapsible` hoặc `UAccordion`
  - `VueUse` cho `useBreakpoints`, `useScroll`, `onClickOutside`

### `navigation` - 11 files

Files:
- `ChatWidget.vue`
- `HeaderBar.vue`
- `HeaderIconNav.vue`
- `HeaderLogo.vue`
- `HeaderSearchInput.vue`
- `HeaderUserMenu.vue`
- `LeftSidebar.vue`
- `MobileMenu.vue`
- `RightSidebar.vue`
- `SidebarMenuItem.vue`
- `WidgetCard.vue`

Vai trò:
- app navigation, header, sidebar, widgets

Nhận xét migrate:
- nên chuẩn hóa menu/search/user menu bằng `@nuxt/ui`
- `HeaderSearchInput.vue` hợp để thêm `watchDebounced`
- `MobileMenu.vue` hợp với `UDrawer`

### `orders` - 9 files

Files:
- `BuyerOrderCard.vue`
- `DetailSidebar.vue`
- `DetailTimelineCard.vue`
- `FilterBar.vue`
- `OrderItemCard.vue`
- `OrderPriceSummary.vue`
- `OverviewSidebar.vue`
- `SellerOrderChecklistCard.vue`
- `SellerOrderSidebar.vue`

Vai trò:
- orders list/detail/buyer/seller

Nhận xét migrate:
- `FilterBar.vue` nên dùng `UInput`, `USelect`, `watchDebounced`
- detail/checklist/sidebar có thể tận dụng `UCard`, `UBadge`, `UProgress`

### `pages` - 49 files

Files:
- `BlogsPage.vue`
- `CheckoutPage.vue`
- `CreateBlogPage.vue`
- `CreateEventPage.vue`
- `CreateFundingPage.vue`
- `CreateGroupPage.vue`
- `CreatePagePage.vue`
- `CustomerOrderPage.vue`
- `DirectoryIndexPage.vue`
- `EditProductPage.vue`
- `EventDetailPage.vue`
- `EventsPage.vue`
- `ExplorePage.vue`
- `ForgotPasswordPage.vue`
- `ForumPage.vue`
- `FundingPage.vue`
- `GamesPage.vue`
- `GoProPage.vue`
- `GroupDetailPage.vue`
- `GroupSettingPage.vue`
- `GroupsPage.vue`
- `HashtagPage.vue`
- `HomeFeedPage.vue`
- `JobsPage.vue`
- `LivePage.vue`
- `MemoriesPage.vue`
- `MessagesPage.vue`
- `MyProductsPage.vue`
- `NewProductPage.vue`
- `OrderDetailPage.vue`
- `OrdersPage.vue`
- `PageDetailPage.vue`
- `PagesDirectoryPage.vue`
- `PageSettingPage.vue`
- `PokePage.vue`
- `ProductsPage.vue`
- `ProfilePage.vue`
- `ReadBlogPage.vue`
- `ReelsPage.vue`
- `RegisterPage.vue`
- `SavedPostsPage.vue`
- `SearchPage.vue`
- `SettingsPage.vue`
- `ShowFundPage.vue`
- `StatusCreatePage.vue`
- `WalletPage.vue`
- `WatchPage.vue`
- `WelcomePage.vue`
- `WithdrawalPage.vue`

Vai trò:
- page-level composition layer

Nhận xét migrate:
- page layer nhìn chung đã tách tốt khỏi route files
- các page create/edit/form-heavy là nơi nên migrate tiếp trước
- product pages là khu migrate sâu nhất hiện tại

### `poke` - 1 file

Files:
- `RequestCard.vue`

Vai trò:
- poke request card

Nhận xét migrate:
- module nhỏ, ưu tiên thấp

### `product` - 7 files

Files:
- `ChecklistCard.vue`
- `CreateMediaField.vue`
- `EditMediaManager.vue`
- `EditorFields.vue`
- `HeroBanner.vue`
- `PreviewCard.vue`
- `TipsCard.vue`

Vai trò:
- create/edit product editor UI

Nhận xét migrate:
- đây là module tận dụng `@nuxt/ui`, `VueUse`, `NuxtImg` tốt nhất hiện tại
- vẫn còn thiếu:
  - `UStepper`
  - validation schema thực sự
  - `Pinia`
  - i18n page-level rộng hơn

### `profile` - 11 files

Files:
- `ProfileAboutCard.vue`
- `ProfileCompletionCard.vue`
- `ProfileFeedList.vue`
- `ProfileFriendsGrid.vue`
- `ProfileHero.vue`
- `ProfileInfoCard.vue`
- `ProfileIntroCard.vue`
- `ProfileMediaGrid.vue`
- `ProfilePhotosGrid.vue`
- `ProfileSidebar.vue`
- `ProfileTabs.vue`

Vai trò:
- profile detail/feed/media/sidebar

Nhận xét migrate:
- nhiều card/grid có thể tận dụng `UCard`, `UTabs`, `UAvatar`
- media/photo còn ít dấu hiệu dùng `NuxtImg`

### `reels` - 2 files

Files:
- `ReelsOverlay.vue`
- `ReelsPlayer.vue`

Vai trò:
- reels player/overlay

Nhận xét migrate:
- cần rà mobile interaction và image/video optimization

### `saved` - 1 file

Files:
- `PostCard.vue`

Vai trò:
- saved posts listing card

Nhận xét migrate:
- likely share pattern với feed post card

### `search` - 2 files

Files:
- `FiltersPanel.vue`
- `ResultCard.vue`

Vai trò:
- search filters + result card

Nhận xét migrate:
- `FiltersPanel.vue` là chỗ nên dùng `UInput`, `USelect`, `watchDebounced`, `useStorage`

### `settings` - 4 files

Files:
- `SettingsField.vue`
- `SettingsHero.vue`
- `SettingsSection.vue`
- `SettingsSidebar.vue`

Vai trò:
- account/app settings module

Nhận xét migrate:
- nên chuẩn hóa settings form bằng `@nuxt/ui`
- thích hợp để dùng `USwitch`, `UCheckbox`, `USelect`

### `wallet` - 4 files

Files:
- `WalletHero.vue`
- `WalletSendForm.vue`
- `WalletTopupForm.vue`
- `WalletTransactions.vue`

Vai trò:
- wallet UI, send/topup, transaction list

Nhận xét migrate:
- `WalletSendForm.vue` và `WalletTopupForm.vue` nên dùng `UForm`, `UInputNumber`, `UAlert`
- `WalletTransactions.vue` có thể cân nhắc `UTable`

### `watch` - 6 files

Files:
- `RelatedVideos.vue`
- `WatchComments.vue`
- `WatchFilters.vue`
- `WatchHero.vue`
- `WatchPlayer.vue`
- `WatchVideoInfo.vue`

Vai trò:
- watch/video detail page

Nhận xét migrate:
- comments/filter/search là chỗ nên tận dụng thêm `@nuxt/ui`
- cần rà image/media optimization

### `withdrawal` - 4 files

Files:
- `WithdrawalHero.vue`
- `WithdrawalHistory.vue`
- `WithdrawalPaymentInfo.vue`
- `WithdrawalRequestForm.vue`

Vai trò:
- withdrawal history + request form

Nhận xét migrate:
- `WithdrawalRequestForm.vue` nên chuyển sang `UForm`, `UInput`, `USelect`, `UAlert`

## Inventory Composables

Files:
- `useBuyerOrders.ts`
- `useCommunityGroupDetail.ts`
- `useCommunityPageDetail.ts`
- `useMockDirectoryData.ts`
- `useMockEventsData.ts`
- `useMockExploreData.ts`
- `useMockForumData.ts`
- `useMockFundingData.ts`
- `useMockGamesData.ts`
- `useMockGoProData.ts`
- `useMockHashtagData.ts`
- `useMockJobsData.ts`
- `useMockLiveData.ts`
- `useMockMemoriesData.ts`
- `useMockPokeData.ts`
- `useMockSavedPostsData.ts`
- `useMockSearchData.ts`
- `useMockSettingsData.ts`
- `useMockSocialData.ts`
- `useMockWalletData.ts`
- `useMockWatchData.ts`
- `useMockWithdrawalData.ts`
- `useOrderPresentation.ts`
- `useProductEditorDraft.ts`
- `useProductEditorMeta.ts`
- `useProductMockMedia.ts`
- `useSellerOrders.ts`

Nhận xét:
- composables hiện chủ yếu là mock data layer
- mới có `useProductEditorDraft.ts` là dùng `VueUse` rõ ràng
- chưa có composable chung cho:
  - debounced search/filter
  - persisted filters
  - mobile breakpoints behavior
  - shared form validation wrappers

## Trạng thái tận dụng thư viện

### `@nuxt/ui`

Đã dùng tốt nhất ở:
- `foundation`
- `product`
- `forms/SubmitBar.vue`
- `pages/NewProductPage.vue`
- `pages/EditProductPage.vue`

Chưa tận dụng tốt ở:
- auth forms
- checkout forms
- blog create
- funding create/donate
- community create/settings
- jobs apply/post
- wallet/withdrawal forms
- messages/navigation/search filters

### `@vueuse/nuxt`

Đã dùng:
- `useStorage`
- `useTimeAgo`
- `watchDebounced`

Phạm vi dùng hiện tại:
- product editor

Chưa dùng nhưng rất nên dùng ở:
- search/filter panels
- create/edit forms ngoài product
- messages responsive behavior
- navigation search/menu behavior

### `@nuxt/image`

Đã dùng:
- product edit media

Chưa dùng nhiều ở:
- feed/profile/messages/blog/product card/listing

### `@nuxtjs/i18n`

Đã dùng:
- `feed/CommentComposer.vue`
- `product/EditorFields.vue`

Chưa dùng rộng:
- gần như toàn bộ text ở các module khác vẫn hardcode

### `@pinia/nuxt`

Tình trạng:
- gần như chưa dùng

Nên ưu tiên store cho:
- auth UI state
- cart/checkout
- product filters/editor
- messages current conversation
- community draft/settings

## Ưu tiên migration

### Ưu tiên 1

- `pages/RegisterPage.vue`
- `pages/WelcomePage.vue`
- `pages/ForgotPasswordPage.vue`
- `checkout/ShippingAddressFormUI.vue`
- `pages/ProductsPage.vue`

### Ưu tiên 2

- `pages/CreateBlogPage.vue`
- `funding/CreateFundingForm.vue`
- `funding/FundingDonateModal.vue`
- `community/CreationForm.vue`
- `community/GroupSettingsBasicsCard.vue`
- `community/PageSettingsBasicsCard.vue`

### Ưu tiên 3

- `messages/*`
- `navigation/*`
- `search/FiltersPanel.vue`
- `orders/FilterBar.vue`
- `jobs/JobsFilters.vue`
- `directory/DirectoryFilters.vue`

## Mẫu task giao việc

### Task A: Auth migration

- chuyển toàn bộ auth forms sang `@nuxt/ui`
- thêm `i18n`
- chuẩn hóa password input, radio/select, button state

### Task B: Checkout migration

- migrate `ShippingAddressFormUI.vue`
- chuẩn hóa `CheckoutSummary.vue`
- thêm `useStorage` cho draft address
- cân nhắc `Pinia` cho cart state

### Task C: Community migration

- migrate `CreationForm.vue`
- migrate `GroupSettingsBasicsCard.vue`
- migrate `PageSettingsBasicsCard.vue`
- thêm draft persistence bằng `VueUse`

### Task D: Blog + Funding migration

- migrate create flows sang `UForm`
- thay native file input bằng `UFileUpload`
- thêm `watchDebounced` / `useStorage`

### Task E: Search + Filter migration

- rà toàn bộ:
  - `DirectoryFilters.vue`
  - `EventsFilters.vue`
  - `FundingFilters.vue`
  - `GamesFilters.vue`
  - `JobsFilters.vue`
  - `Orders/FilterBar.vue`
  - `Search/FiltersPanel.vue`
  - `ProductsPage.vue`
- chuyển sang `UInput`, `USelect`, `watchDebounced`, `useStorage`

### Task F: Messages + Navigation migration

- chuẩn hóa menu, drawer, search, side panel
- thêm `VueUse` cho responsive/layout behavior

### Task G: i18n expansion

- quét toàn bộ text hardcode ở `components` và `pages`
- thêm namespace locale theo module
- giữ nguyên wording tiếng Việt hiện tại nếu chưa có yêu cầu đổi content
