# Community Context

Đây là bounded context `community` theo hướng:
- DDD ở cấp hệ thống
- MVVM ở tầng presentation/application

Phạm vi hiện tại của context này:
- group detail
- page detail
- group settings
- page settings
- groups directory
- pages directory
- create group
- create page

Mục tiêu của bước hiện tại:
- move runtime community khỏi `app/components/pages/*` sang `src/community/presentation/pages/*`
- tách `types / options / drafts / helpers / mock directory` khỏi `types/community.ts`
- giữ `app/*` làm wrapper để runtime hiện tại không vỡ

Mapping hiện tại:
- `app/composables/useCommunityGroupDetail.ts` -> `src/community/application/composables/useCommunityGroupDetail.ts`
- `app/composables/useCommunityPageDetail.ts` -> `src/community/application/composables/useCommunityPageDetail.ts`
- `types/community.ts` -> hiện chủ yếu còn phục vụ phần legacy `app/*`
- `src/community/domain/types/community.types.ts` -> community domain types
- `src/community/domain/constants/community-options.ts` -> option arrays, tabs, route maps, URL prefixes
- `src/community/domain/services/community-helpers.service.ts` -> helper/service thuần
- `src/community/application/factories/community-drafts.ts` -> draft factories
- `src/community/infrastructure/mocks/communityDirectory.mock.ts` -> community directory mock source

Nguyên tắc:
- `domain` giữ rule thuần như format count
- `application` giữ orchestration cho group/page detail
- `infrastructure` giữ adapter đọc dữ liệu community hiện có
- `presentation` sẽ được move dần sau
