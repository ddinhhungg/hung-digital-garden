// ============================================================
//  CONTENT.CONFIG.TS — Chỉnh sửa nội dung website tại đây
//  Sau khi sửa xong: lưu file → GitHub tự deploy (~1 phút)
// ============================================================

export const site = {
  // ── Thông tin trang ──────────────────────────────────────
  title: "Hưng's Garden",
  description: "Thinking out loud — one slow idea at a time.",
};

export const hero = {
  // ── Phần trái (giới thiệu) ───────────────────────────────
  badge: "digital garden",           // badge nhỏ trên cùng
  name: "Đình Hưng",                      // tên hiển thị lớn
  quote: [                           // câu quote (2 dòng)
    '"Thinking out loud —',
    'one slow idea at a time."',
  ],
  subtitle: "Ghi lại để hiểu — từng chút một.",  // chữ nhỏ dưới quote
  ctaButton: "explore my garden →", // nút đỏ
  ctaSecondary: "or just read",      // link phụ bên cạnh nút

  // ── Phần phải (video + social) ───────────────────────────
  videoSrc: "/intro.mp4",            // đường dẫn video (để trong thư mục public/)
  socialLabel: "more videos →",      // chữ bên trái social links
  socials: [
    { label: "tiktok ↗",     url: "https://www.tiktok.com/@hungg_ddinh" },
    { label: "instagram ↗",  url: "https://www.instagram.com/ddinh_hungg/" },
  ],
  scrollHint: "latest updates below", // chữ mũi tên scroll
};

export const navCards = [
  // ── 4 nút điều hướng đè lên video ────────────────────────
  // Sửa: icon (emoji), label (tên), href (đường dẫn)
  { icon: "📓", label: "notes",    href: "/notes" },
  { icon: "🌱", label: "projects", href: "/projects" },
  { icon: "🗺️", label: "journey",  href: "/journey" },
  { icon: "💬", label: "thoughts", href: "/thoughts" },
];

export const gardenMap = {
  // ── Section "The Garden Map" ──────────────────────────────
  stamp: "navigation",
  title: "The Garden Map",
  cards: [
    {
      icon: "📓",
      title: "Notes",
      description: "Learning notes, reading logs,\nhalf-baked ideas worth keeping.",
      href: "/notes",
    },
    {
      icon: "🌱",
      title: "Projects",
      description: "Things I built, am building,\nor abandoned lovingly.",
      href: "/projects",
    },
    {
      icon: "🗺️",
      title: "Journey",
      description: "Timeline of growth, milestones,\nand turning points.",
      href: "/journey",
    },
    {
      icon: "💬",
      title: "Thoughts",
      description: "Opinions, observations,\nand little sparks.",
      href: "/thoughts",
    },
  ],
};

export const recentlyTended = {
  // ── Section "Recently Tended" ─────────────────────────────
  stamp: "feed",
  title: "Recently Tended",
  // fallbackPosts: hiện khi chưa có bài viết thật nào
  fallbackPosts: [
    {
      tag: "note" as const,
      date: "Apr 28, 2026",
      title: "Về việc học chậm và thích nghi với nó",
      excerpt: "Không phải mọi thứ đều cần nhanh. Đôi khi học chậm lại là cách duy nhất để hiểu thật sự...",
      href: "/notes",
    },
    {
      tag: "project" as const,
      date: "Apr 20, 2026",
      title: "Building this garden — process notes",
      excerpt: "How I went from zero technical knowledge to having a real website, with AI as my collaborator.",
      href: "/notes",
    },
    {
      tag: "thought" as const,
      date: "Apr 12, 2026",
      title: "Sự đơn giản không có nghĩa là dễ dàng",
      excerpt: "Cái khó nhất không phải làm phức tạp — mà là biết dừng lại đúng lúc và không thêm gì nữa.",
      href: "/notes",
    },
  ],
};

export const projectShelf = {
  // ── Section "Project Shelf" ───────────────────────────────
  stamp: "portfolio",
  title: "Project Shelf",
  // Mỗi cuốn sách: title (tên dự án), tool (công nghệ dùng), bg (màu gáy sách)
  books: [
    { title: "Project Alpha",    tool: "D",  bg: "#8B4A3A", w: 52, h: 178 },
    { title: "Garden Exp.",      tool: "Ư", bg: "#3D5A3E", w: 48, h: 152 },
    { title: "Visual Study 01",  tool: "Ơ",  bg: "#6B5A3A", w: 56, h: 186 },
    { title: "— WIP —",          tool: "N",    bg: "#4A4A5A", w: 44, h: 132 },
    { title: "Side Thing",       tool: "G",  bg: "#5A3A3A", w: 50, h: 162 },
    { title: "Open Source",      tool: "Đ",     bg: "#3A4A3A", w: 52, h: 170 },
  ],
};

export const about = {
  // ── Section "About" ───────────────────────────────────────
  stamp: "the gardener",
  title: "About Hưng",
  portraitSrc: "/portrait.jpg",   // ảnh chân dung (để trong public/)
  quote: [                        // câu quote bên lề đỏ (2 dòng)
    '"Tôi thích biến những thứ phức tạp thành đơn giản —',
    'trong công việc, trong suy nghĩ, và trong cách sống."',
  ],
  bio: `Là người làm vận hành và quản lý dự án, thiên về tối ưu quy trình và giải quyết vấn đề thực tế. Tôi quen làm việc với nhiều phòng ban, thích biến các vấn đề phức tạp thành quy trình rõ ràng, dễ triển khai và đo lường được hiệu quả.

Ngoài công việc, tôi thích những thứ trực quan, đơn giản nhưng tinh tế và có chiều sâu - từ cách viết, cách trình bày cho đến cách giải quyết vấn đề. Trang này là nơi tôi ghi lại những thứ đang học, đang xây dựng, và đang suy nghĩ.`,
  growthLog: [
    // Thêm/sửa dòng: { year: '...', text: '...' }
    { year: "04/2026", text: "Vẫn đang đi làm, rảnh rảnh không biết làm gì nên mới bắt đầu xây dựng digital garden này", highlight: true },
    { year: "2025", text: "Tốt nghiệp - Chính thức làm tại CellphoneS với vị trí Tối ưu vận hành", highlight: false },    
    { year: "2024", text: "Mất định hướng, stress, không biết làm gì",               highlight: false },
    { year: "2022-2023", text: "Không có gì nổi bật",               highlight: false },
    { year: "2021", text: "Đại học UEH - Kinh doanh thương mại",               highlight: false },
    { year: "2018", text: "Trai chuyên hoá - Trường THPT chuyên Thăng Long - Đà Lạt",               highlight: false },
  ],
};
