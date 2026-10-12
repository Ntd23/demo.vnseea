import type { CommercePolicy, CommercePolicySlug } from "../types/commerce-policy.types"

const policies: Record<CommercePolicySlug, CommercePolicy> = {
  general: {
    slug: "general",
    title: "Chính sách mua hàng và thanh toán",
    summary: "Hướng dẫn tìm sản phẩm, trao đổi với người bán, xác nhận đơn và thanh toán trên VNSEEA.",
    updatedAt: "06/10/2026",
    sections: [
      {
        heading: "1. Cách mua hàng",
        items: [
          "Người mua tìm sản phẩm, đọc mô tả, giá bán, tình trạng hàng và thông tin người bán được công khai trên VNSEEA.",
          "Người mua liên hệ người bán qua thông tin liên hệ hoặc công cụ trao đổi trên website để hỏi thêm về sản phẩm, phí giao hàng và thời gian nhận hàng.",
          "Đơn hàng được xem là xác nhận sau khi người bán xác nhận còn hàng, giá cuối cùng, địa chỉ giao nhận và phương thức thanh toán với người mua.",
          "Người mua cần kiểm tra kỹ thông tin đơn hàng trước khi xác nhận. Có thể đề nghị hủy trước khi người bán bàn giao hàng cho đơn vị vận chuyển; sau thời điểm đó, việc hủy thực hiện theo thỏa thuận với người bán và đơn vị vận chuyển.",
        ],
      },
      {
        heading: "2. Giá và hình thức thanh toán",
        paragraphs: [
          "Giá sản phẩm được người bán niêm yết. Phí giao hàng, phụ phí (nếu có) và tổng số tiền phải trả cần được người bán thông báo để người mua đồng ý trước khi gửi hàng.",
          "Thanh toán tiền mặt khi nhận hàng (COD) được áp dụng khi người bán hỗ trợ phương thức này. Người mua thanh toán cho nhân viên giao hàng khi nhận bưu gửi theo số tiền đã được xác nhận. Người mua và người bán có thể thỏa thuận chuyển khoản hoặc phương thức khác nếu người bán có thông báo rõ trước khi giao dịch.",
          "VNSEEA cung cấp nền tảng để người mua và người bán trao đổi. Trừ khi một chức năng thanh toán của VNSEEA được thông báo rõ tại thời điểm đặt hàng, việc thu tiền, đối soát và hoàn tiền do người bán và đơn vị thanh toán/vận chuyển liên quan thực hiện.",
        ],
      },
      {
        heading: "3. Trách nhiệm của người mua và người bán",
        items: [
          "Người bán chịu trách nhiệm về tính chính xác của mô tả, giá, tình trạng, nguồn gốc và khả năng cung cấp sản phẩm; đồng thời đóng gói và giao đúng sản phẩm đã xác nhận.",
          "Người mua cung cấp thông tin nhận hàng chính xác, giữ liên lạc để nhận hàng và thanh toán đúng số tiền đã thống nhất.",
          "Hai bên nên lưu lại nội dung trao đổi, xác nhận đơn, chứng từ thanh toán và thông tin vận chuyển để hỗ trợ xử lý khiếu nại.",
          "Chính sách này không giới hạn quyền hợp pháp của người tiêu dùng. Nếu có khác biệt giữa thỏa thuận riêng và quy định pháp luật bắt buộc, quy định pháp luật được ưu tiên áp dụng.",
        ],
      },
      {
        heading: "4. Hỗ trợ và khiếu nại",
        paragraphs: [
          "Khi có vấn đề về sản phẩm hoặc đơn hàng, người mua vui lòng liên hệ người bán trước, cung cấp mã đơn (nếu có), hình ảnh và nội dung trao đổi liên quan. VNSEEA tiếp nhận phản ánh về hoạt động trên nền tảng qua số 0971 765 268 hoặc support@vnseea.vn.",
        ],
      },
    ],
  },
  shipping: {
    slug: "shipping",
    title: "Chính sách vận chuyển và giao nhận",
    summary: "Phạm vi, thời gian dự kiến, phí giao hàng và cách xử lý khi giao nhận sản phẩm.",
    updatedAt: "06/10/2026",
    sections: [
      {
        heading: "1. Phạm vi giao hàng",
        paragraphs: [
          "Người bán giao hàng trong phạm vi Việt Nam mà đơn vị vận chuyển phục vụ. Một số khu vực xa, hải đảo hoặc địa chỉ hạn chế tiếp cận có thể cần thêm thời gian hoặc không nhận giao; người bán sẽ thông báo trước khi xác nhận đơn.",
        ],
      },
      {
        heading: "2. Thời gian xử lý và giao hàng",
        items: [
          "Người bán dự kiến chuẩn bị và bàn giao hàng trong 1–2 ngày làm việc kể từ khi xác nhận đơn, trừ khi sản phẩm cần thời gian chuẩn bị riêng.",
          "Thời gian vận chuyển dự kiến: 1–3 ngày làm việc trong cùng khu vực/tỉnh; 2–5 ngày làm việc giữa các tỉnh; khu vực xa hoặc hải đảo có thể mất 5–7 ngày làm việc.",
          "Thời gian trên không bao gồm ngày nghỉ, ngày lễ, thời tiết xấu, sự cố giao thông hoặc trường hợp bất khả kháng. Người bán hoặc đơn vị vận chuyển sẽ cập nhật nếu có chậm trễ đáng kể.",
        ],
      },
      {
        heading: "3. Phí vận chuyển và COD",
        paragraphs: [
          "Phí vận chuyển được tính theo địa chỉ nhận, khối lượng/kích thước bưu gửi và biểu phí của đơn vị vận chuyển. Người bán thông báo phí hoặc tổng tiền COD cho người mua xác nhận trước khi gửi. Nếu có miễn phí vận chuyển hoặc phụ phí, điều kiện áp dụng sẽ được nêu trong thông tin sản phẩm hoặc khi xác nhận đơn.",
          "Với đơn COD, người mua thanh toán số tiền đã xác nhận cho đơn vị giao hàng khi nhận bưu gửi. Phí COD (nếu đơn vị vận chuyển thu) được tính theo thỏa thuận và phải được thông báo trước.",
        ],
      },
      {
        heading: "4. Nhận hàng và sự cố giao nhận",
        items: [
          "Người mua vui lòng kiểm tra tình trạng bên ngoài của bưu gửi khi nhận. Nếu bao bì rách, móp hoặc có dấu hiệu bị mở, hãy chụp ảnh/quay video và ghi nhận với nhân viên giao hàng.",
          "Nếu giao không thành công do địa chỉ hoặc số điện thoại không chính xác, người mua không liên lạc được hoặc từ chối nhận hàng, đơn vị vận chuyển có thể hoàn hàng và phát sinh phí theo chính sách của họ; người bán sẽ trao đổi khoản phí này với người mua.",
          "Khi hàng thất lạc, hư hỏng trong vận chuyển hoặc giao sai, người mua cần báo người bán sớm nhất có thể để hai bên phối hợp với đơn vị vận chuyển và xử lý theo chính sách đổi trả.",
        ],
      },
    ],
  },
  returns: {
    slug: "returns",
    title: "Chính sách đổi trả và hoàn tiền",
    summary: "Điều kiện yêu cầu đổi/trả và thời gian xử lý hoàn tiền cho người mua.",
    updatedAt: "06/10/2026",
    sections: [
      {
        heading: "1. Trường hợp được yêu cầu đổi/trả",
        items: [
          "Sản phẩm giao không đúng chủng loại, mẫu mã hoặc số lượng đã xác nhận.",
          "Sản phẩm bị hư hỏng, lỗi kỹ thuật hoặc không hoạt động khi nhận, không phải do người mua sử dụng sai hoặc tự gây hư hỏng.",
          "Người mua đổi ý: có thể yêu cầu trong vòng 7 ngày kể từ ngày nhận nếu sản phẩm còn nguyên trạng, chưa qua sử dụng và còn đầy đủ phụ kiện/bao bì; người bán có thể từ chối với hàng đặt riêng, hàng dễ hư hỏng, sản phẩm vệ sinh cá nhân hoặc sản phẩm số đã kích hoạt, trừ khi pháp luật quy định khác hoặc người bán đã công bố điều kiện thuận lợi hơn.",
        ],
      },
      {
        heading: "2. Thời hạn và cách gửi yêu cầu",
        paragraphs: [
          "Người mua nên liên hệ người bán trong vòng 48 giờ kể từ khi nhận hàng nếu phát hiện giao sai, thiếu hoặc có hư hỏng nhìn thấy được. Với lỗi khó phát hiện ngay, hãy liên hệ trong thời gian sớm nhất sau khi phát hiện và trong thời hạn bảo hành/đổi trả đã công bố.",
          "Gửi yêu cầu qua kênh liên hệ trên VNSEEA, kèm mã đơn (nếu có), lý do, ảnh/video tình trạng sản phẩm và thông tin liên hệ. Không gửi trả hàng trước khi người bán xác nhận địa chỉ và hướng dẫn gửi.",
        ],
      },
      {
        heading: "3. Phí gửi trả và đổi sản phẩm",
        paragraphs: [
          "Nếu lỗi do người bán hoặc sản phẩm hư hỏng/sai khác với xác nhận, người bán chịu chi phí đổi/trả hợp lý. Nếu đổi ý hoặc chọn nhầm sản phẩm, người mua chịu phí gửi trả và phí giao lại (nếu có), trừ khi người bán có chính sách tốt hơn.",
          "Người bán kiểm tra sản phẩm nhận lại và phản hồi hướng xử lý trong 3 ngày làm việc. Sản phẩm cần được gửi kèm phụ kiện, quà tặng và chứng từ liên quan đã nhận (nếu có).",
        ],
      },
      {
        heading: "4. Hoàn tiền",
        paragraphs: [
          "Sau khi chấp thuận hoàn tiền, người bán hoàn tiền trong tối đa 7 ngày làm việc. Với đơn COD, người mua cung cấp thông tin tài khoản ngân hàng đứng tên mình để người bán chuyển khoản; với khoản đã thanh toán qua trung gian, tiền được hoàn về phương thức thanh toán ban đầu nếu đơn vị đó hỗ trợ.",
          "Phí vận chuyển ban đầu được hoàn khi việc trả hàng do lỗi của người bán hoặc hàng hóa, trừ trường hợp pháp luật hoặc thỏa thuận có lợi hơn cho người mua quy định khác. VNSEEA không giữ tiền đơn hàng theo mặc định; người bán chịu trách nhiệm thực hiện khoản hoàn trực tiếp cho người mua.",
          "Các nội dung trên không làm mất quyền bảo hành, khiếu nại hoặc quyền lợi bắt buộc khác của người tiêu dùng theo pháp luật.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Chính sách bảo mật thông tin khách hàng",
    summary: "Cách VNSEEA thu thập, sử dụng, chia sẻ và bảo vệ dữ liệu cá nhân trên nền tảng.",
    updatedAt: "06/10/2026",
    sections: [
      {
        heading: "1. Thông tin có thể được thu thập",
        items: [
          "Thông tin tài khoản và đăng ký: tên người dùng, ngày sinh, giới tính, số điện thoại hoặc email đăng nhập, mật khẩu và ảnh đại diện/ảnh bạn chủ động tải lên.",
          "Thông tin giao dịch: nội dung trao đổi giữa người mua và người bán, sản phẩm quan tâm, thông tin đơn hàng, địa chỉ nhận hàng và số điện thoại giao nhận do bạn cung cấp.",
          "Thông tin kỹ thuật cần thiết để vận hành và bảo vệ tài khoản, như địa chỉ IP, loại thiết bị/trình duyệt, nhật ký đăng nhập và dữ liệu cookie theo thiết lập trình duyệt.",
        ],
      },
      {
        heading: "2. Mục đích sử dụng",
        paragraphs: [
          "VNSEEA sử dụng dữ liệu để tạo và quản lý tài khoản; hiển thị hồ sơ hoặc gian hàng theo cài đặt của bạn; giúp người mua và người bán tìm thấy, liên hệ, trao đổi và thực hiện giao dịch; hỗ trợ giao nhận, chăm sóc khách hàng, xử lý khiếu nại, ngăn chặn gian lận và đáp ứng yêu cầu pháp luật.",
          "Mật khẩu được dùng để xác thực tài khoản và không được hiển thị cho người mua hoặc người bán khác. Không gửi mật khẩu hoặc mã xác thực cho bất kỳ ai qua trao đổi mua bán.",
        ],
      },
      {
        heading: "3. Chia sẻ thông tin",
        paragraphs: [
          "Vì VNSEEA hỗ trợ người mua và người bán trao đổi trực tiếp, thông tin bạn đăng công khai trên hồ sơ/gian hàng hoặc chủ động gửi trong cuộc trò chuyện, yêu cầu mua hàng sẽ được bên nhận nhìn thấy. Bạn nên chỉ cung cấp thông tin cần thiết cho giao dịch và không đăng dữ liệu nhạy cảm ở nơi công khai.",
          "Thông tin giao nhận cần thiết có thể được cung cấp cho người bán và đơn vị vận chuyển để giao hàng; thông tin thanh toán cần thiết có thể được cung cấp cho đơn vị thanh toán khi bạn chọn phương thức tương ứng. VNSEEA chỉ cung cấp dữ liệu cho cơ quan có thẩm quyền khi có căn cứ và yêu cầu hợp lệ theo pháp luật.",
          "VNSEEA không bán dữ liệu cá nhân của người dùng. Khi chia sẻ cho nhà cung cấp hạ tầng/kỹ thuật phục vụ vận hành, VNSEEA yêu cầu họ chỉ xử lý dữ liệu trong phạm vi cung cấp dịch vụ.",
        ],
      },
      {
        heading: "4. Lưu trữ, bảo vệ và quyền của bạn",
        paragraphs: [
          "VNSEEA áp dụng các biện pháp quản lý và kỹ thuật phù hợp để hạn chế truy cập trái phép, mất mát hoặc tiết lộ dữ liệu. Thông tin được lưu trong thời gian tài khoản còn hoạt động và lâu hơn khi cần để hoàn tất giao dịch, giải quyết tranh chấp hoặc tuân thủ thời hạn lưu trữ theo pháp luật.",
          "Bạn có thể xem/cập nhật một số thông tin trong phần cài đặt tài khoản, điều chỉnh thông tin công khai hoặc yêu cầu hỗ trợ truy cập, sửa, rút lại sự đồng ý hay xóa dữ liệu trong phạm vi pháp luật cho phép. Một số dữ liệu có thể tiếp tục được lưu khi pháp luật yêu cầu hoặc cần thiết để xử lý giao dịch/tranh chấp đang tồn tại.",
          "Liên hệ yêu cầu về dữ liệu cá nhân: 0971 765 268 hoặc support@vnseea.vn. VNSEEA sẽ xác minh yêu cầu và phản hồi theo quy định áp dụng.",
        ],
      },
    ],
  },
}

export const getCommercePolicy = (slug: unknown): CommercePolicy | null => {
  if (typeof slug !== "string" || !Object.prototype.hasOwnProperty.call(policies, slug)) return null
  return policies[slug as CommercePolicySlug]
}

export const getCommercePolicyLinks = () =>
  (Object.values(policies) as CommercePolicy[]).map(({ slug, title }) => ({
    slug,
    title,
    href: `/policies/${slug}`,
  }))
