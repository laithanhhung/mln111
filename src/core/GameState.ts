import type { GameState, GameVariables, GameFlags, HistoryEntry } from '../types/game';

const DEFAULT_VARIABLES: GameVariables = {
  BC: 50,
  TrustAI: 50,
  TrustFriends: 50,
  SelfEsteem: 50,
  RealityAnchor: 50,
};

const DEFAULT_FLAGS: GameFlags = {
  ng_plus: false,
  ai_shortcut_used: false,
  made_team: false,
  ai_blocked: false,
  set_boundary: false,
  collected_data: false,
  ai_dependency: false,
  iteration: false,
  fake_presentation: false,
  leak_suspect_hint_1: false,
  leak_suspect_hint_2: false,
  checked_logs: false,
  saw_group_early: false,
  mystery_ai_tier1: false,
};

export class GameStateManager {
  private state: GameState;

  constructor(initialState?: Partial<GameState>) {
    this.state = {
      sceneId: initialState?.sceneId || 'S01',
      lineIndex: initialState?.lineIndex || 0,
      variables: { ...DEFAULT_VARIABLES, ...initialState?.variables },
      flags: { ...DEFAULT_FLAGS, ...initialState?.flags },
      history: initialState?.history || [],
      stats: {
        choiceCounts: initialState?.stats?.choiceCounts || {},
      },
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  getVariables(): GameVariables {
    return { ...this.state.variables };
  }

  getFlags(): GameFlags {
    return { ...this.state.flags };
  }

  getCurrentScene(): string {
    return this.state.sceneId;
  }

  getCurrentLineIndex(): number {
    return this.state.lineIndex;
  }

  setScene(sceneId: string, lineIndex: number = 0): void {
    this.state.sceneId = sceneId;
    this.state.lineIndex = lineIndex;
  }

  nextLine(): void {
    this.state.lineIndex++;
  }

  updateVariables(deltas: Partial<GameVariables>): void {
    Object.keys(deltas).forEach((key) => {
      const varKey = key as keyof GameVariables;
      if (this.state.variables[varKey] !== undefined) {
        this.state.variables[varKey] = this.clamp(
          this.state.variables[varKey] + (deltas[varKey] || 0),
          0,
          100
        );
      }
    });
  }

  setFlags(flags: Partial<GameFlags>): void {
    Object.assign(this.state.flags, flags);
  }

  clearFlags(flagKeys: string[]): void {
    flagKeys.forEach((key) => {
      delete this.state.flags[key];
    });
  }

  addHistory(entry: HistoryEntry): void {
    this.state.history.push(entry);
    // Keep only last 500 entries
    if (this.state.history.length > 500) {
      this.state.history = this.state.history.slice(-500);
    }
  }

  recordChoice(choiceId: string): void {
    if (!this.state.stats.choiceCounts[choiceId]) {
      this.state.stats.choiceCounts[choiceId] = 0;
    }
    this.state.stats.choiceCounts[choiceId]++;
  }

  getChoiceStats(choiceId: string): number {
    return this.state.stats.choiceCounts[choiceId] || 0;
  }

  getTotalChoicesForPrompt(choiceId: string): number {
    // Get total choices for the same prompt (e.g., S01_C01_A, S01_C01_B, S01_C01_C)
    const prefix = choiceId.substring(0, choiceId.lastIndexOf('_'));
    return Object.keys(this.state.stats.choiceCounts)
      .filter((id) => id.startsWith(prefix))
      .reduce((sum, id) => sum + this.state.stats.choiceCounts[id], 0);
  }

  getChoicePercentage(choiceId: string): number {
    const total = this.getTotalChoicesForPrompt(choiceId);
    if (total === 0) return 0;
    return Math.round((this.getChoiceStats(choiceId) / total) * 100);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  // Ending calculation
  getEnding(): 'A' | 'B' | 'C' | 'D' {
    const bc = this.state.variables.BC;
    if (bc <= 25) return 'A';
    if (bc <= 50) return 'B';
    if (bc <= 75) return 'C';
    return 'D';
  }

  // Export for save
  export(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Import from save
  import(savedState: GameState): void {
    this.state = JSON.parse(JSON.stringify(savedState));
  }
}
