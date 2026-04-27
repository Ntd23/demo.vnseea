# Feed Context

This context owns the feed route, feed cards, story carousel, comments, publisher box, share modal, and media lightbox during the DDD/MVVM migration.

Runtime entry remains in `client/app/pages/feed.vue`, but it delegates to:

```txt
src/feed/presentation/pages
-> src/feed/application/composables
-> src/feed/domain
-> src/feed/infrastructure
```

Legacy files under `client/app/components/feed/**` are transition wrappers for the new presentation components.
