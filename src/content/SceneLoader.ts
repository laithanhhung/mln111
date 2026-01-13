import type { Scene } from '../types/game';

// Scene IDs in order
const SCENE_IDS = [
  'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08',
  'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16'
];

export class SceneLoader {
  private static sceneCache: Map<string, Scene> = new Map();

  static async loadScene(sceneId: string): Promise<Scene> {
    if (this.sceneCache.has(sceneId)) {
      return this.sceneCache.get(sceneId)!;
    }

    try {
      // Load from public folder (Vite serves /public at root)
      const response = await fetch(`/content/scenes/${sceneId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load scene ${sceneId}: ${response.statusText}`);
      }
      const scene: Scene = await response.json();
      this.sceneCache.set(sceneId, scene);
      return scene;
    } catch (error) {
      console.error(`Error loading scene ${sceneId}:`, error);
      // Return a fallback scene
      return this.createFallbackScene(sceneId);
    }
  }

  static async loadAllScenes(): Promise<Scene[]> {
    const scenes: Scene[] = [];
    for (const sceneId of SCENE_IDS) {
      scenes.push(await this.loadScene(sceneId));
    }
    return scenes;
  }

  static async loadScenesUpTo(sceneId: string): Promise<Scene[]> {
    const index = SCENE_IDS.indexOf(sceneId);
    if (index === -1) {
      return this.loadAllScenes();
    }

    const scenes: Scene[] = [];
    for (let i = 0; i <= index; i++) {
      scenes.push(await this.loadScene(SCENE_IDS[i]));
    }
    return scenes;
  }

  private static createFallbackScene(sceneId: string): Scene {
    return {
      id: sceneId,
      title: `Scene ${sceneId}`,
      background: 'bg_room_night',
      lines: [
        { speaker: null, text: `Scene ${sceneId} is loading...` }
      ],
      choices: []
    };
  }
}
