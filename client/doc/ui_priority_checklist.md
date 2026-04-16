# UI checklist can lam truoc

## Muc tieu

Tai lieu nay chi tap trung vao **UI can lam truoc** cho qua trinh migration sang Nuxt.

Pham vi cua tai lieu:

- chi lam giao dien
- dung mock data
- chua can xu ly logic phuc tap
- chua can call API
- uu tien component dung chung truoc, page assembly sau

Tai lieu lien quan:

- [page_feature_audit.md](./page_feature_audit.md)
- [team_work_split.md](./team_work_split.md)

---

## Nguyen tac thuc hien

1. Lam `shared UI` truoc.
2. Lam `page skeleton` sau.
3. Moi page phai uu tien compose tu component da co, khong clone UI moi.
4. Chua can gan API, chi can dung du lieu gia lap on dinh.
5. Chua can lam day du interaction, chi can cover structure, state co ban va responsive.

---

## Dinh nghia muc do uu tien

- `P0`: bat buoc lam truoc, anh huong nhieu page
- `P1`: nen lam ngay sau P0, tai su dung nhieu
- `P2`: UI theo domain, co the lam song song sau khi co P0/P1
- `P3`: UI dac thu, lam sau

---

## Checklist tong theo thu tu

## Phase 1: Nen tang UI chung

### P0. App shell va layout

- [x] `MainLayout` — `layouts/default.vue` (3 cot, responsive, mobile drawer)
- [ ] `GuestLayout` — chua tach rieng, dang dung chung
- [x] `ResponsiveContainer` — tich hop trong layout (max-w-1360, px responsive)
- [ ] `PageSection`
- [ ] `PageHeader`
- [ ] `TabsBar`
- [x] `ModalShell` — dung Teleport + Transition pattern
- [x] `DrawerShell` — `MobileMenu.vue` (slide full page)
- [x] `DropdownMenu` — trong PostHeader.vue (click-outside auto close)
- [ ] `EmptyState`
- [ ] `LoadingSkeleton`
- [ ] `Toast UI placeholder`

### P0. Header va navigation

- [x] `Header` — `HeaderBar.vue` (desktop trang, mobile xanh #0000ff)
- [x] `HeaderLogo` — tich hop trong HeaderBar
- [x] `HeaderSearchInput` — desktop inline, mobile overlay
- [x] `HeaderIconNav` — sub-header icon tron filter (mobile)
- [x] `HeaderBadgePlaceholder` — badge do tren Messenger/Bell
- [x] `HeaderUserMenu` — avatar click mo MobileMenu
- [x] `LeftSidebar` — `LeftSidebar.vue` (Phosphor icons, pill active)
- [x] `SidebarMenuItem` — tich hop trong LeftSidebar
- [x] `RightSidebar` — `RightSidebar.vue` (goi y ket ban, sinh nhat, chat)
- [x] `WidgetCard` — tich hop trong RightSidebar

### P0. Form primitives

- [ ] `TextInput`
- [x] `TextareaAutoResize` — trong PublisherBox, ChatWidget
- [ ] `SelectBox`
- [x] `Checkbox` — custom checkbox trong ChatWidget
- [ ] `RadioGroup`
- [ ] `ToggleSwitch`
- [ ] `DatePickerUI`
- [x] `SearchInput` — trong HeaderBar, ChatWidget
- [ ] `TagInput`
- [x] `PasswordInput` — trong WelcomePage
- [x] `Uploader` — `Uploader.vue`
- [ ] `MediaPreviewList`
- [ ] `FormSection`
- [ ] `SubmitBar`

### Ket qua can dat sau Phase 1

- co bo khung giao dien dung chung cho guest page va authenticated page
- co bo input/form controls de tat ca team dung chung
- co header, sidebar, modal, dropdown de lap page nhanh

---

## Phase 2: Feed Core UI

Day la nhom UI quan trong nhat vi duoc dung lai o rat nhieu trang.

### P0. Publisher

- [x] `PublisherBox` — expand/collapse, avatar tron, emoji, primary+secondary actions
- [x] `PublisherHeader` — tich hop trong PublisherBox (avatar + placeholder)
- [x] `PublisherTextarea` — tich hop, auto-grow rows
- [x] `PublisherToolbar` — 3 primary + 8 secondary action icons
- [x] `AudienceSelector` — dropdown (Chi co toi) trong footer
- [x] `PublisherMediaPickerUI` — icon Dang tai hinh anh, Tai doan phim
- [ ] `PublisherPollEditorUI` — co icon, chua co form UI
- [ ] `PublisherFeelingPickerUI`
- [ ] `PublisherLocationInputUI`
- [ ] `PublisherProductInlineUI`
- [x] `PublisherFooterActions` — Truc tiep + Chia se buttons

### P0. Post

- [x] `PostCard` — full card, edge-to-edge mobile, rounded desktop
- [x] `PostHeader` — avatar tron, author+role+time, Follow button, privacy icon
- [x] `PostAuthorMeta` — tich hop trong PostHeader
- [x] `PostPrivacyBadge` — icon (globe/lock/users) thay text
- [x] `PostMenuUI` — dropdown 5 item (Xoa, Luu, Bao cao, Tab moi, An)
- [x] `PostBody` — tich hop trong PostCard
- [x] `PostTextBlock` — text + tags
- [x] `PostMediaGrid` — single/double layout (mock placeholder)
- [ ] `PostVideoBlock`
- [ ] `PostAudioBlock`
- [ ] `PostLinkPreview`
- [ ] `PostPollBlock`
- [ ] `PostAlbumBlock`
- [ ] `PostProductCard`
- [ ] `PostJobCard`
- [ ] `PostEventCard`
- [ ] `PostSharedCard` — bai repost (chua lam)
- [x] `PostFooter` — tich hop trong PostCard
- [x] `ReactionBar` — emoji stack (👍❤️😮) voi so luot
- [x] `ReactionPicker` — hover 6 emoji (Thich, Yeu thich, Bat ngo, Haha, Buon, Tuc gian)
- [x] `PostStatsRow` — reaction count trai, comments+shares phai

### P0. Comment

- [x] `CommentComposer` — textarea + gui button
- [x] `CommentList` — danh sach comment voi avatar
- [x] `CommentItem` — tich hop trong CommentList (avatar tron + bubble)
- [ ] `CommentActions` — like/reply chua co
- [ ] `ReplyThread`
- [ ] `CommentSortBar`
- [x] `LoadMoreCommentsButton` — "Xem them X binh luan" link

### P1. Share va lightbox

- [x] `ShareModal` — modal chia se voi copy link
- [ ] `ShareTargetListUI`
- [ ] `LightboxViewer`
- [ ] `LightboxMediaNav`
- [ ] `LightboxCommentPanel`

### Ket qua can dat sau Phase 2

- lap duoc UI cho `home`, `profile timeline`, `group feed`, `page feed`
- co bo component core de cac team khac tai su dung

---

## Phase 3: 3 page mau de test he component

Khong lam full he thong ngay. Dung 3 page mau nay de kiem tra bo component da dung huong chua.

### P0. `/home` ✅ DA LAM

- [x] khung 3 cot (220-flex-250)
- [x] story carousel — vong tron avatar, ring gradient, story viewer modal
- [x] publisher — expand/collapse, 11 actions, audience selector
- [x] feed posts — greeting, ordering, filter tabs, new posts notification, load more
- [x] right widgets — goi y ket ban, sinh nhat, sponsored, ChatWidget

### P0. `/@username`

- [x] profile hero
- [x] intro/about card
- [x] tabs
- [x] timeline feed

### P0. `/messages`

- [x] conversations list
- [x] message pane
- [x] message composer
- [x] info side panel

### Ket qua can dat sau Phase 3

- biet duoc bo component chung da du de lap page chua
- neu thieu component nao thi bo sung ngay truoc khi mo rong sang page khac

---

## Phase 4: Identity UI

### P1. Profile UI

- [x] `ProfileHero`
- [x] `ProfileCover`
- [x] `ProfileAvatar`
- [x] `ProfileMeta`
- [x] `ProfileActionBar`
- [x] `ProfileTabs`
- [x] `ProfileIntroCard`
- [ ] `MutualFriendsBlock`
- [x] `FriendsGrid`
- [ ] `FollowersList`
- [ ] `FollowingList`
- [x] `PhotosGrid`
- [ ] `VideosGrid`
- [ ] `AlbumsGrid`
- [ ] `ProductsGridMini`

### P1. Settings UI

- [ ] `SettingsLayout`
- [ ] `SettingsNav`
- [ ] `SettingsSection`
- [ ] `GeneralSettingsFormUI`
- [ ] `ProfileSettingsFormUI`
- [ ] `PrivacySettingsUI`
- [ ] `AvatarSettingsUI`
- [ ] `DesignSettingsUI`
- [ ] `PasswordSettingsUI`
- [ ] `TwoFactorSettingsUI`
- [ ] `NotificationSettingsUI`
- [ ] `EmailSettingsUI`
- [ ] `SocialLinksSettingsUI`
- [ ] `BlockedUsersListUI`
- [ ] `SessionsListUI`
- [ ] `VerificationUploadUI`
- [ ] `DeleteAccountUI`
- [ ] `AddressesUI`
- [ ] `MonetizationSettingsUI`

---

## Phase 5: Messaging UI

### P1. Chat va messages

- [ ] `MessagesLayout`
- [x] `ConversationList` — tich hop trong ChatWidget tab
- [x] `ConversationListItem` — avatar + online dot + tag icon
- [x] `ConversationSearchUI` — thanh tim kiem o day ChatWidget
- [ ] `MessagePane`
- [ ] `MessageDayDivider`
- [ ] `MessageBubbleMine`
- [ ] `MessageBubbleOther`
- [ ] `MessageAttachmentBlock`
- [x] `MessageComposer` — form gui tin nhan trong ChatWidget tab 1
- [ ] `MessageComposerToolbar`
- [ ] `EmojiPickerShell`
- [ ] `TypingIndicatorUI`
- [ ] `ReadReceiptUI`
- [ ] `ChatHeader`
- [ ] `ConversationInfoPanel`
- [ ] `PinnedMessagesPanel`
- [x] `ChatWidget` — 3 tab (Gui tin nhan, Danh ba, Nhom), tao nhom modal
- [x] `FloatingChatWindow` — mobile floating button + popup
- [ ] `OnlineUsersRail`

### P1. Notifications UI

- [ ] `NotificationsDropdown`
- [ ] `NotificationList`
- [ ] `NotificationItem`

---

## Phase 6: Community UI

### P2. Group UI

- [ ] `CreateGroupFormUI`
- [ ] `GroupHero`
- [ ] `GroupMetaCard`
- [ ] `GroupActionBar`
- [ ] `GroupMembersList`
- [ ] `GroupAboutBlock`
- [ ] `GroupSettingsLayout`
- [ ] `GroupGeneralSettingsUI`
- [ ] `GroupMembersManagementUI`
- [ ] `GroupJoinRequestsUI`

### P2. Page UI

- [ ] `CreatePageFormUI`
- [ ] `PageHero`
- [ ] `PageMetaCard`
- [ ] `PageActionBar`
- [ ] `PageReviewsList`
- [ ] `PageAboutBlock`
- [ ] `PageSettingsLayout`
- [ ] `PageGeneralSettingsUI`
- [ ] `PageAdminsManagementUI`

### P2. Event UI

- [ ] `EventsTabsUI`
- [ ] `EventCard`
- [ ] `CreateEventFormUI`
- [ ] `EventHero`
- [ ] `EventDetailsBlock`
- [ ] `EventActionBar`
- [ ] `AttendeeList`

---

## Phase 7: Commerce UI

### P2. Marketplace

- [ ] `ProductCard`
- [ ] `ProductGrid`
- [ ] `ProductFiltersBar`
- [ ] `ProductDetailsMini`
- [ ] `ProductFormUI`
- [ ] `ProductGalleryUploader`
- [ ] `MyProductsList`

### P2. Checkout va orders

- [ ] `CheckoutLayout`
- [ ] `CheckoutSummary`
- [ ] `ShippingAddressFormUI`
- [ ] `PaymentMethodSelector`
- [ ] `OrderList`
- [ ] `OrderCard`
- [ ] `OrderDetailPanel`

### P2. Wallet / withdrawal / go-pro / funding

- [ ] `WalletSummary`
- [ ] `TransactionList`
- [ ] `WithdrawalFormUI`
- [ ] `GoProPlanCard`
- [ ] `FundingCard`
- [ ] `FundingDetailHero`
- [ ] `DonationPanel`

---

## Phase 8: Content Extensions UI

### P2. Stories / reels / live

- [x] `StoryCarousel` — vong tron avatar, scroll ngang, nut Tao tin
- [x] `StoryCard` — avatar + ring gradient + ten
- [x] `StoryViewer` — modal full screen, progress bar, author info
- [ ] `StoryComposerUI`
- [ ] `ReelViewer`
- [ ] `ReelActionsRail`
- [ ] `LiveStreamLayout`
- [ ] `LiveChatPanel`

### P2. Blogs / watch / jobs

- [ ] `BlogCard`
- [ ] `BlogEditorUI`
- [ ] `BlogReaderLayout`
- [ ] `RelatedBlogsList`
- [ ] `VideoWatchLayout`
- [ ] `RelatedVideoList`
- [ ] `JobCard`
- [ ] `JobFiltersBar`
- [ ] `JobApplyFormUI`

### P3. Forum / games / directory

- [ ] `ForumSectionList`
- [ ] `ForumThreadList`
- [ ] `ForumThreadView`
- [ ] `ForumReplyComposer`
- [ ] `GamesTabsUI`
- [ ] `GameCard`
- [ ] `DirectoryCategoryGrid`

---

## Danh sach page skeleton can lap sau khi co shared UI

Danh sach nay chi la lap page bang component da co, chua can nghiep vu.

### P1. Auth pages

- [x] `/welcome` — login form, social buttons (FB/Google), remember me
- [x] `/register`
- [x] `/forgot-password`

### P1. Core social pages

- [x] `/home` — feed day du (stories, publisher, posts, widgets, mobile menu)
- [x] `/@username` — profile page
- [x] `/messages` — full messaging page
- [ ] `/search`
- [ ] `/saved-posts`
- [ ] `/explore`
- [ ] `/hashtag/{tag}`

### P2. Community pages

- [ ] `/create-group`
- [ ] `/g/{group_name}`
- [ ] `/group-setting/{group}`
- [ ] `/create-page`
- [ ] `/p/{page_name}`
- [ ] `/page-setting/{page}`
- [ ] `/events`
- [ ] `/events/create-event`
- [ ] `/events/{id}`

### P2. Commerce pages

- [ ] `/products`
- [ ] `/new-product`
- [ ] `/edit-product/{id}`
- [ ] `/my-products`
- [ ] `/checkout`
- [ ] `/orders`
- [ ] `/order/{id}`
- [ ] `/customer_order/{id}`
- [ ] `/wallet`
- [ ] `/withdrawal`
- [ ] `/go-pro`

### P2. Content pages

- [ ] `/story-content`
- [ ] `/status/create`
- [ ] `/reels`
- [ ] `/live`
- [ ] `/blogs`
- [ ] `/create-blog`
- [ ] `/read-blog/{slug}`
- [ ] `/watch`
- [ ] `/jobs`
- [ ] `/forum`
- [ ] `/directory`

---

## Moi UI item can dat toi thieu gi

Moi component UI lam ra nen co:

- [ ] desktop responsive
- [ ] mobile responsive
- [ ] hover / active / disabled state co ban
- [ ] empty state neu can
- [ ] loading skeleton neu la list lon
- [ ] dark mode neu project co support
- [ ] sample mock data de review

---

## Rule de tranh lam lai

### Neu gap UI trung nhau thi uu tien tai su dung

Vi du:

- card list dung chung mot style base
- form settings dung chung `SettingsSection`
- cards trong right sidebar dung chung `WidgetCard`
- list item cho messages, notifications, followers nen co pattern gan nhau

### Khong duoc lam theo cach sau

- moi page tu viet mot loai modal rieng
- moi page tu viet mot loai tabs rieng
- `PostCard` cho home khac `PostCard` cho profile
- `ProductCard` danh cho feed khac hoan toan `ProductCard` trong marketplace ma khong co ly do ro rang

---

## Thu tu lam viec khuyen nghi cho team UI

1. Layout + Header + Sidebar + Modal + Form primitives
2. Feed Core: Publisher + Post + Comment + Share + Lightbox
3. Lap 3 page mau: `/home`, `/@username`, `/messages`
4. Profile + Settings
5. Community
6. Commerce
7. Stories / Reels / Live / Blogs / Watch / Jobs
8. Forum / Games / Directory

---

## Definition of done cho pha UI

Mot page duoc coi la xong UI khi:

- da dung dung shared component
- da co layout on dinh o desktop va mobile
- da co mock data du de demo
- khong con hardcode linh tinh lam vo component reuse
- co the dua cho team logic vao gan data sau do

---

## Ghi chu cuoi

Neu can day nhanh tien do, co the chia:

- 1 nguoi lo `Foundation UI`
- 1 nguoi lo `Feed Core UI`
- 1 nguoi lo `Messages UI`
- 1 nguoi lo `Profile + Settings UI`
- 1 nguoi lo `Community + Commerce + Content pages` theo muc do uu tien

Tai lieu nay la checklist UI. Neu can buoc tiep theo, nen tao them:

- backlog task theo tung nguoi
- mapping `component -> pages su dung`
- mapping `page -> shared component can ghep`
