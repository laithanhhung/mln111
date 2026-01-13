import type { Scene, DialogueLine, Choice, Condition } from '../types/game';
import { ConditionEvaluator } from './ConditionEvaluator';
import { GameStateManager } from './GameState';

export class SceneManager {
  private scenes: Map<string, Scene> = new Map();
  private stateManager: GameStateManager;

  constructor(stateManager: GameStateManager) {
    this.stateManager = stateManager;
  }

  loadScene(scene: Scene): void {
    this.scenes.set(scene.id, scene);
  }

  loadScenes(scenes: Scene[]): void {
    scenes.forEach((scene) => this.loadScene(scene));
  }

  getScene(sceneId: string): Scene | undefined {
    return this.scenes.get(sceneId);
  }

  getCurrentScene(): Scene | undefined {
    return this.getScene(this.stateManager.getCurrentScene());
  }

  getCurrentLine(): DialogueLine | null {
    const scene = this.getCurrentScene();
    if (!scene) return null;

    const lineIndex = this.stateManager.getCurrentLineIndex();
    if (lineIndex >= scene.lines.length) return null;

    const line = scene.lines[lineIndex];
    
    // Check condition
    if (line.if && !this.evaluateCondition(line.if)) {
      return null;
    }

    return line;
  }

  getAvailableChoices(): Choice[] {
    const scene = this.getCurrentScene();
    if (!scene || !scene.choices) return [];

    return scene.choices.filter((choice) => {
      // Check if any option is available
      return choice.options.some((option) => {
        if (option.if) {
          return this.evaluateCondition(option.if);
        }
        return true;
      });
    });
  }

  getAvailableOptions(choice: Choice): Choice['options'] {
    return choice.options.filter((option) => {
      if (option.if) {
        return this.evaluateCondition(option.if);
      }
      return true;
    });
  }

  hasMoreLines(): boolean {
    const scene = this.getCurrentScene();
    if (!scene) return false;

    const lineIndex = this.stateManager.getCurrentLineIndex();
    
    // Check if there are more lines (including conditional ones)
    for (let i = lineIndex; i < scene.lines.length; i++) {
      const line = scene.lines[i];
      if (!line.if || this.evaluateCondition(line.if)) {
        return true;
      }
    }
    
    return false;
  }

  private evaluateCondition(condition: Condition): boolean {
    return ConditionEvaluator.evaluate(
      condition,
      this.stateManager.getVariables(),
      this.stateManager.getFlags()
    );
  }
}
