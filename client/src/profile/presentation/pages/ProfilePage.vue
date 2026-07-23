<!-- Description: Facebook-style profile page — cover full-width, circular avatar overlapping cover, tab-underline nav, 2-col layout (sidebar left, feed right). -->
<template>
  <div class="profile-page">
    <!-- ── Loading skeleton ──────────────────────────────── -->
    <template v-if="pending">
      <div class="profile-page__hero-skeleton">
        <USkeleton class="profile-page__cover-skeleton" />
        <div class="profile-page__identity-skeleton">
          <USkeleton class="profile-page__avatar-skeleton" />
          <div class="profile-page__identity-lines">
            <USkeleton class="h-8 w-56 max-w-full rounded-full" />
            <USkeleton class="h-5 w-72 max-w-full rounded-full" />
            <USkeleton class="h-5 w-44 max-w-full rounded-full" />
          </div>
          <div class="profile-page__action-skeletons">
            <USkeleton class="h-10 w-40 rounded-full" />
            <USkeleton class="h-10 w-36 rounded-full" />
          </div>
        </div>
        <div class="profile-page__tab-skeletons">
          <USkeleton
            v-for="item in 5"
            :key="`profile-tab-skeleton-${item}`"
            class="h-9 w-24 rounded-full"
          />
        </div>
      </div>
      <div class="profile-page__body profile-page__skeleton-body">
        <main class="profile-page__feed">
          <USkeleton class="h-[82px] w-full rounded-[20px]" />
          <USkeleton class="h-[340px] w-full rounded-[20px]" />
          <USkeleton class="h-[300px] w-full rounded-[20px]" />
        </main>
        <aside class="profile-page__sidebar">
          <USkeleton class="h-[180px] w-full rounded-[20px]" />
          <USkeleton class="h-[260px] w-full rounded-[20px]" />
          <USkeleton class="h-[220px] w-full rounded-[20px]" />
        </aside>
      </div>
    </template>

    <!-- ── Empty / not found ─────────────────────────────── -->
    <template v-else-if="!profile">
      <div class="profile-page__empty">
        <FoundationEmptyState
          icon="i-ph-user-circle-duotone"
          :title="$t('pages.profilePage.emptyTitle')"
          :description="$t('pages.profilePage.emptyDescription')"
        />
      </div>
    </template>

    <!-- ── Main profile ──────────────────────────────────── -->
    <template v-else>
      <!-- HERO ─────────────────────────────────────────── -->
      <div class="profile-page__hero">
        <!-- Cover -->
        <div
          class="profile-page__cover"
          :class="{
            'profile-page__cover--viewable': profile.coverImage && !profileCoverDraft,
            'profile-page__cover--editing': Boolean(profileCoverDraft),
          }"
          :role="profile.coverImage && !profileCoverDraft ? 'button' : undefined"
          :tabindex="profile.coverImage && !profileCoverDraft ? 0 : undefined"
          @click="openProfileCoverDetail"
          @keydown.enter="openProfileCoverDetail"
          @keydown.space.prevent="openProfileCoverDetail"
        >
          <img
            v-if="profile.coverImage"
            :src="profile.coverImage"
            :alt="profile.displayName"
            class="profile-page__cover-img"
          />
          <div v-else class="profile-page__cover-placeholder" />
          <div class="profile-page__cover-shade" />
          <ProfileCoverRepositionEditor
            v-if="profileCoverDraft"
            :file="profileCoverDraft"
            :saving="profileMediaUploading === 'cover'"
            @cancel="closeCoverReposition"
            @confirm="uploadRepositionedCover"
          />
          <div v-if="profile.isOwner && !profileCoverDraft" class="profile-page__cover-actions">
            <label
              class="profile-page__cover-btn"
              :class="{ 'profile-page__cover-btn--disabled': Boolean(profileMediaUploading) }"
              @click.stop
            >
              <Icon
                :name="
                  profileMediaUploading === 'cover'
                    ? 'i-ph-spinner-gap-bold'
                    : 'i-ph-images-square-duotone'
                "
                class="h-4 w-4"
              />
              <span>{{ $t("pages.profilePage.editCover") }}</span>
              <input
                type="file"
                class="profile-page__cover-file"
                accept="image/*"
                :disabled="Boolean(profileMediaUploading)"
                @click.stop
                @change="event => handleProfileMediaChange('cover', event)"
              />
            </label>
          </div>
        </div>

        <!-- Identity bar (avatar + name + actions) -->
        <div class="profile-page__identity-bar">
          <!-- Avatar -->
          <div
            ref="avatarTriggerRef"
            class="profile-page__avatar-wrap"
            :class="{ 'profile-page__avatar-wrap--viewable': profile.avatarUrl || profile.isOwner }"
            :role="profile.avatarUrl || profile.isOwner ? 'button' : undefined"
            :tabindex="profile.avatarUrl || profile.isOwner ? 0 : undefined"
            @click="handleAvatarClick"
            @keydown.enter="handleAvatarClick"
            @keydown.space.prevent="handleAvatarClick"
          >
            <UAvatar
              :src="profile.avatarUrl"
              :text="profile.avatarText"
              class="profile-page__avatar"
              :ui="{
                root: 'rounded-full bg-primary-600',
                fallback: 'text-white font-black text-3xl',
              }"
            />
          </div>

          <!-- Name + meta -->
          <div class="profile-page__identity-meta">
            <div class="profile-page__name-row">
              <h2 class="text-label-primary" style="font-size: 1.5rem; font-weight: 700;">
                {{ profile.displayName }}
              </h2>
              <UBadge
                v-if="profile.verified"
                color="primary"
                variant="soft"
                class="rounded-full px-2.5 py-0.5 text-xs font-bold"
              >
                <Icon name="i-ph-seal-check-fill" class="mr-1 h-3.5 w-3.5" />
                {{ $t("settings.data.fields.verified") }}
              </UBadge>
            </div>
            <!-- Stats chips -->
            <div class="profile-page__stats-row">
              <span
                v-for="stat in profile.stats"
                :key="stat.label"
                class="profile-page__stat-chip"
              >
                <strong>{{ stat.value }}</strong>
                <span class="profile-page__stat-label">{{ stat.label }}</span>
              </span>
            </div>
          </div>

          <!-- Hero actions (right) -->
          <div class="profile-page__hero-actions">
            <template
              v-for="action in heroActions"
              :key="action.id"
            >
              <button
                v-if="action.variant === 'cart'"
                class="profile-page__cart-cta"
                type="button"
                @click="runHeroAction(action.id)"
              >
                <Icon :name="action.icon" class="h-4.5 w-4.5" />
                <span>{{ action.label }}</span>
              </button>
              <UButton
                v-else
                :variant="action.variant === 'solid' ? 'solid' : 'soft'"
                :color="'primary'"
                :icon="action.icon"
                :loading="actionPending && action.id === 'follow-profile'"
                class="rounded-full btn-primary"
                @click="runHeroAction(action.id)"
              >
                {{ action.label }}
              </UButton>
            </template>
          </div>
        </div>

        <!-- Divider -->
        <div class="profile-page__divider" />

        <!-- Tab nav -->
        <nav class="profile-page__tab-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="profile-page__tab"
            :class="{ 'profile-page__tab--active': activeTab === tab.key }"
            type="button"
            @click="selectProfileTab(tab.key)"
          >
            {{ tab.label }}
          </button>
          <!-- More dropdown trigger -->
          <button
            ref="moreTriggerRef"
            class="profile-page__tab profile-page__tab--more"
            :class="{ 'profile-page__tab--active': moreOpen }"
            type="button"
            @click="toggleMore"
          >
            <Icon name="i-ph-dots-three-bold" class="h-4 w-4" />
            {{ $t("navigation.leftSidebar.showMore") }}
          </button>
          <span class="profile-page__tab-scroll-hint" aria-hidden="true">
            <Icon name="i-ph-caret-right-bold" class="h-4 w-4" />
          </span>
        </nav>
      </div>

      <!-- More dropdown (Teleported to body to avoid overflow clipping) -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="moreOpen"
            class="profile-more-dropdown"
            :style="moreDropdownStyle"
          >
            <div class="py-1">
              <button
                class="profile-more-item"
                type="button"
                @click="handleMoreAction('poke')"
              >
                <span
                  class="profile-more-icon"
                  style="background: rgba(249, 115, 22, 0.1)"
                >
                  <Icon
                    name="i-ph-hand-pointing-fill"
                    class="h-4 w-4 text-orange-500"
                  />
                </span>
                <div class="min-w-0">
                  <p class="profile-more-label">
                    {{ $t("pages.profilePage.tabs.poke") }}
                  </p>
                  <p class="profile-more-desc">
                    {{ $t("pages.profilePage.tabs.pokeDesc") }}
                  </p>
                </div>
              </button>

              <button
                v-if="profile.isOwner"
                class="profile-more-item"
                type="button"
                @click="handleMoreAction('copy')"
              >
                <span class="profile-more-icon">
                  <Icon name="i-ph-link-bold" class="h-4 w-4" />
                </span>
                <div class="min-w-0">
                  <p class="profile-more-label">
                    {{ $t("pages.profilePage.tabs.copyLink") }}
                  </p>
                  <p class="profile-more-desc">
                    {{ $t("pages.profilePage.tabs.copyLinkDesc") }}
                  </p>
                </div>
              </button>
            </div>

            <div class="profile-more-divider" />

            <div class="py-1">
              <!-- Others' profile: Report -->
              <button
                v-if="!profile.isOwner"
                class="profile-more-item"
                type="button"
                @click="handleMoreAction('report')"
              >
                <span
                  class="profile-more-icon"
                  style="background: rgba(245, 158, 11, 0.1)"
                >
                  <Icon
                    name="i-ph-warning-circle-bold"
                    class="h-4 w-4 text-amber-500"
                  />
                </span>
                <div class="min-w-0">
                  <p class="profile-more-label">
                    {{ $t("pages.profilePage.tabs.report") }}
                  </p>
                  <p class="profile-more-desc">
                    {{ $t("pages.profilePage.tabs.reportDesc") }}
                  </p>
                </div>
              </button>

              <!-- Self profile: Block List -->
              <button
                v-if="profile.isOwner"
                class="profile-more-item"
                type="button"
                @click="handleMoreAction('blockList')"
              >
                <span
                  class="profile-more-icon"
                  style="background: rgba(220, 38, 38, 0.08)"
                >
                  <Icon
                    name="i-ph-prohibit-bold"
                    class="h-4 w-4 text-red-500"
                  />
                </span>
                <div class="min-w-0">
                  <p class="profile-more-label" style="color: #dc2626">
                    {{ $t("pages.profilePage.tabs.blockList") }}
                  </p>
                  <p class="profile-more-desc">
                    {{ $t("pages.profilePage.tabs.blockListDesc") }}
                  </p>
                </div>
              </button>

              <!-- Others' profile: Block -->
              <button
                v-else
                class="profile-more-item"
                type="button"
                @click="handleMoreAction('block')"
              >
                <span
                  class="profile-more-icon"
                  style="background: rgba(220, 38, 38, 0.08)"
                >
                  <Icon
                    name="i-ph-prohibit-bold"
                    class="h-4 w-4 text-red-500"
                  />
                </span>
                <div class="min-w-0">
                  <p class="profile-more-label" style="color: #dc2626">
                    {{ $t("pages.profilePage.tabs.block") }}
                  </p>
                  <p class="profile-more-desc">
                    {{ $t("pages.profilePage.tabs.blockDesc") }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>

      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="avatarMenuOpen"
            ref="avatarMenuRef"
            class="profile-avatar-menu"
            :style="avatarMenuStyle"
            role="menu"
          >
            <span class="profile-avatar-menu__arrow" aria-hidden="true" />
            <button
              v-if="profile.avatarUrl"
              type="button"
              class="profile-avatar-menu__item"
              role="menuitem"
              @click="handleAvatarMenuAction('view')"
            >
              <Icon name="i-ph-identification-card-duotone" class="h-6 w-6" />
              <span>{{ $t("pages.profilePage.viewAvatar") }}</span>
            </button>
            <button
              v-if="profile.isOwner"
              type="button"
              class="profile-avatar-menu__item"
              role="menuitem"
              :disabled="profileMediaUploading === 'avatar'"
              @click="handleAvatarMenuAction('choose')"
            >
              <Icon
                :name="profileMediaUploading === 'avatar' ? 'i-ph-spinner-gap-bold' : 'i-ph-image-square-duotone'"
                class="h-6 w-6"
                :class="{ 'animate-spin': profileMediaUploading === 'avatar' }"
              />
              <span>{{ $t("pages.profilePage.chooseAvatar") }}</span>
            </button>
          </div>
        </Transition>
      </Teleport>

      <!-- ── TIMELINE TAB ───────────────────────────────── -->
      <template v-if="activeTab === 'timeline'">
        <div class="profile-page__body">
          <!-- RIGHT: feed -->
          <main class="profile-page__feed">
            <!-- Publisher -->
            <FeedPublisherBox v-if="profile.isOwner" />

            <!-- Posts -->
            <div
              v-if="displayedTimelinePosts.length"
              class="profile-page__post-stack"
            >
              <FeedPostCard
                v-for="post in displayedTimelinePosts"
                :key="`profile-post-${post.id}`"
                :post="post"
                class="profile-page__post-card"
              />
            </div>
            <div
              v-if="
                displayedTimelinePosts.length &&
                timelineHasMore &&
                !postSearchQuery
              "
              ref="profileLoadMoreSentinel"
              class="profile-page__load-more"
              aria-live="polite"
            >
              <div
                class="profile-page__load-more-skeleton"
                :aria-label="$t('pages.homeFeedPage.loadingMore')"
              >
                <article
                  v-for="index in 2"
                  :key="index"
                  class="profile-page__post-skeleton surface-card"
                >
                  <div class="profile-page__post-skeleton-header">
                    <USkeleton class="profile-page__post-skeleton-avatar" />
                    <div class="profile-page__post-skeleton-copy">
                      <USkeleton
                        class="profile-page__post-skeleton-line profile-page__post-skeleton-line--title"
                      />
                      <USkeleton
                        class="profile-page__post-skeleton-line profile-page__post-skeleton-line--meta"
                      />
                    </div>
                  </div>
                  <USkeleton
                    class="profile-page__post-skeleton-line profile-page__post-skeleton-line--body"
                  />
                  <USkeleton class="profile-page__post-skeleton-media" />
                </article>
              </div>
              <span class="sr-only">
                {{
                  timelineLoadingMore
                    ? $t("pages.homeFeedPage.loadingMore")
                    : $t("pages.homeFeedPage.loadMore")
                }}
              </span>
            </div>
            <UAlert
              v-if="!displayedTimelinePosts.length"
              color="neutral"
              variant="subtle"
              icon="i-ph-newspaper-clipping-duotone"
              :title="$t('pages.pageDetailPage.feedEmptyTitle')"
              :description="$t('pages.pageDetailPage.feedEmptyDescription')"
              class="rounded-[20px]"
            />
          </main>

          <!-- LEFT: sidebar (intro / friends / photos) -->
          <aside class="profile-page__sidebar">
            <!-- Intro -->
            <section v-if="profile.intro.length" class="profile-card">
              <div class="profile-card__head">
                <h2 class="profile-card__title">{{ copy.introTitle }}</h2>
                <UButton
                  v-if="profile.isOwner"
                  variant="ghost"
                  color="primary"
                  size="xs"
                  class="text-link"
                  @click="runHeroAction('edit-profile')"
                >
                  {{ copy.introAction }}
                </UButton>
              </div>
              <div class="space-y-2.5">
                <div
                  v-for="item in profile.intro"
                  :key="`${item.label}-${item.value}`"
                  class="profile-card__intro-row"
                >
                  <div class="profile-card__intro-icon">
                    <Icon :name="item.icon" class="h-4.5 w-4.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="profile-card__intro-label">{{ item.label }}</p>
                    <p class="profile-card__intro-value">{{ item.value }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="profile-card">
              <div class="profile-card__head">
                <h2 class="profile-card__title">
                  {{ $t("pages.profilePage.sidebarSearchPosts") }}
                </h2>
              </div>
              <UInput
                v-model="postSearchQuery"
                icon="i-ph-magnifying-glass-duotone"
                :placeholder="$t('pages.profilePage.sidebarSearchPosts')"
                class="profile-page__post-search w-full"
              />
            </section>

            <!-- Following -->
            <section v-if="following.length" class="profile-card">
              <div class="profile-card__head">
                <div>
                  <h2 class="profile-card__title">
                    {{
                      $t("pages.profilePage.stats.following") +
                      " (" +
                      profile.counts.following +
                      ")"
                    }}
                  </h2>
                </div>
                <UButton
                  variant="ghost"
                  size="xs"
                  class="text-link"
                  @click="activeTab = 'friends'"
                >
                  {{ copy.photosAction }}
                </UButton>
              </div>
              <div class="profile-card__friend-grid">
                <NuxtLink
                  v-for="friend in following.slice(0, 9)"
                  :key="friend.id"
                  :to="`/@${friend.username}`"
                  class="profile-card__friend-cell"
                >
                  <div class="profile-card__friend-thumb">
                    <img
                      v-if="friend.avatarUrl"
                      :src="friend.avatarUrl"
                      :alt="friend.name"
                      class="profile-card__friend-img"
                    />
                    <span v-else class="profile-card__friend-initials">{{
                      friend.initials
                    }}</span>
                  </div>
                  <p class="profile-card__friend-name">{{ friend.name }}</p>
                </NuxtLink>
              </div>
            </section>

            <!-- Followers -->
            <section v-if="followers.length" class="profile-card">
              <div class="profile-card__head">
                <div>
                  <h2 class="profile-card__title">
                    {{
                      $t("pages.pageDetailPage.followStat") +
                      " (" +
                      profile.counts.followers +
                      ")"
                    }}
                  </h2>
                </div>
                <UButton
                  variant="ghost"
                  color="primary"
                  size="xs"
                  class="text-link"
                  @click="activeTab = 'friends'"
                >
                  {{ copy.photosAction }}
                </UButton>
              </div>
              <div class="profile-card__friend-grid">
                <NuxtLink
                  v-for="friend in followers.slice(0, 9)"
                  :key="friend.id"
                  :to="`/@${friend.username}`"
                  class="profile-card__friend-cell"
                >
                  <div class="profile-card__friend-thumb">
                    <img
                      v-if="friend.avatarUrl"
                      :src="friend.avatarUrl"
                      :alt="friend.name"
                      class="profile-card__friend-img"
                    />
                    <span v-else class="profile-card__friend-initials">{{
                      friend.initials
                    }}</span>
                  </div>
                  <p class="profile-card__friend-name">{{ friend.name }}</p>
                </NuxtLink>
              </div>
            </section>

            <!-- Photos -->
            <section class="profile-card">
              <div class="profile-card__head">
                <h2 class="profile-card__title">{{ copy.photosTitle }}</h2>
                <UButton
                  variant="ghost"
                  color="primary"
                  size="xs"
                  class="text-link"
                  @click="activeTab = 'photos'"
                >
                  {{ copy.photosAction }}
                </UButton>
              </div>
              <div v-if="photos.length" class="profile-card__media-grid">
                <div
                  v-for="post in photos.slice(0, 6)"
                  :key="post.id"
                  class="profile-card__media-cell"
                >
                  <img
                    v-if="post.mediaItems[0]"
                    :src="post.mediaItems[0].thumb || post.mediaItems[0].src"
                    :alt="post.mediaItems[0].alt || post.author"
                    class="profile-card__media-img"
                  />
                </div>
              </div>
              <UAlert
                v-else
                color="neutral"
                variant="subtle"
                icon="i-ph-images-duotone"
                :title="$t('pages.pageDetailPage.feedEmptyTitle')"
                :description="$t('pages.pageDetailPage.feedEmptyDescription')"
                class="rounded-[16px]"
              />
            </section>

            <section v-if="albums.length" class="profile-card">
              <div class="profile-card__head">
                <h2 class="profile-card__title">{{ copy.albumsTitle }}</h2>
                <UButton
                  variant="ghost"
                  color="primary"
                  size="xs"
                  class="text-link"
                  @click="activeTab = 'albums'"
                >
                  {{ copy.photosAction }}
                </UButton>
              </div>
              <div class="profile-card__media-grid">
                <div
                  v-for="album in albums.slice(0, 6)"
                  :key="album.id"
                  class="profile-card__media-cell"
                >
                  <img
                    v-if="album.coverUrl"
                    :src="album.coverUrl"
                    :alt="album.title"
                    class="profile-card__media-img"
                  />
                  <p class="profile-card__media-title">{{ album.title }}</p>
                </div>
              </div>
            </section>

            <section v-if="likedPages.length" class="profile-card">
              <div class="profile-card__head">
                <div>
                  <h2 class="profile-card__title">
                    {{ $t("pages.profilePage.stats.likes") }}
                  </h2>
                  <p class="profile-card__sub">
                    {{ profile.counts.likes }}
                    {{ $t("pages.profilePage.stats.likes") }}
                  </p>
                </div>
                <UButton
                  to="/liked-pages"
                  variant="ghost"
                  color="primary"
                  size="xs"
                  class="text-link"
                >
                  {{ copy.photosAction }}
                </UButton>
              </div>
              <div class="profile-card__link-list">
                <NuxtLink
                  v-for="page in likedPages.slice(0, 5)"
                  :key="page.id"
                  :to="`/p/${page.slug}`"
                  class="profile-card__link-row"
                >
                  <span
                    class="profile-card__link-dot"
                    :style="{ background: page.accent }"
                  />
                  <span>{{ page.name }}</span>
                </NuxtLink>
              </div>
            </section>

            <section v-if="joinedGroups.length" class="profile-card">
              <div class="profile-card__head">
                <div>
                  <h2 class="profile-card__title">
                    {{ $t("pages.profilePage.stats.groups") }}
                  </h2>
                  <p class="profile-card__sub">
                    {{ profile.counts.groups }}
                    {{ $t("pages.profilePage.stats.groups") }}
                  </p>
                </div>
                <UButton
                  to="/joined_groups"
                  variant="ghost"
                  color="primary"
                  size="xs"
                  class="text-link"
                >
                  {{ copy.photosAction }}
                </UButton>
              </div>
              <div class="profile-card__link-list">
                <NuxtLink
                  v-for="group in joinedGroups.slice(0, 5)"
                  :key="group.id"
                  :to="`/g/${group.slug}`"
                  class="profile-card__link-row"
                >
                  <span
                    class="profile-card__link-dot"
                    :style="{ background: group.accent }"
                  />
                  <span>{{ group.name }}</span>
                </NuxtLink>
              </div>
            </section>

            <section v-if="products.length" class="profile-card">
              <div class="profile-card__head">
                <div>
                  <h2 class="profile-card__title">
                    {{
                      $t("pages.profilePage.stats.products") +
                      " (" +
                      profile.counts.products +
                      ")"
                    }}
                  </h2>
                </div>
                <UButton
                  v-if="hasHiddenProducts"
                  variant="ghost"
                  color="primary"
                  size="xs"
                  class="text-link"
                  @click="productsExpanded = true"
                >
                  {{ copy.photosAction }}
                </UButton>
              </div>
              <div class="profile-card__product-grid">
                <NuxtLink
                  v-for="product in visibleProducts"
                  :key="product.id"
                  :to="product.href"
                  class="profile-card__product-cell"
                >
                  <img
                    v-if="product.imageUrl"
                    :src="product.imageUrl"
                    :alt="product.name"
                    class="profile-card__product-img"
                  />
                  <span class="profile-card__product-name">{{
                    product.name
                  }}</span>
                  <strong class="profile-card__product-price">{{
                    product.priceLabel
                  }}</strong>
                </NuxtLink>
              </div>
            </section>
          </aside>
        </div>
      </template>

      <!-- ── ABOUT TAB ─────────────────────────────────── -->
      <section
        v-else-if="activeTab === 'about'"
        class="profile-page__tab-panel"
      >
        <div
          v-if="profile.aboutSections.length"
          class="grid gap-4 lg:grid-cols-2"
        >
          <section
            v-for="section in profile.aboutSections"
            :key="section.title"
            class="profile-card"
          >
            <h3 class="profile-card__title">{{ section.title }}</h3>
            <div class="mt-4 space-y-3">
              <div
                v-for="item in section.items"
                :key="`${item.label}-${item.value}`"
                class="profile-card__intro-row"
              >
                <div class="profile-card__intro-icon">
                  <Icon :name="item.icon" class="h-4.5 w-4.5" />
                </div>
                <div>
                  <p class="profile-card__intro-label">{{ item.label }}</p>
                  <p class="profile-card__intro-value">{{ item.value }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-info-duotone"
          :title="$t('pages.pageDetailPage.feedEmptyTitle')"
          :description="$t('pages.pageDetailPage.feedEmptyDescription')"
          class="rounded-[24px]"
        />
      </section>

      <!-- ── FRIENDS TAB ───────────────────────────────── -->
      <section
        v-else-if="activeTab === 'friends'"
        class="profile-page__tab-panel"
      >
        <div class="profile-card profile-page__friends-header">
          <div class="profile-card__head">
            <div>
              <p class="profile-card__eyebrow">{{ copy.friendsTitle }}</p>
              <h2 class="profile-card__title">
                {{ profile.counts.followers }} {{ copy.friendsTitle }}
              </h2>
            </div>
            <UButton variant="soft" class="text-link">
              {{ copy.friendsAction }}
            </UButton>
          </div>
        </div>
        <div v-if="friends.length" class="profile-page__friends-grid">
          <NuxtLink
            v-for="friend in friends"
            :key="friend.id"
            :to="`/@${friend.username}`"
            class="profile-page__friend-card"
          >
            <div class="profile-page__friend-avatar">
              <img
                v-if="friend.avatarUrl"
                :src="friend.avatarUrl"
                :alt="friend.name"
                class="profile-page__friend-img"
              />
              <span v-else class="profile-page__friend-initials">{{
                friend.initials
              }}</span>
            </div>
            <div class="profile-page__friend-info">
              <p class="profile-page__friend-name">{{ friend.name }}</p>
              <p class="profile-page__friend-username">
                @{{ friend.username }}
              </p>
            </div>
            <Icon
              name="i-ph-caret-right-bold"
              class="profile-page__friend-open"
            />
          </NuxtLink>
        </div>
        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-users-three-duotone"
          :title="$t('pages.pageDetailPage.feedEmptyTitle')"
          :description="$t('pages.pageDetailPage.feedEmptyDescription')"
          class="rounded-[24px]"
        />
      </section>

      <!-- ── PHOTOS / VIDEOS / OTHER ───────────────────── -->
      <section
        v-else-if="activeTab === 'photos'"
        class="profile-page__tab-panel"
      >
        <div class="profile-card">
          <p class="profile-card__eyebrow">{{ copy.photosTitle }}</p>
          <h2 class="profile-card__title">{{ copy.photosTitle }}</h2>
        </div>
        <div v-if="photos.length" class="profile-page__media-posts">
          <FeedPostCard v-for="post in photos" :key="post.id" :post="post" />
        </div>
        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-images-square-duotone"
          :title="$t('pages.pageDetailPage.feedEmptyTitle')"
          :description="$t('pages.pageDetailPage.feedEmptyDescription')"
          class="rounded-[24px]"
        />
      </section>

      <section
        v-else-if="activeTab === 'videos'"
        class="profile-page__tab-panel"
      >
        <div class="profile-card">
          <p class="profile-card__eyebrow">{{ copy.videosTitle }}</p>
          <h2 class="profile-card__title">{{ copy.videosTitle }}</h2>
        </div>
        <div v-if="videos.length" class="profile-page__media-posts">
          <FeedPostCard v-for="post in videos" :key="post.id" :post="post" />
        </div>
        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-video-camera-duotone"
          :title="$t('pages.pageDetailPage.feedEmptyTitle')"
          :description="$t('pages.pageDetailPage.feedEmptyDescription')"
          class="rounded-[24px]"
        />
      </section>

      <section v-else class="profile-page__tab-panel">
        <div class="profile-card">
          <p class="profile-card__eyebrow">{{ copy.albumsTitle }}</p>
          <h2 class="profile-card__title">{{ copy.albumsTitle }}</h2>
        </div>
        <div v-if="albums.length" class="profile-page__album-grid">
          <article
            v-for="album in albums"
            :key="album.id"
            class="profile-card profile-page__album-card"
          >
            <img
              v-if="album.coverUrl"
              :src="album.coverUrl"
              :alt="album.title"
              class="profile-page__album-cover"
            />
            <h3 class="profile-card__title">{{ album.title }}</h3>
            <p class="profile-card__sub">
              {{ album.mediaCount }} {{ copy.photosTitle }}
            </p>
          </article>
        </div>
        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-images-square-duotone"
          :title="$t('pages.pageDetailPage.feedEmptyTitle')"
          :description="$t('pages.pageDetailPage.feedEmptyDescription')"
          class="rounded-[24px]"
        />
      </section>
    </template>
    <input
      ref="profileAvatarInput"
      type="file"
      class="hidden"
      accept="image/*"
      @change="event => handleProfileMediaChange('avatar', event)"
    />
    <ProfileImageCropModal
      v-if="profileCropDraft"
      :open="true"
      :file="profileCropDraft.file"
      :kind="profileCropDraft.kind"
      @cancel="closeProfileCropper"
      @confirm="uploadCroppedProfileMedia"
    />
    <ClientOnly>
      <FeedShareModal
        v-if="profileLightboxPost?.permissions.canShare"
        :open="profileLightboxShareOpen"
        :can-share="profileLightboxPost.permissions.canShare"
        :share-url="profileLightboxShareUrl"
        :post="{
          id: profileLightboxPost.id,
          author: profileLightboxPost.author,
          text: profileLightboxPost.text,
          authorAvatar: profileLightboxPost.authorAvatarUrl,
          authorVerified: profileLightboxPost.authorVerified,
        }"
        @close="profileLightboxShareOpen = false"
        @shared="handleProfileLightboxShared"
      />
      <FeedLightboxViewer
        v-if="profileLightboxPost"
        :open="profileLightboxOpen"
        :items="profileLightboxMediaItems"
        :current-index="profileLightboxMediaIndex"
        :title="profileLightboxPost.text || $t('feed.postCard.lightboxTitle')"
        :author="profileLightboxPost.author"
        :author-avatar-url="profileLightboxPost.authorAvatarUrl"
        :author-path="profileLightboxPost.authorPath"
        :caption="profileLightboxPost.text"
        :time-label="profileLightboxPost.time"
        :like-count="profileLightboxLikesCount"
        :comment-count="profileLightboxCommentsCount"
        :share-count="profileLightboxSharesCount"
        :can-share="profileLightboxPost.permissions.canShare"
        :comments="profileLightboxComments"
        :comments-pending="profileLightboxCommentsPending"
        :comment-action-repository="profileLightboxCommentRepository"
        :current-user-name="profileLightboxAuthStore.user?.name"
        :current-user-avatar-url="profileLightboxAuthStore.user?.avatarUrl"
        :submitting-comment="profileLightboxCommenting"
        :selected-reaction="profileLightboxReaction"
        @close="profileLightboxOpen = false"
        @change="profileLightboxMediaIndex = $event"
        @share="profileLightboxPost.permissions.canShare && (profileLightboxShareOpen = true)"
        @download="downloadProfileLightboxMedia"
        @like="toggleProfileLightboxLike"
        @react="reactToProfileLightboxPost"
        @comment="openProfileLightboxComments"
        @submit-comment="submitProfileLightboxComment"
      />
    </ClientOnly>
    <Teleport to="body">
      <div
        v-if="profileMediaViewer"
        class="profile-media-viewer"
        role="dialog"
        aria-modal="true"
        @click="closeProfileMediaViewer"
      >
        <button
          class="profile-media-viewer__close"
          type="button"
          aria-label="Close preview"
          @click.stop="closeProfileMediaViewer"
        >
          <Icon name="i-ph-x-bold" class="h-5 w-5" />
        </button>
        <img
          :src="profileMediaViewer.src"
          :alt="profileMediaViewer.alt"
          class="profile-media-viewer__image"
          @click.stop
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue";
import FeedPublisherBox from "../../../feed/presentation/components/FeedPublisherBox.vue";
import FeedLightboxViewer from "../../../feed/presentation/components/LightboxViewer.vue";
import FeedShareModal from "../../../feed/presentation/components/ShareModal.vue";
import { useFeedPostCardVM } from "../../../feed/application/view-models/useFeedPostCardVM";
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository";
import type { FeedPostRecord } from "../../../feed/domain/types/feed.types";
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue";
import { useProfileVM } from "../../application/composables/useProfileVM";
import ProfileImageCropModal from "../components/ProfileImageCropModal.vue";
import ProfileCoverRepositionEditor from "../components/ProfileCoverRepositionEditor.vue";

const route = useRoute();

const normalizeProfileUsername = (value: unknown) => {
  const raw = Array.isArray(value)
    ? String(value[0] ?? "")
    : String(value ?? "");

  try {
    return decodeURIComponent(raw).trim().replace(/^@+/, "");
  } catch {
    return raw.trim().replace(/^@+/, "");
  }
};

const username = computed(() => {
  return normalizeProfileUsername(route.params.username);
});

const {
  activeTab,
  actionPending,
  copy,
  displayedTimelinePosts,
  followers,
  following,
  friends,
  heroActions,
  hasHiddenProducts,
  joinedGroups,
  likedPages,
  albums,
  loadMoreTimelinePosts,
  pending,
  postSearchQuery,
  photos,
  profile,
  products,
  productsExpanded,
  refresh,
  resolveProfileMediaPostId,
  selectProfileTab,
  tabs,
  timelineHasMore,
  timelineLoadingMore,
  timelinePosts,
  runHeroAction,
  visibleProducts,
  videos,
} = useProfileVM(username);

// ── More dropdown ──────────────────────────────────────
const moreOpen = ref(false);
const moreTriggerRef = ref<HTMLElement | null>(null);
const moreDropdownStyle = ref<Record<string, string>>({});
const avatarMenuOpen = ref(false);
const avatarTriggerRef = ref<HTMLElement | null>(null);
const avatarMenuRef = ref<HTMLElement | null>(null);
const avatarMenuStyle = ref<Record<string, string>>({});
const profileLoadMoreSentinel = ref<HTMLElement | null>(null);
const profileAvatarInput = ref<HTMLInputElement | null>(null);
const profileMediaUploading = ref<"avatar" | "cover" | null>(null);
const profileMediaViewer = ref<{ src: string; alt: string } | null>(null);
const profileCropDraft = ref<{ kind: "avatar" | "cover"; file: File } | null>(null);
const profileCoverDraft = ref<File | null>(null);
const profileLightboxPost = ref<FeedPostRecord | null>(null);
let profileImageDetailRequestId = 0;
const toast = useToast();
const { t } = useI18n();
const feedRepository = createApiFeedRepository();
const {
  currentAuthUserStore: profileLightboxAuthStore,
  showShare: profileLightboxShareOpen,
  selectedPostReaction: profileLightboxReaction,
  lightboxOpen: profileLightboxOpen,
  currentMediaIndex: profileLightboxMediaIndex,
  localComments: profileLightboxComments,
  likesCount: profileLightboxLikesCount,
  sharesCount: profileLightboxSharesCount,
  commentsCount: profileLightboxCommentsCount,
  commenting: profileLightboxCommenting,
  loadingComments: profileLightboxCommentsPending,
  mediaItems: profileLightboxMediaItems,
  shareUrl: profileLightboxShareUrl,
  commentActionRepository: profileLightboxCommentRepository,
  toggleLike: toggleProfileLightboxLike,
  reactToPost: reactToProfileLightboxPost,
  onOpenMedia: openProfileLightboxMedia,
  submitComment: submitProfileLightboxComment,
  handleShared: handleProfileLightboxShared,
  downloadMedia: downloadProfileLightboxMedia,
  openComments: openProfileLightboxComments,
} = useFeedPostCardVM(profileLightboxPost, feedRepository);

useIntersectionObserver(
  profileLoadMoreSentinel,
  ([entry]) => {
    if (
      !entry?.isIntersecting ||
      activeTab.value !== "timeline" ||
      !timelineHasMore.value ||
      timelineLoadingMore.value ||
      Boolean(postSearchQuery.value)
    ) {
      return;
    }

    void loadMoreTimelinePosts();
  },
  {
    rootMargin: "520px 0px",
  },
);

function toggleMore() {
  if (!moreOpen.value && moreTriggerRef.value) {
    const rect = moreTriggerRef.value.getBoundingClientRect();
    moreDropdownStyle.value = {
      position: "fixed",
      top: `${rect.bottom + 6}px`,
      right: `${window.innerWidth - rect.right}px`,
      "transform-origin": "top right",
    };
  }
  moreOpen.value = !moreOpen.value;
}

function closeMore(e: MouseEvent) {
  if (!moreTriggerRef.value?.contains(e.target as Node)) {
    moreOpen.value = false;
  }

  if (
    !avatarTriggerRef.value?.contains(e.target as Node) &&
    !avatarMenuRef.value?.contains(e.target as Node)
  ) {
    avatarMenuOpen.value = false;
  }
}

function closeFloatingMenus() {
  moreOpen.value = false;
  avatarMenuOpen.value = false;
}

onMounted(() => {
  document.addEventListener("click", closeMore, true);
  window.addEventListener("scroll", closeFloatingMenus, { passive: true });
  window.addEventListener("resize", closeFloatingMenus, { passive: true });
});
onBeforeUnmount(() => {
  document.removeEventListener("click", closeMore, true);
  window.removeEventListener("scroll", closeFloatingMenus);
  window.removeEventListener("resize", closeFloatingMenus);
});

function openAvatarMenu() {
  const currentProfile = profile.value;
  const trigger = avatarTriggerRef.value;

  if ((!currentProfile?.avatarUrl && !currentProfile?.isOwner) || !trigger) {
    return;
  }

  if (avatarMenuOpen.value) {
    avatarMenuOpen.value = false;
    return;
  }

  const rect = trigger.getBoundingClientRect();
  const menuWidth = Math.min(430, Math.max(260, window.innerWidth - 32));
  const centeredLeft = rect.left + rect.width / 2 - menuWidth / 2;
  const left = Math.min(window.innerWidth - menuWidth - 16, Math.max(16, centeredLeft));
  const arrowLeft = Math.min(menuWidth - 24, Math.max(24, rect.left + rect.width / 2 - left));

  avatarMenuStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 12}px`,
    left: `${left}px`,
    width: `${menuWidth}px`,
    "--profile-avatar-arrow-left": `${arrowLeft}px`,
    "transform-origin": `${arrowLeft}px top`,
  };
  avatarMenuOpen.value = true;
}

function handleAvatarClick() {
  if (profile.value?.isOwner) {
    openAvatarMenu();
    return;
  }

  void openProfileImagePostDetail("avatar");
}

function handleAvatarMenuAction(action: "view" | "choose") {
  avatarMenuOpen.value = false;

  if (action === "choose") {
    openProfileMediaSelector("avatar");
    return;
  }

  void openProfileImagePostDetail("avatar");
}

function openProfileMediaSelector(kind: "avatar" | "cover") {
  if (!profile.value?.isOwner || profileMediaUploading.value) {
    return;
  }

  if (kind === "avatar") {
    profileAvatarInput.value?.click();
  }
}

function openProfileMediaViewer(kind: "avatar" | "cover") {
  const currentProfile = profile.value;
  const src = kind === "avatar" ? currentProfile?.avatarUrl : currentProfile?.coverImage;

  if (!src) {
    return;
  }

  profileMediaViewer.value = {
    src,
    alt: currentProfile?.displayName || currentProfile?.username || "Profile image",
  };
}

function normalizeProfileMediaUrl(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    const pathname = decodeURIComponent(new URL(value, "https://profile-media.local").pathname);
    return pathname
      .replace(/\\/g, "/")
      .replace(/_full(?=\.[^./]+$)/i, "")
      .replace(/\/{2,}/g, "/")
      .toLowerCase();
  } catch {
    return value
      .split(/[?#]/, 1)[0]
      ?.replace(/\\/g, "/")
      .replace(/_full(?=\.[^./]+$)/i, "")
      .toLowerCase() ?? "";
  }
}

function findProfileImageMediaIndex(post: FeedPostRecord, imageUrl: string) {
  const target = normalizeProfileMediaUrl(imageUrl);
  const targetFileName = target.split("/").at(-1) ?? "";

  if (!target) {
    return -1;
  }

  return post.mediaItems.findIndex((item) => {
    const candidate = normalizeProfileMediaUrl(item.src);
    const candidateFileName = candidate.split("/").at(-1) ?? "";

    return candidate === target
      || Boolean(targetFileName && candidateFileName === targetFileName);
  });
}

function prepareProfileImagePost(post: FeedPostRecord, imageUrl: string) {
  // A post resolved by its backend ID is authoritative. Media hosts can differ
  // between profile data and post data (origin/CDN), so a URL mismatch must not
  // downgrade a valid post to the standalone image viewer.
  if (post.mediaItems.length > 0) {
    return post;
  }

  return {
    ...post,
    mediaItems: [
      {
        type: "image" as const,
        src: imageUrl,
        alt: profile.value?.displayName || profile.value?.username || "Profile image",
      },
    ],
    primaryMediaType: "image" as const,
  };
}

function findLoadedProfileImagePost(postId: number, imageUrl: string) {
  const candidates = [...timelinePosts.value, ...photos.value];
  const postById = postId > 0
    ? candidates.find(post => Number(post.id) === postId)
    : undefined;
  const preparedPostById = postById ? prepareProfileImagePost(postById, imageUrl) : null;

  if (preparedPostById) {
    return preparedPostById;
  }

  return candidates.find(post => findProfileImageMediaIndex(post, imageUrl) >= 0) ?? null;
}

async function openProfileImagePostDetail(kind: "avatar" | "cover") {
  const requestId = ++profileImageDetailRequestId;
  const currentProfile = profile.value;
  let postId = Number(kind === "avatar"
    ? currentProfile?.avatarPostId ?? 0
    : currentProfile?.coverPostId ?? 0);
  const imageUrl = kind === "avatar"
    ? currentProfile?.avatarUrl
    : currentProfile?.coverImage;

  if (!imageUrl) {
    return;
  }

  const loadedPost = findLoadedProfileImagePost(postId, imageUrl);

  if (loadedPost) {
    openProfilePostLightbox(loadedPost, imageUrl);
    return;
  }

  if (postId <= 0) {
    try {
      postId = await resolveProfileMediaPostId(kind);
    } catch {
      postId = 0;
    }

    if (requestId !== profileImageDetailRequestId) {
      return;
    }

    const resolvedLoadedPost = findLoadedProfileImagePost(postId, imageUrl);

    if (resolvedLoadedPost) {
      openProfilePostLightbox(resolvedLoadedPost, imageUrl);
      return;
    }
  }

  if (postId > 0) {
    try {
      const post = await feedRepository.getPostById(postId);

      if (requestId !== profileImageDetailRequestId) {
        return;
      }

      const preparedPost = post ? prepareProfileImagePost(post, imageUrl) : null;

      if (preparedPost) {
        openProfilePostLightbox(preparedPost, imageUrl);
        return;
      }
    } catch {
      // A deleted or inaccessible profile-image post falls back to the current image.
    }
  }

  if (requestId === profileImageDetailRequestId) {
    openProfileMediaViewer(kind);
  }
}

function openProfilePostLightbox(post: FeedPostRecord, imageUrl: string) {
  profileMediaViewer.value = null;
  profileLightboxPost.value = post;
  const mediaIndex = Math.max(0, findProfileImageMediaIndex(post, imageUrl));
  void nextTick(() => openProfileLightboxMedia(mediaIndex));
}

async function openProfileCoverDetail() {
  if (profileCoverDraft.value) {
    return;
  }

  await openProfileImagePostDetail("cover");
}

function closeProfileMediaViewer() {
  profileMediaViewer.value = null;
}

function handleProfileMediaChange(kind: "avatar" | "cover", event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = "";

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    toast.add({
      title: t("pages.profilePage.imageInvalidTitle"),
      description: t("pages.profilePage.imageInvalidDescription"),
      color: "error",
      icon: "i-ph-warning-circle-fill",
    });
    return;
  }

  if (kind === "cover") {
    profileCoverDraft.value = file;
    return;
  }

  profileCropDraft.value = { kind, file };
}

function closeProfileCropper() {
  profileCropDraft.value = null;
}

function closeCoverReposition() {
  if (profileMediaUploading.value !== "cover") {
    profileCoverDraft.value = null;
  }
}

async function uploadCroppedProfileMedia(file: File, postText: string) {
  const draft = profileCropDraft.value;

  if (!draft) {
    return;
  }

  const kind = draft.kind;
  profileCropDraft.value = null;
  await uploadProfileMedia(kind, file, postText);
}

async function uploadRepositionedCover(file: File) {
  const updated = await uploadProfileMedia("cover", file, "");

  if (updated) {
    profileCoverDraft.value = null;
  }
}

async function uploadProfileMedia(
  kind: "avatar" | "cover",
  file: File,
  postText: string,
) {
  const formData = new FormData();
  formData.append("section", "avatar");
  formData.append(kind, file);
  formData.append("postText", postText);
  profileMediaUploading.value = kind;

  try {
    await $fetch("/_api/settings/update", {
      method: "POST",
      body: formData,
    });
    await refresh();
    toast.add({
      title: t("pages.profilePage.imageUpdated"),
      color: "success",
      icon: "i-ph-check-circle-fill",
    });
    return true;
  } catch (error: any) {
    toast.add({
      title: t("pages.profilePage.imageUpdateError"),
      description:
        error?.data?.statusMessage || error?.message || t("pages.profilePage.imageUpdateRetry"),
      color: "error",
      icon: "i-ph-warning-circle-fill",
    });
    return false;
  } finally {
    profileMediaUploading.value = null;
  }
}

function handleMoreAction(action: string) {
  moreOpen.value = false;

  if (action === "copy") {
    if (import.meta.client) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() =>
          toast.add({
            title: t("feed.shareModal.copied"),
            color: "success",
            icon: "i-ph-check-circle-fill",
          }),
        )
        .catch(() =>
          toast.add({
            title: t("pages.profilePage.tabs.copyLink"),
            description: window.location.href,
            color: "warning",
            icon: "i-ph-warning-circle-fill",
          }),
        );
    }
    return;
  }

  if (["poke", "block", "report", "blockList"].includes(action)) {
    // On own profile and poke → navigate to poke list
    if (action === "poke" && profile.value?.isOwner) {
      navigateTo("/poke");
      return;
    }

    // On own profile and blockList → navigate to settings/blocked-users
    if (action === "blockList" && profile.value?.isOwner) {
      navigateTo("/setting/blocked-users");
      return;
    }

    if (actionPending.value) return;

    const targetUserId = profile.value?.id;
    const targetName =
      profile.value?.displayName || profile.value?.username || "";
    if (!targetUserId) {
      toast.add({
        title: "Lỗi",
        description: "Không tìm thấy người dùng.",
        color: "error",
        icon: "i-ph-warning-circle-fill",
      });
      return;
    }

    actionPending.value = true;

    $fetch("/_api/profile/action", {
      method: "POST",
      body: { action, userId: targetUserId },
    })
      .then(() => {
        const titleKey = action === "blockList" ? "blockList" : action;
        const title = t("pages.profilePage.tabs." + titleKey);
        const descKey =
          action === "blockList" ? "blockSuccess" : action + "Success";
        const desc = t("pages.profilePage.tabs." + descKey, {
          name: targetName,
        });
        const icon =
          action === "poke"
            ? "i-ph-hand-pointing-fill"
            : action === "block" || action === "blockList"
              ? "i-ph-prohibit-duotone"
              : "i-ph-warning-octagon-duotone";

        toast.add({
          title: `✅ ${title}`,
          description: desc,
          color: "success",
          icon,
        });
      })
      .catch((err: any) => {
        const status: string = err?.data?.statusMessage || "";
        if (status === "already_poked") {
          toast.add({
            title: t("pages.profilePage.tabs.poke"),
            description: t("pages.profilePage.tabs.pokeAlready"),
            color: "warning",
            icon: "i-ph-hand-pointing-fill",
          });
        } else {
          toast.add({
            title: "Lỗi",
            description: "Không thể thực hiện yêu cầu. Thử lại sau.",
            color: "error",
            icon: "i-ph-warning-circle-fill",
          });
        }
      })
      .finally(() => {
        actionPending.value = false;
      });
    return;
  }

  toast.add({
    title: t("pages.profilePage.tabs." + action),
    description: "Tính năng đang phát triển",
    color: "primary",
    icon: "i-ph-info-bold",
  });
}
</script>

<style scoped>
/* ── Page shell ───────────────────────────────────────── */
.profile-page {
  min-height: 100vh;
  background: #f0f2f5;
  margin-top: 8px;
}

/* ── Hero ─────────────────────────────────────────────── */
.profile-page__hero {
  background: var(--bg-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  border-radius: 16px;
}

@media (max-width: 639px) {
  .profile-page__hero {
    overflow: hidden;
    border-bottom-right-radius: 18px;
    border-bottom-left-radius: 18px;
  }
}

/* Cover */
.profile-page__cover {
  position: relative;
  height: auto;
  aspect-ratio: 918 / 332;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, var(--bg-brand-hover) 56%, var(--color-primary-200) 100%);
}

.profile-page__cover--viewable {
  cursor: pointer;
}

.profile-page__cover--editing {
  cursor: default;
}

.profile-page__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-page__cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, var(--bg-brand-hover) 56%, var(--color-primary-200) 100%);
}

.profile-page__cover-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.15) 0%, transparent 40%);
  pointer-events: none;
}

.profile-page__cover-actions {
  position: absolute;
  bottom: 14px;
  right: 14px;
  z-index: 2;
  display: flex;
  gap: 8px;
}

.profile-page__cover-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.72);
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
  font-weight: var(--weight-bold);
  padding: 8px 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
  transition:
    background var(--duration-fast) var(--ease-default),
    border-color var(--duration-fast) var(--ease-default),
    transform var(--duration-fast) var(--ease-default);
}

.profile-page__cover-btn:hover {
  border-color: #ffffff;
  background: rgba(15, 23, 42, 0.86);
  transform: translateY(-1px);
}

.profile-page__cover-btn--disabled {
  cursor: wait;
  opacity: 0.78;
  transform: none;
}

.profile-page__cover-file {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.profile-page__cover-file:disabled {
  cursor: wait;
}

/* Identity bar */
.profile-page__identity-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 0;
  margin-top: -44px;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .profile-page__identity-bar {
    flex-direction: row;
    align-items: flex-end;
    margin-top: -65px;
    padding: 0 24px;
    gap: 16px;
  }
}

/* Avatar */
.profile-page__avatar-wrap {
  position: relative;
  flex-shrink: 0;
  width: 168px;
  height: 168px;
}

.profile-page__avatar-wrap--viewable {
  cursor: pointer;
}

@media (max-width: 767px) {
  .profile-page__avatar-wrap {
    width: 120px;
    height: 120px;
  }
}

.profile-page__avatar {
  width: 100%;
  height: 100%;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  display: block;
}

/* Name + meta */
.profile-page__identity-meta {
  flex: 1;
  min-width: 0;
  padding-bottom: 8px;
}

.profile-page__name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.profile-page__display-name {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
  padding: 6px 16px;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-page__stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}

.profile-page__stat-chip {
  display: inline-flex;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.profile-page__stat-chip strong {
  font-weight: 800;
  color: var(--text-primary);
}

.profile-page__stat-label {
  color: var(--text-secondary);
}

/* Hero actions */
.profile-page__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding-bottom: 8px;
  margin-top: 4px;
}

@media (min-width: 768px) {
  .profile-page__hero-actions {
    margin-top: 0;
  }
}

.profile-page__hero-actions :deep(.btn-primary),
.profile-page__cart-cta {
  flex: 0 0 auto;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .profile-page__hero-actions {
    width: 100%;
    flex-wrap: nowrap;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .profile-page__hero-actions::-webkit-scrollbar {
    display: none;
  }

  .profile-page__hero-actions :deep(.btn-primary),
  .profile-page__cart-cta {
    min-height: 34px;
  }
}

.profile-page__cart-cta {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--color-accent-700);
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  color: var(--color-secondary-900);
  box-shadow: 0 6px 18px rgba(180, 83, 9, 0.12);
  cursor: pointer;
  font-size: 13px;
  font-weight: var(--weight-extrabold);
  line-height: 1;
  transition:
    transform var(--duration-fast) var(--ease-default),
    background var(--duration-fast) var(--ease-default),
    border-color var(--duration-fast) var(--ease-default),
    box-shadow var(--duration-fast) var(--ease-default),
    color var(--duration-fast) var(--ease-default);
}

.profile-page__cart-cta:hover {
  border-color: var(--color-accent-600);
  background: var(--color-accent-50);
  color: var(--color-secondary-900);
  box-shadow: 0 8px 22px rgba(180, 83, 9, 0.18);
}

.profile-page__cart-cta:active {
  transform: translateY(0) scale(0.98);
}

/* Divider */
.profile-page__divider {
  height: 1px;
  background: #e2e8f0;
  margin: 12px 0 0;
}

/* Tab nav */
.profile-page__tab-nav {
  display: flex;
  overflow-x: auto;
  position: relative;
  scrollbar-width: none;
  padding: 0 16px;
  scroll-padding-inline: 16px;
  scroll-snap-type: x proximity;
}

.profile-page__tab-nav::-webkit-scrollbar {
  display: none;
}

@media (min-width: 640px) {
  .profile-page__tab-nav {
    padding: 0 24px;
  }
}

.profile-page__tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 700;
  color: #65676b;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  scroll-snap-align: start;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.profile-page__tab:hover {
  background: #f0f2f5;
  border-radius: 8px 8px 0 0;
  color: var(--text-primary);
}

.profile-page__tab--active {
  color: var(--bg-brand);
  border-bottom-color: var(--bg-brand);
}

.profile-page__tab--more {
  color: #65676b;
  background: transparent;
  box-shadow: none;
}

.profile-page__tab--more:hover {
  background: #f0f2f5;
  color: var(--text-primary);
}

.profile-page__tab-scroll-hint {
  position: sticky;
  right: -16px;
  z-index: 1;
  display: inline-flex;
  flex: 0 0 42px;
  align-items: center;
  justify-content: flex-end;
  color: var(--bg-brand);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0),
    #ffffff 48%,
    #ffffff 100%
  );
  pointer-events: none;
}

@media (min-width: 768px) {
  .profile-page__tab-scroll-hint {
    display: none;
  }
}

/* ── Body (timeline) ─────────────────────────────────── */
.profile-page__body {
  display: grid;
  gap: 12px;
}

@media (min-width: 1024px) {
  .profile-page__body {
    grid-template-columns: 360px minmax(0, 1fr);
    align-items: start;
    max-width: 1245px;
    /* margin: 0 auto; */
  }
}

@media (min-width: 1280px) {
  .profile-page__body {
    grid-template-columns: 380px minmax(0, 1fr);
  }
}

.profile-page__sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .profile-page__sidebar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    order: 1;
    position: sticky;
    top: 68px;
  }
}

.profile-page__feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  width: 100%;
}

@media (min-width: 1024px) {
  .profile-page__feed {
    order: 2;
  }
}

.profile-page__post-stack {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
  overflow: visible;
}

.profile-page__post-stack > * {
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.profile-page__post-search :deep(input) {
  border-color: #e2e8f0;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: none;
}

.profile-page__post-search :deep(input::placeholder) {
  color: var(--text-tertiary);
}

.profile-page__post-search :deep(svg) {
  color: var(--text-secondary);
}

.profile-page__post-card {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.profile-page__post-stack :deep(.post-card) {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.profile-page__load-more {
  padding: 0 0 24px;
}

.profile-page__load-more-skeleton {
  display: grid;
  width: 100%;
  gap: 16px;
}

.profile-page__post-skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.profile-page__post-skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-page__post-skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
}

.profile-page__post-skeleton-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 8px;
}

.profile-page__post-skeleton-line {
  height: 12px;
  border-radius: 999px;
}

.profile-page__post-skeleton-line--title {
  width: min(220px, 62%);
}

.profile-page__post-skeleton-line--meta {
  width: min(150px, 44%);
}

.profile-page__post-skeleton-line--body {
  width: 84%;
}

.profile-page__post-skeleton-media {
  height: clamp(180px, 32vw, 280px);
  border-radius: var(--radius-lg);
}

/* ── Tab panel (non-timeline) ────────────────────────── */
.profile-page__tab-panel {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Profile card (reusable) ─────────────────────────── */
.profile-card {
  background: var(--bg-surface);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.profile-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 8px;
}

.profile-card__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin: 0 0 4px;
}

.profile-card__title {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
}

.profile-card__sub {
  font-size: 13px;
  color: #65676b;
  margin: 2px 0 0;
}

/* Intro rows */
.profile-card__intro-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.profile-card__intro-row:last-child {
  border-bottom: none;
}

.profile-card__intro-icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--bg-muted);
  color: var(--bg-brand);
}

.profile-card__intro-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin: 0;
}

.profile-card__intro-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 2px 0 0;
}

/* Friend cells */
.profile-card__friend-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.profile-card__friend-cell {
  min-width: 0;
  cursor: pointer;
}

.profile-card__friend-thumb {
  display: flex;
  width: 100%;
  aspect-ratio: 1 / 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: var(--color-primary-100);
}

.profile-card__friend-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-card__friend-initials {
  font-size: 18px;
  font-weight: 900;
  color: var(--bg-brand-hover);
}

.profile-card__friend-name {
  margin: 5px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.profile-card__media-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.profile-card__media-cell {
  position: relative;
  min-height: 92px;
  overflow: hidden;
  border-radius: 10px;
  background: var(--bg-muted);
}

.profile-card__media-img {
  width: 100%;
  height: 100%;
  min-height: 92px;
  object-fit: cover;
  display: block;
}

.profile-card__media-title {
  position: absolute;
  right: 6px;
  bottom: 6px;
  left: 6px;
  margin: 0;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.72);
  padding: 4px 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
}

.profile-card__link-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-card__link-row {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  padding: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  transition: background 0.15s ease;
}

.profile-card__link-row:hover {
  background: var(--bg-muted);
}

.profile-card__link-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 999px;
}

.profile-card__product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.profile-card__product-cell {
  display: block;
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  background: var(--bg-muted);
  color: var(--text-primary);
}

.profile-card__product-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
  background: var(--bg-muted);
}

.profile-card__product-name {
  display: block;
  overflow: hidden;
  padding: 8px 8px 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 800;
}

.profile-card__product-price {
  display: block;
  padding: 2px 8px 8px;
  font-size: 12px;
  color: var(--bg-brand);
}

.profile-page__media-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-page__friends-header .profile-card__head {
  margin-bottom: 0;
  align-items: center;
}

.profile-page__friends-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .profile-page__friends-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1180px) {
  .profile-page__friends-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.profile-page__friend-card {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: var(--bg-surface);
  padding: 12px;
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.profile-page__friend-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
  transform: translateY(-1px);
}

.profile-page__friend-avatar {
  display: flex;
  width: 68px;
  aspect-ratio: 1 / 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
  background: var(--color-primary-100);
}

.profile-page__friend-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-page__friend-initials {
  font-size: 18px;
  font-weight: 800;
  color: var(--bg-brand-hover);
}

.profile-page__friend-info {
  min-width: 0;
}

.profile-page__friend-name {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
}

.profile-page__friend-username {
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.profile-page__friend-open {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
}

@media (min-width: 768px) {
  .profile-page__friend-card {
    grid-template-columns: 88px minmax(0, 1fr);
    grid-template-rows: auto auto;
    align-items: start;
    padding: 14px;
  }

  .profile-page__friend-avatar {
    grid-row: 1 / span 2;
    width: 88px;
    border-radius: 20px;
  }

  .profile-page__friend-open {
    display: none;
  }

  .profile-page__friend-name {
    font-size: 16px;
  }
}

.profile-page__album-grid {
  display: grid;
  gap: 12px;
}

@media (min-width: 640px) {
  .profile-page__album-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .profile-page__album-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.profile-page__album-card {
  overflow: hidden;
}

.profile-page__album-cover {
  width: calc(100% + 32px);
  height: 190px;
  margin: -16px -16px 14px;
  object-fit: cover;
  display: block;
  background: var(--bg-muted);
}

/* ── Skeletons / Empty ───────────────────────────────── */
.profile-page__hero-skeleton {
  overflow: hidden;
  background: var(--bg-surface);
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.profile-page__cover-skeleton {
  height: auto;
  aspect-ratio: 918 / 332;
  width: 100%;
}

.profile-page__identity-skeleton {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
  padding: 0 16px 14px;
  margin-top: -44px;
}

.profile-page__avatar-skeleton {
  width: 120px;
  height: 120px;
  border-radius: 999px;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.12);
}

.profile-page__identity-lines,
.profile-page__action-skeletons,
.profile-page__tab-skeletons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.profile-page__tab-skeletons {
  overflow: hidden;
  border-top: 1px solid #e2e8f0;
  padding: 12px 16px;
}

.profile-page__skeleton-body {
  padding-bottom: 16px;
}

@media (min-width: 768px) {
  .profile-page__identity-skeleton {
    grid-template-columns: 168px minmax(0, 1fr) auto;
    align-items: end;
    gap: 16px;
    padding: 0 24px 14px;
    margin-top: -28px;
  }

  .profile-page__avatar-skeleton {
    width: 168px;
    height: 168px;
  }
}

@media (max-width: 639px) {
  .profile-page__hero-skeleton {
    border-bottom-right-radius: 18px;
    border-bottom-left-radius: 18px;
  }

  .profile-page__action-skeletons {
    display: none;
  }
}

.profile-page__empty {
  max-width: 540px;
  margin: 40px auto;
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 40px 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  text-align: center;
}

</style>

<style>
/* Non-scoped: teleported to body */
.profile-avatar-menu {
  z-index: 10020;
  overflow: visible;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 8px;
  box-shadow: 0 14px 38px rgba(15, 23, 42, 0.22);
}

.profile-avatar-menu__arrow {
  position: absolute;
  top: -8px;
  left: var(--profile-avatar-arrow-left, 50%);
  width: 16px;
  height: 16px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  border-left: 1px solid rgba(15, 23, 42, 0.08);
  background: var(--bg-surface);
  transform: translateX(-50%) rotate(45deg);
}

.profile-avatar-menu__item {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  gap: 14px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  padding: 10px 13px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.profile-avatar-menu__item:hover {
  background: var(--bg-muted);
}

.profile-avatar-menu__item:disabled {
  cursor: wait;
  opacity: 0.6;
}

.profile-media-viewer {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.86);
  padding: 24px;
  cursor: zoom-out;
}

.profile-media-viewer__image {
  max-width: min(100%, 1120px);
  max-height: min(86vh, 820px);
  border-radius: var(--radius-xl);
  object-fit: contain;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
  cursor: default;
}

.profile-media-viewer__close {
  position: fixed;
  top: 18px;
  right: 18px;
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.72);
  color: #ffffff;
  cursor: pointer;
  transition:
    background var(--duration-fast) var(--ease-default),
    transform var(--duration-fast) var(--ease-default);
}

.profile-media-viewer__close:hover {
  background: rgba(15, 23, 42, 0.9);
  transform: scale(1.04);
}

/* Non-scoped: dropdown is Teleported to body */
.profile-more-dropdown {
  z-index: 9999;
  width: 268px;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 8%, transparent);
  background: var(--bg-surface);
  box-shadow: 0 12px 40px color-mix(in srgb, var(--bg-brand) 12%, transparent);
}

.profile-more-divider {
  height: 1px;
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
}

.profile-more-item {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.12s ease;
}

.profile-more-item:hover {
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
}

.profile-more-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: color-mix(in srgb, var(--bg-brand) 60%, transparent);
  margin-top: 2px;
}

.profile-more-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.profile-more-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
  line-height: 1.3;
}
</style>
