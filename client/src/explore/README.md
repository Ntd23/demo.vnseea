# Explore Context

This context owns the explore discovery page and user spotlight card during the DDD/MVVM migration.

Runtime entry remains in `client/app/pages/explore.vue`, but it delegates to:

```txt
src/explore/presentation/pages
-> src/explore/application/composables
-> src/explore/domain
-> src/explore/infrastructure
```

`client/app/components/explore/**` remains as transition wrappers for the new presentation components.
