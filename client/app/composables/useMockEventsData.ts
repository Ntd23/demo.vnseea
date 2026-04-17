export type EventTabKey = "upcoming" | "my" | "going" | "invited" | "interested" | "past"
export type EventRsvpState = "none" | "going" | "interested" | "not_interested" | "invited"

export type EventTab = {
  key: EventTabKey
  label: string
  icon: string
}

export type EventCategory = {
  value: string
  label: string
  icon: string
}

export type EventAttendee = {
  id: number
  name: string
  role: string
  initials: string
  gradient: string
  status: "going" | "interested" | "invited"
}

export type MockEvent = {
  id: string
  title: string
  category: string
  categoryLabel: string
  host: string
  hostRole: string
  hostInitials: string
  hostGradient: string
  location: string
  city: string
  startsAt: string
  endsAt: string
  dateLabel: string
  timeLabel: string
  month: string
  day: string
  cover: string
  coverFallback: string
  description: string
  summary: string
  tags: string[]
  tabKeys: EventTabKey[]
  userState: EventRsvpState
  isOwner: boolean
  capacity: number
  stats: {
    going: number
    interested: number
    invited: number
  }
  agenda: {
    time: string
    title: string
    description: string
  }[]
  attendees: EventAttendee[]
}

export const useMockEventsData = () => {
  const eventTabs: EventTab[] = [
    { key: "upcoming", label: "Sắp diễn ra", icon: "i-ph-calendar-check" },
    { key: "my", label: "Sự kiện của tôi", icon: "i-ph-user-circle-check" },
    { key: "going", label: "Sẽ tham gia", icon: "i-ph-check-circle" },
    { key: "invited", label: "Được mời", icon: "i-ph-envelope-open" },
    { key: "interested", label: "Quan tâm", icon: "i-ph-star" },
    { key: "past", label: "Đã qua", icon: "i-ph-clock-counter-clockwise" },
  ]

  const eventCategories: EventCategory[] = [
    { value: "all", label: "Tất cả", icon: "i-ph-squares-four" },
    { value: "community", label: "Cộng đồng", icon: "i-ph-users-three" },
    { value: "education", label: "Giáo dục", icon: "i-ph-graduation-cap" },
    { value: "business", label: "Kinh doanh", icon: "i-ph-briefcase" },
    { value: "culture", label: "Văn hoá", icon: "i-ph-confetti" },
    { value: "technology", label: "Công nghệ", icon: "i-ph-cpu" },
  ]

  const eventCities = [
    { value: "all", label: "Mọi địa điểm" },
    { value: "ho-chi-minh", label: "TP. Hồ Chí Minh" },
    { value: "ha-noi", label: "Hà Nội" },
    { value: "da-nang", label: "Đà Nẵng" },
    { value: "online", label: "Trực tuyến" },
  ]

  const events: MockEvent[] = [
    {
      id: "tech-community-summit-2026",
      title: "VNSEEA Tech Community Summit 2026",
      category: "technology",
      categoryLabel: "Công nghệ",
      host: "VNSEEA Community",
      hostRole: "Ban tổ chức",
      hostInitials: "VC",
      hostGradient: "linear-gradient(135deg,#0000ff 0%,#18a999 100%)",
      location: "Innovation Hub, Quận 1",
      city: "ho-chi-minh",
      startsAt: "2026-05-14T09:00",
      endsAt: "2026-05-14T17:30",
      dateLabel: "Thứ Năm, 14 tháng 5, 2026",
      timeLabel: "09:00 - 17:30",
      month: "TH5",
      day: "14",
      cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#0000ff 0%,#18a999 58%,#f59e0b 120%)",
      description: "Một ngày gặp gỡ dành cho thành viên đang xây dựng sản phẩm, vận hành cộng đồng và ứng dụng AI vào công việc thực tế.",
      summary: "Talk, workshop và kết nối cộng đồng sản phẩm trong một ngày.",
      tags: ["AI", "Product", "Community"],
      tabKeys: ["upcoming", "my", "going"],
      userState: "going",
      isOwner: true,
      capacity: 320,
      stats: { going: 184, interested: 642, invited: 58 },
      agenda: [
        {
          time: "09:00",
          title: "Đón khách và kết nối",
          description: "Check-in, nhận thẻ tham dự và gặp gỡ các nhóm cộng đồng.",
        },
        {
          time: "10:15",
          title: "Product keynote",
          description: "Chia sẻ cách đội sản phẩm nhỏ dùng AI để rút ngắn vòng phản hồi.",
        },
        {
          time: "14:00",
          title: "Workshop vận hành cộng đồng",
          description: "Thực hành thiết kế lịch nội dung, phân nhóm thành viên và đo engagement.",
        },
      ],
      attendees: [
        { id: 1, name: "Thu Hà", role: "Community lead", initials: "TH", gradient: "linear-gradient(135deg,#0000ff,#18a999)", status: "going" },
        { id: 2, name: "Bảo Trần", role: "Product manager", initials: "BT", gradient: "linear-gradient(135deg,#0f766e,#f59e0b)", status: "going" },
        { id: 3, name: "Minh Anh", role: "Designer", initials: "MA", gradient: "linear-gradient(135deg,#2563eb,#10b981)", status: "interested" },
        { id: 4, name: "Hoàng Huy", role: "Frontend dev", initials: "HH", gradient: "linear-gradient(135deg,#111827,#0000ff)", status: "invited" },
      ],
    },
    {
      id: "founder-breakfast-ha-noi",
      title: "Founder Breakfast: Từ ý tưởng đến khách hàng đầu tiên",
      category: "business",
      categoryLabel: "Kinh doanh",
      host: "Hanoi Startup Circle",
      hostRole: "Đối tác cộng đồng",
      hostInitials: "HS",
      hostGradient: "linear-gradient(135deg,#0f766e 0%,#f59e0b 100%)",
      location: "Không gian làm việc Cầu Giấy",
      city: "ha-noi",
      startsAt: "2026-05-21T08:00",
      endsAt: "2026-05-21T10:30",
      dateLabel: "Thứ Năm, 21 tháng 5, 2026",
      timeLabel: "08:00 - 10:30",
      month: "TH5",
      day: "21",
      cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#0f766e 0%,#f59e0b 100%)",
      description: "Buổi sáng dành cho founder giai đoạn đầu: kiểm chứng nhu cầu, tìm khách hàng đầu tiên và kể câu chuyện sản phẩm rõ hơn.",
      summary: "Gặp gỡ founder, chia sẻ bài học bán hàng đầu tiên.",
      tags: ["Startup", "Sales", "Founder"],
      tabKeys: ["upcoming", "interested"],
      userState: "interested",
      isOwner: false,
      capacity: 80,
      stats: { going: 46, interested: 118, invited: 24 },
      agenda: [
        {
          time: "08:00",
          title: "Ăn sáng networking",
          description: "Kết nối theo nhóm nhỏ và giới thiệu nhanh sản phẩm.",
        },
        {
          time: "08:45",
          title: "Case study",
          description: "Cách một đội 3 người tìm 20 khách hàng trả phí đầu tiên.",
        },
        {
          time: "09:45",
          title: "Hỏi đáp mở",
          description: "Founder đặt câu hỏi trực tiếp cho mentor và cộng đồng.",
        },
      ],
      attendees: [
        { id: 5, name: "Quỳnh Lan", role: "Founder", initials: "QL", gradient: "linear-gradient(135deg,#f59e0b,#0f766e)", status: "going" },
        { id: 6, name: "Đức Nam", role: "Growth", initials: "DN", gradient: "linear-gradient(135deg,#0000ff,#f59e0b)", status: "going" },
        { id: 7, name: "Linh Phạm", role: "Marketing", initials: "LP", gradient: "linear-gradient(135deg,#10b981,#2563eb)", status: "interested" },
      ],
    },
    {
      id: "creative-night-da-nang",
      title: "Creative Night Đà Nẵng: Thiết kế, âm nhạc và cộng đồng",
      category: "culture",
      categoryLabel: "Văn hoá",
      host: "Da Nang Creative Club",
      hostRole: "Câu lạc bộ sáng tạo",
      hostInitials: "DC",
      hostGradient: "linear-gradient(135deg,#0ea5e9 0%,#f59e0b 100%)",
      location: "Bờ Tây sông Hàn",
      city: "da-nang",
      startsAt: "2026-06-06T18:30",
      endsAt: "2026-06-06T22:00",
      dateLabel: "Thứ Bảy, 6 tháng 6, 2026",
      timeLabel: "18:30 - 22:00",
      month: "TH6",
      day: "06",
      cover: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#0ea5e9 0%,#f59e0b 100%)",
      description: "Một tối mở cho designer, creator và các nhóm nội dung địa phương cùng chia sẻ dự án, nghe nhạc và kết nối.",
      summary: "Đêm giao lưu sáng tạo bên sông Hàn.",
      tags: ["Design", "Music", "Local"],
      tabKeys: ["upcoming", "invited"],
      userState: "invited",
      isOwner: false,
      capacity: 180,
      stats: { going: 92, interested: 310, invited: 61 },
      agenda: [
        {
          time: "18:30",
          title: "Mở cổng",
          description: "Nhận vòng tay tham dự và ghé các booth sáng tạo địa phương.",
        },
        {
          time: "19:15",
          title: "Showcase dự án",
          description: "Ba nhóm creator trình bày dự án mới trong 10 phút.",
        },
        {
          time: "20:30",
          title: "Live set",
          description: "Không gian âm nhạc nhẹ để thành viên giao lưu tự do.",
        },
      ],
      attendees: [
        { id: 8, name: "An Nguyễn", role: "Illustrator", initials: "AN", gradient: "linear-gradient(135deg,#0ea5e9,#f59e0b)", status: "going" },
        { id: 9, name: "Mai Chi", role: "Content creator", initials: "MC", gradient: "linear-gradient(135deg,#0000ff,#0ea5e9)", status: "invited" },
        { id: 10, name: "Phú Lê", role: "Photographer", initials: "PL", gradient: "linear-gradient(135deg,#111827,#f59e0b)", status: "interested" },
      ],
    },
    {
      id: "online-learning-lab",
      title: "Online Learning Lab: Thiết kế lớp học cộng đồng",
      category: "education",
      categoryLabel: "Giáo dục",
      host: "Learning Guild",
      hostRole: "Nhóm giáo dục",
      hostInitials: "LG",
      hostGradient: "linear-gradient(135deg,#2563eb 0%,#10b981 100%)",
      location: "Zoom Webinar",
      city: "online",
      startsAt: "2026-06-12T20:00",
      endsAt: "2026-06-12T21:30",
      dateLabel: "Thứ Sáu, 12 tháng 6, 2026",
      timeLabel: "20:00 - 21:30",
      month: "TH6",
      day: "12",
      cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#2563eb 0%,#10b981 100%)",
      description: "Buổi lab trực tuyến giúp admin cộng đồng xây lớp học nhỏ, quản lý bài tập và tạo nhịp học đều cho thành viên.",
      summary: "Lab online về lớp học cộng đồng và tài nguyên học tập.",
      tags: ["Online", "Learning", "Workshop"],
      tabKeys: ["upcoming", "going"],
      userState: "going",
      isOwner: false,
      capacity: 500,
      stats: { going: 238, interested: 519, invited: 140 },
      agenda: [
        {
          time: "20:00",
          title: "Khởi động lớp học",
          description: "Chốt mục tiêu, cấu trúc buổi học và cách ghi nhận tiến độ.",
        },
        {
          time: "20:25",
          title: "Thiết kế bài tập",
          description: "Tạo nhiệm vụ nhỏ để thành viên có thể hoàn thành trong tuần.",
        },
        {
          time: "21:00",
          title: "Q&A",
          description: "Trả lời câu hỏi về vận hành lớp học online.",
        },
      ],
      attendees: [
        { id: 11, name: "Ngọc Lê", role: "Trainer", initials: "NL", gradient: "linear-gradient(135deg,#2563eb,#10b981)", status: "going" },
        { id: 12, name: "Xu Nguyễn", role: "Moderator", initials: "XN", gradient: "linear-gradient(135deg,#10b981,#f59e0b)", status: "going" },
        { id: 13, name: "Trang Đỗ", role: "Teacher", initials: "TD", gradient: "linear-gradient(135deg,#0000ff,#10b981)", status: "interested" },
      ],
    },
    {
      id: "local-volunteer-day",
      title: "Ngày tình nguyện xanh cùng khu phố",
      category: "community",
      categoryLabel: "Cộng đồng",
      host: "Green Neighborhood",
      hostRole: "Nhóm địa phương",
      hostInitials: "GN",
      hostGradient: "linear-gradient(135deg,#16a34a 0%,#0ea5e9 100%)",
      location: "Công viên Gia Định",
      city: "ho-chi-minh",
      startsAt: "2026-06-20T07:00",
      endsAt: "2026-06-20T11:30",
      dateLabel: "Thứ Bảy, 20 tháng 6, 2026",
      timeLabel: "07:00 - 11:30",
      month: "TH6",
      day: "20",
      cover: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#16a34a 0%,#0ea5e9 100%)",
      description: "Cùng dọn rác, trồng thêm cây nhỏ và ghi nhận các điểm cần cải thiện trong khu phố.",
      summary: "Hoạt động tình nguyện xanh cho thành viên gần khu vực.",
      tags: ["Volunteer", "Green", "Local"],
      tabKeys: ["upcoming"],
      userState: "none",
      isOwner: false,
      capacity: 120,
      stats: { going: 74, interested: 205, invited: 12 },
      agenda: [
        {
          time: "07:00",
          title: "Tập trung",
          description: "Nhận găng tay, túi phân loại và chia nhóm khu vực.",
        },
        {
          time: "08:00",
          title: "Dọn dẹp theo tuyến",
          description: "Các nhóm đi theo tuyến đã phân công và cập nhật ảnh hiện trường.",
        },
        {
          time: "10:45",
          title: "Tổng kết",
          description: "Ghi nhận kết quả, chụp ảnh nhóm và đề xuất hoạt động tiếp theo.",
        },
      ],
      attendees: [
        { id: 14, name: "Thanh Hà", role: "Volunteer", initials: "TH", gradient: "linear-gradient(135deg,#16a34a,#0ea5e9)", status: "going" },
        { id: 15, name: "Bình An", role: "Student", initials: "BA", gradient: "linear-gradient(135deg,#0ea5e9,#f59e0b)", status: "interested" },
        { id: 16, name: "Uyên Phạm", role: "Organizer", initials: "UP", gradient: "linear-gradient(135deg,#0000ff,#16a34a)", status: "going" },
      ],
    },
    {
      id: "community-retrospective-2025",
      title: "Community Retrospective 2025",
      category: "community",
      categoryLabel: "Cộng đồng",
      host: "VNSEEA Community",
      hostRole: "Ban tổ chức",
      hostInitials: "VC",
      hostGradient: "linear-gradient(135deg,#111827 0%,#0000ff 100%)",
      location: "VNSEEA Hall",
      city: "ho-chi-minh",
      startsAt: "2025-12-18T18:00",
      endsAt: "2025-12-18T21:00",
      dateLabel: "Thứ Năm, 18 tháng 12, 2025",
      timeLabel: "18:00 - 21:00",
      month: "TH12",
      day: "18",
      cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
      coverFallback: "linear-gradient(135deg,#111827 0%,#0000ff 100%)",
      description: "Buổi tổng kết các hoạt động cộng đồng trong năm, nhìn lại số liệu, câu chuyện thành viên và kế hoạch năm tới.",
      summary: "Tổng kết cộng đồng năm 2025.",
      tags: ["Review", "Community", "Planning"],
      tabKeys: ["past", "my"],
      userState: "going",
      isOwner: true,
      capacity: 240,
      stats: { going: 201, interested: 490, invited: 80 },
      agenda: [
        {
          time: "18:00",
          title: "Nhìn lại số liệu",
          description: "Các mốc tăng trưởng, hoạt động nổi bật và bài học vận hành.",
        },
        {
          time: "19:15",
          title: "Câu chuyện thành viên",
          description: "Ba thành viên chia sẻ hành trình tham gia cộng đồng.",
        },
        {
          time: "20:15",
          title: "Kế hoạch tiếp theo",
          description: "Chốt các hướng ưu tiên cho năm 2026.",
        },
      ],
      attendees: [
        { id: 17, name: "Khánh Vũ", role: "Speaker", initials: "KV", gradient: "linear-gradient(135deg,#111827,#0000ff)", status: "going" },
        { id: 18, name: "Phương Linh", role: "Member", initials: "PL", gradient: "linear-gradient(135deg,#0000ff,#f59e0b)", status: "going" },
        { id: 19, name: "Hải Đăng", role: "Ops", initials: "HD", gradient: "linear-gradient(135deg,#0f766e,#111827)", status: "going" },
      ],
    },
  ]

  return {
    events,
    eventTabs,
    eventCategories,
    eventCities,
    findEventById: (id: string) => events.find((event) => event.id === id),
  }
}
