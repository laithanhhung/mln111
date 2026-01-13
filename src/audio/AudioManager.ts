import { Howl } from 'howler';

export class AudioManager {
  private bgm: Howl | null = null;
  private sfxCache: Map<string, Howl> = new Map();

  playBgm(id: string, _loop: boolean = true): void {
    // Stop current BGM
    if (this.bgm) {
      this.bgm.stop();
    }

    // For now, we'll use placeholder - in real implementation, load from assets
    // this.bgm = new Howl({
    //   src: [`/assets/audio/bgm/${id}.mp3`],
    //   loop: _loop,
    //   volume: 0.5
    // });
    // this.bgm.play();
    console.log(`Playing BGM: ${id}`);
  }

  stopBgm(fadeOutMs: number = 0): void {
    if (this.bgm) {
      if (fadeOutMs > 0) {
        // Fade out
        const currentVolume = this.bgm.volume();
        const steps = 20;
        const stepVolume = currentVolume / steps;
        const stepTime = fadeOutMs / steps;
        
        const fadeInterval = setInterval(() => {
          if (!this.bgm) {
            clearInterval(fadeInterval);
            return;
          }
          const newVolume = Math.max(0, this.bgm.volume() - stepVolume);
          this.bgm.volume(newVolume);
          if (newVolume <= 0) {
            clearInterval(fadeInterval);
            this.bgm.stop();
            this.bgm = null;
          }
        }, stepTime);
      } else {
        this.bgm.stop();
        this.bgm = null;
      }
    }
  }

  playSfx(id: string, volume?: number): void {
    // For now, just log - in real implementation, load and play SFX
    console.log(`Playing SFX: ${id}${volume !== undefined ? ` at volume ${volume}` : ''}`);
    
    // Example implementation:
    // if (!this.sfxCache.has(id)) {
    //   this.sfxCache.set(id, new Howl({
    //     src: [`/assets/audio/sfx/${id}.mp3`],
    //     volume: volume !== undefined ? volume : 0.7
    //   }));
    // }
    // const sfx = this.sfxCache.get(id)!;
    // if (volume !== undefined) {
    //   sfx.volume(volume);
    // }
    // sfx.play();
  }

  setBgmVolume(volume: number): void {
    if (this.bgm) {
      this.bgm.volume(volume);
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxCache.forEach((sfx) => {
      sfx.volume(volume);
    });
  }
}
