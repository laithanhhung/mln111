// Vietnamese localization strings
export const vi = {
  // Menu
  menu: {
    new: 'Mới',
    continue: 'Tiếp tục',
    save: 'Lưu',
    load: 'Tải',
    settings: 'Cài đặt',
    log: 'Nhật ký thoại',
    storyMap: 'Sơ đồ truyện',
    statistics: 'Thống kê lựa chọn',
    auto: 'Tự động',
    skip: 'Bỏ qua',
    quit: 'Thoát',
    close: 'Đóng',
  },
  
  // Messages
  messages: {
    gameSaved: 'Đã lưu game!',
    saveFailed: 'Lưu thất bại!',
    gameLoaded: 'Đã tải game!',
    noSaveFound: 'Không tìm thấy file lưu!',
    comingSoon: 'Sẽ sớm có mặt!',
    logEntries: (count: number) => `Nhật ký: ${count} mục`,
  },
  
  // Endings
  endings: {
    A: 'Kết thúc A: Trạng thái thất bại — Chọn ảo/thoát ly',
    B: 'Kết thúc B: Đau nhưng đúng — Dựa đường tắt/ảo tưởng',
    C: 'Kết thúc C: Hy vọng — Bắt đầu sống biện chứng',
    D: 'Kết thúc D: Tốt nhất — Cân bằng công cụ AI + kết nối thật',
  },
  
  // Variables
  variables: {
    BC: 'Biện Chứng',
    TrustAI: 'Tin AI',
    TrustFriends: 'Tin Bạn',
    SelfEsteem: 'Tự Trọng',
    RealityAnchor: 'Bám Thực Tại',
  },
  
  // Save slots
  saveSlot: (index: number) => `Lưu ${index + 1}`,
  savePreview: (sceneId: string, lineIndex: number) => `${sceneId} - Dòng ${lineIndex}`,
};
