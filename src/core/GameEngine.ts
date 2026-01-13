import type { Scene, Effects, Action, HistoryEntry } from '../types/game';
import { GameStateManager } from './GameState';
import { SceneManager } from './SceneManager';

export type GameEvent = 
  | { type: 'line'; line: HistoryEntry }
  | { type: 'choice'; choiceId: string; prompt?: string; options: any[] }
  | { type: 'sceneChange'; sceneId: string }
  | { type: 'ending'; ending: 'A' | 'B' | 'C' | 'D' }
  | { type: 'effect'; effect: string }
  | { type: 'gameComplete' };

export type GameEventListener = (event: GameEvent) => void;

export class GameEngine {
  private stateManager: GameStateManager;
  private sceneManager: SceneManager;
  private listeners: GameEventListener[] = [];
  private isAutoMode: boolean = false;
  private autoSpeed: number = 2000; // ms

  constructor() {
    this.stateManager = new GameStateManager();
    this.sceneManager = new SceneManager(this.stateManager);
  }

  getStateManager(): GameStateManager {
    return this.stateManager;
  }

  getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  on(event: GameEvent['type'], listener: GameEventListener): void {
    this.listeners.push((e) => {
      if (e.type === event) listener(e);
    });
  }

  off(listener: GameEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) this.listeners.splice(index, 1);
  }

  private emit(event: GameEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  loadScenes(scenes: Scene[]): void {
    this.sceneManager.loadScenes(scenes);
  }

  start(): void {
    this.processScene();
  }

  async processScene(): Promise<void> {
    const scene = this.sceneManager.getCurrentScene();
    if (!scene) {
      console.error('Scene not found:', this.stateManager.getCurrentScene());
      return;
    }

    // Execute onEnter actions (async để hỗ trợ delay)
    if (scene.onEnter && scene.onEnter.length > 0) {
      await this.executeOnEnterActions(scene.onEnter);
    }

    // Process next line or show choices
    // S16 sẽ được xử lý như scene bình thường, ending sẽ được show trong main.ts
    this.processNext();
  }

  processNext(): void {
    const scene = this.sceneManager.getCurrentScene();
    if (!scene) {
      console.error('No scene found');
      return;
    }

    const lineIndex = this.stateManager.getCurrentLineIndex();
    
    // Skip lines với condition không thỏa mãn
    let line = this.sceneManager.getCurrentLine() as any;
    let skippedCount = 0;
    const maxSkips = scene.lines.length; // Prevent infinite loop
    
    while (!line && lineIndex + skippedCount < scene.lines.length && skippedCount < maxSkips) {
      // Line có condition không thỏa mãn, skip nó
      this.stateManager.nextLine();
      skippedCount++;
      line = this.sceneManager.getCurrentLine() as any;
    }
    
    // 1) Ưu tiên đọc hết lines trong scene
    if (line) {
      const historyEntry: HistoryEntry = {
        sceneId: this.stateManager.getCurrentScene(),
        lineIndex: this.stateManager.getCurrentLineIndex(),
        speaker: line.speaker,
        text: line.text,
        timestamp: Date.now(),
      };

      this.stateManager.addHistory(historyEntry);
      // Include tags và chat metadata trong event
      this.emit({ 
        type: 'line', 
        line: { 
          ...historyEntry, 
          tags: line.tags,
          type: line.type,
          channel: line.channel,
          avatarAlias: line.avatarAlias,
          raw: line
        } 
      } as any);

      this.stateManager.nextLine();
      
      // Auto mode
      if (this.isAutoMode) {
        setTimeout(() => this.processNext(), this.autoSpeed);
      }
    } else {
      // 2) Nếu không còn line nào hợp lệ → hiển thị choice (nếu có)
      const choices = this.sceneManager.getAvailableChoices();
      if (choices.length > 0) {
        const choice = choices[0]; // Take first available choice
        const availableOptions = this.sceneManager.getAvailableOptions(choice);
        if (availableOptions.length > 0) {
          this.emit({
            type: 'choice',
            choiceId: choice.id,
            prompt: choice.prompt,
            options: availableOptions,
          });
          return;
        }
      }

      // 3) Nếu không còn line và cũng không có choice → chuyển sang scene tiếp theo hoặc ending
      const currentSceneId = this.stateManager.getCurrentScene();
      if (currentSceneId === 'S15') {
        // S15 không có choices, tự động chuyển sang S16
        console.log('S15 ended, moving to S16');
        this.stateManager.setScene('S16', 0);
        this.emit({ type: 'sceneChange', sceneId: 'S16' });
        this.processScene().catch(err => {
          console.error('Error processing S16:', err);
        });
      } else if (currentSceneId === 'S16') {
        // S16 kết thúc, emit event để main.ts xử lý đánh giá nhân vật
        console.log('S16 ended, emitting gameComplete event');
        this.emit({ type: 'gameComplete' } as any);
      } else {
        console.warn('Scene ended without choice:', currentSceneId);
      }
    }
  }

  selectChoice(optionId: string): void {
    const scene = this.sceneManager.getCurrentScene();
    if (!scene || !scene.choices) {
      console.error('Cannot select choice: no scene or choices available');
      return;
    }

    console.log('Selecting choice:', optionId, 'in scene:', scene.id);
    console.log('Available choices:', scene.choices.map(c => c.id));
    
    for (const choice of scene.choices) {
      console.log('Checking choice:', choice.id, 'with options:', choice.options.map(o => o.id));
      
      // Kiểm tra cả options có condition và không có condition
      const allOptions = this.sceneManager.getAvailableOptions(choice);
      const option = allOptions.find((opt) => opt.id === optionId);
      
      if (option) {
        // Record choice
        this.stateManager.recordChoice(optionId);

        // Apply effects
        if (option.effects) {
          this.applyEffects(option.effects);
        }

        // Move to next scene
        const nextSceneId = option.nextSceneId;
        if (!nextSceneId) {
          console.error('Choice option missing nextSceneId:', optionId);
          return;
        }
        
        console.log(`Moving from ${this.stateManager.getCurrentScene()} to ${nextSceneId}`);
        this.stateManager.setScene(nextSceneId, 0);
        this.emit({ type: 'sceneChange', sceneId: nextSceneId });
        // processScene is async, nhưng không cần await vì sceneChange event sẽ handle
        this.processScene().catch(err => {
          console.error('Error processing scene:', err);
        });
        return;
      }
    }
    
    console.error('Choice option not found:', optionId);
    console.error('Current scene:', scene.id);
    console.error('Scene choices:', scene.choices);
  }

  applyEffects(effects: Effects): void {
    if (effects.deltas) {
      this.stateManager.updateVariables(effects.deltas);
      this.emit({ type: 'effect', effect: 'variables' });
    }

    if (effects.setFlags) {
      this.stateManager.setFlags(effects.setFlags);
    }

    if (effects.clearFlags) {
      this.stateManager.clearFlags(effects.clearFlags);
    }

    if (effects.playBgm) {
      this.executeAction({ type: 'playBgm', id: effects.playBgm });
    }

    if (effects.playSfx) {
      this.executeAction({ type: 'playSfx', id: effects.playSfx });
    }

    if (effects.toast) {
      this.executeAction({ type: 'toast', message: effects.toast });
    }
  }

  async executeOnEnterActions(actions: Action[]): Promise<void> {
    for (const action of actions) {
      if (action.type === 'delay') {
        await new Promise(resolve => setTimeout(resolve, (action as any).ms || 0));
      } else {
        this.executeAction(action);
      }
    }
  }

  executeAction(action: Action): void {
    this.emit({ type: 'effect', effect: JSON.stringify(action) });
  }

  setAutoMode(enabled: boolean): void {
    this.isAutoMode = enabled;
    if (enabled) {
      this.processNext();
    }
  }

  setAutoSpeed(ms: number): void {
    this.autoSpeed = ms;
  }

  skipToNextChoice(): void {
    while (this.sceneManager.hasMoreLines() && this.sceneManager.getAvailableChoices().length === 0) {
      const line = this.sceneManager.getCurrentLine();
      if (line) {
        const historyEntry: HistoryEntry = {
          sceneId: this.stateManager.getCurrentScene(),
          lineIndex: this.stateManager.getCurrentLineIndex(),
          speaker: line.speaker,
          text: line.text,
          timestamp: Date.now(),
        };
        this.stateManager.addHistory(historyEntry);
        this.stateManager.nextLine();
      } else {
        break;
      }
    }
    this.processNext();
  }
}
