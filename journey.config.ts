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
  highlight?: 'home' | 'abroad' | 'island'; // home = gắn bó lâu dài, abroad = nước ngoài, island = hải đảo
  date?: string;
  note?: string;
  images?: string[];
  videoUrl?: string;
}

export const journeyLocations: JourneyLocation[] = [
  // ── ĐÃ ĐI ────────────────────────────────────────────────

  {
    id: 'lamdong',
    name: 'Lâm Đồng',
    country: 'Việt Nam',
    coordinates: [108.4583, 11.9465],
    status: 'visited',
    highlight: 'home',
  },
  {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    coordinates: [106.6297, 10.8231],
    status: 'visited',
    highlight: 'home',
  },
  {
    id: 'hanoi',
    name: 'Hà Nội',
    country: 'Việt Nam',
    coordinates: [105.8342, 21.0278],
    status: 'visited',
  },
  {
    id: 'thanhhoa',
    name: 'Thanh Hoá',
    country: 'Việt Nam',
    coordinates: [105.7764, 19.8079],
    status: 'visited',
  },
  {
    id: 'hatinh',
    name: 'Hà Tĩnh',
    country: 'Việt Nam',
    coordinates: [105.9058, 18.3559],
    status: 'visited',
  },
  {
    id: 'khanhhoa',
    name: 'Khánh Hoà',
    country: 'Việt Nam',
    coordinates: [109.1967, 12.2388],
    status: 'visited',
  },
  {
    id: 'ninhthuan',
    name: 'Ninh Thuận',
    country: 'Việt Nam',
    coordinates: [108.9880, 11.5639],
    status: 'visited',
  },
  {
    id: 'binhthuan',
    name: 'Bình Thuận',
    country: 'Việt Nam',
    coordinates: [108.1006, 11.0904],
    status: 'visited',
  },
  {
    id: 'gialai',
    name: 'Gia Lai',
    country: 'Việt Nam',
    coordinates: [108.0000, 13.9833],
    status: 'visited',
  },
  {
    id: 'vungtau',
    name: 'Vũng Tàu',
    country: 'Việt Nam',
    coordinates: [107.0843, 10.3459],
    status: 'visited',
  },
  {
    id: 'tayninh',
    name: 'Tây Ninh',
    country: 'Việt Nam',
    coordinates: [106.0990, 11.3352],
    status: 'visited',
  },
  {
    id: 'cantho',
    name: 'Cần Thơ',
    country: 'Việt Nam',
    coordinates: [105.7469, 10.0452],
    status: 'visited',
  },
  {
    id: 'dongthap',
    name: 'Đồng Tháp',
    country: 'Việt Nam',
    coordinates: [105.6337, 10.4593],
    status: 'visited',
  },
  {
    id: 'phuquoc',
    name: 'Phú Quốc',
    country: 'Việt Nam',
    coordinates: [103.9840, 10.2899],
    status: 'visited',
  },
  {
    id: 'hungyen',
    name: 'Hưng Yên',
    country: 'Việt Nam',
    coordinates: [106.0511, 20.6464],
    status: 'visited',
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thái Lan',
    coordinates: [100.5018, 13.7563],
    status: 'visited',
    highlight: 'abroad',
  },

  {
    id: 'hoangsa',
    name: 'Quần đảo Hoàng Sa',
    country: 'Việt Nam',
    coordinates: [112.0, 16.5],
    status: 'visited',
    highlight: 'island',
  },
  {
    id: 'truongsa',
    name: 'Quần đảo Trường Sa',
    country: 'Việt Nam',
    coordinates: [114.5, 9.5],
    status: 'visited',
    highlight: 'island',
  },

  // ── MUỐN ĐI ──────────────────────────────────────────────

  {
    id: 'taxua',
    name: 'Tà Xùa',
    country: 'Việt Nam',
    coordinates: [104.2833, 21.2167],
    status: 'wishlist',
  },
  {
    id: 'phuyen',
    name: 'Phú Yên',
    country: 'Việt Nam',
    coordinates: [109.2897, 13.0882],
    status: 'wishlist',
  },
  {
    id: 'phuquy',
    name: 'Đảo Phú Quý',
    country: 'Việt Nam',
    coordinates: [108.9333, 10.5167],
    status: 'wishlist',
  },
  {
    id: 'danang',
    name: 'Đà Nẵng — Huế',
    country: 'Việt Nam',
    coordinates: [107.9000, 16.2500],
    status: 'wishlist',
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    coordinates: [115.1889, -8.4095],
    status: 'wishlist',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Nhật Bản',
    coordinates: [139.6917, 35.6895],
    status: 'wishlist',
  },
];
