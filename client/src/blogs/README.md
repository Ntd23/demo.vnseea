# Blogs Context

This context owns blog discovery, blog creation, reading detail pages, and hashtag landing pages during the DDD/MVVM migration.

Runtime entry remains in `client/app/pages/*`, but route files should stay thin and delegate to:

```txt
src/blogs/presentation/pages
-> src/blogs/application/composables
-> src/blogs/domain
-> src/blogs/infrastructure
```

Legacy files under `client/app/components/blogs/**` are transition wrappers for the new presentation components.
