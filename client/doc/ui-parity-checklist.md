# UI Parity Checklist

Checklist này bắt buộc dùng trước khi merge bất kỳ thay đổi presentation nào.

## Before editing

- [ ] Đã xác định route hoặc component nằm trong context nào
- [ ] Đã xác định baseline commit hoặc file cũ để đối chiếu
- [ ] Đã gắn loại drift: `visual`, `hierarchy`, `interaction`, `responsive`, hoặc `token`
- [ ] Đã xác nhận thay đổi chỉ nằm ở `presentation/*`

## During implementation

- [ ] Không đổi `domain`, `repository`, `use-case`, `view-model` chỉ để sửa UI
- [ ] Không thay shell shared theo cảm tính
- [ ] Không đổi copy/text nếu baseline không đổi
- [ ] Không đổi token spacing/radius/shadow nếu chưa đối chiếu baseline
- [ ] Không đổi thứ tự block trong page nếu baseline không yêu cầu
- [ ] Không thay route delivery layer thành nơi chứa business logic

## Shell/shared review

- [ ] Header đúng baseline
- [ ] Left sidebar đúng baseline
- [ ] Right sidebar đúng baseline
- [ ] Page container width đúng baseline
- [ ] Header icon nav đúng baseline
- [ ] Modal shell đúng baseline
- [ ] Empty state đúng baseline
- [ ] Form field, spacing, label, helper text đúng baseline

## Page review

- [ ] Hero section đúng baseline
- [ ] Filters đúng baseline
- [ ] Cards/list item hierarchy đúng baseline
- [ ] CTA placement đúng baseline
- [ ] Empty/loading states đúng baseline
- [ ] Mobile behavior đúng baseline

## Verification

- [ ] So sánh desktop route với baseline
- [ ] So sánh mobile route với baseline
- [ ] Kiểm tra hover/active/selected/expanded states
- [ ] `npm run build` pass

## Ownership rule

- Shared shell chỉ có 1 owner sửa trong một phase.
- Page-specific UI chỉ sửa trong đúng bounded context của page đó.
- API work không được mở rộng song song nếu shared presentation chưa ổn.
