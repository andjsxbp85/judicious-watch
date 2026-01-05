export interface Domain {
  id: string;
  url: string;
  domain: string;
  status: "judol" | "non-judol";
  confidenceScore: number;
  screenshot: string;
  screenshots?: string[]; // Multiple screenshots for carousel
  extractedContent: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  crawledAt: string;
  keywords: string[];
  aiReasoning: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "verifikator";
  createdAt: string;
  lastLogin: string | null;
  verificationsCount: number;
}

export interface TrendData {
  date: string;
  judol: number;
  nonJudol: number;
}

export interface VerifikatorStats {
  name: string;
  count: number;
}

// Mock domains data
export const mockDomains: Domain[] = [
  {
    id: "1",
    url: "https://slot-gacor-123.com/play",
    domain: "slot-gacor-123.com",
    status: "judol",
    confidenceScore: 95,
    screenshot: "/screenshots/gambling_1.png",
    screenshots: [
      "/screenshots/gambling_1.png",
      "/screenshots/gambling_2.png",
      "/screenshots/gambling_3.png",
    ],
    extractedContent:
      "Selamat datang di Slot Gacor 123! Mainkan ratusan game slot online terpercaya. Bonus new member 100%, deposit minimal 10rb. RTP tertinggi, jackpot hingga miliaran rupiah. Daftar sekarang dan menangkan hadiah besar! Slot pragmatic, PG Soft, Habanero tersedia...",
    verifiedBy: "Ahmad Verifikator",
    verifiedAt: "2026-01-05T10:30:00Z",
    crawledAt: "2026-01-05T08:00:00Z",
    keywords: ["slot online", "judi", "deposit", "jackpot", "RTP", "bonus"],
    aiReasoning:
      'Website ini terdeteksi sebagai situs judi online karena mengandung kata kunci seperti "slot online", "deposit", "jackpot", dan "RTP". Konten mempromosikan permainan slot dengan bonus dan hadiah uang tunai, yang merupakan karakteristik khas situs perjudian online.',
  },
  {
    id: "2",
    url: "https://berita-teknologi.id/artikel",
    domain: "berita-teknologi.id",
    status: "non-judol",
    confidenceScore: 98,
    screenshot:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
    extractedContent:
      "Berita Teknologi Indonesia - Portal berita teknologi terkini. Artikel tentang startup, gadget terbaru, AI, dan transformasi digital Indonesia. Update harian dari dunia teknologi...",
    verifiedBy: "Budi Verifikator",
    verifiedAt: "2026-01-05T09:15:00Z",
    crawledAt: "2026-01-05T07:30:00Z",
    keywords: ["berita", "teknologi", "startup", "gadget"],
    aiReasoning:
      "Website ini adalah portal berita teknologi yang sah. Tidak ditemukan indikasi konten perjudian. Konten fokus pada berita teknologi, startup, dan gadget.",
  },
  {
    id: "3",
    url: "https://togel-hk-sgp.net/result",
    domain: "togel-hk-sgp.net",
    status: "judol",
    confidenceScore: 92,
    screenshot:
      "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=800&h=600&fit=crop",
    extractedContent:
      "Togel HK SGP Sydney - Hasil keluaran togel terupdate. Prediksi jitu togel hari ini, data pengeluaran HK, SGP, Sydney. Pasang togel online aman dan terpercaya. Diskon terbesar, hadiah 4D x 10.000...",
    verifiedBy: null,
    verifiedAt: null,
    crawledAt: "2026-01-05T11:00:00Z",
    keywords: ["togel", "prediksi", "keluaran", "pasang", "hadiah"],
    aiReasoning:
      'Website ini adalah situs togel online yang menyediakan hasil keluaran dan prediksi togel. Mengandung kata kunci perjudian seperti "togel", "pasang", dan menawarkan hadiah uang.',
  },
  {
    id: "4",
    url: "https://university-indonesia.ac.id",
    domain: "university-indonesia.ac.id",
    status: "non-judol",
    confidenceScore: 99,
    screenshot: "/screenshots/university_1.png",
    screenshots: [
      "/screenshots/university_1.png",
      "/screenshots/university_2.png",
    ],
    extractedContent:
      "Universitas Indonesia - Kampus terkemuka di Indonesia. Pendaftaran mahasiswa baru, program studi, penelitian, dan kegiatan akademik. Akreditasi A, ranking terbaik nasional...",
    verifiedBy: "Ahmad Verifikator",
    verifiedAt: "2026-01-05T08:45:00Z",
    crawledAt: "2026-01-05T06:00:00Z",
    keywords: ["universitas", "pendidikan", "mahasiswa", "akademik"],
    aiReasoning:
      "Website ini adalah situs resmi institusi pendidikan tinggi. Domain .ac.id menunjukkan institusi akademik Indonesia. Konten fokus pada informasi pendidikan.",
  },
  {
    id: "5",
    url: "https://casino-online-vip.xyz",
    domain: "casino-online-vip.xyz",
    status: "judol",
    confidenceScore: 97,
    screenshot:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop",
    extractedContent:
      "VIP Casino Online - Live Casino terbaik dengan dealer cantik. Baccarat, Roulette, Blackjack, Sic Bo. Bonus cashback harian, turnover mingguan. Deposit via bank lokal dan e-wallet...",
    verifiedBy: "Citra Verifikator",
    verifiedAt: "2026-01-04T16:20:00Z",
    crawledAt: "2026-01-04T14:00:00Z",
    keywords: ["casino", "live dealer", "baccarat", "deposit", "bonus"],
    aiReasoning:
      "Website ini jelas merupakan situs kasino online. Menawarkan permainan kasino live seperti Baccarat dan Roulette dengan opsi deposit uang asli.",
  },
  {
    id: "6",
    url: "https://toko-online-fashion.com",
    domain: "toko-online-fashion.com",
    status: "non-judol",
    confidenceScore: 96,
    screenshot:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    extractedContent:
      "Toko Fashion Online - Koleksi pakaian terbaru, sepatu, tas branded. Promo diskon hingga 70%, gratis ongkir seluruh Indonesia. COD tersedia...",
    verifiedBy: "Budi Verifikator",
    verifiedAt: "2026-01-04T11:30:00Z",
    crawledAt: "2026-01-04T09:00:00Z",
    keywords: ["fashion", "pakaian", "diskon", "belanja online"],
    aiReasoning:
      "Website ini adalah toko online fashion yang sah. Menjual pakaian dan aksesori, bukan konten perjudian.",
  },
  {
    id: "7",
    url: "https://poker-domino-qq.net",
    domain: "poker-domino-qq.net",
    status: "judol",
    confidenceScore: 94,
    screenshot:
      "https://images.unsplash.com/photo-1541278107931-e006523892df?w=800&h=600&fit=crop",
    extractedContent:
      "Poker Domino QQ Online - Agen poker terpercaya sejak 2015. Main poker, domino, ceme, capsa susun. Minimal deposit 25rb, withdraw cepat. Bonus referral seumur hidup...",
    verifiedBy: null,
    verifiedAt: null,
    crawledAt: "2026-01-05T12:30:00Z",
    keywords: ["poker", "domino", "deposit", "withdraw", "agen"],
    aiReasoning:
      "Website ini adalah situs judi kartu online yang menyediakan permainan poker dan domino dengan sistem deposit uang asli.",
  },
  {
    id: "8",
    url: "https://resep-masakan-indo.com",
    domain: "resep-masakan-indo.com",
    status: "non-judol",
    confidenceScore: 99,
    screenshot:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
    extractedContent:
      "Resep Masakan Indonesia - Kumpulan resep masakan tradisional dan modern. Rendang, Soto, Nasi Goreng, Bakso, dan ribuan resep lainnya. Tips memasak dari chef profesional...",
    verifiedBy: "Ahmad Verifikator",
    verifiedAt: "2026-01-05T07:00:00Z",
    crawledAt: "2026-01-05T05:00:00Z",
    keywords: ["resep", "masakan", "kuliner", "memasak"],
    aiReasoning:
      "Website ini adalah situs resep masakan yang sah. Konten fokus pada kuliner Indonesia tanpa indikasi perjudian.",
  },
  {
    id: "9",
    url: "https://sportbook-888.co",
    domain: "sportbook-888.co",
    status: "judol",
    confidenceScore: 91,
    screenshot:
      "https://images.unsplash.com/photo-1461896836934- voices-28100c?w=800&h=600&fit=crop",
    extractedContent:
      "Sportsbook 888 - Taruhan olahraga online. Bola, basket, tenis, e-sports. Odds terbaik, live betting, parlay mix. Bonus deposit 100% untuk member baru...",
    verifiedBy: "Citra Verifikator",
    verifiedAt: "2026-01-04T14:00:00Z",
    crawledAt: "2026-01-04T12:00:00Z",
    keywords: ["taruhan", "sportsbook", "betting", "odds", "bola"],
    aiReasoning:
      "Website ini adalah situs taruhan olahraga online. Menawarkan betting pada berbagai olahraga dengan sistem deposit.",
  },
  {
    id: "10",
    url: "https://kesehatan-keluarga.id",
    domain: "kesehatan-keluarga.id",
    status: "non-judol",
    confidenceScore: 98,
    screenshot:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
    extractedContent:
      "Portal Kesehatan Keluarga - Informasi kesehatan terpercaya. Artikel kesehatan, tips hidup sehat, konsultasi dokter online. Tersertifikasi HONcode...",
    verifiedBy: "Budi Verifikator",
    verifiedAt: "2026-01-05T06:30:00Z",
    crawledAt: "2026-01-05T04:00:00Z",
    keywords: ["kesehatan", "dokter", "tips sehat", "konsultasi"],
    aiReasoning:
      "Website ini adalah portal informasi kesehatan yang sah. Menyediakan artikel kesehatan dan konsultasi dokter.",
  },
];

// Mock users data
export const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    role: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    lastLogin: "2026-01-05T08:00:00Z",
    verificationsCount: 0,
  },
  {
    id: "2",
    username: "ahmad_verifikator",
    role: "verifikator",
    createdAt: "2025-06-15T00:00:00Z",
    lastLogin: "2026-01-05T10:30:00Z",
    verificationsCount: 156,
  },
  {
    id: "3",
    username: "budi_verifikator",
    role: "verifikator",
    createdAt: "2025-08-20T00:00:00Z",
    lastLogin: "2026-01-05T09:15:00Z",
    verificationsCount: 124,
  },
  {
    id: "4",
    username: "citra_verifikator",
    role: "verifikator",
    createdAt: "2025-10-01T00:00:00Z",
    lastLogin: "2026-01-04T16:20:00Z",
    verificationsCount: 89,
  },
];

// Mock trend data
export const mockTrendData: TrendData[] = [
  { date: "01 Jan", judol: 45, nonJudol: 120 },
  { date: "02 Jan", judol: 52, nonJudol: 135 },
  { date: "03 Jan", judol: 48, nonJudol: 128 },
  { date: "04 Jan", judol: 61, nonJudol: 142 },
  { date: "05 Jan", judol: 55, nonJudol: 138 },
];

// Mock verifikator stats
export const mockVerifikatorStats: VerifikatorStats[] = [
  { name: "Ahmad", count: 156 },
  { name: "Budi", count: 124 },
  { name: "Citra", count: 89 },
  { name: "Dewi", count: 67 },
  { name: "Eko", count: 45 },
];

// Statistics
export const getStatistics = () => {
  const totalUrls = mockDomains.length;
  const judolCount = mockDomains.filter((d) => d.status === "judol").length;
  const nonJudolCount = mockDomains.filter(
    (d) => d.status === "non-judol"
  ).length;
  const todayVerified = mockDomains.filter((d) => {
    if (!d.verifiedAt) return false;
    const today = new Date().toDateString();
    return new Date(d.verifiedAt).toDateString() === today;
  }).length;

  return {
    totalUrls: 1247,
    judolCount: 523,
    nonJudolCount: 724,
    todayVerified: 47,
  };
};
