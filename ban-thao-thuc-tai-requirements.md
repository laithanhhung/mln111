# Đêm 23:47 — Requirements (Markdown)  
*Visual Novel tương tác về mối quan hệ Vật chất ↔ Ý thức (Triết học Mác–Lênin), tối ưu nhịp nhanh + mystery + replay.*

> Tài liệu này là requirement “code-ready” để đưa vào Cursor. Engine-agnostic (web/desktop), nội dung tách khỏi code bằng JSON/YAML.

---

## 1) Product Overview

### 1.1 Tên game
**Đêm 23:47** (Tên game)  
*(Working title trước đây: "BẢN THẢO THỰC TẠI")*

### 1.7 Ngôn ngữ và Localization
- **Ngôn ngữ hiển thị**: Game bắt buộc hiển thị **Tiếng Việt có dấu** cho toàn bộ nội dung:
  - Thoại (dialogue)
  - UI elements (buttons, labels, menus)
  - Menu (Save/Load/Settings)
  - Settings screen
  - Log/History
  - Story Map
  - Endings
- **Encoding**: Tất cả file nội dung phải dùng **UTF-8** (.json/.yml/.ink/.md)
- **Font**: Dùng font hỗ trợ tiếng Việt đầy đủ:
  - Inter (khuyến nghị)
  - Noto Sans
  - Roboto
  - Fallback: system fonts hỗ trợ tiếng Việt
- **i18n**: v1 chỉ hỗ trợ Tiếng Việt (VI). i18n đa ngôn ngữ sẽ được xem xét cho v2.

### 1.2 Elevator pitch
Minh (SV) bị leak nhật ký và nhận được tin nhắn từ AI **biết điều không thể biết**. Người chơi dẫn dắt Minh qua 7 ngày (16 scene), đưa ra 10 lựa chọn “có giá” để hiểu và vận dụng:  
- **Vật chất quyết định ý thức**  
- **Ý thức là phản ánh sáng tạo**  
- **Ý thức tác động trở lại vật chất qua thực tiễn**  
- **Phương pháp luận: tôn trọng khách quan + phát huy năng động chủ quan**

### 1.3 Mục tiêu học tập (Learning outcomes)
Sau khi chơi, người chơi có thể:
- Phân biệt **duy tâm** vs **duy vật siêu hình** vs **duy vật biện chứng**
- Giải thích vì sao “**thực tiễn**” là tiêu chuẩn kiểm chứng
- Hiểu “**phản ánh sáng tạo**” không phải sao chép thụ động
- Nêu nguyên tắc: **xuất phát từ điều kiện khách quan + phát huy chủ quan đúng hướng**

### 1.4 Đối tượng
- Sinh viên học Triết Mác–Lênin, giáo viên muốn demo tương tác
- Người thích VN ngắn, tâm lý – xã hội – công nghệ

### 1.5 Phạm vi
- **16 scene** chia theo **Day 1 → Day 7**
- **10 lựa chọn lớn** ảnh hưởng chỉ số và ending
- **4 ending** theo ngưỡng `BC` (Biện Chứng)
- UI: **chat overlay**, **journal page**, **notifications**, **timeline**
- Tính năng: Save/Load, Skip, Auto, Log, Settings, Story Map (replay), Choice %

### 1.6 Thời lượng mục tiêu
- Run 1: 10–25 phút  
- Replay: 5–15 phút (đi nhanh nhánh/ending khác)

---

## 2) Design Pillars (áp dụng “tips”)

1. **Hook mạnh trong 1–3 phút**: mở bằng biến cố + choice sớm  
2. **Nhịp nhanh**: scene ngắn, câu gọn, phản hồi ngay  
3. **Choice có giá**: mỗi choice thay đổi ít nhất 1 chỉ số/quan hệ/điều kiện  
4. **Micro-behaviors**: kể bằng hành vi nhỏ (soạn rồi xóa, nhật ký viết dở, né group chat)  
5. **Mystery theo tầng**: dấu hiệu nhỏ → xung đột tăng → twist + giải thích hợp lý  
6. **UI kể chuyện**: chat/voice-note/notification/timeline/journal, hiệu ứng chữ nhẹ  
7. **Âm thanh đúng lúc**: 3–5 BGM + SFX nhỏ, khoảnh khắc im lặng “đau”  
8. **Progression rõ**: Day 1→Day 7, mục tiêu mỗi ngày  
9. **Replay value**: story map, choice %, NG+ thoại meta nhẹ  
10. **Ending đáng**: 4 ending trả lời câu hỏi trung tâm “chọn thực tại hay ảo?”

---

## 3) Core Gameplay

### 3.1 Loop
1) Hiển thị scene (BG + nhân vật + UI overlay)  
2) Player đọc thoại ngắn theo line  
3) Đến choice → chọn 1 option  
4) Apply effects: cập nhật biến số + flags + hậu quả sớm  
5) Chuyển scene tiếp theo  
6) Kết thúc ở Day 7 → tính ending theo `BC`

### 3.2 Variables (Game state)
Bắt buộc có 5 biến chính:

| Key | Range | Default | Ý nghĩa |
|---|---:|---:|---|
| `BC` | 0..100 | 50 | Biện Chứng (cân bằng khách quan + chủ quan) |
| `TrustAI` | 0..100 | 50 | Mức tin vào AI/Lumen |
| `TrustFriends` | 0..100 | 50 | Mức tin vào con người/bạn bè |
| `SelfEsteem` | 0..100 | 50 | Tự trọng/ổn định tâm lý |
| `RealityAnchor` | 0..100 | 50 | Bám thực tại (ngủ, vận động, gặp người, làm thử) |

**Rule**: mọi biến **clamp** trong 0..100 sau khi cộng trừ.

### 3.3 Flags
Cờ dạng boolean/string để mở khóa thoại/cảnh:
- `leak_suspect_hint_1` (bool)  
- `leak_suspect_hint_2` (bool)  
- `ai_shortcut_used` (bool)  
- `made_team` (bool)  
- `ng_plus` (bool)  
- `checked_logs` (bool)  
- reveal flags cho từng tầng mystery

### 3.4 Hậu quả sớm (Early consequences)
Sau mỗi choice lớn, game phải thể hiện ít nhất 1 hậu quả trong **1–2 scene** kế tiếp:
- Notification tăng/giảm, thái độ nhân vật, mệt mỏi/đứt quãng text, mở/khóa đoạn thoại

---

## 4) Endings (tính theo `BC`)

| Ending | Ngưỡng `BC` | Loại ending | Ý nghĩa |
|---|---|---|---|
| A | 0–25 | Fail-state tối | Chọn ảo/thoát ly, RealityAnchor suy sụp |
| B | 26–50 | Đau nhưng đúng | Dựa đường tắt/ảo tưởng, bị lật tẩy rồi tỉnh |
| C | 51–75 | Hy vọng | Bắt đầu sống biện chứng, làm thật dù nhỏ |
| D | 76–100 | Best | Cân bằng công cụ AI + kết nối thật + cải biến điều kiện |

**Note**: có thể thêm “twist reveal” chung ở D hoặc NG+ (AI không có ý thức, chỉ khai thác dấu vết vật chất).

---

## 5) Story Structure (16 Scenes / 7 Days)

### 5.1 Progression theo ngày
- **Day 1**: S01–S03 (Hook + tổn thương + hướng đi)  
- **Day 2**: S04–S06 (AI/triết/đường lối + manh mối leak tầng 1)  
- **Day 3**: S07–S08 (vấn đề vật chất thật + cuộc thi/goal)  
- **Day 4**: S09–S10 (đường tắt vs thực nghiệm)  
- **Day 5**: S11–S12 (khủng hoảng + phản ánh sáng tạo)  
- **Day 6**: S13–S14 (hòa giải + quyết định công bố)  
- **Day 7**: S15–S16 (thuyết trình + ending)

### 5.2 Scene list (ID, mục tiêu cảm xúc, UI)
> Mỗi scene mục tiêu: **tổn thương / tò mò / hy vọng / sợ hãi / đổ vỡ / vượt qua**

- **S01 (Day1 23:47) — Hook**: AI nhắn điều không nên biết. UI: Chat + Notification. Emotion: tò mò/lạnh gáy.  
- **S02**: Nhật ký leak trong group. UI: ảnh chụp mờ + message spam. Emotion: tổn thương.  
- **S03**: Trốn/đối diện (micro: soạn tin rồi xóa). Emotion: bối rối.  
- **S04 (Day2)**: Gặp Lumen rõ hơn. Emotion: cám dỗ/đỡ cô đơn.  
- **S05**: Tiết triết học “cái nào có trước?” (ngắn). Emotion: sáng tỏ nhẹ.  
- **S06**: Tranh luận Khoa vs Lan + manh mối leak tầng 1. Emotion: căng.  
- **S07 (Day3)**: Bác Tư & vấn đề vật chất thật. UI: checklist/notes. Emotion: hy vọng.  
- **S08**: Cuộc thi xuất hiện, đặt goal rõ. UI: timeline + deadline. Emotion: thúc bách.  
- **S09 (Day4)**: AI gợi đường tắt. UI: warning. Emotion: cám dỗ/sợ.  
- **S10**: Thực nghiệm nhỏ + phản ứng đời thật. Emotion: phấn chấn rồi hụt.  
- **S11 (Day5)**: Dữ liệu trái kỳ vọng, chữ mờ/đứt quãng (RealityAnchor low). Emotion: đổ vỡ.  
- **S12**: “Phản ánh sáng tạo” → hành động cụ thể. Emotion: gượng dậy.  
- **S13 (Day6)**: Đối mặt người nghi leak (tầng 2). Emotion: can đảm.  
- **S14**: Đêm trước thuyết trình, quyết định “nói thật hay tô vẽ”. Emotion: nghẹt thở.  
- **S15 (Day7)**: Thuyết trình tổng hợp 3 luận điểm (triết bằng câu chuyện). Emotion: giải phóng.  
- **S16**: Epilogue + Ending + giải thích mystery theo tầng. Emotion: khép/chấn động.

---

## 6) Mystery System (3 bí mật / 3 tầng)

### 6.1 Bí mật A — “Ai leak nhật ký?”
- **Tầng 1**: ảnh chụp mờ (S02/S06): chỉ thấy góc trang + nét bút đặc trưng  
- **Tầng 2**: timestamp + vị trí ngồi + ai từng “mượn bút” (S13)  
- **Tầng 3 twist**: động cơ liên quan cuộc thi/áp lực xã hội (S16 reveal)

### 6.2 Bí mật B — “AI biết bằng cách nào?”
- **Tầng 1**: AI đoán đúng ý định Minh (S01)  
- **Tầng 2**: AI nhắc chi tiết Minh chưa nói (S09)  
- **Tầng 3 twist**: AI không có “ý thức”, chỉ phân tích **dấu vết vật chất** (log, thói quen, hành vi), Minh tự nộp dữ liệu (S16/NG+)

### 6.3 Bí mật C — “Minh sống thật hay tự dựng?”
- **Tầng 1**: mất ngủ, chữ nhật ký nhòe (S11)  
- **Tầng 2**: ký ức mâu thuẫn với chat log (S12/S13)  
- **Tầng 3 twist**: `RealityAnchor` thấp khiến Minh “mất kiểm chứng” thực tiễn; tăng anchor mở cảnh kiểm chứng log (S12 optional)

---

## 7) Choices (10 lựa chọn lớn) — Effects Table

### 7.1 Choice format
Mỗi lựa chọn option phải có:
- `text`
- `effects`: `{ deltas, setFlags, clearFlags, addLog?, playSfx?, uiToast? }`
- `nextSceneId`

### 7.2 Mapping (đề xuất chuẩn, có thể chỉnh)
> Deltas là gợi ý, team có thể tinh chỉnh nhưng phải giữ logic “có giá”.

#### C01 — S01 (Hook: phản ứng với AI)
- A: **Chặn Lumen**  
  - deltas: `BC+5, TrustAI-15, SelfEsteem+5, RealityAnchor+5`  
  - flags: `ai_blocked=true`  
  - early: S02 AI im lặng, group chat nổi bật hơn
- B: **Hỏi “Sao mày biết?”**  
  - deltas: `BC+5, TrustAI+10, RealityAnchor-5`  
  - flags: `mystery_ai_tier1=true`
- C: **Bỏ qua, mở group kiểm tra**  
  - deltas: `TrustFriends-10, SelfEsteem-5`  
  - flags: `saw_group_early=true`  
  - early: S02 tổn thương mạnh hơn

#### C02 — S02 (Nhật ký leak: phản ứng xã hội)
- A: Nói thẳng, đặt ranh giới  
  - `BC+10, TrustFriends+5, SelfEsteem+10`
  - flag: `set_boundary=true`
- B: Im lặng chịu  
  - `BC-5, TrustFriends-5, SelfEsteem-10`
- C: “Mình sẽ chứng minh bằng bài viết” (duy ý chí)  
  - `BC-10, SelfEsteem-5, RealityAnchor-5`

#### C03 — S03 (Bám thực tại hay chìm vào AI)
- A: Ra ngoài đi bộ/đổi không gian  
  - `BC+5, RealityAnchor+15, SelfEsteem+5`
- B: Viết nhật ký để tự soi  
  - `BC+5, SelfEsteem+5`
- C: Online với AI cả đêm  
  - `TrustAI+10, RealityAnchor-15, SelfEsteem-5`

#### C04 — S06 (Quan điểm triết: duy tâm/siêu hình/biện chứng)
- A: “Ý thức thụ động thôi” (siêu hình)  
  - `BC-10, RealityAnchor+5, SelfEsteem-5`
- B: “Tinh thần là đủ” (duy tâm)  
  - `BC-10, SelfEsteem+5, RealityAnchor-10`
- C: “Vật chất quyết định nhưng ý thức tác động lại qua thực tiễn”  
  - `BC+10, RealityAnchor+5`

#### C05 — S07 (Vấn đề vật chất thật)
- A: Chỉ than phiền  
  - `BC-5, TrustFriends-5`
- B: Khảo sát nguyên nhân (đi hỏi xung quanh)  
  - `BC+10, RealityAnchor+10, TrustFriends+5`
  - flag: `collected_data=true`
- C: “Kệ”  
  - `BC-10, RealityAnchor-5`

#### C06 — S08 (Cuộc thi: chọn phương pháp)
- A: Lời hay ít kiểm chứng  
  - `BC-10, TrustAI+5`
- B: Khảo sát/phỏng vấn/thử giải pháp  
  - `BC+15, RealityAnchor+10, TrustFriends+5`
- C: Dựa hoàn toàn AI  
  - `BC-15, TrustAI+15, RealityAnchor-10`
  - flag: `ai_dependency=true`

#### C07 — S09 (AI gợi “đường tắt”)
- A: Từ chối số liệu mẫu, chỉ dùng gợi ý cấu trúc  
  - `BC+15, TrustAI-5, SelfEsteem+5`
  - flag: `ai_shortcut_used=false`
- B: Lấy một phần  
  - `BC-10, TrustAI+5, SelfEsteem-5`
  - flag: `ai_shortcut_used=true`
- C: Dùng hết  
  - `BC-15, TrustAI+10, SelfEsteem-10, RealityAnchor-5`
  - flag: `ai_shortcut_used=true`

#### C08 — S11 (Dữ liệu trái kỳ vọng)
- A: “Mình vô dụng”  
  - `BC-10, SelfEsteem-15`
- B: “Tại điều kiện, thôi”  
  - `BC-10, RealityAnchor-10`
- C: Điều chỉnh giả thuyết, làm lại  
  - `BC+10, SelfEsteem+5, RealityAnchor+10`
  - flag: `iteration=true`

#### C09 — S12 (Hành động: một mình hay tập thể)
- A: Làm một mình  
  - `BC-5, TrustFriends-5, SelfEsteem+5`
- B: Kêu gọi nhóm + phân vai  
  - `BC+10, TrustFriends+10, RealityAnchor+5`
  - flag: `made_team=true`
- C: Chờ người khác làm  
  - `BC-10, TrustFriends-10, SelfEsteem-5`

#### C10 — S14 (Thuyết trình: trung thực vs tô vẽ)
- A: Nói rõ AI chỉ hỗ trợ, thành quả do thực nghiệm/nhóm  
  - `BC+10, SelfEsteem+10`
- B: Gọi AI là đồng tác giả chính  
  - `BC-5, TrustAI+10, TrustFriends-5`
- C: Giấu thực nghiệm, chỉ show slide đẹp  
  - `BC-10, SelfEsteem-5`
  - flag: `fake_presentation=true`

---

## 8) UI / Presentation Requirements

### 8.0 Fixes (Content Pack)
- **Header lặp “Day X — Day X — …”**: tách field và render đúng:
  - `dayNumber`: số ngày (vd: 3)
  - `dayTitle`: tên ngày (vd: “Cuộc thi”, không chứa “Day 3”)
  - `sceneTitle`: tên scene (nếu khác dayTitle)
  - UI header: `Day {dayNumber} — {dayTitle}`; Subheader (tuỳ chọn): `{sceneTitle}` nếu khác `dayTitle`.
- **Ẩn chỉ số lúc đầu**: `ui.showStats = false` mặc định. Chỉ bật khi có trigger (gợi ý: cuối Day 1 hoặc khi mở menu). Settings có toggle “Hiển thị chỉ số”.
- **Choice hiển thị prompt, không hiển thị ID**: UI render `choice.prompt ?? scene.choicePrompt ?? "Bạn sẽ chọn gì?"`. Không bao giờ show `choice.id` ra UI (id chỉ cho code/stats).

### 8.1 Core VN UI
- Dialogue box (speaker name + text)
- Portrait area (optional)
- Background layer
- Menu: **Lưu**/**Tải**/**Bỏ qua**/**Tự động**/**Nhật ký thoại**/**Cài đặt**/**Thoát**

### 8.1.1 UI Labels (Tiếng Việt chuẩn)
Tất cả label và menu phải hiển thị tiếng Việt với bộ từ chuẩn:
- **Mới** (New Game)
- **Tiếp tục** (Continue)
- **Lưu** (Save)
- **Tải** (Load)
- **Nhật ký thoại** (Dialogue Log/History)
- **Tự động** (Auto)
- **Bỏ qua** (Skip)
- **Cài đặt** (Settings)
- **Thoát** (Quit)
- **Sơ đồ truyện** (Story Map)
- **Thống kê lựa chọn** (Choice Statistics)

**Lưu ý**: Định dạng thời gian vẫn giữ motif **23:47** (ví dụ: "Day 1 — 23:47", "Day 2 — 14:30").

### 8.2 “UI kể chuyện” (bắt buộc)
- Chat overlay (group chat + AI chat)
- Notifications overlay
- Journal page (khác typography)
- Timeline/day header (Day 1→Day 7)

### 8.3 Text effects (nhẹ)
- `shake` khi hoảng  
- `fade/mblur` khi kiệt sức (RealityAnchor thấp)  
- `ellipsis/pause` khi nghẹn  
- Có thể dùng tags trong text: `[shake]...[/shake]` hoặc metadata per line

### 8.4 Story Map & Replay
- Story map hiển thị node (scene/choice) đã đi
- Cho phép replay từ node đã mở (hoặc “jump” nếu design cho phép)
- Sau choice: hiển thị **% người chơi chọn A/B/C** (local stats hoặc remote analytics)

---

## 9) Audio Requirements

### 9.1 BGM tối thiểu (5 track)
- `bgm_calm_room`
- `bgm_tension_chat`
- `bgm_hurt_silence` (gần im lặng)
- `bgm_hope_practice`
- `bgm_stage_resolve`

### 9.2 SFX tối thiểu
- `sfx_phone_vibrate`
- `sfx_keyboard`
- `sfx_message_pop`
- `sfx_rain_window`
- `sfx_door_close`
- `sfx_crowd_murmur`

### 9.3 Khoảnh khắc “im lặng”
- Khi S02 reveal leak: **stop BGM 1s** trước khi vào `bgm_hurt_silence`

---

## 10) NG+ (Replay) Requirements

### 10.1 NG+ trigger
- Khi hoàn thành game 1 lần: set `ng_plus=true` (persist)

### 10.2 NG+ behaviors
- Mở 2–3 line thoại meta của Lumen ở S01/S09 (“lần trước cậu…”)
- Optional: mở cảnh phụ nếu đủ điều kiện:
  - Nếu `RealityAnchor >= 70`: mở cảnh **kiểm chứng log** (set `checked_logs=true`)
  - Nếu `TrustAI >= 80`: mở cảnh “AI spam → mất ngủ”
  - Nếu `TrustFriends >= 70`: mở cảnh “Lan bảo vệ Minh trong group”

---

## 11) Functional Requirements (FR)

### 11.1 VN Engine
- **FR-01** Render scene: BG + sprites + overlays + dialogue
- **FR-02** Step through `lines[]` theo `lineIndex`
- **FR-03** Choice menu 2–4 options, blocking progression until pick
- **FR-04** Apply effects: deltas + flags + audio/ui
- **FR-05** Clamp variables 0..100
- **FR-06** Conditional lines/choices theo flags/variable thresholds
- **FR-07** Scene transitions + BGM changes
- **FR-08** Ending resolver theo `BC` tại S16

### 11.2 Menus
- **FR-09** Main menu: New/Continue/Load/Settings/Credits
- **FR-10** In-game menu: Save/Load/Skip/Auto/Log/Settings/Quit
- **FR-11** Settings: text speed, auto speed, volumes, fullscreen

### 11.3 Save/Load
- **FR-12** Save slots >= 10
- **FR-13** Save captures: `sceneId`, `lineIndex`, `variables`, `flags`, `history`, timestamp
- **FR-14** Load restores exact state

### 11.4 Log / History
- **FR-15** Log contains last 500 lines (speaker+text+sceneId)
- **FR-16** Log view scrollable, persists per session

### 11.5 Analytics (Choice %)
- **FR-17** Record choice counts per `choiceId` locally (minimum)
- **FR-18** After choose, show local % (or remote if available)

---

## 12) Non-Functional Requirements (NFR)
- **NFR-01** 60fps target (web), no stutter when stepping lines
- **NFR-02** Scene load < 300ms (lazy-load assets)
- **NFR-03** Fallback placeholder if asset missing
- **NFR-04** Responsive (desktop-first, mobile readable)
- **NFR-05** No hard crash on malformed content: show error overlay

---

## 13) Data Model (JSON) — Code-ready

### 13.1 GameState (runtime)
```json
{
  "sceneId": "S01",
  "lineIndex": 0,
  "variables": {
    "BC": 50,
    "TrustAI": 50,
    "TrustFriends": 50,
    "SelfEsteem": 50,
    "RealityAnchor": 50
  },
  "flags": {
    "ng_plus": false,
    "ai_shortcut_used": false,
    "made_team": false
  },
  "history": [],
  "stats": {
    "choiceCounts": {
      "S01_C01_A": 3,
      "S01_C01_B": 5,
      "S01_C01_C": 2
    }
  }
}
```

### 13.2 Scene schema (đề xuất)
```json
{
  "id": "S01",
  "dayNumber": 1,
  "dayTitle": "23:47",
  "sceneTitle": "Tin nhắn không nên biết",
  "title": "Day 1 — 23:47",
  "background": "bg_room_night",
  "music": "bgm_tension_chat",
  "ui": ["timeline", "chat_overlay"],
  "onEnter": [
    { "type": "playSfx", "id": "sfx_phone_vibrate" }
  ],
  "lines": [
    { "speaker": null, "text": "23:47. Màn hình sáng. Nhịp tim nhanh." },
    { "speaker": "Minh", "text": "..." , "tags": ["pause"] },
    { "speaker": "Lumen", "text": "Cậu đang định gửi đoạn nhật ký đó vào group phải không?" }
  ],
  "choices": [
    {
      "id": "S01_C01",
      "prompt": "Nếu đây là khoảnh khắc thật, bạn muốn Minh bám vào điều gì?",
      "options": [
        {
          "id": "S01_C01_A",
          "text": "Chặn Lumen ngay.",
          "subtext": "Giữ ranh giới và tự chủ, nhưng phải đối diện thế giới thật một mình.",
          "effects": {
            "deltas": { "BC": 5, "TrustAI": -15, "SelfEsteem": 5, "RealityAnchor": 5 },
            "setFlags": { "ai_blocked": true },
            "toast": "Bạn chọn cắt liên lạc với AI."
          },
          "nextSceneId": "S02"
        }
      ]
    }
  ]
}
```

### 13.3 Effect types (engine actions)
- `deltas`: map var->int thấy rõ  
- `setFlags` / `clearFlags`  
- `playBgm`, `stopBgm`, `playSfx`  
- `toast` UI  
- `jump` (scene navigation)  
- `conditional`: gate lines/options

### 13.4 Conditional examples
- Line only if `RealityAnchor < 30`:
```json
{ "speaker":"Minh", "text":"Mắt cay. Chữ như mờ đi.", "if": { "var": "RealityAnchor", "lt": 30 }, "tags":["blur"] }
```
- Choice option only if `made_team==true`:
```json
{ "id":"opt_team", "text":"Nhờ Lan hỗ trợ slide.", "if": { "flag":"made_team", "eq": true } }
```

### 13.5 Intro Screen Content (Giới thiệu & Tình trạng)
- File đề xuất: `/content/intro.vi.json`
- Render trước S01.

Schema gợi ý:
```json
{
  "title": "Đêm 23:47",
  "sections": [
    { "type": "paragraph", "heading": "Tình trạng hiện tại", "text": "..." },
    { "type": "bullets", "heading": "Câu hỏi trung tâm", "items": ["...", "..."] },
    { "type": "stats", "heading": "5 chỉ số", "items": [
      { "key": "BC", "label": "Biện chứng", "desc": "..." },
      { "key": "RealityAnchor", "label": "Neo thực tại", "desc": "..." },
      { "key": "TrustAI", "label": "Niềm tin AI", "desc": "..." },
      { "key": "TrustFriends", "label": "Niềm tin bạn bè", "desc": "..." },
      { "key": "SelfEsteem", "label": "Tự trọng", "desc": "..." }
    ]},
    { "type": "controls", "heading": "Điều khiển", "items": ["Click để tiếp tục", "Mở Log để xem lại..."] }
  ]
}
```

### 13.6 Reflection Prompts (Câu hỏi suy ngẫm)
- Choice/scene có thể khai báo `reflectionPrompts`.
- Engine hiển thị overlay theo 8.7 (không bắt buộc trả lời).

Schema gợi ý:
```json
{
  "id": "S02_C02",
  "summary": "Bạn vừa chọn đối mặt và đặt ranh giới...",
  "questions": [
    "Nếu vật chất quyết định ý thức, chi tiết vật chất nào đã khiến Minh tổn thương sâu đến vậy?",
    "Hành động thực tiễn nào giúp Minh bảo vệ mình mà vẫn giữ kết nối?"
  ]
}
```

---

## 14) Asset Requirements

### 14.1 Background (minimum)
- `bg_room_day`, `bg_room_night`
- `bg_school_class`, `bg_canteen`
- `bg_cafe`, `bg_alley`
- `bg_stage`

### 14.2 Character sprites (minimum)
- Minh: `neutral`, `sad`, `anxious`, `determined`
- Lan: `neutral`, `encourage`
- Khoa: `skeptical`, `dismissive`
- Thầy Hậu: `calm`
- Bác Tư: `kind`
- Lumen: UI avatar/icon

### 14.3 UI assets
- phone notification frame
- chat bubbles (AI + group)
- journal paper texture (optional)
- timeline/day badge

---

## 15) Content Authoring Guidelines (để vừa dễ hiểu vừa sâu)

Mục tiêu của phần viết: **người chơi hiểu rõ chuyện gì đang xảy ra** (bối cảnh, động cơ, hậu quả), đồng thời được dẫn dắt để tự suy nghĩ sâu về Vật chất ↔ Ý thức.

### 15.1 Nhịp đọc (không "xúc tích khó hiểu", không "dài lê thê")
- Mỗi scene: **30–60 lines** (tuỳ scene). Scene cao trào có thể 70–90 lines nhưng phải chia nhịp bằng UI/choice.
- Mỗi line thoại thường: **8–22 từ**.  
- Cho phép **đoạn suy tư dài hơn** (1–3 đoạn/scene, 2–4 câu) khi:
  - chuyển cảnh quan trọng,  
  - Minh tự phản tỉnh,  
  - hoặc Thầy Hậu nói 1 ý triết then chốt.
- Tránh "khẩu hiệu": ý triết phải gắn với **tình huống cụ thể + hành động + kiểm chứng**.

### 15.2 Câu hỏi sâu sắc phải có ngữ cảnh
- Sau mỗi lựa chọn lớn hoặc cuối Day, luôn có **Reflection Prompts** (xem 8.7).
- Câu hỏi phải chạm đủ 2 mặt:
  1) **Mặt khách quan (vật chất/điều kiện):** môi trường, cơ thể, áp lực, quan hệ xã hội, nguồn lực, thời gian.
  2) **Mặt chủ quan (ý thức/hành động):** niềm tin, động cơ, quyết định, kế hoạch, thực tiễn kiểm chứng.
- Gợi ý: mỗi prompt nên "nhắc lại" 1 chi tiết vật chất cụ thể vừa xảy ra để người chơi bám được.

### 15.3 Template câu hỏi suy ngẫm (dùng trong overlay hoặc thoại)
- "Nếu vật chất quyết định ý thức, **chi tiết vật chất nào** đang kéo tâm trạng Minh xuống (hoặc nâng Minh lên)?"  
- "Minh đang phản ánh đúng thực tại, hay đang bóp méo vì sợ hãi? **Bằng chứng nào** cho thấy điều đó?"  
- "Minh đang dùng AI như **công cụ** hay như **chân lý**? Cái giá của mỗi cách là gì?"  
- "Hành động thực tiễn nhỏ nhất Minh có thể làm ngay để RealityAnchor tăng là gì?"  
- "Một niềm tin sai (ý thức sai lệch) có thể dẫn Minh tới hành động sai ra sao?"  
- "Nếu Minh muốn thay đổi hoàn cảnh, Minh cần thay đổi **điều kiện vật chất nào trước**?"

### 15.4 Choice text phải rõ ý (để người chơi hiểu mình chọn gì)
- Option text không dùng từ mơ hồ ("kệ", "thôi"), mà mô tả hành động cụ thể.
- Mỗi option nên có `subtext` (xem 8.8) nêu cái giá/đánh đổi.
- Nếu option có hậu quả lớn (gian dối, lệ thuộc), UI nên cảnh báo nhẹ bằng toast hoặc màu nhấn (không spoil ending).

### 15.5 Micro-behaviors bắt buộc (làm Minh "thật")
- Mỗi scene phải có ít nhất 1 vi mô:
  - soạn tin rồi xoá, nhật ký viết dở/gạch xoá, né mở group chat,
  - lặp một bài nhạc cũ, nhìn đồng hồ, tắt màn hình rồi bật lại,
  - tay run khi rung điện thoại, thở dốc khi đọc comment.
- Vi mô dùng để "nói" cảm xúc thay vì kể lể.

### 15.6 Giới hạn thuyết giảng triết học
- Thầy Hậu chỉ nói "đủ" (2–5 line/đoạn) rồi kéo về:
  - "Em đã kiểm chứng bằng thực tiễn chưa?"  
  - "Điều kiện nào làm em nghĩ như vậy?"  
  - "Nếu em hành động khác đi, điều kiện có đổi không?"

---

## 16) Acceptance Criteria (Test)

- **AC-01** Chạy S01→S16 không lỗi điều hướng
- **AC-02** All variables clamp 0..100
- **AC-03** Với BC=20/40/60/90 → Ending A/B/C/D đúng
- **AC-04** Save/Load giữa scene giữ đúng `sceneId`, `lineIndex`, vars, flags
- **AC-05** Skip/Auto không vượt choice
- **AC-06** Conditional lines/options hiển thị đúng theo flags/vars
- **AC-07** Choice % hiển thị (local) sau khi chọn
- **AC-08** NG+ thoại meta chỉ hiện khi `ng_plus=true`
- **AC-09** UI header không lặp “Day X — Day X”; dùng `dayNumber + dayTitle` chuẩn
- **AC-10** Chỉ số mặc định ẩn (`ui.showStats=false`), chỉ hiện khi trigger/toggle hoặc trong menu
- **AC-11** Choice hiển thị `prompt`/`subtext`, không hiển thị `choice.id`
- **AC-12** Màn hình “Giới thiệu & Tình trạng” hiển thị trước S01 và có nút Bắt đầu/Quay lại menu
- **AC-13** Reflection Prompts xuất hiện sau choice lớn (hoặc cuối Day), có thể bật/tắt trong Settings

---

## 17) Suggested Repository Structure (web)

## 17A) Tech Stack Recommendation (Web)

> Mục tiêu: build web visual novel “đúng chất game” (sprites/BG/effects/UI chat + save/load + replay) nhưng vẫn dễ maintain trong Cursor.

### Core stack (khuyến nghị)
- **Language**: TypeScript
- **Build tool**: Vite
- **Render/VN engine**: **Pixi’VN** (dựa trên PixiJS)
- **Narrative scripting**: **Ink** (viết story `.ink` → compile JSON để chạy runtime)
  - Option A: dùng tích hợp Ink của Pixi’VN (`@drincs/pixi-vn-ink`)
  - Option B: dùng `inkjs` để chạy Ink và tự map ra “actions” của engine
- **Audio**: Howler.js (BGM/SFX + fade/stop “im lặng” đúng nhịp)
- **Storage**:
  - MVP: `localStorage` (save slots + choice stats)
  - Bản xịn: `IndexedDB` (nhiều save + cache assets), có thể dùng helper như `idb-keyval`
- **Schema validation (dev-time)**: Zod (validate scene JSON + state)
- **Testing (optional nhưng nên có)**: Vitest (unit) + Playwright (e2e)
- **Lint/format**: ESLint + Prettier
- **Deploy**: Static hosting (Cloudflare Pages / Netlify / GitHub Pages)

### UI framework options (tuỳ bạn, Pixi’VN chơi được với mọi framework)
- **Không framework**: UI menu/overlay viết thuần DOM (nhẹ nhất)
- **React**: dễ component hóa overlay (chat/timeline/log/map)
- **Angular**: hợp nếu bạn quen Angular; nhúng Pixi canvas trong 1 component + overlay UI bằng Angular

### Alternative stacks (khi cần)
- **Twine (SugarCube)**: prototype truyện/nhánh cực nhanh (ít “game feel”)
- **RenJS (Phaser)**: nếu bạn thích hệ Phaser và script theo scene-actions

```
/content
  /scenes
    S01.json
    ...
  /characters.json
  /assets-manifest.json
/assets
  /bg
  /characters
  /ui
  /audio
/src
  /engine        # state machine, renderer, actions
  /ui            # menus, overlays, log, story map
  /storage       # save/load, stats persistence
  /content       # loaders, validators
```

---

## 18) Out of Scope (v1)
- Voice acting đầy đủ
- Multiplayer / online real-time
- Branching phức tạp hơn 16 scene (v2 mới mở rộng)
- Cloud sync saves (optional)

---

## 19) Deliverables Checklist (để Cursor code nhanh)
- [ ] Engine: state machine + renderer + action system  
- [ ] JSON schema + validator (dev-time)  
- [ ] 16 scene JSON skeleton (có lines placeholder)  
- [ ] UI overlays: chat + notification + timeline + journal  
- [ ] Save/Load + settings  
- [ ] Story map + choice stats local  
- [ ] Ending resolver + 4 ending scenes  
- [ ] Asset manifest + fallback placeholder

---

*End of document.*
