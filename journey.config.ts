// ============================================================
//  JOURNEY.CONFIG.TS — Thêm địa điểm chuyến đi tại đây
//  coordinates: [kinh độ, vĩ độ] — tra trên Google Maps
//  status: "visited" (đã đi) | "wishlist" (muốn đi)
// ============================================================

export interface JourneyLocation {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  status: 'visited' | 'wishlist';
  date?: string;
  note?: string;
  images?: string[];    // đường dẫn ảnh trong public/, vd: "/journey/dalat.jpg"
  videoUrl?: string;    // YouTube embed URL hoặc đường dẫn video
}

export const journeyLocations: JourneyLocation[] = [
  // ── ĐÃ ĐI ────────────────────────────────────────────────

  {
    id: 'dalat',
    name: 'Đà Lạt',
    country: 'Việt Nam',
    coordinates: [108.4583, 11.9465],
    status: 'visited',
    date: '2018 — nay',
    note: 'Quê nhà. Nơi tôi lớn lên với sương mù buổi sáng và những con dốc dài. Thành phố này dạy tôi cách sống chậm hơn bất kỳ nơi nào khác.',
    images: [],
  },
  {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    coordinates: [106.6297, 10.8231],
    status: 'visited',
    date: '2021 — nay',
    note: 'Thành phố tôi chọn để làm việc và trưởng thành. Ồn ào, nhanh, và đầy cơ hội — hoàn toàn ngược với Đà Lạt, nhưng tôi đã học được rất nhiều từ sự đối lập đó.',
    images: [],
  },
  {
    id: 'danang',
    name: 'Đà Nẵng',
    country: 'Việt Nam',
    coordinates: [108.2022, 16.0544],
    status: 'visited',
    date: '2023',
    note: 'Thành phố của cầu và biển. Cảm giác dễ chịu hơn Sài Gòn, vừa đủ nhộn nhịp mà vẫn thư giãn được.',
    images: [],
  },
  {
    id: 'hanoi',
    name: 'Hà Nội',
    country: 'Việt Nam',
    coordinates: [105.8342, 21.0278],
    status: 'visited',
    date: '2022',
    note: 'Lần đầu ra Bắc. Mùa đông Hà Nội lạnh hơn tôi nghĩ, và bún bò Nam Bộ ở đây ngon bất ngờ.',
    images: [],
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thái Lan',
    coordinates: [100.5018, 13.7563],
    status: 'visited',
    date: '2024',
    note: 'Chuyến đi nước ngoài đầu tiên. Đồ ăn ngon, chùa chiền đẹp, nhưng cái nóng thì... không khác gì Sài Gòn lắm.',
    images: [],
  },

  // ── MUỐN ĐI ──────────────────────────────────────────────

  {
    id: 'hoian',
    name: 'Hội An',
    country: 'Việt Nam',
    coordinates: [108.3380, 15.8801],
    status: 'wishlist',
    note: 'Nghe kể đẹp lắm về đêm. Chưa có dịp đi.',
  },
  {
    id: 'phuquoc',
    name: 'Phú Quốc',
    country: 'Việt Nam',
    coordinates: [103.9840, 10.2899],
    status: 'wishlist',
    note: 'Muốn đi một lần xem biển đảo thế nào.',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Nhật Bản',
    coordinates: [139.6917, 35.6895],
    status: 'wishlist',
    note: 'Trên danh sách từ lâu. Muốn trải nghiệm Tokyo vào mùa thu lá đỏ.',
  },
];
