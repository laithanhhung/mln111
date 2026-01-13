import type { GameState } from '../types/game';
import { vi } from '../i18n/vi';

const SAVE_PREFIX = 'dem_23_47_save_';
const MAX_SAVES = 10;

export interface SaveSlot {
  id: number;
  name: string;
  timestamp: number;
  preview: string;
  state: GameState;
}

export class SaveManager {
  static save(slotId: number, state: GameState, name?: string): boolean {
    if (slotId < 0 || slotId >= MAX_SAVES) return false;

    try {
      const saveSlot: SaveSlot = {
        id: slotId,
        name: name || vi.saveSlot(slotId),
        timestamp: Date.now(),
        preview: vi.savePreview(state.sceneId, state.lineIndex),
        state: JSON.parse(JSON.stringify(state)),
      };

      localStorage.setItem(`${SAVE_PREFIX}${slotId}`, JSON.stringify(saveSlot));
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  }

  static load(slotId: number): GameState | null {
    if (slotId < 0 || slotId >= MAX_SAVES) return null;

    try {
      const data = localStorage.getItem(`${SAVE_PREFIX}${slotId}`);
      if (!data) return null;

      const saveSlot: SaveSlot = JSON.parse(data);
      return saveSlot.state;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }

  static getSaveSlot(slotId: number): SaveSlot | null {
    if (slotId < 0 || slotId >= MAX_SAVES) return null;

    try {
      const data = localStorage.getItem(`${SAVE_PREFIX}${slotId}`);
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error('Get save slot failed:', error);
      return null;
    }
  }

  static getAllSaves(): SaveSlot[] {
    const saves: SaveSlot[] = [];
    for (let i = 0; i < MAX_SAVES; i++) {
      const save = this.getSaveSlot(i);
      if (save) saves.push(save);
    }
    return saves.sort((a, b) => b.timestamp - a.timestamp);
  }

  static delete(slotId: number): boolean {
    if (slotId < 0 || slotId >= MAX_SAVES) return false;

    try {
      localStorage.removeItem(`${SAVE_PREFIX}${slotId}`);
      return true;
    } catch (error) {
      console.error('Delete save failed:', error);
      return false;
    }
  }

  static hasSave(slotId: number): boolean {
    return localStorage.getItem(`${SAVE_PREFIX}${slotId}`) !== null;
  }
}
