// src/config/initial-config.ts

export const INITIAL_APP_CONFIG = {
  superAdminPolicy: {
    subjectType: 'role',
    subjectId: 'superadmin',
    action: 'manage',
    resource: 'all',
    condition: {},
    description: 'Superadmin toàn quyền',
  },
  defaultTags: [
    // Chính trị - Xã hội
    'Chính Trị',
    'Pháp Luật',
    'Quốc Hội',
    'Đại Biểu',
    'Bầu Cử',
    'Xã Hội',
    'Dân Sinh',
    'An Ninh',
    // Quốc tế
    'Mỹ',
    'Trung Quốc',
    'Nga',
    'Ukraine',
    'NATO',
    'ASEAN',
    'EU',
    'Israel',
    'Palestine',
    // Kinh tế
    'Kinh Tế Vĩ Mô',
    'Doanh Nghiệp',
    'Startup',
    'Thị Trường',
    'Chứng Khoán',
    'Bất Động Sản',
    'Lạm Phát',
    // Công nghệ
    'Công Nghệ',
    'AI',
    'ChatGPT',
    'Blockchain',
    'Robot',
    'Big Data',
    'IoT',
    'Apple',
    'iPhone',
    'iPad',
    'MacBook',
    'Samsung',
    'Xiaomi',
    'Huawei',
    'Facebook',
    'Meta',
    'Google',
    'YouTube',
    'TikTok',
    'Elon Musk',
    'Tesla',
    'SpaceX',
    // Thể thao
    'Thể Thao',
    'Bóng Đá',
    'Ngoại Hạng Anh',
    'Champions League',
    'World Cup',
    'SEA Games',
    'Manchester United',
    'Man City',
    'Chelsea',
    'Arsenal',
    'Liverpool',
    'Ronaldo',
    'Messi',
    'Mbappe',
    'Thể Thao Điện Tử',
    'Liên Quân',
    'Liên Minh Huyền Thoại',
    'Dota 2',
    'CSGO',
    // Giải trí
    'Giải Trí',
    'Âm Nhạc',
    'Điện Ảnh',
    'Phim Chiếu Rạp',
    'Netflix',
    'Kpop',
    'Blackpink',
    'BTS',
    'Người Nổi Tiếng',
    'Sao Việt',
    'Truyền Hình Thực Tế',
    'Showbiz',
    // Sức khỏe
    'Sức Khỏe',
    'Y Tế',
    'Dinh Dưỡng',
    'Bệnh Viện',
    'Dịch Bệnh',
    'Covid-19',
    'Sức Khỏe Tinh Thần',
    // Giáo dục
    'Giáo Dục',
    'Thi Đại Học',
    'Điểm Chuẩn',
    'Học Sinh',
    'Sinh Viên',
    'Đại Học Bách Khoa',
    'Du Học',
    // Du lịch
    'Du Lịch',
    'Review Điểm Đến',
    'Ẩm Thực',
    'Hạ Long',
    'Sa Pa',
    'Đà Nẵng',
    'Phú Quốc',
    'Paris',
    'Tokyo',
    // Khoa học
    'Khoa Học',
    'Vũ Trụ',
    'NASA',
    'Kính Viễn Vọng James Webb',
    'Phát Minh',
    'Y Học Hiện Đại',
    // Văn hóa
    'Văn Hóa',
    'Phong Tục Tập Quán',
    'Nghệ Thuật',
    'Tranh Đông Hồ',
    'Lễ Hội Truyền Thống',
    // Giao thông - Xe
    'Giao Thông',
    'Tắc Đường',
    'Tai Nạn',
    'Xe Cộ',
    'Ôtô',
    'Xe Máy',
    'VinFast',
    'Ô Tô Điện',
    'Đánh Giá Xe',
    // Địa phương
    'Đông Anh',
    'Hà Nội',
    'TP HCM',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    // Bổ trợ
    'Tin Nhanh',
    'Phân Tích',
    'Phóng Sự',
    'Video',
    'Trực Tiếp',
    'Breaking News',
  ],
  superAdminUser: {
    email: 'superadmin@hari.com',
    password: '123qwe', // Mật khẩu mặc định, sẽ được hash trong code
    name: 'Super Admin',
    role: 'superadmin',
    isActive: true,
    isVerified: true,
    status: 'active',
  },
  defaultCategories: [
    {
      name: 'Thời sự',
      description:
        'Tin tức nóng hổi về chính trị, pháp luật, xã hội và các vấn đề trong nước.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703324/GettyImages-686732223_dybink.jpg',
    },
    {
      name: 'Thế giới',
      description:
        'Cập nhật tin tức quốc tế, quan hệ quốc tế và các sự kiện toàn cầu.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703563/world-news-background-which-can-be-used-for-broadcast-news_qzihaw.jpg',
    },
    {
      name: 'Kinh tế',
      description: 'Tin tức về kinh tế, tài chính, doanh nghiệp và thị trường.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703594/price-chart-1_cj2dnv.jpg',
    },
    {
      name: 'Công nghệ',
      description:
        'Các tin tức về công nghệ, đổi mới sáng tạo và xu hướng kỹ thuật số.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703662/360_F_308697506_9dsBYHXm9FwuW0qcEqimAEXUvzTwfzwe_po946h.jpg',
    },
    {
      name: 'Thể thao',
      description: 'Tin tức, sự kiện, phân tích và lịch thi đấu thể thao.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703765/Choosing-the-Best-Sports-for-Your-Kids-Development_y1j7pd.jpg',
    },
    {
      name: 'Giải trí',
      description:
        'Tin tức về âm nhạc, điện ảnh, người nổi tiếng và văn hóa đại chúng.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703841/entertainment-band-music_hjbegi.jpg',
    },
    {
      name: 'Sức khỏe',
      description:
        'Thông tin về y tế, dinh dưỡng, lối sống và sức khỏe tinh thần.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703886/107182c8-en_qpkrnb.jpg',
    },
    {
      name: 'Giáo dục',
      description:
        'Tin tức và thông tin về giáo dục, học tập và phát triển kỹ năng.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703933/1231313_726266_box1_magazine_adf05b.jpg',
    },
    {
      name: 'Du lịch',
      description:
        'Tin tức, điểm đến và kinh nghiệm du lịch trong nước và quốc tế.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753703983/beautiful-girl-red-bikini-boat-koh-phi-phi-island-thailand_335224-1384_oquk6t.jpg',
    },
    {
      name: 'Khoa học',
      description:
        'Khám phá về vũ trụ, khoa học tự nhiên và các phát minh mới.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753704057/1200x680_sc_ici-nord-rame-netascience-4000x1000_ksy2rq.webp',
    },
    {
      name: 'Văn hóa',
      description:
        'Thông tin về di sản, nghệ thuật, phong tục và giao lưu văn hóa.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753704167/Baxkzele83mgrc6uIc_wTYxy6wVsJX3CB3sJs16dG6dDML0GsmTscS2H1-ouhCFVySGkkKBsO4NekfHFsqqpaoMaQZuE2H6KCMR7H_cImq8wfduntxCCnsLTdyCYKn2-DwN4_CL0_gawmri.png',
    },
    {
      name: 'Giao thông',
      description: 'Tin tức và chính sách về giao thông, quy hoạch hạ tầng.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753704338/nut-giao-nga-tu-so-6795_ijwtq5.jpg',
    },
    {
      name: 'Xe',
      description: 'Tin tức, đánh giá và công nghệ liên quan đến xe cộ.',
      coverImage:
        'https://res.cloudinary.com/haricorp/image/upload/v1753704251/Passenger-Vehicle-desktop_bunpgs.jpg',
    },
  ],
};
