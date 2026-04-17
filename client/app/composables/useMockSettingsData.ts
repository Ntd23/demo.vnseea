export type SettingFieldType = "text" | "email" | "tel" | "date" | "select" | "textarea" | "password" | "file" | "number" | "url"
export type SettingSectionKind = "form" | "toggles" | "list" | "danger" | "summary"

export type SettingField = {
  label: string
  key: string
  type: SettingFieldType
  value: string | number
  placeholder?: string
  options?: string[]
}

export type SettingAction = {
  label: string
  icon: string
  tone?: "primary" | "danger" | "neutral"
}

export type SettingItem = {
  title: string
  description: string
  meta?: string
  action?: string
}

export type SettingSection = {
  title: string
  description: string
  kind: SettingSectionKind
  fields?: SettingField[]
  toggles?: { label: string; description: string; enabled: boolean }[]
  items?: SettingItem[]
  actions?: SettingAction[]
}

export type SettingPage = {
  slug: string
  label: string
  icon: string
  description: string
  sections: SettingSection[]
}

export const useMockSettingsData = () => {
  const pages: SettingPage[] = [
    {
      slug: "general",
      label: "Chung",
      icon: "i-ph-user-circle-fill",
      description: "Username, email, số điện thoại và thông tin cơ bản.",
      sections: [
        {
          title: "Thông tin tài khoản",
          description: "Cập nhật các thông tin nhận diện chính của tài khoản.",
          kind: "form",
          fields: [
            { label: "Username", key: "username", type: "text", value: "justin", placeholder: "username" },
            { label: "Email", key: "email", type: "email", value: "justin@vnseea.test" },
            { label: "Phone", key: "phone", type: "tel", value: "+84 900 000 000" },
            { label: "Birthday", key: "birthday", type: "date", value: "1995-04-17" },
            { label: "Gender", key: "gender", type: "select", value: "Nam", options: ["Nam", "Nữ", "Khác"] },
            { label: "Country", key: "country", type: "select", value: "Việt Nam", options: ["Việt Nam", "Singapore", "Thailand", "United States"] },
            { label: "Website", key: "website", type: "url", value: "https://vnseea.test" },
          ],
        },
      ],
    },
    {
      slug: "profile",
      label: "Hồ sơ",
      icon: "i-ph-identification-card-fill",
      description: "Bio, công việc, trường học và nơi ở.",
      sections: [
        {
          title: "Hồ sơ công khai",
          description: "Các trường này xuất hiện trong trang cá nhân.",
          kind: "form",
          fields: [
            { label: "Bio", key: "bio", type: "textarea", value: "Community builder tại VNSEEA." },
            { label: "Workplace", key: "workplace", type: "text", value: "VNSEEA" },
            { label: "School", key: "school", type: "text", value: "Đại học Kinh tế" },
            { label: "Relationship", key: "relationship", type: "select", value: "Không hiển thị", options: ["Không hiển thị", "Độc thân", "Đang hẹn hò", "Đã kết hôn"] },
            { label: "City", key: "city", type: "text", value: "TP. Hồ Chí Minh" },
            { label: "Hometown", key: "hometown", type: "text", value: "Hà Nội" },
          ],
        },
      ],
    },
    {
      slug: "privacy",
      label: "Riêng tư",
      icon: "i-ph-lock-key-fill",
      description: "Kiểm soát ai có thể xem bài viết, theo dõi và trạng thái online.",
      sections: [
        {
          title: "Quyền riêng tư",
          description: "Mock các lựa chọn privacy trước khi nối API setting.",
          kind: "form",
          fields: [
            { label: "Who sees posts", key: "posts", type: "select", value: "Bạn bè", options: ["Công khai", "Bạn bè", "Chỉ mình tôi"] },
            { label: "Who can follow", key: "follow", type: "select", value: "Công khai", options: ["Công khai", "Bạn bè"] },
            { label: "Search visibility", key: "search", type: "select", value: "Cho phép", options: ["Cho phép", "Ẩn khỏi tìm kiếm"] },
            { label: "Who sees friends", key: "friends", type: "select", value: "Bạn bè", options: ["Công khai", "Bạn bè", "Chỉ mình tôi"] },
            { label: "Who sees birthday", key: "birthdayPrivacy", type: "select", value: "Bạn bè", options: ["Công khai", "Bạn bè", "Chỉ mình tôi"] },
            { label: "Status online/offline", key: "onlineStatus", type: "select", value: "Hiển thị online", options: ["Hiển thị online", "Luôn offline"] },
          ],
        },
      ],
    },
    {
      slug: "avatar",
      label: "Ảnh đại diện",
      icon: "i-ph-image-square-fill",
      description: "Upload và crop avatar.",
      sections: [
        {
          title: "Upload & crop avatar",
          description: "Chọn ảnh mới và mô phỏng vùng crop.",
          kind: "form",
          fields: [
            { label: "Avatar image", key: "avatar", type: "file", value: "" },
          ],
        },
      ],
    },
    {
      slug: "design",
      label: "Giao diện",
      icon: "i-ph-palette-fill",
      description: "Night mode và màu theme.",
      sections: [
        {
          title: "Tuỳ chỉnh giao diện",
          description: "Thiết lập giao diện hiển thị trên thiết bị của bạn.",
          kind: "form",
          fields: [
            { label: "Night mode", key: "nightMode", type: "select", value: "Theo hệ thống", options: ["Bật", "Tắt", "Theo hệ thống"] },
            { label: "Theme color", key: "themeColor", type: "select", value: "VNSEEA Blue", options: ["VNSEEA Blue", "Emerald", "Amber", "Slate"] },
          ],
        },
      ],
    },
    {
      slug: "password",
      label: "Mật khẩu",
      icon: "i-ph-key-fill",
      description: "Đổi mật khẩu đăng nhập.",
      sections: [
        {
          title: "Đổi mật khẩu",
          description: "Nhập mật khẩu hiện tại và mật khẩu mới.",
          kind: "form",
          fields: [
            { label: "Current password", key: "currentPassword", type: "password", value: "" },
            { label: "New password", key: "newPassword", type: "password", value: "" },
            { label: "Confirm password", key: "confirmPassword", type: "password", value: "" },
          ],
        },
      ],
    },
    {
      slug: "two-factor",
      label: "2FA",
      icon: "i-ph-shield-check-fill",
      description: "Authenticator, QR code và backup codes.",
      sections: [
        {
          title: "Two-Factor Authentication",
          description: "Bật bảo mật hai lớp và quét QR bằng ứng dụng authenticator.",
          kind: "summary",
          items: [
            { title: "Enable/disable 2FA", description: "Trạng thái hiện tại: chưa bật.", action: "Bật 2FA" },
            { title: "QR code authenticator", description: "Mock QR placeholder cho ứng dụng xác thực.", meta: "VNSEEA-2FA-2026" },
            { title: "Backup codes", description: "8 mã dự phòng chưa được tạo.", action: "Tạo mã mới" },
          ],
        },
      ],
    },
    {
      slug: "notifications",
      label: "Thông báo",
      icon: "i-ph-bell-ringing-fill",
      description: "Bật tắt thông báo theo từng loại.",
      sections: [
        {
          title: "Thông báo trong app",
          description: "Likes, comments, follows, messages, mentions và các sự kiện khác.",
          kind: "toggles",
          toggles: [
            "Likes", "Comments", "Follows", "Messages", "Mentions", "Shares", "Events", "Groups", "Pages", "Marketplace", "Jobs", "Funding", "Live", "Watch", "Security",
          ].map((label, index) => ({ label, description: `Nhận thông báo ${label.toLowerCase()}.`, enabled: index < 10 })),
        },
      ],
    },
    {
      slug: "email-notifications",
      label: "Email",
      icon: "i-ph-envelope-simple-fill",
      description: "Thông báo qua email.",
      sections: [
        {
          title: "Email notifications",
          description: "Chọn loại email hệ thống được phép gửi.",
          kind: "toggles",
          toggles: [
            { label: "New message email", description: "Email khi có tin nhắn mới.", enabled: true },
            { label: "Mention email", description: "Email khi được nhắc tên.", enabled: true },
            { label: "Weekly digest", description: "Tóm tắt hoạt động hàng tuần.", enabled: false },
            { label: "Security email", description: "Cảnh báo đăng nhập và bảo mật.", enabled: true },
          ],
        },
      ],
    },
    {
      slug: "social-links",
      label: "Liên kết xã hội",
      icon: "i-ph-link-simple-fill",
      description: "Facebook, Twitter, LinkedIn, Instagram, YouTube.",
      sections: [
        {
          title: "Social links",
          description: "Các URL hiển thị trên hồ sơ.",
          kind: "form",
          fields: ["Facebook", "Twitter", "LinkedIn", "Instagram", "YouTube"].map(name => ({
            label: `${name} URL`,
            key: name.toLowerCase(),
            type: "url",
            value: "",
            placeholder: `https://${name.toLowerCase()}.com/username`,
          })),
        },
      ],
    },
    {
      slug: "blocked-users",
      label: "Đã chặn",
      icon: "i-ph-user-minus-fill",
      description: "Danh sách blocked và unblock.",
      sections: [
        {
          title: "Blocked users",
          description: "Quản lý người dùng đã chặn.",
          kind: "list",
          items: [
            { title: "spam-account", description: "Đã chặn 2 ngày trước", action: "Unblock" },
            { title: "old-bot", description: "Đã chặn 1 tháng trước", action: "Unblock" },
          ],
        },
      ],
    },
    {
      slug: "sessions",
      label: "Phiên đăng nhập",
      icon: "i-ph-devices-fill",
      description: "Active sessions và terminate.",
      sections: [
        {
          title: "Active sessions",
          description: "Kiểm tra các thiết bị đang đăng nhập.",
          kind: "list",
          items: [
            { title: "Chrome · Windows", description: "127.0.0.1 · hiện tại", meta: "Active now", action: "Giữ phiên" },
            { title: "Safari · iPhone", description: "TP. Hồ Chí Minh · 2 ngày trước", meta: "Mobile", action: "Terminate" },
          ],
        },
      ],
    },
    {
      slug: "verification",
      label: "Xác minh",
      icon: "i-ph-seal-check-fill",
      description: "Upload documents và gửi request xác minh.",
      sections: [
        {
          title: "Verification request",
          description: "Tải giấy tờ và mô tả lý do xác minh.",
          kind: "form",
          fields: [
            { label: "Document upload", key: "documents", type: "file", value: "" },
            { label: "Request note", key: "verificationNote", type: "textarea", value: "" },
          ],
        },
      ],
    },
    {
      slug: "delete-account",
      label: "Xóa tài khoản",
      icon: "i-ph-trash-fill",
      description: "Xác nhận mật khẩu và xóa tài khoản.",
      sections: [
        {
          title: "Delete account",
          description: "Hành động nguy hiểm, hiện chỉ mô phỏng.",
          kind: "danger",
          fields: [
            { label: "Password confirm", key: "deletePassword", type: "password", value: "" },
          ],
          actions: [{ label: "Delete account", icon: "i-ph-trash-fill", tone: "danger" }],
        },
      ],
    },
    {
      slug: "payments",
      label: "Thanh toán",
      icon: "i-ph-credit-card-fill",
      description: "Payment methods management.",
      sections: [
        {
          title: "Payment methods",
          description: "Quản lý thẻ và ví thanh toán.",
          kind: "list",
          items: [
            { title: "Visa ending 4242", description: "Phương thức mặc định", meta: "Default", action: "Edit" },
            { title: "VNSEEA Wallet", description: "Số dư mock: VND 9.999.999", meta: "Wallet", action: "Manage" },
          ],
        },
      ],
    },
    {
      slug: "monetization",
      label: "Kiếm tiền",
      icon: "i-ph-currency-circle-dollar-fill",
      description: "Plan, price và enable/disable.",
      sections: [
        {
          title: "Monetization plan",
          description: "Tạo gói nội dung trả phí.",
          kind: "form",
          fields: [
            { label: "Plan name", key: "planName", type: "text", value: "Creator Plus" },
            { label: "Price", key: "price", type: "number", value: 99000 },
            { label: "Enable/disable", key: "enabled", type: "select", value: "Enable", options: ["Enable", "Disable"] },
          ],
        },
      ],
    },
    {
      slug: "invitation-links",
      label: "Lời mời",
      icon: "i-ph-ticket-fill",
      description: "Generate invite link, copy link và invitees.",
      sections: [
        {
          title: "Invitation links",
          description: "Tạo và theo dõi link mời.",
          kind: "list",
          items: [
            { title: "https://vnseea.test/invite/JUSTIN2026", description: "12 người đã tham gia", meta: "Active", action: "Copy link" },
            { title: "Invitees", description: "Hoangne, Dung1, Nicolas", action: "View invitees" },
          ],
        },
      ],
    },
    {
      slug: "affiliates",
      label: "Affiliates",
      icon: "i-ph-handshake-fill",
      description: "Referral link và earnings dashboard.",
      sections: [
        {
          title: "Affiliate dashboard",
          description: "Theo dõi referral và thu nhập.",
          kind: "summary",
          items: [
            { title: "Referral link", description: "https://vnseea.test/ref/justin", action: "Copy" },
            { title: "Earnings", description: "VND 12.400.000", meta: "Tháng này" },
            { title: "Referrals", description: "42 lượt đăng ký", meta: "2026" },
          ],
        },
      ],
    },
    {
      slug: "my-info",
      label: "Dữ liệu của tôi",
      icon: "i-ph-download-simple-fill",
      description: "Download personal data.",
      sections: [
        {
          title: "My info",
          description: "Tải dữ liệu cá nhân dạng archive.",
          kind: "summary",
          items: [
            { title: "Download personal data", description: "Bao gồm profile, posts, media, messages metadata.", action: "Request archive" },
          ],
        },
      ],
    },
    {
      slug: "my-points",
      label: "Điểm của tôi",
      icon: "i-ph-coin-fill",
      description: "Points balance và history.",
      sections: [
        {
          title: "My points",
          description: "Điểm tích lũy từ hoạt động cộng đồng.",
          kind: "list",
          items: [
            { title: "50 điểm", description: "Số dư hiện tại", meta: "Balance" },
            { title: "+10", description: "Bình luận hữu ích", meta: "Hôm nay" },
            { title: "+25", description: "Tham gia event", meta: "Tuần này" },
          ],
        },
      ],
    },
    {
      slug: "addresses",
      label: "Địa chỉ",
      icon: "i-ph-map-pin-fill",
      description: "Add/edit shipping addresses.",
      sections: [
        {
          title: "Shipping addresses",
          description: "Địa chỉ giao hàng cho marketplace.",
          kind: "form",
          fields: [
            { label: "Full name", key: "addressName", type: "text", value: "Justin" },
            { label: "Phone", key: "addressPhone", type: "tel", value: "+84 900 000 000" },
            { label: "Address", key: "addressLine", type: "textarea", value: "Quận 1, TP. Hồ Chí Minh" },
          ],
        },
      ],
    },
    {
      slug: "career",
      label: "LinkedIn mode",
      icon: "i-ph-briefcase-fill",
      description: "Experience, certifications và projects.",
      sections: [
        {
          title: "Experience + Certifications + Projects",
          description: "Bổ sung hồ sơ nghề nghiệp.",
          kind: "list",
          items: [
            { title: "Work experience", description: "Community Manager · VNSEEA", action: "Add work experience" },
            { title: "Certifications", description: "Product Growth Certificate", action: "Add certification" },
            { title: "Projects", description: "VNSEEA migration UI", action: "Add project" },
          ],
        },
      ],
    },
  ]

  return {
    pages,
    defaultSlug: "general",
    findPageBySlug: (slug: string) => pages.find(page => page.slug === slug),
  }
}
