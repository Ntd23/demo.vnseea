# Community Context

Đây là bounded context `community` theo hướng:
- DDD ở cấp hệ thống
- MVVM ở tầng presentation/application

Phạm vi bắt đầu của context này:
- group detail
- page detail

Mục tiêu của bước hiện tại:
- move logic detail khỏi `app/composables/*`
- tách lookup/community data access sang `infrastructure`
- giữ `app/*` làm wrapper để runtime hiện tại không vỡ

Mapping bước đầu:
- `app/composables/useCommunityGroupDetail.ts` -> `src/community/application/composables/useCommunityGroupDetail.ts`
- `app/composables/useCommunityPageDetail.ts` -> `src/community/application/composables/useCommunityPageDetail.ts`
- `types/community.ts` -> hiện tạm là source data cũ, được đọc qua `infrastructure/adapters/communityDirectory.adapter.ts`

Nguyên tắc:
- `domain` giữ rule thuần như format count
- `application` giữ orchestration cho group/page detail
- `infrastructure` giữ adapter đọc dữ liệu community hiện có
- `presentation` sẽ được move dần sau
