# Đêm 23:47

Visual Novel tương tác về mối quan hệ Vật chất ↔ Ý thức (Triết học Mác–Lênin)

## Mô tả

Game Visual Novel ngắn gọn (10-25 phút) với 16 scene, 10 lựa chọn lớn, và 4 ending khác nhau. Người chơi sẽ dẫn dắt Minh qua 7 ngày để hiểu và vận dụng các nguyên lý triết học Mác–Lênin.

## Công nghệ

- **TypeScript** - Ngôn ngữ chính
- **Vite** - Build tool
- **PixiJS** - Rendering engine (có thể mở rộng)
- **Howler.js** - Audio system
- **localStorage** - Save/Load system

## Cài đặt

```bash
npm install
```

## Chạy development server

```bash
npm run dev
```

## Build production

```bash
npm run build
```

## Cấu trúc dự án

```
/
├── src/
│   ├── core/           # Game engine core
│   │   ├── GameEngine.ts
│   │   ├── GameState.ts
│   │   ├── SceneManager.ts
│   │   └── ConditionEvaluator.ts
│   ├── ui/             # UI components
│   │   ├── GameUI.ts
│   │   ├── DialogueBox.ts
│   │   ├── ChoiceMenu.ts
│   │   └── styles.css
│   ├── content/         # Game content
│   │   ├── scenes/     # Scene JSON files
│   │   └── SceneLoader.ts
│   ├── storage/        # Save/Load system
│   │   └── SaveManager.ts
│   ├── audio/          # Audio management
│   │   └── AudioManager.ts
│   ├── types/          # TypeScript types
│   │   └── game.ts
│   └── main.ts         # Entry point
├── content/            # Static assets (scenes JSON)
│   └── scenes/
├── assets/             # Game assets (images, audio)
│   ├── bg/
│   ├── characters/
│   ├── ui/
│   └── audio/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tính năng

### Core Features
- ✅ Game state management (5 variables: BC, TrustAI, TrustFriends, SelfEsteem, RealityAnchor)
- ✅ Scene system với JSON-based content
- ✅ Choice system với effects và conditions
- ✅ Save/Load system (localStorage)
- ✅ Dialogue system với typewriter effect
- ✅ UI overlays (timeline, variables panel, menu)
- ✅ Ending system (4 endings dựa trên BC value)

### UI Features
- Dialogue box với speaker name
- Choice menu với percentage stats
- Timeline hiển thị day/scene
- Variables panel hiển thị 5 biến chính
- Menu system (Save/Load/Settings/Log/Story Map)

### Audio (Placeholder)
- BGM system (Howler.js ready)
- SFX system (Howler.js ready)
- Audio fade/stop controls

## Scene Structure

Mỗi scene được định nghĩa trong file JSON:

```json
{
  "id": "S01",
  "title": "Day 1 — 23:47",
  "background": "bg_room_night",
  "music": "bgm_tension_chat",
  "ui": ["timeline", "chat_overlay"],
  "onEnter": [
    { "type": "playSfx", "id": "sfx_phone_vibrate" }
  ],
  "lines": [
    { "speaker": "Minh", "text": "..." }
  ],
  "choices": [
    {
      "id": "S01_C01",
      "prompt": "Bạn làm gì?",
      "options": [...]
    }
  ]
}
```

## Game Variables

- **BC** (0-100): Biện Chứng - cân bằng khách quan + chủ quan
- **TrustAI** (0-100): Mức tin vào AI/Lumen
- **TrustFriends** (0-100): Mức tin vào con người/bạn bè
- **SelfEsteem** (0-100): Tự trọng/ổn định tâm lý
- **RealityAnchor** (0-100): Bám thực tại

## Endings

- **Ending A** (BC 0-25): Fail-state tối
- **Ending B** (BC 26-50): Đau nhưng đúng
- **Ending C** (BC 51-75): Hy vọng
- **Ending D** (BC 76-100): Best ending

## Development Notes

### Thêm Scene mới

1. Tạo file JSON trong `public/content/scenes/`
2. Đảm bảo scene có `id` trùng với tên file (ví dụ: `S01.json` → `"id": "S01"`)
3. Đảm bảo scene có `nextSceneId` đúng trong choices

### Thêm Assets

Đặt assets trong thư mục `public/assets/`:
- Backgrounds: `public/assets/bg/`
- Characters: `public/assets/characters/`
- Audio: `public/assets/audio/`

### Customize UI

Chỉnh sửa `src/ui/styles.css` để thay đổi giao diện.

## License

MIT
