# Popular Context

This context owns the popular page during the DDD/MVVM migration.

Runtime routes stay under `client/app`, while page logic and presentation live in:

```txt
src/popular/presentation
-> src/popular/application
-> src/popular/domain
-> src/popular/infrastructure
```

Legacy files under `client/app/components/popular/**` are transition wrappers.
