// Game state types
export interface GameVariables {
  BC: number; // Biện Chứng (0-100)
  TrustAI: number; // Mức tin vào AI (0-100)
  TrustFriends: number; // Mức tin vào bạn bè (0-100)
  SelfEsteem: number; // Tự trọng (0-100)
  RealityAnchor: number; // Bám thực tại (0-100)
}

export interface GameFlags {
  [key: string]: boolean | string | number | undefined;
  ng_plus?: boolean;
  ai_shortcut_used?: boolean;
  made_team?: boolean;
  ai_blocked?: boolean;
  set_boundary?: boolean;
  collected_data?: boolean;
  ai_dependency?: boolean;
  iteration?: boolean;
  fake_presentation?: boolean;
  leak_suspect_hint_1?: boolean;
  leak_suspect_hint_2?: boolean;
  checked_logs?: boolean;
  saw_group_early?: boolean;
  mystery_ai_tier1?: boolean;
}

export interface HistoryEntry {
  sceneId: string;
  lineIndex: number;
  speaker: string | null;
  text: string;
  timestamp: number;
  tags?: string[];
}

// Chat overlay types
export type ChatSender = 'LUMEN' | 'GROUP' | 'MINH';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  timestamp?: string;
  avatarAlias?: string;
  mode?: 'warm' | 'neutral' | 'ominous';
}

export interface ChoiceStats {
  [choiceId: string]: number;
}

export interface GameState {
  sceneId: string;
  lineIndex: number;
  variables: GameVariables;
  flags: GameFlags;
  history: HistoryEntry[];
  stats: {
    choiceCounts: ChoiceStats;
  };
}

// Scene types
export interface DialogueLine {
  speaker: string | null;
  text: string;
  character?: string; // Character sprite ID (e.g., "minh_neutral", "lan_encourage")
  tags?: string[];
  if?: Condition;
  // Chat overlay support
  type?: 'dialogue' | 'chat';
  channel?: 'lumen' | 'group';
  avatarAlias?: string;
}

export interface Condition {
  var?: keyof GameVariables;
  flag?: string;
  eq?: boolean | string | number;
  lt?: number;
  gt?: number;
  gte?: number;
  lte?: number;
}

export interface ChoiceOption {
  id: string;
  text: string;
  subtext?: string; // Giải thích điều người chơi sẽ đánh đổi
  effects?: Effects;
  nextSceneId: string;
  if?: Condition;
  reflectionPrompts?: ReflectionPrompt; // Câu hỏi suy ngẫm sau khi chọn
}

export interface ReflectionPrompt {
  summary: string; // Tóm tắt hậu quả vừa xảy ra (1-2 câu)
  questions: string[]; // 1-2 câu hỏi suy ngẫm
}

export interface Choice {
  id: string;
  prompt: string;
  options: ChoiceOption[];
}

export interface Effects {
  deltas?: Partial<GameVariables>;
  setFlags?: Partial<GameFlags>;
  clearFlags?: string[];
  playBgm?: string;
  stopBgm?: boolean;
  playSfx?: string;
  toast?: string;
}

export interface CharacterPosition {
  character: string; // Character sprite ID
  position?: 'left' | 'center' | 'right'; // Vị trí trên màn hình
  visible?: boolean; // Hiển thị hay không
}

export interface Scene {
  id: string;
  dayNumber?: number;
  dayTitle?: string;
  sceneTitle?: string;
  title: string;
  background?: string;
  music?: string;
  ui?: string[];
  characters?: CharacterPosition[]; // Characters hiển thị trong scene
  onEnter?: Action[];
  lines: DialogueLine[];
  choices?: Choice[];
  cg?: string; // CG image ID
}

export interface Action {
  type: 'playSfx' | 'playBgm' | 'stopBgm' | 'toast' | 'jump' | 'setUiState' | 'delay';
  id?: string;
  sceneId?: string;
  message?: string;
  // setUiState
  key?: string;
  value?: boolean | string | number;
  // stopBgm
  fadeOutMs?: number;
  // playBgm
  loop?: boolean;
  // playSfx
  volume?: number;
}

export type Ending = 'A' | 'B' | 'C' | 'D';
