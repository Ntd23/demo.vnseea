# Saved Context

This context owns saved posts during the DDD/MVVM migration.

Runtime routes stay under `client/app`, while page logic and presentation live in:

```txt
src/saved/presentation
-> src/saved/application
-> src/saved/domain
-> src/saved/infrastructure
```

Legacy files under `client/app/components/saved/**` are transition wrappers.
